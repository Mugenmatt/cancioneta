"""Colector Wikidata (SPARQL). Metadatos CC0 de libros, poemas, peliculas, series, canciones y personajes."""
from __future__ import annotations

import logging
import re
from pathlib import Path

from ..http import HttpError
from ..licensing import AVISO_DOMINIO_PUBLICO_AR, public_domain_ar
from ..schema import Record, join_list, make_tags
from .base import Collector

log = logging.getLogger("cdb.wikidata")
ENDPOINT = "https://query.wikidata.org/sparql"
QID_RE = re.compile(r"^Q\d+$")
YEAR_RE = re.compile(r"^(-?\d{1,4})-")


def build_query(tipo_cfg: dict, cls_cfg: dict, limit: int, offset: int) -> str:
    clases = " ".join(f"wd:{q}" for q in tipo_cfg["clases"])
    sitio = cls_cfg["sitio_articulo"]
    selects = ["?item", "?itemLabel", "?class", "?article", "?desc"]
    optional = []
    for var, props in (tipo_cfg.get("entidades") or {}).items():
        path = "|".join(f"wdt:{p}" for p in props)
        optional.append(f"OPTIONAL {{ ?item {path} ?{var} . }}")
        selects.append(f"?{var}Label")
    for var, prop in (tipo_cfg.get("entidades_inversas") or {}).items():
        optional.append(f"OPTIONAL {{ ?{var} wdt:{prop} ?item . }}")
        selects.append(f"?{var}Label")
    if tipo_cfg.get("fechas"):
        path = "|".join(f"wdt:{p}" for p in tipo_cfg["fechas"])
        optional.append(f"OPTIONAL {{ ?item {path} ?fecha . }}")
        selects.append("?fecha")
    if tipo_cfg.get("autor_con_fallecimiento"):
        optional.append(f"OPTIONAL {{ ?item wdt:{tipo_cfg['autor_con_fallecimiento']}/wdt:P570 ?muerte . }}")
        selects.append("?muerte")
    if tipo_cfg.get("wikisource"):
        optional.append(f"OPTIONAL {{ ?ws schema:about ?item ; schema:isPartOf <{cls_cfg['sitio_wikisource']}> . }}")
        selects.append("?ws")
    optional.append('OPTIONAL { ?item schema:description ?desc . FILTER(LANG(?desc) = "es") }')
    body = "\n  ".join(optional)
    return f"""SELECT {' '.join(selects)} WHERE {{
  {{ SELECT ?item ?class ?article WHERE {{
      VALUES ?class {{ {clases} }}
      ?item wdt:P31 ?class .
      ?article schema:about ?item ; schema:isPartOf <{sitio}> .
    }} ORDER BY ?item LIMIT {int(limit)} OFFSET {int(offset)} }}
  {body}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "es,en". }}
}}"""


def _val(b: dict, name: str) -> str:
    return b.get(name, {}).get("value", "") if name in b else ""


def aggregate(bindings: list, tipo_cfg: dict) -> dict:
    """Agrupa las filas (producto cartesiano de opcionales) por elemento de Wikidata."""
    items: dict = {}
    vars_ent = list((tipo_cfg.get("entidades") or {}).keys()) + list((tipo_cfg.get("entidades_inversas") or {}).keys())
    for b in bindings:
        uri = _val(b, "item")
        qid = uri.rsplit("/", 1)[-1]
        if not QID_RE.match(qid):
            continue
        it = items.setdefault(qid, {"qid": qid, "label": "", "lang": "", "clases": [], "article": "", "desc": "",
                                    "ents": {v: [] for v in vars_ent}, "fechas": [], "muertes": [], "ws": ""})
        if not it["label"]:
            it["label"] = _val(b, "itemLabel")
            it["lang"] = b.get("itemLabel", {}).get("xml:lang", "")
        cls = _val(b, "class").rsplit("/", 1)[-1]
        if cls and cls not in it["clases"]:
            it["clases"].append(cls)
        it["article"] = it["article"] or _val(b, "article")
        it["desc"] = it["desc"] or _val(b, "desc")
        it["ws"] = it["ws"] or _val(b, "ws")
        for v in vars_ent:
            lab = _val(b, f"{v}Label")
            if lab and not QID_RE.match(lab) and lab not in it["ents"][v]:
                it["ents"][v].append(lab)
        for campo, dest in (("fecha", "fechas"), ("muerte", "muertes")):
            m = YEAR_RE.match(_val(b, campo))
            if m and int(m.group(1)) not in it[dest]:
                it[dest].append(int(m.group(1)))
    return items


def to_record(tipo: str, tipo_cfg: dict, it: dict, hoy: str, plazo: int = 70) -> Record:
    ents = it["ents"]
    creador = join_list(ents.get("creador", []))
    generos = ents.get("genero", [])
    temas = ents.get("tema", [])
    rec = Record(
        categoria=tipo_cfg["categoria"], contenido_o_titulo=it["label"], fuente="wikidata",
        url_fuente=f"https://www.wikidata.org/wiki/{it['qid']}", url_externa=it["ws"] or it["article"],
        derechos="metadatos_obra_protegida", licencia="CC0 1.0 (metadatos de Wikidata)",
        atribucion="Datos: Wikidata (CC0 1.0)",
        restricciones="Solo metadatos y enlace; no incluye el texto de la obra.",
        autor_artista_creador=creador, anio=str(min(it["fechas"])) if it["fechas"] else "",
        idioma=it["lang"], genero=join_list(generos), tematica=join_list(temas),
        etiquetas=make_tags(list(generos) + list(temas)), descripcion=it["desc"],
        fecha_verificacion=hoy, id_externo=it["qid"],
    )
    # estado de derechos por fallecimiento (solo si hay un unico autor con fallecimiento conocido)
    if tipo_cfg.get("autor_con_fallecimiento"):
        if len(ents.get("creador", [])) == 1 and len(it["muertes"]) == 1 and public_domain_ar(it["muertes"][0], plazo):
            rec.derechos = "dominio_publico"
            rec.licencia = "Metadatos CC0 1.0; obra de autor con plazo vencido (AR)"
            rec.restricciones = AVISO_DOMINIO_PUBLICO_AR
            rec.extra["fallecimiento_autor"] = it["muertes"][0]
    if tipo == "pelicula" or tipo == "serie":
        pers = ents.get("personajes", [])[:8]
        if pers:
            rec.extra["personajes_relevantes"] = join_list(pers)
    if tipo == "serie":
        rec.extra["tipo"] = "documental" if any("document" in g.lower() for g in generos) else "sin_determinar"
    if tipo == "cancion":
        album = join_list(ents.get("album", []))
        if album:
            rec.extra["album"] = album
    if tipo == "personaje":
        obra = (ents.get("presente_en") or ents.get("universo") or ents.get("obra_de") or [""])[0]
        rec.obra = obra
        medios = [tipo_cfg.get("medio_por_clase", {}).get(c, "sin_determinar") for c in it["clases"]]
        medio = next((m for m in medios if m != "sin_determinar"), "sin_determinar")
        rec.extra["medio"] = medio
        rec.extra["naturaleza"] = "ficticio"
        rec.restricciones = "Personaje ficticio: solo metadatos y enlace; la obra de origen puede estar protegida."
    if tipo == "poema" and it["ws"]:
        rec.extra["wikisource"] = True
    return rec


class WikidataCollector(Collector):
    key = "wikidata"
    categorias = ("libro", "poema", "pelicula", "serie", "cancion", "personaje")

    def __init__(self, ctx, tipos=None):
        super().__init__(ctx)
        self.tipos = tipos

    def _run_query(self, query: str):
        data = self.http.get_json(ENDPOINT, params={"query": query, "format": "json"},
                                  headers={"Accept": "application/sparql-results+json"})
        return data["results"]["bindings"]

    def collect(self, max_records=None):
        cls_cfg = self.cfg.classes
        tipos = self.tipos or list(cls_cfg["tipos"].keys())
        plazo = int(self.cfg.settings["verificacion"]["plazo_autor_anios"])
        pagina = int(cls_cfg.get("tamano_pagina", 1000))
        emitidos = 0
        for tipo in tipos:
            tcfg = cls_cfg["tipos"][tipo]
            offset = 0
            while True:
                if tcfg["categoria"] in self.saltar:
                    break
                q = build_query(tcfg, cls_cfg, pagina, offset)
                try:
                    bindings = self._run_query(q)
                except HttpError as exc:
                    log.error("Wikidata fallo en %s offset %s: %s (reducí tamano_pagina o reintentá)", tipo, offset, exc)
                    break
                if not bindings:
                    break
                items = aggregate(bindings, tcfg)
                for it in items.values():
                    yield to_record(tipo, tcfg, it, self.ctx.hoy, plazo)
                    emitidos += 1
                    if max_records and emitidos >= max_records:
                        return
                # el LIMIT interno cuenta filas (item x clase): si hubo menos que 'pagina' es la ultima pagina
                n_base = len({(b["item"]["value"], b.get("class", {}).get("value", "")) for b in bindings})
                if n_base < pagina:
                    break
                offset += pagina


def build_wikiquote_seeds(ctx, out_path: Path, max_autores: int | None = None) -> int:
    """Genera la lista de autores (con fallecimiento y lengua materna) que tienen pagina en es.wikiquote."""
    from datetime import date
    plazo = int(ctx.cfg.settings["verificacion"]["plazo_autor_anios"])
    corte = date.today().year - plazo - 1
    cls_cfg = ctx.cfg.classes["wikiquote"]
    pagina, offset, total = 1000, 0, 0
    out_path.parent.mkdir(parents=True, exist_ok=True)
    http = ctx.http
    with open(out_path, "w", encoding="utf-8", newline="") as fh:
        fh.write("titulo\tqid\tfallecimiento\tlengua_materna\tnombre\n")
        while True:
            q = f"""SELECT ?person ?personLabel ?death ?lang ?title WHERE {{
  {{ SELECT ?person ?title ?death WHERE {{
      ?person wdt:P31 wd:Q5 ; wdt:P570 ?death .
      ?article schema:about ?person ; schema:isPartOf <{cls_cfg['sitio']}> ; schema:name ?title .
      FILTER(YEAR(?death) <= {corte})
    }} ORDER BY ?person LIMIT {pagina} OFFSET {offset} }}
  OPTIONAL {{ ?person wdt:P103 ?nl . ?nl wdt:P424 ?lang . }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "es,en". }}
}}"""
            data = http.get_json(ENDPOINT, params={"query": q, "format": "json"},
                                 headers={"Accept": "application/sparql-results+json"})
            rows = data["results"]["bindings"]
            if not rows:
                break
            vistos = {}
            for b in rows:
                qid = _val(b, "person").rsplit("/", 1)[-1]
                m = YEAR_RE.match(_val(b, "death"))
                if not QID_RE.match(qid) or not m:
                    continue
                v = vistos.setdefault(qid, {"titulo": _val(b, "title"), "muerte": int(m.group(1)), "langs": [],
                                            "nombre": _val(b, "personLabel")})
                lang = _val(b, "lang")
                if lang and lang not in v["langs"]:
                    v["langs"].append(lang)
            for qid, v in vistos.items():
                fh.write(f"{v['titulo']}\t{qid}\t{v['muerte']}\t{'|'.join(v['langs'])}\t{v['nombre']}\n")
                total += 1
                if max_autores and total >= max_autores:
                    return total
            if len(rows) < pagina:
                break
            offset += pagina
    return total
