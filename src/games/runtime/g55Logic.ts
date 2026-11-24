import type { StimulusSummary } from '@/core/types';

export function normalOrder(finalVerse: string, previous: readonly string[]): string[] {
  const earlier = previous.map((value) => value.trim()).filter(Boolean).reverse();
  const last = finalVerse.trim();
  return last ? [...earlier, last] : earlier;
}

export function canGoToEditor(finalVerse: string, previous: readonly string[]): boolean {
  return Boolean(finalVerse.trim()) && previous.some((value) => value.trim());
}

export interface BackwardsStimulusInput {
  theme: string;
  finalVerse: string;
  previous: readonly string[];
  title: string;
  groupTitles: { theme: string; finalVerse: string; previous: string };
  note: string;
}

export function makeBackwardsStimulus(input: BackwardsStimulusInput): StimulusSummary {
  const ordered = normalOrder(input.finalVerse, input.previous);
  return {
    gameId: 'g55',
    title: input.title,
    items: ordered,
    groups: [
      { title: input.groupTitles.theme, items: [input.theme].filter(Boolean) },
      { title: input.groupTitles.finalVerse, items: [input.finalVerse.trim()].filter(Boolean) },
      { title: input.groupTitles.previous, items: ordered.slice(0, -1) },
    ],
    note: input.note,
  };
}
