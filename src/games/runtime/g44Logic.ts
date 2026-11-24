import type { StimulusSummary } from '@/core/types';

export function badSongDeadline(minutes: number, now: number): number {
  return now + minutes * 60_000;
}

export interface BadSongStimulusInput {
  prompt: string;
  title: string;
  groupTitle: string;
  note: string;
}

export function makeBadSongStimulus(input: BadSongStimulusInput): StimulusSummary {
  return {
    gameId: 'g44',
    title: input.title,
    items: [input.prompt],
    groups: [{ title: input.groupTitle, items: [input.prompt] }],
    note: input.note,
  };
}
