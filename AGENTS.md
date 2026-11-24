# AGENTS.md — App de composición de canciones

## Qué es este proyecto
App mobile (Android primero, iOS-ready) para componer canciones con 32 Juegos creativos, acordes con piano y estructuras poéticas. La documentación completa está en la raíz del repositorio (`docs/` está vacío). NO inventes decisiones: si algo no está en la documentación, preguntá.

## Reglas del proyecto
- No modificar, renombrar ni refactorizar ningún Juego existente (G-01 a G-32) ni la Fase 0, Fase 1 ni Fase 3.
- Todos los Juegos nuevos usan el editor central único. No crear editores nuevos.
- No guardar letras de forma permanente. Si se cierra la app, se pierde la canción. Sin borrador de recuperación.
- Todo funciona offline. Sin IA generativa. Sin servicios externos pagos. Sin cuentas ni registro.
- El audio vive solo en carpeta temporal.
- Usar el sistema existente de aleatoriedad sin repetición. No crear uno nuevo.
- No mostrar ni guardar letras de canciones protegidas. Los ejemplos y bancos de datos deben ser originales.
- Español argentino, voseo.
- Compatibilidad web/PWA: si un Juego usa una API nativa (micrófono, etc.), debe degradar con un mensaje claro en web, sin romper.
- No agregar dependencias nuevas sin avisarme antes y esperar mi aprobación.
- Trabajar de a un Juego por vez. Después de cada Juego, correr typecheck/lint/build o los tests existentes y reportar qué archivos se tocaron.
- Ante la duda, preguntar en vez de inventar.

## Cómo agregar un Juego

Estado real del código (verificado 2026-11-24): el catálogo es `GameMeta[]` en `src/games/registry.ts`. **No existe `GameModule` ni `GameRegistry` como clase en el código**: ese contrato solo está en `GAME_ARCHITECTURE.md`. Los Juegos son componentes React de `src/games/runtime/` despachados por `RuntimeGame()` dentro de la ruta dinámica `app/juego/[id].tsx`. La navegación NO se toca para un Juego simple.

Antes de empezar: elegí el id con el usuario y verificá `src/games/registry.ts` antes de usarlo. `g31` está reservado como entrada `pending` en `src/design/galleryAudit.ts` y excluido por `tests/registry.test.ts`; no lo reutilices sin una decisión explícita. Los `g33` de los pasos de abajo son ejemplos: si `g33` ya está ocupado por otro Juego en curso, reemplazalo por el id acordado (`g34`, etc.) en todas las apariciones. `number` debe ser igual al número del id y `phase: 'nuevo'`.

1. **Regla del Juego:** escribí su ficha nueva en `GAME_CATALOG.md` (sección nueva; no toques G-01 a G-32).
2. **Catálogo:** agregá un `GameMeta` a `GAME_REGISTRY` en `src/games/registry.ts` con `id`, `number`, `name`, `phase: 'nuevo'`, `summary`, `tags`, `status: 'ready'` y `themeId` igual al `id`. No reordenes ni edites las entradas existentes. `gameIds()`, `gameCounts()` y el pool `games` se derivan solos de ahí.
3. **Tema:** agregá la entrada `'g33'` en `raw` de `src/design/themes.ts` con `bg`, `bgAlt`, `surface`, `ink`, `inkSoft`, `accent`, `accentInk`, `motif`, `entrance`, `displayFont` y `label`. Debe pasar contraste AA en claro y oscuro (`auditGalleryContrast`) y tener `theme.id === game.id` (`tests/devGallery.test.ts`).
4. **Intro:** agregá `GAME_INTROS['g33'] = { steps: string[], examples: string[] }` en `src/content/gameIntros.ts`. Sin esa entrada, la pantalla usa pasos y ejemplos genéricos de `GAME_FLOW_TEXT`.
5. **Textos del Juego:** creá `src/content/games/<id>.ts` con las constantes en español argentino (voseo: «elegí», «tocá»). Ningún texto de interfaz dentro del componente.
6. **Componente:** implementá el Juego en `src/games/runtime/` (archivo propio para uno nuevo, o función nueva en un archivo hermano del tipo, sin tocar los Juegos existentes). Usá `useGameTheme(id)` y los compartidos de `./ui`: `GameIntro`, `Note`, `PromptCard`, `GameField`, `MiniButton`, `ActionBar`, `runtimeStyles`. Poné la lógica pura en `./logic.ts` con su prueba. Para enviar al editor usá `ActionBar` con `text` y, si hace falta, `stimulus`: internamente llama a `insertStimulus()` o `setStimulusPanel()` y navega a `/escribir`. No crear editor, store ni bridge nuevos.
7. **Datos y azar:** si usás pools existentes, `dataService.getPool(pool)` y `randomService.draw(pool, n, { excludeFingerprints, filter })`. Si necesitás un pool nuevo: agregá su literal a `PoolId` en `src/core/types.ts` y construilo en `buildPools()` de `src/services/data/DataService.ts` desde un archivo de `src/data/` con `makeItem`/`fingerprint`/`makeId`, con licencia original o de dominio público. Prohibido `Math.random()`, SQLite directo y textos protegidos.
8. **Conexión:** en `src/games/runtime/index.tsx`, importá el componente, agregá `'g33'` a `RUNTIME_GAME_IDS` y un `case 'g33'` en `RuntimeGame()`. NO agregues ruta ni modifiques `app/juego/[id].tsx`: `generateStaticParams()` ya sale de `gameIds()`. Solo se toca ese contenedor si el usuario decide explícitamente un Juego con pantalla propia (como g02, g05 o g24).
9. **Web/PWA:** en `public/sw.js`, agregá `'g33'` a `GAME_IDS` y subí `CACHE_NAME` a la versión siguiente (`cancioneta-shell-v3`). Si el Juego usa micrófono u otra API nativa, detectá web con `isWebPlatform()` de `src/services/export/TextFileService.ts` (o `Platform.OS === 'web'`) y mostrá un mensaje claro desde `src/content/`, sin romper la pantalla.
10. **Pruebas y cierre:** actualizá la lista de ids y los contadores esperados en `tests/registry.test.ts` y los esperados de `tests/devGallery.test.ts` (una tarjeta `ready` más por Juego nuevo, con `g31` siempre `pending`). La base antes de agregar es 36 registros = 5 de Fase 0 + 31 Juegos; sumá 1 por cada Juego nuevo. Agregá `tests/<id>Game.test.ts` para la lógica pura. Corré `npm run typecheck`, `npm test` y `npm run lint`; si cambiaste rutas o PWA, también `npx expo export -p web`. Reportá los archivos tocados y los resultados reales.

Modelos simples para copiar la estructura: G-18 (`src/games/runtime/CardsGame.tsx` → `InsistentVerse`) y G-22 (`src/games/runtime/PromptToolsExtra.tsx` → `RestriccionesGame`).

## Reglas absolutas
1. No cambies la esencia de ningún Juego (G-01 a G-32). Reglas literales en `GAME_CATALOG.md`.
2. No agregues IA generativa, cuentas de usuario, analíticas ni anuncios.
3. No guardes letras, grabaciones ni textos del usuario de forma permanente. Todo vive en memoria o en carpeta temporal. Ver `PRIVACY_AND_OFFLINE.md`.
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
`app/` rutas · `src/core` · `src/services` · `src/stores` · `src/design` · `src/editor` · `src/music` · `src/poetry` · `src/games/gNN-nombre` · `data/` · `scripts/` · `tests/`. La documentación está en la raíz; `docs/` existe pero está vacío.

## Comandos
(Completar con los que detecte /init y los de la Etapa E0: `npm install`, `npx expo start`, `npm test`, `npm run lint`.)

## Mapa de documentos (en la raíz; leer solo el que corresponda)
- Producto: PRODUCT_SPEC.md · Decisiones: DECISIONS_AND_OPEN_QUESTIONS.md
- Flujos: USER_FLOWS.md · Juegos: GAME_CATALOG.md, GAME_ARCHITECTURE.md
- Aleatoriedad: RANDOMIZATION_SYSTEM.md · Datos: LEXICAL_DATABASE_AND_APIS.md, CONTENT_DATABASE.md
- Música: MUSIC_ENGINE.md · Editor: LYRIC_EDITOR_AND_EXPORT.md
- Poesía: POETIC_STRUCTURES.md, POETIC_RESOURCES.md
- Diseño: DESIGN_SYSTEM.md · Técnica: TECHNICAL_ARCHITECTURE.md · Privacidad: PRIVACY_AND_OFFLINE.md
- Plan: IMPLEMENTATION_ROADMAP.md · Pruebas: QA_AND_ACCEPTANCE_TESTS.md

## Marcas en los documentos
[REC] = recomendación · [VERIFICAR] = dato no confirmado: verificalo antes de usarlo · [BLOQUEANTE] = requiere decisión del usuario: preguntá.
