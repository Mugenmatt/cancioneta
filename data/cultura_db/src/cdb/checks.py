"""Comprobacion de enlaces (respetuosa, reanudable) y deteccion de casi-duplicados."""
from __future__ import annotations

import logging
import random
from datetime import datetime, timedelta, timezone

from .normalize import near_duplicates
from .store import ahora

log = logging.getLogger("cdb.checks")


def check_links(store, http, ttl_dias: int = 30, muestra: int | None = 500, todos: bool = False) -> dict:
    corte = (datetime.now(timezone.utc) - timedelta(days=ttl_dias)).isoformat(timespec="seconds")
    urls = [r[0] for r in store.db.execute(
        "SELECT DISTINCT url_fuente FROM records WHERE estado_verificacion IN ('verificado','pendiente') "
        "AND url_fuente != '' AND url_fuente NOT IN (SELECT url FROM link_checks WHERE checked_at > ?)", (corte,))]
    if not todos and muestra and len(urls) > muestra:
        urls = random.Random(42).sample(urls, muestra)
    estados: dict = {}
    for i, url in enumerate(urls, 1):
        st = http.status(url)
        store.db.execute("INSERT OR REPLACE INTO link_checks(url,status,checked_at) VALUES (?,?,?)", (url, st, ahora()))
        estados[st] = estados.get(st, 0) + 1
        if i % 50 == 0:
            store.commit()
            log.info("Enlaces comprobados: %s/%s", i, len(urls))
    store.commit()
    return {"comprobados": len(urls), "por_codigo": estados, **store.apply_link_results()}


def find_near_duplicates(store, categorias, umbral: float) -> list[dict]:
    out = []
    for cat in categorias:
        items = [(r["id"], r["contenido_o_titulo"]) for r in store.db.execute(
            "SELECT id, contenido_o_titulo FROM records WHERE categoria=? AND estado_verificacion='verificado' "
            "ORDER BY id", (cat,))]
        textos = dict(items)
        for a, b, sim in near_duplicates(items, umbral):
            out.append({"categoria": cat, "id_a": a, "id_b": b, "similitud": sim,
                        "texto_a": textos[a], "texto_b": textos[b]})
    return out


def apply_near_duplicates(store, pares: list[dict]) -> int:
    """Marca como pendiente el segundo registro de cada par (el de id mayor)."""
    n = 0
    for p in pares:
        cur = store.db.execute(
            "UPDATE records SET estado_verificacion='pendiente', motivos=? WHERE id=? AND estado_verificacion='verificado'",
            (f"casi_duplicado:{p['id_a']}", p["id_b"]))
        n += cur.rowcount
    store.commit()
    return n
