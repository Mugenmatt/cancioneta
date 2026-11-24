export const G42_TOTAL = 10;
export const G42_FAVORITES = 3;

export const G42_TEXT = {
  intro: 'Diez aperturas. Cada una tiene que dejar una pregunta en quien escucha: algo que quiera saber después del primer verso.',
  criterion: 'Después del primer verso, alguien debería preguntarse «¿y ahora qué?».',
  themeTitle: 'Tema opcional',
  withoutTheme: 'Sin tema',
  withTheme: 'Tema al azar',
  themeEyebrow: 'Tema sorteado',
  anotherTheme: 'Otro tema',
  loading: 'Buscando tema…',
  openingsEyebrow: 'Diez primeros versos',
  openingPlaceholder: (index: number) => `Apertura ${index + 1}…`,
  openingsCount: (count: number) => `${count} de ${G42_TOTAL} aperturas escritas`,
  mark: (index: number) => `Marcar apertura ${index + 1} como favorita`,
  unmark: (index: number) => `Desmarcar apertura ${index + 1}`,
  favoritesEyebrow: 'Tres favoritas',
  favoritesCount: (count: number) => `${count} de ${G42_FAVORITES} marcadas`,
  editorTitle: (theme: string) => theme ? `Aperturas sobre ${theme}` : 'Diez primeros versos',
  themeGroup: 'Tema opcional',
  favoritesGroup: 'Aperturas favoritas',
  editorNote: 'Probá las tres aperturas marcadas como comienzo de la canción; cada una debe abrir una pregunta.',
  send: 'Llevar al cuaderno',
  privacy: 'Las aperturas y el tema viven solo en memoria. Si cerrás la app, se pierden.',
} as const;
