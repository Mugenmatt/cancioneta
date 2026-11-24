export type EmotionSlot = 'verse' | 'preChorus' | 'chorus';

export interface EmotionSection {
  id: EmotionSlot;
  label: string;
  hint: string;
}

export const G50_SECTIONS: readonly EmotionSection[] = [
  { id: 'verse', label: 'Verso', hint: 'La emoción que abre la escena y la sostiene en los versos.' },
  { id: 'preChorus', label: 'Pre-estribillo', hint: 'La emoción que prepara el cambio antes del estribillo.' },
  { id: 'chorus', label: 'Estribillo', hint: 'La emoción que queda resonando en el centro de la canción.' },
];

export const G50_TEXT = {
  intro: 'Tres emociones distintas para tres bloques. Tirá el arco completo o cambiá solo una sin tocar las otras.',
  drawAll: 'Tirar las tres',
  another: (label: string) => `Otra emoción en ${label.toLowerCase()}`,
  loading: 'Buscando emoción…',
  consigna: (summary: string) => `Escribí la canción con este arco emocional: ${summary}.`,
  editorTitle: 'Arco emocional',
  group: (label: string) => `${label} — emoción asignada`,
  editorNote: 'Cada bloque del panel muestra la emoción de esa parte. Podés cambiar una en el Juego sin alterar las otras.',
  send: 'Llevar al cuaderno',
  privacy: 'Las emociones y la letra viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
