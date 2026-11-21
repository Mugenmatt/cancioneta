"""Normalizacion de texto y claves de deduplicacion."""
from __future__ import annotations

import hashlib
import re
import unicodedata
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

ARTICULOS = {"el", "la", "los", "las", "un", "una", "unos", "unas", "the", "a", "an", "le", "les", "il", "lo"}
STOPWORDS = ARTICULOS | {
    "de", "del", "y", "e", "o", "u", "en", "con", "por", "para", "que", "se", "su", "sus", "al",
    "a", "es", "no", "mi", "tu", "me", "te", "lo", "como", "mas", "pero", "sin", "sobre", "of", "and", "to", "in",
}


def strip_accents(text: str) -> str:
    """Quita tildes y diacriticos, conservando la enie."""
    out = []
    for ch in unicodedata.normalize("NFD", text):
        if unicodedata.combining(ch):
            if ch == "\u0303" and out and out[-1] in "nN":
                out.append(ch)  # conserva n + tilde (enie)
            continue
        out.append(ch)
    return unicodedata.normalize("NFC", "".join(out))


def normalize_text(text, drop_article: bool = False) -> str:
    s = strip_accents(str(text or "")).lower()
    s = re.sub(r"[^\w\s]|_", " ", s)
    tokens = s.split()
    if drop_article and len(tokens) > 1 and tokens[0] in ARTICULOS:
        tokens = tokens[1:]
    return " ".join(tokens)


def fingerprint(text) -> str:
    """Huella legible para textos cortos y hash para largos."""
    n = normalize_text(text)
    if len(n) <= 80:
        return n
    return "h:" + hashlib.sha1(n.encode("utf-8")).hexdigest()[:20]


def canonical_url(url: str) -> str:
    """URL canonica: esquema/host en minuscula, sin fragmento, sin utm_*, sin barra final."""
    if not url:
        return ""
    parts = urlsplit(url.strip())
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if not k.lower().startswith("utm_")]
    path = parts.path.rstrip("/") or ""
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, urlencode(query), ""))


def make_dedup_key(categoria: str, titulo: str, autor: str = "", anio: str = "", obra: str = "",
                   url_pagina: str = "") -> str:
    t = normalize_text(titulo, drop_article=True)
    a = normalize_text(autor)
    if categoria in ("libro", "poema", "cancion"):
        parts = [t, a]
    elif categoria in ("pelicula", "serie"):
        parts = [t, str(anio or "")[:4]]
    elif categoria in ("cita", "guion"):
        parts = [fingerprint(titulo), a]
    elif categoria == "personaje":
        parts = [t, normalize_text(obra, drop_article=True)]
    elif categoria == "prompt":
        parts = [fingerprint(titulo)]
    elif categoria == "imagen":
        parts = [canonical_url(url_pagina)]
    else:
        parts = [t, a]
    return categoria + "|" + "|".join(parts)


def tokens_for_similarity(text: str) -> frozenset:
    return frozenset(t for t in normalize_text(text).split() if t not in STOPWORDS and len(t) > 2)


def near_duplicates(items, threshold: float = 0.85, max_posting_ratio: float = 0.05):
    """Devuelve pares (id_a, id_b, similitud) con similitud de Jaccard >= umbral.

    items: iterable de (id, texto). Usa un indice invertido y descarta tokens muy frecuentes
    para evitar el costo cuadratico.
    """
    items = list(items)
    toks = {i: tokens_for_similarity(t) for i, t in items}
    n = len(items)
    limit = max(50, int(n * max_posting_ratio))
    index: dict[str, list] = {}
    for i, _ in items:
        for tk in toks[i]:
            index.setdefault(tk, []).append(i)
    pairs = set()
    order = {i: k for k, (i, _) in enumerate(items)}
    for i, _ in items:
        a = toks[i]
        if not a:
            continue
        cand: dict = {}
        for tk in a:
            posting = index[tk]
            if len(posting) > limit:
                continue
            for j in posting:
                if order[j] > order[i]:
                    cand[j] = cand.get(j, 0) + 1
        for j, shared in cand.items():
            b = toks[j]
            union = len(a) + len(b) - shared
            if union and shared / union >= threshold:
                # shared cuenta tokens compartidos (no cuenta tokens descartados por frecuencia: se recalcula)
                inter = len(a & b)
                sim = inter / (len(a | b) or 1)
                if sim >= threshold:
                    pairs.add((i, j, round(sim, 3)))
    return sorted(pairs, key=lambda p: -p[2])
