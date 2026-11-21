# OPENCODE_INSTRUCTIONS — Cómo implementar el proyecto con OpenCode

Convenciones en `README.md`. Plan por etapas en `IMPLEMENTATION_ROADMAP.md`. Pruebas en `QA_AND_ACCEPTANCE_TESTS.md`.

Este documento tiene **dos lectores**: vos (para saber qué hacer paso a paso) y **el agente** (OpenCode con un modelo gratuito: MiniMax, Big Pickle, Qwen u otros). El §4 contiene el texto que va literalmente en el `AGENTS.md` del proyecto.

## 1. Qué se verificó de OpenCode y qué no
Verificado en la documentación y guías consultadas:
- OpenCode lee un archivo **`AGENTS.md`** en la raíz del proyecto (y uno global opcional en la carpeta de configuración del usuario); el del proyecto tiene prioridad sobre el global.
- El comando **`/init`** analiza el repositorio y genera un `AGENTS.md` inicial con comandos de compilación, pruebas y lint detectados.
- `opencode.json` admite un campo **`instructions`** con rutas o patrones (*globs*) a archivos de reglas; el contenido de varios archivos se concatena en orden.
- Hay dos modos principales: **Build** (escribe archivos y ejecuta comandos) y **Plan** (solo planifica, sin escribir). Se alterna con la tecla **Tab**.
- Las *skills* viven en carpetas con un `SKILL.md`, por ejemplo `.opencode/skills/<nombre>/SKILL.md`.
- `/connect` conecta un proveedor de modelos.

**No verificado [VERIFICAR antes de usar]:** nombres exactos de campos de `opencode.json` en tu versión, disponibilidad y límites de los modelos gratuitos hoy, y si conviene ejecutar OpenCode en Windows de forma nativa o dentro de WSL. Ante una diferencia, manda la documentación oficial de OpenCode y la salida real de `/init`.

## 2. Preparación (una sola vez)

> Los pasos del 1 al 5 los hacés vos. Si algo falla, copiá el mensaje de error y pegáselo a OpenCode en modo Plan pidiéndole que te explique qué significa antes de tocar nada.

1. **Instalar:** Node.js (versión LTS), Git, un editor de código y OpenCode. Para probar la app: un **teléfono Android con depuración USB** (recomendado en tu PC) o Android Studio con un emulador.
2. **Conectar un modelo gratuito:** abrir OpenCode y usar `/connect`; elegir un proveedor/modelo gratuito disponible. Anotá cuál usás: si cambia la calidad, vas a querer saber con cuál funcionó mejor.
3. **Crear la carpeta del proyecto** y colocar dentro `docs/` con **todos los archivos de este paquete**.
4. **Iniciar Git** (`git init`) y hacer un primer commit con `docs/`.
5. **Ejecutar `/init`** en OpenCode dentro de la carpeta (se vuelve a ejecutar cuando exista el proyecto Expo) y **reemplazar el `AGENTS.md` generado por el texto del §4** (o fusionar los comandos detectados al final).

Estructura inicial:

```
mi-app/
├─ AGENTS.md
├─ opencode.json
├─ docs/                  ← este paquete completo
├─ .opencode/skills/      ← skills del §6
└─ (el proyecto Expo se crea en la Etapa E0)
```

## 3. `opencode.json` (modelo de partida)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md"]
}
```

- Mantener `instructions` corto: **solo `AGENTS.md`**. Los documentos de `docs/` se cargan **a pedido, uno por tarea**, para no llenar el contexto de un modelo gratuito (§5).
- Los permisos de ejecución de comandos (`bash`) los decidís vos. Recomendación para empezar: **pedir confirmación** y pasar a «permitir» solo para los comandos de pruebas y lint cuando te sientas cómodo **[VERIFICAR sintaxis en tu versión]**.

## 4. Texto del `AGENTS.md` (copiar tal cual)

```markdown
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
```

## 5. Cómo trabajar con modelos gratuitos (reglas de oro)

Los modelos gratuitos tienen **menos contexto y menos constancia** que los de pago. Estas reglas compensan:

| Regla | Por qué | Cómo |
|---|---|---|
| **Tareas diminutas** | El modelo pierde el hilo en tareas grandes | Un archivo o una función por pedido |
| **Plan primero, Build después** | Evita código en la dirección equivocada | Tab → Plan; revisar el plan; Tab → Build |
| **Un documento por tarea** | Contexto limitado | «Leé solo `docs/RANDOMIZATION_SYSTEM.md`» |
| **Pruebas antes de avanzar** | El modelo puede decir «listo» sin que funcione | Pedir que corra `npm test` y pegue el resultado |
| **Commit después de cada paso que funciona** | Para volver atrás si algo se rompe | `git add -A && git commit -m "…"` |
| **Sesión nueva por etapa** | El contexto se llena y empeora | Cerrar y abrir; releer `AGENTS.md` y el documento de la etapa |
| **No confiar en afirmaciones sobre versiones o librerías** | Pueden estar desactualizadas | Verificar contra la documentación oficial y `DEPENDENCIES.md` |
| **Si se traba, parar** | Insistir empeora | Copiar el error, abrir una sesión nueva en modo Plan y pedir diagnóstico |

**Señales de que el modelo se está perdiendo:** repite lo mismo, borra archivos que no corresponden, inventa funciones que no existen, ignora una regla del `AGENTS.md`, dice «listo» sin correr pruebas. Respuesta: detener, hacer commit de lo que sirva, y reiniciar la sesión con un pedido más chico.

## 6. Skills propias (carpeta `.opencode/skills/`)

Cada skill es una carpeta con un `SKILL.md`. Se crean en la Etapa E0. Contenido mínimo propuesto:

### 6.1 `new-game-module/SKILL.md`
```markdown
---
name: new-game-module
description: Crear o completar un Juego (G-01..G-32) siguiendo el contrato GameModule
---
1. Leé la ficha del Juego en docs/GAME_CATALOG.md y docs/GAME_ARCHITECTURE.md (§3–§5).
2. Creá src/games/gNN-nombre/ con: meta, intro (contenido en JSON), theme, controller, Screen, tests.
3. El controlador es lógica pura (sin React) y usa RandomService/DataService por interfaz.
4. Registrá el Juego en src/games/registry.ts (una línea).
5. Escribí pruebas del controlador y recorré la plantilla J1–J10 de docs/QA_AND_ACCEPTANCE_TESTS.md §6.
6. No toques otros Juegos ni la navegación.
```

### 6.2 `design-tokens/SKILL.md`
```markdown
---
name: design-tokens
description: Usar solo los tokens de diseño y verificar la galería
---
1. Todo color, tamaño, espaciado y animación sale de src/design/tokens.
2. Si falta un valor, proponelo; no lo escribas suelto.
3. Todo componente nuevo se agrega a /dev/gallery en todos sus estados y temas.
4. Verificá contraste AA y texto al 200 % (docs/DESIGN_SYSTEM.md §8).
```

### 6.3 `accessibility-checklist/SKILL.md`
```markdown
---
name: accessibility-checklist
description: Revisar accesibilidad de una pantalla o Juego
---
Checklist: etiquetas y roles, orden de foco, objetivos ≥ 44 pt, contraste AA, texto al 200 %,
reducir movimiento, alternativa a gestos, información no solo por color.
Referencia: docs/QA_AND_ACCEPTANCE_TESTS.md §5.1.
```

### 6.4 `data-package/SKILL.md`
```markdown
---
name: data-package
description: Trabajar con paquetes de datos (léxico y contenido) sin romper licencias
---
1. Cada registro lleva licencia y fuente (docs/CONTENT_DATABASE.md §4).
2. Nunca incluyas texto de obras protegidas: solo metadatos y enlace.
3. La compilación debe fallar ante duplicados, licencia faltante o campos vacíos.
4. IDs estables por hash de la forma normalizada (docs/RANDOMIZATION_SYSTEM.md §3–4).
```

### 6.5 Otras (opcionales)
`music-engine` (reglas de §8.1 de `MUSIC_ENGINE.md`), `poetry-data` (formato de `structures.json` y `resources.json`), `export-format` (formato exacto de exportación).

> **[VERIFICAR]** que el formato del *frontmatter* (`name`, `description`) coincida con la versión de OpenCode que uses. Las skills externas (por ejemplo de diseño web) deben revisarse antes de instalarlas: muchas asumen CSS y no sirven tal cual en React Native.

## 7. Plantilla de pedido (prompt) para cada tarea

Copiá y completá. Usá modo **Plan** primero.

```
Tarea: [una sola cosa, p. ej. "Implementar la función normalize() de huellas"]
Documento a leer: docs/RANDOMIZATION_SYSTEM.md (solo §3 y §4)
Archivos a crear o modificar: src/services/random/fingerprint.ts y su prueba
No tocar: nada más.
Criterio de terminado:
 - [lista de 2 o 3 comportamientos concretos, con ejemplos de entrada/salida]
 - npm test y npm run lint pasan (mostrame la salida)
Antes de escribir código, mostrame el plan en 5 líneas.
```

**Revisión al terminar:** pedirle «Listá qué hiciste, qué pruebas agregaste y qué falta» y verificar vos que los archivos modificados sean solo los esperados (`git status`).

## 8. Pedidos de arranque por etapa

Los de E0 a E3 están completos; los demás siguen la plantilla del §7 usando los documentos de cada etapa.

### E0 — Entorno
```
Modo Plan. Objetivo: crear un proyecto Expo con TypeScript en esta carpeta, listo para
development build en Android. Leé docs/TECHNICAL_ARCHITECTURE.md §1–§3 y §10.
Verificá en la documentación oficial de Expo la versión estable actual y los comandos vigentes.
No instales nada todavía. Mostrame: comandos exactos, qué hace cada uno, y qué voy a ver al final.
```
Luego, en Build y paso a paso: crear el proyecto; activar TypeScript estricto; agregar `npm test` (Jest) y `npm run lint`; generar `DEPENDENCIES.md`; compilar el *development build*; crear las skills del §6.

### E1 — Esqueleto y navegación
```
Leé docs/USER_FLOWS.md §1–§3 y docs/TECHNICAL_ARCHITECTURE.md §4–§5.
Creá las rutas vacías de Expo Router (Inicio, Material, Acordes, Juegos, Escribir, Ajustes)
y la barra inferior de 5 destinos. Sin diseño final: solo estructura. Una ruta por vez.
```

### E2 — Diseño
```
Leé docs/DESIGN_SYSTEM.md §3 y §4. Creá src/design/tokens (color claro/oscuro, tipografía,
espaciado, movimiento) y el componente StimulusCard. Agregalo a /dev/gallery. Un componente por pedido.
```

### E3 — RandomService
```
Leé docs/RANDOMIZATION_SYSTEM.md completo. Primero implementá SOLO normalize() y fingerprint()
con pruebas (§4). Después draw() con ciclos (§5). Después el ledger persistente (§7–§8).
Cada parte en un pedido distinto, con sus pruebas.
```

### Etapas siguientes
Aplicar el §7 con: E4 (`LEXICAL_DATABASE_AND_APIS.md`, `CONTENT_DATABASE.md`), E5 (`LYRIC_EDITOR_AND_EXPORT.md`), E6 (`GAME_ARCHITECTURE.md`), E7–E9 (`MUSIC_ENGINE.md`), E10–E12 (`GAME_CATALOG.md`, **un Juego por pedido**), E13–E14 (`POETIC_*`), E15–E16 (`GAME_CATALOG.md`, `PRIVACY_AND_OFFLINE.md`).

## 9. Qué hacer cuando algo sale mal

| Situación | Acción |
|---|---|
| Error al compilar o ejecutar | Copiar el mensaje completo; sesión nueva en modo Plan: «Explicame este error y proponé la corrección mínima» |
| El modelo cambió muchos archivos | `git status`; si no es lo esperado, `git restore .` (descarta cambios no confirmados) y repetir con un pedido más acotado |
| El modelo ignora una regla | Citarla textualmente desde `AGENTS.md`; si persiste, reiniciar la sesión |
| La librería no funciona como el modelo dijo | Consultar la documentación oficial; anotar en `DEPENDENCIES.md`; usar el plan B del documento correspondiente |
| Dudas de diseño o producto | No dejar que el modelo decida: anotar la pregunta en `DECISIONS_AND_OPEN_QUESTIONS.md` y resolverla vos |
| Aparece un dato `[VERIFICAR]` | Verificarlo antes de implementar y registrar el resultado |

## 10. Qué NO se debe delegar sin revisión humana
- Licencias y atribuciones (léxico, imágenes, piano, fuentes, íconos).
- Contenido textual que llega a los usuarios (originalidad, derechos de autor).
- Decisiones de privacidad (qué se guarda y qué no).
- Cualquier cambio de la esencia de un Juego.
- Instalación de dependencias nuevas.

## 11. Glosario mínimo (para no perderse)
- **Repositorio / commit:** carpeta con historial / foto del estado del proyecto en un momento.
- **Development build:** versión de prueba de la app en tu teléfono que permite módulos nativos (audio, voz).
- **Plan / Build:** modo que solo propone / modo que escribe y ejecuta.
- **Prueba unitaria:** código que comprueba que una función da el resultado esperado.
- **Lint:** revisión automática de estilo y errores comunes.
- **Ledger:** registro local de lo que ya salió, para no repetir.

## 12. Criterios de aceptación de esta guía
1. Con solo `AGENTS.md`, `opencode.json` y `docs/`, un agente puede ejecutar E0 sin preguntas de contexto.
2. Cada pedido de §7–§8 cita el documento mínimo necesario.
3. Las skills del §6 existen antes de empezar E2.
4. Ninguna etapa se inicia sin que la anterior haya cumplido su DoD.
