# QA_AND_ACCEPTANCE_TESTS — Pruebas funcionales y criterios de validación

Convenciones en `README.md`. Cada módulo ya define sus criterios en su documento; acá se consolidan, se ordenan y se agregan las pruebas transversales.

## 0. Estado del cierre (S17/S18) — 24 de noviembre de 2026

Estado: **verificaciones automáticas al día; QA en dispositivo pendiente**. Nada de lo que sigue reemplaza una prueba manual en teléfono.

| Ítem | Estado real | Evidencia |
|---|---|---|
| Temas | 36 implementados: 5 de Fase 0 y 31 Juegos (g01–g30 y g32) | `src/design/themes.ts`, `src/games/registry.ts:60-67` |
| G-31 | Pendiente: sin tema, ruta ni lógica. Aparece como entrada `pending` en `/dev/gallery`, con 37 tarjetas en total | `src/design/galleryAudit.ts:50-56`, `tests/devGallery.test.ts:6-14` |
| Contraste AA claro/oscuro | Auditoría de tokens: 36 temas × 2 modos × 3 roles de texto × 3 fondos = 648 comparaciones, 0 fuera de AA (piso 4,5:1) | `src/design/galleryAudit.ts:63-83`, `tests/devGallery.test.ts:30-35`, `tests/semanticRolesContrast.test.ts` |
| Texto al 200 % | `AppText` habilita escalado hasta 2×; el layout de acordes pasa a una columna a 2× y tiene prueba. La revisión global de cortes y solapes sigue siendo manual | `src/design/components/Text.tsx:44-49`, `src/music/components/chordCardLayout.ts`, `tests/chordCardLayout.test.ts` |
| Reduce Motion | Preferencia en Ajustes persistida en el store; elimina traslaciones, giros y deslizamientos en entradas, hojas, botones y dados. Hay pruebas de las funciones puras; falta probar el toggle y su persistencia | `app/ajustes.tsx`, `src/design/entrance.ts`, `tests/designEntrance.test.ts` |
| Offline web | `/sw.js` precachea el shell, el manifiesto, los iconos y las 11 fuentes `.ttf` desde la primera visita; navegación network-first con fallback y assets cache-first | `public/sw.js`, `app/+html.tsx`, `WEB_PWA_AUDIT_REPORT.md` |
| Verificación automática | `npm test`: 46 suites y 196 pruebas; `npm run lint` y `npm run typecheck`: sin errores; export web estático correcto | Resultado real de esta sesión |

G-31 no se cuenta como implementado: `/juego/g31` no existe (`WEB_PWA_AUDIT_REPORT.md:14`). La plantilla del §6 se aplica a las 36 entradas con tema registrado (31 Juegos y 5 de Fase 0); para G-31 queda en suspenso hasta que haya una decisión y una implementación.

En Safari iOS la transcripción usa Web Speech API con soporte parcial: no se puede afirmar que sea on-device ni que el audio no salga del dispositivo en web. La alternativa manual sigue siendo la opción segura (`WEB_PWA_AUDIT_REPORT.md:29`).

Pendiente explícito: QA físico en iPhone (ver `QA_IPHONE.md`), instalación PWA y arranque offline reales, deploy en Vercel y la aclaración de `IMPLEMENTATION_STATUS.md`, que todavía describe G-31 como implementado.

## 1. Estrategia

| Nivel | Qué prueba | Herramienta [REC] | Cuándo corre |
|---|---|---|---|
| **Unitarias** | Lógica pura: aleatoriedad, acordes, tonalidad, silabeo, exportación, controladores de Juegos | Jest (`jest-expo`) | En cada cambio |
| **Datos** | Validez de paquetes: licencias, duplicados, campos | Scripts de validación del pipeline | En cada compilación de datos |
| **Componentes** | Pantallas y componentes con sus estados | Pruebas de renderizado + galería `/dev/gallery` | En cada cambio visual |
| **Flujos (E2E)** | Recorridos completos en dispositivo | Maestro u otra herramienta de flujos **[VERIFICAR]** | Antes de cerrar cada etapa |
| **Manuales guiados** | Sensaciones: fluidez, audio, gestos, legibilidad | Guías de este documento | Cada etapa |
| **Accesibilidad** | Lectores de pantalla, contraste, tamaños | Revisión manual + herramientas del sistema | Etapa E17 y por Juego |
| **Rendimiento** | 60 fps, arranque, memoria, latencia de audio | Perfilado del dispositivo | E8, E16, E17 |

Regla: **lógica pura = prueba automática obligatoria.** Interfaz y sensaciones = lista manual.

## 2. Dispositivos de prueba
- **Android:** al menos un teléfono físico de gama media y uno de gama baja, o el emulador para flujos no sensibles al rendimiento o al audio. El audio y los gestos se prueban **siempre en teléfono físico**.
- **iOS:** diferido (D-01). Cuando exista, repetir las pruebas manuales en un iPhone de gama media y en uno compacto. Estado al cierre en `QA_IPHONE.md`: **pendiente, no aprobado**.
- Tamaños de pantalla: compacta, estándar y grande; texto del sistema al 100 % y al 200 %; modo claro y oscuro; modo avión.

## 3. Trazabilidad con las reglas fundamentales del encargo

| Regla | Prueba de aceptación | Documento |
|---|---|---|
| 1. Todos los Juegos permiten escribir la letra en la app | En cada Juego, abrir el editor desde el dock y escribir | `GAME_ARCHITECTURE.md` |
| 2. Todos usan el mismo editor | Verificar que existe un solo componente de editor y que los 32 Juegos usan `EditorBridge` | ídem |
| 3. Exportar a WhatsApp voluntariamente | Exportar una canción de 3 secciones; se abre el menú de compartir y no se envía nada solo | `LYRIC_EDITOR_AND_EXPORT.md` |
| 4. No se guardan las letras de forma permanente | Escribir, cerrar la app, reabrir: no queda nada; inspeccionar el almacenamiento de la app | `PRIVACY_AND_OFFLINE.md` |
| 5. Sin registro ni cuentas | La app nunca pide iniciar sesión | `PRODUCT_SPEC.md` |
| 6. Sin repeticiones dentro de la partida ni entre sesiones | Pruebas de `RandomService` y repetición entre aperturas | `RANDOMIZATION_SYSTEM.md` |
| 7. Pueden repetirse entre usuarios | No hay prueba (comportamiento esperado) | — |
| 8. Sin IA generativa en v1 | Revisión de dependencias y de llamadas de red: ninguna a servicios de IA | `TECHNICAL_ARCHITECTURE.md` |
| 9. Arquitectura lista para IA | `GeneratorProvider` existe y los Juegos lo usan | ídem |
| 10. Sin pagos recurrentes innecesarios | Revisión de servicios y dependencias | ídem |
| 11. Español argentino | Revisión de textos (voseo) y fuentes con `ñ`, tildes, `¿ ¡` | `DESIGN_SYSTEM.md` |
| 12. Gratuito; arquitectura para suscripción | `EntitlementService` devuelve acceso completo | `PRODUCT_SPEC.md` |

## 4. Pruebas por módulo (resumen consolidado)

### 4.1 `RandomService` — `RANDOMIZATION_SYSTEM.md` §11
| # | Prueba | Resultado esperado |
|---|---|---|
| R1 | Pool de 10, 25 extracciones de 1 | Sin repeticiones dentro de cada bloque de 10; primero del ciclo 2 ≠ último del ciclo 1 |
| R2 | Cerrar y reabrir la app a mitad de ciclo | El estado del ciclo se conserva |
| R3 | Asociación Libre | Las 30 palabras son distintas entre las tres columnas |
| R4 | Mismo título en dos pools | La compilación falla; en ejecución no se entrega dos veces |
| R5 | Ledger | No contiene texto del usuario (inspección directa) |
| R6 | Dado de Juego | Recorre los 32 Juegos antes de repetir |
| R7 | Pool con menos elementos que lo pedido | Entrega los que hay sin repetir y no falla |
| R8 | Ledger corrupto | Se reinicia vacío y la app sigue funcionando |
| R9 | `Math.random` | La búsqueda estática no lo encuentra fuera de `RandomService` |

### 4.2 Motor musical — `MUSIC_ENGINE.md` §13
| # | Prueba | Resultado esperado |
|---|---|---|
| M1 | Ortografía: F♯m7, B♭maj7, E♭aug | Notas correctas (F♯ A C♯ E; B♭ D F A; E♭ G B) |
| M2 | Dado, 10 tiradas con 5 acordes | Siempre 5; BPM y Loop idénticos; candados intactos |
| M3 | Dado con tonalidad fijada, modo simple | Todos los acordes diatónicos |
| M4 | 120 BPM, 4 acordes, sin Loop | 8,0 s y se detiene |
| M5 | Loop activo | Sin silencio audible entre el último y el primer compás |
| M6 | BPM límite | 40 y 600 aceptados; 39 y 601 rechazados; slider arranca en 120 |
| M7 | Detección | Casos de §7.4 del documento (p. ej. Am–F–C–G → C mayor y A menor, ambiguas) |
| M8 | Panel del reproductor | Abrir/cerrar no mueve el cursor ni cambia el Juego |
| M9 | Sustituciones | Cada sugerencia corresponde a una regla del catálogo |
| M10 | Modo avión | Todo funciona |
| M11 | Dado encolado | Con reproducción en marcha, el acorde actual termina completo y la progresión nueva entra en el próximo compás; el metrónomo no pierde el pulso |
| M12 | Silenciar | El avance visual sigue; no suena |
| M13 | Cambio de compás durante la reproducción | El acorde actual termina completo; el nuevo patrón de acentos entra en el próximo compás sin perder el pulso |

### 4.3 Editor y exportación — `LYRIC_EDITOR_AND_EXPORT.md` §9
| # | Prueba | Resultado esperado |
|---|---|---|
| E1 | ESTRIBILLO (Serventesio) + ESTROFA 1 (Redondilla) + PUENTE (Pareado) | Texto exacto del formato §6.1 |
| E2 | Nombres de sección en minúscula | Salen en MAYÚSCULAS |
| E3 | Exportar | Se abre el menú de compartir con un único texto; nada se envía solo |
| E4 | Reordenar secciones | Cambia el orden exportado |
| E5 | Un Juego intenta insertar texto | Solo ocurre tras un gesto explícito; nunca sobrescribe |
| E6 | Cerrar la app | La letra desaparece |
| E7 | La Séptima | Muestra sugerencias; el texto cambia solo si el usuario las aplica una por una |
| E8 | Estrofa vacía / sección vacía | No se exportan |
| E9 | Texto de más de 60.000 caracteres | Ofrece dividir en partes |
| E10 | Falla del menú de compartir | Aparece «Copiar texto» |

### 4.4 Privacidad y offline — `PRIVACY_AND_OFFLINE.md` §8
| # | Prueba | Resultado esperado |
|---|---|---|
| P1 | Modo avión: grabar y transcribir (si el motor on-device existe) | Funciona |
| P2 | Motor on-device no disponible | Ninguna solicitud de red con audio; aparece la alternativa manual |
| P3 | «Terminar sesión» | No quedan audios ni textos en el almacenamiento de la app |
| P4 | Cerrar y reabrir la app | Ningún texto ni audio de la sesión anterior |
| P5 | Barrido al iniciar | Grabaciones temporales huérfanas eliminadas |
| P6 | Permisos | Micrófono solo al tocar «Grabar»; sin otros permisos |
| P7 | Tráfico de red | Auditoría con una herramienta de captura: no sale contenido creativo |
| P8 | Copias de seguridad del sistema | Los datos creativos no están incluidos **[VERIFICAR mecanismo]** |

### 4.5 Datos — `LEXICAL_DATABASE_AND_APIS.md`, `CONTENT_DATABASE.md`
| # | Prueba | Resultado esperado |
|---|---|---|
| D1 | Compilación con campo de licencia faltante | Falla |
| D2 | Duplicados por huella | Ninguno en el paquete |
| D3 | Registros `metadata_only` | Ninguno contiene texto de la obra |
| D4 | Cada imagen | Tiene autor y licencia |
| D5 | Informe de calidad | Lista cantidades por pool y por licencia; declara faltantes |
| D6 | Lemas | Ninguno sin categoría gramatical verificable; sin nombres propios ni siglas |
| D7 | Ids estables | Un paquete actualizado conserva los ids de lemas existentes |
| D8 | Créditos | La pantalla refleja exactamente las fuentes de `source_meta` |
| D9 | Muestreo manual | 200 registros revisados antes de publicar un paquete |

### 4.6 Poesía — `POETIC_STRUCTURES.md` §8, `POETIC_RESOURCES.md` §7
| # | Prueba | Resultado esperado |
|---|---|---|
| S1 | Silabeo de los ejemplos marcados ✔ | Mismas cuentas que en el documento |
| S2 | ≥ 300 versos de prueba | ≥ 95 % de coincidencia con la cuenta manual **[umbral propuesto]**; el resto se marca «dudoso» |
| S3 | Ley del acento final | Agudo +1, llano igual, esdrújulo −1 |
| S4 | Sinalefa con *y* y con *h* | Cuenta como una sola sílaba |
| S5 | Quintilla | Acepta aabab, aabba, abaab, ababa, abbab; rechaza tres rimas seguidas, final en pareado y versos sueltos |
| S6 | Detector de rima | Distingue consonante y asonante (p. ej., *ruido/olvido* consonantes) |
| S7 | 22 estructuras | Todas como datos; tipo estrofa/composición diferenciado; variantes etiquetadas |
| S8 | Recursos | Exactamente 29 originales con cinco campos completos |
| S9 | Búsqueda por efecto | «contradicción» devuelve Antítesis, Oxímoron y Paradoja |
| S10 | Favoritos | No persisten al cerrar la app |

## 5. Pruebas transversales

### 5.1 Accesibilidad
1. Lector de pantalla: cada elemento interactivo tiene etiqueta y rol; orden de foco coherente.
2. Contraste AA en claro y oscuro.
3. Texto al 200 %: sin contenido cortado ni solapado; las pantallas scrollean.
4. «Reducir movimiento»: sin animaciones espaciales.
5. Objetivos táctiles ≥ 44 pt.
6. Alternativa en botones para cada gesto de deslizar.
7. No se transmite información solo con color.

Estado del cierre: los controles 2 a 4 tienen auditoría automática de tokens y layout (§0); los controles 1 y 5 a 7 requieren revisión manual y siguen pendientes en iPhone.

### 5.2 Rendimiento
| Métrica | Objetivo [REC] |
|---|---|
| Arranque en frío | ≤ 3 s en gama media |
| Fluidez | 60 fps en navegación, tarjetas y Mapa Mental (121 nodos) |
| Latencia del piano | Perceptiblemente inmediata; medición del tiempo entre toque y sonido |
| Memoria | Sin fugas visibles tras 30 min de uso con cambios entre Juegos |
| Tamaño instalado | Documentar y vigilar; paquetes grandes bajo demanda |
| Batería | Sin consumo anómalo con la pantalla de acordes en Loop durante 10 min |

### 5.3 Robustez y estados
- Llamada entrante o notificación durante reproducción: el audio se pausa y se retoma correctamente.
- App en segundo plano 10 minutos y de vuelta: el estado se conserva mientras el sistema no la cierre.
- Rotación o cambio de tamaño de fuente en medio de un Juego: sin pérdida de estado.
- Falta de espacio o paquete de datos dañado: mensaje con «Reintentar».
- Sin conexión: todos los Juegos funcionan; solo los enlaces externos y las imágenes de API avisan.

### 5.4 Seguridad y cumplimiento
- Sin claves de API en el código ni en el paquete compilado (búsqueda de cadenas).
- Dependencias con licencia verificada; sin SDK de analíticas ni publicidad.
- Resultado de la consulta legal aplicado: sin citas de obras protegidas en los paquetes salvo las autorizadas.
- Atribuciones completas: piano, fuentes, íconos, imágenes y léxico.

## 6. Plantilla de aceptación por Juego (aplicar a los 36 implementados: 31 Juegos + 5 de Fase 0)

G-31 queda fuera de esta plantilla hasta que deje de estar pendiente en `/dev/gallery` (§0).

| # | Control | Aprobado |
|---|---|---|
| J1 | Pantalla de intro con título, objetivo, paso a paso, ejemplos y «Comenzar» | ☐ |
| J2 | La identidad visual es distinguible de otros Juegos (captura de la intro) | ☐ |
| J3 | Cumple **literalmente** las reglas de su ficha en `GAME_CATALOG.md` | ☐ |
| J4 | Usa `RandomService` y respeta no repetición (nivel 1 y 2) | ☐ |
| J5 | Lleva texto al editor solo por acción explícita | ☐ |
| J6 | Restaura su estado al volver desde el editor o la lista | ☐ |
| J7 | Funciona sin conexión (salvo enlaces o imágenes de API) | ☐ |
| J8 | Pasa la lista de accesibilidad (§5.1) | ☐ |
| J9 | Tiene pruebas unitarias de su controlador | ☐ |
| J10 | Está registrado en el `GameRegistry` con tema, pasos y ejemplos | ☐ |

### Controles específicos que no deben olvidarse

| Juego | Controles críticos |
|---|---|
| G-01 | 3 columnas × 10; sin repetición entre columnas; regenerar una o todas sin tocar las demás |
| G-02 | Autor visible debajo; sin filtros de categoría |
| G-03 | Máximo 10; palabras reveladas de a una |
| G-04 | Los 5 patrones siempre visibles; cada letra = un verso; explicación visual C/M |
| G-05 | Nombre, obra, descripción y enlace; prioridad a personajes ficticios |
| G-06 | Palabra núcleo siempre visible; «Sugerencia» solo a pedido y sin repetir; columna visible solo al completar 10; la última palabra pasa a ser el núcleo; 4 columnas |
| G-07 | Las 4 palabras permanecen visibles |
| G-08/09/10 | Sin letras protegidas dentro de la app; enlace por búsqueda |
| G-11 | Máximo 24; posición asignada al azar; tabla palabra–posición |
| G-12 | Sin cualidades ni símiles automáticos; tres ejemplos completos en la intro |
| G-13 | Dos tarjetas verticales; cambio independiente por deslizamiento; fuente discreta |
| G-14 | Solo se muestra el sustantivo; categoría opcional |
| G-15 | Tres modalidades; sin límite artificial de personas/cosas |
| G-16 | Máximo 4; reemplazo individual; fuente solo en tooltip; solo contenido permitido (D-04) |
| G-17 | Reemplazo individual de cada obra; sin textos protegidos |
| G-18 | Verso destacado todo el ejercicio |
| G-19 | Reemplazo individual; pantalla completa con X; sin IA |
| G-20 | Siete sentidos siempre visibles |
| G-21 | Detecta versos; sugerencia de séptima palabra, no destructiva; indica «verso corto» |
| G-22 | Sin máximo de restricciones; personalizadas permitidas |
| G-23 | 3 hijos exactos; máximo 5 niveles (121 nodos); zoom/desplazamiento; exportar archivo, imagen y PDF; importar; sin IA |
| G-24 | 6 dados; bloqueo individual; temporizador opcional |
| G-25 | Destinatarios y disparador; rescate de fragmentos |
| G-26 | Dos versiones («lo que oculto» / «lo que confieso») visibles a la vez |
| G-27 | Dos estímulos independientes (tema y universo) |
| G-28 | Composición con distintos tamaños, posiciones y tipografías |
| G-29 | Dividir, reorganizar, bloquear y mover; nunca letras protegidas |
| G-30 | Tres frases; volver a trenzar; cambiar una sin tocar las otras |
| G-31 | Adyacencia en 8 direcciones; validación con diccionario local; una casilla por palabra |
| G-32 | Un renglón por letra, en orden; palabra propia o aleatoria |
| F0-1 | Grabadora, reproducción, transcripción sin red, selección y edición de fragmentos sin alterar el original, exportación |
| F0-2 | Indicador de progreso de 3 páginas; temporizador opcional |
| F0-3 | Prompt e imagen independientes; deslizar para cambiar uno o ambos |
| F0-4 | Cuenta regresiva de 60 s antes de escribir |
| F0-5 | Solo instrucciones; atajo «¿Por qué?» |

## 7. Pruebas manuales guiadas (sensación y fluidez)

1. **Recorrido de 15 minutos:** abrir la app, elegir Fase 0, hacer un ejercicio, armar una progresión con el dado, jugar un Juego, escribir una estrofa con estructura, exportar. Anotar cualquier fricción.
2. **Prueba de la pausa creativa:** dejar la app 5 minutos y volver; verificar que todo siga en su lugar.
3. **Prueba del cierre:** cerrar la app desde el sistema con una canción escrita y confirmar que no queda nada (comportamiento esperado, D-03).
4. **Prueba con auriculares:** audio del piano sin cortes ni desfase notable.
5. **Prueba de una mano:** usar la app con una sola mano; alcanzar los controles principales.

## 8. Registro de defectos
Formato: `ID · Etapa · Gravedad (bloqueante / alta / media / baja) · Pasos · Esperado · Obtenido · Captura`.
Una etapa no se cierra con defectos bloqueantes o altos abiertos.

## 9. Definición de terminado (global)
Una etapa está terminada cuando: (1) cumple su DoD en `IMPLEMENTATION_ROADMAP.md`; (2) sus pruebas automáticas pasan; (3) sus listas manuales están completas; (4) no hay defectos bloqueantes ni altos; (5) está registrada en el tablero y el `CHANGELOG.md`.

## 10. Datos de prueba
- Paquete de prueba mínimo (E4) con licencia propia.
- 300 versos de silabeo con cuenta manual.
- 5 progresiones de referencia con tonalidad esperada.
- Canción de ejemplo con 3 secciones y 3 estructuras para exportación.
Los guardo en `/tests/fixtures`, versionados.
