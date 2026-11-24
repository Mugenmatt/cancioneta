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

## Juegos de prueba (G-33, G-41, G-44)

Se registran con sus códigos acordados. `g31` sigue reservado y no aparece en el registro ni en la galería como Juego habilitado. No modifican la esencia ni la implementación de G-01 a G-32.

### G-33 Palabra con plazo
- **Mecánica:** aparece una palabra concreta de objeto físico, idealmente con doble sentido (o una frase corta), sorteada de un banco local; también se puede elegir «palabra inventada» y escribirla. El usuario elige el plazo: 20 minutos, 1 hora o 24 horas. Un banner con la palabra y el tiempo restante queda visible en el Juego y arriba del editor; una tilde verde informa si la palabra ya aparece en la letra. Temporizador interno, sin notificaciones.
- **Datos:** pool `deadline_words` con 60 palabras y frases breves originales.
- **Sorteo:** `RandomService.draw('deadline_words', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** banner con la palabra, cuenta regresiva y estado de aparición en el cuaderno.
- **Identidad:** cartel de plazo, reloj y tilde de confirmación; paleta cálida con acento terracota.

### G-41 Título interrogante
- **Mecánica:** se sortea una frase breve como título. Paso 1: escribir al menos tres preguntas que despierta. Paso 2: marcar al menos dos para responder. Paso 3: ir al editor con las preguntas elegidas visibles arriba; la meta es un verso y un estribillo que las respondan.
- **Datos:** pool `question_titles` con 60 frases breves originales.
- **Sorteo:** `RandomService.draw('question_titles', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel con el título y las preguntas marcadas arriba del cuaderno.
- **Identidad:** ventana y signos de interrogación; paleta fría con acento azul.

### G-44 Canción mala
- **Mecánica:** se sortea una consigna y hay diez minutos para escribir una canción mala a propósito en el cuaderno. Desde la pantalla del Juego, «Tirar» arruga el papel y borra todo el texto escrito; después «Ahora la buena» abre el cuaderno vacío con la misma consigna visible arriba. Sin notificaciones y sin guardar nada.
- **Datos:** pool `bad_song_prompts` con 40 consignas originales.
- **Sorteo:** `RandomService.draw('bad_song_prompts', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** la consigna queda arriba del cuaderno en las dos etapas.
- **Identidad:** papel arrugado y tachaduras; paleta de papel con acento rojo.

---

## Juegos ampliados (G-34, G-35, G-36, G-37, G-48, G-50)

Se registran con los códigos acordados. No modifican la esencia ni la implementación de G-01 a G-32; `g31` sigue reservado. Todos los bancos nuevos son semillas originales de Cancioneta, sin letras ni textos protegidos.

### G-34 Narrador
- **Mecánica:** tres ejes independientes (persona gramatical, distancia y fiabilidad) que se pueden volver a tirar de a uno, sin alterar los otros dos. Tema opcional sorteado del banco existente `themes`.
- **Datos:** pools `narrator_person` (6), `narrator_distance` (12) y `narrator_reliability` (12); tema opcional de `themes`.
- **Sorteo:** `RandomService.draw(pool, 1)` por eje, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel con los tres ejes y, si se activó, el tema.
- **Identidad:** ventanas y tres dados; paleta cálida con acento marrón.

### G-35 Molde de rima
- **Mecánica:** ocho tarjetas con esquemas (ABAB, AABB, ABBA, XAXA, AAA con última palabra repetida, AACBBC, rimas internas a mitad de verso y sin rima con último verso fijo). Cada tarjeta muestra el esquema con letras y un ejemplo original de cuatro versos. El usuario elige o sortea; el esquema queda fijo arriba del cuaderno. No se detectan rimas automáticamente.
- **Datos:** pool `rhyme_schemes` con 8 semillas originales; ejemplos de cuatro versos escritos para esta app.
- **Sorteo:** `RandomService.draw('rhyme_schemes', 1)`, excluyendo el esquema actual, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** esquema elegido arriba del cuaderno, con su explicación y el ejemplo original.
- **Identidad:** cuadrícula de moldes; paleta fría con acento azul.

### G-36 Ruleta de forma
- **Mecánica:** tres ruedas independientes (estilo o género, compás y estructura) que se pueden bloquear y volver a tirar de a una o todas juntas. Compases: 4/4, 3/4, 6/8 y 12/8. Estructuras: solo estrofas tipo balada, verso-estribillo, con puente instrumental, estribillo primero y sin estribillo. Es solo una consigna, sin audio.
- **Datos:** pools `form_styles` (24), `form_meters` (4) y `form_structures` (5), semillas originales.
- **Sorteo:** `RandomService.draw(pool, 1)` por rueda; las ruedas bloqueadas conservan su valor.
- **Estímulo visible durante la escritura:** panel con las tres ruedas elegidas y la aclaración de que no hay audio.
- **Identidad:** tres ruedas con candado; paleta oscura con acento dorado.

### G-37 Fábula
- **Mecánica:** se sortean un protagonista (animal u objeto) y un conflicto, que se pueden cambiar por separado. El usuario escribe 8 a 12 versos de fábula y cierra con una moraleja de 2 versos.
- **Datos:** pools `fable_protagonists` (24) y `fable_conflicts` (24), semillas originales.
- **Sorteo:** `RandomService.draw(pool, 1)` por semilla, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel con protagonista y conflicto, y un bloque final marcado como «Moraleja (últimos 2 versos)».
- **Identidad:** hoja de fábula y moraleja subrayada; paleta de papel con acento verde.

### G-48 Plano a plano
- **Mecánica:** el usuario elige entre 4 y 6 versos; la app asigna un plano (panorámica, plano general, plano medio, primer plano, plano detalle o mirada subjetiva) a cada verso, en orden o al azar. Lugar o escena inicial opcional. El editor etiqueta cada verso con su plano en el panel del estímulo.
- **Datos:** seis planos fijos y originales en `src/content/games/g48.ts`; sin banco nuevo.
- **Sorteo:** `RandomService.shuffle` para el modo al azar; sin `Math.random()` directo.
- **Estímulo visible durante la escritura:** escena opcional y un grupo por verso con su etiqueta de plano.
- **Identidad:** encuadre y lentes; paleta oscura con acento verde agua.

### G-50 Arco emocional
- **Mecánica:** se sortean tres emociones distintas asignadas a verso, pre-estribillo y estribillo. Se puede tirar el arco completo o cambiar una emoción por separado sin tocar las otras dos. El editor muestra tres bloques etiquetados.
- **Datos:** pool `emotion_arc` con 40 emociones originales.
- **Sorteo:** `RandomService.draw('emotion_arc', 3)` para el arco completo; `draw(..., 1, { excludeFingerprints })` para cambiar una sola emoción sin repetir las otras dos.
- **Estímulo visible durante la escritura:** tres grupos con la emoción asignada a cada bloque.
- **Identidad:** onda de tres colores; paleta clara con acento violeta.

### G-38 Escena robada
- **Mecánica:** tarjeta con una descripción breve y original de una situación emocional, un personaje y «lo que no se dice». Se escribe desde el sentimiento de un solo personaje, sin contar la escena desde afuera. Temporizador opcional de 30 minutos, sin notificaciones ni guardado.
- **Datos:** pool `stolen_scenes` con 30 escenas originales de Cancioneta; cada semilla guarda descripción, personaje y lo no dicho. Sin obras ni diálogos citados.
- **Sorteo:** `RandomService.draw('stolen_scenes', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel plegable arriba del cuaderno con los tres campos y, si se activó, el tiempo restante.
- **Identidad:** encuadre de ventana y luz nocturna; paleta oscura con acento dorado.

### G-39 Disección de un verso
- **Mecánica:** el usuario escribe un verso que le gusta (no se guarda ni se busca en ningún lado) y elige qué lo atrapa: imagen, sonido, giro inesperado, emoción o ritmo. Después escribe un verso propio con el mismo recurso sobre otro tema y va al editor.
- **Datos:** sin banco nuevo; solo las cinco opciones fijas en `src/content/games/g39.ts`.
- **Sorteo:** ninguno.
- **Estímulo visible durante la escritura:** panel plegable con el verso traído y el recurso elegido, más la consigna de escribir sobre otro tema.
- **Identidad:** lupa y cuadrícula de análisis; paleta clara con acento violeta.

### G-42 Diez primeros versos
- **Mecánica:** lista numerada del 1 al 10 con contador de aperturas escritas. Criterio: cada apertura debe dejar una pregunta en quien escucha. Tema opcional sorteado del banco existente `themes`. Al terminar se marcan tres favoritas y esas tres van al editor.
- **Datos:** pool existente `themes` para el tema opcional; sin banco nuevo.
- **Sorteo:** `RandomService.draw('themes', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel con el tema opcional y el grupo de las tres aperturas favoritas.
- **Identidad:** escalera de diez peldaños; paleta cálida con acento terracota.

### G-43 Contar a un extraño
- **Mecánica:** paso 1, contar lo que pasó como si se lo contara a alguien que no lo conoce, sin adornos; disparador de situación opcional. Paso 2, en el editor: la versión sin adornos queda arriba en un panel plegable y la consigna pide convertirla en letra conservando toda la información.
- **Datos:** pool existente `situations` para el disparador opcional; sin banco nuevo.
- **Sorteo:** `RandomService.draw('situations', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel plegable con cada línea del relato original y la nota de conservar los datos.
- **Identidad:** sobre y carta sin sobrescribir; paleta clara con acento verde azulado.

### G-49 Refrán mutante
- **Mecánica:** sale una frase corta fija que queda destacada durante todo el ejercicio. Se escriben tres o cuatro estrofas que terminen con esa frase, con un sentido distinto en cada una. El editor recuerda la frase y avisa cuando aparece en la letra.
- **Datos:** pool `mutant_proverbs` con 40 frases breves originales de Cancioneta; no son refranes de obras protegidas.
- **Sorteo:** `RandomService.draw('mutant_proverbs', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** frase fija destacada en el Juego y en el panel del cuaderno, con aviso de aparición.
- **Identidad:** frase subrayada y bandas repetidas; paleta cálida con acento ocre.

### G-54 Solo preguntas
- **Mecánica:** tema aleatorio del banco existente y entre 8 y 16 versos, todos preguntas. El panel del cuaderno señala con suavidad qué versos no tienen signo de interrogación y muestra el tema.
- **Datos:** pool existente `themes`; sin banco nuevo.
- **Sorteo:** `RandomService.draw('themes', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** tema, lista de versos señalados por número y aviso de aparición de signos de interrogación.
- **Identidad:** signos de interrogación suspendidos; paleta oscura con acento celeste.

### G-55 Empezar por el final
- **Mecánica:** tema aleatorio del banco existente. Primero se escribe el último verso, que queda fijo abajo; después se agregan versos arriba, de atrás hacia adelante. Botón «Ver en orden normal» para comprobar el resultado. La cantidad de versos es libre.
- **Datos:** pool existente `themes`; sin banco nuevo.
- **Sorteo:** `RandomService.draw('themes', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel plegable con el tema, el último verso y los anteriores ya invertidos al orden normal de la canción.
- **Identidad:** escalera inversa; paleta oscura con acento lila.

### G-56 Estribillo traidor
- **Mecánica:** paso 1, escribir una estrofa; paso 2, escribir un estribillo que la contradiga o desmienta. Ambos textos se muestran lado a lado. Consigna de contradicción aleatoria: ironía, negación, cambio de punto de vista o mentira piadosa.
- **Datos:** pool `contradiction_modes` con 4 consignas originales de Cancioneta.
- **Sorteo:** `RandomService.draw('contradiction_modes', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel plegable con la consigna, la estrofa y el estribillo juntos.
- **Identidad:** dos columnas enfrentadas; paleta clara con acento granate.

### G-57 Dos voces
- **Mecánica:** se sortean dos personajes y sus versos se alternan A/B desde el principio, sin narrador. La pantalla colorea cada bloque según la voz y pide un mínimo de ocho versos. El cuaderno recibe el diálogo en orden con un panel que separa lo que dice cada uno.
- **Datos:** pool `voice_pairs` con 40 parejas originales de personajes arquetípicos; sin obras citadas.
- **Sorteo:** `RandomService.draw('voice_pairs', 1)`, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** panel plegable con los grupos «Voz A» y «Voz B» y la nota de leer sin narrador.
- **Identidad:** dos colores de voz sobre línea de agua; paleta oscura con acento verde agua.

## Juegos con audio

### G-45 Dos registros
- **Mecánica:** dos grabaciones temporales. Registro 1 con voz grave y conversacional, 4 a 6 líneas sobre algo que el usuario hizo o pensó esta semana. Registro 2 con voz más aguda, notas largas y suaves, 4 a 6 líneas sobre una emoción que sintió. Se reproducen los dos seguidos y se ofrece un descanso opcional de 30 minutos que se puede saltear. Al volver se escuchan de nuevo, se responde «¿qué conecta las dos?» y se elige entre llevar el registro 1 como verso y el 2 como estribillo, sumar un pre-estribillo y elegir una línea del estribillo como tema central. Todo eso va al cuaderno como panel de escritura.
- **Datos:** sin pool nuevo. La transcripción offline y la carpeta temporal son las mismas de Voz desatada, ahora en `src/services/audio/recording.ts` y los hooks compartidos de `src/games/runtime/`.
- **Sorteo:** ninguno.
- **Estímulo visible durante la escritura:** panel plegable con «Verso — registro 1», «Estribillo — registro 2», la conexión, el pre-estribillo opcional y el tema central elegido.
- **Identidad:** dos ondas superpuestas; paleta oscura con acento ámbar.
- **Web/PWA:** sin micrófono; se muestra un aviso claro y se pueden escribir los dos registros a mano.

### G-52 Transcripción torcida
- **Mecánica:** grabación de 30 a 60 segundos de balbuceo, habla rápida, susurros o mala dicción. La transcripción offline se muestra literal, con sus errores, sin corrección automática. El usuario marca fragmentos absurdos o sugerentes y los lleva al cuaderno; el botón «Mezclar fragmentos» los reordena con `RandomService`.
- **Datos:** sin pool nuevo. Misma grabadora temporal y misma transcripción on-device que Voz desatada, centralizadas en `src/services/audio/recording.ts`.
- **Sorteo:** `RandomService.shuffle()` sobre los fragmentos ya marcados; nunca `Math.random()` directo.
- **Estímulo visible durante la escritura:** panel plegable con la transcripción literal y los fragmentos marcados, en el orden elegido.
- **Identidad:** bandas torcidas; paleta oscura con acento verde ácido.
- **Web/PWA:** sin micrófono; aviso claro y transcripción manual disponible para seguir marcando fragmentos.

### G-53 Paisaje sonoro
- **Mecánica:** grabación ambiente de 20 segundos (cocina, calle, lluvia, etc.), escucha sin transcripción y tres preguntas guía: qué suena lejos, qué suena cerca y qué falta. Las tres respuestas van al cuaderno como borrador y panel plegable. Grabar es opcional: se puede escribir de todos modos.
- **Datos:** sin pool nuevo. Misma grabadora temporal que Voz desatada, centralizada en `src/services/audio/recording.ts`. No usa transcripción.
- **Sorteo:** ninguno.
- **Estímulo visible durante la escritura:** panel plegable con las tres preguntas y sus respuestas.
- **Identidad:** círculos concéntricos; paleta oscura con acento verde agua.
- **Web/PWA:** sin micrófono; aviso claro y preguntas disponibles para escribir a mano sin romper la pantalla.

### G-46 Dúo por turnos
- **Mecánica:** modo «pasá el celu» para dos personas con nombres opcionales (A y B) y un tema. Se alternan doce versos; en cada turno la persona ve **solo** el verso anterior, escribe el suyo y aparece una pantalla intermedia «pasale el teléfono» antes del siguiente turno. Al terminar se revelan los doce versos con la etiqueta de autor y se reparten, en ese mismo orden, en 4 de verso, 2 de pre-estribillo y 6 de estribillo. El cuaderno recibe esos tres bloques con encabezados y etiquetas; compartir usa el sistema existente de exportación.
- **Datos:** tema opcional escrito a mano o sorteado del pool existente `themes`; sin banco nuevo. Nombres y versos son entrada del usuario, solo en memoria.
- **Sorteo:** `RandomService.draw('themes', 1)` para el tema opcional, sin repetición hasta agotar el ciclo.
- **Estímulo visible durante la escritura:** en cada turno, únicamente el verso anterior; al final, los doce versos etiquetados y el reparto 4/2/6 en el panel del cuaderno.
- **Identidad:** dos manos que se pasan un teléfono; paleta cálida con acento índigo.
- **Web/PWA:** sin API nativa; funciona igual en web.

### G-47 Taller de melodía
- **Mecánica:** un solo Juego con tres modos. (a) Melodía torcida: grabar tarareando el estribillo de una canción amada (audio temporal) y aplicar tarjetas de reglas: invertir la dirección, cambiar duraciones, saltar un intervalo y estirar una nota acortando la siguiente. (b) Empezar en otro tiempo: metrónomo con acento en un tiempo sorteado del 1 al 4; modo avanzado agrega el «y» entre tiempos; se escriben frases que arranquen en ese acento. (c) Hablar-cantando: frase corta sorteada, decirla neutra, con emoción y con MÁS emoción cantando exagerada la melodía natural. Cada modo lleva su resultado al cuaderno con el sistema de estímulos existente.
- **Datos:** sin pool nuevo. La frase de hablar-cantando sale de `mutant_proverbs` (semillas originales); los acentos y las reglas son datos fijos en `src/content/games/g47.ts`.
- **Sorteo:** `RandomService.int(4)` para el tiempo acentuado y `RandomService.draw('mutant_proverbs', 1)` para la frase; nunca `Math.random()` directo.
- **Estímulo visible durante la escritura:** reglas elegidas y anotación en el modo a; patrón de compás con el acento resaltado y frase en el modo b; frase y notas en el modo c.
- **Identidad:** onda y pulseador; paleta oscura con acento coral.
- **Web/PWA:** sin micrófono en web: aviso claro y transformación escrita a mano. El metrónomo usa el mismo Web Audio de `react-native-audio-api` que el reproductor existente; si el navegador no lo habilita, se muestra aviso y el patrón visual sigue guiando el ejercicio. No se instala ninguna dependencia.

### G-51 Métrica fija
- **Mecánica:** seis moldes silábicos (8-8-8-8, 8-8-8-6, 7-7-7-7, 11-11-11-11, 10-6-10-6 y libre con tope ajustable). Se escriben cuatro versos y un contador aproximado muestra la sílaba de cada uno en vivo. Cada verso permite corregir el número a mano y el indicador pasa a verde cuando coincide y a rojo cuando no (o cuando supera el tope en el molde libre). El cuaderno recibe los cuatro versos con su conteo final y el sistema de estímulos existente.
- **Datos:** veinte versos originales de Cancioneta usados como casos de prueba de la heurística; sin pool nuevo ni textos protegidos.
- **Sorteo:** sin aleatoriedad: la métrica es fija y la corrección la hace la persona.
- **Estímulo visible durante la escritura:** conteo aproximado por verso, conteo corregido, estado de coincidencia y el molde elegido.
- **Identidad:** rejilla de sílabas; paleta verde tinta con acento verde profundo.
- **Web/PWA:** sin API nativa; funciona igual en web.
- **Contador:** heurística para español que agrupa diptongos y triptongos, separa hiatos, descuenta una por sinalefa, ignora la h muda y aplica la ley del acento final. Es una cuenta probable: la interfaz la marca como aproximada y nunca la impone.

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
| G-33 | `deadline_words` |
| G-34 | `narrator_person`, `narrator_distance`, `narrator_reliability`, `themes` |
| G-35 | `rhyme_schemes` |
| G-36 | `form_styles`, `form_meters`, `form_structures` |
| G-37 | `fable_protagonists`, `fable_conflicts` |
| G-38 | `stolen_scenes` |
| G-39 | Entrada del usuario (sin pool) |
| G-41 | `question_titles` |
| G-42 | `themes` |
| G-43 | `situations` |
| G-44 | `bad_song_prompts` |
| G-45 | Dos grabaciones temporales; sin pool |
| G-46 | `themes` (tema opcional) y entrada del usuario |
| G-47 | `mutant_proverbs`; grabación temporal y metrónomo sin pool |
| G-48 | seis planos fijos (sin pool) |
| G-51 | veinte versos originales en tests (sin pool) |
| G-49 | `mutant_proverbs` |
| G-50 | `emotion_arc` |
| G-52 | Grabación temporal y transcripción; sin pool |
| G-53 | Grabación temporal sin transcripción; sin pool |
| G-54 | `themes` |
| G-55 | `themes` |
| G-56 | `contradiction_modes` |
| G-57 | `voice_pairs` |

## Verificación de integridad del catálogo
- 23 originales (G-01…G-23) + 8 de la primera tanda (G-24…G-30 y G-32) + 24 de la tanda actual (G-33…G-39 y G-41…G-57) = **55 Juegos habilitados**. Los 5 ejercicios de Fase 0 van aparte: `GAME_REGISTRY` tiene 60 registros.
- Reservados: **G-31** y **G-40**, sin tema ni Juego. Se ocultan de la galería visual porque todavía no se pueden jugar. Numeración total: 57; habilitados: 55.
- Los ids `g01…g57`, excepto `g31` y `g40`, están en el registro, en `RUNTIME_GAME_IDS` y en `public/sw.js`. `tests/registry.test.ts` y `tests/devGallery.test.ts` verifican 60 registros y 60 tarjetas de galería, todas habilitadas.
- Cada Juego habilitado tiene ficha en este catálogo, intro completa (título, objetivo, pasos, ejemplos, «Comenzar») y tema con contraste AA en claro y oscuro. Los Juegos con audio degradan en web con un aviso desde `src/content/`.
- Cualquier cambio de la esencia de un Juego original requiere aprobación explícita del usuario.
