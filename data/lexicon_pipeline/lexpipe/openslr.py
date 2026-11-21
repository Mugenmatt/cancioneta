"""Lectura tolerante de la lista de palabras OpenSLR SLR21 (JSON dentro de un .tgz)."""
from __future__ import annotations

import gzip
import io
import json
import tarfile
import zipfile
from pathlib import Path
from typing import Iterator

COUNT_KEYS = ("count", "freq", "frequency", "n", "c")
WORD_KEYS = ("word", "w", "token", "form")


def _read_bytes(path: Path) -> tuple[bytes, str]:
    """Devuelve (contenido, nombre_del_miembro) del primer archivo de datos."""
    name = path.name.lower()
    if name.endswith((".tgz", ".tar.gz", ".tar")):
        with tarfile.open(path, "r:*") as tf:
            members = [m for m in tf.getmembers() if m.isfile()]
            if not members:
                raise ValueError("el .tgz no contiene archivos")
            members.sort(key=lambda m: (not m.name.lower().endswith(".json"), -m.size))
            m = members[0]
            return tf.extractfile(m).read(), m.name
    if name.endswith(".zip"):
        with zipfile.ZipFile(path) as zf:
            infos = [i for i in zf.infolist() if not i.is_dir()]
            infos.sort(key=lambda i: (not i.filename.lower().endswith(".json"), -i.file_size))
            return zf.read(infos[0]), infos[0].filename
    if name.endswith(".gz"):
        with gzip.open(path, "rb") as f:
            return f.read(), path.stem
    return path.read_bytes(), path.name


def _count(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return int(v)
    if isinstance(v, str) and v.strip().lstrip("-").isdigit():
        return int(v)
    if isinstance(v, dict):
        for k in COUNT_KEYS:
            if k in v:
                return _count(v[k])
    return None


def iter_pairs(obj) -> Iterator[tuple[str, int]]:
    """Acepta: {palabra: n}, [[palabra, n], ...], [{word:..., count:...}, ...], ["palabra", ...]."""
    if isinstance(obj, dict):
        for w, v in obj.items():
            c = _count(v)
            if c is not None:
                yield str(w), c
        return
    if isinstance(obj, list):
        for it in obj:
            if isinstance(it, (list, tuple)) and len(it) >= 2 and _count(it[1]) is not None:
                yield str(it[0]), _count(it[1])
            elif isinstance(it, dict):
                w = next((it[k] for k in WORD_KEYS if k in it), None)
                c = _count(it)
                if w is not None and c is not None:
                    yield str(w), c
        return
    raise ValueError(f"estructura JSON no reconocida: {type(obj).__name__}")


def load_wordlist(path: Path) -> tuple[list[tuple[str, int]], str]:
    raw, member = _read_bytes(path)
    text = raw.decode("utf-8", errors="replace")
    try:
        obj = json.loads(text)
        pairs = list(iter_pairs(obj))
    except json.JSONDecodeError:
        pairs = []
        for line in io.StringIO(text):
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
                pairs.extend(iter_pairs(o if isinstance(o, (dict, list)) else [o]))
                continue
            except json.JSONDecodeError:
                pass
            parts = line.replace("\t", " ").rsplit(" ", 1)
            if len(parts) == 2 and parts[1].isdigit():
                pairs.append((parts[0].strip(), int(parts[1])))
    if not pairs:
        raise ValueError(f"No se pudo interpretar '{member}'. Usá scripts/inspect_formats.py json <archivo>.")
    return pairs, member
