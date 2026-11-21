export const IMAGES_TEXT = {
  intro: 'Tres imágenes reales para entrar en una atmósfera. Podés mezclarlas al azar o buscar una relación temática.',
  random: 'Al azar',
  thematic: 'Con relación',
  change: 'Cambiar',
  close: 'Cerrar imagen',
  sourceNote: 'Imágenes reales con su crédito. Tocá una para verla en pantalla completa.',
  titleFallback: 'imagen',
  loading: 'Buscando imágenes…',
  open: (title: string) => `Abrir ${title}`,
  bodyLine: (item: { text: string; author?: string; attribution?: string }, license: string) => [
    item.text,
    item.author,
    item.attribution,
    license,
  ].filter(Boolean).join(' · '),
} as const;
