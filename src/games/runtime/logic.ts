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

const GRID_ALPHABET = 'aaaaabcdeeeefghiiijklmnoooopqrssttuuvy';

export function toGridUnits(value: string): string[] {
  const clean = normalizeWord(value).replace(/[^a-z]/g, '');
  const units: string[] = [];
  for (let index = 0; index < clean.length; index += 1) {
    if (clean[index] === 'q' && clean[index + 1] === 'u') {
      units.push('qu');
      index += 1;
    } else {
      units.push(clean[index] ?? '');
    }
  }
  return units.filter(Boolean);
}

export function chainWordKey(value: string): string {
  return normalizeWord(value).replace(/[^a-z]/g, '').replace(/qu/g, 'k');
}

export function wordPrefixes(words: Iterable<string>, maxLength: number): Set<string> {
  const prefixes = new Set<string>();
  for (const word of words) {
    for (let length = 1; length <= Math.min(maxLength, word.length); length += 1) {
      prefixes.add(word.slice(0, length));
    }
  }
  return prefixes;
}

export function findGridWords(
  grid: readonly (readonly string[])[],
  lexicon: ReadonlySet<string>,
  prefixes: ReadonlySet<string>,
): string[] {
  const found = new Set<string>();
  const size = grid.length;
  const visit = (row: number, col: number, units: string[], used: Set<string>) => {
    const next = [...units, grid[row]?.[col] ?? ''];
    const key = chainWordKey(next.join(''));
    if (key.length >= 3 && lexicon.has(key)) found.add(key);
    if (next.length >= size || !prefixes.has(key)) return;
    const nextUsed = new Set([...used, `${row}:${col}`]);
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || c < 0 || r >= size || c >= size || nextUsed.has(`${r}:${c}`)) continue;
        visit(r, c, next, nextUsed);
      }
    }
  };
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) visit(row, col, [], new Set());
  }
  return [...found];
}

export function buildLetterGrid(seedWords: readonly string[], size: number, rng: WordRng): string[][] {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
  const usable = seedWords
    .map((word) => toGridUnits(word))
    .filter((units) => units.length >= 3 && units.length <= size / 2);

  let row = 0;
  for (let index = 0; index + 1 < usable.length && row < size; index += 2) {
    const first = usable[index];
    const second = usable[index + 1];
    if (!first || !second) continue;
    const gap = size - first.length - second.length;
    const start = Math.max(0, Math.min(gap, rng.int(gap + 1)));
    first.forEach((letter, offset) => { grid[row][start + offset] = letter; });
    second.forEach((letter, offset) => { grid[row][start + first.length + offset] = letter; });
    row += 1;
  }

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) grid[r][c] = GRID_ALPHABET[rng.int(GRID_ALPHABET.length)];
    }
  }
  return grid;
}

export function isAdjacent(a: { row: number; col: number }, b: { row: number; col: number }): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr <= 1 && dc <= 1 && (dr !== 0 || dc !== 0);
}

export function pathWord(grid: readonly string[][], path: readonly { row: number; col: number }[]): string {
  return path.map((cell) => grid[cell.row]?.[cell.col] ?? '').join('');
}
