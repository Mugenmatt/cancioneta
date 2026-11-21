"""Colector Open Library (API de busqueda). Solo metadatos bibliograficos."""
from __future__ import annotations

import logging

from ..http import HttpError
from ..schema import Record, join_list, make_tags
from .base import Collector

log = logging.getLogger("cdb.openlibrary")
URL = "https://openlibrary.org/search.json"
IDIOMAS = {"spa": "es", "eng": "en", "fre": "fr", "fra": "fr", "por": "pt", "ita": "it", "ger": "de", "deu": "de",
           "cat": "ca", "lat": "la"}


class OpenLibraryCollector(Collector):
    key = "openlibrary"
    categorias = ("libro",)

    def collect(self, max_records=None):
        emitidos = 0
        for consulta in self.cfg.queries.get("openlibrary", []):
            for pagina in range(1, int(consulta.get("paginas", 1)) + 1):
                try:
                    data = self.http.get_json(URL, params={
                        "q": consulta["q"], "limit": 100, "page": pagina,
                        "fields": "key,title,author_name,first_publish_year,subject,language"})
                except HttpError as exc:
                    log.error("Open Library fallo (%s p%s): %s", consulta["q"], pagina, exc)
                    break
                docs = data.get("docs", [])
                if not docs:
                    break
                for d in docs:
                    rec = self._to_record(d)
                    if rec:
                        yield rec
                        emitidos += 1
                        if max_records and emitidos >= max_records:
                            return

    def _to_record(self, d: dict):
        key, titulo = d.get("key", ""), (d.get("title") or "").strip()
        if not key or not titulo:
            return None
        autores = d.get("author_name") or []
        temas = [s for s in (d.get("subject") or []) if 2 < len(s) <= 40][:8]
        langs = d.get("language") or []
        idioma = IDIOMAS.get(langs[0], langs[0]) if langs else ""
        return Record(
            categoria="libro", contenido_o_titulo=titulo, fuente="openlibrary",
            url_fuente="https://openlibrary.org" + key, derechos="metadatos_obra_protegida",
            licencia="Metadatos Open Library (dominio publico / CC0 segun la fuente)",
            atribucion="Datos: Open Library", restricciones="Solo metadatos y enlace; sin texto de la obra.",
            autor_artista_creador=join_list(autores[:3]), anio=d.get("first_publish_year") or "",
            idioma=idioma, tematica=join_list(temas[:5]), etiquetas=make_tags(temas),
            fecha_verificacion=self.ctx.hoy, id_externo=key)
