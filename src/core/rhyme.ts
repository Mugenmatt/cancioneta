const ACCENTED: Record<string, string> = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u',
};

const STRONG = new Set(['a', 'e', 'o', 'á', 'é', 'ó']);
const WEAK = new Set(['i', 'u', 'í', 'ú', 'ü']);
const WORD_PATTERN = /^[a-zñ]+$/i;

interface VowelGroup {
  start: number;
  end: number;
}

export interface RhymeKeys {
  consonant: string;
  assonant: string;
}

export interface LocalRhymes {
  consonants: string[];
  assonants: string[];
}

function isVowel(char: string): boolean {
  return STRONG.has(char) || WEAK.has(char);
}

function isAccentedWeak(char: string): boolean {
  return char === 'í' || char === 'ú';
}

function vowelGroups(chars: string[]): VowelGroup[] {
  const groups: VowelGroup[] = [];
  let index = 0;

  while (index < chars.length) {
    if (!isVowel(chars[index])) {
      index += 1;
      continue;
    }

    const runStart = index;
    while (index < chars.length && isVowel(chars[index])) index += 1;
    const runEnd = index - 1;
    let groupStart = runStart;

    for (let cursor = runStart + 1; cursor <= runEnd; cursor += 1) {
      const previous = chars[cursor - 1];
      const current = chars[cursor];
      const breaks = (STRONG.has(previous) && STRONG.has(current))
        || isAccentedWeak(previous) || isAccentedWeak(current);
      if (breaks) {
        groups.push({ start: groupStart, end: cursor - 1 });
        groupStart = cursor;
      }
    }
    groups.push({ start: groupStart, end: runEnd });
  }

  return groups;
}

export function normalizeRhymeWord(word: string): string {
  return Array.from(word.normalize('NFC').toLowerCase())
    .map((char) => ACCENTED[char] ?? char)
    .join('');
}

export function rhymeKeys(word: string): RhymeKeys | null {
  const original = word.normalize('NFC').toLowerCase().trim();
  if (!original) return null;

  const chars = Array.from(original);
  const groups = vowelGroups(chars);
  if (groups.length === 0) return null;

  const accentedIndex = chars.findIndex((char) => ACCENTED[char] !== undefined && char !== 'ü');
  let stressed: VowelGroup;
  if (accentedIndex >= 0) {
    stressed = groups.find((group) => accentedIndex >= group.start && accentedIndex <= group.end)
      ?? groups[groups.length - 1];
  } else {
    const last = chars[chars.length - 1];
    const llana = isVowel(last) || last === 'n' || last === 's';
    stressed = groups.length > 1 && llana ? groups[groups.length - 2] : groups[groups.length - 1];
  }

  const normalized = Array.from(normalizeRhymeWord(original));
  const tail = normalized.slice(stressed.start).join('');
  return {
    consonant: tail,
    assonant: Array.from(tail).filter(isVowel).join(''),
  };
}

export function findLocalRhymes(query: string, words: readonly string[], limit = 40): LocalRhymes {
  const target = rhymeKeys(query);
  if (!target) return { consonants: [], assonants: [] };

  const seen = new Set<string>([normalizeRhymeWord(query)]);
  const consonants: string[] = [];
  const assonants: string[] = [];

  for (const raw of words) {
    const word = raw.trim();
    const key = normalizeRhymeWord(word);
    if (!WORD_PATTERN.test(key) || seen.has(key) || word.length < 2) continue;
    const keys = rhymeKeys(word);
    if (!keys) continue;

    if (keys.consonant === target.consonant) {
      seen.add(key);
      if (consonants.length < limit) consonants.push(word);
    } else if (keys.assonant === target.assonant) {
      seen.add(key);
      if (assonants.length < limit) assonants.push(word);
    }
  }

  return { consonants, assonants };
}
