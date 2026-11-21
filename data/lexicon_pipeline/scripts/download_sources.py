#!/usr/bin/env python3
"""Descarga las fuentes habilitadas del manifiesto y registra su procedencia (SHA-256).

Uso:
  python scripts/download_sources.py --dry-run                 # solo consulta tamaño/fecha (HEAD)
  python scripts/download_sources.py                           # descarga las fuentes 'auto' habilitadas
  python scripts/download_sources.py --only openslr_slr21
  python scripts/download_sources.py --register-manual mcr30_2016 C:\\ruta\\mcr30-2016.zip

No descarga nada de fuentes 'disabled' (Datamuse, RAE). No hace descargas masivas por API.
"""
from __future__ import annotations

import argparse
import shutil
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lexpipe import common as C  # noqa: E402

USER_AGENT = f"lexicon-pipeline/{C.PIPELINE_VERSION} (proyecto personal de investigación lingüística)"


def head(url: str, timeout: int = 30) -> dict:
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return {
            "status": r.status,
            "final_url": r.geturl(),
            "content_length": r.headers.get("Content-Length"),
            "last_modified": r.headers.get("Last-Modified"),
            "etag": r.headers.get("ETag"),
            "content_type": r.headers.get("Content-Type"),
        }


def download(url: str, dest: Path, timeout: int = 60) -> dict:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_name(dest.name + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    import hashlib

    h = hashlib.sha256()
    size = 0
    last_print = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as r, open(tmp, "wb") as f:
        meta = {
            "status": r.status,
            "final_url": r.geturl(),
            "content_length": r.headers.get("Content-Length"),
            "last_modified": r.headers.get("Last-Modified"),
            "etag": r.headers.get("ETag"),
            "content_type": r.headers.get("Content-Type"),
        }
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
            h.update(chunk)
            size += len(chunk)
            if time.time() - last_print > 3:
                print(f"   ... {size / 1e6:,.1f} MB", flush=True)
                last_print = time.time()
    expected = meta["content_length"]
    if expected and expected.isdigit() and int(expected) != size:
        tmp.unlink(missing_ok=True)
        raise IOError(f"Descarga incompleta: esperados {expected} bytes, recibidos {size}")
    tmp.replace(dest)
    meta.update({"sha256": h.hexdigest(), "size": size})
    return meta


def record(source: dict, dest: Path, meta: dict, method: str) -> None:
    C.append_provenance(
        {
            "source_id": source["source_id"],
            "file": dest.name,
            "path": str(dest.relative_to(C.ROOT)),
            "method": method,
            "url": source.get("url"),
            "final_url": meta.get("final_url"),
            "sha256": meta["sha256"],
            "size": meta["size"],
            "downloaded_at": C.utcnow(),
            "http_last_modified": meta.get("last_modified"),
            "http_etag": meta.get("etag"),
            "license_id": source.get("license_id"),
            "license_url": source.get("license_url"),
            "pipeline_version": C.PIPELINE_VERSION,
        }
    )


def cmd_register_manual(source_id: str, file_path: str, copy: bool) -> int:
    sources = C.manifest_by_id()
    if source_id not in sources:
        print(f"ERROR: '{source_id}' no está en el manifiesto.")
        return 2
    src = Path(file_path)
    if not src.is_file():
        print(f"ERROR: no existe el archivo {src}")
        return 2
    s = sources[source_id]
    dest_dir = C.RAW / s["local_subdir"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / src.name
    if copy and src.resolve() != dest.resolve():
        shutil.copy2(src, dest)
    elif not copy:
        dest = src
    sha = C.sha256_file(dest)
    meta = {"sha256": sha, "size": dest.stat().st_size, "final_url": None}
    try:
        rel = dest.relative_to(C.ROOT)
    except ValueError:
        rel = dest
    C.append_provenance(
        {
            "source_id": source_id,
            "file": dest.name,
            "path": str(rel),
            "method": "manual",
            "url": s.get("url"),
            "final_url": None,
            "sha256": sha,
            "size": meta["size"],
            "downloaded_at": C.utcnow(),
            "http_last_modified": None,
            "http_etag": None,
            "license_id": s.get("license_id"),
            "license_url": s.get("license_url"),
            "pipeline_version": C.PIPELINE_VERSION,
        }
    )
    print(f"Registrado {dest.name}  sha256={sha}  ({meta['size'] / 1e6:,.1f} MB)")
    return 0


def main() -> int:
    C.setup_console()
    C.ensure_dirs()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", action="append", help="source_id a procesar (repetible)")
    ap.add_argument("--dry-run", action="store_true", help="solo HEAD: tamaño y fecha, sin descargar")
    ap.add_argument("--force", action="store_true", help="volver a descargar aunque ya exista")
    ap.add_argument("--register-manual", nargs=2, metavar=("SOURCE_ID", "ARCHIVO"))
    ap.add_argument("--no-copy", action="store_true", help="con --register-manual: no copiar, registrar en su lugar")
    args = ap.parse_args()

    if args.register_manual:
        return cmd_register_manual(args.register_manual[0], args.register_manual[1], copy=not args.no_copy)

    prov = C.latest_provenance()
    failures = 0
    for s in C.load_manifest():
        sid = s["source_id"]
        if args.only and sid not in args.only:
            continue
        if s["status"] != "enabled":
            print(f"[{sid}] omitida (status={s['status']}).")
            continue
        if s["download_mode"] != "auto":
            print(f"[{sid}] descarga MANUAL: abrí {s['url']} y registrá el archivo con --register-manual.")
            continue
        dest = C.RAW / s["local_subdir"] / s["local_filename"]
        print(f"[{sid}] {s['url']}")
        try:
            if args.dry_run:
                info = head(s["url"])
                print(f"   HEAD ok: status={info['status']} tamaño={info['content_length']} "
                      f"modificado={info['last_modified']} tipo={info['content_type']}")
                continue
            if dest.exists() and (sid, dest.name) in prov and not args.force:
                if C.sha256_file(dest) == prov[(sid, dest.name)]["sha256"]:
                    print("   ya descargado y con hash coincidente; se omite (usar --force para repetir).")
                    continue
                print("   el archivo local no coincide con el hash registrado; se vuelve a descargar.")
            meta = download(s["url"], dest)
            record(s, dest, meta, "http")
            print(f"   OK {meta['size'] / 1e6:,.1f} MB  sha256={meta['sha256']}")
            time.sleep(2)
        except (urllib.error.URLError, urllib.error.HTTPError, IOError, TimeoutError) as e:
            failures += 1
            print(f"   ERROR: {e}")
            print("   Revisá la URL en config/sources_manifest.csv o descargá a mano y usá --register-manual.")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
