"""Almacen SQLite: registros, duplicados, rechazados, comprobacion de enlaces, exportaciones y corridas."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .schema import INPUT_FIELDS, Record
from .validate import validate

SCHEMA = """
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  clave_deduplicacion TEXT UNIQUE NOT NULL,
  categoria TEXT NOT NULL,
  contenido_o_titulo TEXT, autor_artista_creador TEXT, obra TEXT, personaje TEXT, anio TEXT, idioma TEXT,
  variante TEXT, genero TEXT, tematica TEXT, etiquetas TEXT, descripcion TEXT, texto_breve TEXT,
  fuente TEXT, url_fuente TEXT, url_externa TEXT, derechos TEXT, licencia TEXT, atribucion TEXT,
  restricciones TEXT, fecha_verificacion TEXT, id_externo TEXT, extra_json TEXT,
  estado_verificacion TEXT NOT NULL, motivos TEXT, hash_crudo TEXT, run_id TEXT,
  fecha_alta TEXT, fecha_actualizacion TEXT
);
CREATE INDEX IF NOT EXISTS ix_records_ext ON records(fuente, id_externo);
CREATE INDEX IF NOT EXISTS ix_records_cat ON records(categoria, estado_verificacion);
CREATE TABLE IF NOT EXISTS duplicates (
  hash_crudo TEXT NOT NULL, tipo TEXT NOT NULL, clave TEXT, id_existente TEXT, fuente TEXT,
  id_externo TEXT, url_fuente TEXT, payload_json TEXT, fecha TEXT, run_id TEXT,
  PRIMARY KEY (hash_crudo, tipo)
);
CREATE TABLE IF NOT EXISTS rejected (
  hash_crudo TEXT PRIMARY KEY, categoria TEXT, fuente TEXT, motivo TEXT, payload_json TEXT, fecha TEXT, run_id TEXT
);
CREATE TABLE IF NOT EXISTS link_checks (url TEXT PRIMARY KEY, status INTEGER, checked_at TEXT);
CREATE TABLE IF NOT EXISTS exports (export_id TEXT NOT NULL, id TEXT NOT NULL, PRIMARY KEY (export_id, id));
CREATE TABLE IF NOT EXISTS runs (run_id TEXT PRIMARY KEY, started TEXT, comando TEXT, fuente TEXT, resumen_json TEXT);
"""

_COLS_SQL = INPUT_FIELDS  # columnas de contenido que se copian tal cual


def ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Store:
    def __init__(self, path):
        self.path = Path(path)
        if str(path) != ":memory:":
            self.path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path))
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)

    def close(self):
        self.db.commit()
        self.db.close()

    # -- corridas -----------------------------------------------------------
    def start_run(self, comando: str, fuente: str = "") -> str:
        run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
        self.db.execute("INSERT INTO runs(run_id, started, comando, fuente) VALUES (?,?,?,?)",
                        (run_id, ahora(), comando, fuente))
        self.db.commit()
        return run_id

    def finish_run(self, run_id: str, resumen: dict):
        self.db.execute("UPDATE runs SET resumen_json=? WHERE run_id=?",
                        (json.dumps(resumen, ensure_ascii=False), run_id))
        self.db.commit()

    # -- ingesta ------------------------------------------------------------
    def _one(self, sql, params=()):
        return self.db.execute(sql, params).fetchone()

    def _payload(self, rec: Record) -> str:
        d = {f: getattr(rec, f) for f in INPUT_FIELDS}
        d["extra"] = rec.extra
        return json.dumps(d, ensure_ascii=False)

    def _reject(self, rec: Record, motivos, run_id):
        h = rec.hash_crudo()
        self.db.execute(
            "INSERT OR REPLACE INTO rejected(hash_crudo,categoria,fuente,motivo,payload_json,fecha,run_id) "
            "VALUES (?,?,?,?,?,?,?)",
            (h, rec.categoria, rec.fuente, ";".join(motivos), self._payload(rec), ahora(), run_id))

    def _log_duplicate(self, rec: Record, tipo: str, existente_id: str, run_id: str):
        self.db.execute(
            "INSERT OR IGNORE INTO duplicates(hash_crudo,tipo,clave,id_existente,fuente,id_externo,url_fuente,"
            "payload_json,fecha,run_id) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (rec.hash_crudo(), tipo, rec.clave, existente_id, rec.fuente, rec.id_externo, rec.url_fuente,
             self._payload(rec), ahora(), run_id))

    def _values(self, rec: Record, estado: str, motivos, run_id: str):
        return [getattr(rec, f) for f in _COLS_SQL] + [
            json.dumps(rec.extra, ensure_ascii=False, sort_keys=True), estado, ";".join(motivos),
            rec.hash_crudo(), run_id]

    def ingest(self, rec: Record, run_id: str) -> str:
        """Valida e inserta. Devuelve: nuevo | mejorado | actualizado | sin_cambios | duplicado_exacto |
        duplicado_normalizado | rechazado."""
        rec.finalize()
        estado, motivos = validate(rec)
        if estado == "rechazado":
            self._reject(rec, motivos, run_id)
            return "rechazado"
        h = rec.hash_crudo()
        mismo_origen = False
        row = None
        if rec.id_externo:
            row = self._one("SELECT * FROM records WHERE fuente=? AND id_externo=?", (rec.fuente, rec.id_externo))
            mismo_origen = row is not None
        if row is None:
            row = self._one("SELECT * FROM records WHERE clave_deduplicacion=?", (rec.clave,))
        if row is None:
            cols = ["id", "clave_deduplicacion", "categoria"] + _COLS_SQL + [
                "extra_json", "estado_verificacion", "motivos", "hash_crudo", "run_id", "fecha_alta",
                "fecha_actualizacion"]
            base = self._values(rec, estado, motivos, run_id)
            vals = [rec.id, rec.clave, rec.categoria] + base + [ahora(), ahora()]
            marks = ",".join("?" * len(cols))
            self.db.execute(f"INSERT INTO records({','.join(cols)}) VALUES ({marks})", vals)
            return "nuevo"
        if mismo_origen:
            if row["hash_crudo"] == h:
                return "duplicado_exacto" if row["run_id"] == run_id else "sin_cambios"
            if row["run_id"] == run_id:
                self._log_duplicate(rec, "normalizado", row["id"], run_id)
                return "duplicado_normalizado"
            return self._update(row, rec, estado, motivos, run_id, "actualizado")
        # coincide la clave pero con otro origen u otro id_externo
        if row["hash_crudo"] == h:
            self._log_duplicate(rec, "exacto", row["id"], run_id)
            return "duplicado_exacto"
        if row["estado_verificacion"] == "pendiente" and estado == "verificado":
            return self._update(row, rec, estado, motivos, run_id, "mejorado")
        self._log_duplicate(rec, "normalizado", row["id"], run_id)
        return "duplicado_normalizado"

    def _update(self, row, rec: Record, estado, motivos, run_id, resultado: str) -> str:
        sets = ",".join(f"{c}=?" for c in _COLS_SQL) + \
            ",extra_json=?,estado_verificacion=?,motivos=?,hash_crudo=?,run_id=?,fecha_actualizacion=?"
        vals = self._values(rec, estado, motivos, run_id) + [ahora(), row["id"]]
        try:
            self.db.execute(f"UPDATE records SET {sets} WHERE id=?", vals)
            if row["clave_deduplicacion"] != rec.clave:
                self.db.execute("UPDATE records SET clave_deduplicacion=? WHERE id=?", (rec.clave, row["id"]))
        except sqlite3.IntegrityError:
            self._log_duplicate(rec, "normalizado", row["id"], run_id)
            return "duplicado_normalizado"
        return resultado

    def commit(self):
        self.db.commit()

    # -- consultas ----------------------------------------------------------
    def count(self, categoria: str | None = None, estado: str = "verificado") -> int:
        sql, p = "SELECT COUNT(*) FROM records WHERE estado_verificacion=?", [estado]
        if categoria:
            sql += " AND categoria=?"
            p.append(categoria)
        return self._one(sql, p)[0]

    def revalidate_all(self, run_id: str) -> dict:
        """Reaplica las reglas actuales a todos los registros (util si cambiaron las reglas)."""
        cambios = {"verificado": 0, "pendiente": 0, "rechazado": 0}
        for row in self.db.execute("SELECT * FROM records").fetchall():
            d = {f: row[f] for f in INPUT_FIELDS}
            d["extra"] = json.loads(row["extra_json"] or "{}")
            rec = Record.from_dict(d)
            rec.finalize()
            estado, motivos = validate(rec)
            if estado == "rechazado":
                self._reject(rec, motivos, run_id)
                self.db.execute("DELETE FROM records WHERE id=?", (row["id"],))
            elif estado != row["estado_verificacion"] and not (row["motivos"] or "").startswith(("enlace_roto", "casi_duplicado")):
                self.db.execute("UPDATE records SET estado_verificacion=?, motivos=? WHERE id=?",
                                (estado, ";".join(motivos), row["id"]))
            cambios[estado] += 1
        self.db.commit()
        return cambios

    # -- enlaces ------------------------------------------------------------
    def apply_link_results(self) -> dict:
        """Marca como pendientes los registros con enlace roto (404/410) y restaura los que se recuperaron."""
        rotos = recuperados = 0
        rows = self.db.execute(
            "SELECT r.id, r.estado_verificacion, r.motivos, l.status FROM records r "
            "JOIN link_checks l ON l.url = r.url_fuente").fetchall()
        for r in rows:
            roto = r["status"] in (404, 410)
            if roto and r["estado_verificacion"] == "verificado":
                self.db.execute("UPDATE records SET estado_verificacion='pendiente', motivos=? WHERE id=?",
                                (f"enlace_roto:{r['status']}", r["id"]))
                rotos += 1
            elif not roto and (r["motivos"] or "").startswith("enlace_roto") and 200 <= r["status"] < 400:
                self.db.execute("UPDATE records SET estado_verificacion='verificado', motivos='' WHERE id=?",
                                (r["id"],))
                recuperados += 1
        self.db.commit()
        return {"marcados_rotos": rotos, "recuperados": recuperados}
