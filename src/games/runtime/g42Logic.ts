import type { StimulusSummary } from '@/core/types';
import { G42_FAVORITES, G42_TOTAL } from '@/content/games/g42';

export interface OpeningEntry {
  id: number;
  text: string;
  selected: boolean;
}

export function writtenOpenings(entries: readonly OpeningEntry[]): string[] {
  return entries.map((entry) => entry.text.trim()).filter(Boolean);
}

export function favoriteOpenings(entries: readonly OpeningEntry[]): string[] {
  return entries.filter((entry) => entry.selected && entry.text.trim()).map((entry) => entry.text.trim());
}

export function canGoToEditor(entries: readonly OpeningEntry[]): boolean {
  return writtenOpenings(entries).length === G42_TOTAL
    && favoriteOpenings(entries).length === G42_FAVORITES;
}

export interface OpeningsStimulusInput {
  theme: string;
  favorites: string[];
  title: string;
  groupTitles: { theme: string; favorites: string };
  note: string;
}

export function makeOpeningsStimulus(input: OpeningsStimulusInput): StimulusSummary {
  return {
    gameId: 'g42',
    title: input.title,
    items: input.favorites,
    groups: [
      { title: input.groupTitles.theme, items: [input.theme].filter(Boolean) },
      { title: input.groupTitles.favorites, items: input.favorites },
    ],
    note: input.note,
  };
}
