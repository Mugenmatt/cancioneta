# QA en iPhone — instrucciones y checklist

Estado: **pendiente, NO aprobado**. Esta app todavía no fue instalada ni probada en un iPhone real.

## Estado documental del cierre (S18)

Verificado por código, tests y export, **no en dispositivo**:

- 36 temas implementados: 5 de Fase 0 y 31 Juegos (g01–g30 y g32). G-31 sigue pendiente, sin tema, ruta ni lógica; en `/dev/gallery` aparece como tarjeta «Pendiente» junto a las 36 reales (`src/design/galleryAudit.ts:40-61`, `tests/devGallery.test.ts`).
- Contraste AA en claro y oscuro: 648 comparaciones de tokens (36 temas × 2 modos × 3 roles de texto × 3 fondos), sin fallas bajo el piso de 4,5:1 (`src/design/galleryAudit.ts:63-83`). No reemplaza la observación visual en pantalla real.
- Texto al 200 %: `AppText` habilita escalado hasta 2× y el layout de acordes tiene prueba a 2× (`tests/chordCardLayout.test.ts`). Falta revisar cortes y solapes en todas las pantallas.
- Reduce Motion: preferencia en Ajustes, persistida y aplicada a entradas, hojas, botones y dados, con pruebas de funciones puras (`tests/designEntrance.test.ts`). Falta probar el toggle y su persistencia en el dispositivo.
- Offline: `/sw.js` precachea el shell, el manifiesto, los iconos y las 11 fuentes `.ttf` desde la primera visita. No se verificó el offline real ni la instalación «Agregar a pantalla de inicio».
- Comandos de esta sesión: `npm test` (46 suites y 196 pruebas), `npm run lint` y `npm run typecheck` sin errores; export web estático correcto.

## Restricción actual

Desde Windows no se puede compilar iOS localmente. Hay que usar EAS Build con una cuenta de Expo y, para distribución interna a un dispositivo, una cuenta de Apple Developer y el UDID del iPhone registrado. Expo Go no alcanza porque el proyecto usa módulos nativos (`expo-audio`, `expo-document-picker`, `expo-speech-recognition`, `expo-sharing`, `react-native-view-shot`). `expo-document-picker` se vincula automáticamente; no se pide iCloud ni su plugin.

Configuración ya revisada en `app.json`:

- Permisos iOS: micrófono y reconocimiento de voz con texto en español.
- `LSApplicationQueriesSchemes: ["whatsapp"]` para abrir WhatsApp desde G-23.
- Plugins: `expo-router`, `expo-splash-screen`, `expo-audio`, `expo-sharing`, `expo-speech-recognition`. `expo-document-picker` no necesita plugin para importar desde Archivos.
- `react-native-keyboard-controller` (KeyboardProvider en `app/_layout.tsx:7,71-78`) no requiere plugin en `app.json`: el paquete 1.22.7 no incluye config plugin y se vincula por autolinking. En web usa las implementaciones no nativas de `bindings.ts`, y el export web compila sin errores.
- `eas.json`: `cli.appVersionSource: "remote"` y perfil `preview` con `distribution: "internal"`.
- Estado verificado en archivos: los tres valores pedidos ya están presentes. No se lanzó ningún build ni se instaló la app en un iPhone.

## Pasos exactos

1. En la raíz del proyecto:

   ```bash
   npx expo-doctor
   npm test -- --runInBand
   npm run lint
   npm run typecheck
   ```

2. Iniciar sesión y vincular el proyecto:

   ```bash
   npx eas-cli login
   npx eas-cli init
   ```

   Si `eas init` crea un `app.json` con un `projectId` nuevo, confirmar el cambio.

3. Registrar el iPhone:

   ```bash
   npx eas-cli device:create --ios
   ```

   Elegir «Scan QR code» y abrir el código con la cámara del iPhone. Verificar que el UDID figure con:

   ```bash
   npx eas-cli device:list
   ```

4. Compilar:

   ```bash
   npx eas-cli build -p ios --profile preview
   ```

   Si EAS pide credenciales, elegir que las genere y las administre EAS. No pegar secretos en el repositorio.

5. Ver la compilación:

   ```bash
   npx eas-cli build:list
   npx eas-cli build:logs --id <BUILD_ID>
   ```

6. Abrir en el iPhone la URL/QR que muestra EAS e instalar la app internamente. Si el perfil es ad hoc y el dispositivo no figura en `device:list`, la instalación falla: volver al paso 3.

7. Después de cada cambio de código, repetir el paso 4. No usar Expo Go ni suponer que OTA actualizó la build: no hay canal de updates configurado.

## Checklist de dispositivo físico

Marcar solo después de ejecutar la prueba en el iPhone.

### Permisos y privacidad

- [ ] Primera apertura: no aparecen diálogos de permisos hasta que se usa una función que los necesita.
- [ ] F0-1: al grabar aparece el diálogo de micrófono; aceptarlo y grabar.
- [ ] F0-1: rechazar el permiso, ver el mensaje alternativo y no crashear.
- [ ] F0-1: la transcripción on-device funciona sin red; confirmar que no aparece spinner de servidor.
- [ ] F0-1: reproducir la grabación; borrar el audio temporal al terminar y al cerrar la pantalla.
- [ ] Modo avión: abrir la app, jugar, escribir y exportar texto sin dependencias de red.
- [ ] Cerrar la app desde el sistema: no queda letra ni grabación persistida.

### Fase 0

- [ ] F0-1: seleccionar fragmentos, editar copias y comprobar que la transcripción original no se modifica.
- [ ] F0-1: exportar fragmentos al portapapeles y pegarlos en otra app.
- [ ] F0-2: contador de 3 páginas y rango 250–300 palabras por página.
- [ ] F0-3: cambiar prompt e imagen de forma independiente; cargar imagen remota de Wikimedia Commons con su autor/licencia.
- [ ] F0-4: cuenta regresiva de 60 segundos y bloqueo de escritura hasta que termine.
- [ ] F0-5: atajo «¿Por qué?» abre el ejercicio sin borrar texto existente.

### Juegos auditados

Solo G-01, G-14 y G-23 están implementados y pendientes de prueba en dispositivo.

- [ ] G-01: aparecen 3 columnas de 10; ninguna palabra se repite; regenerar una columna no cambia las otras; regenerar todo respeta la no repetición.
- [ ] G-01: las fichas se leen cómodamente en pantalla de iPhone y los botones son tocables.
- [ ] G-14: se muestra solo el sustantivo; «Sin categoría» y las cinco categorías funcionan; «Otro sustantivo» no repite el anterior inmediato.
- [ ] G-23: al crear el mapa aparecen exactamente tres ranuras; se pueden completar a mano o con «Generar tres palabras relacionadas»; las tres aparecen juntas.
- [ ] G-23: cada nodo tiene tres ranuras; se pueden completar ranuras sueltas; borrar hijo vacía la ranura y el subárbol con confirmación.
- [ ] G-23: llegar a nivel 5 y a 121 nodos sin pasar el límite; probar zoom y arrastres múltiples (el desplazamiento debe acumularse).
- [ ] G-23: seleccionar un nodo y navegar al padre y a los hijos por sus relaciones; verificar las etiquetas «Parte-todo», «Derivado» y «A mano».
- [ ] G-23: guardar `.mapa.json`, compartirlo, importarlo desde Archivos con el selector y también pegando el JSON; volver a abrirlo y comprobar que no queda una copia temporal. El JSON incluye `schema`, `version`, `connections` y `positions`.
- [ ] G-23: exportar imagen y PDF; compartir por WhatsApp con la app instalada y sin ella.
- [ ] G-23: rendimiento del lienzo con 121 nodos sin congelamiento.

### G-31 — pendiente, no auditable todavía

G-31 no está implementado: no tiene tema, ruta ni lógica. Estos ítems se conservan como requisito a futuro y **no se pueden tachar** hasta que exista una build que los incluya; `/dev/gallery` lo muestra como «Pendiente».

- [ ] G-31: tablero 8×8; selección en 8 direcciones; no repetir casilla; tocar una casilla ya usada recorta el camino.
- [ ] G-31: validar palabras con el léxico real; `ñ` se conserva (`año`), tildes se comparan sin acento y `qu` cuenta como una ficha.
- [ ] G-31: la grilla muestra el mensaje de garantía solo cuando realmente se genera el mínimo de 20 palabras; «Nueva grilla» reinicia la lista.
- [ ] G-31: llevar palabras al editor conserva la escritura real (`año`, `queso`), no la clave normalizada.

### Editor, audio y exportación global

- [ ] «Llevar al cuaderno» desde varios juegos no borra texto previo.
- [ ] Editor: abrir y volver al juego; el estado del juego sigue donde estaba.
- [ ] Piano/progresiones: latencia, superposición y cortes al salir de la app (solo si el módulo está expuesto en la build).
- [ ] Portapapeles, menú de compartir y WhatsApp funcionan con permisos del sistema.
- [ ] Haptics responde en los botones principales.

### Accesibilidad y layout

- [ ] VoiceOver lee botones y estímulos; no hay controles sin etiqueta.
- [ ] Texto dinámico grande no rompe G-01 ni G-23 (G-31 está pendiente).
- [ ] Rotación y notch: nada se corta; la app está fijada a portrait.
- [ ] Modo claro y oscuro mantienen contraste (la auditoría automática de tokens no reemplaza la revisión visual).
- [ ] Reducir movimiento: activar en Ajustes, verificar que no haya animaciones espaciales en entradas, hojas, botones ni dados, y comprobar que la preferencia persiste al reabrir.

### PWA en iPhone Safari (no ejecutado)

- [ ] Instalar con «Compartir → Agregar a pantalla de inicio» y comprobar que abre a pantalla completa.
- [ ] Visitar con red y después activar modo avión: navegar por Juegos y verificar que carguen el shell, los estilos y las 11 fuentes `.ttf` desde el service worker.
- [ ] Recargar en modo avión: sin contenido en blanco ni fuentes de reemplazo.
- [ ] Comprobar que `/juego/g31` no existe y que `/dev/gallery` muestra G-31 como pendiente.
- [ ] Transcripción: confirmar el soporte parcial de Web Speech en Safari iOS; no afirmar que es on-device ni usarlo como garantía de privacidad.

## Registro de QA

No tachar ningún ítem por inferencia. Cada ítem requiere fecha, iPhone/modelo, iOS version y observación real. Mientras no exista ese registro, el estado del QA físico es **pendiente**.

| Ítems | Fecha | iPhone / modelo | iOS | Observación |
|---|---|---|---|---|
| Todos los de este documento | — | — | — | Sin dispositivo real; ningún ítem aprobado |

## Queda pendiente

1. Ejecutar el paso 1 (`npx expo-doctor`, `npm test`, `npm run lint`, `npm run typecheck`) y los pasos 2 a 7: login de EAS, registro del UDID, build `preview`, instalación interna y nueva build después de cada cambio.
2. Completar en dispositivo real todas las casillas de permisos, Fase 0, G-01, G-14, G-23, editor/audio/exportación y accesibilidad, incluidos contraste visual, texto al 200 %, VoiceOver y Reduce Motion persistido.
3. Probar en iPhone Safari la instalación PWA, el arranque offline con las 11 fuentes precacheadas y el comportamiento real de la transcripción Web Speech.
4. Implementar G-31 antes de poder auditar sus cuatro ítems; hoy solo figura como pendiente en `/dev/gallery`.
5. Verificar el deploy real en Vercel y aclarar `IMPLEMENTATION_STATUS.md`, que todavía describe G-31 como implementado.
