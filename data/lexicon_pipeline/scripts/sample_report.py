#!/usr/bin/env python3
"""Genera el informe de muestra (Markdown) a partir de las bases de staging, sin mezclar fuentes.

Las bases de staging se leen por separado. Solo para un diagnóstico de cobertura se abre OpenSLR
en modo SOLO LECTURA junto a Wiktionary; no se escribe ningún dato combinado.

Uso:  python scripts/sample_report.py
"""
from __future__ import annotations

import argparse
import collections
import json
import re
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lexpipe import common as C  # noqa: E402

INF_RE = re.compile(r"(ar|er|ir|ír)(se)?$")


def meta(con) -> dict:
    return dict(con.execute("SELECT key, value FROM stage_meta"))


def table(rows, headers) -> str:
    out = ["| " + " | ".join(headers) + " |", "|" + "|".join("---" for _ in headers) + "|"]
    for r in rows:
        out.append("| " + " | ".join(str(x) for x in r) + " |")
    return "\n".join(out)


def n(x) -> str:
    return f"{x:,}".replace(",", ".")


# --------------------------------------------------------------------------
def report_wikt(path: Path) -> list[str]:
    con = sqlite3.connect(path)
    m = meta(con)
    L = [f"## 1. Wiktionary en español (Wiktextract) — `{path.name}`", ""]
    stride = int(m.get("stride", 1))
    L += [f"- Archivo origen: `{m.get('input_file')}` · SHA-256: `{m.get('input_sha256')}`",
          f"- Líneas leídas: {n(int(m.get('lines_read', 0)))} · muestreo: 1 de cada {stride} línea(s) · "
          f"entradas en español cargadas: {n(int(m.get('entries_es', 0)))}"]
    if stride > 1:
        L.append(f"- **Las cifras de abajo son de la MUESTRA, no del total.** Para el total, repetir con `--stride 1`. "
                 f"Multiplicar por {stride} solo da una estimación orientativa (un lema con varias categorías ocupa varias líneas).")
    if int(m.get("records_without_language_field", 0)):
        L.append(f"- AVISO: {m['records_without_language_field']} registros sin campo de idioma reconocido.")
    L.append("")

    q = lambda sql, *a: con.execute(sql, a).fetchall()  # noqa: E731
    total_entries = q("SELECT COUNT(*) FROM entry")[0][0]
    if total_entries == 0:
        return L + ["**Sin entradas en español.** Revisar nombres de campo con `inspect_formats.py`.", ""]

    uniq_lemmas = q("SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind='lemma'")[0][0]
    uniq_single = q("SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind='lemma' AND is_multiword=0 AND valid_word=1")[0][0]
    senses = q("SELECT COUNT(*) FROM sense s JOIN entry e USING(entry_id) WHERE e.kind='lemma'")[0][0]
    L += ["### Cantidades (lemas ≠ acepciones ≠ formas)", "",
          table([
              ("Lemas únicos (clave NFC+casefold, con tildes), todas las categorías", n(uniq_lemmas)),
              ("  de ellos: una sola palabra y solo letras españolas", n(uniq_single)),
              ("Entradas lema (lema × categoría)", n(q("SELECT COUNT(*) FROM entry WHERE kind='lemma'")[0][0])),
              ("Acepciones de entradas lema (NO son palabras)", n(senses)),
              ("Entradas marcadas como forma flexionada", n(q("SELECT COUNT(*) FROM entry WHERE kind='inflected_form'")[0][0])),
              ("Entradas marcadas como variante (alt_of)", n(q("SELECT COUNT(*) FROM entry WHERE kind='variant'")[0][0])),
              ("Formas flexionadas listadas dentro de lemas (tabla form, distintas)", n(q("SELECT COUNT(DISTINCT form_key) FROM form")[0][0])),
          ], ["Medida", "Valor"]), ""]

    L += ["### Lemas únicos por categoría (solo entradas lema)", ""]
    rows = []
    for pos, c_all, c_single in q("""SELECT pos_norm, COUNT(DISTINCT word_key),
                 COUNT(DISTINCT CASE WHEN is_multiword=0 AND valid_word=1 THEN word_key END)
                 FROM entry WHERE kind='lemma' GROUP BY pos_norm ORDER BY 2 DESC"""):
        rows.append((pos, n(c_all), n(c_single)))
    L += [table(rows, ["Categoría", "Lemas únicos", "…de una palabra, letras válidas"]), ""]
    amb = q("SELECT COUNT(*) FROM (SELECT word_key FROM entry WHERE kind='lemma' GROUP BY word_key HAVING COUNT(DISTINCT pos_norm)>1)")[0][0]
    L += [f"- Lemas con más de una categoría (ambigüedad conservada): **{n(amb)}** "
          f"({amb / max(uniq_lemmas, 1):.1%} de los lemas únicos).", ""]

    # Calidad de verbos
    verbs = [r[0] for r in q("SELECT DISTINCT word_key FROM entry WHERE kind='lemma' AND pos_norm='VERB' AND is_multiword=0")]
    bad = [v for v in verbs if not INF_RE.search(v)]
    L += ["### Controles de calidad", "",
          f"- Verbos (lema, una palabra) que NO terminan como infinitivo: {n(len(bad))} de {n(len(verbs))}"
          + (f" — ejemplos: {', '.join(bad[:15])}" if bad else ""),
          f"- Lemas con definición (≥1 acepción con texto): "
          f"{n(q(chr(83)+'ELECT COUNT(DISTINCT e.word_key) FROM entry e JOIN sense s USING(entry_id) WHERE e.kind=? AND s.gloss<>?', 'lemma', '')[0][0])} de {n(uniq_lemmas)}",
          f"- Lemas con caracteres fuera de a-z/tildes/ñ/ü (extranjerismos, símbolos, puntuación): "
          f"{n(q('SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind=? AND valid_word=0 AND is_multiword=0', 'lemma')[0][0])}",
          f"- Lemas de varias palabras (locuciones, etc.): {n(q('SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind=? AND is_multiword=1', 'lemma')[0][0])}",
          f"- Nombres propios (PROPN): {n(q('SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind=? AND pos_norm=?', 'lemma', 'PROPN')[0][0])}", ""]

    L += ["### Español argentino / registro", "",
          "No se infiere nada: solo se cuentan marcas presentes en los datos.", "",
          table([
              ("Lemas con ETIQUETA argentina/rioplatense/lunfardo en alguna acepción",
               n(q("SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind='lemma' AND region_ar_tag=1")[0][0])),
              ("Lemas cuya DEFINICIÓN menciona Argentina/Río de la Plata (heurística, puede incluir falsos positivos)",
               n(q("SELECT COUNT(DISTINCT word_key) FROM entry WHERE kind='lemma' AND region_ar_gloss=1")[0][0])),
          ], ["Medida", "Lemas"]), ""]
    reg = collections.Counter()
    for (r,) in q("SELECT registers FROM entry WHERE kind='lemma' AND registers<>''"):
        reg.update(r.split(","))
    L += ["Registros marcados (entradas lema): " + (", ".join(f"{k}={n(v)}" for k, v in reg.most_common()) or "ninguno"), ""]
    tags = collections.Counter()
    for (tj,) in q("SELECT tags_json FROM sense s JOIN entry e USING(entry_id) WHERE e.kind='lemma' AND tags_json<>'[]'"):
        tags.update(json.loads(tj))
    L += ["Etiquetas de acepción más frecuentes (para descubrir cómo marca Wiktionary las variantes regionales): "
          + (", ".join(f"`{k}`={n(v)}" for k, v in tags.most_common(30)) or "ninguna"), ""]

    L += ["### Relaciones semánticas documentadas en Wiktionary", ""]
    rel = q("""SELECT r.rel_type, COUNT(*), COUNT(DISTINCT e.word_key) FROM relation r
               JOIN entry e USING(entry_id) WHERE e.kind='lemma' GROUP BY r.rel_type ORDER BY 2 DESC""")
    L += [table([(a, n(b), n(c)) for a, b, c in rel], ["Tipo", "Relaciones", "Lemas con ≥1"]) if rel
          else "No se encontraron relaciones (puede ser que la estructura use otros nombres de campo).", ""]

    L += ["### Muestra aleatoria para juzgar calidad (revisar a ojo)", ""]
    for pos in ("NOUN", "VERB", "ADJ", "ADV"):
        rows = q("""SELECT e.word, substr(COALESCE((SELECT gloss FROM sense s WHERE s.entry_id=e.entry_id AND s.gloss<>'' LIMIT 1),''),1,70)
                    FROM entry e WHERE e.kind='lemma' AND e.pos_norm=? ORDER BY random() LIMIT 8""", pos)
        L += [f"**{pos}**", ""] + [f"- {w} — {g or '(sin definición)'}" for w, g in rows] + [""]
    con.close()
    return L


# --------------------------------------------------------------------------
def report_openslr(path: Path) -> list[str]:
    con = sqlite3.connect(path)
    m = meta(con)
    q = lambda sql, *a: con.execute(sql, a).fetchall()  # noqa: E731
    L = [f"## 2. OpenSLR SLR21 — frecuencias — `{path.name}`", "",
         f"- Archivo: `{m.get('input_file')}` (miembro `{m.get('member')}`) · SHA-256: `{m.get('input_sha256')}`", ""]
    tot = q("SELECT COUNT(*), SUM(count_sum) FROM freq_by_key")[0]
    valid = q("SELECT COUNT(*) FROM freq_by_key WHERE valid_word=1")[0][0]
    L += [table([
        ("Registros crudos", n(int(m.get("rows", 0)))),
        ("Claves distintas (NFC+casefold)", n(tot[0])),
        ("Claves con solo letras españolas", f"{n(valid)} ({valid / max(tot[0], 1):.1%})"),
        ("Suma de conteos (tokens)", n(tot[1] or 0)),
        ("Claves con conteo = 1", n(q("SELECT COUNT(*) FROM freq_by_key WHERE count_sum=1")[0][0])),
        ("Claves con conteo ≥ 100 (letras válidas)", n(q("SELECT COUNT(*) FROM freq_by_key WHERE count_sum>=100 AND valid_word=1")[0][0])),
        ("Claves con conteo ≥ 1000 (letras válidas)", n(q("SELECT COUNT(*) FROM freq_by_key WHERE count_sum>=1000 AND valid_word=1")[0][0])),
    ], ["Medida", "Valor"]), "",
        "Importante: son **formas**, no lemas, y SLR21 **no trae categoría gramatical**: no aporta conteos de sustantivos/verbos/adjetivos. "
        "Sirve para bandas de frecuencia una vez unidas las formas a sus lemas (paso posterior).", ""]
    L += ["Las 15 más frecuentes: " + ", ".join(f"{w} ({n(c)})" for w, c in q("SELECT word_key,count_sum FROM freq_by_key ORDER BY rank LIMIT 15")), ""]
    L += ["Muestra aleatoria de claves con conteo entre 5 y 50 (para ver el ruido): "
          + ", ".join(w for (w,) in q("SELECT word_key FROM freq_by_key WHERE count_sum BETWEEN 5 AND 50 ORDER BY random() LIMIT 25")), ""]
    L += ["Muestra aleatoria de claves con letras NO válidas (para ver qué se descartaría): "
          + ", ".join(w for (w,) in q("SELECT word_key FROM freq_by_key WHERE valid_word=0 ORDER BY random() LIMIT 20")), ""]
    con.close()
    return L


def cross_check(wikt_path: Path, slr_path: Path) -> list[str]:
    """Diagnóstico de cobertura en SOLO LECTURA (no se escribe ninguna base combinada)."""
    con = sqlite3.connect(f"file:{wikt_path.as_posix()}?mode=ro", uri=True)
    con.execute("ATTACH DATABASE ? AS slr", (f"file:{slr_path.as_posix()}?mode=ro",))
    L = ["## 3. Diagnóstico cruzado (solo lectura): ¿cuántos lemas de Wiktionary tienen frecuencia en OpenSLR?", ""]
    rows = []
    for pos in ("NOUN", "VERB", "ADJ", "ADV"):
        tot, hit = con.execute("""SELECT COUNT(DISTINCT e.word_key),
                COUNT(DISTINCT CASE WHEN f.word_key IS NOT NULL THEN e.word_key END)
                FROM entry e LEFT JOIN slr.freq_by_key f ON f.word_key=e.word_key
                WHERE e.kind='lemma' AND e.pos_norm=? AND e.is_multiword=0 AND e.valid_word=1""", (pos,)).fetchone()
        rows.append((pos, n(tot), n(hit), f"{hit / max(tot, 1):.1%}"))
    L += [table(rows, ["Categoría", "Lemas (muestra)", "Con frecuencia en SLR21", "Cobertura"]), "",
          "Los lemas sin coincidencia exacta pueden aparecer en SLR21 solo como formas flexionadas (p. ej. verbos conjugados); "
          "la unión forma→lema se resolverá en el procesamiento completo.", ""]
    bands = con.execute("""SELECT CASE WHEN f.count_sum IS NULL THEN '0 ausente'
                 WHEN f.count_sum>=1000 THEN '1 >=1000' WHEN f.count_sum>=100 THEN '2 100-999'
                 WHEN f.count_sum>=10 THEN '3 10-99' ELSE '4 1-9' END b, COUNT(DISTINCT e.word_key)
               FROM entry e LEFT JOIN slr.freq_by_key f ON f.word_key=e.word_key
               WHERE e.kind='lemma' AND e.is_multiword=0 AND e.valid_word=1 GROUP BY b ORDER BY b""").fetchall()
    L += [table([(b[2:], n(c)) for b, c in bands], ["Banda de frecuencia (SLR21)", "Lemas de Wiktionary (muestra)"]), ""]
    con.close()
    return L


# --------------------------------------------------------------------------
def report_mcr(path: Path) -> list[str]:
    con = sqlite3.connect(path)
    m = meta(con)
    L = [f"## 4. MCR 3.0 (WordNet español) — `{path.name}`", "",
         f"- Archivo: `{m.get('input_file')}` · SHA-256: `{m.get('input_sha256')}` · tablas: {m.get('tables')} · errores de parseo: {m.get('parse_errors')}", "",
         "Cargado de forma genérica (sin asumir el esquema). **Todavía no se calculan lemas/sustantivos/verbos/adjetivos del MCR**: "
         "primero hay que identificar qué tablas contienen las variantes en español, las categorías y las relaciones.", ""]
    tabs = con.execute("SELECT orig_name, sqlite_name, n_rows, columns_json FROM _tables ORDER BY n_rows DESC").fetchall()
    L += [table([(a, n(c), ", ".join(json.loads(d))[:100]) for a, _, c, d in tabs], ["Tabla", "Filas", "Columnas"]), ""]
    cand = [t for t in tabs if re.search(r"spa|variant|synset|relation|word", t[0], re.I)][:6] or tabs[:6]
    for orig, sname, nrows, _ in cand:
        rows = con.execute(f'SELECT * FROM "{sname}" LIMIT 3').fetchall()
        L += [f"**{orig}** — 3 filas de ejemplo:", ""] + [f"- `{r}`" for r in rows] + [""]
    con.close()
    return L


def main() -> int:
    C.setup_console()
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--wikt", type=Path, default=C.STAGING / "wikt_sample.sqlite")
    ap.add_argument("--openslr", type=Path, default=C.STAGING / "openslr_slr21.sqlite")
    ap.add_argument("--mcr", type=Path, default=C.STAGING / "mcr30_2016.sqlite")
    ap.add_argument("--out", type=Path, default=C.REPORTS / "sample_report.md")
    args = ap.parse_args()

    L = ["# Informe de muestra — banco léxico", "",
         f"Generado: {C.utcnow()} · pipeline {C.PIPELINE_VERSION}", "",
         "> Informe de **diagnóstico**: cada fuente se evalúa por separado; no se construyó ninguna base combinada.", ""]
    ran = False
    for label, path, fn in (("Wiktionary", args.wikt, report_wikt), ("OpenSLR", args.openslr, report_openslr),
                            ("MCR", args.mcr, report_mcr)):
        if path.exists():
            L += fn(path)
            ran = True
        else:
            L += [f"## {label}", "", f"_No se encontró `{path.name}` (aún no se procesó esta fuente)._", ""]
    if args.wikt.exists() and args.openslr.exists():
        L += cross_check(args.wikt, args.openslr)
    if not ran:
        print("No hay ninguna base de staging para reportar.")
        return 2
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text("\n".join(L) + "\n", encoding="utf-8")
    print("\n".join(L))
    print(f"\nInforme guardado en: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
