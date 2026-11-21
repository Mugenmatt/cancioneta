import type { PoolItem } from '@/core/types';

export interface WordRng {
  int(maxExclusive: number): number;
  shuffle<T>(items: readonly T[]): T[];
}

export interface PositionedWord {
  word: string;
  position: 'primera' | 'intermedia' | 'última';
}

export function uniquePoolItems(items: readonly PoolItem[]): PoolItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.fingerprint)) return false;
    seen.add(item.fingerprint);
    return true;
  });
}

export function takeUniqueWords(
  pools: readonly (readonly PoolItem[])[],
  groupSet: ReadonlySet<string>,
  rng: WordRng,
  count: number,
): PoolItem[] {
  const available = pools.flat().filter((item) => !groupSet.has(item.fingerprint));
  return rng.shuffle(uniquePoolItems(available)).slice(0, count);
}

export function otherColumnsFingerprints(columns: readonly (readonly PoolItem[])[], index: number): Set<string> {
  return new Set(columns.flatMap((column, i) => (i === index ? [] : column.map((item) => item.fingerprint))));
}

export function replaceColumn(
  columns: readonly (readonly PoolItem[])[],
  index: number,
  items: readonly PoolItem[],
): PoolItem[][] {
  return columns.map((column, i) => (i === index ? [...items] : [...column]));
}

export interface PortalRelations {
  synonyms: readonly string[];
  hypernyms: readonly string[];
  hyponyms: readonly string[];
  related: readonly string[];
}

function uniqueWords(words: readonly string[]): string[] {
  const seen = new Set<string>();
  return words.filter((word) => {
    const key = normalizeWord(word);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function rhymesWith(first: string, second: string): boolean {
  const a = normalizeWord(first);
  const b = normalizeWord(second);
  if (a.length < 3 || b.length < 3) return false;
  return a.slice(-2) === b.slice(-2);
}

export function alliteratesWith(first: string, second: string): boolean {
  const a = normalizeWord(first);
  const b = normalizeWord(second);
  return Boolean(a && b && a[0] === b[0]);
}

export function suggestPortalWord(
  seed: string,
  used: readonly string[],
  relations: PortalRelations | undefined,
  available: readonly string[],
  rng: WordRng,
): string | undefined {
  const blocked = new Set([seed, ...used].map(normalizeWord));
  const semantic = relations
    ? [...relations.synonyms, ...relations.hypernyms, ...relations.hyponyms, ...relations.related]
    : [];
  const rhymes = available.filter((word) => rhymesWith(word, seed) && !semantic.includes(word));
  const alliterations = available.filter((word) => alliteratesWith(word, seed) && !semantic.includes(word));
  const candidates = uniqueWords([...semantic, ...rhymes, ...alliterations, ...available])
    .filter((word) => !blocked.has(normalizeWord(word)));
  return rng.shuffle(candidates)[0];
}

export function wordsOf(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function normalizeWord(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .toLowerCase();
}

export function acrosticLetters(value: string): string[] {
  return value
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toUpperCase()
    .split('');
}

export function braidPhrases(phrases: readonly string[], order: readonly number[]): string {
  const lists = phrases.map(wordsOf);
  const longest = Math.max(0, ...lists.map((list) => list.length));
  const words: string[] = [];
  for (let index = 0; index < longest; index += 1) {
    for (const phraseIndex of order) {
      const word = lists[phraseIndex]?.[index];
      if (word) words.push(word);
    }
  }
  return words.join(' ');
}

export function cutUpFragments(text: string, chunkSize = 4): string[] {
  const clean = text.trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?;]+[.!?;]?/g) ?? [clean];
  const fragments: string[] = [];
  for (const sentence of sentences) {
    const words = wordsOf(sentence);
    for (let index = 0; index < words.length; index += chunkSize) {
      fragments.push(words.slice(index, index + chunkSize).join(' '));
    }
  }
  return fragments.filter(Boolean);
}

export function assignPositions(words: readonly string[], rng: WordRng): PositionedWord[] {
  const positions: PositionedWord['position'][] = ['primera', 'intermedia', 'última'];
  return words.map((word) => ({ word, position: positions[rng.int(positions.length)] }));
}
