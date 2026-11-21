"""Utilidades comunes: rutas, normalización Unicode, hashes, manifiesto y procedencia."""
from __future__ import annotations

import csv
import datetime as dt
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "config"
DATA = ROOT / "data"
RAW = DATA / "raw"
STAGING = DATA / "staging"
REPORTS = DATA / "reports"
MANIFESTS = DATA / "manifests"
MANIFEST_CSV = CONFIG / "sources_manifest.csv"
PINNED_CSV = CONFIG / "pinned_hashes.csv"
PROVENANCE_LOG = MANIFESTS / "downloads.jsonl"
SQL_DIR = ROOT / "sql"
PIPELINE_VERSION = "0.1.0-muestra"


def setup_console() -> None:
    """Fuerza UTF-8 en la consola (importante en Windows)."""
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except Exception:
            pass


def ensure_dirs() -> None:
    for p in (RAW, STAGING, REPORTS, MANIFESTS):
        p.mkdir(parents=True, exist_ok=True)


def utcnow() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


# --------------------------------------------------------------------------
# Normalización de palabras
# --------------------------------------------------------------------------
_WS = re.compile(r"\s+")
VALID_WORD = re.compile(r"^[a-záéíóúüñ]+(?:[ '\-][a-záéíóúüñ]+)*$")


def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


def word_key(s: str) -> str:
    """Clave de comparación: NFC + minúsculas (casefold) + espacios colapsados.
    CONSERVA las tildes (cántaro != cantaro) y la eñe."""
    return nfc(_WS.sub(" ", str(s).strip()).casefold())


def accentless_key(s: str) -> str:
    """Clave sin tildes, SOLO para diagnóstico (nunca para identidad). Conserva ñ y ü."""
    k = word_key(s).replace("ñ", "\0n").replace("ü", "\0u")
    k = "".join(c for c in unicodedata.normalize("NFD", k) if unicodedata.category(c) != "Mn")
    return k.replace("\0n", "ñ").replace("\0u", "ü")


def is_valid_word(key: str) -> bool:
    return bool(VALID_WORD.match(key))


def is_multiword(key: str) -> bool:
    return " " in key


# --------------------------------------------------------------------------
# Hashes e integridad
# --------------------------------------------------------------------------
def sha256_file(path: Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            b = f.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


# --------------------------------------------------------------------------
# Manifiesto y registro de procedencia
# --------------------------------------------------------------------------
def load_manifest() -> list[dict]:
    with open(MANIFEST_CSV, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def manifest_by_id() -> dict[str, dict]:
    return {r["source_id"]: r for r in load_manifest()}


def append_provenance(record: dict) -> None:
    MANIFESTS.mkdir(parents=True, exist_ok=True)
    with open(PROVENANCE_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_provenance() -> list[dict]:
    if not PROVENANCE_LOG.exists():
        return []
    out = []
    with open(PROVENANCE_LOG, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def latest_provenance() -> dict[tuple[str, str], dict]:
    """Último registro por (source_id, file)."""
    latest: dict[tuple[str, str], dict] = {}
    for rec in read_provenance():
        latest[(rec["source_id"], rec["file"])] = rec
    return latest


def provenance_sha_for(path: Path) -> str | None:
    for (_, fname), rec in latest_provenance().items():
        if fname == path.name:
            return rec.get("sha256")
    return None
