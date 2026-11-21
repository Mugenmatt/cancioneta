"""Linea de comandos: python run.py <comando>."""
from __future__ import annotations

import argparse
import csv
import json
import logging
import sys
from pathlib import Path

from . import checks, export as exp, report as rep
from .collectors import Context
from .collectors.commons import CommonsCollector
from .collectors.gutendex import GutendexCollector
from .collectors.manual import ManualCollector
from .collectors.musicbrainz import MusicBrainzCollector
from .collectors.openlibrary import OpenLibraryCollector
from .collectors.prompts_local import PromptsCollector
from .collectors.wikidata import WikidataCollector, build_wikiquote_seeds
from .collectors.wikiquote import WikiquoteCollector
from .config import Config, PLACEHOLDER_CONTACTO
from .http import HttpClient
from .runner import run_collector
from .schema import CATEGORIAS, INPUT_FIELDS
from .store import Store

RED = {"wikidata": WikidataCollector, "openlibrary": OpenLibraryCollector, "gutendex": GutendexCollector,
       "musicbrainz": MusicBrainzCollector, "commons": CommonsCollector, "wikiquote": WikiquoteCollector}
LOCAL = {"prompts": PromptsCollector, "manual": ManualCollector}
ORDEN_ALL = ["wikidata", "openlibrary", "gutendex", "musicbrainz", "commons", "wikiquote", "prompts"]
EXTRA_PLANTILLA = {"cita": ["extra_tipo_cita", "extra_sin_texto"], "guion": ["extra_tipo", "extra_sin_texto"],
                   "personaje": ["extra_medio", "extra_naturaleza", "extra_rasgos"]}


def _setup_logging(cfg: Config):
    logdir = cfg.path("logs")
    logdir.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s",
                        handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler(logdir / "cdb.log", encoding="utf-8")])


def _http(cfg: Config) -> HttpClient:
    h = cfg.settings["http"]
    return HttpClient(cfg.user_agent, cfg.path("cache"), h.get("intervalo_por_host"), h.get("cache_ttl_dias", 30),
                      h.get("timeout_segundos", 60), h.get("reintentos", 5))


def _require_contact(cfg: Config):
    if not cfg.contacto_configurado():
        print(f"ERROR: completa 'contacto' en config/settings.yaml (hoy dice {PLACEHOLDER_CONTACTO}). "
              "Wikimedia, MusicBrainz y Open Library exigen un User-Agent con contacto real.")
        sys.exit(2)


def cmd_init(cfg, args):
    for k in cfg.settings["rutas"]:
        carpeta = cfg.path(k).parent if k == "db" else cfg.path(k)  # "db" es un archivo
        carpeta.mkdir(parents=True, exist_ok=True)
    store = Store(cfg.path("db"))
    store.close()
    for cat in CATEGORIAS:
        p = cfg.path("manual") / f"plantilla_{cat}.csv"
        if not p.exists():
            with open(p, "w", encoding="utf-8-sig", newline="") as fh:
                csv.writer(fh).writerow(INPUT_FIELDS + EXTRA_PLANTILLA.get(cat, []))
    print("Proyecto inicializado. Base de datos:", cfg.path("db"))
    print("Plantillas de carga manual en:", cfg.path("manual"))
    if not cfg.contacto_configurado():
        print("PENDIENTE: completa 'contacto' en config/settings.yaml antes de usar colectores de red.")


def cmd_doctor(cfg, args):
    _require_contact(cfg)
    http = _http(cfg)
    qids = set()
    for t in cfg.classes["tipos"].values():
        qids.update(t["clases"])
        qids.update((t.get("medio_por_clase") or {}).keys())
    qids = sorted(qids)
    print("Verificacion de QIDs configurados (confirma que cada uno es la clase que esperas):\n")
    for i in range(0, len(qids), 50):
        chunk = qids[i:i + 50]
        data = http.get_json("https://www.wikidata.org/w/api.php", params={
            "action": "wbgetentities", "ids": "|".join(chunk), "props": "labels|descriptions",
            "languages": "es|en", "format": "json"})
        for q in chunk:
            e = data.get("entities", {}).get(q, {})
            lab = (e.get("labels", {}).get("es") or e.get("labels", {}).get("en") or {}).get("value", "??? (no existe)")
            des = (e.get("descriptions", {}).get("es") or e.get("descriptions", {}).get("en") or {}).get("value", "")
            print(f"  {q:<10} {lab}  -  {des}")
    print("\nConfirma las licencias vigentes de cada fuente ANTES de publicar:")
    for k, f in cfg.sources.items():
        if f.get("verificar_en"):
            print(f"  {k:<18} {f['verificar_en']}")


def _make_collector(nombre, cfg, http, tipos=None, ruta=None):
    ctx = Context(cfg, http)
    if nombre == "wikidata":
        return WikidataCollector(ctx, tipos)
    if nombre == "manual":
        return ManualCollector(ctx, ruta)
    return {**RED, **LOCAL}[nombre](ctx)


def cmd_collect(cfg, args):
    nombres = ORDEN_ALL if args.fuente == "all" else [args.fuente]
    if any(n in RED for n in nombres):
        _require_contact(cfg)
    http = _http(cfg)
    store = Store(cfg.path("db"))
    tipos = args.tipos.split(",") if args.tipos else None
    for n in nombres:
        if n not in RED and n not in LOCAL:
            print(f"Fuente desconocida: {n}. Opciones: {', '.join(list(RED) + list(LOCAL))}, all")
            sys.exit(2)
        col = _make_collector(n, cfg, http, tipos)
        res = run_collector(store, col, cfg, args.max, aplicar_topes=not args.sin_tope)
        print(f"[{n}] {json.dumps(res, ensure_ascii=False)}")
    store.close()


def cmd_add(cfg, args):
    http = _http(cfg)
    store = Store(cfg.path("db"))
    col = ManualCollector(Context(cfg, http), args.archivo)
    res = run_collector(store, col, cfg, None, aplicar_topes=False)
    print(json.dumps(res, ensure_ascii=False, indent=2))
    store.close()


def cmd_seeds(cfg, args):
    _require_contact(cfg)
    ctx = Context(cfg, _http(cfg))
    out = cfg.path("seeds") / "wikiquote_autores.tsv"
    n = build_wikiquote_seeds(ctx, out, args.max)
    print(f"{n} autores escritos en {out}")


def cmd_revalidate(cfg, args):
    store = Store(cfg.path("db"))
    print(store.revalidate_all(store.start_run("revalidate")))
    store.close()


def cmd_neardups(cfg, args):
    store = Store(cfg.path("db"))
    d = cfg.settings["duplicados_cercanos"]
    pares = checks.find_near_duplicates(store, d["categorias"], float(d["umbral_jaccard"]))
    out = cfg.path("exports") / "duplicados_cercanos.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["categoria", "id_a", "id_b", "similitud", "texto_a", "texto_b"])
        w.writeheader()
        w.writerows(pares)
    print(f"{len(pares)} pares casi duplicados. Detalle en {out}")
    if args.aplicar:
        print("Marcados como pendientes:", checks.apply_near_duplicates(store, pares))
    store.close()


def cmd_links(cfg, args):
    _require_contact(cfg)
    store = Store(cfg.path("db"))
    v = cfg.settings["verificacion"]
    muestra = args.muestra if args.muestra is not None else v.get("enlace_muestra_por_defecto", 500)
    print(json.dumps(checks.check_links(store, _http(cfg), v.get("enlace_ttl_dias", 30), muestra, args.todos),
                     ensure_ascii=False, indent=2))
    store.close()


def cmd_report(cfg, args):
    store = Store(cfg.path("db"))
    info = rep.gather(store, cfg)
    print(rep.to_markdown(info))
    store.close()


def cmd_export(cfg, args):
    store = Store(cfg.path("db"))
    print(json.dumps(exp.export_all(store, cfg, csv_bom=args.csv_bom), ensure_ascii=False, indent=2))
    store.close()


def main(argv=None, root=None):
    cfg = Config(root)
    p = argparse.ArgumentParser(prog="run.py", description="Pipeline de la base cultural")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init", help="crea carpetas, base de datos y plantillas").set_defaults(f=cmd_init)
    sub.add_parser("doctor", help="verifica QIDs de Wikidata y muestra donde confirmar licencias").set_defaults(f=cmd_doctor)
    c = sub.add_parser("collect", help="ejecuta un colector (o all)")
    c.add_argument("fuente", help="wikidata|openlibrary|gutendex|musicbrainz|commons|wikiquote|prompts|manual|all")
    c.add_argument("--max", type=int, default=None, help="maximo de registros a procesar (para pruebas)")
    c.add_argument("--tipos", default=None, help="solo wikidata: libro,poema,pelicula,serie,cancion,personaje")
    c.add_argument("--sin-tope", action="store_true", help="ignora el tope por categoria")
    c.set_defaults(f=cmd_collect)
    a = sub.add_parser("add", help="incorpora un CSV/JSONL manual sin duplicar")
    a.add_argument("archivo")
    a.set_defaults(f=cmd_add)
    s = sub.add_parser("seeds-wikiquote", help="genera la lista de autores para citas")
    s.add_argument("--max", type=int, default=None)
    s.set_defaults(f=cmd_seeds)
    sub.add_parser("revalidate", help="reaplica las reglas actuales a todo lo guardado").set_defaults(f=cmd_revalidate)
    n = sub.add_parser("near-dups", help="detecta prompts/citas casi iguales")
    n.add_argument("--aplicar", action="store_true", help="marca el segundo de cada par como pendiente")
    n.set_defaults(f=cmd_neardups)
    l = sub.add_parser("check-links", help="comprueba enlaces (muestra por defecto)")
    l.add_argument("--muestra", type=int, default=None)
    l.add_argument("--todos", action="store_true")
    l.set_defaults(f=cmd_links)
    sub.add_parser("report", help="muestra el informe de cantidades").set_defaults(f=cmd_report)
    e = sub.add_parser("export", help="genera Excel, CSV e informes")
    e.add_argument("--csv-bom", action="store_true", help="CSV con BOM (para abrirlo en Excel)")
    e.set_defaults(f=cmd_export)
    args = p.parse_args(argv)
    _setup_logging(cfg)
    args.f(cfg, args)


if __name__ == "__main__":
    main()
