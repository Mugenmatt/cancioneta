export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface Note {
  letter: Letter;
  accidental: number;
}

export type QualityId =
  | 'maj' | 'min' | 'dim' | 'aug' | 'sus2' | 'sus4' | 'maj7' | 'm7' | '7' | 'm7b5'
  | 'dim7' | '6' | 'm6' | 'add9' | 'maj9' | 'm9' | '9' | '7sus4';

export interface Chord {
  id: string;
  root: Note;
  quality: QualityId;
  locked: boolean;
}

export interface KeyState {
  key: Key | null;
  source: 'auto' | 'manual';
}

export interface Key {
  tonic: Note;
  mode: 'major' | 'minor';
  name: string;
}

export const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const LETTER_INDEX: Record<Letter, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const NATURAL_PC: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const QUALITIES: Record<QualityId, { symbol: string; intervals: number[]; label: string }> = {
  maj: { symbol: '', intervals: [0, 4, 7], label: 'mayor' },
  min: { symbol: 'm', intervals: [0, 3, 7], label: 'menor' },
  dim: { symbol: 'dim', intervals: [0, 3, 6], label: 'disminuido' },
  aug: { symbol: 'aug', intervals: [0, 4, 8], label: 'aumentado' },
  sus2: { symbol: 'sus2', intervals: [0, 2, 7], label: 'suspendido 2' },
  sus4: { symbol: 'sus4', intervals: [0, 5, 7], label: 'suspendido 4' },
  maj7: { symbol: 'maj7', intervals: [0, 4, 7, 11], label: 'mayor séptima' },
  m7: { symbol: 'm7', intervals: [0, 3, 7, 10], label: 'menor séptima' },
  '7': { symbol: '7', intervals: [0, 4, 7, 10], label: 'séptima' },
  m7b5: { symbol: 'm7♭5', intervals: [0, 3, 6, 10], label: 'semidisminuido' },
  dim7: { symbol: 'dim7', intervals: [0, 3, 6, 9], label: 'disminuido séptima' },
  '6': { symbol: '6', intervals: [0, 4, 7, 9], label: 'sexta' },
  m6: { symbol: 'm6', intervals: [0, 3, 7, 9], label: 'menor sexta' },
  add9: { symbol: 'add9', intervals: [0, 4, 7, 14], label: 'novena agregada' },
  maj9: { symbol: 'maj9', intervals: [0, 4, 7, 11, 14], label: 'mayor novena' },
  m9: { symbol: 'm9', intervals: [0, 3, 7, 10, 14], label: 'menor novena' },
  '9': { symbol: '9', intervals: [0, 4, 7, 10, 14], label: 'novena dominante' },
  '7sus4': { symbol: '7sus4', intervals: [0, 5, 7, 10], label: 'séptima suspendida' },
};

export const QUALITY_ORDER: QualityId[] = ['maj', 'min', '7', 'maj7', 'm7', 'sus2', 'sus4', 'dim', 'aug', '6', 'm6', 'add9', 'maj9', 'm9', '9', 'm7b5', 'dim7', '7sus4'];

const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

export function parseNote(value: string): Note {
  const trimmed = value.trim();
  const letter = trimmed[0]?.toUpperCase() as Letter;
  if (!LETTERS.includes(letter)) return { letter: 'C', accidental: 0 };
  const rest = trimmed.slice(1);
  let accidental = 0;
  for (const char of rest) {
    if (char === '#' || char === '♯') accidental += 1;
    else if (char === 'b' || char === '♭') accidental -= 1;
  }
  return { letter, accidental };
}

export function formatNote(note: Note): string {
  const suffix = note.accidental === 0 ? '' : note.accidental > 0
    ? '♯'.repeat(note.accidental)
    : '♭'.repeat(Math.abs(note.accidental));
  return `${note.letter}${suffix}`;
}

export function pitchClass(note: Note): number {
  return ((NATURAL_PC[note.letter] + note.accidental) % 12 + 12) % 12;
}

export function noteFromPitchClass(pc: number, prefer: 'sharp' | 'flat' = 'sharp'): Note {
  const name = (prefer === 'sharp' ? SHARP_NAMES : FLAT_NAMES)[((pc % 12) + 12) % 12];
  return parseNote(name);
}

export function spellByDegree(root: Note, semitones: number, degreeOverride?: number): Note {
  const degreeMap: Record<number, number> = {
    0: 1, 1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 5, 7: 5, 8: 6, 9: 6, 10: 7, 11: 7, 12: 8, 13: 9, 14: 9,
    15: 10, 16: 10, 17: 11, 18: 11, 19: 12, 20: 12, 21: 13, 22: 13, 23: 13, 24: 15,
  };
  const degree = degreeOverride ?? degreeMap[semitones] ?? 1;
  const targetIndex = (LETTER_INDEX[root.letter] + degree - 1) % 7;
  const targetLetter = LETTERS[targetIndex];
  const desired = ((pitchClass(root) + semitones) % 12 + 12) % 12;
  const natural = NATURAL_PC[targetLetter];
  let diff = (desired - natural + 12) % 12;
  if (diff > 6) diff -= 12;
  return { letter: targetLetter, accidental: diff };
}

const QUALITY_DEGREES: Record<QualityId, number[]> = {
  maj: [1, 3, 5],
  min: [1, 3, 5],
  dim: [1, 3, 5],
  aug: [1, 3, 5],
  sus2: [1, 2, 5],
  sus4: [1, 4, 5],
  maj7: [1, 3, 5, 7],
  m7: [1, 3, 5, 7],
  '7': [1, 3, 5, 7],
  m7b5: [1, 3, 5, 7],
  dim7: [1, 3, 5, 7],
  '6': [1, 3, 5, 6],
  m6: [1, 3, 5, 6],
  add9: [1, 3, 5, 9],
  maj9: [1, 3, 5, 7, 9],
  m9: [1, 3, 5, 7, 9],
  '9': [1, 3, 5, 7, 9],
  '7sus4': [1, 4, 5, 7],
};

export function chordNotes(root: Note, quality: QualityId): Note[] {
  return QUALITIES[quality].intervals.map((interval, index) => spellByDegree(root, interval, QUALITY_DEGREES[quality][index]));
}

export function chordPitchClasses(root: Note, quality: QualityId): number[] {
  return QUALITIES[quality].intervals.map((interval) => ((pitchClass(root) + interval) % 12 + 12) % 12);
}

export function chordName(root: Note, quality: QualityId): string {
  return `${formatNote(root)}${QUALITIES[quality].symbol}`;
}

export function chordNameSpoken(root: Note, quality: QualityId): string {
  return `${formatNote(root).replace('♯', ' sostenido').replace('♭', ' bemol')} ${QUALITIES[quality].label}`;
}

export function formatChord(chord: Chord): string {
  return chordName(chord.root, chord.quality);
}

export const KEYS: Key[] = (() => {
  const majors: [string, 'sharp' | 'flat'][] = [
    ['C', 'sharp'], ['D♭', 'flat'], ['D', 'sharp'], ['E♭', 'flat'], ['E', 'sharp'], ['F', 'flat'],
    ['F♯', 'sharp'], ['G', 'sharp'], ['A♭', 'flat'], ['A', 'sharp'], ['B♭', 'flat'], ['B', 'sharp'],
  ];
  const minors: [string, 'sharp' | 'flat'][] = [
    ['C', 'sharp'], ['C♯', 'sharp'], ['D', 'sharp'], ['E♭', 'flat'], ['E', 'sharp'], ['F', 'flat'],
    ['F♯', 'sharp'], ['G', 'sharp'], ['G♯', 'sharp'], ['A', 'flat'], ['B♭', 'flat'], ['B', 'sharp'],
  ];
  const list: Key[] = [];
  for (const [name] of majors) list.push({ tonic: parseNote(name), mode: 'major', name: `${name} mayor` });
  for (const [name] of minors) list.push({ tonic: parseNote(name), mode: 'minor', name: `${name} menor` });
  return list;
})();

export function keyScaleNotes(key: Key): Note[] {
  const intervals = key.mode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  return intervals.map((interval, index) => spellByDegree(key.tonic, interval, index + 1));
}

export function keyScalePcs(key: Key, includeHarmonic = false): number[] {
  const base = key.mode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const pcs = base.map((i) => (pitchClass(key.tonic) + i) % 12);
  if (includeHarmonic && key.mode === 'minor') {
    pcs.push((pitchClass(key.tonic) + 11) % 12);
  }
  return Array.from(new Set(pcs));
}

export interface DiatonicChord {
  degree: number;
  roman: string;
  root: Note;
  quality: QualityId;
  seventhQuality: QualityId;
}

const MAJOR_QUALITIES: QualityId[] = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const MAJOR_SEVENTHS: QualityId[] = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'];
const MAJOR_ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const MINOR_QUALITIES: QualityId[] = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
const MINOR_SEVENTHS: QualityId[] = ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'];
const MINOR_ROMAN = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

export function diatonicChords(key: Key): DiatonicChord[] {
  const scale = keyScaleNotes(key);
  const isMajor = key.mode === 'major';
  return scale.map((root, index) => ({
    degree: index + 1,
    roman: (isMajor ? MAJOR_ROMAN : MINOR_ROMAN)[index],
    root,
    quality: (isMajor ? MAJOR_QUALITIES : MINOR_QUALITIES)[index],
    seventhQuality: (isMajor ? MAJOR_SEVENTHS : MINOR_SEVENTHS)[index],
  }));
}

export function tonicOf(key: Key): Note {
  return key.tonic;
}

export function sameNote(a: Note, b: Note): boolean {
  return pitchClass(a) === pitchClass(b);
}

export function keyByName(name: string): Key | undefined {
  return KEYS.find((k) => k.name === name);
}

export function relativeKey(key: Key): Key {
  if (key.mode === 'major') {
    const target = parseNote(formatNote(spellByDegree(key.tonic, 9)));
    return { tonic: target, mode: 'minor', name: `${formatNote(target)} menor` };
  }
  const target = spellByDegree(key.tonic, 3);
  return { tonic: target, mode: 'major', name: `${formatNote(target)} mayor` };
}

export function parallelKey(key: Key): Key {
  return { tonic: key.tonic, mode: key.mode === 'major' ? 'minor' : 'major', name: `${formatNote(key.tonic)} ${key.mode === 'major' ? 'menor' : 'mayor'}` };
}
