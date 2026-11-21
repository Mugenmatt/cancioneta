import type { PoolItem } from '@/core/types';

export const COMMON_TEXT = {
  sendToNotebook: 'Llevar al cuaderno',
  copy: 'Copiar',
  copied: 'Copiado',
  loading: 'Buscando…',
  searchingPrompt: 'Buscando una consigna…',
  fromHouse: 'De la casa',
  unknownArtist: 'Artista desconocido',
  noSuggestion: 'sin sugerencia',
  noWordsYet: 'Todavía no hay palabras.',
  stop: 'Detener',
  openImage: (title: string) => `Abrir ${title}`,
  openImageFallback: 'imagen',
  closeImage: 'Cerrar imagen',
  column: (index: number) => `Columna ${index + 1}`,
  sentence: (index: number) => `Frases ${index + 1}`,
  work: (index: number) => `Obra ${index + 1}`,
  phrase: (index: number) => `Frase ${index + 1}`,
  word: (index: number) => `Palabra ${index + 1}`,
  cardUndiscovered: (index: number) => `Carta ${index + 1} sin revelar`,
  plusOne: (value: number) => `${value + 1}`,
  countSingularOrPlural: (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`,
} as const;

export const LICENSE_LABELS: Record<PoolItem['license'], string> = {
  original: 'Original',
  public_domain: 'Dominio público',
  cc0: 'CC0',
  cc_by: 'CC BY',
  cc_by_sa: 'CC BY-SA',
  metadata_only: 'Solo metadatos',
  permission: 'Con permiso',
};

export function licenseLabel(license: PoolItem['license']): string {
  return LICENSE_LABELS[license] ?? license;
}
