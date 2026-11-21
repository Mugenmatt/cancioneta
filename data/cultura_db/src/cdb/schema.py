"""Esquema maestro, categorias y definicion de hojas del Excel."""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from datetime import date

from .normalize import make_dedup_key

CATEGORIAS = ["libro", "pelicula", "serie", "cancion", "poema", "cita", "guion", "personaje", "prompt", "imagen"]
PREFIJOS = {"libro": "LIB", "pelicula": "PEL", "serie": "SER", "cancion": "CAN", "poema": "POE",
            "cita": "CIT", "guion": "GUI", "personaje": "PER", "prompt": "PRO", "imagen": "IMG"}
HOJAS = {"libro": "LIBROS", "pelicula": "PELICULAS", "serie": "SERIES", "cancion": "CANCIONES",
         "poema": "POEMAS", "cita": "CITAS", "guion": "GUIONES", "personaje": "PERSONAJES",
         "prompt": "PROMPTS", "imagen": "IMAGENES"}
ESTADOS = ("verificado", "pendiente", "rechazado")

# Columnas de la tabla maestra (nombres ASCII para importar sin problemas en la app).
# Equivalencias con los nombres pedidos: anio=año, genero=género, tematica=temática,
# descripcion=descripción, atribucion=atribución, fecha_verificacion=fecha_verificación.
MASTER_COLUMNS = [
    "id", "categoria", "contenido_o_titulo", "autor_artista_creador", "obra", "personaje", "anio",
    "idioma", "variante", "genero", "tematica", "etiquetas", "descripcion", "texto_breve",
    "fuente", "url_fuente", "url_externa", "derechos", "licencia", "atribucion", "restricciones",
    "fecha_verificacion", "estado_verificacion", "enlace_verificado", "uso_recomendado",
    "juegos_compatibles", "clave_deduplicacion", "id_externo", "extra_json",
]

# Campos que aportan los colectores / cargas manuales (el resto se calcula).
INPUT_FIELDS = [
    "categoria", "contenido_o_titulo", "autor_artista_creador", "obra", "personaje", "anio", "idioma",
    "variante", "genero", "tematica", "etiquetas", "descripcion", "texto_breve", "fuente", "url_fuente",
    "url_externa", "derechos", "licencia", "atribucion", "restricciones", "fecha_verificacion", "id_externo",
]
# Campos que entran en el hash de contenido (detecta cambios en la fuente).
HASH_FIELDS = [f for f in INPUT_FIELDS if f != "fecha_verificacion"]


def join_list(items, sep: str = " | ") -> str:
    seen, out = set(), []
    for it in items:
        it = str(it).strip()
        if it and it.lower() not in seen:
            seen.add(it.lower())
            out.append(it)
    return sep.join(out)


def make_tags(items) -> str:
    """Etiquetas separadas por '|' (sin espacios alrededor), en minuscula, sin repetidos."""
    seen, out = set(), []
    for it in items:
        t = re.sub(r"\s+", " ", str(it).strip().lower()).replace("|", "/")
        if t and t not in seen:
            seen.add(t)
            out.append(t)
    return "|".join(out)


@dataclass
class Record:
    categoria: str
    contenido_o_titulo: str
    fuente: str = ""
    url_fuente: str = ""
    derechos: str = "pendiente_verificacion"
    licencia: str = ""
    autor_artista_creador: str = ""
    obra: str = ""
    personaje: str = ""
    anio: str = ""
    idioma: str = ""
    variante: str = ""
    genero: str = ""
    tematica: str = ""
    etiquetas: str = ""
    descripcion: str = ""
    texto_breve: str = ""
    url_externa: str = ""
    atribucion: str = ""
    restricciones: str = ""
    fecha_verificacion: str = ""
    id_externo: str = ""
    extra: dict = field(default_factory=dict)
    # calculados
    id: str = ""
    clave: str = ""

    def finalize(self, hoy: str | None = None) -> "Record":
        for f in INPUT_FIELDS:
            v = getattr(self, f)
            setattr(self, f, "" if v is None else str(v).strip())
        if not self.fecha_verificacion:
            self.fecha_verificacion = hoy or date.today().isoformat()
        url_pagina = self.url_fuente if self.categoria == "imagen" else ""
        self.clave = make_dedup_key(self.categoria, self.contenido_o_titulo, self.autor_artista_creador,
                                    self.anio, self.obra, url_pagina)
        prefijo = PREFIJOS.get(self.categoria, "REG")
        self.id = f"{prefijo}-{hashlib.sha1(self.clave.encode('utf-8')).hexdigest()[:12]}"
        return self

    def hash_crudo(self) -> str:
        payload = {f: getattr(self, f) for f in HASH_FIELDS}
        payload["extra"] = self.extra
        raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return hashlib.sha1(raw.encode("utf-8")).hexdigest()

    @classmethod
    def from_dict(cls, d: dict) -> "Record":
        kwargs = {k: d.get(k, "") for k in INPUT_FIELDS if k in d}
        extra = d.get("extra") or {}
        if not extra and d.get("extra_json"):
            try:
                extra = json.loads(d["extra_json"])
            except (TypeError, ValueError):
                extra = {}
        return cls(extra=extra, **kwargs)


# ---------------------------------------------------------------------------
# Hojas por categoria: (encabezado, origen). origen = columna maestra o "extra:clave".
# ---------------------------------------------------------------------------
_COLA = [("fuente", "fuente"), ("url_fuente", "url_fuente"), ("derechos", "derechos"), ("licencia", "licencia"),
         ("atribucion", "atribucion"), ("fecha_verificacion", "fecha_verificacion"),
         ("juegos_compatibles", "juegos_compatibles")]

_CABEZA = {
    "libro": [("id", "id"), ("titulo", "contenido_o_titulo"), ("autor", "autor_artista_creador"), ("anio", "anio"),
              ("genero", "genero"), ("tematica", "tematica"), ("sinopsis", "descripcion"), ("idioma", "idioma"),
              ("etiquetas", "etiquetas"), ("url_externa", "url_externa")],
    "pelicula": [("id", "id"), ("titulo", "contenido_o_titulo"), ("director", "autor_artista_creador"),
                 ("anio", "anio"), ("personajes_relevantes", "extra:personajes_relevantes"),
                 ("tematica", "tematica"), ("genero", "genero"), ("sinopsis", "descripcion"),
                 ("idioma", "idioma"), ("etiquetas", "etiquetas"), ("url_externa", "url_externa")],
    "serie": [("id", "id"), ("titulo", "contenido_o_titulo"), ("creador", "autor_artista_creador"),
              ("anio", "anio"), ("tipo", "extra:tipo"), ("personajes_relevantes", "extra:personajes_relevantes"),
              ("tematica", "tematica"), ("genero", "genero"), ("idioma", "idioma"), ("etiquetas", "etiquetas"),
              ("url_externa", "url_externa")],
    "cancion": [("id", "id"), ("titulo", "contenido_o_titulo"), ("artista", "autor_artista_creador"),
                ("album", "extra:album"), ("anio", "anio"), ("genero", "genero"), ("tematica", "tematica"),
                ("url_musica", "url_externa"), ("idioma", "idioma"), ("etiquetas", "etiquetas")],
    "poema": [("id", "id"), ("titulo", "contenido_o_titulo"), ("autor", "autor_artista_creador"), ("anio", "anio"),
              ("tematica", "tematica"), ("url_poema", "url_externa"), ("texto_breve", "texto_breve"),
              ("idioma", "idioma"), ("etiquetas", "etiquetas"), ("restricciones", "restricciones")],
    "cita": [("id", "id"), ("cita", "contenido_o_titulo"), ("autor", "autor_artista_creador"), ("obra", "obra"),
             ("anio", "anio"), ("tipo_cita", "extra:tipo_cita"), ("tematica", "tematica"), ("idioma", "idioma"),
             ("etiquetas", "etiquetas"), ("restricciones", "restricciones")],
    "guion": [("id", "id"), ("frase_o_referencia", "contenido_o_titulo"), ("obra", "obra"),
              ("personaje", "personaje"), ("autor", "autor_artista_creador"), ("anio", "anio"),
              ("tipo", "extra:tipo"), ("url_consulta", "url_externa"), ("idioma", "idioma"),
              ("etiquetas", "etiquetas"), ("restricciones", "restricciones")],
    "personaje": [("id", "id"), ("nombre", "contenido_o_titulo"), ("obra", "obra"), ("medio", "extra:medio"),
                  ("naturaleza", "extra:naturaleza"), ("descripcion", "descripcion"),
                  ("rasgos", "extra:rasgos"), ("tematica", "tematica"), ("url_investigar", "url_externa"),
                  ("idioma", "idioma"), ("etiquetas", "etiquetas")],
    "prompt": [("id", "id"), ("prompt", "contenido_o_titulo"), ("tipo_prompt", "extra:tipo_prompt"),
               ("tematica", "tematica"), ("etiquetas", "etiquetas"), ("idioma", "idioma")],
    "imagen": [("id", "id"), ("titulo", "contenido_o_titulo"), ("descripcion", "descripcion"),
               ("url_imagen", "url_externa"), ("autor", "autor_artista_creador"), ("tematica", "tematica"),
               ("etiquetas", "etiquetas"), ("restricciones", "restricciones")],
}


def category_columns(categoria: str):
    cabeza = _CABEZA[categoria]
    usados = {src for _, src in cabeza}
    nombres = {h for h, _ in cabeza}
    cola = [(h, s) for h, s in _COLA if s not in usados and h not in nombres]
    if categoria == "prompt":
        cola = [("fuente", "fuente"), ("derechos", "derechos"), ("licencia", "licencia"),
                ("juegos_compatibles", "juegos_compatibles")]
    return cabeza + cola
