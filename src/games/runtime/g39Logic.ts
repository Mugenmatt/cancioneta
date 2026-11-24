import type { StimulusSummary } from '@/core/types';

export interface DissectionStimulusInput {
  verse: string;
  resourceLabel: string;
  title: string;
  groupTitles: { verse: string; resource: string };
  note: string;
}

export function cleanVerse(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function makeDissectionStimulus(input: DissectionStimulusInput): StimulusSummary {
  const verse = cleanVerse(input.verse);
  return {
    gameId: 'g39',
    title: input.title,
    items: [verse, input.resourceLabel],
    groups: [
      { title: input.groupTitles.verse, items: [verse] },
      { title: input.groupTitles.resource, items: [input.resourceLabel] },
    ],
    note: input.note,
  };
}
