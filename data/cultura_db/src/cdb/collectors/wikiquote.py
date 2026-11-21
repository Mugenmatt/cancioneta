"""Colector Wikiquote (es). Solo citas con fuente anotada; derechos segun el autor.

Una cita queda 'dominio_publico' unicamente si el autor tiene fallecimiento conocido con plazo vencido (AR)
Y su lengua materna coincide con el idioma de la pagina (evita traducciones protegidas).
El resto se guarda como 'pendiente_verificacion' y no cuenta como registro valido.
"""
from __future__ import annotations

import csv
import hashlib
import logging
import re
from pathlib import Path

from ..http import HttpError
from ..licensing import AVISO_DOMINIO_PUBLICO_AR, public_domain_ar
from ..normalize import normalize_text
from ..schema import Record
from .base import Collector

log = logging.getLogger("cdb.wikiquote")
API = "https://es.wikiquote.org/w/api.php"
SECCION_EXCLUIDA = re.compile(r"sobre|atribuid|dudos|disputad|falsa|misattrib|enlaces|referencias|v[eé]ase|bibliograf|notas|"
                              r"proverbio|lema", re.IGNORECASE)
HEADING = re.compile(r"^(=+)\s*(.*?)\s*\1\s*$")


def clean_wiki(s: str) -> str:
    s = re.sub(r"<ref[^>]*>.*?</ref>", "", s, flags=re.S)
    s = re.sub(r"\{\{[^{}]*\}\}", "", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", s)
    s = re.sub(r"\[https?://\S+ ([^\]]+)\]", r"\1", s)
    s = re.sub(r"\[https?://\S+\]", "", s)
    s = s.replace("'''", "").replace("''", "")
    return re.sub(r"\s+", " ", s).strip()


def extract_quotes(wikitext: str) -> list[dict]:
    """Devuelve [{texto, fuente, seccion}] solo para citas con subitem de fuente en secciones validas."""
    out: list[dict] = []
    excluido_nivel = None
    seccion = ""
    actual = None

    def cerrar():
        nonlocal actual
        if actual and actual["subs"]:
            texto = actual["texto"].strip(" \"'«»“”")
            fuente = next((s for s in actual["subs"] if len(s) >= 6), "")
            if texto and fuente and "http" not in texto:
                out.append({"texto": texto, "fuente": fuente, "seccion": actual["seccion"]})
        actual = None

    for linea in wikitext.splitlines():
        m = HEADING.match(linea.strip())
        if m:
            cerrar()
            nivel, titulo = len(m.group(1)), clean_wiki(m.group(2))
            if excluido_nivel is not None and nivel <= excluido_nivel:
                excluido_nivel = None
            if excluido_nivel is None and SECCION_EXCLUIDA.search(titulo):
                excluido_nivel = nivel
            seccion = titulo
            continue
        if excluido_nivel is not None:
            continue
        if re.match(r"^\*\*(?!\*)", linea):
            if actual is not None:
                sub = clean_wiki(re.sub(r"^\*+\s*", "", linea))
                if sub:
                    actual["subs"].append(sub)
            continue
        if re.match(r"^\*(?!\*)", linea):
            cerrar()
            actual = {"texto": clean_wiki(re.sub(r"^\*\s*", "", linea)), "subs": [], "seccion": seccion}
            continue
    cerrar()
    return out


def read_seeds(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path, encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh, delimiter="\t"))


class WikiquoteCollector(Collector):
    key = "wikiquote"
    categorias = ("cita",)

    def collect(self, max_records=None):
        seeds = read_seeds(self.cfg.path("seeds") / "wikiquote_autores.tsv")
        if not seeds:
            log.error("No hay semillas. Ejecuta primero: python run.py seeds-wikiquote")
            return
        plazo = int(self.cfg.settings["verificacion"]["plazo_autor_anios"])
        idioma_pagina = self.cfg.classes["wikiquote"].get("idioma_pagina", "es")
        max_autor = int(self.cfg.queries.get("wikiquote", {}).get("max_por_autor", 40))
        emitidos = 0
        for s in seeds:
            try:
                data = self.http.get_json(API, params={"action": "parse", "page": s["titulo"], "prop": "wikitext",
                                                       "format": "json", "formatversion": 2, "redirects": 1})
            except HttpError as exc:
                log.warning("Wikiquote fallo para %s: %s", s["titulo"], exc)
                continue
            wikitext = (data.get("parse") or {}).get("wikitext")
            if not wikitext:
                continue
            fall = int(s["fallecimiento"]) if s.get("fallecimiento", "").lstrip("-").isdigit() else None
            langs = [x for x in (s.get("lengua_materna") or "").split("|") if x]
            pd = public_domain_ar(fall, plazo) and idioma_pagina in langs
            url = "https://es.wikiquote.org/wiki/" + s["titulo"].replace(" ", "_")
            for q in extract_quotes(wikitext)[:max_autor]:
                huella = hashlib.sha1(normalize_text(q["texto"]).encode("utf-8")).hexdigest()[:10]
                rec = Record(
                    categoria="cita", contenido_o_titulo=q["texto"], fuente="wikiquote", url_fuente=url,
                    autor_artista_creador=s.get("nombre") or s["titulo"], obra=q["fuente"], idioma=idioma_pagina,
                    derechos="dominio_publico" if pd else "pendiente_verificacion",
                    licencia=(f"Texto de autor fallecido en {fall} (plazo vencido, AR); compilacion Wikiquote CC BY-SA 4.0"
                              if pd else "Sin verificar: derechos de la cita no resueltos"),
                    atribucion=f"{s.get('nombre') or s['titulo']}, {q['fuente']}. Compilacion: Wikiquote (CC BY-SA), {url}",
                    restricciones=AVISO_DOMINIO_PUBLICO_AR if pd else "No reproducir hasta resolver derechos.",
                    fecha_verificacion=self.ctx.hoy, id_externo=f"{s['qid']}:{huella}")
                rec.extra["tipo_cita"] = "con_fuente_anotada"
                rec.extra["seccion"] = q["seccion"]
                yield rec
                emitidos += 1
                if max_records and emitidos >= max_records:
                    return
