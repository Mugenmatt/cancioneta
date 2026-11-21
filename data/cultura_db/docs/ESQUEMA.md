# Esquema de datos

## Tabla maestra (hoja CATALOGO y `catalogo.csv`)

Nombres en ASCII para importar sin problemas en la app (`anio` = año, `genero` = género, `tematica` = temática,
`descripcion` = descripción, `atribucion` = atribución, `fecha_verificacion` = fecha de verificación).

| Columna | Descripción |
|---|---|
| `id` | Identificador estable `PREFIJO-<12 hex>` (LIB, PEL, SER, CAN, POE, CIT, GUI, PER, PRO, IMG). Se deriva de la clave de deduplicación del primer ingreso y no cambia. |
| `categoria` | libro, pelicula, serie, cancion, poema, cita, guion, personaje, prompt, imagen |
| `contenido_o_titulo` | Título, nombre, texto de la cita o del prompt |
| `autor_artista_creador` | Autor / director / creador / artista / fotógrafo |
| `obra` | Obra de origen (personajes, citas, guiones) |
| `personaje` | Personaje (guiones) |
| `anio` | Año (entero cuando es posible) |
| `idioma` | Idioma de la etiqueta/título en la fuente |
| `variante` | Variante o traducción documentada |
| `genero`, `tematica` | Listas separadas por ` | ` |
| `etiquetas` | Etiquetas en minúscula separadas por `|` |
| `descripcion` | Descripción o sinopsis breve disponible en la fuente |
| `texto_breve` | Texto solo si los derechos lo permiten |
| `fuente` | Clave de fuente (wikidata, openlibrary, gutendex, musicbrainz, commons, wikiquote, prompts_originales, manual) |
| `url_fuente` | URL directa de la ficha de origen del dato |
| `url_externa` | Enlace para leer/escuchar/investigar (o URL de la imagen) |
| `derechos` | dominio_publico, licencia_abierta, autorizacion_expresa, original, metadatos_obra_protegida, pendiente_verificacion |
| `licencia` | Licencia aplicable al dato o a la obra |
| `atribucion` | Texto de atribución a mostrar |
| `restricciones` | Condiciones de uso y avisos |
| `fecha_verificacion` | Fecha en que el pipeline validó el registro contra su fuente |
| `estado_verificacion` | verificado / pendiente (los rechazados van aparte) |
| `enlace_verificado` | ok / roto / inconcluso / sin_comprobar |
| `uso_recomendado` | Desde `config/juegos_map.yaml` |
| `juegos_compatibles` | IDs de Juegos separados por `|` (desde `config/juegos_map.yaml`) |
| `clave_deduplicacion` | Clave normalizada usada para detectar duplicados |
| `id_externo` | ID en la fuente (QID, MBID, clave de Open Library, etc.) |
| `extra_json` | Campos propios de cada categoría (álbum, personajes_relevantes, medio, tipo_prompt, …) |

## Clave de deduplicación por categoría

| Categoría | Clave |
|---|---|
| libro, poema, canción | título normalizado + autor normalizado |
| película, serie | título normalizado + año (distingue remakes) |
| cita, guion | huella del texto + autor |
| personaje | nombre + obra |
| prompt | huella del texto |
| imagen | URL canónica de la página de origen |

Normalización: minúsculas, sin tildes (se conserva la ñ), sin puntuación, espacios colapsados, sin artículo inicial.

## Hojas por categoría

Cada hoja muestra las columnas relevantes con encabezados propios (por ejemplo, LIBROS: titulo, autor, anio, genero,
tematica, sinopsis…; PELICULAS: director, personajes_relevantes…; IMAGENES: url_imagen, autor, licencia, atribucion…),
más fuente, derechos, licencia, fecha y juegos_compatibles. La definición está en `src/cdb/schema.py`.

## Estados

- **verificado**: cuenta para el total.
- **pendiente**: derechos sin resolver, enlace roto o casi duplicado. No cuenta. Se lista en PENDIENTES.
- **rechazado**: falla una regla fatal (sin etiqueta, sin fuente, URL malformada, texto sin derechos, título igual a autor…).
  Queda en `rechazados.csv` con el motivo.
