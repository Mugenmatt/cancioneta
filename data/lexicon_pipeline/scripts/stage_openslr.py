#!/usr/bin/env python3
"""Carga la lista de frecuencias OpenSLR SLR21 en una base SQLite de staging (propia).

Uso:  python scripts/stage_openslr.py
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lexpipe import common as C  # noqa: E402
from lexpipe import openslr  # noqa: E402

DEFAULT_IN = C.RAW / "openslr_slr21" / "es_wordlist.json.tgz"
DEFAULT_OUT = C.STAGING / "openslr_slr21.sqlite"
HAS_DIGIT = re.compile(r"\d")


def stage(input_path: Path, out_path: Path) -> dict:
    pairs, member = openslr.load_wordlist(input_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.exists():
        out_path.unlink()
    con = sqlite3.connect(out_path)
    con.executescript("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;")
    con.executescript((C.SQL_DIR / "staging_openslr.sql").read_text(encoding="utf-8"))

    rows, agg = [], {}
    for w, c in pairs:
        key = C.word_key(w)
        if not key:
            continue
        valid = int(C.is_valid_word(key))
        rows.append((w, key, c, valid, int(C.is_multiword(key)), int(bool(HAS_DIGIT.search(key)))))
        a = agg.get(key)
        if a is None:
            agg[key] = [c, 1, valid]
        else:
            a[0] += c
            a[1] += 1
    con.executemany("INSERT INTO form_freq VALUES (?,?,?,?,?,?)", rows)
    ranked = sorted(agg.items(), key=lambda kv: (-kv[1][0], kv[0]))
    con.executemany("INSERT INTO freq_by_key VALUES (?,?,?,?,?)",
                    [(k, v[0], v[1], v[2], i) for i, (k, v) in enumerate(ranked, 1)])
    con.execute("CREATE INDEX ix_ffk ON form_freq(word_key)")
    meta = {
        "source_id": "openslr_slr21", "input_file": input_path.name, "member": member,
        "input_sha256": C.provenance_sha_for(input_path) or "no registrado",
        "rows": len(rows), "distinct_keys": len(agg), "staged_at": C.utcnow(),
        "pipeline_version": C.PIPELINE_VERSION,
    }
    con.executemany("INSERT INTO stage_meta VALUES (?,?)", [(k, str(v)) for k, v in meta.items()])
    con.commit()
    con.close()
    return meta


def main() -> int:
    C.setup_console()
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", type=Path, default=DEFAULT_IN)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args()
    if not args.input.exists():
        print(f"ERROR: no existe {args.input}. Ejecutá scripts/download_sources.py --only openslr_slr21")
        return 2
    try:
        meta = stage(args.input, args.out)
    except ValueError as e:
        print("ERROR:", e)
        return 3
    print(json.dumps(meta, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
