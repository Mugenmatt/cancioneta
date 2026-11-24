import type { StimulusSummary } from '@/core/types';
import { G46_SECTION_SIZES, G46_TURN_COUNT, G46_TEXT } from '@/content/games/g46';

export type PlayerSlot = 0 | 1;

export interface DuoVerse {
  author: PlayerSlot;
  text: string;
}

export interface DuoSetup {
  nameA: string;
  nameB: string;
  topic: string;
}

export interface DuoSections {
  verse: string[];
  preChorus: string[];
  chorus: string[];
}

export function authorForTurn(turn: number): PlayerSlot {
  return turn % 2 === 0 ? 0 : 1;
}

export function authorLabel(name: string, slot: PlayerSlot): string {
  const fallback = slot === 0 ? 'Jugador 1' : 'Jugador 2';
  return `${slot === 0 ? 'A' : 'B'} · ${name.trim() || fallback}`;
}

export function setupLabel(setup: DuoSetup, slot: PlayerSlot): string {
  return authorLabel(slot === 0 ? setup.nameA : setup.nameB, slot);
}

export function previousVerse(verses: readonly DuoVerse[], turn: number): string {
  if (turn <= 0) return '';
  return verses[turn - 1]?.text.trim() ?? '';
}

export function labeledVerse(verse: DuoVerse, setup: DuoSetup): string {
  return `${setupLabel(setup, verse.author)}: ${verse.text.trim()}`;
}

export function canReveal(verses: readonly DuoVerse[]): boolean {
  return verses.length === G46_TURN_COUNT
    && verses.every((verse, index) => Boolean(verse.text.trim()) && verse.author === authorForTurn(index));
}

export function structuredVerses(verses: readonly DuoVerse[], setup: DuoSetup): DuoSections {
  const lines = verses.map((verse) => labeledVerse(verse, setup));
  let cursor = 0;
  const take = (count: number) => {
    const chunk = lines.slice(cursor, cursor + count);
    cursor += count;
    return chunk;
  };
  return {
    verse: take(G46_SECTION_SIZES.verse),
    preChorus: take(G46_SECTION_SIZES.preChorus),
    chorus: take(G46_SECTION_SIZES.chorus),
  };
}

export function assembledText(sections: DuoSections): string {
  return [
    G46_TEXT.sectionVerse,
    ...sections.verse,
    '',
    G46_TEXT.sectionPreChorus,
    ...sections.preChorus,
    '',
    G46_TEXT.sectionChorus,
    ...sections.chorus,
  ].join('\n');
}

export function makeDuoStimulus(setup: DuoSetup, sections: DuoSections): StimulusSummary {
  return {
    gameId: 'g46',
    title: `Dúo por turnos: ${setup.topic.trim() || G46_TEXT.topicPlaceholder}`,
    items: [...sections.verse, ...sections.preChorus, ...sections.chorus],
    groups: [
      { title: `${G46_TEXT.sectionVerse} (${G46_SECTION_SIZES.verse})`, items: sections.verse },
      { title: `${G46_TEXT.sectionPreChorus} (${G46_SECTION_SIZES.preChorus})`, items: sections.preChorus },
      { title: `${G46_TEXT.sectionChorus} (${G46_SECTION_SIZES.chorus})`, items: sections.chorus },
    ],
    note: G46_TEXT.revealNote,
  };
}
