import type { RandomSource } from '@/core/types';
import type { Chord, Key, KeyState, QualityId } from './theory';
import { KEYS, chordName, diatonicChords, formatChord, pitchClass, keyScalePcs } from './theory';
import { detectKeys } from './keyDetector';

export interface RollOptions {
  count: number;
  keyState: KeyState;
  sevenths: boolean;
  adventure: number;
  current?: Chord[];
  random: RandomSource;
}

export interface RollResult {
  key: Key;
  keySource: 'auto' | 'manual';
  keyAmbiguous: boolean;
  chords: Chord[];
  degrees: (number | null)[];
}

const MAJOR_WEIGHTS: Record<number, number[]> = {
  1: [0, 1, 2, 3, 4, 2, 1],
  2: [1, 0, 2, 2, 5, 1, 1],
  3: [1, 2, 0, 4, 0, 3, 1],
  4: [3, 2, 0, 0, 5, 2, 1],
  5: [5, 1, 0, 2, 0, 3, 1],
  6: [1, 4, 0, 4, 3, 0, 1],
  7: [5, 0, 2, 0, 1, 2, 0],
};

const MINOR_WEIGHTS: Record<number, number[]> = {
  1: [0, 1, 0, 3, 2, 3, 3],
  2: [1, 0, 0, 0, 4, 1, 2],
  3: [1, 0, 0, 2, 0, 3, 3],
  4: [3, 1, 0, 0, 4, 1, 2],
  5: [4, 0, 0, 1, 0, 2, 2],
  6: [2, 1, 0, 2, 1, 0, 4],
  7: [3, 0, 4, 0, 1, 2, 0],
};

let chordCounter = 0;

export function nextChordId(): string {
  chordCounter += 1;
  return `ch_${chordCounter}`;
}

export function createChord(root: Chord['root'], quality: QualityId, locked = false, id = nextChordId()): Chord {
  return { id, root, quality, locked };
}

function indexOfKey(key: Key): number {
  return Math.max(0, KEYS.findIndex((k) => k.name === key.name));
}

function chooseKey(options: RollOptions): { key: Key; ambiguous: boolean } {
  if (options.keyState.key) return { key: options.keyState.key, ambiguous: false };
  const locked = (options.current ?? []).filter((c) => c.locked);
  if (locked.length >= 2) {
    const detection = detectKeys(locked);
    if (detection.top && detection.top.score >= 55) {
      return { key: detection.top.key, ambiguous: detection.ambiguous };
    }
  }
  const key = KEYS[options.random.int(KEYS.length)];
  return { key, ambiguous: false };
}

function degreeForPitch(rootPc: number, key: Key, diatonic: ReturnType<typeof diatonicChords>): number | null {
  const match = diatonic.find((d) => pitchClass(d.root) === rootPc);
  return match ? match.degree : null;
}

function weightedPick(weights: number[], random: RandomSource): number {
  const total = weights.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0) return random.int(weights.length);
  let ticket = random.next() * total;
  for (let i = 0; i < weights.length; i += 1) {
    ticket -= Math.max(0, weights[i]);
    if (ticket <= 0) return i;
  }
  return weights.length - 1;
}

function nextDegree(
  previous: number | null,
  previousPrevious: number | null,
  key: Key,
  adventure: number,
  random: RandomSource,
  isFirst: boolean,
): number {
  const table = key.mode === 'major' ? MAJOR_WEIGHTS : MINOR_WEIGHTS;
  const row = table[previous ?? 1] ?? table[1];
  let weights = row.map((value) => {
    const uniform = 1.6;
    const blended = value * (1 - adventure / 100) + uniform * (adventure / 100);
    return blended;
  });
  if (isFirst) weights = weights.map((value, i) => (i === 0 ? value + 3 : value));
  if (previous !== null) weights[previous - 1] = Math.max(0, weights[previous - 1] - 1.2);
  if (previous !== null && previousPrevious === previous) weights[previous - 1] = 0;
  const picked = weightedPick(weights, random) + 1;
  return picked;
}

export function progressionFingerprint(key: Key, chords: Chord[]): string {
  return `${key.name}|${chords.map((c) => formatChord(c)).join(',')}`.toLowerCase();
}

export function rollProgression(options: RollOptions): RollResult {
  const count = Math.max(1, Math.min(8, Math.round(options.count)));
  const { key, ambiguous } = chooseKey(options);
  const diatonic = diatonicChords(key);
  const current = options.current ?? [];
  const slots: Chord[] = [];
  const degrees: (number | null)[] = [];

  for (let i = 0; i < count; i += 1) {
    const existing = current[i];
    if (existing?.locked) {
      slots.push(existing);
      degrees.push(degreeForPitch(pitchClass(existing.root), key, diatonic));
    } else {
      slots.push(null as unknown as Chord);
      degrees.push(null);
    }
  }

  let previous: number | null = degrees.find((d) => d !== null) ?? null;
  let previousPrevious: number | null = null;

  for (let i = 0; i < count; i += 1) {
    if (slots[i]) {
      previousPrevious = previous;
      previous = degrees[i];
      continue;
    }
    const isLast = i === count - 1;
    let degree: number;
    if (isLast) {
      const cadence = options.random.next();
      degree = cadence < 0.7 ? 1 : 5;
      if (previous !== null && previousPrevious === previous && degree === previous) degree = 1;
    } else {
      degree = nextDegree(previous, previousPrevious, key, options.adventure, options.random, i === 0);
      let guard = 0;
      while (previousPrevious === previous && previous === degree && guard < 8) {
        degree = nextDegree(previous, previousPrevious, key, options.adventure, options.random, false);
        guard += 1;
      }
    }
    const degreeInfo = diatonic[degree - 1];
    const quality = options.sevenths ? degreeInfo.seventhQuality : degreeInfo.quality;
    slots[i] = createChord(degreeInfo.root, quality);
    degrees[i] = degree;
    previousPrevious = previous;
    previous = degree;
  }

  return {
    key,
    keySource: options.keyState.source,
    keyAmbiguous: ambiguous,
    chords: slots,
    degrees,
  };
}

export function describeDegree(key: Key, degree: number): string {
  const info = diatonicChords(key)[degree - 1];
  if (!info) return '';
  return `${info.roman} · ${chordName(info.root, info.seventhQuality)}`;
}

export function keySignatureStatus(key: Key): string {
  return `${key.name} · ${keyScalePcs(key).length} notas`;
}

export function randomKey(random: RandomSource): Key {
  return KEYS[random.int(KEYS.length)];
}

export function keyIndex(key: Key): number {
  return indexOfKey(key);
}
