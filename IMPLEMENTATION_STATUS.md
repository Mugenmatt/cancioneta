# IMPLEMENTATION_STATUS — estado real de implementación

Actualizado: 2026-11-20.

`ready` en `GameRegistry` significa **ruta y componente conectados**, no QA aprobado ni conformidad total verificada en dispositivo.

## Funcionalidades implementadas

- 37 IDs registrados (Fase 0 + G-01…G-32), sin pantalla «Este juego todavía se está armando».
- Contenedor `app/juego/[id].tsx` con intro, «Comenzar» y juego; textos en `src/content/`.
- Fase 0 completa en `src/games/phase0/`: voz, páginas matutinas, prompt, espía y «¿Por qué?».
- Juegos numerados en `src/games/runtime/`; G-02, G-05 y G-24 conservan componentes propios.
- Pools reales integrados en `src/services/data/DataService.ts`; `testData: false`.
- Editor central, exportación de texto y bridge no destructivo desde los juegos.
- Configuración EAS verificada para build iOS interna (`cli.appVersionSource: remote`, `build.preview.distribution: internal`, `LSApplicationQueriesSchemes: ["whatsapp"]`) y checklist actualizado en `QA_IPHONE.md` con selector de archivos, navegación por relaciones, 121 nodos, exports, permisos, audio, VoiceOver y modo avión. **No se compiló ni instaló en iPhone.**
- Compatibilidad Expo Web/Safari analizada: 30 juegos funcionan sin cambios, G-19 y G-23 requieren adaptación; transcripción offline, motor de audio exacto, ciclo de archivos temporales y guardado con selector nativo no se reproducen en Safari y necesitan alternativas explícitas. Decisión del usuario: no pagar Apple Developer; evaluar motor local de transcripción y dependencias de imagen/PDF; próximo cambio W1 (shell PWA).
- W1 implementado: `web.output: "static"` y metadatos PWA en `app.json`, 37 rutas estáticas generadas desde `gameIds()`, `app/+html.tsx`, manifiesto, iconos 180/192/512 y `public/sw.js` con caché del shell. `npx expo export -p web` generó `dist` con 47 rutas y verificó manifiesto, iconos y registro del service worker. **No probado en iPhone Safari.**

## Auditoría individual cerrada en esta sesión

- **G-01 Asociación Libre:** verificadas 3 columnas configurables, 10 palabras por columna, no repetición entre columnas, regeneración aislada y `groupSet` de huellas. Corregido: las 10 palabras ahora se completan desde pools reales sin depender de los fallbacks de `RandomService`; se bloquean regeneraciones concurrentes; se mejoró tamaño/espacio con tokens. Implementado el estímulo plegable de 30 palabras en 3 grupos dentro del editor, sin insertar ni exportar palabras como letra. **Pendiente:** QA en dispositivo.
- **G-14 Otra Perspectiva:** verificadas categoría opcional, cinco categorías reales y que solo se muestra el sustantivo. Corregido: la huella del sustantivo ahora usa `fingerprint()` y se reutiliza el `PoolItem` real; se agregó el motivo visual lente/ojo. **Pendiente:** QA en dispositivo.
- **G-23 Mapa Mental:** corregido el núcleo: tres ranuras desde la creación, hijos simultáneos, ranura vacía tras borrar con subárbol y confirmación (D-10), sugerencias desde relaciones semánticas reales con puntaje por tipo/frecuencia/no repetición, JSON versionado `schema: 'cancioneta.mapa'` con `connections` y `positions`, import validado (incluye v1), desplazamiento acumulativo, borrado del archivo temporal y `LSApplicationQueriesSchemes` para WhatsApp. Agregadas 1.565 relaciones reales de partes-todo y derivados desde Wiktextract; el lienzo ahora dibuja nodos posicionados, conexiones SVG y navegación por relaciones, con exportaciones ordenadas según el mapa visual. Se aplicó un filtro estructural a las `parts` (descarta relaciones recíprocas y series con tres o más partes compartidas): quedan 1.555 entradas, 12 relaciones parte-todo (`faz`, `puntero`) y 1.631 derivados intactos. También se agregó importación desde archivo con `expo-document-picker` (ya instalado, MIT): lee una copia temporal, valida con `parseMapPayload` y la borra; el guardado sigue por `expo-sharing`. **Pendiente:** no se probó rendimiento a 121 nodos ni exportaciones en dispositivo.
- **G-31 Cadena de letras:** pendiente, no implementado: no tiene tema, ruta ni lógica; aparece como entrada `pending` en `/dev/gallery` y no se cuenta entre los 36 juegos habilitados. El trabajo previo sobre datos y reglas no equivale a una implementación; queda fuera de la plantilla de aceptación hasta que haya una decisión y una build que lo incluya (ver `QA_AND_ACCEPTANCE_TESTS.md` §0 y `QA_IPHONE.md`).

Otros juegos auditados en sesiones anteriores: Fase 0, G-02, G-03, G-04, G-05, G-06, G-07, G-19, G-21, G-24. No se modificaron sus reglas.

## Pruebas automatizadas que pasaron

- `npm test -- --runInBand`: 18 suites, 85 pruebas, OK.
- `npm run lint`: 0 errores, 0 advertencias.
- `npm run typecheck`: OK.
- `npx expo export -p web`: 47 rutas estáticas, `dist` con manifiesto, iconos y `sw.js`, OK.
- Pruebas nuevas/ajustadas: `tests/associationGame.test.ts`, `tests/letterChainGame.test.ts`, `tests/mapFile.test.ts`, `tests/mapGame.test.ts`, `tests/mapRelationsData.test.ts`, `tests/stimulusPanel.test.ts`.

## Bases de datos integradas

- Léxico (`src/data/lexiconReal.ts`): 12.000 sustantivos, 3.770 verbos, 7.964 adjetivos, 58.408 formas flexionadas y 8.998 relaciones de Wiktextract. Frecuencias de OpenSLR SLR21.
- CulturaDB (`src/data/culturalReal.ts`): 350 registros verificados — 100 libros, 100 canciones, 103 prompts originales, 47 imágenes de Wikimedia Commons. No hay poemas ni citas protegidas integradas.
- Ledger de no repetición: almacenamiento local técnico; no guarda letras del usuario.

## Derechos y licencias pendientes

- D-04 continúa pendiente: solo se usan metadatos/enlaces, dominio público, licencias abiertas y contenido original de la casa.
- Falta revisión legal de CC BY-SA/GFDL del léxico (Wikcionario/SLR21) y de las atribuciones de Commons antes de publicar.
- MCR 3.0 oficial quedó inalcanzable; las relaciones vienen de Wiktextract. Las 1.555 entradas de `src/data/mapRelationsReal.ts` son reales; se descartaron las series de números y notas por ruidosas, sin inventar relaciones. Falta la revisión legal de CC BY-SA/GFDL antes de publicar.
- Gutendex, Wikidata y Wikiquote fallaron por timeouts o no completaron; no se inventaron registros.

## No probado en dispositivo

- Grabación, reproducción, reconocimiento on-device y borrado del archivo temporal de F0-1.
- Carga remota de imágenes en F0-3/G-19 y visualización de atribuciones.
- G-23: pan/zoom del grafo posicionado con 121 nodos, guardar/importar/exportar imagen y PDF, compartir y WhatsApp.
- G-31: tablero táctil, selección diagonal, render de `ñ`/`qu` y rendimiento.
- Build iOS, permisos, haptics, audio, VoiceOver, modo avión y fluidez general. Ver `QA_IPHONE.md`.
