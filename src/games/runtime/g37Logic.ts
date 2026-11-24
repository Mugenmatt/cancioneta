import type { StimulusSummary } from '@/core/types';

export interface FableSeeds {
  protagonist: string;
  conflict: string;
}

export function fableSummary(seeds: FableSeeds): string {
  return [seeds.protagonist, seeds.conflict].filter(Boolean).join(' — ');
}

export interface FableStimulusInput {
  seeds: FableSeeds;
  title: string;
  note: string;
  groupTitles: { body: string; moral: string };
  moralLines: readonly [string, string];
}

export function makeFableStimulus(input: FableStimulusInput): StimulusSummary {
  const { seeds } = input;
  return {
    gameId: 'g37',
    title: input.title,
    items: [seeds.protagonist, seeds.conflict, ...input.moralLines],
    groups: [
      { title: input.groupTitles.body, items: [seeds.protagonist, seeds.conflict] },
      { title: input.groupTitles.moral, items: [...input.moralLines] },
    ],
    note: input.note,
  };
}
