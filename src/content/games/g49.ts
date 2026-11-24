export const G49_STANZA_COUNTS = [3, 4] as const;

export const G49_TEXT = {
  intro: 'Una frase corta queda fija durante todo el ejercicio. Escribí tres o cuatro estrofas que terminen con esa frase, pero con un sentido distinto cada vez.',
  phraseEyebrow: 'Frase fija',
  anotherPhrase: 'Otra frase',
  loading: 'Buscando frase…',
  countEyebrow: 'Cantidad de estrofas',
  countLabel: (count: number) => `${count} estrofas`,
  stanzaEyebrow: (index: number) => `Estrofa ${index + 1}`,
  stanzaPlaceholder: (index: number, phrase: string) => `Estrofa ${index + 1}… terminá con «${phrase}»`,
  writtenCount: (count: number, total: number) => `${count} de ${total} estrofas escritas`,
  editorTitle: (phrase: string) => `Refrán mutante: ${phrase}`,
  phraseGroup: 'Frase que vuelve',
  editorNote: 'Cada estrofa cierra con la misma frase. Cambiá lo que viene antes para que signifique otra cosa cada vez.',
  checkDone: 'La frase ya aparece en el cuaderno.',
  checkPending: 'La frase todavía no aparece en el cuaderno.',
  send: 'Llevar al cuaderno',
  privacy: 'La frase y las estrofas viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
