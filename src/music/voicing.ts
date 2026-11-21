import type { Chord, Note } from './theory';
import { QUALITIES, pitchClass } from './theory';

export function midiForNote(note: Note, octave = 4): number {
  return 12 * (octave + 1) + pitchClass(note);
}

export function chordMidi(chord: Chord, octave = 3): number[] {
  const pc = pitchClass(chord.root);
  let root = 12 * (octave + 1) + pc;
  if (root > 12 * (octave + 1) + 6) root -= 12;
  const intervals = QUALITIES[chord.quality].intervals;
  return intervals.map((interval) => root + interval);
}

export function noteMidi(note: Note, octave = 4): number {
  return midiForNote(note, octave);
}
