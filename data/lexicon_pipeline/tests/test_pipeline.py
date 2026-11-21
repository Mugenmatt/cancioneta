"""Pruebas con datos SINTÉTICOS inventados solo para verificar que el código funciona.
NO son datos reales ni se usan para ningún conteo del banco léxico."""
from __future__ import annotations

import gzip
import io
import json
import sqlite3
import subprocess
import sys
import tarfile
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))
from lexpipe import common as C  # noqa: E402
from lexpipe import wikt, openslr  # noqa: E402
import stage_wiktextract as SW  # noqa: E402
import stage_openslr as SO  # noqa: E402
import stage_mcr_dump as SM  # noqa: E402

FAKE_RECORDS = [
    {"word": "Cántaro", "lang_code": "es", "lang": "Español", "pos": "sustantivo masculino",
     "senses": [{"glosses": ["Vasija grande."], "tags": []}], "synonyms": [{"word": "tinaja"}]},
    {"word": "cantaro", "lang_code": "es", "pos": "verbo", "senses": [{"glosses": ["x"]}]},  # no es infinitivo
    {"word": "cantar", "lang_code": "es", "pos": "verbo transitivo",
     "senses": [{"glosses": ["Emitir sonidos."], "tags": ["coloquial"]}],
     "forms": [{"form": "canto", "tags": ["present"]}, {"form": "no-table-tags", "tags": ["table-tags"]}]},
    {"word": "canto", "lang_code": "es", "pos": "forma verbal",
     "senses": [{"glosses": ["Primera persona de cantar."], "form_of": [{"word": "cantar"}]}]},
    {"word": "canto", "lang_code": "es", "pos": "sustantivo", "senses": [{"glosses": ["Canción."]}]},
    {"word": "che", "lang_code": "es", "pos": "interjección",
     "senses": [{"glosses": ["Interjección usada en el Río de la Plata."], "tags": ["Argentina", "coloquial"]}]},
    {"word": "bonito", "lang_code": "es", "pos": "adjetivo", "senses": [{"glosses": ["Lindo."]}]},
    {"word": "bonito", "lang_code": "es", "pos": "sustantivo", "senses": [{"glosses": ["Un pez."]}]},
    {"word": "a priori", "lang_code": "es", "pos": "locución adverbial", "senses": [{"glosses": ["Antes."]}]},
    {"word": "house", "lang_code": "en", "pos": "noun", "senses": [{"glosses": ["casa"]}]},
]


def write_gz_jsonl(path: Path, records):
    with gzip.open(path, "wt", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


class TestNormalization(unittest.TestCase):
    def test_keys(self):
        self.assertEqual(C.word_key("  CÁNTARO "), "cántaro")
        self.assertNotEqual(C.word_key("año"), C.word_key("ano"))
        self.assertEqual(C.word_key("cafe\u0301"), "café")  # NFC
        self.assertEqual(C.accentless_key("Pingüino Año"), "pingüino año")
        self.assertTrue(C.is_valid_word("canción"))
        self.assertFalse(C.is_valid_word("a.m."))

    def test_pos(self):
        self.assertEqual(wikt.normalize_pos("sustantivo masculino"), ("NOUN", False))
        self.assertEqual(wikt.normalize_pos("forma verbal"), ("VERB", True))
        self.assertEqual(wikt.normalize_pos("nombre propio"), ("PROPN", False))
        self.assertEqual(wikt.normalize_pos("locución adverbial")[0], "PHRASE")
        self.assertEqual(wikt.normalize_pos(None)[0], "UNKNOWN")


class TestWikt(unittest.TestCase):
    def test_stage(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            src, out = d / "w.jsonl.gz", d / "w.sqlite"
            write_gz_jsonl(src, FAKE_RECORDS)
            meta = SW.stage(src, out, stride=1, progress=False)
            self.assertEqual(meta["entries_es"], 9)  # 'house' (en) excluida
            con = sqlite3.connect(out)
            q = lambda s: con.execute(s).fetchall()  # noqa: E731
            self.assertEqual(q("SELECT COUNT(*) FROM entry WHERE kind='inflected_form'")[0][0], 1)
            self.assertEqual(q("SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind='lemma'")[0][0], 7)
            amb = q("SELECT COUNT(*) FROM (SELECT word_key FROM entry WHERE kind='lemma' GROUP BY word_key HAVING COUNT(DISTINCT pos_norm)>1)")[0][0]
            self.assertEqual(amb, 1)  # bonito (adj + sust); 'canto' lema es solo sustantivo
            self.assertEqual(q("SELECT COUNT(*) FROM entry WHERE region_ar_tag=1")[0][0], 1)
            self.assertEqual(q("SELECT COUNT(*) FROM form")[0][0], 1)  # 'no-table-tags' filtrado
            self.assertEqual(q("SELECT COUNT(*) FROM relation WHERE rel_type='synonym'")[0][0], 1)
            self.assertEqual(q("SELECT is_multiword FROM entry WHERE word='a priori'")[0][0], 1)
            # 'cántaro' y 'cantaro' NO se unifican
            self.assertEqual(q("SELECT COUNT(DISTINCT word_key) FROM entry WHERE accentless_key='cantaro'")[0][0], 2)
            con.close()

    def test_stride(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            src, out = d / "w.jsonl.gz", d / "w.sqlite"
            write_gz_jsonl(src, FAKE_RECORDS)
            meta = SW.stage(src, out, stride=2, progress=False)
            self.assertLess(meta["entries_es"], 9)


class TestOpenSLR(unittest.TestCase):
    def _tgz(self, d: Path, obj) -> Path:
        p = d / "es_wordlist.json.tgz"
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        with tarfile.open(p, "w:gz") as tf:
            ti = tarfile.TarInfo("es_wordlist.json")
            ti.size = len(data)
            tf.addfile(ti, io.BytesIO(data))
        return p

    def test_dict_and_list_formats(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            for obj in ({"casa": 100, "Casa": 5, "123": 3, "niño": 9},
                        [["casa", 100], ["Casa", 5], ["123", 3], ["niño", 9]],
                        [{"word": "casa", "count": 100}, {"word": "Casa", "count": 5}, {"word": "123", "count": 3}, {"word": "niño", "count": 9}]):
                p = self._tgz(d, obj)
                out = d / "s.sqlite"
                SO.stage(p, out)
                con = sqlite3.connect(out)
                self.assertEqual(con.execute("SELECT count_sum, n_variants FROM freq_by_key WHERE word_key='casa'").fetchone(), (105, 2))
                self.assertEqual(con.execute("SELECT valid_word FROM freq_by_key WHERE word_key='123'").fetchone()[0], 0)
                self.assertEqual(con.execute("SELECT rank FROM freq_by_key WHERE word_key='casa'").fetchone()[0], 1)
                con.close()

    def test_unknown_structure(self):
        with tempfile.TemporaryDirectory() as d:
            p = self._tgz(Path(d), "solo texto")
            with self.assertRaises(ValueError):
                openslr.load_wordlist(p)


SQL_DUMP = r"""-- dump sintético
CREATE TABLE `wei_spa-30_variant` (
  `word` varchar(100) NOT NULL,
  `offset` int(11) NOT NULL,
  `pos` char(1) DEFAULT NULL,
  KEY `idx` (`word`)
) ENGINE=InnoDB;
INSERT INTO `wei_spa-30_variant` VALUES ('perro',1,'n'),('it\'s ''ok''',2,'n'),('ca\\sa',3,NULL),('línea\nnueva',4,'n');
CREATE TABLE `rel` (
  `a` int(11),
  `b` int(11),
  `type` varchar(10)
) ENGINE=InnoDB;
INSERT INTO `rel` (`a`,`b`,`type`) VALUES (1,2,'hyper'),(2,3,'hyper');
"""


class TestMysqlDump(unittest.TestCase):
    def test_parse_and_load(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            z = d / "mcr.zip"
            with zipfile.ZipFile(z, "w") as zf:
                zf.writestr("mcr30.sql", SQL_DUMP)
            res = SM.scan_or_load(z, None)
            self.assertEqual(res["tables"]["wei_spa-30_variant"]["n_rows"], 4)
            self.assertEqual(res["tables"]["rel"]["n_rows"], 2)
            out = d / "m.sqlite"
            res = SM.scan_or_load(z, out)
            self.assertEqual(res["errors"], 0)
            con = sqlite3.connect(out)
            rows = dict(con.execute('SELECT "offset", word FROM "t_wei_spa_30_variant"').fetchall())
            self.assertEqual(rows["2"], "it's 'ok'")
            self.assertEqual(rows["3"], "ca\\sa")
            self.assertEqual(rows["4"], "línea\nnueva")
            self.assertIsNone(con.execute('SELECT pos FROM "t_wei_spa_30_variant" WHERE "offset"=\'3\'').fetchone()[0])
            con.close()


class TestEndToEndScripts(unittest.TestCase):
    def test_report_and_integrity(self):
        """Corre sample_report e integridad sobre un proyecto temporal (copia de scripts)."""
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            wk = d / "wikt.sqlite"
            slr = d / "slr.sqlite"
            mcr = d / "mcr.sqlite"
            src = d / "w.jsonl.gz"
            write_gz_jsonl(src, FAKE_RECORDS)
            SW.stage(src, wk, stride=1, progress=False)
            p = d / "es_wordlist.json.tgz"
            data = json.dumps({"cantar": 50, "canto": 20, "bonito": 1500, "casa": 9999}).encode()
            with tarfile.open(p, "w:gz") as tf:
                ti = tarfile.TarInfo("x.json")
                ti.size = len(data)
                tf.addfile(ti, io.BytesIO(data))
            SO.stage(p, slr)
            z = d / "mcr.zip"
            with zipfile.ZipFile(z, "w") as zf:
                zf.writestr("mcr30.sql", SQL_DUMP)
            SM.scan_or_load(z, mcr)
            out = d / "rep.md"
            r = subprocess.run([sys.executable, str(ROOT / "scripts" / "sample_report.py"), "--wikt", str(wk),
                                "--openslr", str(slr), "--mcr", str(mcr), "--out", str(out)],
                               capture_output=True, text=True, encoding="utf-8")
            self.assertEqual(r.returncode, 0, r.stderr + r.stdout)
            text = out.read_text(encoding="utf-8")
            for needle in ("Lemas únicos", "Diagnóstico cruzado", "MCR 3.0", "lemas ≠ acepciones"):
                self.assertIn(needle, text)

    def test_integrity_cycle(self):
        import verify_integrity as VI  # noqa: E402
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            p = d / "a.json.tgz"
            with tarfile.open(p, "w:gz") as tf:
                ti = tarfile.TarInfo("x.json")
                ti.size = 2
                tf.addfile(ti, io.BytesIO(b"{}"))
            self.assertIsNone(VI.check_archive(p))
            bad = d / "bad.gz"
            bad.write_bytes(gzip.compress(b"hola" * 10000)[:-20])  # truncado
            self.assertIsNotNone(VI.check_archive(bad))


if __name__ == "__main__":
    unittest.main(verbosity=2)
