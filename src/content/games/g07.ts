export const INVISIBLE_WORDS_TEXT = {
  intro: 'Elegí cuatro palabras relacionadas con vos. Quedan visibles, pero no podés nombrarlas en el texto.',
  wordLabel: (index: number) => `Palabra ${index + 1}`,
  wordPlaceholder: 'Una palabra',
  alwaysVisible: 'Siempre visibles',
  emptyVisible: 'Todavía no elegiste palabras',
  anotherPrompt: 'Otra consigna',
  body: (prompt: string, words: readonly string[]) => `${prompt}\n\nPalabras invisibles: ${words.join(', ')}\nExpresalas sin nombrarlas.`,
} as const;
