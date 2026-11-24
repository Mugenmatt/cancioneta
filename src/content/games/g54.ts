export const G54_MIN_VERSES = 8;
export const G54_MAX_VERSES = 16;

export const G54_TEXT = {
  intro: 'Un tema al azar y entre ocho y dieciséis versos. Todos tienen que ser preguntas: la canción se sostiene solo con lo que falta saber.',
  themeEyebrow: 'Tema sorteado',
  anotherTheme: 'Otro tema',
  loading: 'Buscando tema…',
  versesEyebrow: 'Versos pregunta',
  versePlaceholder: (index: number) => `Pregunta ${index + 1}…`,
  addVerse: 'Agregar verso',
  removeVerse: (index: number) => `Quitar verso ${index + 1}`,
  versesCount: (count: number) => `${count} de ${G54_MAX_VERSES} versos`,
  minPending: `Faltan versos: el mínimo es ${G54_MIN_VERSES}.`,
  editorTitle: (theme: string) => `Solo preguntas: ${theme}`,
  themeGroup: 'Tema',
  issuesGroup: 'Versos sin signo de interrogación',
  issueLabel: (index: number) => `Verso ${index + 1}`,
  editorNote: 'Mirá suavemente los versos señalados: si no tienen signo de interrogación, probá convertirlos en pregunta.',
  checkDone: 'Ya hay signos de interrogación en el cuaderno.',
  checkPending: 'Todavía no aparece ningún signo de interrogación.',
  send: 'Llevar al cuaderno',
  privacy: 'El tema y los versos viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
