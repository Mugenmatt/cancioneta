export type SongsGameId = 'g08' | 'g09' | 'g10';

export const SONGS_TEXT: Record<SongsGameId, { intro: string; steps: readonly string[] }> = {
  g08: {
    intro: 'Escuchá una canción y escribí otra letra sobre el mismo tema. No vas a ver la letra original.',
    steps: [
      'Abrí el enlace y escuchá con atención.',
      'Anotá el tema, la emoción y una imagen que te quede.',
      'Escribí una letra nueva; no copies versos.',
    ],
  },
  g09: {
    intro: 'Usá la estructura de rimas y métrica como andamio y después transformala hasta que sea tuya.',
    steps: [
      'Escuchá la canción y marcá su estructura.',
      'Escribí respetando rima y métrica en un primer borrador.',
      'Cambiá la melodía y seguí transformando hasta que no quede rastro del original.',
    ],
  },
  g10: {
    intro: 'Buscá la letra por tu cuenta, invertí sus expresiones y quedate con las frases más raras.',
    steps: [
      'Escuchá la canción y abrí su letra en otra pestaña.',
      'Invertí una expresión: «acariciar lo áspero» puede volverse «golpear lo blando».',
      'Usá las inversiones que te sorprendan como disparadores.',
    ],
  },
};

export const SONGS_UI_TEXT = {
  songEyebrow: 'Canción',
  listen: 'Escuchar en YouTube',
  inversionTitle: 'Tus inversiones',
  originalExpression: 'Expresión de la canción',
  originalPlaceholder: 'Acariciando lo áspero',
  inversion: 'Tu inversión',
  inversionPlaceholder: 'Golpeando lo blando',
  addInversion: 'Agregar inversión',
  anotherSong: 'Otra canción',
  note: 'La letra original no se muestra ni se reproduce. El enlace necesita conexión.',
  bodySong: (title: string, author?: string, year?: number) => `${title} — ${author ?? 'Artista desconocido'}${year ? ` (${year})` : ''}`,
  bodyLink: (url: string) => `Escuchar: ${url}`,
  bodyInversion: (original: string, transformed: string) => `${original} → ${transformed}`,
  linkErrorTitle: 'No se pudo abrir el enlace',
  linkErrorBody: 'Buscá la canción por su título y artista.',
} as const;
