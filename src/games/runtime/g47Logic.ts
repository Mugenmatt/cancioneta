import type { StimulusSummary } from '@/core/types';
import {
  G47_BPM, G47_RULES, G47_TEXT,
  type G47ModeId, type G47RuleId,
} from '@/content/games/g47';

export interface Pulse {
  label: string;
  kind: 'accent' | 'beat' | 'offbeat';
}

export interface MelodyDraft {
  rules: readonly G47RuleId[];
  note: string;
}

export interface OffbeatDraft {
  accentBeat: number;
  withOffbeats: boolean;
  phrase: string;
}

export interface SpeakSingDraft {
  phrase: string;
  notes: string;
}

export function accentBeatFromDraw(value: number): number {
  return Math.min(4, Math.max(1, value + 1));
}

export function pulsePattern(accentBeat: number, withOffbeats: boolean): Pulse[] {
  if (!withOffbeats) {
    return ['1', '2', '3', '4'].map((label, index) => ({
      label,
      kind: index + 1 === accentBeat ? 'accent' : 'beat',
    }));
  }
  return ['1', 'y', '2', 'y', '3', 'y', '4', 'y'].map((label, index) => {
    if (index % 2 === 1) return { label, kind: 'offbeat' };
    return { label, kind: index / 2 + 1 === accentBeat ? 'accent' : 'beat' };
  });
}

export function stepSeconds(withOffbeats: boolean): number {
  return (60 / G47_BPM) / (withOffbeats ? 2 : 1);
}

export function ruleTitles(ids: readonly G47RuleId[]): string[] {
  return G47_RULES.filter((rule) => ids.includes(rule.id)).map((rule) => rule.title);
}

export function twistedText(draft: MelodyDraft): string {
  return [
    G47_TEXT.modeTwisted,
    ...ruleTitles(draft.rules),
    draft.note.trim(),
  ].filter(Boolean).join('\n');
}

export function offbeatText(draft: OffbeatDraft): string {
  return [
    G47_TEXT.modeOffbeat,
    G47_TEXT.offbeat.accent(draft.accentBeat) + (draft.withOffbeats ? ` · ${G47_TEXT.offbeat.advanced}` : ''),
    draft.phrase.trim(),
  ].filter(Boolean).join('\n');
}

export function speakSingText(draft: SpeakSingDraft): string {
  return [
    G47_TEXT.modeSpeakSing,
    draft.phrase.trim(),
    G47_TEXT.speakSing.step3,
    draft.notes.trim(),
  ].filter(Boolean).join('\n');
}

export function makeStimulus(mode: G47ModeId, items: string[], note: string): StimulusSummary {
  const titles: Record<G47ModeId, string> = {
    twisted: G47_TEXT.modeTwisted,
    offbeat: G47_TEXT.modeOffbeat,
    speakSing: G47_TEXT.modeSpeakSing,
  };
  return { gameId: 'g47', title: titles[mode], items: items.filter(Boolean), note };
}
