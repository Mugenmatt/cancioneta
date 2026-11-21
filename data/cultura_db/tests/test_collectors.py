"""Pruebas de colectores, cliente HTTP y exportacion con respuestas SIMULADAS (no son datos del proyecto)."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path

import requests
from openpyxl import load_workbook

from cdb.collectors import Context
from cdb.collectors.commons import CommonsCollector
from cdb.collectors.gutendex import GutendexCollector, invert_name
from cdb.collectors.manual import ManualCollector
from cdb.collectors.musicbrainz import MusicBrainzCollector
from cdb.collectors.openlibrary import OpenLibraryCollector
from cdb.collectors.prompts_local import PromptsCollector
from cdb.collectors.wikidata import WikidataCollector, aggregate, build_query, to_record
from cdb.collectors.wikiquote import extract_quotes
from cdb.config import Config, ROOT
from cdb.export import export_all
from cdb.http import HttpClient, HttpError
from cdb.runner import run_collector
from cdb.schema import Record, category_columns, CATEGORIAS
from cdb.store import Store


class FakeResp:
    def __init__(self, status=200, data=None, headers=None):
        self.status_code, self._data, self.headers = status, data, headers or {}

    def json(self):
        return self._data

    def close(self):
        pass


class FakeSession:
    def __init__(self, respuestas):
        self.respuestas = list(respuestas)
        self.llamadas = []

    def get(self, url, params=None, headers=None, timeout=None, **kw):
        self.llamadas.append((url, params))
        r = self.respuestas.pop(0) if len(self.respuestas) > 1 else self.respuestas[0]
        if isinstance(r, Exception):
            raise r
        return r

    head = get


def tmp_project():
    d = Path(tempfile.mkdtemp())
    shutil.copytree(ROOT / "config", d / "config")
    for k in ("db", "cache", "exports", "logs", "prompts", "manual", "seeds"):
        (d / "data" / k).mkdir(parents=True, exist_ok=True)
    return d


def make_ctx(root, respuestas):
    cfg = Config(root)
    http = HttpClient("test/1.0 (a@b.c)", root / "data" / "cache", {"default": 0}, session=FakeSession(respuestas),
                      sleep=lambda s: None)
    return Context(cfg, http, "2026-01-01"), cfg, http


class HttpTests(unittest.TestCase):
    def test_reintento_y_cache(self):
        d = tmp_project()
        ses = FakeSession([FakeResp(503), FakeResp(200, {"ok": 1})])
        h = HttpClient("t/1 (a@b.c)", d / "c", {"default": 0}, session=ses, sleep=lambda s: None)
        self.assertEqual(h.get_json("https://x.org/a", {"q": 1}), {"ok": 1})
        self.assertEqual(len(ses.llamadas), 2)
        self.assertEqual(h.get_json("https://x.org/a", {"q": 1}), {"ok": 1})   # desde cache
        self.assertEqual(len(ses.llamadas), 2)

    def test_404_levanta(self):
        d = tmp_project()
        h = HttpClient("t/1 (a@b.c)", d / "c", {"default": 0}, session=FakeSession([FakeResp(404)]), sleep=lambda s: None)
        with self.assertRaises(HttpError):
            h.get_json("https://x.org/b")

    def test_error_red(self):
        d = tmp_project()
        h = HttpClient("t/1 (a@b.c)", d / "c", {"default": 0}, reintentos=2,
                       session=FakeSession([requests.ConnectionError("x")]), sleep=lambda s: None)
        with self.assertRaises(HttpError):
            h.get_json("https://x.org/c")


class WikidataTests(unittest.TestCase):
    def test_query_y_registro(self):
        cfg = Config(ROOT)
        q = build_query(cfg.classes["tipos"]["libro"], cfg.classes, 10, 0)
        self.assertIn("wd:Q8261", q)
        self.assertIn("LIMIT 10 OFFSET 0", q)
        self.assertIn("wdt:P50/wdt:P570", q)
        b = lambda **kw: {k: {"value": v} for k, v in kw.items()}  # noqa: E731
        filas = [
            {**b(item="http://www.wikidata.org/entity/Q1", class_="x", article="https://es.wikipedia.org/wiki/Prueba",
                 creadorLabel="Autor Uno", fecha="1930-01-01T00:00:00Z", muerte="1950-05-05T00:00:00Z"),
             "itemLabel": {"value": "Obra de prueba", "xml:lang": "es"}, "class": {"value": "http://www.wikidata.org/entity/Q8261"},
             "generoLabel": {"value": "novela"}},
            {"item": {"value": "http://www.wikidata.org/entity/Q1"}, "itemLabel": {"value": "Obra de prueba", "xml:lang": "es"},
             "generoLabel": {"value": "ciencia ficcion"}, "creadorLabel": {"value": "Autor Uno"}},
            {"item": {"value": "http://www.wikidata.org/entity/Q2"}, "itemLabel": {"value": "Q2"}},   # sin etiqueta
        ]
        items = aggregate(filas, cfg.classes["tipos"]["libro"])
        r = to_record("libro", cfg.classes["tipos"]["libro"], items["Q1"], "2026-01-01")
        r.finalize()
        self.assertEqual(r.anio, "1930")
        self.assertEqual(r.derechos, "dominio_publico")          # autor fallecido 1950 -> plazo vencido
        self.assertEqual(r.genero, "novela | ciencia ficcion")
        self.assertEqual(r.idioma, "es")
        self.assertEqual(r.id_externo, "Q1")
        r2 = to_record("libro", cfg.classes["tipos"]["libro"], items["Q2"], "2026-01-01")
        s = Store(":memory:")
        self.assertEqual(s.ingest(r2, "R"), "rechazado")

    def test_paginacion(self):
        d = tmp_project()
        pag1 = {"results": {"bindings": [
            {"item": {"value": f"http://www.wikidata.org/entity/Q{i}"}, "itemLabel": {"value": f"Obra {i}", "xml:lang": "es"},
             "class": {"value": "http://www.wikidata.org/entity/Q8261"}, "creadorLabel": {"value": "Autor"},
             "article": {"value": "https://es.wikipedia.org/wiki/x"}} for i in range(1, 4)]}}
        vacia = {"results": {"bindings": []}}
        ctx, cfg, http = make_ctx(d, [FakeResp(200, pag1), FakeResp(200, vacia)])
        cfg.classes["tamano_pagina"] = 3
        col = WikidataCollector(ctx, ["libro"])
        recs = list(col.collect())
        self.assertEqual(len(recs), 3)


class OtrosColectoresTests(unittest.TestCase):
    def test_openlibrary(self):
        d = tmp_project()
        data = {"docs": [{"key": "/works/OL1W", "title": "Libro Uno", "author_name": ["Autora X"],
                          "first_publish_year": 1999, "subject": ["amor", "mar"], "language": ["spa"]},
                         {"key": "/works/OL2W", "title": "", "author_name": ["Z"]}]}
        ctx, cfg, _ = make_ctx(d, [FakeResp(200, data), FakeResp(200, {"docs": []})])
        cfg.queries["openlibrary"] = [{"q": "x", "paginas": 2}]
        recs = list(OpenLibraryCollector(ctx).collect())
        self.assertEqual(len(recs), 1)
        self.assertEqual(recs[0].idioma, "es")
        self.assertEqual(recs[0].url_fuente, "https://openlibrary.org/works/OL1W")

    def test_gutendex(self):
        self.assertEqual(invert_name("Cervantes Saavedra, Miguel de"), "Miguel de Cervantes Saavedra")
        d = tmp_project()
        data = {"results": [{"id": 5, "title": "Obra vieja", "authors": [{"name": "Apellido, Nombre", "birth_year": 1800, "death_year": 1860}],
                             "subjects": ["Poetry -- Spanish"], "languages": ["es"], "bookshelves": [], "media_type": "Text"},
                            {"id": 6, "title": "Obra reciente", "authors": [{"name": "Otro, Autor", "birth_year": 1900, "death_year": 1990}],
                             "subjects": [], "languages": ["es"], "bookshelves": [], "media_type": "Text"}], "next": None}
        ctx, cfg, _ = make_ctx(d, [FakeResp(200, data)])
        cfg.queries["gutendex"] = [{"idiomas": "es", "paginas": 1}]
        recs = list(GutendexCollector(ctx).collect())
        self.assertEqual(recs[0].derechos, "dominio_publico")
        self.assertEqual(recs[1].derechos, "metadatos_obra_protegida")

    def test_musicbrainz_sin_tags(self):
        d = tmp_project()
        data = {"recordings": [
            {"id": "mb1", "title": "Tema uno", "artist-credit": [{"name": "Banda", "joinphrase": " & "}, {"name": "Otro"}],
             "first-release-date": "1985-03-01", "releases": [{"title": "Disco"}], "tags": [{"name": "rock"}]},
            {"id": "mb2", "title": "Tema dos", "disambiguation": "live at somewhere", "artist-credit": [{"name": "Banda"}]}]}
        ctx, cfg, _ = make_ctx(d, [FakeResp(200, data), FakeResp(200, {"recordings": []})])
        cfg.queries["musicbrainz"] = [{"etiqueta": "t", "query": "country:AR", "paginas": 2}]
        recs = list(MusicBrainzCollector(ctx).collect())
        self.assertEqual(len(recs), 1)
        self.assertEqual(recs[0].autor_artista_creador, "Banda & Otro")
        self.assertEqual(recs[0].genero, "")                       # no copia etiquetas
        self.assertEqual(recs[0].extra["album"], "Disco")

    def test_commons(self):
        d = tmp_project()

        def page(titulo, lic, ancho=1200):
            return {"title": f"File:{titulo}.jpg", "imageinfo": [{
                "url": f"https://upload.wikimedia.org/{titulo}.jpg", "descriptionurl": f"https://commons.wikimedia.org/wiki/File:{titulo}.jpg",
                "width": ancho, "height": 800, "mime": "image/jpeg",
                "extmetadata": {"LicenseShortName": {"value": lic}, "Artist": {"value": '<a href="x">Fotografa Uno</a>'},
                                "ImageDescription": {"value": "<b>Una</b> ventana"}, "Categories": {"value": "Ventanas|CC-BY-SA|Lluvia"}}}]}
        data = {"query": {"pages": [page("a", "CC BY-SA 4.0"), page("b", "CC BY-NC 4.0"), page("c", "CC0", 300)]}}
        ctx, cfg, _ = make_ctx(d, [FakeResp(200, data)])
        cfg.queries["commons"] = {"min_ancho_px": 800, "consultas": [{"q": "ventana", "tematica": "lluvia; ventana", "paginas": 1}]}
        recs = list(CommonsCollector(ctx).collect())
        self.assertEqual(len(recs), 1)                              # NC y chica descartadas
        r = recs[0]
        self.assertEqual(r.autor_artista_creador, "Fotografa Uno")
        self.assertEqual(r.derechos, "licencia_abierta")
        self.assertIn("Wikimedia Commons", r.atribucion)
        self.assertEqual(r.descripcion, "Una ventana")
        self.assertEqual(Store(":memory:").ingest(r, "R"), "nuevo")

    def test_wikiquote_extractor(self):
        wt = """== Frases ==
* "Una frase de prueba que tiene fuente anotada."
** ''Obra de Prueba'', capitulo 1
* Otra frase sin fuente
== Sobre Alguien ==
* Una cita de terceros que debe excluirse.
** Fuente de terceros
=== Subseccion ===
* Cita dentro de excluida con fuente.
** Otra fuente
== Obras ==
* Frase de obra con [[enlace|texto]] y plantilla {{x}} limpia.
** [[Libro Dos]], 1920
"""
        q = extract_quotes(wt)
        self.assertEqual(len(q), 2)
        self.assertEqual(q[0]["fuente"], "Obra de Prueba, capitulo 1")
        self.assertIn("con texto y plantilla  limpia".replace("  ", " "), q[1]["texto"].replace("  ", " "))

    def test_prompts_y_manual(self):
        d = tmp_project()
        ctx, cfg, _ = make_ctx(d, [FakeResp(200, {})])
        (d / "data" / "prompts" / "lote_test.jsonl").write_text(
            json.dumps({"texto": "Consigna de prueba suficientemente larga para pasar la validacion minima.", "tipo": "situaciones",
                        "tematica": "x", "etiquetas": ["a", "b"]}) + "\n" +
            json.dumps({"texto": "Fuera de plan pero con largo suficiente para validar el minimo.", "tipo": "inventado"}) + "\n" +
            "no es json\n", encoding="utf-8")
        s = Store(":memory:")
        res = run_collector(s, PromptsCollector(ctx), cfg)
        self.assertEqual(res["resultados"], {"nuevo": 1})
        # carga manual con fila incompleta -> rechazada, completa -> nueva
        (d / "data" / "manual" / "m.csv").write_text(
            "categoria,contenido_o_titulo,autor_artista_creador,fuente,url_fuente,derechos,licencia\n"
            "libro,Titulo manual,Autor Manual,manual,https://example.org/x,metadatos_obra_protegida,CC0\n"
            "libro,Sin url,Autor Manual,manual,,metadatos_obra_protegida,CC0\n", encoding="utf-8")
        res = run_collector(s, ManualCollector(ctx), cfg, aplicar_topes=False)
        self.assertEqual(res["resultados"], {"nuevo": 1, "rechazado": 1})
        # reingesta: nada se duplica
        res = run_collector(s, ManualCollector(ctx), cfg, aplicar_topes=False)
        self.assertEqual(res["resultados"].get("nuevo", 0), 0)


class ExportTests(unittest.TestCase):
    def test_excel(self):
        d = tmp_project()
        cfg = Config(d)
        s = Store(cfg.path("db"))
        base = dict(fuente="t", url_fuente="https://example.org/a", derechos="metadatos_obra_protegida", licencia="CC0 1.0",
                    fecha_verificacion="2026-01-01")
        s.ingest(Record(categoria="libro", contenido_o_titulo="=SUMA(1;1)", autor_artista_creador="Autora", anio="1999",
                        id_externo="1", **base), "R")
        s.ingest(Record(categoria="pelicula", contenido_o_titulo="Peli", anio="2001", id_externo="2",
                        autor_artista_creador="Dir", **base), "R")
        s.ingest(Record(categoria="cita", contenido_o_titulo="Una frase suficientemente larga para validar", id_externo="3",
                        autor_artista_creador="Alguien", **{**base, "derechos": "pendiente_verificacion"}), "R")
        s.commit()
        res = export_all(s, cfg)
        self.assertEqual(res["verificados"], 2)
        self.assertEqual(res["pendientes"], 1)
        wb = load_workbook(Path(res["carpeta"]) / "cultura_db.xlsx")
        esperadas = ["README", "RESUMEN", "CATALOGO", "LIBROS", "PELICULAS", "SERIES", "CANCIONES", "POEMAS", "CITAS",
                     "GUIONES", "PERSONAJES", "PROMPTS", "IMAGENES", "FUENTES_Y_LICENCIAS", "PENDIENTES"]
        self.assertEqual(wb.sheetnames, esperadas)
        ws = wb["CATALOGO"]
        self.assertEqual(ws.max_row, 3)                                   # encabezado + 2
        fila = {c.value: ws.cell(2, i + 1).value for i, c in enumerate(ws[1])}
        self.assertEqual(fila["contenido_o_titulo"], "=SUMA(1;1)")          # texto literal, no formula
        self.assertEqual(ws.cell(2, 1).data_type, "s")
        self.assertEqual(fila["anio"], 1999)
        self.assertTrue(ws.auto_filter.ref)
        self.assertEqual(ws["A1"].font.name, "Arial")
        self.assertEqual(ws.cell(2, 1).font.name, "Arial")
        self.assertEqual(wb["PENDIENTES"].max_row, 2)
        # segunda exportacion: sin cambios, y luego un registro nuevo aparece como agregado
        res2 = export_all(s, cfg)
        self.assertEqual((res2["agregados"], res2["retirados"]), (0, 0))
        s.ingest(Record(categoria="libro", contenido_o_titulo="Otro libro", autor_artista_creador="Autor 2", id_externo="9", **base), "R")
        s.commit()
        import time
        time.sleep(1.1)
        res3 = export_all(s, cfg)
        self.assertEqual(res3["agregados"], 1)
        for f in ("catalogo.csv", "pendientes.csv", "rechazados.csv", "duplicados.csv", "cambios.csv", "informe.md",
                  "informe.json", "fuentes_consultadas.md", "README.md"):
            self.assertTrue((Path(res3["carpeta"]) / f).exists(), f)

    def test_columnas_por_categoria(self):
        for c in CATEGORIAS:
            cols = category_columns(c)
            self.assertEqual(len({h for h, _ in cols}), len(cols), c)


if __name__ == "__main__":
    unittest.main()
