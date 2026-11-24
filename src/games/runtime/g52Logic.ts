import type { StimulusSummary } from '@/core/types';
import { G52_MAX_SECONDS, G52_MIN_SECONDS, G52_TEXT } from '@/content/games/g52';

export interface TranscriptFragment {
  id: string;
  text: string;
  selected: boolean;
}

export function isDurationInRange(seconds: number): boolean {
  return seconds >= G52_MIN_SECONDS && seconds <= G52_MAX_SECONDS;
}

export function splitFragments(text: string): TranscriptFragment[] {
  const matches = text.match(/[^.!?…]+(?:[.!?…]+|$)/gu) ?? [];
  return matches
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value, index) => ({ id: `fragment-${index}`, text: value, selected: false }));
}

export function toggleFragment(fragments: readonly TranscriptFragment[], id: string): TranscriptFragment[] {
  return fragments.map((fragment) =>
    fragment.id === id ? { ...fragment, selected: !fragment.selected } : fragment,
  );
}

export function selectedTexts(fragments: readonly TranscriptFragment[]): string[] {
  return fragments.filter((fragment) => fragment.selected).map((fragment) => fragment.text);
}

export interface FragmentShuffler {
  shuffle<T>(items: readonly T[]): T[];
}

export function mixFragments(items: readonly string[], shuffler: FragmentShuffler): string[] {
  return shuffler.shuffle(items);
}

export function makeG52Draft(items: readonly string[]): string {
  return items.join('\n');
}

export function makeG52Stimulus(literal: string, selected: readonly string[]): StimulusSummary {
  return {
    gameId: 'g52',
    title: G52_TEXT.editorTitle,
    items: [...selected],
    groups: [
      { title: G52_TEXT.transcriptEyebrow, items: [literal] },
      { title: G52_TEXT.fragmentEyebrow, items: [...selected] },
    ],
    note: G52_TEXT.transcriptNote,
  };
}
