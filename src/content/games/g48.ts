export const G48_MIN_VERSES = 4;
export const G48_MAX_VERSES = 6;

export interface Shot {
  id: string;
  label: string;
  hint: string;
}

export const G48_SHOTS: readonly Shot[] = [
  { id: 'panoramica', label: 'Panorámica', hint: 'Abrí la escena: mirá el conjunto desde lejos.' },
  { id: 'general', label: 'Plano general', hint: 'Mostrá al personaje entero dentro de su ambiente.' },
  { id: 'medio', label: 'Plano medio', hint: 'Recortá a la cintura: cuerpo y gesto a la vez.' },
  { id: 'primer', label: 'Primer plano', hint: 'Acercate al rostro: una emoción concreta.' },
  { id: 'detalle', label: 'Plano detalle', hint: 'Aislá un objeto chico: textura, luz o marca.' },
  { id: 'subjetiva', label: 'Mirada subjetiva', hint: 'Contá lo que ve quien habla, sin nombrarlo.' },
];

export const G48_TEXT = {
  intro: 'Elegí entre 4 y 6 versos. La app asigna un plano cinematográfico a cada uno, en orden o al azar, y los etiqueta en el cuaderno.',
  countEyebrow: 'Cantidad de versos',
  countLabel: (count: number) => `${count} versos`,
  orderEyebrow: 'Orden de los planos',
  orderedLabel: 'En orden',
  randomLabel: 'Al azar',
  reshuffle: 'Otra vez al azar',
  sceneLabel: 'Lugar o escena inicial (opcional)',
  scenePlaceholder: 'Un patio, una estación, una cocina…',
  consigna: (count: number, orderLabel: string, scene: string) =>
    `Escribí ${count} versos, un plano por verso (${orderLabel.toLowerCase()}).${scene ? ` Escena inicial: ${scene}.` : ''}`,
  editorTitle: (count: number) => `Plano a plano: ${count} versos`,
  groupScene: 'Lugar o escena inicial',
  verseGroup: (index: number, label: string) => `Verso ${index + 1} — ${label}`,
  editorNote: 'Cada verso tiene su etiqueta de plano en el panel. Seguí el orden aunque cambies de estrofa.',
  send: 'Llevar al cuaderno',
  privacy: 'Los planos, la escena y la letra viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
