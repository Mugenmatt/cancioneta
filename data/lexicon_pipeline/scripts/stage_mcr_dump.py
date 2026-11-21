#!/usr/bin/env python3
"""Carga un volcado MySQL (.sql dentro de .zip/.tgz/.gz) en SQLite de staging, de forma GENÉRICA.

No asume el esquema del MCR (no fue verificado): crea una tabla SQLite por cada tabla del volcado,
con todas las columnas como TEXT, más una tabla `_tables` con el inventario. Con ese inventario
se escribirá luego la extracción específica de sinónimos / hiperónimos / etc.

Uso:
  python scripts/stage_mcr_dump.py --list-only      # solo lista tablas y filas (no escribe SQLite)
  python scripts/stage_mcr_dump.py                  # carga todo en data/staging/mcr30_2016.sqlite
"""
from __future__ import annotations

import argparse
import gzip
import io
import json
import re
import sqlite3
import sys
import tarfile
import zipfile
from pathlib import Path
from typing import Iterator

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lexpipe import common as C  # noqa: E402

DEFAULT_OUT = C.STAGING / "mcr30_2016.sqlite"
CREATE_RE = re.compile(r"^\s*CREATE TABLE(?: IF NOT EXISTS)?\s+`?([^`\s(]+)`?\s*\(", re.I)
COL_RE = re.compile(r"^\s*`([^`]+)`\s")
INSERT_RE = re.compile(r"^\s*INSERT\s+(?:IGNORE\s+)?INTO\s+`?([^`\s(]+)`?\s*(?:\(([^)]*)\))?\s*VALUES\s*", re.I)
TOKEN_RE = re.compile(r"\s*(?:'((?:[^'\\]|\\.|'')*)'|(NULL)\b|([^,()'\s]+))", re.S)
ESC = {"n": "\n", "t": "\t", "r": "\r", "0": "\0", "b": "\b", "Z": "\x1a", "'": "'", '"': '"', "\\": "\\"}
ESC_RE = re.compile(r"\\(.)|''", re.S)


def _unescape(s: str) -> str:
    if "\\" not in s and "''" not in s:
        return s
    return ESC_RE.sub(lambda m: "'" if m.group(0) == "''" else ESC.get(m.group(1), m.group(1)), s)


def iter_sql_lines(path: Path) -> Iterator[str]:
    """Itera las líneas de texto del volcado, abriendo el contenedor que corresponda."""
    name = path.name.lower()
    if name.endswith(".zip"):
        zf = zipfile.ZipFile(path)
        cands = [i for i in zf.infolist() if not i.is_dir() and i.filename.lower().endswith((".sql", ".sql.gz", ".dump", ".txt"))]
        if not cands:
            raise ValueError("El .zip no contiene .sql. Contenido: " + ", ".join(i.filename for i in zf.infolist()[:20]))
        for info in cands:
            raw = zf.open(info)
            stream = gzip.open(raw, "rb") if info.filename.lower().endswith(".gz") else raw
            yield from io.TextIOWrapper(stream, encoding="utf-8", errors="replace")
    elif name.endswith((".tgz", ".tar.gz", ".tar")):
        with tarfile.open(path, "r:*") as tf:
            cands = [m for m in tf.getmembers() if m.isfile() and m.name.lower().endswith((".sql", ".dump", ".txt"))]
            if not cands:
                raise ValueError("El .tgz no contiene .sql. Contenido: " + ", ".join(m.name for m in tf.getmembers()[:20]))
            for m in cands:
                yield from io.TextIOWrapper(tf.extractfile(m), encoding="utf-8", errors="replace")
    elif name.endswith(".gz"):
        with gzip.open(path, "rt", encoding="utf-8", errors="replace") as f:
            yield from f
    else:
        with open(path, encoding="utf-8", errors="replace") as f:
            yield from f


def parse_values(s: str, pos: int) -> Iterator[list]:
    """Parsea `(v1,v2,...),(...);` desde `pos`. Devuelve filas como listas (None para NULL)."""
    n = len(s)
    while pos < n:
        while pos < n and s[pos] in " \t\r\n":
            pos += 1
        if pos >= n or s[pos] == ";":
            return
        if s[pos] != "(":
            raise ValueError(f"se esperaba '(' en posición {pos}: {s[pos:pos + 30]!r}")
        pos += 1
        row = []
        while True:
            m = TOKEN_RE.match(s, pos)
            if not m:
                raise ValueError(f"token inválido cerca de: {s[pos:pos + 40]!r}")
            if m.group(1) is not None:
                row.append(_unescape(m.group(1)))
            elif m.group(2):
                row.append(None)
            else:
                row.append(m.group(3))
            pos = m.end()
            while pos < n and s[pos] in " \t\r\n":
                pos += 1
            if s[pos] == ",":
                pos += 1
                continue
            if s[pos] == ")":
                pos += 1
                break
            raise ValueError(f"carácter inesperado {s[pos]!r} en fila")
        yield row
        while pos < n and s[pos] in " \t\r\n":
            pos += 1
        if pos < n and s[pos] == ",":
            pos += 1


def safe_name(name: str) -> str:
    return "t_" + re.sub(r"[^0-9A-Za-z_]", "_", name)


def scan_or_load(path: Path, out_path: Path | None) -> dict:
    """Si out_path es None solo inventaría (cuenta filas); si no, carga en SQLite."""
    con = None
    if out_path is not None:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        if out_path.exists():
            out_path.unlink()
        con = sqlite3.connect(out_path)
        con.executescript("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;")
        con.execute("CREATE TABLE stage_meta (key TEXT PRIMARY KEY, value TEXT)")
        con.execute("CREATE TABLE _tables (orig_name TEXT PRIMARY KEY, sqlite_name TEXT, n_rows INTEGER, columns_json TEXT)")

    tables: dict[str, dict] = {}
    current = None
    errors = 0
    for line in iter_sql_lines(path):
        if current is not None:
            if line.lstrip().startswith(")"):
                current = None
                continue
            m = COL_RE.match(line)
            if m:
                tables[current]["columns"].append(m.group(1))
            continue
        m = CREATE_RE.match(line)
        if m:
            current = m.group(1)
            tables[current] = {"columns": [], "n_rows": 0, "created": False}
            continue
        m = INSERT_RE.match(line)
        if not m:
            continue
        tname = m.group(1)
        t = tables.setdefault(tname, {"columns": [], "n_rows": 0, "created": False})
        cols = [c.strip().strip("`") for c in m.group(2).split(",")] if m.group(2) else t["columns"]
        try:
            rows = list(parse_values(line, m.end()))
        except ValueError as e:
            errors += 1
            print(f"   AVISO: fila no parseable en {tname}: {e}")
            continue
        if con is not None:
            if not cols and rows:
                cols = [f"c{i}" for i in range(len(rows[0]))]
            if not t["created"]:
                sname = safe_name(tname)
                con.execute(f'CREATE TABLE "{sname}" (' + ",".join(f'"{c}" TEXT' for c in cols) + ")")
                t["created"], t["sname"], t["ccols"] = True, sname, cols
            width = len(t["ccols"])
            good = [r for r in rows if len(r) == width]
            errors += len(rows) - len(good)
            con.executemany(f'INSERT INTO "{t["sname"]}" VALUES (' + ",".join("?" * width) + ")", good)
            t["n_rows"] += len(good)
        else:
            t["n_rows"] += len(rows)

    if con is not None:
        for tname, t in tables.items():
            con.execute("INSERT INTO _tables VALUES (?,?,?,?)",
                        (tname, t.get("sname", safe_name(tname)), t["n_rows"],
                         json.dumps(t.get("ccols") or t["columns"], ensure_ascii=False)))
        meta = {"source_id": "mcr30_2016", "input_file": path.name,
                "input_sha256": C.provenance_sha_for(path) or "no registrado",
                "tables": len(tables), "parse_errors": errors, "staged_at": C.utcnow(),
                "pipeline_version": C.PIPELINE_VERSION}
        con.executemany("INSERT INTO stage_meta VALUES (?,?)", [(k, str(v)) for k, v in meta.items()])
        con.commit()
        con.close()
    return {"tables": tables, "errors": errors}


def main() -> int:
    C.setup_console()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", type=Path, default=None, help="archivo del MCR (por defecto, el primero en data/raw/mcr30_2016/)")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--list-only", action="store_true")
    args = ap.parse_args()
    inp = args.input
    if inp is None:
        folder = C.RAW / "mcr30_2016"
        found = sorted(p for p in folder.glob("*") if p.is_file()) if folder.exists() else []
        if not found:
            print(f"ERROR: no hay archivos en {folder}. Descargá el MCR a mano y registralo con "
                  f"download_sources.py --register-manual mcr30_2016 RUTA")
            return 2
        inp = found[0]
    try:
        res = scan_or_load(inp, None if args.list_only else args.out)
    except ValueError as e:
        print("ERROR:", e)
        return 3
    print(f"\nTablas encontradas: {len(res['tables'])}   errores de parseo: {res['errors']}")
    for name, t in sorted(res["tables"].items()):
        print(f"  {name:45s} filas={t['n_rows']:>9,}  columnas={', '.join(t.get('ccols') or t['columns'])[:90]}")
    if not res["tables"]:
        print("No se detectaron sentencias CREATE TABLE/INSERT. ¿El archivo es un volcado MySQL?")
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
