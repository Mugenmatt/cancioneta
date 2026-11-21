# Informe de licencias y restricciones (preliminar)

Fecha de las consultas: 18/11/2026. **No es asesoramiento legal.** Sirve para ordenar qué hay que decidir y qué conviene llevar a una revisión legal antes de distribuir cualquier dato dentro de la app.

## 1. Resumen por fuente

| Fuente | Licencia indicada por la fuente | ¿Permite uso comercial? | ¿ShareAlike? | Estado en este pipeline |
|---|---|---|---|---|
| Wiktionary es (Wiktextract / kaikki.org) | CC BY-SA y GFDL (según kaikki.org) | Sí, con condiciones | **Sí** | Se procesa en staging aislado. **No distribuible hasta revisión legal.** |
| OpenSLR SLR21 (frecuencias) | CC BY-SA 3.0 (OpenSLR: "CC BY-SA 3.0 US") | Sí, con condiciones | **Sí** | Staging aislado. **No distribuible hasta revisión legal** (además, ver punto LDC). |
| MCR 3.0 / Spanish WordNet | CC BY 3.0 (todo salvo `engWN/`, que sigue la licencia de WordNet de Princeton) | Sí ("libre para uso comercial y de investigación", según UPC) | No | Fuente prioritaria para relaciones. Requiere atribución. |
| Datamuse | Términos de uso del proveedor (no es licencia abierta) | Sin confirmar | n/a | **Deshabilitada.** Sin descargas masivas. |
| RAE API (no oficial) | Aviso legal: contenido de la RAE, ofrecido para uso educativo y personal | No autorizado para redistribuir | n/a | **Excluida** de la base distribuible. No se descarga nada. |

## 2. Qué implicaría usar y redistribuir datos CC BY-SA en una app comercial

Lo que sigue describe obligaciones **típicas** de las licencias Creative Commons BY-SA. Hay que confirmarlas con un abogado para este caso concreto.

1. **Atribución.** Hay que acreditar la fuente (autores/proyecto, título, enlace, licencia con su enlace) e **indicar que los datos fueron modificados**. En la práctica: pantalla de "Créditos y licencias" en la app y archivo de avisos en cada módulo de datos. Texto propuesto en el manifiesto (`attribution_text`).
2. **ShareAlike sobre las adaptaciones.** Si lo que se distribuye es una *adaptación* de datos BY-SA, esa adaptación debe ofrecerse bajo la misma licencia (o una compatible). Un conjunto de lemas, definiciones, etiquetas y relaciones extraído y transformado de Wiktionary es, con alta probabilidad, una adaptación de esa base. Consecuencia: **el módulo de datos derivado de Wiktionary tendría que poder ser reutilizado libremente bajo CC BY-SA**, aunque la app se cobre.
3. **Una colección no es una adaptación.** Creative Commons distingue entre mezclar obras hasta que no se distinguen (adaptación) y reunirlas como piezas separadas (colección); en el segundo caso, la condición SA se queda en la pieza original. De ahí la decisión de diseño de mantener **un archivo de datos por fuente**, sin fundirlos.
4. **Alcance sobre el resto de la app (decisión legal abierta).** No está claro, y es una pregunta típica para el abogado, si el hecho de que la app *consulte* un módulo BY-SA extiende SA al código, a los textos de los Juegos o a los demás datos. El diseño que reduce el riesgo: módulos separados, contenido propio (listas curadas, textos, lógica de juegos) en archivos distintos y sin derivar de datos SA.
5. **Cobrar suscripción.** BY-SA (sin cláusula NC) no prohíbe cobrar por la app. Lo delicado no es el precio sino que **los destinatarios puedan ejercer los derechos de la licencia sobre el módulo de datos** (copiarlo, modificarlo, redistribuirlo).
6. **Medidas técnicas de protección (DRM) / tiendas de apps.** Las licencias CC restringen imponer medidas técnicas que impidan a los destinatarios ejercer la licencia. Las tiendas de apps aplican protecciones propias. Una mitigación habitual es publicar además el módulo de datos en un repositorio público sin restricciones. **Punto a confirmar con el abogado**, incluyendo cómo trata esto la versión exacta de la licencia.
7. **Derechos sobre bases de datos (UE).** Las versiones 3.0 y 4.0 de CC tratan distinto los derechos *sui generis* sobre bases de datos. Extraer una parte sustancial de una base de datos puede estar sujeto a esos derechos según la jurisdicción. Confirmar jurisdicción aplicable.
8. **Compatibilidad de versiones al mezclar fuentes SA.** Wiktionary (CC BY-SA, versión a confirmar en el dump, y GFDL) y SLR21 (CC BY-SA 3.0) no deberían fundirse en un único derivado hasta aclarar si sus licencias son compatibles entre sí. Por eso **no se construye ninguna base combinada** en esta fase (el cruce de diagnóstico es de solo lectura).

## 3. Puntos específicos por fuente

**Wiktextract / Wiktionary.** Se descarga un archivo que kaikki.org marca como obsoleto en su página de datos crudos; el pipeline registra el archivo exacto (SHA-256 y fecha) para fijar la versión. El contenido original pertenece a los colaboradores de Wiktionary. Es la única fuente de la lista con etiquetas regionales y de registro, por lo que su valor para español argentino puede ser alto; eso se medirá en la muestra.

**OpenSLR SLR21.** OpenSLR indica que los datos derivan del corpus LDC Spanish Gigaword (LDC2011T12) y que no incluye componentes de los datasets de LDC. Pregunta para el abogado: ¿los conteos de frecuencia derivados de un corpus con licencia LDC arrastran restricciones del corpus original? Alternativa si hay dudas: obtener frecuencias propias a partir de un corpus de licencia clara, o usar solo bandas de frecuencia (no los conteos crudos).

**MCR 3.0.** Licencia CC BY 3.0: atribución y nada más. Dos advertencias: (a) los datos de `engWN/` siguen la licencia de WordNet de Princeton (permisiva, con aviso de copyright obligatorio; confirmar el texto vigente en su página); si las relaciones semánticas se toman de esa carpeta hay que atribuir también a WordNet; (b) las relaciones pueden estar almacenadas sobre synsets inglés/ILI y no por palabra española: se confirmará al inspeccionar las tablas. Cita sugerida por el MCR: Gonzalez-Agirre, Laparra y Rigau (2012), *Multilingual Central Repository version 3.0*, GWC'12.

**Datamuse.** Relaciones semánticas solo para inglés; desde el 1/2/2027 exige API key. Se permite consulta puntual, pero no hay autorización confirmada para uso comercial ni para descarga masiva. No se utiliza en este pipeline.

**RAE API.** Excluida por sus condiciones. No se guarda ningún contenido suyo.

## 4. Decisiones que requieren revisión legal

| # | Pregunta | Opciones a evaluar |
|---|---|---|
| D1 | ¿El módulo derivado de Wiktionary es una adaptación sujeta a SA? | Asumir que sí (recomendado hasta que un abogado diga lo contrario). |
| D2 | ¿SA se extiende a la app o a otros datos que la consultan? | Módulos separados + contenido propio aparte; opinión legal por escrito. |
| D3 | DRM de tiendas de apps vs. obligaciones CC | Publicar el módulo de datos en repositorio abierto como copia sin restricciones. |
| D4 | ¿Se pueden combinar Wiktionary y SLR21 en un solo derivado? | Mantener módulos separados y unir en tiempo de ejecución, o reemplazar SLR21. |
| D5 | Origen LDC de SLR21 | Pedir aclaración a OpenSLR/LDC o sustituir la fuente de frecuencias. |
| D6 | Relaciones del MCR tomadas de `engWN/` | Atribución a WordNet o limitarse a datos de las carpetas bajo CC BY. |
| D7 | Derechos sui generis sobre la base | Confirmar jurisdicción del titular de la app. |
| D8 | Uso comercial futuro de Datamuse | Solicitar autorización escrita al proveedor antes de cualquier uso. |

## 5. Si la respuesta legal fuera "no aceptamos ShareAlike"

Hay alternativas que no dependen de Wiktionary ni de SLR21: usar el MCR (CC BY) como base de conceptos y relaciones, y construir listas propias y frecuencias propias a partir de corpus de licencia clara. Tiene un costo: probablemente menos vocabulario argentino y menos formas, y habría que medirlo. Esta decisión se toma después de ver la muestra.

## 6. Qué se verificó y qué no

**Verificado en las páginas oficiales (18/11/2026):** licencia y descripción de SLR21 y su nombre de archivo; licencia CC BY 3.0 del Spanish WordNet/MCR 3.0 y la excepción de `engWN/`; que la release 2016 se distribuye como volcado SQL para MySQL (zip/tgz de ~51 MB); que la página de datos crudos de kaikki está marcada como obsoleta; el límite de relaciones semánticas solo en inglés y el cambio de febrero de 2027 de Datamuse; el aviso legal y los límites de la RAE API.

**No verificado todavía:** la estructura real de los registros de Wiktextract en español (el parser es tolerante y hay un inspector); la URL de descarga exacta del archivo de kaikki (informada por un tercero) y los enlaces de descarga del MCR (descarga manual); el formato interno de `es_wordlist.json`; el esquema de tablas del MCR; el texto exacto de la licencia GFDL/CC BY-SA incluido en el dump.
