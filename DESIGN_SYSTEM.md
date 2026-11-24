# DESIGN_SYSTEM — Sistema visual, diseño mobile y estética de cada Juego

Convenciones en `README.md`. Contrato de temas en `GAME_ARCHITECTURE.md` §8. Catálogo de Juegos en `GAME_CATALOG.md`.

## 1. Objetivo de diseño
Una app con **personalidad y calidad de producto comercial** (prioridad altísima en el encargo): nada de formularios genéricos ni tarjetas blancas con botones estándar. Cada Juego tiene **su propio lenguaje visual**, apoyado en un **sistema común** de navegación, tipografía base, legibilidad y componentes.

Estrategia [REC]: **sistema + temas, no 32 interfaces desde cero.**
- Capa 1 — *Núcleo* (común): tokens, tipografía de lectura/escritura, componentes base, navegación, editor.
- Capa 2 — *Tema de Juego* (datos): paleta, tipografía de acento, fondo, textura, animación de entrada, iconografía.
- Capa 3 — *Escena específica* (código): solo donde el Juego lo necesita (Mapa Mental, Dados, Cut-up, Collage textual, Cadena de letras, Canción Collage).

### 1.1 Dirección aprobada: «El cuaderno de medianoche»

Decisión cerrada en S0. Es la identidad del **núcleo** (Capa 1): los temas de Juego de §6 siguen vigentes, pero se leen dentro de esta paleta y esta voz tipográfica.

- **Papel, tinta y brasa.** El papel cálido y la tinta son la base (§3.1); la brasa (`accent.core`) es el único acento de acción. Cálida, oscura y de cuaderno, no de oficina.
- **Tres tipografías con roles fijos:** Fraunces solo en momentos de identidad, Literata para la escritura, Inter para la interfaz (§3.2).
- **Wordmark:** «Cancioneta», resuelto en Fraunces como momento de identidad.
- **Navegación:** «Material» permanece oculta de la tab bar; no es un destino visible (§4, §5).
- **Proceso:** se trabaja directamente en código y se verifica en `/dev/gallery`; **sin Figma** (§7).

## 2. Principios
1. **Escribir primero:** la zona de escritura es siempre legible, calma y sin ruido, aun en Juegos con estética fuerte.
2. **Identidad en el estímulo, calma en el editor:** el color y la textura del Juego viven en la zona de estímulo y en el marco; el texto del usuario usa la tipografía de escritura común.
3. **Gestos naturales con alternativa:** todo deslizar tiene botón equivalente.
4. **Movimiento con propósito:** animaciones que expliquen (revelar, voltear, tirar) y respeten «reducir movimiento».
5. **iPhone primero:** guías de interacción de iOS (áreas seguras, hojas deslizables, háptica); en Android se mantiene la misma identidad con comportamientos nativos del sistema (botón atrás, foco de audio).

## 3. Tokens base

### 3.1 Color (núcleo)
Modo **claro y oscuro** desde el inicio. Valores propuestos [REC], ajustables; todos deben cumplir contraste **AA**.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg.base` | #F7F3EC | #12110F | Fondo general (papel cálido / tinta) |
| `bg.raised` | #FFFFFF | #1C1A17 | Superficies elevadas |
| `text.primary` | #1B1A17 | #F2EEE6 | Texto principal |
| `text.secondary` | #5E5A52 | #B3AEA3 | Apoyo |
| `accent.core` | #C2410C | #FB923C | Acción principal de la app |
| `line.subtle` | #E2DACB | #2C2924 | Divisores |
| `state.error` | #B42318 | #F97066 | Errores |
| `state.success` | #2E7D32 | #66BB6A | Confirmaciones |

Estos valores concretan «papel, tinta y brasa» (§1.1): papel = `bg.base`/`bg.raised`, tinta = `text.primary`/`text.secondary`, brasa = `accent.core`.

Cada tema de Juego redefine un **juego de 4 colores**: `game.bg`, `game.surface`, `game.ink`, `game.accent` (con variante oscura). El editor usa siempre `bg.base`/`bg.raised` del núcleo para no perder legibilidad.

### 3.2 Tipografía
Familias gratuitas con licencia verificada en los paquetes instalados: SIL Open Font License 1.1 (Fraunces, Literata e Inter). El detalle y las atribuciones figuran en «Créditos y licencias». Roles cerrados por la dirección aprobada (§1.1).

| Rol | Fuente (decidida) | Uso |
|---|---|---|
| Escritura (editor) | **Literata** | Texto del usuario; tamaño base 18 pt |
| Interfaz | **Inter** | Botones, etiquetas, navegación |
| Momentos de identidad | **Fraunces** | Wordmark «Cancioneta» e intros de Juego; no se usa en el editor ni en la UI cotidiana |
| Acento por Juego | Del conjunto cerrado de §6 | Solo en la zona de estímulo |

Reglas:
- Máximo **3 familias por pantalla**.
- **Base fija de 3 fuentes** (Literata, Inter, Fraunces); los acentos de Juego (§6) completan el total cerrado (≈ 8–10) para controlar el peso de la app. Las tres bases están bajo SIL OFL 1.1; los íconos Feather, bajo MIT.
- Escalas: soportar **Dynamic Type** / tamaño de fuente del sistema (hasta 200 % sin romper).
- Español completo: tildes, `ñ`, `¿ ¡`, comillas « » y rayas verificados en cada fuente.

Escala de tamaños (pt): 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48. Interlineado 1,3–1,5 para lectura.

### 3.3 Espaciado, forma y elevación
- Base de 4 pt: 4, 8, 12, 16, 24, 32, 48.
- Márgenes laterales 20 pt. Respetar áreas seguras (notch, barra inferior).
- Radios: 8 (campos), 16 (tarjetas), 28 (hojas), 999 (fichas).
- Sombras suaves y pocas; preferir contraste de superficie.

### 3.4 Movimiento
| Token | Valor | Uso |
|---|---|---|
| `motion.fast` | 120 ms | Pulsaciones |
| `motion.base` | 240 ms | Transiciones de elementos |
| `motion.slow` | 480 ms | Entradas de Juego y revelados |
| Curva estándar | Ease-out suave; resortes para dados y tarjetas | |
- Todo movimiento no esencial se desactiva con **Reducir movimiento**.
- Háptica ligera en: tirar dados, bloquear, revelar palabra, completar un objetivo.

#### 3.4.1 Auditoría de movimiento residual (S15)

Inventario de `app/` y `src/`: dos `Modal` con fundido, un `Animated.loop`, componentes con Reanimated y las entradas de tema. Estado final:

| Punto | Movimiento | Con Reducir movimiento | Decisión |
|---|---|---|---|
| `Sheet.tsx` | Deslizamiento/fundido de la hoja + fundido del `Modal` | Estado final sin animar; `modalAnimation()` devuelve `'none'` | Cerrado |
| `ImagesGame.tsx` | Fundido del `Modal` del visor de imágenes | `modalAnimation()` devuelve `'none'`; el visor no anima su contenido | Cerrado |
| `VoiceWave.tsx` | Onda que respira (`Animated.loop`) | Se detiene y muestra altura fija | **Conservado**: es feedback del estado de grabación activa, no decoración (§2.4 y §6, F0-1). Cumple el criterio 5 de §12 al desactivarse con la preferencia. |
| `DiceButton.tsx` | Giro y rebote al tirar | Se omiten; además usa `ReduceMotion.System` | Ya conforme |
| Entradas de tema, `Button`, `useEntranceStyle` | Desplazamiento/rotación/fundido | Solo fundido (`motion.fast`) | Ya conforme |

No quedan animaciones espaciales sin guardia. El `Animated.loop` se justifica y conserva; ningún otro movimiento se eliminó.

## 4. Componentes base (compartidos)

| Componente | Descripción | Estados |
|---|---|---|
| `AppTabBar` | Barra inferior: Inicio, Acordes, Juegos, Escribir. «Material» permanece oculta (§1.1) | activo, inactivo, insignia |
| `GameIntro` | Plantilla de intro: título, objetivo, pasos, ejemplos, «Comenzar» | scroll largo, ejemplos desplegables |
| `StimulusCard` | Tarjeta del estímulo con tipografía de acento | normal, cargando, agotado |
| `SwipeableCard` | Deslizar izquierda/derecha + botones | arrastrando, cambiando |
| `WordChip` | Ficha de palabra | normal, seleccionada, bloqueada, revelándose |
| `LockToggle` | Candado | on/off |
| `DiceButton` | Dado con rebote | reposo, rodando |
| `EditorDock` | Franja inferior que abre el editor | colapsado, con borrador |
| `ChordBlock` | Bloque de acorde | normal, activo (sonando), bloqueado, editando |
| `PianoSheet` | Hoja del reproductor | cerrado, abierto |
| `TimerBadge` | Temporizador | corriendo, pausado, terminado |
| `SourceTooltip` | Procedencia al tocar | visible, oculto |
| `FullscreenImageViewer` | Imagen a pantalla completa con **X** en una esquina | |
| `EmptyState` / `ErrorState` | Ilustración + texto + acción | |
| `PermissionPrimer` | Explica el permiso antes de pedirlo | |

Cada componente: variantes por tema, estados vacío/cargando/error, etiqueta de accesibilidad y objetivo táctil ≥ 44 pt.

## 5. Navegación y estructura
- Barra inferior de 4 destinos: Inicio, Acordes, Juegos, Escribir; «Material» permanece oculta (§1.1). El detalle de flujos está en `USER_FLOWS.md` §1.
- Botón flotante de nota musical para el reproductor, visible en todas las pantallas excepto en la propia Fase 1.
- Hojas modales para selector de acordes, estructuras y ayuda.
- Gestos: deslizar para cambiar estímulo; deslizar hacia abajo para cerrar hojas; pellizcar y arrastrar en lienzos.

## 6. Identidad visual por Juego (ideas de dirección)

Cada fila es la **dirección artística** que luego se concreta en `GameTheme`. Las ideas respetan los ejemplos del encargo. Se deben usar ilustraciones, íconos e imágenes con licencia libre o propias (nada de IA generativa en el producto final).

| Juego | Dirección | Paleta | Tipografía de acento | Movimiento |
|---|---|---|---|---|
| F0-1 Voz desatada | Íntima y oscura, onda de voz | Ocre y negro | Sans redonda | Onda que respira |
| F0-2 Páginas matutinas | Papel y luz de mañana | Crema y celeste | Serif de lectura | Progreso como hojas |
| F0-3 Prompt | Galería editorial | Neutros + color de la imagen | Serif display | Deslizar de tarjetas |
| F0-4 El Espía | Cine negro, mirilla | Negro, rojo | Mono/condensada | Cuenta regresiva en mirilla |
| F0-5 ¿Por qué? | Minimalismo, preguntas apiladas | Blanco/gris | Serif | Aparecen «¿Por qué?» |
| G-01 Asociación Libre | Fichas flotantes con aire | Pasteles | Sans grande | Regenerar con barrido |
| G-02 Desde el Título | Portada tipográfica | Color de portada rotativo | Display | Páginas que giran |
| G-03 Unión de Palabras | Cartas que se voltean | Verdes y dorados | Serif | Volteo |
| G-04 Contar-Mostrar | Dos mundos: abstracto vs concreto | Niebla ↔ foto | Sans ligera ↔ mecanografía | Contraste de dos paneles |
| G-05 En la Piel | Ficha/expediente con silueta | Sepia | Mecanografía | Sello |
| G-06 Palabra Portal | Exploración, ramificación | Azules profundos | Sans geométrica | Columnas que se abren |
| G-07 Palabras Invisibles | Tinta invisible que se revela | Violeta | Caligráfica sobria | Revelado |
| G-08 Canción Influencia | Tocadiscos | Rojo y crema | Retro sans | Giro de vinilo |
| G-09 Canción Influencia 2 | Vinilo en transformación | Evoluciona por pasos | Retro sans | Morph |
| G-10 Canción Influencia 3 | Espejo/reverso | Invertido | Sans | Giro 180° |
| G-11 Palabras Clavadas | Tablero con alfileres | Corcho y rojo | Slab | Clavar |
| G-12 Conexión | Puentes/hilos | Turquesa y arena | Serif | Trazo del hilo |
| G-13 Cociendo Frases | Cocina, ingredientes | Cobre y crema | Display cálida | Mezcla |
| G-14 Otra Perspectiva | Lente/ojo | Gris y color único | Sans | Enfoque |
| G-15 Pienso en Vos | Retratos/espejos | Rosa y carbón | Serif | Superposición |
| G-16 El Guion | Claqueta, guion | Negro y blanco | Mono de guion | Claqueta |
| G-17 Frankenstein | Laboratorio, costuras | Verde enfermizo y gris | Slab | Costuras |
| G-18 Verso Insistente | Eco/repetición | Alto contraste | Display grande | Pulso |
| G-19 Canción Collage | Cinematográfico, inmersivo | Oscuro | Mínima | Parallax |
| G-20 Sentidos Guía | Siete puertas | Siete colores | Sans | Apertura |
| G-21 La Séptima | Regla con el casillero 7 | Blanco/azul | Mono | Marca |
| G-22 Restricciones | Pizarrón de consignas | Verde pizarra | Manuscrita legible | Tiza |
| G-23 Mapa Mental | Lienzo orgánico amplio | Tierra y verdes | Sans humanista | Crecimiento |
| G-24 Dados Líricos | Lúdico y tangible | Colores saturados | Redondeada | Rebote y física |
| G-25 Carta que nunca envié | Editorial/correspondencia | Papel y sello | Serif + manuscrita | Sobre |
| G-26 Secreto y confesión | Velo vs revelación | Tonos oscuros ↔ claros | Sans | Deslizar del velo |
| G-27 Traslado de universo | Portal entre mundos | Dependiente del universo | Sans | Teletransporte |
| G-28 Collage textual | Cartelería tipográfica | Según atmósfera | Mezcla (≥ 4) | Entrada en capas |
| G-29 Cut-up | Recortes y tipografía experimental | Papel y tinta | Mezcla | Recorte |
| G-30 Trenza de palabras | Hilos trenzados | Multicolor | Sans | Trenzado |
| G-31 Cadena de letras | Juego de palabras | Madera/azulejo | Sans gruesa | Trazo conectando |
| G-32 Acróstico de azar | Columna arquitectónica | Piedra | Serif capitales | Letras que caen |

**Regla de realización:** la identidad se ve en **fondo, marco, tarjeta de estímulo, íconos y animación de entrada**; el campo de escritura del usuario mantiene la tipografía común.

## 7. Herramientas y librerías recomendadas

| Necesidad | Recomendación [REC] | Notas |
|---|---|---|
| Animaciones y gestos | Reanimated + Gesture Handler | Base de swipe, arrastre, resortes |
| Lienzos (Mapa Mental, Cut-up, Collage textual) | React Native Skia | Validar rendimiento con 121 nodos |
| Fuentes | Paquetes de Google Fonts para Expo | Licencias SIL OFL 1.1 verificadas en `LICENSE_FONT` |
| Iconos | Feather vía `@expo/vector-icons` | Licencia MIT verificada en el paquete instalado |
| Háptica | Módulo de háptica de Expo | |
| Degradados y desenfoque | Módulos de Expo | Usar con moderación |
| Ilustraciones | Propias o con licencia libre | Sin IA generativa en el producto |
| Galería de componentes | Pantalla interna `/dev/gallery` que muestra cada componente en cada tema/estado | Fuente de verdad de la verificación visual; se trabaja directamente en código |
| Prototipado visual | Sin Figma: se implementa en código y se revisa en `/dev/gallery` (decisión S0, §1.1) | La implementación sigue los tokens |

### Skills y guías para OpenCode
OpenCode puede cargar **skills** (carpetas con `SKILL.md`) desde `.opencode/skills/<nombre>/`, y también reconoce `.claude/skills/` y `.agents/skills/`, además de leer `AGENTS.md`. Propuesta de skills propias (a crear en la Etapa 0 del roadmap):

| Skill | Qué guía |
|---|---|
| `design-tokens` | Usar solo tokens; prohibir colores y tamaños sueltos |
| `new-game-module` | Pasos para crear/registrar un Juego con intro, tema y pruebas |
| `accessibility-checklist` | Etiquetas, contraste, tamaños táctiles, reducir movimiento |
| `visual-qa` | Cómo revisar la `/dev/gallery` y capturas por tema |

Las skills de diseño para **web** (p. ej., «frontend-design») pueden inspirar criterios estéticos (tipografía con carácter, evitar plantillas genéricas), pero se deben adaptar a React Native: no usar CSS ni librerías web. **[VERIFICAR]** que cada skill externa que se instale sea compatible con el formato de OpenCode y de una fuente confiable antes de usarla.

## 8. Accesibilidad
- Contraste **AA** (4,5:1 texto normal; 3:1 texto grande y componentes).
- Objetivos táctiles ≥ **44 × 44 pt**.
- **Dynamic Type** hasta 200 %: las pantallas hacen scroll en vez de truncar.
- VoiceOver/TalkBack: cada elemento interactivo con etiqueta y rol; el orden de foco sigue la lectura.
- No transmitir información solo con color (candados, acorde activo, palabra clavada).
- **Reducir movimiento:** reemplaza animaciones por fundidos.
- Temporizadores: anuncios en hitos, no por segundo; opción para ocultar el cronómetro.
- Imágenes de Juegos: descripción alternativa («Fotografía de…»), útil para G-19 y F0-3.
- Gestos con alternativa en botones.

## 9. Teclado y pantallas pequeñas
- El editor mantiene el cursor visible y puede minimizar el estímulo.
- Probar en pantallas compactas (iPhone SE) y grandes; sin elementos cortados.
- Orientación: vertical en v1; horizontal en tablets/lienzos como mejora futura [REC].
- Android: botones de sistema atrás/gestos; insets de borde a borde.

## 10. Estados vacíos y errores
Cada estado tiene ilustración simple, mensaje en voseo y **una** acción clara. Ejemplos: «Todavía no escribiste nada. Elegí un Juego o escribí directamente.»; «Necesitamos el micrófono para grabar tu voz. Se queda en tu teléfono.»; «Sin conexión: el Juego sigue funcionando; el enlace necesita internet.»

## 11. Tono de voz (textos de interfaz)
Cercano, claro y respetuoso; voseo rioplatense («tocá», «elegí»); sin tecnicismos innecesarios; instrucciones de Juegos con ejemplos concretos; nada de lenguaje condescendiente.

## 12. Criterios de aceptación
1. Los 32 Juegos + 5 ejercicios tienen `GameTheme` completo y distinguible en una captura de la intro.
2. Ninguna pantalla usa colores o tamaños fuera de los tokens.
3. Todas las pantallas pasan el control de contraste AA en claro y oscuro.
4. `/dev/gallery` muestra los componentes en todos sus estados y temas.
5. Con Reducir movimiento activado, ninguna animación espacial se reproduce.
6. Con texto al 200 % no hay contenido cortado ni solapado.
7. Las fuentes empaquetadas cubren todos los caracteres del español.
8. La atribución de fuentes, íconos, imágenes y piano figura en «Créditos y licencias».
Más pruebas en `QA_AND_ACCEPTANCE_TESTS.md` (tanda 5).

## 13. Preguntas abiertas — cerradas en S0

Decisión de referencia: «El cuaderno de medianoche» (§1.1).

1. **Paleta / referencia estética — CERRADA.** «El cuaderno de medianoche»: papel, tinta y brasa (§3.1). Cálida, oscura y de cuaderno.
2. **Figma vs. código — CERRADA.** Se trabaja directamente en código y se verifica en `/dev/gallery`; sin Figma (§7).
3. **Fuentes e íconos — elección CERRADA; licencias verificadas.** Fuentes: Fraunces (identidad), Literata (escritura), Inter (interfaz), las tres bajo SIL OFL 1.1. Íconos: Feather vía `@expo/vector-icons`, bajo MIT. Créditos y atribuciones en «Créditos y licencias» (§3.2, §7).
