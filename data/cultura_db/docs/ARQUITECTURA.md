# Arquitectura

```
 config/*.yaml ──► colectores ──► Record ──► validate ──► store (SQLite) ──► export
   (fuentes,        wikidata        (esquema)   reglas de     records            cultura_db.xlsx
    consultas,      openlibrary                 derechos      duplicates         catalogo.csv
    objetivos)      gutendex                    y calidad     rejected           informes / cambios
                    musicbrainz                               link_checks
                    commons                                   exports / runs
                    wikiquote
                    prompts_local
                    manual (CSV/JSONL)
```

## Carpetas

```
cultura_db/
  run.py                       punto de entrada
  requirements.txt             requests, PyYAML, openpyxl
  config/                      settings, targets, wikidata_classes, sources, queries, juegos_map
  src/cdb/
    schema.py normalize.py licensing.py validate.py   reglas y esquema
    http.py                    User-Agent con contacto, límite por host, reintentos, caché en disco
    store.py                   SQLite: ingesta idempotente y registro de duplicados/rechazados
    runner.py                  ejecución de colectores con topes por categoría
    checks.py                  comprobación de enlaces y casi duplicados
    report.py                  informes y redistribución del faltante
    export.py                  Excel (14 hojas + PENDIENTES), CSV, cambios
    cli.py                     comandos
    collectors/                un colector por fuente
  data/                        prompts/ manual/ seeds/ db/ cache/ exports/ logs/
  tests/                       36 pruebas (datos simulados)
  docs/
```

## Decisiones de diseño

- **Idempotencia:** `id` y `clave_deduplicacion` estables; volver a correr no duplica. Si cambia la fuente, se actualiza.
- **Origen siempre conservado:** cada fila guarda `fuente`, `url_fuente`, `id_externo`, licencia y atribución. Los
  duplicados de otra fuente se registran aparte y no se fusionan (no se mezclan condiciones de uso).
- **Cortesía con las fuentes:** User-Agent con contacto obligatorio, pausa mínima por host configurable, reintentos
  con espera y `Retry-After`, caché de 30 días; sin scraping de HTML (solo APIs/SPARQL/dumps).
- **Derechos como regla de código:** el texto solo se almacena cuando `derechos` lo permite; lo demás son metadatos y enlace.
- **Honestidad de cantidades:** el total válido cuenta solo `verificado`; el informe muestra pendientes, rechazados y faltante.
- **Redistribución:** el faltante de una categoría pasa a otras con excedente verificado, según `pesos_redistribucion`,
  nunca más que ese excedente.
- **Excel de gran tamaño:** modo write-only (memoria constante; 30.000 filas en unos segundos y ~150 MB de RAM).
  Los textos que empiezan con `=`, `+`, `-`, `@` se escriben como texto literal.

## Extender

Un colector nuevo hereda de `Collector`, implementa `collect()` como generador de `Record` y se registra en `cli.py`.
Todo lo demás (validación, duplicados, derechos, informes, exportación) se aplica solo.
