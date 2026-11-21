# Decisiones, contradicciones y preguntas abiertas

Resultado del análisis integral del encargo. Cada punto indica qué detecté, qué propongo y si necesito tu decisión.
Los 32 Juegos no se tocan en ninguna de estas decisiones.

## 0. Resoluciones del usuario (prevalecen sobre las propuestas de abajo)

| ID | Resolución | Efecto en el plan |
|---|---|---|
| D-01 | **Todo gratuito.** | No se paga Apple Developer. Sin cuenta paga no se puede instalar en un iPhone real ni publicar en App Store, y compilar iOS exige macOS. Consecuencia: la **v1 se desarrolla, prueba y distribuye en Android** (y como web si hace falta), con código escrito **iOS-ready** (sin APIs solo-Android, diseño pensado para iPhone). La publicación en iOS queda diferida hasta que haya presupuesto o una Mac. Google Play cobra un registro único [VERIFICAR monto]; si es inaceptable, distribuir el APK directo. |
| D-03 | **Sin borrador de recuperación.** Si se cierra la app, se pierde la canción. | Se elimina el estado «Recuperable» y el plazo de 24 h de `PRIVACY_AND_OFFLINE.md`. Todo lo creativo vive solo en memoria. Se refuerza la **exportación manual** y se agrega un aviso previo al salir de la app o de una sesión con contenido sin exportar. |
| D-05 | **Imágenes mixtas:** algunas incluidas en la app y otras vía API. | Paquete base de imágenes con licencia clara incluido (funciona offline) y complemento por API gratuita **[VERIFICAR]** términos, límites y obligación de atribución de la API elegida. Sin conexión se usa solo el paquete incluido. Atribución visible por imagen. No se guarda el contenido de la API más allá de la sesión. |
| D-04 | **Sí a consulta legal** antes de incluir citas de obras protegidas. | Hasta contar con ese asesoramiento, el contenido se limita a dominio público, frases de la casa y metadatos con enlace. Las citas protegidas quedan fuera de los paquetes de v1. |

## A. Bloqueantes (decidir antes de empezar a programar)

### D-01 — Desarrollar iOS-first desde una PC con Windows [BLOQUEANTE]
- **Detección:** iOS-first es el requisito principal, pero Xcode solo corre en macOS. Desde Windows no se puede compilar ni firmar una app iOS localmente.
- **Consecuencia:** hace falta compilar en la nube (EAS Build de Expo) o disponer de una Mac. Además, probar en un iPhone real o publicar requiere el Apple Developer Program, que es **de pago anual** [VERIFICAR monto vigente]. Esto choca con «sin servicios pagos recurrentes» y con «lanzamiento gratuito» (la app puede ser gratis para el usuario final, pero publicar en App Store no es gratis para vos).
- **[REC]:** desarrollar y probar a diario en **Android (emulador/dispositivo en Windows)** y en **web/Expo dev build**, y generar builds iOS con EAS Build cuando haga falta. Decidir si se paga Apple Developer. Si no, la v1 se prueba solo en Android y iOS queda diferido.
- **Pregunta:** ¿Tenés acceso a un iPhone y a una Mac, o estás dispuesto a pagar Apple Developer?

### D-02 — Sin cuentas + futura suscripción
- **Detección:** sin cuentas no hay dónde atar una suscripción.
- **[REC]:** las compras/suscripciones viven en la cuenta de Apple/Google (restauración nativa). La app solo consulta un `EntitlementService` abstracto. En v1 devuelve siempre «acceso completo». Sin backend propio.

### D-03 — «No guardar letras» vs. perder una canción si el sistema cierra la app
- **Detección:** iOS y Android matan apps en segundo plano. Si el borrador vive solo en memoria, el usuario puede perder una canción por una llamada entrante.
- **[REC]:** conservar un **borrador temporal de recuperación** en el sandbox de la app, cifrado por el sistema (protección de archivos del SO), que se **borra** cuando: (a) el usuario toca «Terminar sesión», (b) pasan 24 h sin abrir la app [valor propuesto], o (c) el usuario lo vacía en Ajustes. Se informa con claridad en la primera apertura. Esto respeta el espíritu de «no persistencia permanente».
- **Pregunta:** ¿Aceptás esta excepción de recuperación ante cierres? Si no, se pierden borradores al cerrarse la app.

### D-04 — Frases de guiones y citas (Juegos 2, 13, 16, 18, 21)
- **Detección:** el Juego 16 (El Guion) pide frases de películas y series; los Juegos 2 y 13 piden frases de libros, películas y canciones. Son obras protegidas. «Citas breves autorizadas» exige saber qué es autorizado.
- **[REC]:** tres niveles de contenido, en este orden de preferencia:
  1. Dominio público o licencia compatible (con texto completo del fragmento).
  2. Frases **originales** escritas para la app, rotuladas como «de la casa».
  3. Obras protegidas solo como **metadatos** (título, autor, año) con enlace externo, sin texto.
- Para el Juego 16 en particular: la fuente debe aparecer al tocar la frase, así que solo las frases de los niveles 1 y 2 pueden mostrarse como texto. Las frases de guiones protegidos **no** deben incluirse como texto sin permiso. No soy abogado: conviene una consulta legal antes de lanzar si se quieren citas de obras protegidas.

### D-05 — Imágenes reales «de internet» sin IA (Fase 0 Prompt, Juego 19)
- **Detección:** «imágenes encontradas en internet» choca con derechos de autor y con «sin costos externos». Además, ¿deben funcionar offline?
- **[REC]:** curar un catálogo propio de imágenes con licencia clara (dominio público/CC0/CC BY: Wikimedia Commons, Openverse, bancos libres), con **atribución almacenada por imagen**. Se distribuyen como paquete descargable (no hotlinking). Cada registro guarda autor, licencia y URL de origen. Para «imágenes con relación temática» se etiquetan a mano o semiautomáticamente en la construcción del catálogo (no en el dispositivo).
- **Pregunta:** ¿Querés las imágenes incluidas en la app (más pesada, funciona offline) o descargadas bajo demanda (liviana, necesita conexión la primera vez)?

## B. Contradicciones y huecos del encargo, con propuesta

### D-06 — El selector de raíz no incluye alteraciones
El encargo lista C, D, E, F, G, A, B. Sin sostenidos/bemoles no existen F♯m, B♭, E♭maj7, etc. y las tonalidades reales quedan incompletas.
**[REC]:** agregar selector ♯/♭ (12 notas cromáticas) manteniendo la grilla visual de 7 letras como atajo.

### D-07 — «Respeta la tonalidad seleccionada» en el dado
El dado debe saber la tonalidad. Si el usuario no eligió ninguna, no hay con qué respetar.
**[REC]:** tonalidad por defecto = «automática»: el dado genera progresiones diatónicas de una tonalidad aleatoria con acordes bloqueados respetados; si hay acordes bloqueados, se infiere la tonalidad con el detector y se generan los demás compatibles.

### D-08 — Rango del BPM
Solo se fija el máximo (200). **[REC]:** mínimo 40, por defecto 90, paso de 1.

### D-09 — Piano offline y licencia de muestras
Se necesita sonido de piano sin servicios externos. **[REC]:** muestras de piano con licencia libre, recortadas (una muestra cada tres notas, con ajuste de tono), cargadas en un reproductor de audio nativo de baja latencia. [VERIFICAR] licencia y atribución exacta del banco elegido antes de incluirlo. Configurar la sesión de audio de iOS en modo «playback» para que suene aunque el interruptor de silencio esté activado.

### D-10 — Mapa Mental: «exactamente tres hijos» y «eliminación de nodos»
Si se elimina un nodo, ¿qué pasa con los tres hijos?
**[REC]:** el padre siempre mantiene tres **ranuras**. Eliminar un nodo vacía su ranura (muestra «+» para volver a completarla) y borra su subárbol, con confirmación. Máximo teórico: 1 + 3 + 9 + 27 + 81 = **121 nodos** (cinco niveles). Esto fija el tope de rendimiento.

### D-11 — Sentido de «sesión»
Se menciona «sesión» para repetición, borrado de borradores y estado de Juego.
**[REC]:** *Sesión de trabajo* = desde que el usuario inicia una canción («Nueva canción») hasta que toca «Terminar sesión» o vence el plazo de D-03. *No repetición* es independiente: persiste por dispositivo (nivel 2 del encargo).

### D-12 — Transcripción offline en español
No hay garantía de que cada dispositivo tenga reconocimiento on-device para es-AR. Detalle completo en `PRIVACY_AND_OFFLINE.md`. **[REC]:** cascada de motores sin ningún envío silencioso a servidores.

### D-13 — Enlaces a YouTube (Juegos 8, 9, 10)
Los IDs de video dejan de funcionar con el tiempo. **[REC]:** guardar título + artista y construir una **URL de búsqueda** de YouTube con esos datos al abrir. No se almacenan IDs de video.

### D-14 — Excel de 30.000 registros
Excel sirve como **fuente de autoría**, pero no es un formato adecuado para la app. **[REC]:** el Excel/CSV se compila en la construcción a SQLite (paquetes versionados). Ver `CONTENT_DATABASE.md` (tanda 2).

### D-15 — Cifras de 30.000 «lemas únicos y validados»
Es alcanzable con fuentes abiertas, pero «validados» necesita un criterio. **[REC]:** definir validado = aparece en al menos dos fuentes independientes (p. ej., Wiktionary y WordNet español) o está en el listado de frecuencia filtrado. Detalle en `LEXICAL_DATABASE_AND_APIS.md`.

### D-16 — Decatónico, heptatónico, etc.
En métrica española «tónico» alude a acentos, mientras que el encargo usa «decatónico» para decir «de diez sílabas». **[REC]:** se conserva la terminología del usuario como variante propia y se agrega la equivalencia académica (decasílabo, heptasílabo...) al lado. Detalle y tabla de revisión en `POETIC_STRUCTURES.md` (tanda 4).

### D-17 — Límite de caracteres al exportar
Una canción larga puede superar límites de mensajes de algunas apps. **[REC]:** exportar siempre el texto completo al menú de compartir; si supera un tamaño seguro [VERIFICAR el tope de WhatsApp], ofrecer también «dividir en partes».

## C. Riesgos principales

| ID | Riesgo | Mitigación |
|---|---|---|
| R-01 | Modelos gratuitos pierden contexto en un proyecto tan grande | Documentación por módulos pequeños; cada Juego es una tarea independiente de ≤ 1 archivo guía; `AGENTS.md` por carpeta |
| R-02 | Módulos nativos (audio, voz, gráficos) no funcionan en Expo Go | Usar *development build* desde el día 1 |
| R-03 | Calidad del banco léxico (nombres propios, errores, flexiones) | Pipeline de filtrado y lista negra; muestreo manual por categoría |
| R-04 | Licencias con *ShareAlike* (CC BY-SA) contaminan el resto de los datos | Mantener cada fuente en su propia tabla con licencia; ver `LEXICAL_DATABASE_AND_APIS.md` |
| R-05 | Rendimiento del Mapa Mental con 121 nodos y gestos | Lienzo con gráficos acelerados; prueba de rendimiento en etapa propia |
| R-06 | Iterar diseño visual de 32 identidades distintas | Sistema de diseño compartido + «tema por Juego» como datos (tokens), no 32 interfaces desde cero |

## D. Resumen de preguntas para vos

1. ¿Apple Developer (pago) o iOS diferido? (D-01)
2. ¿Aceptás el borrador de recuperación temporal? (D-03)
3. ¿Imágenes incluidas o descargables? (D-05)
4. ¿Querés consulta legal antes de incluir citas de obras protegidas? (D-04)
