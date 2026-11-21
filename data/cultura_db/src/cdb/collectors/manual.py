"""Carga manual curada: CSV o JSONL en data/manual con las columnas del esquema maestro."""
from __future__ import annotations

import csv
import json
import logging
from pathlib import Path

from ..schema import INPUT_FIELDS, Record
from .base import Collector

log = logging.getLogger("cdb.manual")


def rows_from_file(path: Path):
    if path.suffix.lower() == ".csv":
        with open(path, encoding="utf-8-sig", newline="") as fh:
            yield from csv.DictReader(fh)
    elif path.suffix.lower() == ".jsonl":
        with open(path, encoding="utf-8") as fh:
            for n, linea in enumerate(fh, 1):
                if linea.strip():
                    try:
                        yield json.loads(linea)
                    except ValueError:
                        log.error("JSON invalido en %s linea %s", path.name, n)


def record_from_row(row: dict, hoy: str) -> Record:
    d = {k: (row.get(k) or "") for k in INPUT_FIELDS}
    extra = {}
    for k, v in row.items():
        if k and k.startswith("extra_") and v not in (None, ""):
            valor = v
            if isinstance(v, str) and v.strip().lower() in ("true", "si", "sí", "1"):
                valor = True
            extra[k[6:]] = valor
    if isinstance(row.get("extra"), dict):
        extra.update(row["extra"])
    d["fuente"] = d["fuente"] or "manual"
    d["fecha_verificacion"] = d["fecha_verificacion"] or hoy
    rec = Record.from_dict(d)
    rec.extra = extra
    return rec


class ManualCollector(Collector):
    key = "manual"
    categorias = ()

    def __init__(self, ctx, ruta=None):
        super().__init__(ctx)
        self.ruta = Path(ruta) if ruta else None

    def collect(self, max_records=None):
        archivos = [self.ruta] if self.ruta else sorted(
            p for p in self.cfg.path("manual").iterdir()
            if p.suffix.lower() in (".csv", ".jsonl") and not p.name.startswith("plantilla_"))
        emitidos = 0
        for path in archivos:
            for row in rows_from_file(path):
                yield record_from_row(row, self.ctx.hoy)
                emitidos += 1
                if max_records and emitidos >= max_records:
                    return
