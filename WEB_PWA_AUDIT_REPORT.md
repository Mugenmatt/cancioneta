# WEB_PWA_AUDIT_REPORT — Expo Web + PWA iPhone

## Alcance
Auditoría y adaptación mínima sin instalar dependencias ni modificar la esencia de los Juegos. Los documentos están en la raíz del repositorio; `docs/` está vacío.

## Verificación ejecutada
- `npm ls --depth=0`: Expo SDK 58 (`expo@58.0.26`), `expo-router@58.0.32`, `react@19.3.0`, `react-dom@19.3.0`, `react-native@0.88.1`, `react-native-web@0.21.4`.
- `CI=1 npx expo start --web --port 19007`: HTTP 200, `Web Bundled 2679ms`, sin errores.
- `CI=1 npx expo export --platform web --output-dir <temp>`: export correcto, 14 bundles web y 51 rutas estáticas (`Web Bundled 6638ms` en la última corrida).
- `npm test`: 31 suites, 128 pruebas, todas pasan.
- `npm run lint`: sin errores.
- `npm run typecheck`: quedan 4 errores preexistentes, no introducidos por esta tarea:
  - `src/games/phase0/WhyGame.tsx:27` y `:46` (tipos de `TextInput`).
  - `src/games/runtime/CollageGame.tsx:30` y `src/games/runtime/CutupGame.tsx:26` (`RandomService.pickN` no existe).

## Listo
- `app.json` ya define `web.output: "static"`, `display: "standalone"`, `startUrl`/`scope: "/"`, `lang: "es-AR"` y colores de la app.
- PWA: `app/+html.tsx` registra `/sw.js`, linka `manifest.webmanifest`, declara meta Apple e iconos; `public/manifest.webmanifest` tiene iconos 192/512 maskable y `apple-touch-icon` 180.
- En iOS Safari la instalación se hace con «Compartir → Agregar a pantalla de inicio»; no hace falta `beforeinstallprompt`. El service worker no es requisito de instalación, pero sí de offline.
- `vercel.json` ahora declara `buildCommand`, `outputDirectory` y `framework`, y conserva `cleanUrls` y los headers de caché para `sw.js`, manifiesto y assets con hash.
- `public/sw.js` dejó de precachear `/juego/g31`; coincide con `src/games/registry.ts` y con las 51 rutas exportadas. Se subió la versión de caché a `cancioneta-shell-v2`.
- Audio: el motor usado por la app es `src/services/audio/AudioScheduler.ts`, basado en Web Audio (`react-native-audio-api` resuelve `api.web.ts`). `PianoEngine` y `MetronomeEngine` quedaron sin uso y no se modificaron.
- Grabación: `removeTemporaryAudio` revoca URIs `blob:` en web y sigue borrando archivos reales en nativo.
- G-23 en web: guardar JSON genera una descarga `Blob`; importar archivo lee `blob:` con `fetch` y libera la URI; imagen se exporta como SVG generado desde el layout (sin dependencias); PDF usa el diálogo de impresión del navegador; WhatsApp pasa por el menú de compartir del sistema, según `LYRIC_EDITOR_AND_EXPORT.md`.

## Falta
- QA real en iPhone Safari: no se marcó aprobado por inferencia. Ver `QA_IPHONE.md`.
- Transcripción: `expo-speech-recognition` usa Web Speech API, con soporte parcial en Safari iOS. No se puede garantizar reconocimiento on-device ni afirmar que el audio no sale del dispositivo en web. La alternativa manual sigue siendo la opción segura.
- Definir Node 22+ en Project Settings de Vercel o agregar `engines.node` a `package.json` (no hecho para no tocar otro archivo en la misma tarea).
- Corregir los 4 errores preexistentes de `npm run typecheck` listados arriba.
- Aclarar la documentación: `IMPLEMENTATION_STATUS.md` menciona G-31 como implementado, pero `registry.ts` y su prueba lo excluyen. La app no genera `/juego/g31`.
- Si se quiere PNG idéntico al lienzo en web, `react-native-view-shot` necesita `html2canvas-pro`. No se instaló: requiere aviso previo de nombre, licencia y motivo según `AGENTS.md`.

## Configuración Vercel
`vercel.json` quedó con:

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "cleanUrls": true
}
```

Además, en el proyecto de Vercel: Node.js 22+ y `Output Directory = dist`. Los headers ya presentes mantienen `no-cache` para `/sw.js` y `/manifest.webmanifest`, e `immutable` para `/_expo/static/...` con hash de 32 caracteres.

## Archivos modificados
- `vercel.json`
- `public/sw.js`
- `src/content/games/g23.ts`
- `src/games/phase0/audio.ts`
- `src/games/runtime/MapGame.tsx`

## Archivos creados
- `src/games/runtime/mapSvg.ts`
- `src/services/export/TextFileService.ts`
- `tests/mapSvg.test.ts`
- `tests/phase0Audio.test.ts`
- `tests/textFileService.test.ts`

## Pruebas agregadas
- `tests/phase0Audio.test.ts`: 3 pruebas (blob revocado, archivo nativo borrado, uri nula).
- `tests/textFileService.test.ts`: 7 pruebas (detección web, descarga Blob, guardado nativo, lectura blob, liberación blob, impresión web, compartir).
- `tests/mapSvg.test.ts`: 1 prueba (SVG con conexiones, nodos y texto escapado).

## Sin instalar
No se agregó ninguna dependencia. La exportación de imagen en web usa SVG generado con datos del mapa; no se requiere `html2canvas-pro`.
