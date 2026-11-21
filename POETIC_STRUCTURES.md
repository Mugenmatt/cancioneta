# POETIC_STRUCTURES — Estructuras métricas revisadas y documentadas

Convenciones en `README.md`. Uso en el editor: `LYRIC_EDITOR_AND_EXPORT.md`. Recursos expresivos: `POETIC_RESOURCES.md`.

**Regla de este documento [ORIGINAL]:** no se cambia en silencio ninguna definición del usuario. Cada estructura muestra la definición original, la contrastada con fuentes, las diferencias y una recomendación. Las **variantes particulares del usuario se conservan** y se identifican como variantes.

## 1. Estado de la revisión (leer primero)

| Aspecto | Estado |
|---|---|
| Fuentes consultadas | **Material didáctico y compilaciones universitarias** de métrica (manuales de la Universidad Masaryk, apuntes de institutos y cátedras), un artículo de Tomás Navarro Tomás sobre la sextilla de pie quebrado (*NRFH*), estudios sobre el zéjel (*RFE*, *Anuario de Estudios Medievales* y otros) y la monografía *La seguidilla* de F. Hanssen. |
| Tratados de referencia **no consultados directamente** | Navarro Tomás, *Métrica española*; Quilis, *Métrica española*; Domínguez Caparrós, *Diccionario de métrica española*; RAE (obras de métrica). Son las fuentes que conviene usar para cerrar cada fila marcada **[CONTRASTAR]**. |
| Ejemplos | Todos **originales**, escritos para la app. Los marcados **✔ verificado** pasaron un control de sílabas y rimas con un silabeador de prueba (no es un procedimiento oficial: ver §3). Los marcados **pendiente** aún no tienen ejemplo validado. |
| Consecuencia | La tabla del §5 es una **revisión provisoria** razonablemente sólida para formas comunes y **débil** para variantes propias del usuario. No debe tratarse como dictamen académico definitivo. |

## 2. Terminología: sílabas, acentos y la palabra «tónico»
- **Sílaba métrica**: la que cuenta en el verso, tras aplicar las reglas de §3. Puede diferir de la sílaba gramatical.
- **Acento rítmico**: sílaba que lleva el acento en el verso (p. ej. el decasílabo anapéstico lleva acentos en 3.ª, 6.ª y 9.ª).
- **Arte menor**: hasta 8 sílabas. **Arte mayor**: 9 o más.
- El encargo usa **«decatónico», «heptatónico», «hexatónico», «octatónico», «pentatónico»** para indicar el **número de sílabas** (10, 7, 6, 8, 5). En métrica española «-sílabo» es el término usual y «tónico» remite a acentos. **[REC]** conservar la terminología del usuario como etiqueta de variante y mostrar al lado la equivalencia académica (decasílabo, heptasílabo, hexasílabo, octosílabo, pentasílabo). Confirmar con el usuario que su «-tónico» equivale a «-sílabo» (**pregunta P-1**).

## 3. Cómo contar sílabas (base para el botón «cómo contar sílabas»)
Reglas habituales de la métrica española (verificadas en las fuentes consultadas salvo indicación):

1. **Ley del acento final:** si el verso termina en palabra **aguda** se suma una sílaba; si es **llana** no cambia; si es **esdrújula** se resta una.
2. **Sinalefa:** la vocal final de una palabra y la inicial de la siguiente (con o sin *h* intermedia) se cuentan como una sola sílaba. Es la regla más importante para contar.
3. **Hiato:** dos vocales contiguas pertenecen a sílabas distintas (p. ej. *ca-í-da*, *rí-o*).
4. **Diéresis y sinéresis:** licencias que deshacen o forman un diptongo por necesidad métrica (hay ambigüedad real).
5. La conjunción *y* funciona como vocal para la sinalefa.
6. **Dentro de la palabra**, diptongos y triptongos cuentan como una sílaba.

**Implementación en la app [REC]:** un contador automático por reglas que muestre la **«cuenta probable»** con las sinalefas marcadas, y permita al usuario **ajustar manualmente** un verso. El contador es una ayuda, **nunca un error**. Las ambigüedades (sinéresis, diéresis, hiatos no obvios) se señalan como «dudoso». El silabeador de la app debe validarse con un conjunto de casos de prueba escrito a mano (≥ 300 versos) en la Etapa de poesía.

## 4. Resumen visual de las 22 estructuras

| # | Estructura | Versos | Esquema | Medida (usuario) | Tipo |
|---|---|---|---|---|---|
| 1 | Pareado | 2 | AA | indiferente | Estrofa |
| 2 | Terceto | 3 | ABA / BCB / CDC | arte mayor | Estrofa |
| 3 | Serventesio | 4 | ABAB | 10 (usuario) | Estrofa |
| 4 | Redondilla | 4 | ABBA | 10 (usuario) | Estrofa |
| 5 | Cuaderna vía | 4 | AAAA | 14 | Estrofa |
| 6 | Lira | 5 | 7a 11B 7a 7b 11B | 7 y 11 | Estrofa |
| 7 | Seguidillas (3 variantes) | 4 | ver §6.7 | 6/4, 5/7, 5/5 | Estrofa |
| 8 | Quintilla | 5 | libre con reglas | arte menor | Estrofa |
| 9 | Copla de pie quebrado | 6 | 8a 8b 4c 8a 8b 4c | 8 y 4 | Estrofa |
| 10 | Octavilla 1 | 8 | XAAB-XCCB | 7 | Estrofa |
| 11 | Octavilla 2 | 8 | ABAB-BCCB | 7 | Estrofa |
| 12 | Octavilla romanceada | 8 | XAXA-XAXA | monométrica | Estrofa |
| 13 | Sextillas | 6 | XAABBA (y XAABBA-XCCDDC) | arte menor | Estrofa |
| 14 | Sextina bipartita | 6 | AABCCB | acentual | Estrofa |
| 15 | Sexteto bipartito | 6 | XXA-XXA | monométrico | Estrofa |
| 16 | Décimas | 10 | ABBAACCDDC (y XAABBCCDDBB ¿?) | 7 (usuario) | Estrofa |
| 17 | Zéjel | variable | AAAB-CCCB-DDDB | — | Composición |
| 18 | Seguidilla «Triunfo» (Rincón de López) | 4+ | 8-8-10-10 | 8 y 10 | Composición |
| 19 | Soneto | 14 | ABBA ABBA CDC DCD | 11 | Composición |
| 20 | Romance | indef. | 8X 8A 8X 8A… | 8 | Composición |
| 21 | Silva | indef. | libre | mixta | Composición |
| 22 | Decasílabo tritónico anapéstico | patrón | XAXA-XBXB-XCXC | 10, acentos 3-6-9 | Patrón métrico |

*Mayúscula = verso de arte mayor; minúscula = arte menor; **X** = verso blanco (sin rima); **-** = verso suelto.* Las estructuras de **estrofa** y de **composición completa** se muestran en grupos separados en la app (requisito del encargo).

## 5. Tabla de revisión académica

Leyenda de recomendación: **Mantener** (coincide), **Variante** (se conserva la definición del usuario, rotulada y con la forma tradicional al lado), **Consultar** (ambigua o sin fuente: se necesita tu confirmación).

| Estructura | Definición original | Definición contrastada | Diferencias | Fuente | Recomendación |
|---|---|---|---|---|---|
| **Pareado** | Dos versos con rima consonante, seguidos o intercalados | Estrofa de dos versos, de arte mayor o menor, rima habitualmente consonante | El pareado estricto son dos versos **consecutivos**; «intercalados» no es pareado sino rima dentro de otra estrofa | Apuntes de métrica (institutos); manual UMuni | **Mantener** + nota: el modo «intercalado» se presenta como variante |
| **Terceto** | Tres versos de arte mayor, consonante; patrones ABA, BCB, CDC | Tres versos de arte mayor (endecasílabos), consonante, ABA; en serie son **tercetos encadenados** (ABA BCB CDC…) | El patrón del usuario describe los tercetos **encadenados** | Madrid.org (esquema de estrofas); UMuni; apuntes | **Mantener**; nombrar «terceto encadenado» para ABA-BCB-CDC |
| **Serventesio** | Cuatro versos, rima intercalada ABAB, «decatónicos», consonantes | Cuatro versos de **arte mayor** (típicamente **endecasílabos**), rima consonante ABAB | **Medida:** 10 (usuario) vs 11 (tradicional). El decasílabo es arte mayor, pero no el verso canónico | UMuni (*Métrica del verso español*); apuntes | **Variante:** medida 10 por defecto del usuario; mostrar la forma tradicional de 11 |
| **Redondilla** | ABBA; versos 2.º y 3.º como «retraso»; «decatónicos»; consonante | Cuatro versos de **arte menor** (normalmente **octosílabos**), ABBA; rima consonante (algunas fuentes admiten asonante) | **Medida:** 10 vs 8. La función de «retraso» no figura como término académico (descripción propia) | UMuni; apuntes; Sinclair/otros **[CONTRASTAR]** | **Variante** (10 sílabas) + forma tradicional de 8 |
| **Cuaderna vía** | Cuatro alejandrinos de 14 sílabas, monorrimos, consonante | Cuatro versos **alejandrinos de 14 sílabas**, rima consonante AAAA, con **cesura** que divide en dos hemistiquios de 7 | Coincide; falta la **cesura 7+7**, que conviene mostrar | Manuales UMuni; apuntes | **Mantener** (+ marca de cesura) |
| **Lira** | 7A 11B 7A 7B 11B | Cinco versos: tres heptasílabos y dos endecasílabos, consonante, **aBabB** (introducida por Garcilaso) | Coincide (las dos notaciones son equivalentes: los versos 2, 4 y 5 comparten rima) | UMuni; varios apuntes | **Mantener** |
| **Seguidillas** | Cuatro versos; variantes: (a) 1.º y 3.º hexasílabos, 2.º y 4.º tetrasílabos; (b) 1.º y 3.º pentasílabos, 2.º y 4.º heptasílabos; (c) todos pentasílabos con finales agudos, graves o esdrújulos | **Seguidilla** simple: 4 versos, **7-5-7-5** (heptasílabo, pentasílabo), rima en 2.º y 4.º, habitualmente asonante. Hanssen documenta licencias como sustituir pentasílabos graves por **hexasílabos agudos** | (a) y (c) son **variantes del usuario**; (b) es la **inversa** de la medida tradicional (5-7-5-7 vs 7-5-7-5). La rima del usuario no está especificada | Esquema de métrica (UMuni); apuntes; Hanssen, *La seguidilla* (consulta parcial) | **Variante** las tres; añadir la **tradicional 7-5-7-5** como cuarta opción. **Consultar** la rima deseada (P-2) |
| **Seguidilla «Triunfo» de Rincón de López** | Simetría entre estrofas; cuatro versos, dos octatónicos y dos decatónicos; las estrofas siguientes repiten la estructura | **No encontré ninguna fuente** que describa una «seguidilla tipo *Triunfo*» ni un autor «Rincón de López» | Sin base verificable | — | **Consultar (bloqueante para este ítem):** pedir la fuente o un ejemplo del usuario (P-3). Hasta entonces se implementa **solo como patrón métrico 8-8-10-10 sin rima definida**, rotulado «Variante del usuario — sin fuente» |
| **Zéjel** | AAAB-CCCB-DDDB…; cada estrofa tiene dos partes de cuatro versos; versos 4.º y 8.º comparten rima | Estribillo (a menudo 2 versos **aa**) + **mudanza** de tres versos monorrimos + **vuelta** que rima con el estribillo: **aa-bbba, aa-ccca…** | **Diferencia importante:** el esquema del usuario (cuatro versos con tres rimas iguales y un cuarto verso constante) se parece a una **versión descrita en fuentes anglófonas** (BBBA, CCCA…) pero no coincide con el zéjel tradicional ni con su descripción de «dos partes de cuatro» | Fernández Manzano; Navarro Tomás (citado en artículos); *RFE*; manual UMuni; hispadoc | **Variante** (esquema del usuario, rotulado) + **zéjel tradicional** aparte. **Consultar** la descripción de «dos partes de cuatro versos» (P-4) |
| **Quintilla** | Cinco versos de arte menor, consonante, sin esquema fijo; no más de dos versos consecutivos con la misma rima; no termina en pareado; sin versos sueltos | Igual: arte menor (octosílabos), consonante; **no tres versos seguidos con la misma rima; los dos últimos no forman pareado; sin versos sueltos**. Con dos rimas quedan **cinco esquemas válidos**: aabab, aabba, abaab, ababa, abbab | Coincide | UMuni; varias fuentes | **Mantener**; la app valida las reglas |
| **Copla de pie quebrado** | 8A 8B 4C 8A 8B 4C | Sextilla de **pie quebrado** (copla manriqueña): 8a 8b 4c 8a 8b 4c; Navarro Tomás la estudió y admite el pie quebrado de **4 o 5 sílabas** | Coincide; la forma tradicional admite **tetrasílabo o pentasílabo** en el pie | Navarro Tomás (*NRFH*); UMuni; apuntes | **Mantener** (+ opción pie de 5) |
| **Octavilla 1** | XAAB-XCCB: dos redondillas heptatónicas con verso blanco, pareado y verso que rima con el final de la otra estrofa | **Octavilla**: ocho versos de arte menor. Existe la **«octavilla aguda»** de esquema **-aab -ccb** | El esquema del usuario **coincide con la octavilla aguda**; difiere en que el usuario la fija en **7 sílabas** y no exige finales agudos | Material de cátedra (milaulas); apuntes | **Variante** (7 sílabas); indicar parentesco con la «octavilla aguda» |
| **Octavilla 2** | ABAB-BCCB: redondillas heptatónicas; versos 2, 4, 5 y 8 riman; 6 y 7 generan «retraso» | **Sin equivalente documentado** en las fuentes consultadas | Esquema propio | — | **Variante** del usuario, sin fuente; ejemplo pendiente |
| **Octavilla romanceada** | XAXA-XAXA: dos cuartetas monométricas con versos blancos y rimados alternados | Es, estructuralmente, un **romance de 8 versos** (octosílabos, rima en los pares) | La denominación es del usuario | UMuni (romance) | **Variante**, con nota «equivale a un romance de 8 versos» |
| **Sextillas** | XAABBA; arte menor monométricas; con dos estrofas sugerir XAABBA-XCCDDC | **Sextilla**: seis versos de arte menor con las **mismas condiciones que la quintilla**. Con dos rimas hay 8 esquemas posibles, con tres rimas 12 (entre ellos aabccb y abcabc). XAABBA tiene un verso blanco | El esquema del usuario es un **caso particular** con verso blanco inicial, que las fuentes no recogen | UMuni; apuntes | **Variante** para XAABBA; mostrar los esquemas académicos como alternativas |
| **Sextina bipartita** | AABCCB; relación acentual entre versos 2, 3, 5, 6 y versos 1 y 4 | La **sextina** (o sexta rima) es de **arte mayor**, ABABCC. El esquema AABCCB corresponde a una **sextilla de arte menor** descrita en manuales | **Nombre no estándar**; la «relación acentual» no se pudo contrastar | UMuni; apuntes | **Consultar** (P-5): confirmar la relación acentual. Mientras tanto, variante con aviso «el nombre difiere del académico» |
| **Sexteto bipartito** | XXA-XXA; versos blancos retrasan los versos 3.º y 6.º | El **sexteto** es de **arte mayor** (con rima consonante). «Bipartito» no es término académico | Nombre y medida propios | — | **Variante** del usuario, sin fuente |
| **Décimas** | ABBAACCDDC; diez versos «heptatónicos»; posible variación XAABBCCDDBB | **Espinela**: diez octosílabos con rima abbaaccddc (Vicente Espinel) | **Medida:** 7 (usuario) vs 8. La variación XAABBCCDDBB tiene **11 posiciones**, lo que **no coincide con diez versos** | Varias fuentes (UMuni, apuntes) | **Variante** de 7 sílabas + espinela tradicional de 8. **Consultar** la variación (P-6) |
| **Decasílabo tritónico anapéstico** | XAXA-XBXB-XCXC; tres acentos estructurales en 3, 6 y 9 | El **decasílabo anapéstico** (ritmo 3-6-9) se describe en manuales y por Bello/Navarro Tomás **[CONTRASTAR]** | «Tritónico» es denominación del usuario; el esquema de rima es propio | Referencias parciales (Bello, Navarro Tomás citados en estudios) | **Mantener** como patrón métrico; el nombre se muestra como «tritónico (decasílabo anapéstico)» |
| **Soneto** | Dos cuartetos y dos tercetos; usual ABBA-ABBA-CDC-DCD | Catorce endecasílabos: ABBA ABBA + tercetos CDC DCD **u otras combinaciones** (CDC CDC, CDE CDE); puede haber estrambote | Coincide; añadir las variantes de tercetos | Apuntes; esquema de estrofas | **Mantener** |
| **Romance** | Tirada de versos con rima asonante en los pares; patrón 8X 8A 8X 8A | Tirada de **octosílabos** sin estrofa: los **impares quedan sueltos**, los pares comparten una **única asonancia** | Coincide. Nota: la asonancia es **la misma en todo el poema** | Manual UMuni | **Mantener** |
| **Silva** | Serie de versos de diferentes medidas con rima consonante | Serie indefinida de **endecasílabos y heptasílabos** combinados libremente; la rima es libre y **puede haber versos sueltos** | Las medidas usuales son 7 y 11; los sueltos están permitidos | Apuntes; UMuni | **Mantener** + aclaración |

### Preguntas que surgen de la revisión (resumen)
- **P-1:** ¿«decatónico/heptatónico…» = número de sílabas?
- **P-2:** ¿Qué rima quiere el usuario en las seguidillas (asonante o consonante, qué versos)?
- **P-3:** Fuente o ejemplo de la seguidilla «Triunfo».
- **P-4:** Aclarar el zéjel de «dos partes de cuatro versos».
- **P-5:** Relación acentual de la sextina bipartita.
- **P-6:** ¿La variación XAABBCCDDBB es un error de tipeo (11 posiciones)?

## 6. Fichas por estructura

**Formato de ficha:** esquema · representación por versos · métrica · acentos relevantes · explicación · ejemplo original · errores frecuentes · ejercicio opcional. El botón «Cómo contar sílabas» (§3) aparece en todas. Los versos se representan con una línea por verso y la letra de rima a la derecha; **X** es verso blanco.

### 6.1 Pareado (AA) — Estrofa
- **Métrica:** libre (ejemplo en 8). **Acentos:** el verso llano lleva el acento en la penúltima sílaba.
- **Ejemplo ✔ verificado:**
  ```
  La lluvia borra el camino      A
  y yo sigo sin mi destino       A
  ```
- **Errores frecuentes:** rimar solo la última vocal (asonancia) cuando se busca consonante; confundir dos versos que riman pero no son consecutivos.
- **Ejercicio:** escribí un pareado que cierre una idea con una sorpresa.

### 6.2 Terceto (ABA; encadenado BCB…) — Estrofa
- **Métrica:** arte mayor; ejemplo en 11. **Rima:** consonante.
- **Ejemplo ✔ verificado (dos tercetos encadenados ABA-BCB):**
  ```
  Me despierta la luz de tu ventana     A
  hasta el último sueño se me escapa    B
  y un pájaro desvela la mañana         A
  mientras bajo la puerta se me escapa  B
  la lluvia que dejaste en mi garganta  C
  y el tiempo que no vuelve nunca atrapa B
  ```
- **Errores frecuentes:** repetir la misma palabra como rima (en este ejemplo «escapa» se repite: conviene cambiarla en la versión final); olvidar que el segundo terceto retoma la rima B del primero.
- **Ejercicio:** continuá con un tercer terceto CDC.

### 6.3 Serventesio (ABAB) — Estrofa — *Variante: 10 sílabas*
- **Métrica del usuario:** 10 («decatónico»). **Tradicional:** endecasílabos (11).
- **Ejemplo ✔ verificado (10):**
  ```
  Abro la puerta y sigue lloviendo      A
  tu recuerdo se queda conmigo          B
  y la noche me va consumiendo          A
  como un perro sin dueño ni abrigo     B
  ```
- **Errores frecuentes:** rimas cruzadas mal colocadas (ABBA en vez de ABAB).
- **Ejercicio:** reescribilo en endecasílabos.

### 6.4 Redondilla (ABBA) — Estrofa — *Variante: 10 sílabas*
- **Métrica del usuario:** 10. **Tradicional:** octosílabos (8). Los versos centrales «abrazan»; el 2.º y el 3.º riman entre sí.
- **Ejemplo ✔ verificado (10):**
  ```
  Tu voz quedó en un cajón cerrado      A
  el tiempo no la lleva al olvido       B
  la devuelve en la lluvia, en el ruido B
  y me despierta ya desvelado           A
  ```
- **Errores frecuentes:** confundirla con la cuarteta (abab).
- **Ejercicio:** convertila en cuarteta (ABAB) cambiando solo dos versos.

### 6.5 Cuaderna vía (AAAA) — Estrofa
- **Métrica:** 14 (alejandrino, **cesura 7+7**).
- **Ejemplo ✔ verificado (cuenta total 14; cesura no verificada automáticamente):**
  ```
  Cuando cae la noche | sobre el puerto dormido       A
  y el faro va contando | los barcos del olvido       A
  yo repaso mis días | con el pecho encogido          A
  buscando entre las sombras | un nombre conocido     A
  ```
- **Errores frecuentes:** cesura que parte una palabra; cuatro rimas distintas.
- **Ejercicio:** agregá una segunda estrofa con rima nueva.

### 6.6 Lira — Estrofa
- **Esquema:** 7a 11B 7a 7b 11B. Versos 2, 4 y 5 comparten rima; 1 y 3 comparten otra.
- **Ejemplo ✔ verificado:**
  ```
  Me hablaste de la sal              7  a
  y de un viento que cruza las ventanas 11 B
  sin saber de otro mal              7  a
  y de playas lejanas                7  b
  que se quedaron ya sin tus mañanas 11 B
  ```
- **Errores frecuentes:** olvidar que el verso 4 (de 7) rima con los endecasílabos.
- **Ejercicio:** escribí una lira sobre un lugar.

### 6.7 Seguidillas — Estrofa — *Variantes del usuario + tradicional*
Esquema de rima **[REC, hasta P-2]:** versos 2.º y 4.º riman; 1.º y 3.º quedan sueltos o con otra rima.
- **(a) 6-4-6-4 ✔ verificado:**
  ```
  Me voy por la calle   6
  sin mirar             4  a
  y el sol de la tarde  6
  sin parar             4  a
  ```
- **(b) 5-7-5-7 ✔ verificado (inversa de la tradicional 7-5-7-5):**
  ```
  Voy sin destino        5
  por la calle sin sol   7  a
  con mi mochila         5
  bajo un cielo sin sol  7  a
  ```
- **(c) 5-5-5-5 con finales variados ✔ verificado (versos 2 y 4 agudos; 1 y 3 graves):**
  ```
  Me voy cantando   5 (llano)
  la voz sin paz    5 (agudo)  a
  bajo la luna      5 (llano)
  su luz fugaz      5 (agudo)  a
  ```
  Con finales **esdrújulos**: el verso cuenta una sílaba menos (ley del acento final): pentasílabo con esdrújula = 6 sílabas gramaticales.
- **(d) Tradicional 7-5-7-5:** ejemplo pendiente.
- **Errores frecuentes:** olvidar el ajuste de agudas/esdrújulas en (c); mezclar medidas.

### 6.8 Quintilla — Estrofa
- **Reglas:** arte menor, consonante; sin tres versos seguidos con la misma rima; los dos últimos no riman entre sí; sin versos sueltos. **Esquemas válidos con dos rimas:** aabab, aabba, abaab, ababa, abbab.
- **Ejemplo ✔ verificado (ababa):**
  ```
  Cuando la tarde se inclina     a
  la ciudad se vuelve mar        b
  y en la luz que la ilumina     a
  me descubro sin hablar         b
  con la nostalgia en la esquina a
  ```
- **Errores frecuentes:** terminar en pareado (…bb); dejar un verso sin pareja.
- **Ejercicio:** reescribilo con el esquema abbab.

### 6.9 Copla de pie quebrado — Estrofa
- **Esquema:** 8a 8b 4c 8a 8b 4c (el pie puede ser de 4 o de 5).
- **Ejemplo ✔ verificado:**
  ```
  Guardé tu voz en la mano        8 a
  como se guarda una flor         8 b
  sin pensar                      4 c
  y la soltó el aire vano         8 a
  cuando aprendí que el amor      8 b
  es volar                        4 c
  ```
- **Errores frecuentes:** contar mal los versos agudos del pie (el pie agudo suma una sílaba).
- **Ejercicio:** reemplazá los pies por pentasílabos.

### 6.10 Octavilla 1 (XAAB-XCCB) — Variante, 7 sílabas
- **Ejemplo ✔ verificado:**
  ```
  Soñé anoche con lluvia        X
  cerrando las dos puertas      A
  ya no quedan abiertas         A
  viento sobre la mar           B
  Se me hace tarde y espero     X
  dejando todo abierto          C
  Voy a esperarte despierto     C
  sin pedir nada al mar         B
  ```
- **Errores frecuentes:** que los versos blancos (X) rimen por casualidad.

### 6.11 Octavilla 2 (ABAB-BCCB) — Variante, 7 sílabas
- **Ejemplo:** **pendiente** (redacción y verificación en la Etapa de poesía).

### 6.12 Octavilla romanceada (XAXA-XAXA) — Variante
- Equivale a un romance de 8 versos (§6.20).
- **Ejemplo ✔ verificado (octosílabos, asonancia á-a en los pares):** ver §6.20.

### 6.13 Sextillas (XAABBA y XAABBA-XCCDDC) — Variante
- **Ejemplo ✔ verificado (XAABBA, 8 sílabas):**
  ```
  Se enciende la luz del patio   X
  me llama tu voz de lejos       A
  me cuelgo de los espejos       A
  viene el viento a rescatar     B
  lo que no supe guardar         B
  como se guardan los viejos     A
  ```
- **Esquemas académicos alternativos:** abcabc, ababab, aabccb, etc. **Ejercicio:** escribí la segunda estrofa XCCDDC.

### 6.14 Sextina bipartita (AABCCB) — Variante, a consultar (P-5)
- **Ejemplo ✔ verificado (8 sílabas; la relación acentual no se validó):**
  ```
  Cuando la tarde se inclina     A
  y en la luz que la ilumina     A
  me descubro sin hablar         B
  guardé tu voz en la mano       C
  y la soltó el aire vano        C
  la ciudad se vuelve mar        B
  ```

### 6.15 Sexteto bipartito (XXA-XXA) — Variante
- **Ejemplo ✔ verificado (8 sílabas):**
  ```
  Guardé tu voz en la mano       X
  la ciudad se vuelve mar        X
  como se guarda una flor        A
  cuando la tarde se inclina     X
  y la luz se vuelve fría        X
  cuando aprendí que el amor     A
  ```

### 6.16 Décimas (ABBAACCDDC) — Variante: 7 sílabas; tradicional 8
- **Ejemplo ✔ verificado en la medida tradicional (8); el ejemplo de 7 sílabas está pendiente:**
  ```
  Cuando la tarde se inclina      a
  la ciudad se vuelve mar         b
  me descubro sin hablar          b
  y en la luz que la ilumina      a
  con la nostalgia en la esquina  a
  Guardé tu voz en la mano        c
  y la soltó el aire vano         c
  como se guarda una flor         d
  cuando aprendí que el amor      d
  tan lejos y tan cercano         c
  ```
- **Errores frecuentes:** perder el encadenamiento «aa» entre los versos 4 y 5.

### 6.17 Zéjel — Composición
- **Tradicional (estribillo + mudanza + vuelta) ✔ verificado (8 sílabas):**
  ```
  la ciudad se vuelve mar            a   ← estribillo
  me descubro sin hablar             a
  Cuando la tarde se inclina         b   ← mudanza
  y en la luz que la ilumina         b
  con la nostalgia en la esquina     b
  y me quedo sin hablar              a   ← vuelta
  la ciudad se vuelve mar            a   ← vuelve el estribillo
  me descubro sin hablar             a
  ```
- **Variante del usuario (AAAB-CCCB-DDDB…):** ejemplo **pendiente**, a la espera de P-4.

### 6.18 Seguidilla «Triunfo» (Rincón de López) — Variante sin fuente
- **Patrón:** 4 versos 8-8-10-10, repetido en cada estrofa. **Rima:** no definida. **Ejemplo:** pendiente (P-3).

### 6.19 Soneto — Composición
- **Esquema:** ABBA ABBA CDC DCD (o CDE CDE). Endecasílabos, consonante.
- **Ejemplo:** **pendiente** (14 versos que exigen verificación completa).
- **Errores frecuentes:** rimas del cuarteto que cambian entre las dos estrofas; tercetos que repiten una rima de los cuartetos.

### 6.20 Romance — Composición
- **Esquema:** octosílabos; los **impares sueltos**; los **pares con una misma asonancia** en todo el poema.
- **Ejemplo ✔ verificado (asonancia á-a: calma, playa, barranca, lana):**
  ```
  Llevo el sombrero en la mano      X
  y el corazón en la calma          A
  la tarde se va despacio           X
  por la orilla de la playa         A
  nadie sabe que te espero          X
  junto al agua y la barranca       A
  con la voz de las gaviotas        X
  con un cielo hecho de lana        A
  ```
- **Errores frecuentes:** cambiar de asonancia a mitad; hacer rimar los impares.

### 6.21 Silva — Composición
- **Esquema:** libre; mezcla de 7 y 11; consonante; versos sueltos permitidos. **Ejemplo:** pendiente.

### 6.22 Decasílabo tritónico anapéstico — Patrón métrico
- **Acentos:** 3.ª, 6.ª y 9.ª; la 10.ª es átona. **Esquema del usuario:** XAXA-XBXB-XCXC.
- **Ejemplo ✔ verificado en cantidad de sílabas; acentos revisados a mano:**
  ```
  Se me pierde la voz en la calle      X   (acentos: pier-voz-ca)
  te me vas con la luz de la tarde     A   (vas-luz-tar)
  yo me voy con la sal de la noche     X   (voy-sal-no)
  sin tu voz se me apaga la tarde      A   (voz-pa-tar)
  ```
- **Errores frecuentes:** desplazar un acento a la 4.ª o la 5.ª sílaba; olvidar la sinalefa.

## 7. Funciones de la app relacionadas
1. **Selector de estructura** por estrofa en el editor, con vista previa del esquema.
2. **Validador de esquema** (no bloquea): marca versos que no cumplen la medida o la rima, con explicación.
3. **Detector de rima:** consonante y asonante, calculada con el mismo silabeador.
4. **Ayuda «cómo contar sílabas»:** §3 con ejemplos interactivos.
5. **Ejercicio opcional** por estructura (el de cada ficha).
6. Los datos de estructuras viven en un archivo (`structures.json`) con: id, nombre, versos, esquema, medidas, acentos, tipo (estrofa/composición), `origin` (`user_variant` | `academic`), nota de fuente y estado de verificación.

## 8. Criterios de aceptación
1. Las 22 estructuras existen como datos, con tipo «estrofa» o «composición» diferenciado.
2. Cada ficha tiene esquema, representación visual, métrica, ejemplo (o «pendiente» visible solo en el entorno de desarrollo, no para el usuario final), errores frecuentes y botón de conteo.
3. El silabeador reproduce los recuentos de los ejemplos marcados ✔ y de un conjunto de ≥ 300 versos de prueba.
4. Ninguna definición del usuario se sobrescribe: cada variante conserva su etiqueta.
5. La quintilla rechaza los esquemas que violan sus reglas y acepta los cinco válidos.
Pruebas en `QA_AND_ACCEPTANCE_TESTS.md` (tanda 5).
