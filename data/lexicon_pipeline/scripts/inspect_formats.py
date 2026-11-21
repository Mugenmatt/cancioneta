#!/usr/bin/env python3
"""Inspecciona la estructura REAL de los archivos descargados antes de procesarlos.

  python scripts/inspect_formats.py jsonl ARCHIVO.jsonl.gz [--n 3000]   # campos de Wiktextract
  python scripts/inspect_formats.py json  ARCHIVO.tgz                   # lista de OpenSLR
  python scripts/inspect_formats.py dump  ARCHIVO.zip                   # volcado SQL del MCR

Pegá la salida en el chat: sirve para ajustar los parsers a los datos reales.
"""
from __future__ import annotations

import argparse
import collections
import gzip
import itertools
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lexpipe import common as C  # noqa: E402
from lexpipe import openslr  # noqa: E402


def cmd_jsonl(path: Path, n: int) -> None:
    op = gzip.open if path.suffix == ".gz" else open
    keys, lang_codes, langs, pos, tag_vals = (collections.Counter() for _ in range(5))
    sense_keys = collections.Counter()
    example = None
    total = 0
    with op(path, "rt", encoding="utf-8", errors="replace") as f:
        for line in itertools.islice(f, n):
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            total += 1
            keys.update(rec.keys())
            lang_codes[rec.get("lang_code")] += 1
            langs[rec.get("lang") or rec.get("lang_name") or rec.get("section")] += 1
            pos[rec.get("pos") or rec.get("pos_title") or rec.get("subsection")] += 1
            for s in rec.get("senses", []) or []:
                if isinstance(s, dict):
                    sense_keys.update(s.keys())
                    for t in (s.get("tags") or []) + (s.get("raw_tags") or []):
                        tag_vals[str(t)] += 1
            if example is None and (rec.get("lang_code") == "es") and rec.get("senses"):
                example = rec
    print(f"Registros leídos: {total}  (¡las primeras líneas pueden no ser representativas!)")
    print("\nCampos de nivel entrada:", dict(keys.most_common(40)))
    print("\nCampos dentro de 'senses':", dict(sense_keys.most_common(40)))
    print("\nlang_code:", dict(lang_codes.most_common(8)))
    print("lang/section:", dict(langs.most_common(8)))
    print("\npos más frecuentes:", dict(pos.most_common(25)))
    print("\ntags de acepciones más frecuentes:", dict(tag_vals.most_common(40)))
    if example:
        print("\nEjemplo de registro en español (recortado):")
        print(json.dumps(example, ensure_ascii=False, indent=1)[:2500])


def cmd_json(path: Path) -> None:
    raw, member = openslr._read_bytes(path)
    print(f"Miembro: {member}  bytes: {len(raw):,}")
    print("Primeros 400 caracteres:", repr(raw[:400].decode("utf-8", errors="replace")))
    pairs, _ = openslr.load_wordlist(path)
    print(f"Pares (palabra, conteo) interpretados: {len(pairs):,}")
    print("Primeros 10:", pairs[:10])


def cmd_dump(path: Path) -> None:
    from stage_mcr_dump import scan_or_load  # noqa: E402

    res = scan_or_load(path, None)
    for name, t in sorted(res["tables"].items()):
        print(f"{name:45s} filas={t['n_rows']:>9,} columnas={t['columns']}")


def main() -> int:
    C.setup_console()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("kind", choices=["jsonl", "json", "dump"])
    ap.add_argument("path", type=Path)
    ap.add_argument("--n", type=int, default=3000)
    a = ap.parse_args()
    if not a.path.exists():
        print("No existe:", a.path)
        return 2
    {"jsonl": lambda: cmd_jsonl(a.path, a.n), "json": lambda: cmd_json(a.path), "dump": lambda: cmd_dump(a.path)}[a.kind]()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
