"""Exportacion: Excel (14 hojas + PENDIENTES), CSV, informes y registro de cambios entre exportaciones."""
from __future__ import annotations

import csv
import json
import re
import shutil
from datetime import datetime

from openpyxl import Workbook
from openpyxl.cell import WriteOnlyCell
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.utils.indexed_list import IndexedList

from . import report as rep
from .licensing import DERECHOS
from .schema import CATEGORIAS, HOJAS, MASTER_COLUMNS, category_columns

FUENTE_NOMBRE = "Arial"
HDR_FONT = Font(name=FUENTE_NOMBRE, size=10, bold=True, color="FFFFFF")
HDR_FILL = PatternFill("solid", start_color="1F3864")
BOLD = Font(name=FUENTE_NOMBRE, size=10, bold=True)
TITULO = Font(name=FUENTE_NOMBRE, size=14, bold=True)
INT_RE = re.compile(r"^-?\d{1,4}$")
ANCHOS = {"id": 18, "categoria": 12, "contenido_o_titulo": 48, "titulo": 44, "cita": 60, "prompt": 70,
          "descripcion": 50, "url_fuente": 40, "url_externa": 40, "atribucion": 40, "restricciones": 40,
          "clave_deduplicacion": 40, "extra_json": 30}


def _clean(v):
    if v is None:
        return ""
    if isinstance(v, (int, float)):
        return v
    s = ILLEGAL_CHARACTERS_RE.sub("", str(v))
    return s[:32000]


def _cell(ws, v, anio=False):
    v = _clean(v)
    if anio and isinstance(v, str) and INT_RE.match(v):
        return int(v)
    if isinstance(v, str) and v[:1] in ("=", "+", "-", "@"):
        c = WriteOnlyCell(ws, value=v)
        c.data_type = "s"  # texto literal: nunca se interpreta como formula
        return c
    return v


def _new_workbook() -> Workbook:
    wb = Workbook(write_only=True)
    wb._fonts = IndexedList([Font(name=FUENTE_NOMBRE, size=10, family=2)])  # fuente base Arial 10
    return wb


def _header(ws, headers):
    cells = []
    for h in headers:
        c = WriteOnlyCell(ws, value=h)
        c.font, c.fill = HDR_FONT, HDR_FILL
        c.alignment = Alignment(vertical="center")
        cells.append(c)
    return cells


def _sheet(wb, nombre, headers, filas, anio_idx=(), anchos=None):
    ws = wb.create_sheet(nombre)
    for i, h in enumerate(headers, 1):
        ws.column_dimensions[get_column_letter(i)].width = (anchos or {}).get(h, 18)
    ws.freeze_panes = "A2"
    ws.append(_header(ws, headers))
    n = 0
    for fila in filas:
        ws.append([_cell(ws, v, anio=(i in anio_idx)) for i, v in enumerate(fila)])
        n += 1
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{n + 1}"
    return n


def _texto_sheet(wb, nombre, lineas, ancho=110):
    ws = wb.create_sheet(nombre)
    ws.column_dimensions["A"].width = ancho
    for i, (txt, estilo) in enumerate(lineas):
        c = WriteOnlyCell(ws, value=_clean(txt))
        c.alignment = Alignment(wrap_text=True, vertical="top")
        if estilo == "t":
            c.font = TITULO
        elif estilo == "b":
            c.font = BOLD
        ws.append([c])


def _master_row(row, extra_map, juegos, uso):
    d = dict(row)
    cat = d["categoria"]
    st = d.pop("link_status", None)
    if st is None:
        d["enlace_verificado"] = "sin_comprobar"
    elif 200 <= st < 400:
        d["enlace_verificado"] = "ok"
    elif st in (404, 410):
        d["enlace_verificado"] = "roto"
    else:
        d["enlace_verificado"] = "inconcluso"
    d["uso_recomendado"] = uso.get(cat, "")
    d["juegos_compatibles"] = "|".join(juegos.get(cat, []))
    return d


def _fetch(store, estado, categoria=None):
    sql = ("SELECT r.*, l.status AS link_status FROM records r LEFT JOIN link_checks l ON l.url = r.url_fuente "
           "WHERE r.estado_verificacion=?")
    p = [estado]
    if categoria:
        sql += " AND r.categoria=?"
        p.append(categoria)
    sql += " ORDER BY r.categoria, r.id"
    return store.db.execute(sql, p)


def _value(d, src):
    if src.startswith("extra:"):
        try:
            return json.loads(d.get("extra_json") or "{}").get(src[6:], "")
        except ValueError:
            return ""
    return d.get(src, "")


README_LINEAS = [
    ("CulturaDB - Base cultural para la app de composicion de canciones", "t"),
    ("", ""),
    ("QUE ES ESTE ARCHIVO", "b"),
    ("Tabla de estimulos creativos (libros, peliculas, series, canciones, poemas, citas, guiones, personajes, prompts "
     "originales e imagenes) generada por un pipeline reproducible a partir de fuentes abiertas. Cada fila conserva su "
     "origen, su estado de derechos y su licencia.", ""),
    ("", ""),
    ("COMO USARLO", "b"),
    ("1) CATALOGO es la tabla maestra (solo registros VERIFICADOS). Las hojas por categoria son vistas con columnas propias.", ""),
    ("2) La app debe importar CATALOGO.csv (misma tabla maestra, UTF-8). La clave estable de cada registro es 'id'.", ""),
    ("3) 'derechos' indica que se puede hacer con el registro; consultar 'licencia', 'atribucion' y 'restricciones'.", ""),
    ("4) PENDIENTES lista lo que NO cuenta como valido (derechos sin resolver, enlace roto, casi duplicado).", ""),
    ("5) Las listas multiples usan ' | ' en campos legibles y '|' en 'etiquetas' y 'juegos_compatibles'.", ""),
    ("", ""),
    ("REGLAS DE DERECHOS", "b"),
    ("- Solo se guarda TEXTO (citas, frases, texto breve) cuando 'derechos' es dominio_publico, licencia_abierta, "
     "autorizacion_expresa u original.", ""),
    ("- Para obras protegidas se guardan unicamente metadatos y un enlace a la fuente. No hay letras ni dialogos protegidos.", ""),
    ("- El dominio publico se calcula por vida del autor + 70 anios (Ley 11.723, Argentina) y debe confirmarse con "
     "asesoria legal (traducciones, obras postumas, dominio publico pagante, otras jurisdicciones).", ""),
    ("- Las imagenes conservan autor, licencia y atribucion; respetar la atribucion al mostrarlas.", ""),
    ("", ""),
    ("LIMITES CONOCIDOS", "b"),
    ("- 'idioma' es el idioma de la etiqueta/titulo en la fuente, no necesariamente el idioma original de la obra.", ""),
    ("- 'fecha_verificacion' es la fecha en que el pipeline valido el registro contra su fuente.", ""),
    ("- 'enlace_verificado' = sin_comprobar hasta ejecutar el comando check-links.", ""),
    ("- 'juegos_compatibles' queda vacio hasta completar config/juegos_map.yaml.", ""),
]


def export_all(store, cfg, hoy: str | None = None, csv_bom: bool = False, solo_enlace_no_roto: bool = True) -> dict:
    ahora = datetime.now()
    export_id = ahora.strftime("%Y%m%d_%H%M%S")
    carpeta = cfg.path("exports") / export_id
    carpeta.mkdir(parents=True, exist_ok=True)
    juegos = (cfg.juegos or {}).get("juegos_por_categoria", {})
    uso = (cfg.juegos or {}).get("uso_recomendado", {})
    info = rep.gather(store, cfg)
    max_filas = int(cfg.settings.get("exportacion", {}).get("max_filas_por_hoja", 1000000))
    if info["total_verificados"] >= max_filas:
        raise RuntimeError("Demasiadas filas para una hoja de Excel; usar solo el CSV.")

    # --- datos verificados en memoria (30 mil filas caben sin problema) ---
    verificados = [_master_row(r, None, juegos, uso) for r in _fetch(store, "verificado")]
    pendientes = [_master_row(r, None, juegos, uso) for r in _fetch(store, "pendiente")]

    wb = _new_workbook()
    _texto_sheet(wb, "README", README_LINEAS)

    # RESUMEN
    ws = wb.create_sheet("RESUMEN")
    for i, w in enumerate([22, 16, 14, 14, 14, 18, 14], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    c = WriteOnlyCell(ws, value=f"Resumen de cantidades - generado {info['fecha']}")
    c.font = TITULO
    ws.append([c])
    ws.append([f"Los numeros de esta hoja son valores calculados por el pipeline en el momento de exportar "
               f"(no se recalculan al editar el Excel)."])
    ws.append([])
    ws.append(_header(ws, ["categoria", "referencia", "verificados", "pendientes", "rechazados", "objetivo_ajustado",
                           "cobertura_ref_%"]))
    for cat, d in info["por_categoria"].items():
        cob = round(100 * d["verificados"] / d["referencia"], 1) if d["referencia"] else ""
        ws.append([cat, d["referencia"], d["verificados"], d["pendientes"], d["rechazados"], d["objetivo_ajustado"], cob])
    ws.append([])
    ws.append([_cell(ws, "TOTAL VALIDOS (verificados)"), info["total_objetivo"], info["total_verificados"]])
    ws.append(["Faltan para el objetivo", info["faltan_para_objetivo"]])
    ws.append([])
    ws.append(_header(ws, ["derechos (verificados)", "registros"]))
    for r in info["por_derechos"]:
        ws.append([r["derechos"], r["n"]])
    ws.append([])
    ws.append(_header(ws, ["fuente", "estado", "registros"]))
    for r in info["por_fuente"]:
        ws.append([r["fuente"], r["estado"], r["n"]])

    # CATALOGO
    filas = [[d.get(col, "") for col in MASTER_COLUMNS] for d in verificados]
    anio_idx = (MASTER_COLUMNS.index("anio"),)
    _sheet(wb, "CATALOGO", MASTER_COLUMNS, filas, anio_idx, ANCHOS)

    # hojas por categoria
    for cat in CATEGORIAS:
        cols = category_columns(cat)
        filas_c = [[_value(d, src) for _, src in cols] for d in verificados if d["categoria"] == cat]
        idx = tuple(i for i, (_, s) in enumerate(cols) if s == "anio")
        _sheet(wb, HOJAS[cat], [h for h, _ in cols], filas_c, idx, ANCHOS)

    # FUENTES_Y_LICENCIAS
    por = {}
    for r in info["por_fuente"]:
        por.setdefault(r["fuente"], {})[r["estado"]] = r["n"]
    filas_f = []
    for k, f in cfg.sources.items():
        filas_f.append([k, f.get("nombre", ""), f.get("url", ""), f.get("licencia_datos", ""), f.get("atribucion", ""),
                        f.get("verificar_en", ""), f.get("nota", ""), por.get(k, {}).get("verificado", 0),
                        por.get(k, {}).get("pendiente", 0)])
    filas_f.append([])
    for k, v in DERECHOS.items():
        filas_f.append([f"derechos:{k}", v])
    _sheet(wb, "FUENTES_Y_LICENCIAS", ["clave", "nombre", "url", "licencia_datos", "atribucion", "verificar_en", "nota",
                                       "verificados", "pendientes"], filas_f, (), {"nota": 50, "licencia_datos": 40})

    # PENDIENTES
    colp = ["id", "categoria", "contenido_o_titulo", "autor_artista_creador", "fuente", "url_fuente", "derechos",
            "motivos"]
    motivos = {r["id"]: r["motivos"] for r in store.db.execute(
        "SELECT id, motivos FROM records WHERE estado_verificacion='pendiente'")}
    filas_p = [[d.get(c, "") if c != "motivos" else motivos.get(d["id"], "") for c in colp] for d in pendientes[:50000]]
    _sheet(wb, "PENDIENTES", colp, filas_p, (), ANCHOS)

    xlsx = carpeta / "cultura_db.xlsx"
    wb.save(xlsx)

    # --- CSV ---
    enc = "utf-8-sig" if csv_bom else "utf-8"

    def _csv(nombre, headers, filas):
        with open(carpeta / nombre, "w", encoding=enc, newline="") as fh:
            w = csv.writer(fh)
            w.writerow(headers)
            w.writerows(filas)

    _csv("catalogo.csv", MASTER_COLUMNS, filas)
    _csv("pendientes.csv", colp, filas_p)
    _csv("rechazados.csv", ["categoria", "fuente", "motivo", "fecha", "payload_json"],
         [[r["categoria"], r["fuente"], r["motivo"], r["fecha"], r["payload_json"]] for r in
          store.db.execute("SELECT * FROM rejected ORDER BY categoria, motivo")])
    _csv("duplicados.csv", ["tipo", "clave", "id_existente", "fuente", "id_externo", "url_fuente", "fecha"],
         [[r["tipo"], r["clave"], r["id_existente"], r["fuente"], r["id_externo"], r["url_fuente"], r["fecha"]]
          for r in store.db.execute("SELECT * FROM duplicates ORDER BY tipo, clave")])

    # --- cambios respecto de la exportacion anterior ---
    actuales = {d["id"]: d for d in verificados}
    previa = store.db.execute("SELECT MAX(export_id) FROM exports").fetchone()[0]
    anteriores = set()
    if previa:
        anteriores = {r[0] for r in store.db.execute("SELECT id FROM exports WHERE export_id=?", (previa,))}
    agregados = sorted(set(actuales) - anteriores)
    eliminados = sorted(anteriores - set(actuales))
    titulos = {r["id"]: r["contenido_o_titulo"] for r in store.db.execute("SELECT id, contenido_o_titulo FROM records")}
    _csv("cambios.csv", ["cambio", "id", "contenido_o_titulo"],
         [["agregado", i, titulos.get(i, "")] for i in agregados] + [["retirado", i, titulos.get(i, "")] for i in eliminados])
    store.db.executemany("INSERT OR IGNORE INTO exports(export_id,id) VALUES (?,?)", [(export_id, i) for i in actuales])
    store.commit()

    # --- informes ---
    rep.write_reports(info, carpeta)
    fuentes_md = ["# Fuentes consultadas", ""]
    for k, f in cfg.sources.items():
        fuentes_md += [f"## {f.get('nombre', k)}", f"- URL: {f.get('url', '')}", f"- Licencia de los datos: {f.get('licencia_datos', '')}",
                       f"- Verificar licencia vigente en: {f.get('verificar_en', '')}", f"- Nota: {f.get('nota', '')}", ""]
    fuentes_md += ["## Corridas registradas", ""]
    for r in info["corridas"]:
        fuentes_md.append(f"- {r['run_id']} | {r['comando']} | {r['fuente']} | {r['resumen_json'] or ''}")
    (carpeta / "fuentes_consultadas.md").write_text("\n".join(fuentes_md) + "\n", encoding="utf-8")
    (carpeta / "README.md").write_text(
        "# Exportacion CulturaDB\n\n"
        "- `cultura_db.xlsx`: Excel con README, RESUMEN, CATALOGO, 10 hojas por categoria, FUENTES_Y_LICENCIAS y PENDIENTES.\n"
        "- `catalogo.csv`: tabla maestra (solo verificados) para importar en la app.\n"
        "- `pendientes.csv`, `rechazados.csv`, `duplicados.csv`: lo que NO cuenta como valido y por que.\n"
        "- `cambios.csv`: registros agregados o retirados desde la exportacion anterior.\n"
        "- `informe.md` / `informe.json`: cantidades, cobertura y licencias.\n"
        "- `fuentes_consultadas.md`: fuentes y corridas.\n", encoding="utf-8")

    ultimo = cfg.path("exports") / "ultimo"
    if ultimo.exists():
        shutil.rmtree(ultimo)
    shutil.copytree(carpeta, ultimo)
    return {"carpeta": str(carpeta), "verificados": len(verificados), "pendientes": len(pendientes),
            "agregados": len(agregados), "retirados": len(eliminados)}
