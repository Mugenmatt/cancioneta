"""Informes de cantidades, cobertura y plan de redistribucion."""
from __future__ import annotations

import json
from datetime import date

from .schema import CATEGORIAS


def redistribute(counts: dict, refs: dict, pesos: dict) -> dict:
    """Redistribuye el faltante de las categorias que no llegan a su referencia hacia las que tienen
    excedente verificado, segun pesos. Nunca asigna mas que el excedente disponible."""
    deficit = {c: max(0, refs.get(c, 0) - counts.get(c, 0)) for c in CATEGORIAS}
    excedente = {c: max(0, counts.get(c, 0) - refs.get(c, 0)) for c in CATEGORIAS}
    extra = {c: 0 for c in CATEGORIAS}
    restante = sum(deficit.values())
    elegibles = {c for c in CATEGORIAS if excedente[c] > 0 and pesos.get(c, 0) > 0}
    while restante > 0 and elegibles:
        peso_total = sum(pesos[c] for c in elegibles)
        asignado = 0
        for c in sorted(elegibles):
            cuota = min(int(restante * pesos[c] / peso_total), excedente[c] - extra[c])
            extra[c] += cuota
            asignado += cuota
        if asignado == 0:
            for c in sorted(elegibles, key=lambda k: -pesos[k]):
                if asignado >= restante:
                    break
                if excedente[c] - extra[c] > 0:
                    extra[c] += 1
                    asignado += 1
            if asignado == 0:
                break
        restante -= asignado
        elegibles = {c for c in elegibles if excedente[c] - extra[c] > 0}
    ajustado = {}
    for c in CATEGORIAS:
        ref = refs.get(c, 0)
        ajustado[c] = counts.get(c, 0) if deficit[c] > 0 else ref + extra[c]
    return {"deficit": deficit, "excedente": excedente, "extra_asignado": extra, "objetivo_ajustado": ajustado,
            "faltante_sin_cubrir": restante}


def gather(store, cfg) -> dict:
    db = store.db
    refs = cfg.targets.get("distribucion_referencia", {})
    q = lambda sql, p=(): [dict(r) for r in db.execute(sql, p).fetchall()]  # noqa: E731
    cnt = {est: {r["categoria"]: r["n"] for r in q(
        "SELECT categoria, COUNT(*) n FROM records WHERE estado_verificacion=? GROUP BY categoria", (est,))}
        for est in ("verificado", "pendiente")}
    rech = {r["categoria"]: r["n"] for r in q("SELECT categoria, COUNT(*) n FROM rejected GROUP BY categoria")}
    verificados = {c: cnt["verificado"].get(c, 0) for c in CATEGORIAS}
    plan = redistribute(verificados, refs, cfg.targets.get("pesos_redistribucion", {}))
    total_ver = sum(verificados.values())
    return {
        "fecha": date.today().isoformat(),
        "total_objetivo": cfg.targets.get("total_objetivo", 30000),
        "total_verificados": total_ver,
        "faltan_para_objetivo": max(0, cfg.targets.get("total_objetivo", 30000) - total_ver),
        "por_categoria": {c: {"referencia": refs.get(c, 0), "verificados": verificados[c],
                              "pendientes": cnt["pendiente"].get(c, 0), "rechazados": rech.get(c, 0),
                              "objetivo_ajustado": plan["objetivo_ajustado"][c]} for c in CATEGORIAS},
        "plan": plan,
        "por_derechos": q("SELECT derechos, COUNT(*) n FROM records WHERE estado_verificacion='verificado' "
                          "GROUP BY derechos ORDER BY n DESC"),
        "por_fuente": q("SELECT fuente, estado_verificacion estado, COUNT(*) n FROM records GROUP BY fuente, estado_verificacion "
                        "ORDER BY fuente"),
        "motivos_pendiente": q("SELECT motivos, COUNT(*) n FROM records WHERE estado_verificacion='pendiente' "
                               "GROUP BY motivos ORDER BY n DESC LIMIT 15"),
        "motivos_rechazo": q("SELECT motivo, COUNT(*) n FROM rejected GROUP BY motivo ORDER BY n DESC LIMIT 15"),
        "duplicados": q("SELECT tipo, COUNT(*) n FROM duplicates GROUP BY tipo"),
        "enlaces": q("SELECT CASE WHEN status BETWEEN 200 AND 399 THEN 'ok' WHEN status IN (404,410) THEN 'roto' "
                     "ELSE 'inconcluso' END estado, COUNT(*) n FROM link_checks GROUP BY 1"),
        "corridas": q("SELECT run_id, comando, fuente, resumen_json FROM runs ORDER BY run_id DESC LIMIT 30"),
    }


def to_markdown(info: dict) -> str:
    L = [f"# Informe de cantidades, cobertura y licencias ({info['fecha']})", "",
         f"**Registros validos (verificados): {info['total_verificados']:,} de {info['total_objetivo']:,}** "
         f"(faltan {info['faltan_para_objetivo']:,}).", "",
         "Los pendientes y rechazados NO cuentan dentro del total.", "",
         "## Por categoria", "", "| Categoria | Referencia | Verificados | Pendientes | Rechazados | Objetivo ajustado |",
         "|---|---:|---:|---:|---:|---:|"]
    for c, d in info["por_categoria"].items():
        L.append(f"| {c} | {d['referencia']:,} | {d['verificados']:,} | {d['pendientes']:,} | {d['rechazados']:,} | "
                 f"{d['objetivo_ajustado']:,} |")
    p = info["plan"]
    L += ["", "## Redistribucion", "",
          f"Faltante total respecto de las referencias: {sum(p['deficit'].values()):,}. "
          f"Cubierto con excedente de otras categorias: {sum(p['extra_asignado'].values()):,}. "
          f"**Sin cubrir: {p['faltante_sin_cubrir']:,}.**", ""]
    for c in CATEGORIAS:
        if p["deficit"][c]:
            L.append(f"- {c}: faltan {p['deficit'][c]:,} para su referencia")
        if p["extra_asignado"][c]:
            L.append(f"- {c}: puede crecer +{p['extra_asignado'][c]:,} (hay excedente verificado)")
    L += ["", "## Por estado de derechos (verificados)", "", "| Derechos | Registros |", "|---|---:|"]
    L += [f"| {r['derechos']} | {r['n']:,} |" for r in info["por_derechos"]]
    L += ["", "## Duplicados detectados", ""] + ([f"- {r['tipo']}: {r['n']:,}" for r in info["duplicados"]] or ["- ninguno"])
    L += ["", "## Enlaces comprobados", ""] + ([f"- {r['estado']}: {r['n']:,}" for r in info["enlaces"]] or
                                               ["- todavia no se ejecuto check-links"])
    L += ["", "## Principales motivos de pendiente", ""] + (
        [f"- {r['motivos']}: {r['n']:,}" for r in info["motivos_pendiente"]] or ["- ninguno"])
    L += ["", "## Principales motivos de rechazo", ""] + (
        [f"- {r['motivo']}: {r['n']:,}" for r in info["motivos_rechazo"]] or ["- ninguno"])
    return "\n".join(L) + "\n"


def write_reports(info: dict, folder) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "informe.json").write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding="utf-8")
    (folder / "informe.md").write_text(to_markdown(info), encoding="utf-8")
