import type { StimulusSummary } from '@/core/types';

export function assembleStanzas(values: readonly string[]): string {
  return values.map((value) => value.trim()).filter(Boolean).join('\n\n');
}

export function writtenStanzas(values: readonly string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

export interface MutantStimulusInput {
  phrase: string;
  title: string;
  groupTitle: string;
  note: string;
  doneLabel: string;
  pendingLabel: string;
}

export function makeMutantStimulus(input: MutantStimulusInput): StimulusSummary {
  return {
    gameId: 'g49',
    title: input.title,
    items: [input.phrase],
    groups: [{ title: input.groupTitle, items: [input.phrase] }],
    note: input.note,
    check: {
      target: input.phrase,
      doneLabel: input.doneLabel,
      pendingLabel: input.pendingLabel,
    },
  };
}
