import type { PoolItem, StimulusSummary } from '@/core/types';
import { G50_SECTIONS, type EmotionSlot } from '@/content/games/g50';

export type EmotionSlots = Record<EmotionSlot, PoolItem | null>;

export function assignEmotions(items: readonly PoolItem[]): EmotionSlots {
  return {
    verse: items[0] ?? null,
    preChorus: items[1] ?? null,
    chorus: items[2] ?? null,
  };
}

export function replaceEmotion(current: EmotionSlots, slot: EmotionSlot, next: PoolItem): EmotionSlots {
  return { ...current, [slot]: next };
}

export function excludeForSlot(current: EmotionSlots, slot: EmotionSlot): Set<string> {
  const fingerprints = G50_SECTIONS
    .filter((section) => section.id !== slot)
    .map((section) => current[section.id]?.fingerprint)
    .filter((fingerprint): fingerprint is string => Boolean(fingerprint));
  return new Set(fingerprints);
}

export function emotionSummary(slots: EmotionSlots): string {
  return G50_SECTIONS
    .map((section) => `${section.label}: ${slots[section.id]?.text ?? ''}`)
    .filter((entry) => !entry.endsWith(': '))
    .join(' · ');
}

export interface EmotionStimulusInput {
  slots: EmotionSlots;
  title: string;
  note: string;
  groupTitle: (label: string) => string;
}

export function makeEmotionArcStimulus(input: EmotionStimulusInput): StimulusSummary {
  return {
    gameId: 'g50',
    title: input.title,
    items: G50_SECTIONS.map((section) => input.slots[section.id]?.text ?? ''),
    groups: G50_SECTIONS.map((section) => ({
      title: input.groupTitle(section.label),
      items: [input.slots[section.id]?.text ?? ''],
    })),
    note: input.note,
  };
}
