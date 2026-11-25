export interface RhymeScheme {
  id: string;
  pattern: string;
  name: string;
  hint: string;
  lines: readonly [string, string, string, string];
}

export const G35_SCHEMES: readonly RhymeScheme[] = [
  {
    id: 'abab',
    pattern: 'ABAB',
    name: 'Rima cruzada',
    hint: 'El primer verso rima con el tercero; el segundo, con el cuarto.',
    lines: [
      'Cayó la lluvia sobre el patio de mi casa,',
      'se apagó la luz que quedaba en la esquina;',
      'la lluvia sabe por qué el silencio pasa,',
      'la luz se fue sin decir cuándo termina.',
    ],
  },
  {
    id: 'aabb',
    pattern: 'AABB',
    name: 'Rima pareada',
    hint: 'Los dos primeros versos riman entre sí y los dos últimos, entre sí.',
    lines: [
      'Abrí la ventana, entró el frío de la sierra,',
      'busqué la manta que dejó mi abuela;',
      'el frío traía olor a tierra,',
      'la manta sabía lo que la casa revela.',
    ],
  },
  {
    id: 'abba',
    pattern: 'ABBA',
    name: 'Rima abrazada',
    hint: 'El primer verso rima con el cuarto; el segundo, con el tercero.',
    lines: [
      'La luz del domingo se quedó en la mesa,',
      'el café se enfrió sin nadie que lo tomara;',
      'si volvés, no hace falta ninguna palabra,',
      'la luz del domingo otra vez nos besa.',
    ],
  },
  {
    id: 'xaxa',
    pattern: 'XAXA',
    name: 'Sin rima / con rima',
    hint: 'Alterná un verso sin rima (X) con uno que rima (A).',
    lines: [
      'El tren frenó donde nadie espera,',
      'dejó una carta con tu nombre;',
      'el andén quedó sin bandera,',
      'yo guardé la carta y aprendí su nombre.',
    ],
  },
  {
    id: 'aaa_last_word',
    pattern: 'AAAA',
    name: 'Última palabra fija',
    hint: 'Los cuatro versos terminan con la misma palabra en cada estrofa.',
    lines: [
      'Me fui temprano y era tarde, demasiado tarde.',
      'Dejé la luz y era tarde, demasiado tarde.',
      'Volví corriendo y era tarde, demasiado tarde.',
      'No dije nada: era tarde, demasiado tarde.',
    ],
  },
  {
    id: 'aacbbc',
    pattern: 'AACBBC',
    name: 'Seis posiciones',
    hint: 'Esquema A A C B B C; el ejemplo muestra los cuatro primeros versos (A A C B).',
    lines: [
      'Guardé tu nombre donde guardo la queja,',
      'cerre el cajón con una llave vieja;',
      'afuera el día no dice nada,',
      'el reloj camina y no se detiene.',
    ],
  },
  {
    id: 'internal',
    pattern: 'A A / B B',
    name: 'Rimas internas',
    hint: 'La rima ocurre a mitad de verso, no al final.',
    lines: [
      'La casa se despierta y se queja, se levanta;',
      'la calle se despierta y se queja, se levanta;',
      'el reloj da las siete y se queda, se detiene;',
      'tu nombre en la pared se queda, se detiene.',
    ],
  },
  {
    id: 'no_rhyme_refrain',
    pattern: 'XXXR',
    name: 'Último verso fijo',
    hint: 'Los tres primeros versos no riman; el cuarto vuelve igual en cada estrofa.',
    lines: [
      'Traje el paraguas aunque no llovía,',
      'crucé la plaza sin mirar a nadie,',
      'guardé el boleto dentro del bolsillo,',
      'siempre vuelvo por la misma calle.',
    ],
  },
  {
    id: 'abcb',
    pattern: 'ABCB',
    name: 'Rima en los pares',
    hint: 'Los versos segundo y cuarto riman entre sí; el primero y el tercero quedan libres.',
    lines: [
      'El colectivo pasó sin frenar en la esquina,',
      'dejó un papel con tu letra en el umbral;',
      'mi hermana dice que no valía la pena,',
      'yo lo guardé como quien guarda un final.',
    ],
  },
  {
    id: 'assonance',
    pattern: 'ABAB (asonante)',
    name: 'Rima asonante',
    hint: 'Riman las vocales, no las consonantes: casa con sala, piedra con fiera.',
    lines: [
      'Volví corriendo hasta la casa,',
      'el camino cortaba la piedra,',
      'dejé las llaves tiradas en la sala,',
      'y tu risa salió como una fiera.',
    ],
  },
  {
    id: 'aabba',
    pattern: 'AABBA',
    name: 'Cinco posiciones',
    hint: 'Esquema A A B B A; el ejemplo muestra los cuatro primeros versos (A A B B).',
    lines: [
      'Hay una silla en la esquina de la plaza,',
      'que nadie mueve y nadie la reemplaza;',
      'por la noche espera que pase el coche,',
      'y el barrio le devuelve su reproche.',
    ],
  },
  {
    id: 'free_verse',
    pattern: 'XXXX',
    name: 'Verso libre',
    hint: 'Sin rima fija: los cuatro versos pueden terminar en palabras que no se parezcan.',
    lines: [
      'Anoté la hora en el borde del diario,',
      'dejé la taza sin lavar sobre el mesón,',
      'afuera alguien discutía con el portero,',
      'y el timbre sigue sonando en mi memoria.',
    ],
  },
];

export const G35_TEXT = {
  intro: 'Elegí un molde o sorteado. El esquema queda fijo arriba del cuaderno mientras escribís; no se detectan rimas automáticamente.',
  cardEyebrow: 'Moldes disponibles',
  draw: 'Sortear molde',
  selectedEyebrow: 'Molde elegido',
  patternLabel: 'Esquema',
  exampleEyebrow: 'Ejemplo original de cuatro versos',
  consigna: (pattern: string) => `Escribí una estrofa con el esquema ${pattern}.`,
  editorTitle: (pattern: string) => `Molde de rima: ${pattern}`,
  schemeGroup: 'Esquema elegido',
  exampleGroup: 'Ejemplo del molde',
  editorNote: 'Respetá el esquema elegido. Los ejemplos son originales y no son letras de canciones reales.',
  send: 'Llevar al cuaderno',
  privacy: 'El molde y la letra viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
