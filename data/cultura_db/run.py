"""Punto de entrada: python run.py <comando>"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from cdb.cli import main  # noqa: E402

for _s in (sys.stdout, sys.stderr):  # consolas de Windows: evitar errores con tildes
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

if __name__ == "__main__":
    main()
