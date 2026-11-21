"""Lee los lotes de prompts originales (data/prompts/*.jsonl)."""
from __future__ import annotations

import hashlib
import json
import logging

from ..normalize import normalize_text
from ..schema import Record, make_tags
from .base import Collector

log = logging.getLogger("cdb.prompts")


class PromptsCollector(Collector):
    key = "prompts_originales"
    categorias = ("prompt",)

    def collect(self, max_records=None):
        plan = set(self.cfg.targets.get("prompts_plan", {}).keys())
        emitidos = 0
        for path in sorted(self.cfg.path("prompts").glob("*.jsonl")):
            with open(path, encoding="utf-8") as fh:
                for n, linea in enumerate(fh, 1):
                    linea = linea.strip()
                    if not linea:
                        continue
                    try:
                        d = json.loads(linea)
                    except ValueError:
                        log.error("JSON invalido en %s linea %s", path.name, n)
                        continue
                    texto, tipo = (d.get("texto") or "").strip(), d.get("tipo", "")
                    if tipo not in plan:
                        log.error("Tipo '%s' fuera del plan en %s linea %s", tipo, path.name, n)
                        continue
                    huella = hashlib.sha1(normalize_text(texto).encode("utf-8")).hexdigest()[:16]
                    rec = Record(
                        categoria="prompt", contenido_o_titulo=texto, fuente="prompts_originales",
                        derechos="original", licencia="Original del proyecto", atribucion="Original",
                        idioma=d.get("idioma", "es"), tematica=d.get("tematica", ""),
                        etiquetas=make_tags(d.get("etiquetas", [])), fecha_verificacion=self.ctx.hoy,
                        id_externo=huella, restricciones="")
                    rec.extra["tipo_prompt"] = tipo
                    rec.extra["lote"] = path.stem
                    yield rec
                    emitidos += 1
                    if max_records and emitidos >= max_records:
                        return
