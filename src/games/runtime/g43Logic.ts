import type { StimulusSummary } from '@/core/types';

export function plainLines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

export interface StrangerStimulusInput {
  plain: string;
  title: string;
  groupTitle: string;
  note: string;
}

export function makeStrangerStimulus(input: StrangerStimulusInput): StimulusSummary {
  const lines = plainLines(input.plain);
  return {
    gameId: 'g43',
    title: input.title,
    items: lines,
    groups: [{ title: input.groupTitle, items: lines }],
    note: input.note,
  };
}
