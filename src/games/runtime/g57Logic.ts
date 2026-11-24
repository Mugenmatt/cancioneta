import type { PoolItem, StimulusSummary } from '@/core/types';
import { G57_MIN_VERSES } from '@/content/games/g57';

export type Voice = 'A' | 'B';

export interface VoicePair {
  a: string;
  b: string;
}

export interface VoiceVerse {
  voice: Voice;
  text: string;
}

export function pairFromItem(item: PoolItem): VoicePair {
  const a = item.extra?.a;
  const b = item.extra?.b;
  return {
    a: typeof a === 'string' ? a : '',
    b: typeof b === 'string' ? b : '',
  };
}

export function initialVerses(): VoiceVerse[] {
  return Array.from({ length: G57_MIN_VERSES }, (_, index) => ({
    voice: index % 2 === 0 ? 'A' : 'B',
    text: '',
  }));
}

export function nextVoice(verses: readonly VoiceVerse[]): Voice {
  return verses.length % 2 === 0 ? 'A' : 'B';
}

export function writtenVerses(verses: readonly VoiceVerse[]): VoiceVerse[] {
  return verses.filter((verse) => verse.text.trim()).map((verse) => ({ ...verse, text: verse.text.trim() }));
}

export function canGoToEditor(verses: readonly VoiceVerse[]): boolean {
  return writtenVerses(verses).length >= G57_MIN_VERSES;
}

export function voiceLines(verses: readonly VoiceVerse[], voice: Voice): string[] {
  return writtenVerses(verses).filter((verse) => verse.voice === voice).map((verse) => verse.text);
}

export function assembledDialogue(verses: readonly VoiceVerse[]): string {
  return writtenVerses(verses).map((verse) => verse.text).join('\n');
}

export interface VoicesStimulusInput {
  pair: VoicePair;
  verses: readonly VoiceVerse[];
  title: string;
  groupTitles: { a: string; b: string; note: string };
  note: string;
}

export function makeVoicesStimulus(input: VoicesStimulusInput): StimulusSummary {
  return {
    gameId: 'g57',
    title: input.title,
    items: writtenVerses(input.verses).map((verse) => verse.text),
    groups: [
      { title: input.groupTitles.a, items: voiceLines(input.verses, 'A') },
      { title: input.groupTitles.b, items: voiceLines(input.verses, 'B') },
      { title: input.groupTitles.note, items: [input.note] },
    ],
    note: input.note,
  };
}
