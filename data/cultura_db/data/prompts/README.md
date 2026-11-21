# Lotes de prompts originales

Un archivo `.jsonl` por lote (una línea = un prompt), por ejemplo `lote_001_situaciones.jsonl`.

Formato de cada línea:

```json
{"texto": "...", "tipo": "situaciones", "tematica": "...", "etiquetas": ["...", "..."], "idioma": "es"}
```

`tipo` debe ser una clave de `prompts_plan` en `config/targets.yaml`:
situaciones 400, escenarios 400, relaciones 360, conflictos 360, emociones 360, objetos 360, recuerdos 360,
imagenes_mentales 360, situaciones_extranas 360, contradicciones 340, historias_incompletas 340 (total 4.000).

Reglas: mínimo 40 caracteres, máximo 700; originales (no atribuidos a ningún autor ni obra); sin repeticiones
(el pipeline descarta duplicados exactos/normalizados y `near-dups` detecta los casi iguales).

Comando: `python run.py collect prompts`
