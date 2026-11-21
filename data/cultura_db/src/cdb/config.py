"""Carga de configuracion (YAML) y rutas del proyecto."""
from __future__ import annotations

from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
PLACEHOLDER_CONTACTO = "COMPLETAR_CON_TU_EMAIL"


def _load(path: Path) -> dict:
    with open(path, encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


class Config:
    def __init__(self, root: Path | None = None):
        self.root = Path(root) if root else ROOT
        cdir = self.root / "config"
        self.settings = _load(cdir / "settings.yaml")
        self.targets = _load(cdir / "targets.yaml")
        self.classes = _load(cdir / "wikidata_classes.yaml")
        self.sources = _load(cdir / "sources.yaml").get("fuentes", {})
        self.queries = _load(cdir / "queries.yaml")
        self.juegos = _load(cdir / "juegos_map.yaml")

    def path(self, key: str) -> Path:
        p = self.root / self.settings["rutas"][key]
        return p

    @property
    def user_agent(self) -> str:
        return f"{self.settings.get('proyecto', 'CulturaDB')}/1.0 ({self.settings.get('contacto', '')})"

    def contacto_configurado(self) -> bool:
        c = str(self.settings.get("contacto", "")).strip()
        return bool(c) and c != PLACEHOLDER_CONTACTO and ("@" in c or c.startswith("http"))

    def cap_categoria(self, categoria: str) -> int:
        ref = self.targets.get("distribucion_referencia", {}).get(categoria, 0)
        return int(ref * float(self.targets.get("factor_sobrecolecta", 1.3)))
