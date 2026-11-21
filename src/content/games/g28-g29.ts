export interface CollageContent { atmosphere: string; words: string[]; }

export const COLLAGES: CollageContent[] = [
  { atmosphere: 'Melancolía', words: ['ventana', 'domingo', 'humo', 'último tren', 'nadie', 'llueve'] },
  { atmosphere: 'Fiesta', words: ['brindis', 'sudor', 'luces', 'todos', 'ruido', 'quedate'] },
  { atmosphere: 'Insomnio', words: ['3:14', 'heladera', 'mensaje', 'techo', 'silencio', 'otra vez'] },
  { atmosphere: 'Verano', words: ['vereda', 'helado', 'siesta', 'bicicleta', 'sol', 'después'] },
  { atmosphere: 'Miedo', words: ['pasillo', 'puerta', 'alguien', 'respiración', 'no', 'atrás'] },
  { atmosphere: 'Regreso', words: ['llave', 'barrio', 'madre', 'cambio', 'olor', 'todavía'] },
];

export const COLLAGE_SIZES = [34, 22, 27, 18, 31, 20] as const;

export const COLLAGE_TEXT = {
  intro: 'Una composición visual abre una atmósfera. No la interpretes: escribí lo que te deja.',
  anotherAtmosphere: 'Otra atmósfera',
  addWord: 'Sumar palabra',
  removeWord: 'Quitar palabra al azar',
  body: (atmosphere: string, words: readonly string[]) => `${atmosphere}\n${words.join('\n')}`,
} as const;

export const CUTUP_TEXT = {
  intro: 'Recortá un texto propio o de la casa, mezclá los fragmentos, bloqueá lo que te sirva y volvé a mirar.',
  houseMode: 'Texto de la casa',
  ownMode: 'Mi texto',
  searching: 'Buscando un texto…',
  anotherText: 'Otro texto',
  ownLabel: 'Tu texto',
  ownPlaceholder: 'Pegá un texto propio o autorizado…',
  cutAndShuffle: 'Recortar y mezclar',
  shuffleAgain: 'Volver a mezclar',
  moveUp: 'Subir fragmento',
  moveDown: 'Bajar fragmento',
  lock: 'Bloquear fragmento',
  unlock: 'Desbloquear fragmento',
} as const;
