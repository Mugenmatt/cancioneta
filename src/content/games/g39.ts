export const G39_RESOURCES = [
  { id: 'imagen', label: 'Imagen' },
  { id: 'sonido', label: 'Sonido' },
  { id: 'giro', label: 'Giro inesperado' },
  { id: 'emocion', label: 'Emoción' },
  { id: 'ritmo', label: 'Ritmo' },
] as const;

export type G39ResourceId = (typeof G39_RESOURCES)[number]['id'];

export const G39_TEXT = {
  intro: 'Trayé un verso que te gusta. No se guarda ni se busca en ningún lado: sirve solo para mirar cómo está hecho.',
  verseLabel: 'El verso que te gusta',
  versePlaceholder: 'Escribí acá un verso que recuerdes…',
  resourceTitle: '¿Qué te atrapa de ese verso?',
  consigna: (resource: string) => `Escribí un verso propio con el mismo recurso (${resource}), pero sobre otro tema.`,
  editorTitle: (resource: string) => `Verso disecado: ${resource}`,
  verseGroup: 'Verso que trajiste',
  resourceGroup: 'Recurso elegido',
  editorNote: 'No hace falta copiar el verso que trajiste: usá el recurso sobre otro tema. Este verso no se guarda en la app.',
  privacy: 'El verso que escribas acá vive solo en memoria: no se guarda ni se busca en ningún banco. Si cerrás la app, se pierde.',
  send: 'Llevar al cuaderno',
} as const;
