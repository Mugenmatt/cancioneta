import type { Chord, Note } from './theory';
import { QUALITIES, pitchClass } from './theory';

export function midiForNote(note: Note, octave = 4): number {
  return 12 * (octave + 1) + pitchClass(note);
}

const BASS_LOW = 36;
const UPPER_LOW = 48;
const UPPER_HIGH = 72;

function buildUpper(tones: number[]): number[] {
  const notes = [UPPER_LOW + tones[0]];
  for (let i = 1; i < tones.length; i += 1) {
    const step = (tones[i] - tones[i - 1] + 12) % 12 || 12;
    notes.push(notes[i - 1] + step);
  }
  return notes;
}

function upperCandidates(chord: Chord): number[][] {
  const pc = pitchClass(chord.root);
  const tones = QUALITIES[chord.quality].intervals.map((interval) => (pc + interval) % 12);
  const candidates: number[][] = [];
  for (let rotation = 0; rotation < tones.length; rotation += 1) {
    const ordered = tones.slice(rotation).concat(tones.slice(0, rotation));
    const notes = buildUpper(ordered);
    if (notes[notes.length - 1] <= UPPER_HIGH) candidates.push(notes);
  }
  if (candidates.length === 0) return [buildUpper(tones).map((note) => note - 12)];
  return candidates;
}

function movement(candidate: number[], previous: number[]): number {
  const shared = Math.min(candidate.length, previous.length);
  let total = Math.abs(candidate.length - previous.length) * 3;
  for (let i = 0; i < shared; i += 1) total += Math.abs(candidate[i] - previous[i]);
  return total;
}

function voiceChord(chord: Chord, previousUpper: number[] | null): number[] {
  const pc = pitchClass(chord.root);
  const candidates = upperCandidates(chord);
  const rootPosition = candidates.find((notes) => notes[0] === UPPER_LOW + pc) ?? candidates[0];
  const upper = previousUpper
    ? candidates.reduce((best, notes) => (movement(notes, previousUpper) < movement(best, previousUpper) ? notes : best), candidates[0])
    : rootPosition;
  return [BASS_LOW + pc, ...upper];
}

export function chordMidi(chord: Chord): number[] {
  return voiceChord(chord, null);
}

export function voicingForProgression(chords: readonly Chord[]): number[][] {
  let previousUpper: number[] | null = null;
  return chords.map((chord) => {
    const notes = voiceChord(chord, previousUpper);
    previousUpper = notes.slice(1);
    return notes;
  });
}

export function noteMidi(note: Note, octave = 4): number {
  return midiForNote(note, octave);
}
