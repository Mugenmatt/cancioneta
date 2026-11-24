import type { StimulusSummary } from '@/core/types';
import { G35_SCHEMES, type RhymeScheme } from '@/content/games/g35';

export function schemeById(id: string | undefined): RhymeScheme | undefined {
  return G35_SCHEMES.find((scheme) => scheme.id === id);
}

export interface RhymeStimulusInput {
  scheme: RhymeScheme;
  title: string;
  note: string;
  groupTitles: { scheme: string; example: string };
}

export function makeRhymeStimulus(input: RhymeStimulusInput): StimulusSummary {
  return {
    gameId: 'g35',
    title: input.title,
    items: [input.scheme.pattern],
    groups: [
      { title: input.groupTitles.scheme, items: [input.scheme.pattern, input.scheme.hint] },
      { title: input.groupTitles.example, items: [...input.scheme.lines] },
    ],
    note: input.note,
  };
}
