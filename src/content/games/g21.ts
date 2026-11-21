export const SEVENTH_TEXT = {
  intro: 'Escribí tu versión en el editor. La app lee los versos y te sugiere una palabra para reemplazar la séptima. Nunca modifica tu texto.',
  referenceEyebrow: 'Obra de referencia',
  searchWork: 'Buscar la obra',
  anotherWork: 'Otra obra',
  noLines: 'Todavía no hay versos en el editor.',
  shortLine: 'Verso corto: no hay séptima palabra.',
  seventh: (word: string) => `7ª: ${word}`,
  drawWords: 'Sortear palabras',
  note: 'Las sugerencias son solo una propuesta. Copiá o llevá la tabla al cuaderno; el editor no se toca.',
  linkErrorTitle: 'No se pudo abrir el enlace',
  linkErrorBody: 'Buscá la obra por su título y autor.',
  lineBody: (line: { text: string; words: string[] }, word: string | undefined) => word
    ? `${line.text}\nPalabra 7: ${line.words[6] ?? ''} → sugerencia: ${word}`
    : `${line.text}\n(verso corto)`,
} as const;
