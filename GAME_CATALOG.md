# GAME_CATALOG — Fase 0 y los 32 Juegos

Convenciones en `README.md`. Contrato técnico en `GAME_ARCHITECTURE.md`. Sorteos en `RANDOMIZATION_SYSTEM.md`. Datos en `LEXICAL_DATABASE_AND_APIS.md` y `CONTENT_DATABASE.md`.

**Regla maestra [ORIGINAL]:** los 23 Juegos originales (G-01 a G-23) no se modifican, eliminan ni fusionan. Aquí solo se precisan reglas, datos e identidad visual. Los nueve nuevos (G-24 a G-32) se agregan sin alterar los anteriores.

## Plantilla de cada Juego
Cada Juego tiene **intro** (título, objetivo, paso a paso, ejemplos, botón «Comenzar») y luego su interfaz + acceso al editor central. Los ejemplos de cada intro son **originales** (no tomados de obras protegidas). En cada ficha: *Mecánica*, *Datos*, *Sorteo*, *Estímulo visible durante la escritura* y *Identidad visual* (idea para `DESIGN_SYSTEM.md`).

---

## Fase 0 — Buscando el material (F0-1 a F0-5)

Mensaje de entrada **[ORIGINAL]**: no hace falta escribir cosas interesantes, bonitas, coherentes o útiles; el propósito es escribir sin censura, liberar la mente y entrar en flow. Fase opcional, recomendada.

| ID | Ejercicio | Mecánica | Datos / sorteo | Identidad |
|---|---|---|---|---|
| F0-1 | **Voz desatada** | Instrucciones → grabadora → reproducción → transcripción offline → seleccionar frases (marcar) → guardar fragmentos temporales → editar fragmentos sin alterar la transcripción original → exportar todos | Sin sorteo. Audio solo en carpeta temporal; ver `PRIVACY_AND_OFFLINE.md` | Íntima, oscura y cálida; onda de voz animada |
| F0-2 | **Páginas matutinas** | Escritura libre; meta de 3 páginas con indicador visual de progreso y temporizador opcional | Sin sorteo. Definir «página» como ≈ 250–300 palabras [REC] | Papel, tinta, luz de mañana |
| F0-3 | **Prompt** | Un prompt + una imagen, sorteados **independientemente**; deslizar izq/der cambia solo uno; también «cambiar ambos». Escribir prosa de 2–4 carillas | Pools `prompts` e `images` (sin IA). Recomendación de extensión: 2–4 carillas | Galería editorial |
| F0-4 | **El Espía** | Preguntas guía sobre vestimenta, gestos, historia, emociones → cuenta regresiva de **60 s** de observación → escritura | Pool `spy_questions` (sorteo sin repetición dentro del conjunto mostrado) | Cine negro, mirilla |
| F0-5 | **¿Por qué?** | Escritura libre; botón/atajo inserta «¿Por qué?» y se escribe la explicación debajo; repetir hasta 2–4 carillas. **Solo se muestran las instrucciones** | Sin datos | Minimalista, preguntas que se apilan |

Todos pueden llevar texto al editor central por acción explícita.

---

## Fase 2 — Los 23 Juegos originales

### G-01 Asociación Libre
- **Mecánica:** tres columnas de 10 palabras (30 en total), cada una configurable: sustantivos, verbos, adjetivos o sustantivos+adjetivos. Regenerar una columna o las tres con «Regenerar»; las columnas no seleccionadas no cambian.
- **Reglas críticas:** **ninguna palabra se repite entre las tres columnas**; legibilidad y espacio amplios.
- **Datos/sorteo:** `words.noun|verb|adj`; `groupSet` de huellas por partida.
- **Visible al escribir:** las 30 palabras (plegables).
- **Identidad:** tipografía grande, aire, palabras como fichas flotantes.

### G-02 Desde el Título
- **Mecánica:** una tarjeta con título o frase corta aleatoria y, **debajo, su autor**. Fuentes: libros, películas, series ficcionales, canciones, frases de personajes. Sin filtros de categoría.
- **Datos:** pool `titles` (metadatos o frases permitidas, D-04).
- **Identidad:** cubierta/portada tipográfica.

### G-03 Unión de Palabras
- **Mecánica:** elegir cantidad (**máx. 10**) y categorías (sustantivos, adjetivos, verbos); las palabras se **revelan de a una**.
- **Datos:** léxico; sin repetición dentro del conjunto.
- **Visible al escribir:** palabras reveladas.
- **Identidad:** cartas que se dan vuelta una a una.

### G-04 Contar-Mostrar (C-M)
- **Mecánica:** prompt aleatorio + **cinco patrones** siempre visibles para elegir: CCCM, MMMC, MCMC, CMCM, MCCC. Cada letra = un verso. Son recomendaciones, no reglas. Incluye explicación visual de contar (idea no visible, ej. «Aún te extraño») vs mostrar (imagen concreta, ej. «Sentado en la cafetería»).
- **Datos:** pool `prompts`.
- **Identidad:** dos tonos (C: abstracto/niebla; M: concreto/foto).

### G-05 En la Piel
- **Mecánica:** personaje de película, serie, documental o libro (prioridad ficticios; reales solo de documentales). Muestra **nombre, obra, breve descripción, enlace para investigar**. El usuario investiga y escribe como esa persona.
- **Datos:** pool `characters` (descripción propia + enlace externo).
- **Identidad:** expediente/ficha con silueta.

### G-06 Palabra Portal
- **Mecánica:** palabra inicial relacionada con un lugar (bosque, ruta, mar, desierto, montaña, casa…), **siempre visible**. El usuario agrega 10 asociaciones con «+». Botón **«Sugerencia»** (opcional, solo a pedido); si la borra y pide otra, recibe una **distinta**. Al completar 10: se muestra la **primera columna**; la **última palabra ingresada** pasa a ser la nueva palabra núcleo; se repite hasta **4 columnas**. **Cada columna se muestra solo al completar sus 10 palabras.** Permite asociaciones libres, rimas y aliteraciones.
- **Datos:** `portal_seeds` + relaciones semánticas, rimas y aliteraciones (`LEXICAL_DATABASE_AND_APIS.md`, sección 5).
- **Sorteo:** sugerencias sin repetición.
- **Identidad:** exploración, ramificaciones, camino.

### G-07 Palabras Invisibles
- **Mecánica:** prompt aleatorio; el usuario elige **cuatro palabras relacionadas con él** y las expresa sin nombrarlas. Las cuatro **permanecen visibles**. Ejemplo original de intro: «Miel» → «Sos pesada pero increíblemente dulce».
- **Identidad:** tinta invisible que se revela.

### G-08 Canción Influencia
- **Mecánica:** título, artista y enlace a YouTube de una canción aleatoria; el usuario la escucha y escribe otra letra sobre el mismo tema; puede usar Asociación Libre de apoyo. **No se muestra la letra.**
- **Datos:** `songs`; enlace = URL de búsqueda de YouTube (D-13).
- **Identidad:** tocadiscos/vinilo.

### G-09 Canción Influencia 2
- **Mecánica:** título, artista y enlace; escribir una letra nueva **respetando inicialmente la estructura de rimas y métrica**; luego modificar la melodía y seguir transformando hasta lograr una composición completamente distinta. **No se reproduce la letra original.**
- **Identidad:** vinilo en transformación (evolución visual por pasos).

### G-10 Canción Influencia 3
- **Mecánica:** título, artista y enlace; el usuario busca la letra por su cuenta y **invierte sus expresiones** (aunque no tenga sentido), p. ej. «Acariciando lo áspero» → «Golpeando lo blando»; luego usa las frases más llamativas como inspiración. **No se muestra la letra.**
- **Identidad:** espejo/reverso.

### G-11 Palabras Clavadas
- **Mecánica:** cantidad (**máx. 24**), una o varias categorías (sustantivos, adjetivos, verbos). Cada palabra recibe aleatoriamente **posición obligatoria**: primera del verso, intermedia o última. **Tabla palabra–posición.**
- **Identidad:** alfileres/chinches en un tablero.

### G-12 Conexión
- **Mecánica:** palabra «fuente» (objeto, persona, oficio o sustantivo). El usuario descubre sus cualidades y crea un **símil** aplicándolas a otra cosa. **La app no da las cualidades ni los símiles.** La intro incluye **tres ejemplos completos** (por ejemplo, el del buzo de aguas profundas del encargo y dos más originales).
- **Identidad:** puentes/hilos entre dos orillas.

### G-13 Cociendo Frases
- **Mecánica:** dos frases/prompts/palabras independientes, mostradas **verticalmente**; cada tarjeta se cambia deslizando izq/der **sin afectar la otra**; la fuente aparece de forma **discreta**.
- **Datos:** `quote_public` (D-04).
- **Identidad:** cocina/olla, ingredientes.

### G-14 Otra Perspectiva
- **Mecánica:** un sustantivo aleatorio; categoría opcional (objetos, animales, elementos naturales, sustancias, conceptos abstractos). Se escribe desde su perspectiva. **Se muestra solo el sustantivo** + instrucciones generales.
- **Identidad:** lente/ojo del objeto.

### G-15 Pienso en Vos
- **Mecánica:** un sustantivo; el usuario elige modalidad: (1) una persona con cualidades de una cosa, o al revés; (2) varias personas con cualidades de una cosa, o al revés; (3) varias personas con cualidades de varias cosas. Ingresa nombres o expresiones colectivas («muchedumbre»). **Sin límite artificial** de personas/cosas.
- **Identidad:** retratos/espejos.

### G-16 El Guion
- **Mecánica:** cantidad de frases (**máx. 4**) de guiones; se muestran juntas en lista; cada una se reemplaza de forma independiente. **La fuente no es visible**: al tocar una frase aparece un **tooltip** con su procedencia. La app da instrucciones para intercalar las frases y construir una letra.
- **Datos:** `script_phrases`; sujeto a D-04 (solo dominio público/de la casa hasta contar con consulta legal).
- **Identidad:** claqueta, tipografía de guion.

### G-17 Frankenstein
- **Mecánica:** dos nombres de poemas/canciones con sus autores; el usuario busca ambas obras y combina recursos (versos, sustantivos, adjetivos). **Cada obra se reemplaza individualmente.** No se reproducen textos protegidos.
- **Datos:** `poems_songs_ref`.
- **Identidad:** laboratorio/costuras.

### G-18 Verso Insistente
- **Mecánica:** un verso aleatorio (pregunta o afirmación, mezcladas al azar; ej. «Solo me gustaría saber») que el usuario repite **intercalado** con otros versos. Se muestra **destacado visualmente durante todo el ejercicio**.
- **Identidad:** eco/repetición, tipografía pulsante.

### G-19 Canción Collage
- **Mecánica:** tres imágenes; modos: tres totalmente aleatorias o tres con relación temática/visual. Reemplazo individual. Al tocar una, **pantalla completa** con una **X** en una esquina. Imágenes reales/artísticas, **sin IA**.
- **Datos:** `images` (D-05).
- **Identidad:** cinematográfica e inmersiva.

### G-20 Sentidos Guía
- **Mecánica:** siete dimensiones **siempre visibles**: Vista, Olfato, Gusto, Tacto, Audición, Cuerpo, Kinestesia. El usuario elige un objeto, persona, lugar o momento del día/noche (o la app sugiere uno al azar). Cada sentido tiene preguntas orientativas para el flujo de conciencia.
- **Datos:** `sensory_questions`.
- **Identidad:** siete «puertas» sensoriales.

### G-21 La Séptima
- **Mecánica:** nombre y autor de un poema o canción; el usuario escribe **su propia versión en el editor**. La app **detecta los versos** y entrega palabras aleatorias para sustituir la **séptima palabra de cada verso**, mostrando claramente qué palabra corresponde a qué línea. **Es una sugerencia, nunca una modificación destructiva.**
- **Reglas:** si un verso tiene menos de 7 palabras se indica «verso corto» sin sugerencia. Lee el editor vía `getLyricsSnapshot()` (solo lectura).
- **Identidad:** regla/escala con el casillero 7 resaltado.

### G-22 Restricciones
- **Mecánica:** primero elegir una situación/escenario; luego una o varias restricciones sugeridas o personalizadas. **Sin máximo.** Categorías: colores, números, lugares, objetos, sonidos, temáticas, reglas gramaticales, vocabulario. Ejemplos: usar todos los colores del arcoíris, números ascendentes, palabras vinculadas a un hospital.
- **Identidad:** reglas/pizarrón de consignas.

### G-23 Mapa Mental
- **Mecánica:** lienzo interactivo; nodo inicial con campo de texto; al confirmar se crean **exactamente tres hijos** (manual o con «generar tres palabras relacionadas»; los tres aparecen simultáneamente). Cada nodo puede tener tres hijos. **Máximo cinco niveles** (inicial = nivel 1; máximo 121 nodos). Incluye: regenerar un hijo, editar, eliminar (vacía la ranura y el subárbol, D-10), reorganizar, zoom y desplazamiento, **guardar en archivo exportable**, **importar**, **exportar a imagen y PDF**, compartir por WhatsApp. Funciona **sin IA** mediante recursos semánticos en español.
- **Archivo:** formato JSON propio versionado (extensión `.mapa.json` [REC]) con nodos, conexiones, posiciones y versión del esquema. El usuario elige dónde guardarlo.
- **Algoritmo de asociación sin IA:** candidatos desde relaciones (sinónimos, hiperónimos/hipónimos, partes-todo, derivados) → puntaje por frecuencia, diversidad de relación y no repetición en el mapa → se toman tres distintos.
- **Identidad:** lienzo orgánico y amplio.

---

## Nuevos Juegos (G-24 a G-32)

### G-24 Dados Líricos
- **Mecánica:** seis dados: lugar, personaje/persona, objeto, acción, emoción, cualidad/adjetivo. Tirar todos, volver a tirar uno, **bloquear** dados, **temporizador opcional**. Desafío: escribir una canción con todos los elementos.
- **Datos:** `dice_*` (un pool por dado). **Identidad:** dados tangibles y lúdicos.

### G-25 Carta que nunca envié
- **Mecánica:** destinatarios: persona del pasado, actual, alguien que ya no está, imaginaria, uno mismo en otra etapa, libremente elegida. La app da un disparador emocional (ej. «Hay algo que nunca tuve el valor de decirte…»). Se escribe una carta completa y se **rescatan fragmentos** para la canción.
- **Datos:** `letter_triggers`. **Identidad:** papel carta, sobre, correspondencia editorial.

### G-26 Secreto y confesión
- **Mecánica:** tema/situación; el usuario escribe **LO QUE OCULTO** (indirecto: metáforas, símbolos, misterio) y **LO QUE CONFIESO** (directo, sin ocultar). Ver ambas versiones y usarlas.
- **Datos:** `confession_topics`. **Identidad:** contraste entre velo y revelación (dos paneles).

### G-27 Traslado de universo
- **Mecánica:** dos estímulos independientes: **tema/situación** y **universo temático de vocabulario** (ej. Separación + Medicina, Amor + Astronomía…). Escribir sobre el tema con vocabulario del universo.
- **Datos:** `themes` y `universes`; los universos pueden incluir una lista corta de términos de apoyo curados. **Identidad:** portal/traslado.

### G-28 Collage textual
- **Mecánica:** composición visual artística con palabras y frases breves (tamaños, posiciones y tipografías distintos) que genera una atmósfera (ej. melancolía: «ventana», «domingo», «humo», «último tren», «nadie»). El usuario escribe a partir de lo que transmite.
- **Datos:** composiciones curadas por atmósfera + variación procedural limitada. **Identidad:** cartelería y collage tipográfico.

### G-29 Cut-up — Recorte y azar
- **Mecánica:** el usuario introduce texto propio o usa un texto de dominio público/autorizado; la app lo **divide en fragmentos**, los **reorganiza al azar**, permite **bloquear**, **reorganizar de nuevo** y **mover a mano**. **Nunca se usan letras o guiones protegidos.**
- **Datos:** `cutup_texts`. **Identidad:** recortes de papel y tipografía experimental.

### G-30 Trenza de palabras
- **Mecánica:** el usuario escribe **tres frases**; la app **entrelaza** sus palabras en una composición experimental. Volver a trenzar, cambiar una frase manteniendo las otras dos, probar distintas intercalaciones, llevar el resultado al editor.
- **Identidad:** hilos trenzados.

### G-31 Cadena de letras
- **Mecánica:** cuadrícula de letras; conectar letras adyacentes (horizontal, vertical o diagonal) para formar palabras validadas con **diccionario español local**; cada palabra válida va a una lista; al final, escribir una letra con las palabras encontradas.
- **Reglas:** generación de cuadrícula con letras ponderadas por frecuencia del español y garantía de ≥ N palabras posibles [REC N=20]; manejo de `ñ`, tildes (se comparan sin tilde) y `qu`. Sin repetir una casilla dentro de una palabra.
- **Datos:** lista de formas válidas (`inflection` + lemas). **Identidad:** juego de palabras con tablero.

### G-32 Acróstico de azar
- **Mecánica:** el usuario escribe una palabra/frase o pide una aleatoria; la app muestra cada letra en vertical con un renglón por letra (ej. SOMBRA → S, O, M, B, R, A) para escribir un verso que empiece con cada letra, en orden.
- **Datos:** léxico (palabras aleatorias). **Identidad:** columna arquitectónica de letras.

---

## Índice de datos por Juego

| Juego | Pools |
|---|---|
| G-01, 03, 11, 14 | `words.*` |
| G-02 | `titles` |
| G-04, 07 | `prompts` |
| G-05 | `characters` |
| G-06 | `portal_seeds`, relaciones, rimas |
| G-08, 09, 10 | `songs` |
| G-12 | `words.noun` |
| G-13, 18 | `quote_public` (y `prompts` para G-18) |
| G-15 | `words.noun` |
| G-16 | `script_phrases` |
| G-17, 21 | `poems_songs_ref` y `words.*` (G-21) |
| G-19 | `images` |
| G-20 | `sensory_questions` |
| G-22 | `situations`, `restrictions` |
| G-23 | relaciones semánticas |
| G-24 | `dice_*` |
| G-25 | `letter_triggers` |
| G-26 | `confession_topics` |
| G-27 | `themes`, `universes` |
| G-28 | composiciones curadas |
| G-29 | `cutup_texts` |
| G-30, 32 | Entrada del usuario / `words.*` |
| G-31 | Diccionario de formas |

## Verificación de integridad del catálogo
- 23 originales + 9 nuevos = **32**; 5 ejercicios de Fase 0 aparte.
- Test de registro: ids `g01…g32` únicos, cada uno con intro completa (título, objetivo, pasos, ejemplos, «Comenzar»).
- Cualquier cambio de la esencia de un Juego original requiere aprobación explícita del usuario.
