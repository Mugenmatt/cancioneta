import type { PoolItem, StimulusSummary } from '@/core/types';

export interface ContradictionMode {
  label: string;
  instruction: string;
}

export function modeFromItem(item: PoolItem): ContradictionMode {
  const instruction = item.extra?.instruction;
  return {
    label: item.text,
    instruction: typeof instruction === 'string' ? instruction : '',
  };
}

export function assembledLyrics(stanza: string, chorus: string): string {
  return [stanza.trim(), chorus.trim()].filter(Boolean).join('\n\n');
}

export interface TraitorStimulusInput {
  mode: ContradictionMode;
  stanza: string;
  chorus: string;
  title: string;
  groupTitles: { mode: string; stanza: string; chorus: string };
  note: string;
}

export function makeTraitorStimulus(input: TraitorStimulusInput): StimulusSummary {
  return {
    gameId: 'g56',
    title: input.title,
    items: [input.stanza.trim(), input.chorus.trim()].filter(Boolean),
    groups: [
      { title: input.groupTitles.mode, items: [input.mode.instruction].filter(Boolean) },
      { title: input.groupTitles.stanza, items: [input.stanza.trim()].filter(Boolean) },
      { title: input.groupTitles.chorus, items: [input.chorus.trim()].filter(Boolean) },
    ],
    note: input.note,
  };
}
