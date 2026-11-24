export interface GameIntroContent {
  steps: string[];
  examples: string[];
}

export const GAME_INTROS: Record<string, GameIntroContent> = {
  'f0-1': {
    steps: [
      'Leé las instrucciones y tocá grabar cuando quieras hablar sin censura.',
      'Escuchá la grabación, transcribila y marcá las frases que te sirvan.',
      'Editá copias de esos fragmentos y llevá al cuaderno lo que quieras conservar.',
    ],
    examples: ['"No sé por dónde empezar, pero hoy me pesa el silencio."', 'Frase rescatada: "me pesa el silencio".'],
  },
  'f0-2': {
    steps: [
      'Escribí sin parar ni corregir; la meta son tres páginas.',
      'Si te sirve, elegí un temporizador Libre, 5, 10, 15, 20 o 30 minutos.',
      'Cuando termines, llevá al cuaderno lo que quieras conservar.',
    ],
    examples: ['"Hoy no tengo tema, pero escribo igual hasta que aparezca algo."', 'Una línea útil: "aparezca algo".'],
  },
  'f0-3': {
    steps: [
      'Mirá la consigna y la imagen: podés cambiar solo una o cambiar ambas.',
      'Escribí prosa de 2 a 4 carillas a partir de lo que te disparen.',
      'Llevá al cuaderno el texto o los fragmentos que te sirvan.',
    ],
    examples: ['Consigna: "Una despedida sin palabras" + foto de una estación.', 'Prosa: "Nadie dijo adiós, pero el andén quedó vacío."'],
  },
  'f0-4': {
    steps: [
      'Leé las preguntas guía y observá durante 60 segundos.',
      'Cuando termine el tiempo, escribí todo lo que viste sin orden ni filtro.',
      'Llevá al cuaderno lo que quieras conservar.',
    ],
    examples: ['"Llevaba una campera gastada y miraba el reloj cada poco."', 'Detalle: "el reloj cada poco".'],
  },
  'f0-5': {
    steps: [
      'Empezá a escribir libremente sobre lo que te ronde.',
      'Tocá "Agregar ¿Por qué?" y respondé debajo; repetí hasta profundizar.',
      'Llevá al cuaderno las respuestas o frases que te sirvan.',
    ],
    examples: ['"Me cuesta llamar." ¿Por qué? "Porque temo molestar."', '¿Por qué? "Porque aprendí a hacerme chica."'],
  },
  'g01': {
    steps: [
      'Mirá las tres columnas de 10 palabras; podés elegir sustantivos, verbos o adjetivos.',
      'Regenerá una columna o las tres si querés otras palabras; no se repiten entre columnas.',
      'Usá las palabras como disparador y llevá al cuaderno lo que aparezca.',
    ],
    examples: ['Columna: "puente, ceniza, tren..."', 'Verso: "el tren cruza la ceniza como un puente roto".'],
  },
  'g02': {
    steps: [
      'Leé el título o frase y mirá quién es su autor.',
      'Usalo como puerta de entrada: escribí lo que ese título te sugiere.',
      'Si querés otro disparador, cambiá el título y seguí escribiendo.',
    ],
    examples: ['Título: "La casa de los espíritus" — Isabel Allende.', 'Idea: una casa donde los recuerdos siguen hablando.'],
  },
  'g03': {
    steps: [
      'Elegí cuántas palabras querés ver (hasta 10) y sus categorías.',
      'Las palabras se revelan de a una; dejá que cada una te empuje.',
      'Llevá al cuaderno la combinación o frase que te sirva.',
    ],
    examples: ['Palabras: "lámpara", "huir", "suave".', 'Frase: "huir con la lámpara suave encendida".'],
  },
  'g04': {
    steps: [
      'Leé el prompt y elegí un patrón C/M: CCCM, MMMC, MCMC, CMCM o MCCC.',
      'Escribí un verso por letra: C cuenta una idea, M muestra una imagen concreta.',
      'Usá el patrón como recomendación y llevá al cuaderno tu borrador.',
    ],
    examples: ['C: "Aún te extraño." M: "Sentado en la cafetería, revuelvo el café frío."', 'Patrón MCMC: imagen, idea, imagen, idea.'],
  },
  'g05': {
    steps: [
      'Mirá el personaje, su obra y la breve descripción; usá el enlace si querés investigar.',
      'Imaginá su mundo y escribí como si fueras esa persona.',
      'Rescatá frases o imágenes y llevalas al cuaderno.',
    ],
    examples: ['Personaje: un viajero que nunca vuelve a casa.', 'Texto: "Llevo el mapa doblado donde antes estaba tu nombre."'],
  },
  'g06': {
    steps: [
      'Partí de la palabra núcleo y agregá 10 asociaciones con "+".',
      'Al completar 10, la última palabra pasa a ser el nuevo núcleo; repetí hasta 4 columnas.',
      'Usá las columnas como mapa y llevá al cuaderno lo que te sirva.',
    ],
    examples: ['Núcleo: "mar" → sal, barco, adiós, ola...', 'Nueva columna desde "ola": ruido, golpe, vuelta...'],
  },
  'g07': {
    steps: [
      'Leé el prompt y mirá las cuatro palabras que te propone la app.',
      'Escribí sin nombrarlas: expresalas con imágenes, acciones o metáforas.',
      'Podés regenerar todas o cambiar una sola palabra antes de escribir.',
    ],
    examples: ['Palabra: "miel" → "Sos pesada pero increíblemente dulce."', 'Palabra: "lluvia" → "Todo se moja aunque no lo toque."'],
  },
  'g08': {
    steps: [
      'Abrí la canción sugerida y escuchala; no se muestra la letra.',
      'Escribí otra letra sobre el mismo tema, con tu propia voz.',
      'Si te trabás, usá Asociación Libre como apoyo y llevá al cuaderno lo que salga.',
    ],
    examples: ['Canción sobre despedida → escribís tu propia despedida.', 'Mismo tema, otra escena: "el taxi se fue sin mí".'],
  },
  'g09': {
    steps: [
      'Escuchá la canción sugerida y tomá su estructura de rimas y métrica como punto de partida.',
      'Escribí una letra nueva respetando esa estructura al principio.',
      'Después transformala hasta que sea tuya y llevála al cuaderno.',
    ],
    examples: ['Mantenés el ritmo, pero cambiás la historia por completo.', 'Primero imitás la forma; después la rompés.'],
  },
  'g10': {
    steps: [
      'Buscá la letra de la canción sugerida por tu cuenta.',
      'Invertí sus expresiones, aunque queden raras o sin sentido.',
      'Usá las frases más llamativas como inspiración y llevalas al cuaderno.',
    ],
    examples: ['"Acariciando lo áspero" → "Golpeando lo blando".', 'De la inversión: "golpeando lo blando" se vuelve un verso nuevo.'],
  },
  'g11': {
    steps: [
      'Elegí cantidad (hasta 24) y categorías de palabras.',
      'Cada palabra recibe una posición obligatoria: primera, intermedia o última del verso.',
      'Escribí respetando la tabla y llevá tu texto al cuaderno.',
    ],
    examples: ['"ventana" — primera del verso.', '"nunca" — última del verso: "Nunca vuelvo a esa ventana nunca".'],
  },
  'g12': {
    steps: [
      'Mirá la palabra fuente (objeto, persona, oficio o sustantivo).',
      'Descubrí sus cualidades y aplicalas a otra cosa para armar un símil.',
      'La app no te da las cualidades: las encontrás vos y llevás el símil al cuaderno.',
    ],
    examples: ['Fuente: "buzo" → cualidades: profundidad, silencio, presión.', 'Símil: "mi amor es como un buzo en aguas profundas".'],
  },
  'g13': {
    steps: [
      'Mirá las dos frases independientes, una arriba y otra abajo.',
      'Cambiá cada tarjeta por separado deslizando o usando el botón correspondiente.',
      'Buscá un cruce entre ambas y llevá la mezcla al cuaderno.',
    ],
    examples: ['Frase A: "La noche no pide permiso." Frase B: "Guardé la llave en el bolsillo."', 'Cruce: "La noche no pide permiso cuando guardo la llave."'],
  },
  'g14': {
    steps: [
      'Mirá el sustantivo aleatorio; podés elegir una categoría si querés.',
      'Escribí desde la perspectiva de ese sustantivo, como si fuera quien habla.',
      'Llevá al cuaderno el monólogo o las imágenes que aparezcan.',
    ],
    examples: ['Sustantivo: "silla".', '"Me sostengo de cuatro patas y guardo el peso de sus ausencias."'],
  },
  'g15': {
    steps: [
      'Mirá el sustantivo y elegí una modalidad: persona/cosa, varias personas/cosa, o varias personas/varias cosas.',
      'Ingresá nombres o expresiones colectivas y escribí el retrato.',
      'Llevá al cuaderno las comparaciones que te sirvan.',
    ],
    examples: ['"Mi hermana es una lámpara vieja: calienta poco pero sigue encendida."', '"La muchedumbre era un río sin orillas."'],
  },
  'g16': {
    steps: [
      'Mirá hasta 4 frases de guion; podés reemplazar cada una por separado.',
      'Intercalá las frases en tu letra y construí algo nuevo alrededor.',
      'Tocá una frase para ver su procedencia en el tooltip y llevá el resultado al cuaderno.',
    ],
    examples: ['Frase: "Se queda mirando la puerta." + tu verso alrededor.', 'Usás la frase como bisagra entre dos estrofas.'],
  },
  'g17': {
    steps: [
      'Mirá las dos obras con sus autores; podés reemplazar cada una por separado.',
      'Buscá ambas obras por tu cuenta y combiná recursos, versos o imágenes.',
      'No copies textos protegidos: transformá lo que te inspire y llevalo al cuaderno.',
    ],
    examples: ['Obra A + Obra B → una criatura nueva con imágenes de las dos.', 'Tomás un clima de una y un gesto de otra.'],
  },
  'g18': {
    steps: [
      'Mirá el verso insistente; va a quedar visible durante todo el ejercicio.',
      'Escribí otros versos intercalando ese verso que vuelve.',
      'Probá cómo cambia el sentido al repetir y llevá la canción al cuaderno.',
    ],
    examples: ['Verso insistente: "Solo me gustaría saber".', '"Solo me gustaría saber / por qué el café se enfría / solo me gustaría saber".'],
  },
  'g19': {
    steps: [
      'Mirá las tres imágenes; podés elegir aleatorias o con relación temática.',
      'Reemplazá una imagen por separado o tocala para verla en pantalla completa.',
      'Escribí desde la atmósfera que te dejan y llevá el texto al cuaderno.',
    ],
    examples: ['Tres imágenes: tren, ventana, lluvia.', 'Texto: "La ventana aprende la lluvia mientras el tren no vuelve."'],
  },
  'g20': {
    steps: [
      'Elegí un objeto, persona, lugar o momento; la app puede sugerirte uno al azar.',
      'Recorré las siete puertas sensoriales y respondé las preguntas que te sirvan.',
      'Usá "Al azar" para cambiar palabra y preguntas, y llevá el flujo al cuaderno.',
    ],
    examples: ['Punto de partida: "parque".', 'Vista: "¿Qué es lo primero que ve la luz?" → "la banca vacía".'],
  },
  'g21': {
    steps: [
      'Escribí tu propia versión de un poema o canción en el editor.',
      'La app detecta versos y sugiere palabras para la séptima posición de cada uno.',
      'La sugerencia no es destructiva: aceptala solo si te sirve y llevá el texto al cuaderno.',
    ],
    examples: ['Verso: "Yo camino solo por la calle vacía" → séptima palabra: "calle".', 'Sugerencia: cambiar "calle" por "noche".'],
  },
  'g22': {
    steps: [
      'Elegí primero una situación o escenario.',
      'Sumá una o varias restricciones sugeridas o personalizadas, sin máximo.',
      'Escribí respetando las reglas y llevá el resultado al cuaderno.',
    ],
    examples: ['Situación: "una espera en el hospital" + restricción: "sin adjetivos".', 'Restricción: "usar todos los colores del arcoíris".'],
  },
  'g23': {
    steps: [
      'Creá un nodo inicial y confirmalo para generar tres hijos.',
      'Expandí cada nodo con tres hijos más, hasta cinco niveles; editá, regenerá o eliminá.',
      'Guardá, importá o exportá el mapa y llevá palabras al cuaderno.',
    ],
    examples: ['Nodo: "casa" → techo, puerta, mesa.', '"Puerta" → llave, ruido, adiós.'],
  },
  'g24': {
    steps: [
      'Tirá los seis dados: lugar, personaje, objeto, acción, emoción y cualidad.',
      'Podés bloquear dados, volver a tirar uno o tirar todos de nuevo.',
      'Escribí una canción con todos los elementos y llevála al cuaderno.',
    ],
    examples: ['Lugar: "un bar sin nombre", objeto: "una llave sin puerta".', 'Escena: "en un bar sin nombre, con una llave sin puerta, esperé con paciencia".'],
  },
  'g25': {
    steps: [
      'Elegí un destinatario y leé el disparador emocional.',
      'Escribí una carta completa, sin pensar en enviarla.',
      'Rescatá fragmentos para la canción y llevalos al cuaderno.',
    ],
    examples: ['Destinatario: "alguien que ya no está".', 'Disparador: "Hay algo que nunca tuve el valor de decirte..."'],
  },
  'g26': {
    steps: [
      'Mirá el tema o situación que propone el juego.',
      'Escribí dos versiones: LO QUE OCULTO (indirecto) y LO QUE CONFIESO (directo).',
      'Comparalas, usá fragmentos de ambas y llevá al cuaderno lo que te sirva.',
    ],
    examples: ['Oculto: "Dejé la luz prendida por si volvías."', 'Confieso: "Te extraño y no sé cómo decirlo."'],
  },
  'g27': {
    steps: [
      'Mirá el tema/situación y el universo temático de vocabulario.',
      'Escribí sobre el tema usando palabras de ese universo.',
      'Podés cambiar un estímulo por separado y llevar el resultado al cuaderno.',
    ],
    examples: ['Separación + Medicina: "el diagnóstico fue silencio, la sutura no alcanzó".', 'Amor + Astronomía: "tu órbita me desvía".'],
  },
  'g28': {
    steps: [
      'Mirá la composición visual de palabras y la atmósfera que propone.',
      'Escribí a partir de lo que te transmite, sin interpretarla literalmente.',
      'Sumá o quitá palabras si querés y llevá tu texto al cuaderno.',
    ],
    examples: ['Atmósfera: melancolía — "ventana, domingo, humo, último tren".', 'Texto: "el domingo fuma en la ventana del último tren".'],
  },
  'g29': {
    steps: [
      'Elegí un texto de la casa o pegá uno propio/autorizado.',
      'Tocá "Recortar y mezclar" para dividirlo en fragmentos y reorganizarlos.',
      'Bloqueá, mové o volvé a mezclar fragmentos y llevá el resultado al cuaderno.',
    ],
    examples: ['Texto: "La lluvia escribió sobre el vidrio..."', 'Fragmentos mezclados: "sobre el vidrio / la lluvia escribió / una dirección".'],
  },
  'g30': {
    steps: [
      'Escribí tres frases distintas.',
      'Trenzalas para mezclar sus palabras en una composición experimental.',
      'Cambiá una frase o todas y volvé a trenzar; llevá el resultado al cuaderno.',
    ],
    examples: ['Frases: "la noche cae", "el tren espera", "no vuelvo más".', 'Trenza: "la el no noche tren vuelvo cae espera más".'],
  },
  'g32': {
    steps: [
      'Escribí una palabra/frase o pedí una aleatoria.',
      'La app muestra cada letra en vertical con un renglón para escribir.',
      'Escribí un verso que empiece con cada letra, en orden, y llevalo al cuaderno.',
    ],
    examples: ['SOMBRA → S: "Solo queda...", O: "otra luz...", M: "mientras...".', 'Cada letra abre un verso nuevo.'],
  },
  'g33': {
    steps: [
      'Mirá la palabra del banco o elegí «palabra inventada» y escribí la tuya.',
      'Elegí el plazo: 20 minutos, 1 hora o 24 horas, y tocá «Empezar plazo».',
      'El banner con la palabra y el tiempo queda visible en el Juego y arriba del cuaderno.',
      'Escribí la canción incluyendo la palabra en cualquier parte; la tilde verde se enciende cuando aparece.',
    ],
    examples: ['Palabra: "llave" → "Llevo la llave equivocada y abro igual".', 'Palabra inventada: "ventolera" → "Ventolera de papel en el bolsillo".'],
  },
  'g41': {
    steps: [
      'Leé el título breve que aparece y dejá que te despierte preguntas.',
      'Escribí al menos tres preguntas en la lista; marcá al menos dos para responder.',
      'Llevá las preguntas elegidas al cuaderno: quedan visibles arriba mientras escribís.',
      'La meta es un verso y un estribillo que respondan esas preguntas.',
    ],
    examples: ['Título: "La casa que se quedó despierta" → "¿Quién se quedó esperando?"', 'Estribillo: "La casa sigue despierta, pero ya nadie vuelve".'],
  },
  'g44': {
    steps: [
      'Leé la consigna: son diez minutos para escribir una canción mala a propósito.',
      'Pasá al cuaderno y escribí sin cuidar la rima, el sentido ni el pudor.',
      'Volvé al Juego y tocá «Tirar»: el papel se arruga y se borra todo lo que escribiste.',
      'Después tocá «Ahora la buena»: el cuaderno abre vacío con la misma consigna.',
    ],
    examples: ['Consigna: "Escribí sobre un ascensor que se negaba a subir".', 'Primero cualquier cosa; después, la canción que sí querés escribir.'],
  },
};
