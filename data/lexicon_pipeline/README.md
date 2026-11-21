# Pipeline del banco léxico — fase de MUESTRA

Objetivo de esta fase: comprobar **calidad, cantidad, utilidad y compatibilidad legal** de cada fuente
**antes** de construir la base definitiva. No se genera `lexicon_master.*`. No se mezclan fuentes.

Solo usa la biblioteca estándar de Python (3.10 o superior). No hay que instalar nada con pip.

## Estructura de carpetas

```
lexicon_pipeline/
├─ config/
│  ├─ sources_manifest.csv      # manifiesto de fuentes (URL, licencia, atribución, estado)
│  └─ pinned_hashes.csv         # (se crea) hashes revisados y fijados a mano
├─ data/                        # NO se versiona; es todo regenerable
│  ├─ raw/<fuente>/             # archivos descargados, sin tocar
│  ├─ staging/                  # una base SQLite por fuente, separadas
│  ├─ manifests/downloads.jsonl # procedencia: URL, fecha, tamaño, SHA-256 de cada descarga
│  └─ reports/                  # informes (sample_report.md)
├─ docs/LICENCIAS_Y_RESTRICCIONES.md
├─ lexpipe/                     # código compartido (normalización, parsers)
├─ scripts/                     # comandos que se ejecutan
├─ sql/                         # staging_*.sql y core_preliminar.sql (esquema final PRELIMINAR, sin usar aún)
└─ tests/                       # pruebas con datos sintéticos (no son datos reales)
```

## Pasos (Windows, en la carpeta del proyecto)

```bat
py tests\test_pipeline.py                         :: 1. comprobar que el código funciona
py scripts\download_sources.py --dry-run          :: 2. ver tamaños/URLs sin descargar
py scripts\download_sources.py                    :: 3. descargar Wiktextract y OpenSLR
:: MCR: descargar a mano el zip de la release 2016 desde https://adimen.ehu.eus/web/MCR y luego:
py scripts\download_sources.py --register-manual mcr30_2016 C:\ruta\al\archivo.zip
py scripts\verify_integrity.py                    :: 4. verificar hashes e integridad
py scripts\inspect_formats.py jsonl data\raw\wiktextract_es\raw-wiktextract-data.jsonl.gz
py scripts\inspect_formats.py json  data\raw\openslr_slr21\es_wordlist.json.tgz
py scripts\stage_mcr_dump.py --list-only          :: 5. ver tablas del MCR
py scripts\stage_wiktextract.py --stride 10       :: 6. muestra de Wiktionary (1 de cada 10 líneas)
py scripts\stage_openslr.py
py scripts\stage_mcr_dump.py
py scripts\sample_report.py                       :: 7. informe: data\reports\sample_report.md
```

Si algún paso falla o los números son raros, **pegá la salida en el chat**: los parsers se ajustan a los
datos reales (la estructura exacta de varios archivos no pudo verificarse de antemano).

## Integridad

* Cada descarga queda registrada con SHA-256 en `data/manifests/downloads.jsonl`.
* `verify_integrity.py` revisa existencia, tamaño, hash y que los .gz/.tgz/.zip se lean completos.
* Tras revisar una fuente a mano: `py scripts\verify_integrity.py --pin wiktextract_es_raw --note "revisado"`.
  Desde entonces, si el archivo cambia, la verificación lo marca como "cambió upstream".
* `--write-checksums` genera `data/raw/SHA256SUMS`.

## Reglas de diseño vigentes

1. Una base de staging por fuente; ninguna base combinada ni distribuible en esta fase.
2. Lema ≠ acepción ≠ forma flexionada ≠ categoría: tablas distintas; los informes nunca cuentan acepciones como palabras.
3. Claves de comparación: NFC + casefold **conservando tildes** (cántaro ≠ cantaro).
4. Datamuse (deshabilitada) y RAE API (excluida) no se consultan ni se descargan.
5. Todo registro conserva su fuente; los IDs definitivos serán estables (ver `sql/core_preliminar.sql`).
