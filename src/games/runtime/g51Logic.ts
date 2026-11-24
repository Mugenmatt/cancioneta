import type { StimulusSummary } from '@/core/types';
import {
  G51_FREE_MAX, G51_FREE_MIN, G51_MOLDS, G51_TEXT,
  type G51MoldId,
} from '@/content/games/g51';

const VOWELS = 'aeiouáéíóúü';
const STRONG = 'aeoáéó';
const ACCENTED_WEAK = 'íú';
const ACCENTED = 'áéíóú';

interface Nucleus {
  char: string;
  accented: boolean;
}

function normalizeLine(line: string): string {
  return line.toLowerCase().normalize('NFC')
    .replace(/[^a-záéíóúüñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isHiato(first: string, second: string): boolean {
  return (STRONG.includes(first) && STRONG.includes(second))
    || ACCENTED_WEAK.includes(first)
    || ACCENTED_WEAK.includes(second);
}

/** Diptongos y triptongos agrupan vocales; los hiatos separan núcleos. */
function nucleiInRun(run: string): Nucleus[] {
  if (!run) return [];
  const nuclei: Nucleus[] = [{ char: run[0], accented: ACCENTED.includes(run[0]) }];
  for (let i = 1; i < run.length; i += 1) {
    const char = run[i];
    if (isHiato(run[i - 1], char)) {
      nuclei.push({ char, accented: ACCENTED.includes(char) });
    } else if (ACCENTED.includes(char)) {
      nuclei[nuclei.length - 1].accented = true;
    }
  }
  return nuclei;
}

/** La h muda no suma sílaba y separa vocales (ahora = a-ho-ra). */
function wordNuclei(word: string): Nucleus[] {
  const nuclei: Nucleus[] = [];
  let run = '';
  const flush = () => {
    nuclei.push(...nucleiInRun(run));
    run = '';
  };
  for (const char of word) {
    if (char === 'h') {
      if (run) flush();
      continue;
    }
    if (VOWELS.includes(char)) {
      run += char;
      continue;
    }
    if (run) flush();
  }
  if (run) flush();
  return nuclei;
}

function endsInVowel(word: string): boolean {
  return word === 'y' || VOWELS.includes(word[word.length - 1] ?? '');
}

function startsInVowel(word: string): boolean {
  if (word === 'y') return true;
  const first = word[0] ?? '';
  if (VOWELS.includes(first)) return true;
  return first === 'h' && VOWELS.includes(word[1] ?? '');
}

function finalAccentAdjustment(word: string, nuclei: readonly Nucleus[]): number {
  if (!nuclei.length) return 0;
  const stressed = nuclei.findIndex((nucleus) => nucleus.accented) + 1;
  if (stressed > 0) {
    if (stressed === nuclei.length) return 1;
    if (stressed === nuclei.length - 2) return -1;
    return 0;
  }
  return /[bcdfgjklmnñpqrstvwxyz]$/.test(word) ? 1 : 0;
}

/** Cuenta probable de sílabas métricas; la interfaz la muestra siempre como aproximada. */
export function countSyllables(line: string): number {
  const words = normalizeLine(line).split(' ').filter(Boolean);
  if (!words.length) return 0;
  let count = words.reduce((total, word) => total + wordNuclei(word).length, 0);
  for (let i = 0; i < words.length - 1; i += 1) {
    if (endsInVowel(words[i]) && startsInVowel(words[i + 1])) count -= 1;
  }
  count += finalAccentAdjustment(words[words.length - 1], wordNuclei(words[words.length - 1]));
  return Math.max(0, count);
}

export function moldLengths(id: G51MoldId, freeLimit: number): number[] | null {
  const mold = G51_MOLDS.find((item) => item.id === id);
  if (!mold || mold.lengths === null) {
    return Array.from({ length: 4 }, () => clampFreeLimit(freeLimit));
  }
  return [...mold.lengths];
}

export function clampFreeLimit(value: number): number {
  return Math.min(G51_FREE_MAX, Math.max(G51_FREE_MIN, Math.round(value)));
}

export type LineStatus = 'match' | 'mismatch' | 'overLimit';

export function lineStatus(count: number, expected: number | null, manual: number | null, limit: number): LineStatus {
  const value = manual ?? count;
  if (expected === null) return value > limit ? 'overLimit' : 'match';
  return value === expected ? 'match' : 'mismatch';
}

export function resolvedCount(count: number, manual: number | null): number {
  return manual ?? count;
}

export function assembledText(lines: readonly string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join('\n');
}

export function makeStimulus(
  moldLabel: string,
  lines: readonly string[],
  counts: readonly number[],
): StimulusSummary {
  return {
    gameId: 'g51',
    title: G51_TEXT.moldEyebrow + ': ' + moldLabel,
    items: lines
      .map((line, index) => ({ text: line.trim(), count: counts[index] }))
      .filter((item) => item.text)
      .map((item) => `${item.count} · ${item.text}`),
    note: G51_TEXT.editorNote,
  };
}
