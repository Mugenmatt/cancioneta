# QA en iPhone — instrucciones y checklist

Estado: **preparado, NO ejecutado**. Esta app todavía no fue instalada ni probada en un iPhone real.

## Restricción actual

Desde Windows no se puede compilar iOS localmente. Hay que usar EAS Build con una cuenta de Expo y, para distribución interna a un dispositivo, una cuenta de Apple Developer y el UDID del iPhone registrado. Expo Go no alcanza porque el proyecto usa módulos nativos (`expo-audio`, `expo-document-picker`, `expo-speech-recognition`, `expo-sharing`, `react-native-view-shot`). `expo-document-picker` se vincula automáticamente; no se pide iCloud ni su plugin.

Configuración ya revisada en `app.json`:

- Permisos iOS: micrófono y reconocimiento de voz con texto en español.
- `LSApplicationQueriesSchemes: ["whatsapp"]` para abrir WhatsApp desde G-23.
- Plugins: `expo-router`, `expo-splash-screen`, `expo-audio`, `expo-sharing`, `expo-speech-recognition`. `expo-document-picker` no necesita plugin para importar desde Archivos.
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
- [ ] Texto dinámico grande no rompe G-01, G-23 ni G-31.
- [ ] Rotación y notch: nada se corta; la app está fijada a portrait.
- [ ] Modo claro y oscuro mantienen contraste.

## Registro de QA

No tachar ningún ítem por inferencia. Cada ítem requiere fecha, iPhone/modelo, iOS version y observación real. Mientras no exista ese registro, el estado del QA físico es **pendiente**.
