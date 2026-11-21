"""Pruebas de las reglas centrales. Los datos de ejemplo son SINTETICOS y solo viven en estas pruebas."""
import shutil
import tempfile
import unittest
from pathlib import Path

from cdb.config import Config, ROOT
from cdb.licensing import classify_license, public_domain_ar
from cdb.normalize import canonical_url, make_dedup_key, near_duplicates, normalize_text
from cdb.report import redistribute
from cdb.schema import CATEGORIAS, Record
from cdb.store import Store
from cdb.validate import validate


def rec(**kw):
    base = dict(categoria="libro", contenido_o_titulo="Titulo de prueba", autor_artista_creador="Autora Prueba",
                fuente="test", url_fuente="https://example.org/a", derechos="metadatos_obra_protegida",
                licencia="CC0 1.0", fecha_verificacion="2026-01-01", id_externo="X1")
    base.update(kw)
    return Record(**base).finalize()


class NormalizeTests(unittest.TestCase):
    def test_tildes_y_enie(self):
        self.assertEqual(normalize_text("Canción de Otoño!"), "cancion de otono".replace("otono", "otoño"))
        self.assertNotEqual(normalize_text("año"), normalize_text("ano"))

    def test_articulo_y_clave(self):
        a = make_dedup_key("libro", "El  Aleph", "Jorge Luis Borges")
        b = make_dedup_key("libro", "aleph", "JORGE LUIS BORGES")
        self.assertEqual(a, b)

    def test_pelicula_distingue_anio(self):
        self.assertNotEqual(make_dedup_key("pelicula", "Titulo", anio="1950"),
                            make_dedup_key("pelicula", "Titulo", anio="1999"))

    def test_url_canonica(self):
        self.assertEqual(canonical_url("HTTPS://Ejemplo.ORG/a/?utm_source=x&b=1#frag"), "https://ejemplo.org/a?b=1")

    def test_casi_duplicados(self):
        items = [("a", "Escribi una carta que nunca enviaste a tu antiguo vecino"),
                 ("b", "Escribi una carta que nunca enviaste a tu antiguo vecino hoy"),
                 ("c", "Describe el ruido de una heladera en una casa vacia")]
        pares = near_duplicates(items, 0.7)
        self.assertEqual([(p[0], p[1]) for p in pares], [("a", "b")])


class LicenseTests(unittest.TestCase):
    def test_plazo_ar(self):
        self.assertTrue(public_domain_ar(1950, 70, hoy=2026))
        self.assertTrue(public_domain_ar(1955, 70, hoy=2026))
        self.assertFalse(public_domain_ar(1956, 70, hoy=2026))
        self.assertFalse(public_domain_ar(None))

    def test_clasificar(self):
        self.assertEqual(classify_license("CC BY-SA 4.0")[0], "licencia_abierta")
        self.assertEqual(classify_license("CC BY 2.0")[0], "licencia_abierta")
        self.assertEqual(classify_license("CC0")[0], "dominio_publico")
        self.assertEqual(classify_license("Public domain")[0], "dominio_publico")
        self.assertEqual(classify_license("CC BY-NC 4.0")[0], "pendiente_verificacion")
        self.assertEqual(classify_license("CC BY-ND 2.0")[0], "pendiente_verificacion")
        self.assertEqual(classify_license("")[0], "pendiente_verificacion")


class ValidateTests(unittest.TestCase):
    def test_ok(self):
        self.assertEqual(validate(rec())[0], "verificado")

    def test_qid_sin_etiqueta(self):
        self.assertEqual(validate(rec(contenido_o_titulo="Q12345"))[0], "rechazado")

    def test_titulo_igual_autor(self):
        self.assertEqual(validate(rec(contenido_o_titulo="Ana", autor_artista_creador="ana"))[0], "rechazado")

    def test_url_malformada(self):
        self.assertEqual(validate(rec(url_fuente="no es una url"))[0], "rechazado")

    def test_texto_sin_derechos(self):
        self.assertEqual(validate(rec(texto_breve="algo"))[0], "rechazado")

    def test_cita_protegida_queda_pendiente(self):
        r = rec(categoria="cita", contenido_o_titulo="Una frase suficientemente larga para validar", derechos="metadatos_obra_protegida")
        self.assertEqual(validate(r)[0], "pendiente")

    def test_cita_dominio_publico(self):
        r = rec(categoria="cita", contenido_o_titulo="Una frase suficientemente larga para validar", derechos="dominio_publico")
        self.assertEqual(validate(r)[0], "verificado")

    def test_prompt_original_sin_url(self):
        r = rec(categoria="prompt", contenido_o_titulo="Una consigna de escritura original con largo suficiente para pasar.",
                autor_artista_creador="", derechos="original", url_fuente="")
        self.assertEqual(validate(r)[0], "verificado")

    def test_imagen_exige_autor_y_atribucion(self):
        r = rec(categoria="imagen", autor_artista_creador="", derechos="licencia_abierta", url_externa="https://x.org/i.jpg")
        self.assertEqual(validate(r)[0], "rechazado")


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.s = Store(":memory:")
        self.run = "R1"

    def test_flujo_duplicados(self):
        self.assertEqual(self.s.ingest(rec(), self.run), "nuevo")
        self.assertEqual(self.s.ingest(rec(), self.run), "duplicado_exacto")           # misma corrida
        self.assertEqual(self.s.ingest(rec(), "R2"), "sin_cambios")                    # otra corrida
        # misma obra desde otra fuente con distinto formato -> normalizado
        otro = rec(fuente="otra", id_externo="Z9", contenido_o_titulo="TITULO DE PRUEBA", autor_artista_creador="autora prueba")
        self.assertEqual(self.s.ingest(otro, "R2"), "duplicado_normalizado")
        self.assertEqual(self.s.count("libro"), 1)
        self.assertEqual(self.s.db.execute("SELECT COUNT(*) FROM duplicates").fetchone()[0], 1)

    def test_actualizacion_y_rechazo(self):
        self.s.ingest(rec(), "R1")
        self.assertEqual(self.s.ingest(rec(genero="novela"), "R2"), "actualizado")
        self.assertEqual(self.s.ingest(rec(contenido_o_titulo="Q99", id_externo="Q99"), "R2"), "rechazado")
        self.assertEqual(self.s.db.execute("SELECT COUNT(*) FROM rejected").fetchone()[0], 1)

    def test_pendiente_mejorado(self):
        r1 = rec(categoria="cita", contenido_o_titulo="Una frase suficientemente larga para validar", derechos="pendiente_verificacion", id_externo="a")
        r2 = rec(categoria="cita", contenido_o_titulo="Una frase suficientemente larga para validar", derechos="dominio_publico", fuente="otra", id_externo="b")
        self.assertEqual(self.s.ingest(r1, "R1"), "nuevo")
        self.assertEqual(self.s.count("cita", "pendiente"), 1)
        self.assertEqual(self.s.ingest(r2, "R1"), "mejorado")
        self.assertEqual(self.s.count("cita"), 1)

    def test_id_estable(self):
        self.assertEqual(rec().id, rec().id)
        self.assertTrue(rec().id.startswith("LIB-"))

    def test_enlaces_rotos(self):
        self.s.ingest(rec(), "R1")
        self.s.db.execute("INSERT INTO link_checks VALUES ('https://example.org/a', 404, 'x')")
        self.assertEqual(self.s.apply_link_results()["marcados_rotos"], 1)
        self.assertEqual(self.s.count("libro"), 0)
        self.s.db.execute("UPDATE link_checks SET status=200")
        self.assertEqual(self.s.apply_link_results()["recuperados"], 1)
        self.assertEqual(self.s.count("libro"), 1)


class PlanTests(unittest.TestCase):
    def test_redistribucion(self):
        refs = {c: 100 for c in CATEGORIAS}
        counts = {c: 100 for c in CATEGORIAS}
        counts["guion"] = 20            # faltan 80
        counts["libro"] = 300           # excedente 200
        counts["pelicula"] = 140        # excedente 40
        pesos = {c: 1 for c in CATEGORIAS}
        pesos["guion"] = 0
        r = redistribute(counts, refs, pesos)
        self.assertEqual(r["deficit"]["guion"], 80)
        self.assertEqual(sum(r["extra_asignado"].values()), 80)
        self.assertLessEqual(r["extra_asignado"]["pelicula"], 40)
        self.assertEqual(r["faltante_sin_cubrir"], 0)
        self.assertEqual(r["objetivo_ajustado"]["guion"], 20)

    def test_faltante_sin_cubrir(self):
        refs = {c: 100 for c in CATEGORIAS}
        counts = {c: 100 for c in CATEGORIAS}
        counts["cita"] = 0
        r = redistribute(counts, refs, {c: 1 for c in CATEGORIAS})
        self.assertEqual(r["faltante_sin_cubrir"], 100)


if __name__ == "__main__":
    unittest.main()
