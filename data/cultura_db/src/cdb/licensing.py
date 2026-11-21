"""Clasificacion de derechos y licencias."""
from __future__ import annotations

import re
from datetime import date

# Estados de derechos admitidos en la columna "derechos"
DERECHOS = {
    "dominio_publico": "Dominio publico verificado por regla documentada o etiqueta de la fuente.",
    "licencia_abierta": "Licencia abierta compatible (CC BY, CC BY-SA, etc.). Respetar atribucion.",
    "autorizacion_expresa": "Autorizacion expresa documentada del titular.",
    "original": "Contenido original del proyecto.",
    "metadatos_obra_protegida": "Solo metadatos y enlace; el texto de la obra NO se reproduce.",
    "pendiente_verificacion": "Derechos sin resolver: no cuenta como registro valido.",
}
# Derechos que permiten almacenar texto (citas, frases, texto breve).
DERECHOS_TEXTO_PERMITIDO = {"dominio_publico", "licencia_abierta", "autorizacion_expresa", "original"}

AVISO_DOMINIO_PUBLICO_AR = (
    "Plazo calculado por vida del autor + 70 anios (Ley 11.723). Verificar con asesoria legal: "
    "obras postumas, traducciones, ediciones y el regimen de dominio publico pagante en Argentina."
)


def public_domain_ar(death_year, plazo: int = 70, hoy: int | None = None) -> bool:
    """True si el plazo de proteccion por fallecimiento del autor ya vencio.

    El plazo corre hasta el 31 de diciembre del anio (fallecimiento + plazo).
    """
    if death_year in (None, ""):
        return False
    try:
        y = int(death_year)
    except (TypeError, ValueError):
        return False
    hoy = hoy or date.today().year
    return y + plazo < hoy


def classify_license(name: str) -> tuple[str, str]:
    """Clasifica un nombre de licencia. Devuelve (derechos, licencia_normalizada).

    Solo acepta CC0 / dominio publico / CC BY / CC BY-SA. Todo lo demas (NC, ND, desconocidas)
    queda como pendiente_verificacion.
    """
    original = (name or "").strip()
    low = re.sub(r"\s+", " ", original.lower().replace("_", " ").replace("-", " ")).strip()
    if not low:
        return "pendiente_verificacion", original
    if low.startswith("cc0") or "public domain" in low or low.startswith("dominio publico") \
            or low == "pd" or low.startswith("pd ") or low.startswith("pdm"):
        return "dominio_publico", original
    if re.match(r"^cc by(?: sa)?(?: \d(?:\.\d)?)?(?: [a-z]{2,3})?$", low):
        return "licencia_abierta", original
    return "pendiente_verificacion", original


def license_restrictions(licencia: str) -> str:
    low = re.sub(r"\s+", " ", (licencia or "").lower().replace("-", " ")).strip()
    notes = []
    if low.startswith("cc by"):
        notes.append("Atribucion obligatoria.")
    if " sa" in low:
        notes.append("Compartir igual: obras derivadas con la misma licencia.")
    if low.startswith("pd ") or low == "pd" or "public domain" in low:
        notes.append("Etiqueta de dominio publico segun la fuente; verificar jurisdiccion.")
    return " ".join(notes)
