"""Colector Project Gutenberg via Gutendex. Metadatos y enlace a la ficha del libro."""
from __future__ import annotations

import logging

from ..http import HttpError
from ..licensing import AVISO_DOMINIO_PUBLICO_AR, public_domain_ar
from ..schema import Record, join_list, make_tags
from .base import Collector

log = logging.getLogger("cdb.gutendex")
URL = "https://gutendex.com/books"


def invert_name(name: str) -> str:
    """'Cervantes Saavedra, Miguel de' -> 'Miguel de Cervantes Saavedra'."""
    if name.count(",") == 1:
        ap, nom = [p.strip() for p in name.split(",")]
        return f"{nom} {ap}".strip()
    return name.strip()


class GutendexCollector(Collector):
    key = "gutendex"
    categorias = ("libro",)

    def collect(self, max_records=None):
        plazo = int(self.cfg.settings["verificacion"]["plazo_autor_anios"])
        emitidos = 0
        for consulta in self.cfg.queries.get("gutendex", []):
            url, params = URL, {"languages": consulta["idiomas"]}
            for _ in range(int(consulta.get("paginas", 1))):
                try:
                    data = self.http.get_json(url, params=params)
                except HttpError as exc:
                    log.error("Gutendex fallo: %s", exc)
                    break
                for b in data.get("results", []):
                    rec = self._to_record(b, plazo)
                    if rec:
                        yield rec
                        emitidos += 1
                        if max_records and emitidos >= max_records:
                            return
                if not data.get("next"):
                    break
                url, params = data["next"], None

    def _to_record(self, b: dict, plazo: int):
        if b.get("media_type") not in (None, "Text"):
            return None
        autores = b.get("authors") or []
        if not autores or not b.get("title"):
            return None
        nombres = [invert_name(a.get("name", "")) for a in autores]
        muertes = [a.get("death_year") for a in autores]
        pd = all(m is not None for m in muertes) and all(public_domain_ar(m, plazo) for m in muertes)
        subjects = b.get("subjects") or []
        temas = [s.split(" -- ")[0] for s in subjects][:5]
        langs = b.get("languages") or []
        rec = Record(
            categoria="libro", contenido_o_titulo=b["title"].replace("\r\n", " ").strip(), fuente="gutendex",
            url_fuente=f"https://www.gutenberg.org/ebooks/{b['id']}",
            url_externa=f"https://www.gutenberg.org/ebooks/{b['id']}",
            derechos="dominio_publico" if pd else "metadatos_obra_protegida",
            licencia="Catalogo Project Gutenberg; obra de autor con plazo vencido (AR)" if pd
            else "Catalogo Project Gutenberg (solo metadatos)",
            atribucion="Datos: Project Gutenberg / Gutendex",
            restricciones=AVISO_DOMINIO_PUBLICO_AR if pd else "Solo metadatos y enlace; verificar derechos en AR.",
            autor_artista_creador=join_list(nombres), idioma=langs[0] if langs else "",
            tematica=join_list(temas), etiquetas=make_tags(temas + (b.get("bookshelves") or [])[:3]),
            fecha_verificacion=self.ctx.hoy, id_externo=str(b["id"]))
        vidas = [f"{a.get('birth_year') or '?'}-{a.get('death_year') or '?'}" for a in autores]
        rec.extra["autor_vida"] = "; ".join(vidas)
        return rec
