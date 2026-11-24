export const G57_MIN_VERSES = 8;

export const G57_TEXT = {
  intro: 'Dos personajes, dos voces y ningún narrador. Los versos se alternan: uno de A, uno de B, y así hasta que la conversación diga todo.',
  pairEyebrow: 'Pareja sorteada',
  anotherPair: 'Otra pareja',
  loading: 'Buscando pareja…',
  voiceEyebrow: (character: string) => `Voz: ${character}`,
  versePlaceholder: (character: string) => `Verso de ${character}…`,
  versesEyebrow: 'Versos alternados',
  versesCount: (count: number) => `${count} de ${G57_MIN_VERSES} versos mínimos`,
  addVerse: 'Agregar verso alternado',
  removeVerse: (index: number) => `Quitar verso ${index + 1}`,
  noNarrator: 'Sin narrador: solo lo que dice cada uno.',
  editorTitle: (a: string, b: string) => `Dos voces: ${a} y ${b}`,
  groupA: (character: string) => `Voz A: ${character}`,
  groupB: (character: string) => `Voz B: ${character}`,
  noteGroup: 'Cómo leerlo',
  editorNote: 'Los versos se leen alternando A y B, sin narrador. El panel separa lo que dice cada uno.',
  send: 'Llevar al cuaderno',
  privacy: 'La pareja y los versos viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
