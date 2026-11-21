import { realAdjectives, realInflections, realNouns, realVerbs } from '@/data/lexiconReal';

export interface WordRng {
  int(maxExclusive: number): number;
  shuffle<T>(items: readonly T[]): T[];
}

export interface ChainLexicon {
  byKey: ReadonlyMap<string, string>;
  keys: readonly string[];
  prefixes: ReadonlySet<string>;
}

export interface ChainGridResult {
  grid: string[][];
  count: number;
  guaranteed: boolean;
}

const SENTINEL = '\u0001';

export function chainNormalize(value: string): string {
  return value
    .replace(/ñ/gi, SENTINEL)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(SENTINEL)
    .join('ñ')
    .replace(/[^a-zñ]/g, '');
}

export function chainWordKey(value: string): string {
  return chainNormalize(value).replace(/qu/g, 'k');
}

export function toChainUnits(value: string): string[] {
  const clean = chainNormalize(value);
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

export function wordPrefixes(words: Iterable<string>, maxLength: number): Set<string> {
  const prefixes = new Set<string>();
  for (const word of words) {
    for (let length = 1; length <= Math.min(maxLength, word.length); length += 1) {
      prefixes.add(word.slice(0, length));
    }
  }
  return prefixes;
}

export function buildChainLexicon(maxLength: number): ChainLexicon {
  const byKey = new Map<string, string>();
  const forms = [...realInflections, ...realNouns, ...realVerbs, ...realAdjectives];
  for (const raw of forms) {
    const display = raw.trim();
    if (toChainUnits(display).length < 3) continue;
    const key = chainWordKey(display);
    if (key.length < 3) continue;
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, display);
      continue;
    }
    const prefersQu = key.includes('k') && display.includes('qu') && !current.includes('qu');
    const prefersEnye = key.includes('ñ') && display.includes('ñ') && !current.includes('ñ');
    if (prefersQu || prefersEnye) byKey.set(key, display);
  }
  const keys = [...byKey.keys()];
  return { byKey, keys, prefixes: wordPrefixes(keys, maxLength) };
}

interface WeightedUnit {
  unit: string;
  cumulative: number;
}

function buildFrequencyUnits(): { units: readonly WeightedUnit[]; total: number } {
  const counts = new Map<string, number>();
  for (const form of realInflections) {
    for (const unit of toChainUnits(form)) counts.set(unit, (counts.get(unit) ?? 0) + 1);
  }
  const sorted = [...counts.entries()]
    .filter(([unit]) => unit !== 'q')
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], 'es'));
  let cumulative = 0;
  const units = sorted.map(([unit, count]) => ({ unit, cumulative: (cumulative += count) }));
  return { units, total: cumulative };
}

const FREQUENCIES = buildFrequencyUnits();

function randomUnit(rng: WordRng): string {
  if (FREQUENCIES.total <= 0) return 'a';
  const pick = rng.int(FREQUENCIES.total);
  return FREQUENCIES.units.find((entry) => pick < entry.cumulative)?.unit ?? 'a';
}

export function buildLetterGrid(seedWords: readonly string[], size: number, rng: WordRng): string[][] {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
  const usable = seedWords
    .map((word) => toChainUnits(word))
    .filter((units) => units.length >= 3 && units.length <= size / 2);

  let row = 0;
  for (let index = 0; index + 1 < usable.length && row < size; index += 2) {
    const first = usable[index];
    const second = usable[index + 1];
    if (!first || !second) continue;
    const gap = size - first.length - second.length;
    const start = Math.max(0, Math.min(gap, rng.int(gap + 1)));
    first.forEach((unit, offset) => { grid[row][start + offset] = unit; });
    second.forEach((unit, offset) => { grid[row][start + first.length + offset] = unit; });
    row += 1;
  }

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) grid[r][c] = randomUnit(rng);
    }
  }
  return grid;
}

export function findGridWords(
  grid: readonly (readonly string[])[],
  lexicon: ReadonlyMap<string, string>,
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

export function generateChainGrid(
  lexicon: ChainLexicon,
  size: number,
  minimum: number,
  rng: WordRng,
  attempts = 20,
): ChainGridResult {
  const seeds = rng.shuffle(lexicon.keys)
    .map((key) => lexicon.byKey.get(key) ?? key)
    .filter((word) => {
      const units = toChainUnits(word);
      return units.length >= 3 && units.length <= size / 2;
    })
    .slice(0, minimum * 2);
  let best: ChainGridResult = { grid: [], count: 0, guaranteed: false };
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const grid = buildLetterGrid(rng.shuffle(seeds), size, rng);
    const count = findGridWords(grid, lexicon.byKey, lexicon.prefixes).length;
    if (count >= minimum) return { grid, count, guaranteed: true };
    if (count > best.count) best = { grid, count, guaranteed: false };
  }
  return best;
}

export function isChainAdjacent(a: { row: number; col: number }, b: { row: number; col: number }): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr <= 1 && dc <= 1 && (dr !== 0 || dc !== 0);
}

export function pathChainWord(grid: readonly (readonly string[])[], path: readonly { row: number; col: number }[]): string {
  return path.map((cell) => grid[cell.row]?.[cell.col] ?? '').join('');
}

export function trimChainPath(
  path: readonly { row: number; col: number }[],
  row: number,
  col: number,
): { row: number; col: number }[] {
  const index = path.findIndex((cell) => cell.row === row && cell.col === col);
  if (index < 0) return [...path];
  return path.slice(0, index);
}
