# CulturaDB — base cultural para la app de composición de canciones

Pipeline reproducible en Python que arma la base de estímulos creativos (libros, películas, series, canciones, poemas,
citas, guiones, personajes, prompts originales e imágenes) **solo con fuentes oficiales, APIs y datasets abiertos**,
conserva el origen y las condiciones de uso de cada registro y genera un Excel listo para alimentar los Juegos.

> **Estado honesto de este entregable.** El código está probado con 36 pruebas automáticas que usan respuestas
> *simuladas* (no hay internet en mi entorno), y con una prueba de carga de 30.000 filas sintéticas. **No se ejecutó
> contra las APIs reales.** Las consultas (SPARQL, MusicBrainz, Open Library, Commons) pueden necesitar un ajuste en tu
> primera corrida; por eso existen `doctor` y `--max`. **Esta carpeta no contiene ningún registro cultural todavía**:
> los datos aparecen cuando vos corrés los colectores. Nada se inventa ni se completa para llegar a un número.

## 1. Requisitos (Windows 10)

- Python 3.10 o superior desde python.org (marcá **Add Python to PATH** al instalar).
- Internet. Todo es gratis; no hace falta ninguna API key.

## 2. Instalación (PowerShell, dentro de la carpeta del proyecto)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py init
```

Si PowerShell bloquea el script de activación: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

**Obligatorio:** abrí `config\settings.yaml` y reemplazá `COMPLETAR_CON_TU_EMAIL` por tu mail real. Wikimedia,
MusicBrainz y Open Library exigen un User-Agent con contacto; sin eso el pipeline se niega a consultar.

## 3. Verificación inicial (hacela antes de lanzar corridas grandes)

```powershell
python -m unittest discover -s tests -t .      # debe terminar en OK
python run.py doctor                           # muestra qué clase es cada QID de Wikidata y dónde confirmar licencias
python run.py collect wikidata --tipos libro --max 50
python run.py collect openlibrary --max 100
python run.py collect musicbrainz --max 100
python run.py collect commons --max 50
python run.py report
```

Si una consulta devuelve 0 registros o errores, mirá `data\logs\cdb.log`. Los QIDs y las consultas están en
`config\wikidata_classes.yaml` y `config\queries.yaml` y se editan sin tocar código.

## 4. Corrida completa

```powershell
python run.py seeds-wikiquote                  # lista de autores con página en es.wikiquote (para citas)
python run.py collect all                      # wikidata, openlibrary, gutendex, musicbrainz, commons, wikiquote, prompts
python run.py near-dups                        # detecta prompts/citas casi iguales (usa --aplicar para marcarlos)
python run.py check-links                      # muestra de 500 enlaces; --todos para comprobarlos todos
python run.py report                           # cantidades por categoría, redistribución y faltantes
python run.py export                           # genera Excel, CSV e informes
```

- Puede tardar **varias horas**: respeta los límites de cada servicio (p. ej. 1 pedido/segundo en MusicBrainz).
- Podés cortar con `Ctrl+C` y seguir después: lo ya pedido queda en `data\cache` (30 días) y lo ya guardado no se duplica.
- Cada categoría deja de pedirse al llegar a su referencia × 1,3 (`config\targets.yaml`); `--sin-tope` lo desactiva.

Salida en `data\exports\<fecha_hora>\` (y copia en `data\exports\ultimo\`):

| Archivo | Contenido |
|---|---|
| `cultura_db.xlsx` | README, RESUMEN, CATALOGO, LIBROS, PELICULAS, SERIES, CANCIONES, POEMAS, CITAS, GUIONES, PERSONAJES, PROMPTS, IMAGENES, FUENTES_Y_LICENCIAS (+ PENDIENTES). Filtros, encabezado fijo, Arial. |
| `catalogo.csv` | Tabla maestra solo con verificados, UTF-8, para importar en la app |
| `pendientes.csv`, `rechazados.csv`, `duplicados.csv` | Lo que **no** cuenta como válido y por qué |
| `cambios.csv` | Registros agregados o retirados desde la exportación anterior |
| `informe.md` / `informe.json` | Cantidades, cobertura, licencias, redistribución |
| `fuentes_consultadas.md` | Fuentes, licencias a confirmar y corridas |

## 5. Qué cuenta como "registro válido"

Solo `estado_verificacion = verificado`: pasa la validación estructural (título/autor/URL/fecha/licencia), las reglas de
derechos, no está duplicado y su enlace no está roto (404/410). Pendientes y rechazados **no** entran en el total.
El informe te dice cuántos válidos hay por categoría y cuánto falta; si una categoría no llega, el faltante se
redistribuye solo hacia categorías con excedente verificado y el resto queda declarado como "sin cubrir".

## 6. Incorporar registros nuevos sin duplicar

- **Volver a correr un colector** es seguro: el `id` y la clave de deduplicación son estables; lo igual se ignora y lo
  que cambió en la fuente se actualiza.
- **Cargas manuales** (citas curadas, guiones de dominio público, personajes de documentales, etc.): completá una plantilla
  de `data\manual\plantilla_<categoria>.csv`, guardala con otro nombre y corré `python run.py add data\manual\mi_archivo.csv`.
  Cada fila debe traer `fuente`, `url_fuente`, `derechos` y `licencia`; si falta algo se rechaza y queda en `rechazados.csv`.
- **Prompts originales:** lotes `.jsonl` en `data\prompts\` (formato en `data\prompts\README.md`) y `python run.py collect prompts`.
- Después de cualquier carga: `python run.py export` y revisá `cambios.csv`.

## 7. Duplicados

- **Exacto:** mismo contenido crudo (mismo `hash_crudo`): se ignora y se registra.
- **Normalizado:** misma `clave_deduplicacion` (sin tildes, mayúsculas, puntuación ni artículos iniciales; película/serie
  distinguen por año) pero distinto origen o escritura: se conserva el primero y el otro queda en `duplicados` con su fuente.
- **Casi duplicados** (prompts y citas): similitud de Jaccard ≥ 0,85, con `near-dups`.
- No se fusionan datos de dos fuentes en un mismo registro, para no mezclar condiciones de uso.

## 8. Derechos: reglas que aplica el código

1. Solo se guarda **texto** (citas, frases, texto breve) si `derechos` es `dominio_publico`, `licencia_abierta`,
   `autorizacion_expresa` u `original`. De lo contrario el registro se rechaza o queda pendiente.
2. Obras protegidas: solo metadatos y enlace. No hay letras ni diálogos protegidos.
3. Dominio público: se calcula como fallecimiento del autor + 70 años (Ley 11.723) y se anota un aviso de verificación.
   Una cita de Wikiquote solo se acepta si el autor tiene plazo vencido **y** su lengua materna coincide con el idioma de la
   página (para no tomar traducciones, que se protegen aparte). **Consultalo con tu abogado**, en especial el régimen de
   "dominio público pagante" que, según tengo entendido, existe en Argentina, y la jurisdicción desde la que publiques la app.
4. Imágenes: solo CC0, dominio público, CC BY y CC BY-SA; se descartan NC y ND. Se guardan autor, licencia y atribución.
5. MusicBrainz: el colector **no copia etiquetas** (datos suplementarios no comerciales); solo datos principales CC0.
6. Confirmá cada licencia en los enlaces de `python run.py doctor` antes de publicar: pueden cambiar.

## 9. Límites conocidos

- Las categorías de **citas** y **guiones** son el cuello de botella: pocas fuentes abiertas traen cita + fuente + autor
  con derechos resueltos. Es esperable que queden por debajo de su referencia; el informe lo muestra sin maquillaje.
- Guiones: no hay colector automático (por derechos); se cargan a mano con `add`.
- Documentales y personajes reales de documentales: carga manual (`extra_naturaleza` = real).
- `idioma` es el idioma de la etiqueta en la fuente, no necesariamente el de la obra.
- `juegos_compatibles` queda vacío hasta que completes `config\juegos_map.yaml` con los IDs de tus 32 Juegos.
- El enlace a YouTube de las canciones no se obtiene automáticamente (se agrega a mano o con una futura mejora).

Más detalle: `docs\ESQUEMA.md` (columnas y reglas) y `docs\ARQUITECTURA.md` (flujo y módulos).
