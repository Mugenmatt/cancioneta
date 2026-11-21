import { findLocalRhymes, normalizeRhymeWord, rhymeKeys, type RhymeKeys } from '@/core/rhyme';
import { dataService } from '@/services/data/DataService';

export type RhymeFilter = 'all' | 'consonant' | 'assonant';

export interface RhymeResults {
  query: string;
  consonants: string[];
  assonants: string[];
  online: boolean;
}

type FetchResponse = { ok: boolean; json: () => Promise<unknown> };
type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<FetchResponse>;

const API_BASE = 'https://api.datamuse.com/words';
const MAX_WORDS = 300;
const TIMEOUT_MS = 6000;
const POOLS = ['words.noun', 'words.verb', 'words.adj'] as const;

let lexicon: string[] | null = null;

function getLexiconWords(): string[] {
  if (!lexicon) {
    lexicon = POOLS.flatMap((pool) => dataService.getPool(pool).map((item) => item.text));
  }
  return lexicon;
}

function parseWords(payload: unknown): string[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const word = (entry as { word?: unknown }).word;
    return typeof word === 'string' ? [word.trim()] : [];
  });
}

function classify(words: readonly string[], target: RhymeKeys): { consonants: string[]; assonants: string[] } {
  const consonants: string[] = [];
  const assonants: string[] = [];
  for (const word of words) {
    if (!/^[a-zñ]+$/i.test(normalizeRhymeWord(word))) continue;
    const keys = rhymeKeys(word);
    if (!keys) continue;
    if (keys.consonant === target.consonant) consonants.push(word);
    else if (keys.assonant === target.assonant) assonants.push(word);
  }
  return { consonants, assonants };
}

async function fetchRemote(
  relation: 'rhy' | 'nry',
  query: string,
  fetchFn: FetchLike,
): Promise<{ words: string[]; ok: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const params = new URLSearchParams({ [`rel_${relation}`]: query, v: 'es', max: String(MAX_WORDS) });
    const response = await fetchFn(`${API_BASE}?${params.toString()}`, { signal: controller.signal });
    if (!response.ok) return { words: [], ok: false };
    return { words: parseWords(await response.json()), ok: true };
  } catch {
    return { words: [], ok: false };
  } finally {
    clearTimeout(timer);
  }
}

export class RhymeService {
  constructor(private readonly fetchFn: FetchLike = fetch) {}

  async search(query: string): Promise<RhymeResults> {
    const word = query.trim();
    const empty: RhymeResults = { query: word, consonants: [], assonants: [], online: false };
    const target = rhymeKeys(word);
    if (!target) return empty;

    const local = findLocalRhymes(word, getLexiconWords(), MAX_WORDS);
    const [perfect, near] = await Promise.all([
      fetchRemote('rhy', word, this.fetchFn),
      fetchRemote('nry', word, this.fetchFn),
    ]);
    const remotePerfect = classify(perfect.words, target);
    const remoteNear = classify(near.words, target);

    const seen = new Set<string>([normalizeRhymeWord(word)]);
    const merge = (lists: string[][]): string[] => {
      const merged: string[] = [];
      for (let index = 0; merged.length < MAX_WORDS && lists.some((list) => index < list.length); index += 1) {
        for (const list of lists) {
          const candidate = list[index];
          if (candidate === undefined) continue;
          const key = normalizeRhymeWord(candidate);
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(candidate);
        }
      }
      return merged;
    };

    const consonants = merge([remotePerfect.consonants, local.consonants, remoteNear.consonants]);
    const assonants = merge([remotePerfect.assonants, local.assonants, remoteNear.assonants]);

    return {
      query: word,
      consonants,
      assonants,
      online: perfect.ok || near.ok,
    };
  }
}

export function filterRhymes(results: RhymeResults, filter: RhymeFilter): string[] {
  if (filter === 'consonant') return results.consonants;
  if (filter === 'assonant') return results.assonants;

  const merged: string[] = [];
  for (let index = 0; merged.length < MAX_WORDS; index += 1) {
    const consonant = results.consonants[index];
    const assonant = results.assonants[index];
    if (consonant === undefined && assonant === undefined) break;
    if (consonant !== undefined) merged.push(consonant);
    if (assonant !== undefined && merged.length < MAX_WORDS) merged.push(assonant);
  }
  return merged;
}

export const rhymeService = new RhymeService();
