#!/usr/bin/env python3
"""Lee el JSONL (gz) de Wiktextract y carga las entradas en ESPAÑOL en una base SQLite de staging.

No une datos de otras fuentes. Lee línea por línea (poca memoria).

Uso (muestra: 1 de cada 10 líneas):
  python scripts/stage_wiktextract.py --stride 10
Uso (pasada completa de conteo, sin muestrear):
  python scripts/stage_wiktextract.py --stride 1 --out data/staging/wikt_full.sqlite
"""
from __future__ import annotations

import argparse
import gzip
import json
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lexpipe import common as C  # noqa: E402
from lexpipe import wikt  # noqa: E402

DEFAULT_IN = C.RAW / "wiktextract_es" / "raw-wiktextract-data.jsonl.gz"
DEFAULT_OUT = C.STAGING / "wikt_sample.sqlite"


def open_text(path: Path):
    if path.suffix == ".gz":
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return open(path, "r", encoding="utf-8", errors="replace")


def stage(input_path: Path, out_path: Path, stride: int = 10, offset: int = 0,
          max_lines: int | None = None, lang_code: str = "es", progress: bool = True) -> dict:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.exists():
        out_path.unlink()
    con = sqlite3.connect(out_path)
    con.executescript("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;")
    con.executescript((C.SQL_DIR / "staging_wikt.sql").read_text(encoding="utf-8"))

    stats = {"lines_read": 0, "lines_parsed": 0, "json_errors": 0, "entries_es": 0,
             "records_without_language_field": 0}
    entry_id = 0
    batch_e, batch_s, batch_f, batch_r = [], [], [], []

    def flush():
        con.executemany("INSERT INTO entry VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", batch_e)
        con.executemany("INSERT INTO sense VALUES (?,?,?,?,?,?)", batch_s)
        con.executemany("INSERT INTO form VALUES (?,?,?,?)", batch_f)
        con.executemany("INSERT INTO relation VALUES (?,?,?,?,?)", batch_r)
        for b in (batch_e, batch_s, batch_f, batch_r):
            b.clear()

    with open_text(input_path) as f:
        for line_no, line in enumerate(f, 1):
            if max_lines and line_no > max_lines:
                break
            stats["lines_read"] = line_no
            if stride > 1 and (line_no % stride) != offset:
                continue
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                stats["json_errors"] += 1
                continue
            stats["lines_parsed"] += 1
            if isinstance(rec, dict) and not any(k in rec for k in ("lang_code", "lang", "lang_name", "language", "section")):
                stats["records_without_language_field"] += 1
            p = wikt.parse_record(rec, lang_code)
            if p is None:
                continue
            entry_id += 1
            stats["entries_es"] += 1
            batch_e.append((entry_id, line_no, p["word"], p["word_key"], p["accentless_key"], p["lang_code"],
                            p["pos_raw"], p["pos_norm"], p["kind"], p["n_senses"], p["is_multiword"],
                            p["valid_word"], p["region_ar_tag"], p["region_ar_gloss"], p["registers"]))
            for s in p["senses"]:
                batch_s.append((entry_id, s["idx"], s["gloss"], wikt.dumps(s["tags"]), s["form_of"], s["alt_of"]))
            for ftxt, ftags in p["forms"]:
                batch_f.append((entry_id, ftxt, C.word_key(ftxt), wikt.dumps(ftags)))
            for sidx, rtype, target in p["relations"]:
                batch_r.append((entry_id, sidx, rtype, target, C.word_key(target)))
            if len(batch_e) >= 5000:
                flush()
            if progress and line_no % 250000 == 0:
                print(f"   ... {line_no:,} líneas leídas, {entry_id:,} entradas en español", flush=True)
    flush()

    meta = {
        "source_id": "wiktextract_es_raw", "input_file": input_path.name,
        "input_sha256": C.provenance_sha_for(input_path) or "no registrado (descargar con download_sources.py)",
        "stride": stride, "offset": offset, "max_lines": max_lines, "lang_code": lang_code,
        "staged_at": C.utcnow(), "pipeline_version": C.PIPELINE_VERSION, **stats,
    }
    con.executemany("INSERT INTO stage_meta VALUES (?,?)", [(k, str(v)) for k, v in meta.items()])
    con.commit()
    con.close()
    return meta


def main() -> int:
    C.setup_console()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", type=Path, default=DEFAULT_IN)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--stride", type=int, default=10, help="procesa 1 de cada N líneas (1 = todas)")
    ap.add_argument("--offset", type=int, default=0)
    ap.add_argument("--max-lines", type=int, default=None)
    ap.add_argument("--lang-code", default="es")
    args = ap.parse_args()
    if not args.input.exists():
        print(f"ERROR: no existe {args.input}. Ejecutá primero scripts/download_sources.py "
              f"o registrá el archivo con --register-manual.")
        return 2
    meta = stage(args.input, args.out, args.stride, args.offset, args.max_lines, args.lang_code)
    print(json.dumps(meta, ensure_ascii=False, indent=2))
    if meta["entries_es"] == 0:
        print("\nATENCIÓN: 0 entradas en español. Probablemente los nombres de campo difieren de lo esperado.\n"
              "Ejecutá: python scripts/inspect_formats.py jsonl <archivo> para ver los campos reales.")
        return 3
    if meta["records_without_language_field"]:
        print(f"\nAVISO: {meta['records_without_language_field']} registros sin campo de idioma reconocido.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
