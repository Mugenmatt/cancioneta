export const CHAIN_TEXT = {
  intro: 'Conectá letras vecinas en horizontal, vertical o diagonal. Cada palabra válida queda en la lista.',
  letter: (value: string) => `Letra ${value}`,
  currentTitle: 'Palabra en curso',
  empty: '—',
  check: 'Comprobar',
  clear: 'Borrar',
  newGrid: 'Nueva grilla',
  foundTitle: 'Palabras encontradas',
  noWordsYet: 'Todavía no hay palabras.',
  minLetters: 'La palabra necesita al menos tres letras.',
  notInDictionary: (word: string) => `«${word}» no está en el diccionario local.`,
  duplicate: 'Ya encontraste esa palabra.',
  success: (word: string) => `¡${word}!`,
  guaranteedWords: (count: number) => `Esta grilla tiene al menos ${count} palabras posibles.`,
  notEnoughWords: (count: number) => `No se pudo garantizar ${count} palabras en esta grilla; tocá «Nueva grilla».`,
} as const;

export const CHAIN_RULES = {
  gridSize: 8,
  minimumWords: 20,
} as const;
