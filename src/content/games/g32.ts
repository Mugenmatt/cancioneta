export const ACROSTIC_TEXT = {
  intro: 'Elegí una palabra o frase. Cada letra abre un verso que empieza con esa letra, en orden.',
  targetLabel: 'Palabra o frase',
  targetPlaceholder: 'SOMBRA',
  randomWord: 'Palabra al azar',
  linePlaceholder: (letter: string) => `Verso que empieza con ${letter}…`,
  body: (letter: string, line: string) => `${letter}: ${line}`,
} as const;
