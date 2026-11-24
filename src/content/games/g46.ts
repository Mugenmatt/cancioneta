export const G46_TURN_COUNT = 12;

export const G46_SECTION_SIZES = { verse: 4, preChorus: 2, chorus: 6 } as const;

export const G46_TEXT = {
  intro: 'Un tema, dos personas y doce versos que se pasan el celular. Cada uno ve solo el verso anterior y escribe el siguiente.',
  setupEyebrow: 'Antes de arrancar',
  nameA: 'Nombre de A (opcional)',
  nameB: 'Nombre de B (opcional)',
  topicEyebrow: 'Tema de la canción',
  topicPlaceholder: '¿De qué va?',
  drawTopic: 'Tirar tema',
  start: 'Empezar los turnos',
  handoffEyebrow: 'Pasá el celular',
  handoff: (name: string) => `Pasale el teléfono a ${name}. NO le muestres el verso que recién escribiste.`,
  handoffReady: 'Ya tengo el celular',
  turnEyebrow: (index: number) => `Verso ${index} de ${G46_TURN_COUNT}`,
  turnAuthor: (label: string) => `Turno de ${label}`,
  previousEyebrow: 'Lo único que podés ver',
  noPrevious: 'No hay verso anterior: inventá el primero.',
  yourVerse: 'Tu verso',
  yourVersePlaceholder: 'Escribí un verso inspirado en el anterior…',
  confirmVerse: 'Guardar verso y pasar',
  revealEyebrow: 'Los doce versos',
  revealNote: 'Así quedó la cadena. Cada verso lleva la etiqueta de quien lo escribió.',
  sectionVerse: 'VERSO',
  sectionPreChorus: 'PRE-ESTRIBILLO',
  sectionChorus: 'ESTRIBILLO',
  structureNote: (sizes: readonly number[]) =>
    `Reparto: ${sizes[0]} de verso, ${sizes[1]} de pre-estribillo y ${sizes[2]} de estribillo.`,
  send: 'Llevar al cuaderno',
  privacy: 'Los nombres, el tema y los versos viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
