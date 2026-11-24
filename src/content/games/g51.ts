export const G51_FREE_DEFAULT = 12;
export const G51_FREE_MIN = 6;
export const G51_FREE_MAX = 16;

export const G51_MOLDS = [
  { id: '8-8-8-8', label: '8 — 8 — 8 — 8', lengths: [8, 8, 8, 8] },
  { id: '8-8-8-6', label: '8 — 8 — 8 — 6', lengths: [8, 8, 8, 6] },
  { id: '7-7-7-7', label: '7 — 7 — 7 — 7', lengths: [7, 7, 7, 7] },
  { id: '11-11-11-11', label: '11 — 11 — 11 — 11', lengths: [11, 11, 11, 11] },
  { id: '10-6-10-6', label: '10 — 6 — 10 — 6', lengths: [10, 6, 10, 6] },
  { id: 'free', label: 'Libre con tope', lengths: null },
] as const;

export type G51MoldId = (typeof G51_MOLDS)[number]['id'];

/** Veinte versos originales de Cancioneta para validar la heurística. */
export const G51_EXAMPLES: readonly string[] = [
  'Bajo el puente canta el río',
  'Tu voz queda en la escalera',
  'Amaneció sin avisar',
  'La calle guarda tu nombre',
  'Me acuerdo de aquel invierno',
  'Se nos fue la luz de a poco',
  'Cantá aunque no sepas cómo',
  'Hay un diario en la cocina',
  'Cayeron tres hojas al patio',
  'Nadie dice lo que piensa',
  'Yo te espero en la esquina',
  'El mate espera en la mesa',
  'No me hables de mañana',
  'Se me escapa una palabra',
  'Vos sabés por qué me quedo',
  'La ciudad respira hondo',
  'Traigo el frío en los bolsillos',
  'Ahora sí que me voy lejos',
  'Un perro duerme en el umbral',
  'Siempre vuelvo por la misma calle',
];

export const G51_TEXT = {
  intro: 'Elegí un molde y escribí cuatro versos. El contador es aproximado: mirá cada verso, corregí el número a mano si hace falta y usá el color como guía.',
  moldEyebrow: 'Molde silábico',
  freeLimit: (limit: number) => `Libre con tope de ${limit} sílabas por verso`,
  lessLimit: 'Bajar tope',
  moreLimit: 'Subir tope',
  verseEyebrow: (index: number) => `Verso ${index}`,
  approximate: 'Aproximado',
  correction: 'Corregir número',
  correctionLabel: (index: number) => `Corrección manual del verso ${index}`,
  counted: (count: number, expected: number | null) =>
    expected === null ? `${count} sílabas` : `${count} de ${expected} sílabas`,
  manual: (value: number) => `${value} (corregido)`,
  matches: 'Coincide',
  mismatch: 'No coincide',
  overLimit: 'Pasó el tope',
  resetCorrections: 'Volver al conteo aproximado',
  send: 'Llevar al cuaderno',
  privacy: 'Los versos viven solo en memoria. Si cerrás la app, se pierden.',
  editorNote: 'Cuatro versos con métrica guiada. El conteo es aproximado y puede haberse corregido a mano.',
} as const;
