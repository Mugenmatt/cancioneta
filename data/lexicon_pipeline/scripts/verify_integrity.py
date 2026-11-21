#!/usr/bin/env python3
"""Verifica la integridad de los archivos descargados.

Comprueba, para cada archivo registrado en data/manifests/downloads.jsonl:
  1. que exista y tenga el tamaño registrado,
  2. que su SHA-256 coincida con el registrado al descargar,
  3. que el archivo comprimido (.gz, .tgz, .zip) se pueda leer completo (no esté corrupto),
  4. que coincida con el hash "fijado" (pinned) si fue revisado y fijado a mano.

Uso:
  python scripts/verify_integrity.py
  python scripts/verify_integrity.py --pin wiktextract_es_raw --note "revisado 2026-11"
  python scripts/verify_integrity.py --write-checksums      # genera data/raw/SHA256SUMS

Código de salida 0 = todo bien; 1 = hay problemas.
"""
from __future__ import annotations

import argparse
import csv
import gzip
import sys
import tarfile
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lexpipe import common as C  # noqa: E402


def check_archive(path: Path) -> str | None:
    """Devuelve None si el archivo comprimido se lee completo, o un mensaje de error."""
    name = path.name.lower()
    try:
        if name.endswith((".tgz", ".tar.gz", ".tar")):
            with tarfile.open(path, "r:*") as tf:
                for m in tf:
                    if m.isfile():
                        f = tf.extractfile(m)
                        while f and f.read(1 << 20):
                            pass
        elif name.endswith(".gz"):
            with gzip.open(path, "rb") as f:
                while f.read(1 << 20):
                    pass
        elif name.endswith(".zip"):
            bad = zipfile.ZipFile(path).testzip()
            if bad:
                return f"miembro dañado en zip: {bad}"
    except (OSError, EOFError, tarfile.TarError, zipfile.BadZipFile) as e:
        return f"archivo comprimido ilegible: {e}"
    return None


def load_pins() -> dict[tuple[str, str], dict]:
    if not C.PINNED_CSV.exists():
        return {}
    with open(C.PINNED_CSV, newline="", encoding="utf-8") as f:
        return {(r["source_id"], r["file"]): r for r in csv.DictReader(f)}


def write_pin(source_id: str, rec: dict, note: str) -> None:
    pins = load_pins()
    pins[(source_id, rec["file"])] = {
        "source_id": source_id, "file": rec["file"], "sha256": rec["sha256"],
        "pinned_at": C.utcnow(), "note": note,
    }
    with open(C.PINNED_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["source_id", "file", "sha256", "pinned_at", "note"])
        w.writeheader()
        w.writerows(pins.values())


def main() -> int:
    C.setup_console()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pin", metavar="SOURCE_ID", help="fija el hash actual de esa fuente tras revisarla")
    ap.add_argument("--note", default="", help="nota para --pin")
    ap.add_argument("--write-checksums", action="store_true", help="escribe data/raw/SHA256SUMS")
    ap.add_argument("--skip-archive-test", action="store_true", help="omite la lectura completa de archivos comprimidos")
    args = ap.parse_args()

    latest = C.latest_provenance()
    if not latest:
        print("No hay archivos registrados todavía (data/manifests/downloads.jsonl vacío o inexistente).")
        return 1

    if args.pin:
        found = False
        for (sid, _), rec in latest.items():
            if sid == args.pin:
                path = C.ROOT / rec["path"]
                if path.exists() and C.sha256_file(path) != rec["sha256"]:
                    print(f"NO se fija {rec['file']}: el hash actual no coincide con el registrado.")
                    return 1
                write_pin(sid, rec, args.note)
                print(f"Fijado {rec['file']}  sha256={rec['sha256']}")
                found = True
        return 0 if found else 1

    pins = load_pins()
    problems = 0
    sums = []
    for (sid, fname), rec in sorted(latest.items()):
        path = Path(rec["path"])
        path = path if path.is_absolute() else C.ROOT / path
        print(f"[{sid}] {fname}")
        if not path.exists():
            print("   FALTA el archivo.")
            problems += 1
            continue
        size = path.stat().st_size
        if size != rec["size"]:
            print(f"   TAMAÑO distinto: registrado {rec['size']}, actual {size}")
            problems += 1
            continue
        sha = C.sha256_file(path)
        if sha != rec["sha256"]:
            print("   HASH distinto del registrado al descargar -> archivo modificado o corrupto.")
            problems += 1
            continue
        pin = pins.get((sid, fname))
        if pin and pin["sha256"] != sha:
            print("   DISTINTO del hash fijado: cambió upstream (¿nueva versión?). Requiere revisión antes de usarlo.")
            problems += 1
            continue
        if not args.skip_archive_test:
            err = check_archive(path)
            if err:
                print(f"   {err}")
                problems += 1
                continue
        state = "fijado" if pin else "sin fijar (revisión humana pendiente)"
        print(f"   OK  sha256={sha[:16]}…  [{state}]")
        sums.append(f"{sha}  {path.relative_to(C.RAW) if C.RAW in path.parents else path.name}")

    if args.write_checksums and sums:
        out = C.RAW / "SHA256SUMS"
        out.write_text("\n".join(sums) + "\n", encoding="utf-8")
        print(f"Escrito {out} (verificable con: sha256sum -c SHA256SUMS)")
    print("RESULTADO:", "todo correcto" if not problems else f"{problems} problema(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
