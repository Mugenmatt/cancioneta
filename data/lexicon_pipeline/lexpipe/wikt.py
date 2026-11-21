"""Parser tolerante de registros Wiktextract (edición española).

IMPORTANTE: la estructura exacta de los registros de la edición española NO fue
verificada contra un archivo real. Este parser acepta variantes conocidas de nombres
de campo y `scripts/inspect_formats.py` sirve para comprobar qué campos existen de verdad.
"""
from __future__ import annotations

import json
import re

from . import common as C

SPANISH_NAMES = {"español", "spanish", "castellano"}
AR_TAG = re.compile(r"argentin|rioplat|r[ií]o de la plata|lunfardo", re.I)
AR_GLOSS = re.compile(r"\bargentin|\brioplat|r[ií]o de la plata|lunfard", re.I)

REL_KEYS = {
    "synonyms": "synonym", "antonyms": "antonym", "hypernyms": "hypernym",
    "hyponyms": "hyponym", "holonyms": "holonym", "meronyms": "meronym",
    "related": "related", "derived": "derived", "coordinate_terms": "coordinate",
    "troponyms": "troponym",
}

REGISTER_MAP = [
    (re.compile(r"coloquial|informal"), "coloquial"),
    (re.compile(r"vulgar"), "vulgar"),
    (re.compile(r"formal"), "formal"),
    (re.compile(r"po[eé]tic"), "poético"),
    (re.compile(r"literari"), "literario"),
    (re.compile(r"desuso|anticuad|obsolet|arcaic|dated|archaic"), "desuso"),
    (re.compile(r"despectiv|derogator|pejorat"), "despectivo"),
    (re.compile(r"jerga|slang|lunfard"), "jerga"),
]

_JUNK_FORMS = {"", "-", "no-table-tags"}


def normalize_pos(raw) -> tuple[str, bool]:
    """Devuelve (pos_normalizada, pista_de_forma_flexionada)."""
    if not raw:
        return "UNKNOWN", False
    s = C.nfc(str(raw)).strip().casefold()
    infl = s.startswith("forma ")
    t = s[6:] if infl else s
    words = t.split()
    first = words[0] if words else ""
    if first in {"sustantivo", "noun", "sust"} or t.startswith("nombre común"):
        return ("PROPN" if "propio" in t else "NOUN"), infl
    if t in {"name", "propn", "proper noun"} or t.startswith("nombre propio"):
        return "PROPN", infl
    table = {
        "verbo": "VERB", "verb": "VERB", "adjetivo": "ADJ", "adj": "ADJ", "adjective": "ADJ",
        "adverbio": "ADV", "adv": "ADV", "adverb": "ADV", "pronombre": "PRON", "pron": "PRON",
        "preposición": "ADP", "prep": "ADP", "conjunción": "CONJ", "conj": "CONJ",
        "interjección": "INTJ", "intj": "INTJ", "interj": "INTJ", "onomatopeya": "INTJ",
        "artículo": "DET", "det": "DET", "determinante": "DET", "numeral": "NUM", "num": "NUM",
        "locución": "PHRASE", "phrase": "PHRASE", "expresión": "PHRASE", "refrán": "PHRASE",
        "proverb": "PHRASE", "prefijo": "AFFIX", "sufijo": "AFFIX", "afijo": "AFFIX",
        "interfijo": "AFFIX", "prefix": "AFFIX", "suffix": "AFFIX", "affix": "AFFIX",
        "verbal": "VERB", "sustantiva": "NOUN", "adjetiva": "ADJ", "adverbial": "ADV",
        "pronominal": "PRON", "letra": "SYM", "símbolo": "SYM", "symbol": "SYM", "contracción": "CONTR",
    }
    return table.get(first, "OTHER"), infl


def _as_list(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


def _targets(items) -> list[str]:
    out = []
    for it in _as_list(items):
        if isinstance(it, dict):
            t = it.get("word") or it.get("title") or it.get("term")
        else:
            t = it
        if t:
            out.append(str(t))
    return out


def sense_gloss(s: dict) -> str:
    g = s.get("glosses") or s.get("raw_glosses") or []
    if isinstance(g, str):
        g = [g]
    return " > ".join(str(x).strip() for x in g if x and str(x).strip())


def sense_tags(s: dict) -> list[str]:
    tags = [str(t) for t in _as_list(s.get("tags"))] + [str(t) for t in _as_list(s.get("raw_tags"))]
    return [C.nfc(t).strip() for t in tags if str(t).strip()]


def is_spanish(rec: dict, lang_code: str = "es") -> bool:
    lc = rec.get("lang_code")
    if lc is not None:
        return str(lc).casefold() == lang_code
    for k in ("lang", "lang_name", "language", "section"):
        v = rec.get(k)
        if v and C.nfc(str(v)).strip().casefold() in SPANISH_NAMES:
            return True
    return False


def parse_record(rec: dict, lang_code: str = "es") -> dict | None:
    """Convierte un registro crudo en un dict plano. None si no es una entrada en español."""
    if not isinstance(rec, dict) or not is_spanish(rec, lang_code):
        return None
    word = rec.get("word") or rec.get("title")
    if not word or not str(word).strip():
        return None
    word = C.nfc(str(word).strip())
    pos_raw = rec.get("pos") or rec.get("pos_title") or rec.get("subsection")
    pos_norm, infl_hint = normalize_pos(pos_raw)

    senses_raw = [s for s in _as_list(rec.get("senses")) if isinstance(s, dict)]
    senses, relations, registers = [], [], set()
    ar_tag = ar_gloss = False
    n_form_of = n_alt_of = 0
    for i, s in enumerate(senses_raw):
        gloss = sense_gloss(s)
        tags = sense_tags(s)
        form_of = _targets(s.get("form_of"))
        alt_of = _targets(s.get("alt_of"))
        if form_of or any(t.casefold() in {"form-of", "forma flexionada"} for t in tags):
            n_form_of += 1
        elif alt_of:
            n_alt_of += 1
        for t in tags:
            if AR_TAG.search(t):
                ar_tag = True
            for rx, label in REGISTER_MAP:
                if rx.search(t.casefold()):
                    registers.add(label)
        if gloss and AR_GLOSS.search(gloss):
            ar_gloss = True
        senses.append({"idx": i, "gloss": gloss, "tags": tags,
                       "form_of": "; ".join(form_of), "alt_of": "; ".join(alt_of)})
        for key, rtype in REL_KEYS.items():
            for t in _targets(s.get(key)):
                relations.append((i, rtype, t))
    for key, rtype in REL_KEYS.items():
        for t in _targets(rec.get(key)):
            relations.append((None, rtype, t))

    n = len(senses)
    if infl_hint or (n and n_form_of == n):
        kind = "inflected_form"
    elif n and n_alt_of == n:
        kind = "variant"
    else:
        kind = "lemma"

    forms = []
    for f in _as_list(rec.get("forms")):
        if isinstance(f, dict):
            ftxt = f.get("form")
            ftags = [str(t) for t in _as_list(f.get("tags"))]
        else:
            ftxt, ftags = f, []
        if ftxt is None or str(ftxt).strip() in _JUNK_FORMS or "table-tags" in ftags:
            continue
        forms.append((C.nfc(str(ftxt).strip()), ftags))

    key = C.word_key(word)
    return {
        "word": word, "word_key": key, "accentless_key": C.accentless_key(word),
        "lang_code": str(rec.get("lang_code") or lang_code),
        "pos_raw": None if pos_raw is None else str(pos_raw), "pos_norm": pos_norm, "kind": kind,
        "n_senses": n, "is_multiword": int(C.is_multiword(key)), "valid_word": int(C.is_valid_word(key)),
        "region_ar_tag": int(ar_tag), "region_ar_gloss": int(ar_gloss),
        "registers": ",".join(sorted(registers)),
        "senses": senses, "forms": forms, "relations": relations,
    }


def dumps(o) -> str:
    return json.dumps(o, ensure_ascii=False)
