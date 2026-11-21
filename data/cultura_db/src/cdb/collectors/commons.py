"""Colector Wikimedia Commons: imagenes reales con licencia abierta, autor y atribucion."""
from __future__ import annotations

import html
import logging
import re

from ..http import HttpError
from ..licensing import classify_license, license_restrictions
from ..schema import Record, make_tags
from .base import Collector

log = logging.getLogger("cdb.commons")
API = "https://commons.wikimedia.org/w/api.php"
CAT_RUIDO = re.compile(r"(?i)(cc[- ]|licen|self[- ]published|uploaded|^files? |pd[- ]|^media |^images? from|"
                       r"^photos? by|quality|featured|valued|wikimedia|commons)")


def strip_html(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


class CommonsCollector(Collector):
    key = "commons"
    categorias = ("imagen",)

    def collect(self, max_records=None):
        cfgc = self.cfg.queries.get("commons", {})
        min_ancho = int(cfgc.get("min_ancho_px", 0))
        lista = cfgc.get("consultas", [])
        emitidos = 0
        for c in lista:
            params = {"action": "query", "format": "json", "formatversion": 2, "generator": "search",
                      "gsrsearch": f"{c['q']} filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 50,
                      "prop": "imageinfo", "iiprop": "url|extmetadata|mime|size", "iiextmetadatalanguage": "es"}
            for _ in range(int(c.get("paginas", 1))):
                try:
                    data = self.http.get_json(API, params=params)
                except HttpError as exc:
                    log.error("Commons fallo (%s): %s", c["q"], exc)
                    break
                for page in (data.get("query", {}).get("pages") or []):
                    rec = self._to_record(page, c.get("tematica", ""), min_ancho)
                    if rec:
                        yield rec
                        emitidos += 1
                        if max_records and emitidos >= max_records:
                            return
                if "continue" not in data:
                    break
                params = {**params, **data["continue"]}

    def _to_record(self, page: dict, tematica: str, min_ancho: int):
        info = (page.get("imageinfo") or [None])[0]
        if not info:
            return None
        meta = info.get("extmetadata") or {}
        g = lambda k: strip_html((meta.get(k) or {}).get("value", ""))  # noqa: E731
        if (info.get("width") or 0) < min_ancho or not str(info.get("mime", "")).startswith("image/"):
            return None
        lic_name = g("LicenseShortName")
        derechos, lic = classify_license(lic_name)
        if derechos == "pendiente_verificacion":
            return None  # licencia no abierta o desconocida: no se almacena
        autor = g("Artist")
        titulo = g("ObjectName") or re.sub(r"\.[A-Za-z0-9]+$", "", page.get("title", "").replace("File:", "")).replace("_", " ")
        url_pagina = info.get("descriptionurl", "")
        restr = [license_restrictions(lic)]
        if g("Restrictions"):
            restr.append(f"Restricciones no autorales segun Commons: {g('Restrictions')}.")
        cats = [c for c in g("Categories").split("|") if c and not CAT_RUIDO.search(c)][:8]
        rec = Record(
            categoria="imagen", contenido_o_titulo=titulo, fuente="commons", url_fuente=url_pagina,
            url_externa=info.get("url", ""), derechos=derechos, licencia=lic, autor_artista_creador=autor,
            atribucion=f"{autor} - {lic} - Wikimedia Commons ({url_pagina})" if autor else "",
            restricciones=" ".join(r for r in restr if r), descripcion=g("ImageDescription")[:300],
            tematica=tematica, etiquetas=make_tags(cats + [t.strip() for t in tematica.split(";")]),
            fecha_verificacion=self.ctx.hoy, id_externo=page.get("title", ""))
        rec.extra["ancho"] = info.get("width")
        rec.extra["alto"] = info.get("height")
        return rec
