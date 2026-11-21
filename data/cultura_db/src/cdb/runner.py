"""Ejecucion de colectores: ingesta con topes por categoria y estadisticas."""
from __future__ import annotations

import logging
from collections import Counter

log = logging.getLogger("cdb.runner")


def run_collector(store, collector, cfg, max_records=None, aplicar_topes=True) -> dict:
    run_id = store.start_run("collect", collector.key)
    por_resultado: Counter = Counter()
    por_categoria: dict = {}
    capped: set = set()
    n = 0
    try:
        for rec in collector.collect(max_records):
            n += 1
            cat = rec.categoria
            if aplicar_topes and collector.key != "manual" and cat in capped:
                por_resultado["omitido_por_tope"] += 1
            else:
                res = store.ingest(rec, run_id)
                por_resultado[res] += 1
                por_categoria.setdefault(cat, Counter())[res] += 1
            if n % 100 == 0:
                store.commit()
                if aplicar_topes and collector.key != "manual":
                    for c in set(por_categoria) | set(collector.categorias):
                        cap = cfg.cap_categoria(c)
                        if cap and store.count(c) >= cap:
                            capped.add(c)
                    collector.saltar = set(capped)
                    if collector.categorias and set(collector.categorias) <= capped:
                        log.info("Tope alcanzado para %s: se detiene el colector %s", collector.categorias, collector.key)
                        break
            if n % 1000 == 0:
                log.info("%s: %s registros procesados %s", collector.key, n, dict(por_resultado))
    finally:
        store.commit()
    resumen = {"procesados": n, "resultados": dict(por_resultado),
               "por_categoria": {c: dict(v) for c, v in por_categoria.items()}}
    store.finish_run(run_id, resumen)
    return resumen
