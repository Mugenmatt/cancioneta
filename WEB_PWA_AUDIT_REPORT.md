# WEB_PWA_AUDIT_REPORT — Expo Web + PWA iPhone

## Alcance
Auditoría y adaptación mínima sin instalar dependencias ni modificar la esencia de los Juegos. Los documentos están en la raíz del repositorio; `docs/` está vacío.

## Verificación ejecutada
- `npm ls --depth=0`: Expo SDK 58 (`expo@58.0.26`), `expo-router@58.0.32`, `react@19.3.0`, `react-dom@19.3.0`, `react-native@0.88.1`, `react-native-web@0.21.4`.
- `CI=1 npx expo start --web --port 19007`: HTTP 200, `Web Bundled 2679ms`, sin errores.
- `CI=1 npx expo export --platform web --output-dir <temp>`: export correcto, 14 bundles web y 51 rutas estáticas (`Web Bundled 6638ms` en la última corrida).
- `npm test`: 31 suites, 129 pruebas, todas pasan.
- `npm run lint`: sin errores.
- `npm run typecheck`: sin errores.
- `npx expo export --platform web`: export correcto en `dist/`, 14 bundles web y 51 rutas estáticas.
- `npx expo serve` + `curl`: `/`, `/juegos`, `/juego/g01`, `/juego/g23`, `/manifest.webmanifest`, `/sw.js` y `/icon-192.png` respondieron 200; `/juego/g31` respondió 404, coherente con el registry.

## Listo
- `app.json` ya define `web.output: "static"`, `display: "standalone"`, `startUrl`/`scope: "/"`, `lang: "es-AR"` y colores de la app.
- PWA: `app/+html.tsx` registra `/sw.js`, linka `manifest.webmanifest`, declara meta Apple e iconos; `public/manifest.webmanifest` tiene iconos 192/512 maskable y `apple-touch-icon` 180.
- En iOS Safari la instalación se hace con «Compartir → Agregar a pantalla de inicio»; no hace falta `beforeinstallprompt`. El service worker no es requisito de instalación, pero sí de offline.
- `vercel.json` ahora declara `buildCommand`, `outputDirectory` y `framework`, y conserva `cleanUrls` y los headers de caché para `sw.js`, manifiesto y assets con hash.
- `public/sw.js` dejó de precachear `/juego/g31`; coincide con `src/games/registry.ts` y con las 51 rutas exportadas. Se subió la versión de caché a `cancioneta-shell-v2`.
- Audio: el motor usado por la app es `src/services/audio/AudioScheduler.ts`, basado en Web Audio (`react-native-audio-api` resuelve `api.web.ts`). `PianoEngine` y `MetronomeEngine` quedaron sin uso y no se modificaron.
- Grabación: `removeTemporaryAudio` revoca URIs `blob:` en web y sigue borrando archivos reales en nativo.
- G-23 en web: guardar JSON genera una descarga `Blob`; importar archivo lee `blob:` con `fetch` y libera la URI; imagen se exporta como SVG generado desde el layout (sin dependencias); PDF usa el diálogo de impresión del navegador; WhatsApp usa el menú de compartir del sistema.
- iOS/Android: las rutas nativas originales de G-23 quedaron restauradas (`whatsapp://`, `Print.printToFileAsync`, `File`/`Paths` y el mensaje «Elegí dónde guardarlo…»). Las adaptaciones solo se ejecutan cuando `Platform.OS === 'web'`.

## Falta
- QA real en iPhone Safari: no se marcó aprobado por inferencia. Ver `QA_IPHONE.md`.
- Transcripción: `expo-speech-recognition` usa Web Speech API, con soporte parcial en Safari iOS. No se puede garantizar reconocimiento on-device ni afirmar que el audio no sale del dispositivo en web. La alternativa manual sigue siendo la opción segura.
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

`package.json` declara `"engines": { "node": ">=22" }`. Vercel respeta ese campo; de todos modos conviene confirmar Node.js 22+ en Project Settings. Los headers mantienen `no-cache` para `/sw.js` y `/manifest.webmanifest`, e `immutable` para `/_expo/static/...` con hash de 32 caracteres. No se agregaron `rewrites` porque el output es `static` y las rutas ya tienen archivos HTML propios.

## Archivos modificados en esta entrega
- `package.json`
- `src/content/games/g23.ts`
- `src/games/phase0/WhyGame.tsx`
- `src/games/runtime/MapGame.tsx`
- `src/services/random/RandomService.ts`
- `tests/randomService.test.ts`
- `WEB_PWA_AUDIT_REPORT.md`

## Archivos ya incluidos en la auditoría aprobada
- `vercel.json`, `public/sw.js`, `src/games/phase0/audio.ts`
- `src/games/runtime/mapSvg.ts`, `src/services/export/TextFileService.ts`
- `tests/mapSvg.test.ts`, `tests/phase0Audio.test.ts`, `tests/textFileService.test.ts`

## Pruebas agregadas
- En la auditoría aprobada: `tests/phase0Audio.test.ts` (3), `tests/textFileService.test.ts` (7) y `tests/mapSvg.test.ts` (1).
- En esta entrega: `tests/randomService.test.ts` (1 prueba nueva: `pickN` elige n elementos distintos sin modificar el ledger).

## Errores corregidos
- `src/games/phase0/WhyGame.tsx`: el ref pasó de `TextInput` a `TextInputInstance`, el tipo que acepta `TextInput` en React Native 0.88.
- `src/games/runtime/CollageGame.tsx` y `src/games/runtime/CutupGame.tsx`: se agregó `RandomService.pickN`, que los Juegos ya invocaban. Usa el RNG del servicio, no toca el ledger y devuelve elementos distintos.

## Estado del despliegue
El proyecto está listo para desplegarse en Vercel desde el punto de vista de build, export estático, PWA y typecheck. Falta la comprobación real en Vercel y en dispositivo.

## No probado
- No se probó en iPhone Safari ni en Android; la revisión de plataforma fue por código, tests automatizados y servidor local.
- No se verificó una instalación real desde “Agregar a pantalla de inicio”, ni el funcionamiento offline del service worker en un dispositivo.
- No se ejecutó un deploy real en Vercel.

## Sin instalar
No se agregó ninguna dependencia. La exportación de imagen en web usa SVG generado con datos del mapa; no se requiere `html2canvas-pro`.
