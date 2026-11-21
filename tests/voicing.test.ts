import { createChord } from '@/music/progressionDice';
import { parseNote, pitchClass } from '@/music/theory';
import { chordMidi, voicingForProgression } from '@/music/voicing';

const progression = [
  createChord(parseNote('C'), 'maj'),
  createChord(parseNote('G'), 'maj'),
  createChord(parseNote('A'), 'min'),
  createChord(parseNote('F'), 'maj'),
];

function movement(voicings: number[][]): number {
  let total = 0;
  for (let i = 1; i < voicings.length; i += 1) {
    const previous = voicings[i - 1].slice(1);
    const current = voicings[i].slice(1);
    const shared = Math.min(previous.length, current.length);
    for (let j = 0; j < shared; j += 1) total += Math.abs(current[j] - previous[j]);
  }
  return total;
}

describe('voicing de acordes', () => {
  it('ubica la raíz en el registro grave y las voces entre C3 y C5', () => {
    voicingForProgression(progression).forEach((notes, index) => {
      expect(notes[0] % 12).toBe(pitchClass(progression[index].root));
      expect(notes[0]).toBeGreaterThanOrEqual(36);
      expect(notes[0]).toBeLessThanOrEqual(47);
      for (const note of notes.slice(1)) {
        expect(note).toBeGreaterThanOrEqual(48);
        expect(note).toBeLessThanOrEqual(72);
      }
    });
  });

  it('coordina las voces mejor que repetir la posición fundamental', () => {
    const led = voicingForProgression(progression);
    const naive = progression.map((chord) => chordMidi(chord));
    expect(movement(led)).toBeLessThanOrEqual(movement(naive));
  });

  it('mantiene el primer acorde igual a la vista previa', () => {
    expect(voicingForProgression(progression)[0]).toEqual(chordMidi(progression[0]));
  });
});
