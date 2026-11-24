export const G41_MIN_QUESTIONS = 3;
export const G41_MIN_SELECTED = 2;

export const G41_TEXT = {
  intro: 'Un título breve puede abrir muchas preguntas. Elegí las que quieras responder.',
  titleEyebrow: 'Título del banco',
  anotherTitle: 'Otro título',
  questionsEyebrow: 'Paso 1: escribí al menos tres preguntas',
  addQuestion: 'Agregar pregunta',
  questionPlaceholder: (index: number) => `Pregunta ${index + 1}…`,
  mark: (index: number) => `Marcar pregunta ${index + 1}`,
  unmark: (index: number) => `Desmarcar pregunta ${index + 1}`,
  questionsCount: (count: number) => `${count} preguntas escritas`,
  selectionEyebrow: 'Paso 2: marcá al menos dos para responder',
  selectedCount: (count: number) => `${count} preguntas marcadas`,
  editorTitle: (title: string) => `Título: ${title}`,
  selectedQuestionsTitle: 'Preguntas elegidas',
  editorNote: 'Escribí un verso y un estribillo que respondan las preguntas marcadas.',
  send: 'Ir al cuaderno',
  privacy: 'Las preguntas y la letra viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
