from __future__ import annotations

import json
import sqlite3
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WIKT = ROOT / "data/staging/wikt_full.sqlite"
OPENSLR = ROOT / "data/staging/openslr_slr21.sqlite"
OUT = Path(__file__).resolve().parents[3] / "src/data/lexiconReal.ts"
MAP_OUT = Path(__file__).resolve().parents[3] / "src/data/mapRelationsReal.ts"

POS_LIMITS = {"NOUN": 12000, "VERB": 8000, "ADJ": 9000}
REGISTER_BLOCKLIST = ("vulgar", "despectivo", "ofensivo", "racista", "homofob")
PART_SERIES_OVERLAP_THRESHOLD = 3


def quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def filter_noisy_map_relations(
    source: dict[str, dict[str, list[str]]],
) -> dict[str, dict[str, list[str]]]:
    parts_by_key = {key: set(value["parts"]) for key, value in source.items()}
    keys = sorted(parts_by_key)
    drop: set[tuple[str, str]] = set()

    for key in keys:
        for target in parts_by_key[key]:
            if key in parts_by_key.get(target, set()):
                drop.add((key, target))

    for index, key in enumerate(keys):
        for other in keys[index + 1:]:
            shared = parts_by_key[key] & parts_by_key[other]
            if len(shared) >= PART_SERIES_OVERLAP_THRESHOLD:
                for target in shared:
                    drop.add((key, target))
                    drop.add((other, target))

    filtered: dict[str, dict[str, list[str]]] = {}
    for key, value in source.items():
        parts = [target for target in value["parts"] if (key, target) not in drop]
        if parts or value["derived"]:
            filtered[key] = {"parts": parts, "derived": value["derived"]}
    return filtered


def main() -> None:
    con = sqlite3.connect(WIKT)
    con.execute(f"ATTACH DATABASE '{OPENSLR.as_posix()}' AS o")

    lemmas: dict[str, list[str]] = {}
    for pos, limit in POS_LIMITS.items():
        rows = con.execute(
            """
            SELECT e.word, e.word_key, coalesce(f.count_sum, 0) AS freq, e.registers
            FROM entry e
            LEFT JOIN o.freq_by_key f ON f.word_key = e.word_key
            WHERE e.lang_code = 'es' AND e.kind = 'lemma' AND e.valid_word = 1
              AND e.is_multiword = 0 AND e.n_senses > 0 AND e.pos_norm = ?
              AND coalesce(f.count_sum, 0) >= 10
            ORDER BY freq DESC, e.word_key ASC
            """,
            (pos,),
        ).fetchall()
        picked: list[str] = []
        seen: set[str] = set()
        for word, key, _freq, registers in rows:
            lowered = (registers or "").lower()
            if any(blocked in lowered for blocked in REGISTER_BLOCKLIST):
                continue
            if pos == "VERB" and not (word.lower().endswith(("ar", "er", "ir", "ír")) or word.lower() in {"ser", "ir", "oir"}):
                continue
            if key in seen:
                continue
            seen.add(key)
            picked.append(word)
            if len(picked) >= limit:
                break
        lemmas[pos] = picked

    selected_keys = {
        word.casefold()
        for words in lemmas.values()
        for word in words
    }
    selected_display = {
        word.casefold(): word
        for words in lemmas.values()
        for word in words
    }

    relations: dict[str, dict[str, list[str]]] = {}
    if selected_keys:
        con.execute("CREATE TEMP TABLE selected (word_key TEXT PRIMARY KEY)")
        con.executemany("INSERT INTO selected VALUES (?)", ((key,) for key in selected_keys))
        rows = con.execute(
            """
            SELECT e.word_key, r.rel_type, r.target_key
            FROM relation r
            JOIN entry e ON e.entry_id = r.entry_id
            WHERE e.lang_code = 'es'
              AND e.word_key IN (SELECT word_key FROM selected)
              AND r.target_key IN (SELECT word_key FROM selected)
            ORDER BY e.word_key, r.rel_type, r.target_key
            """
        ).fetchall()
        type_map = {
            "synonym": "synonyms",
            "hypernym": "hypernyms",
            "hyponym": "hyponyms",
            "related": "related",
        }
        for key, rel_type, target_key in rows:
            bucket = type_map.get(rel_type)
            if not bucket or target_key == key:
                continue
            item = relations.setdefault(key, {"synonyms": [], "hypernyms": [], "hyponyms": [], "related": []})
            value = selected_display[target_key]
            if value not in item[bucket] and len(item[bucket]) < 12:
                item[bucket].append(value)

    map_relations: dict[str, dict[str, list[str]]] = {}

    def add_map_relation(key: str, bucket: str, target_key: str) -> None:
        if target_key == key or target_key not in selected_keys:
            return
        item = map_relations.setdefault(key, {"parts": [], "derived": []})
        value = selected_display[target_key]
        if value not in item[bucket] and len(item[bucket]) < 12:
            item[bucket].append(value)

    for key, rel_type, target_key in rows:
        if rel_type == "meronym":
            add_map_relation(key, "parts", target_key)

    form_of_rows = con.execute(
        """
        SELECT e.word_key, s.form_of
        FROM sense s
        JOIN entry e ON e.entry_id = s.entry_id
        WHERE e.lang_code = 'es'
          AND e.word_key IN (SELECT word_key FROM selected)
          AND s.form_of IS NOT NULL AND s.form_of <> ''
          AND s.tags_json LIKE '%"form-of"%'
        """
    ).fetchall()
    for key, form_of in form_of_rows:
        for raw_target in form_of.split(";"):
            target_key = unicodedata.normalize("NFC", raw_target.strip()).casefold()
            add_map_relation(key, "derived", target_key)

    forms: list[str] = []
    seen_forms: set[str] = set()
    for words in lemmas.values():
        for word in words:
            key = word.casefold()
            if key not in seen_forms:
                seen_forms.add(key)
                forms.append(word)
    form_rows = con.execute(
        """
        SELECT f.form, coalesce(s.count_sum, 0) AS freq
        FROM form f
        JOIN entry e ON e.entry_id = f.entry_id
        LEFT JOIN o.freq_by_key s ON s.word_key = f.form_key
        WHERE e.lang_code = 'es' AND e.valid_word = 1 AND f.form_key NOT LIKE '% %'
          AND length(f.form) BETWEEN 2 AND 15 AND coalesce(s.count_sum, 0) >= 10
        GROUP BY f.form_key
        ORDER BY freq DESC, f.form ASC
        LIMIT 40000
        """,
    ).fetchall()
    for word, _freq in form_rows:
        key = word.casefold()
        if key not in seen_forms:
            seen_forms.add(key)
            forms.append(word)

    map_relations = filter_noisy_map_relations(map_relations)

    attribution = "Datos extraídos de es.wiktionary.org por Wiktextract (Tatu Ylonen) vía kaikki.org; contenido de los colaboradores de Wiktionary bajo CC BY-SA. Frecuencias: Spanish Word list (SLR21), OpenSLR, CC BY-SA 3.0."

    lines = [
        "export const lexiconSource = {",
        f"  attribution: {quote(attribution)},",
        "  license: 'CC BY-SA + GFDL (Wiktionary) / CC BY-SA 3.0 (SLR21)',",
        "  builtAt: '2026-11-20',",
        "} as const;",
        "",
        f"export const realNouns: readonly string[] = {json.dumps(lemmas['NOUN'], ensure_ascii=False)};",
        "",
        f"export const realVerbs: readonly string[] = {json.dumps(lemmas['VERB'], ensure_ascii=False)};",
        "",
        f"export const realAdjectives: readonly string[] = {json.dumps(lemmas['ADJ'], ensure_ascii=False)};",
        "",
        f"export const realInflections: readonly string[] = {json.dumps(forms, ensure_ascii=False)};",
        "",
        "export interface LexiconRelations {",
        "  synonyms: readonly string[];",
        "  hypernyms: readonly string[];",
        "  hyponyms: readonly string[];",
        "  related: readonly string[];",
        "}",
        "",
        "export const realRelations: Readonly<Record<string, LexiconRelations>> = {",
    ]
    for key in sorted(relations):
        value = relations[key]
        lines.append(
            f"  {quote(key)}: {{ synonyms: {json.dumps(value['synonyms'], ensure_ascii=False)}, hypernyms: {json.dumps(value['hypernyms'], ensure_ascii=False)}, hyponyms: {json.dumps(value['hyponyms'], ensure_ascii=False)}, related: {json.dumps(value['related'], ensure_ascii=False)} }},"
        )
    lines.extend(["};", ""])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")

    map_lines = [
        "export interface MapRelationData {",
        "  parts: readonly string[];",
        "  derived: readonly string[];",
        "}",
        "",
        "export const mapRelationSource = {",
        f"  attribution: {quote(attribution)},",
        "  license: 'CC BY-SA + GFDL (Wiktionary) / CC BY-SA 3.0 (SLR21)',",
        "  builtAt: '2026-11-20',",
        "} as const;",
        "",
        "export const mapRelationsReal: Readonly<Record<string, MapRelationData>> = {",
    ]
    for key in sorted(map_relations):
        value = map_relations[key]
        map_lines.append(
            f"  {quote(key)}: {{ parts: {json.dumps(value['parts'], ensure_ascii=False)}, derived: {json.dumps(value['derived'], ensure_ascii=False)} }},"
        )
    map_lines.extend(["};", ""])
    MAP_OUT.write_text("\n".join(map_lines), encoding="utf-8")

    print(
        json.dumps(
            {
                "output": str(OUT),
                "mapOutput": str(MAP_OUT),
                "nouns": len(lemmas["NOUN"]),
                "verbs": len(lemmas["VERB"]),
                "adjectives": len(lemmas["ADJ"]),
                "inflections": len(forms),
                "relations": len(relations),
                "mapRelations": len(map_relations),
                "bytes": OUT.stat().st_size,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
