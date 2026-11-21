export const INVISIBLE_WORDS_TEXT = {
  intro: 'La app te da cuatro palabras. Quedan visibles, pero no podés nombrarlas en el texto.',
  wordLabel: (index: number) => `Palabra ${index + 1}`,
  regenerateWord: (index: number) => `Cambiar palabra ${index + 1}`,
  regenerateAll: 'Cambiar las 4 palabras',
  alwaysVisible: 'Siempre visibles',
  emptyVisible: 'Buscando palabras…',
  anotherPrompt: 'Otra consigna',
  body: (prompt: string, words: readonly string[]) => `${prompt}\n\nPalabras invisibles: ${words.join(', ')}\nExpresalas sin nombrarlas.`,
} as const;
