import type { PoolItem } from '@/core/types';
import { createAssociationStimulus } from '@/games/runtime/associationStimulus';
import { ASSOCIATION_DEFAULT_KINDS } from '@/content/games/g01';
import { useStimulusStore } from '@/stores/stimulusStore';
import { useLyricsStore } from '@/stores/lyricsStore';

function word(index: number): PoolItem {
  return {
    id: `w${index}`,
    pool: 'words.noun',
    text: `palabra${index}`,
    lang: 'es',
    license: 'original',
    fingerprint: `fp${index}`,
  };
}

const columns = [
  Array.from({ length: 10 }, (_, index) => word(index)),
  Array.from({ length: 10 }, (_, index) => word(index + 10)),
  Array.from({ length: 10 }, (_, index) => word(index + 20)),
];

describe('G-01 stimulus panel', () => {
  beforeEach(() => {
    useStimulusStore.getState().clearStimulusPanel();
  });

  it('groups the 30 words by column and keeps them unique', () => {
    const summary = createAssociationStimulus(columns, ASSOCIATION_DEFAULT_KINDS);
    expect(summary.gameId).toBe('g01');
    expect(summary.items).toHaveLength(30);
    expect(new Set(summary.items).size).toBe(30);
    expect(summary.groups).toHaveLength(3);
    expect(summary.groups?.map((group) => group.items.length)).toEqual([10, 10, 10]);
    expect(summary.groups?.map((group) => group.title)).toEqual([
      'Columna 1 · Sustantivos',
      'Columna 2 · Verbos',
      'Columna 3 · Adjetivos',
    ]);
  });

  it('starts expanded, collapses, expands and clears', () => {
    const summary = createAssociationStimulus(columns, ASSOCIATION_DEFAULT_KINDS);
    useStimulusStore.getState().setStimulusPanel(summary);
    expect(useStimulusStore.getState().summary).toEqual(summary);
    expect(useStimulusStore.getState().collapsed).toBe(false);
    useStimulusStore.getState().toggleStimulusPanel();
    expect(useStimulusStore.getState().collapsed).toBe(true);
    useStimulusStore.getState().toggleStimulusPanel();
    expect(useStimulusStore.getState().collapsed).toBe(false);
    useStimulusStore.getState().clearStimulusPanel();
    expect(useStimulusStore.getState().summary).toBeNull();
  });

  it('never changes the lyrics or the exported text', () => {
    const lyrics = useLyricsStore.getState();
    const sectionsBefore = JSON.stringify(lyrics.sections);
    const exportBefore = lyrics.exportText(true);
    const summary = createAssociationStimulus(columns, ASSOCIATION_DEFAULT_KINDS);
    useStimulusStore.getState().setStimulusPanel(summary);
    useStimulusStore.getState().toggleStimulusPanel();
    expect(JSON.stringify(useLyricsStore.getState().sections)).toBe(sectionsBefore);
    expect(useLyricsStore.getState().exportText(true)).toBe(exportBefore);
    expect(useLyricsStore.getState().words()).toBe(0);
  });
});
