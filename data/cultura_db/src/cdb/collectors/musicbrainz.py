"""Colector MusicBrainz (datos principales CC0). No copia etiquetas ni datos suplementarios."""
from __future__ import annotations

import logging
import re

from ..http import HttpError
from ..schema import Record
from .base import Collector

log = logging.getLogger("cdb.musicbrainz")
URL = "https://musicbrainz.org/ws/2/recording"
RUIDO = re.compile(r"live|en vivo|remix|demo|karaoke|instrumental|acoustic|version|edit", re.IGNORECASE)


class MusicBrainzCollector(Collector):
    key = "musicbrainz"
    categorias = ("cancion",)

    def collect(self, max_records=None):
        emitidos = 0
        for consulta in self.cfg.queries.get("musicbrainz", []):
            for pagina in range(int(consulta.get("paginas", 1))):
                try:
                    data = self.http.get_json(URL, params={"query": consulta["query"], "fmt": "json",
                                                           "limit": 100, "offset": pagina * 100})
                except HttpError as exc:
                    log.error("MusicBrainz fallo (%s): %s", consulta.get("etiqueta"), exc)
                    break
                recs = data.get("recordings", [])
                if not recs:
                    break
                for r in recs:
                    rec = self._to_record(r)
                    if rec:
                        yield rec
                        emitidos += 1
                        if max_records and emitidos >= max_records:
                            return

    def _to_record(self, r: dict):
        titulo = (r.get("title") or "").strip()
        if not titulo or not r.get("id") or RUIDO.search(r.get("disambiguation") or ""):
            return None
        artista = "".join((c.get("name") or c.get("artist", {}).get("name", "")) + (c.get("joinphrase") or "")
                          for c in r.get("artist-credit", [])).strip()
        fecha = r.get("first-release-date") or ""
        releases = r.get("releases") or []
        rec = Record(
            categoria="cancion", contenido_o_titulo=titulo, fuente="musicbrainz",
            url_fuente=f"https://musicbrainz.org/recording/{r['id']}", derechos="metadatos_obra_protegida",
            licencia="CC0 1.0 (datos principales de MusicBrainz)", atribucion="Datos: MusicBrainz (CC0)",
            restricciones="Solo metadatos; sin letra. Enlace de YouTube no incluido (agregar manualmente si hace falta).",
            autor_artista_creador=artista, anio=fecha[:4], fecha_verificacion=self.ctx.hoy, id_externo=r["id"])
        if releases and releases[0].get("title"):
            rec.extra["album"] = releases[0]["title"]
        return rec
