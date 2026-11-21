# AGENTS.md — App de composición de canciones

## Qué es este proyecto
App mobile (Android primero, iOS-ready) para componer canciones con 32 Juegos creativos, acordes con piano y estructuras poéticas. La documentación completa está en `docs/`. NO inventes decisiones: si algo no está en `docs/`, preguntá.

## Reglas absolutas
1. No cambies la esencia de ningún Juego (G-01 a G-32). Reglas literales en `docs/GAME_CATALOG.md`.
2. No agregues IA generativa, cuentas de usuario, analíticas ni anuncios.
3. No guardes letras, grabaciones ni textos del usuario de forma permanente. Todo vive en memoria o en carpeta temporal. Ver `docs/PRIVACY_AND_OFFLINE.md`.
4. Prohibido `Math.random()` fuera de `src/services/random`. Toda aleatoriedad pasa por `RandomService`.
5. Los Juegos NO se importan entre sí y NO tocan SQLite directamente. Usan servicios por interfaz.
6. Ningún Juego modifica ni borra texto existente del editor sin acción explícita del usuario.
7. Sin claves de API en el código.
8. Textos de interfaz en español argentino (voseo: «tocá», «elegí»). Sin textos incrustados en componentes: van en archivos de contenido.
9. Usa solo los tokens de diseño de `src/design`. Sin colores ni tamaños sueltos.
10. No instales dependencias sin avisar: indicá nombre, para qué sirve y su licencia. Instalá con `npx expo install <paquete>` cuando sea una librería de Expo.

## Cómo trabajar
- UNA tarea chica por vez. Una tarea = un archivo o una función con su prueba.
- Antes de escribir código, leé SOLO el documento que te indique la tarea.
- Si no estás seguro, usá el modo Plan y mostrá el plan antes de escribir.
- Después de cada cambio: corré `npm test` y `npm run lint` y mostrá el resultado real. No digas «listo» sin haberlos corrido.
- No reescribas archivos enteros para cambiar unas líneas. Editá solo lo necesario.
- No borres ni muevas archivos que no pertenezcan a la tarea.
- Si algo falla dos veces con el mismo enfoque, DETENETE y explicá el problema en lugar de seguir probando.
- Al terminar, listá: archivos creados/modificados, pruebas agregadas, y qué falta.

## Estilo de código
- TypeScript estricto, sin `any` implícito. Funciones puras para la lógica; los controladores de Juegos no dependen de React.
- Nombres de código en inglés; textos al usuario en español.
- Un archivo de más de ~400 líneas se divide.

## Estructura
`app/` rutas · `src/core` · `src/services` · `src/stores` · `src/design` · `src/editor` · `src/music` · `src/poetry` · `src/games/gNN-nombre` · `data/` · `scripts/` · `tests/` · `docs/`.

## Comandos
(Completar con los que detecte /init y los de la Etapa E0: `npm install`, `npx expo start`, `npm test`, `npm run lint`.)

## Mapa de documentos (leer solo el que corresponda)
- Producto: docs/PRODUCT_SPEC.md · Decisiones: docs/DECISIONS_AND_OPEN_QUESTIONS.md
- Flujos: docs/USER_FLOWS.md · Juegos: docs/GAME_CATALOG.md, docs/GAME_ARCHITECTURE.md
- Aleatoriedad: docs/RANDOMIZATION_SYSTEM.md · Datos: docs/LEXICAL_DATABASE_AND_APIS.md, docs/CONTENT_DATABASE.md
- Música: docs/MUSIC_ENGINE.md · Editor: docs/LYRIC_EDITOR_AND_EXPORT.md
- Poesía: docs/POETIC_STRUCTURES.md, docs/POETIC_RESOURCES.md
- Diseño: docs/DESIGN_SYSTEM.md · Técnica: docs/TECHNICAL_ARCHITECTURE.md · Privacidad: docs/PRIVACY_AND_OFFLINE.md
- Plan: docs/IMPLEMENTATION_ROADMAP.md · Pruebas: docs/QA_AND_ACCEPTANCE_TESTS.md

## Marcas en los documentos
[REC] = recomendación · [VERIFICAR] = dato no confirmado: verificalo antes de usarlo · [BLOQUEANTE] = requiere decisión del usuario: preguntá.
