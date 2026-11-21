import type { PoolId } from '@/core/types';

export type WordCategory = 'noun' | 'verb' | 'adj';

export const WORD_CATEGORIES: { id: WordCategory; label: string; pool: PoolId }[] = [
  { id: 'noun', label: 'Sustantivos', pool: 'words.noun' },
  { id: 'verb', label: 'Verbos', pool: 'words.verb' },
  { id: 'adj', label: 'Adjetivos', pool: 'words.adj' },
];

export const WORDS_TEXT = {
  revealIntro: 'Elegí cuántas palabras y qué categorías. Las cartas se dan vuelta de a una: no veas todo junto.',
  pinnedIntro: 'Cada palabra recibe una posición obligatoria dentro del verso: primera, intermedia o última.',
  revealOne: 'Revelar una',
  hide: 'Ocultar',
  anotherCombination: 'Otra combinación',
  revealCount: (count: number) => `${count}`,
  pinnedCount: (count: number) => `${count}`,
  revealCard: '•',
  pinnedBody: (word: string, position: string) => `${word} — ${position}`,
} as const;

export const CONTAR_MOSTRAR_PATTERNS = ['CCCM', 'MMMC', 'MCMC', 'CMCM', 'MCCC'] as const;

export const CONTAR_MOSTRAR_TEXT = {
  intro: 'Alterná ideas abstractas (C) e imágenes concretas (M). El patrón es una recomendación, no una regla.',
  promptEyebrow: 'Consigna',
  count: 'Contar',
  show: 'Mostrar',
  countExample: 'Aún te extraño.',
  showExample: 'Sentado en la cafetería, miro la puerta.',
  anotherPrompt: 'Otra consigna',
  body: (prompt: string, pattern: string) => `${prompt}\nPatrón elegido: ${pattern}\nC = contar (idea abstracta). M = mostrar (imagen concreta).`,
} as const;
