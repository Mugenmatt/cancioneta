# TODO — trabajo pendiente

Prioridad alta

- iOS nativo queda diferido por decisión del usuario: no se paga Apple Developer ni se lanza `npx eas-cli build -p ios --profile preview`.
- QA real de la PWA en iPhone Safari: agregar a pantalla de inicio, arranque frío offline, modo avión, permisos, audio, import/export, VoiceOver y persistencia. **No marcar aprobado por inferencia.**
- PWA W2: frontera de plataforma por interfaces de servicio, sin tocar reglas de los Juegos ni mover textos fuera de `src/content/`.
- PWA W3: adaptar import/export de G-23 a Web Share/Blob sin `expo-file-system` en web.
- PWA W4: motor de piano y grabación web con limpieza de `Blob`, sin afirmar volumen programático ni modo silencioso nativo.
- PWA W5: evaluar motor local de transcripción (tamaño, licencia y QA) antes de instalar nada.
- PWA W6: evaluar `html2canvas-pro` y un generador PDF client-side para G-23, con aviso de nombre/licencia antes de instalar.
- F0-1: confirmar en dispositivo grabación, reproducción, transcripción on-device y borrado del archivo temporal.
- G-23: probar 121 nodos, pan acumulativo del grafo, navegación por relaciones, import/export y los cinco formatos de salida (JSON, archivo, imagen, PDF, WhatsApp).
- G-31: probar tablero táctil, `ñ`, `qu`, tildes y la garantía real de 20 palabras en varias grillas.

Prioridad media

- Completar CulturaDB con las fuentes que fallaron: reintentar Wikidata, Gutendex y Wikiquote con ventanas cortas y caché; cargar guiones de dominio público a mano.
- Resolver D-04 y revisar legalmente CC BY-SA/GFDL del léxico y las atribuciones de Wikimedia Commons antes de publicar.

Sin prioridad de bloqueo

- Ampliar `GameMeta` con `objective`, `steps` y `examples` propios por juego; hoy el contenedor usa el `summary` y pasos genéricos.
- Actualizar el README de `data/cultura_db/`, que todavía dice que la carpeta no contiene registros.
- Revisar enlaces culturales rotos (`python run.py check-links` dentro de `data/cultura_db/`).
