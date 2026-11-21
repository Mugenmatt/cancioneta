"""Base comun de los colectores."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from ..config import Config
from ..http import HttpClient


@dataclass
class Context:
    cfg: Config
    http: HttpClient
    hoy: str = ""

    def __post_init__(self):
        if not self.hoy:
            self.hoy = date.today().isoformat()


class Collector:
    key = ""
    categorias: tuple = ()

    def __init__(self, ctx: Context):
        self.ctx = ctx
        self.cfg = ctx.cfg
        self.http = ctx.http
        self.saltar: set = set()  # categorias que el runner ya considera completas

    def source_info(self) -> dict:
        return self.cfg.sources.get(self.key, {})

    def collect(self, max_records=None):
        """Generador de Record. Cada colector lo implementa."""
        raise NotImplementedError
