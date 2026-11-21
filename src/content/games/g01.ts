import type { PoolId } from '@/core/types';

export type AssociationKind = 'noun' | 'verb' | 'adj' | 'nounadj';

export const ASSOCIATION_KINDS: { id: AssociationKind; label: string; pools: PoolId[] }[] = [
  { id: 'noun', label: 'Sustantivos', pools: ['words.noun'] },
  { id: 'verb', label: 'Verbos', pools: ['words.verb'] },
  { id: 'adj', label: 'Adjetivos', pools: ['words.adj'] },
  { id: 'nounadj', label: 'Sustantivos + adjetivos', pools: ['words.noun', 'words.adj'] },
];

export const ASSOCIATION_DEFAULT_KINDS: AssociationKind[] = ['noun', 'verb', 'adj'];

export const ASSOCIATION_TEXT = {
  intro: 'Tres columnas de diez palabras. Ninguna se repite entre columnas. Tocá el título de una columna para cambiar su categoría.',
  regenerateAll: 'Regenerar todo',
  regenerateColumn: (index: number) => `Regenerar columna ${index + 1}`,
  changeCategory: (index: number) => `Cambiar categoría de la columna ${index + 1}`,
  fallbackKind: 'Palabras',
  total: (count: number) => `${count} palabras en total. «Llevar al cuaderno» las muestra plegadas en el cuaderno; no cambian la letra.`,
  body: (index: number, words: readonly string[]) => `Columna ${index + 1}: ${words.join(', ')}`,
  stimulusTitle: 'Asociación Libre',
  stimulusNote: 'Las 30 palabras del juego. Se pueden ocultar para ganar espacio.',
  stimulusSummary: (count: number) => `${count} palabras en 3 columnas`,
} as const;
