export const G37_MIN_VERSES = 8;
export const G37_MAX_VERSES = 12;
export const G37_MORAL_VERSES = 2;

export const G37_TEXT = {
  intro: 'Un protagonista inesperado, un conflicto y una moraleja. Escribí la fábula en el cuaderno y cerrá con dos versos que den la enseñanza.',
  protagonistEyebrow: 'Protagonista (animal u objeto)',
  conflictEyebrow: 'Conflicto',
  anotherProtagonist: 'Otro protagonista',
  anotherConflict: 'Otro conflicto',
  loading: 'Buscando semilla…',
  versePlan: `Escribí entre ${G37_MIN_VERSES} y ${G37_MAX_VERSES} versos; cerrá con una moraleja de ${G37_MORAL_VERSES} versos.`,
  consigna: (protagonist: string, conflict: string) => `Fábula: ${protagonist}. Conflicto: ${conflict}. ${G37_TEXT.versePlan}`,
  editorTitle: (protagonist: string) => `Fábula: ${protagonist}`,
  groupBody: 'Cuerpo de la fábula (8 a 12 versos)',
  groupMoral: 'Moraleja (últimos 2 versos)',
  moralFirst: 'Primer verso de la moraleja',
  moralSecond: 'Segundo verso de la moraleja',
  editorNote: 'La moraleja queda marcada como bloque al final del panel. Escribí el cuerpo antes y no la adelantes.',
  send: 'Llevar al cuaderno',
  privacy: 'Los disparadores y la letra viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
