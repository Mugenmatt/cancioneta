"""Reglas de validacion. Un registro es 'verificado' solo si cumple TODAS las reglas fatales y de derechos."""
from __future__ import annotations

import re
from datetime import date

from .licensing import DERECHOS, DERECHOS_TEXTO_PERMITIDO
from .normalize import normalize_text
from .schema import CATEGORIAS

URL_RE = re.compile(r"^https?://[^\s/$.?#][^\s]*$", re.IGNORECASE)
QID_RE = re.compile(r"^[QPL]\d+$")
MAX_TEXTO = {"cita": 400, "guion": 300, "prompt": 700}
MIN_TEXTO = {"cita": 15, "prompt": 40}

REQUERIDOS = {
    "libro": ["autor_artista_creador"],
    "pelicula": ["anio"],
    "serie": ["anio"],
    "cancion": ["autor_artista_creador"],
    "poema": ["autor_artista_creador"],
    "cita": ["autor_artista_creador"],
    "guion": ["obra"],
    "personaje": ["obra"],
    "prompt": [],
    "imagen": ["autor_artista_creador", "url_externa", "licencia", "atribucion"],
}


def is_valid_url(url: str) -> bool:
    return bool(url) and bool(URL_RE.match(url))


def validate(rec) -> tuple[str, list[str]]:
    """Devuelve (estado, motivos). estado in {verificado, pendiente, rechazado}."""
    fatal: list[str] = []
    pend: list[str] = []
    cat = rec.categoria

    if cat not in CATEGORIAS:
        return "rechazado", [f"categoria_invalida:{cat}"]

    titulo = rec.contenido_o_titulo
    if not titulo:
        fatal.append("contenido_vacio")
    elif QID_RE.match(titulo):
        fatal.append("sin_etiqueta_en_fuente")
    if titulo and cat in MAX_TEXTO and len(titulo) > MAX_TEXTO[cat]:
        fatal.append(f"texto_demasiado_largo>{MAX_TEXTO[cat]}")
    if titulo and cat in MIN_TEXTO and len(titulo) < MIN_TEXTO[cat]:
        fatal.append(f"texto_demasiado_corto<{MIN_TEXTO[cat]}")

    if not rec.fuente:
        fatal.append("sin_fuente")
    if rec.derechos != "original":
        if not rec.url_fuente:
            fatal.append("sin_url_fuente")
        elif not is_valid_url(rec.url_fuente):
            fatal.append("url_fuente_malformada")
    elif rec.url_fuente and not is_valid_url(rec.url_fuente):
        fatal.append("url_fuente_malformada")
    if rec.url_externa and not is_valid_url(rec.url_externa):
        fatal.append("url_externa_malformada")

    if rec.derechos not in DERECHOS:
        fatal.append(f"derechos_invalidos:{rec.derechos}")
    if not rec.licencia:
        fatal.append("sin_licencia")
    try:
        date.fromisoformat(rec.fecha_verificacion)
    except ValueError:
        fatal.append("fecha_verificacion_invalida")

    for campo in REQUERIDOS.get(cat, []):
        if not getattr(rec, campo):
            fatal.append(f"falta_{campo}")

    # titulo y autor intercambiados / identicos
    if titulo and rec.autor_artista_creador and \
            normalize_text(titulo) == normalize_text(rec.autor_artista_creador) and cat not in ("imagen",):
        fatal.append("titulo_igual_a_autor")
    if rec.autor_artista_creador and QID_RE.match(rec.autor_artista_creador):
        fatal.append("autor_sin_etiqueta")

    # derechos y texto
    if rec.texto_breve and rec.derechos not in DERECHOS_TEXTO_PERMITIDO:
        fatal.append("texto_breve_sin_derechos")
    if cat in ("cita", "guion") and rec.derechos not in DERECHOS_TEXTO_PERMITIDO:
        if not rec.extra.get("sin_texto"):
            pend.append("derechos_no_permiten_reproducir_texto")
    if rec.derechos == "pendiente_verificacion":
        pend.append("derechos_pendientes")

    if fatal:
        return "rechazado", fatal
    if pend:
        return "pendiente", pend
    return "verificado", []
