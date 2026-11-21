import {
  KEYS, QUALITIES, chordName, chordNotes, diatonicChords, formatNote,
  keyScaleNotes, parseNote, pitchClass, spellByDegree,
} from '@/music/theory';
import { detectKeys } from '@/music/keyDetector';
import { createChord } from '@/music/progressionDice';

describe('notas y acordes', () => {
  it('interpreta sostenidos y bemoles', () => {
    expect(pitchClass(parseNote('C♯'))).toBe(1);
    expect(pitchClass(parseNote('Db'))).toBe(1);
    expect(formatNote(spellByDegree(parseNote('A'), 4))).toBe('C♯');
    expect(formatNote(spellByDegree(parseNote('D'), 3))).toBe('F');
  });

  it('construye las tríadas con ortografía correcta', () => {
    expect(chordNotes(parseNote('C'), 'maj').map(formatNote)).toEqual(['C', 'E', 'G']);
    expect(chordNotes(parseNote('A'), 'maj').map(formatNote)).toEqual(['A', 'C♯', 'E']);
    expect(chordNotes(parseNote('B'), 'dim').map(formatNote)).toEqual(['B', 'D', 'F']);
    expect(chordNotes(parseNote('D'), 'm7').map(formatNote)).toEqual(['D', 'F', 'A', 'C']);
  });

  it('tiene las dieciocho calidades del motor', () => {
    expect(Object.keys(QUALITIES)).toHaveLength(18);
    expect(chordName(parseNote('E♭'), 'maj7')).toBe('E♭maj7');
    expect(chordName(parseNote('F♯'), 'm7b5')).toBe('F♯m7♭5');
  });

  it('genera 24 tonalidades con sus escalas', () => {
    expect(KEYS).toHaveLength(24);
    const cMajor = KEYS.find((key) => key.name === 'C mayor');
    expect(cMajor).toBeDefined();
    if (cMajor) expect(keyScaleNotes(cMajor).map(formatNote)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    const aMinor = KEYS.find((key) => key.name === 'A menor');
    expect(aMinor).toBeDefined();
    if (aMinor) expect(keyScaleNotes(aMinor).map(formatNote)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('reconoce los acordes diatónicos de una tonalidad', () => {
    const cMajor = KEYS.find((key) => key.name === 'C mayor');
    expect(cMajor).toBeDefined();
    if (!cMajor) return;
    const chords = diatonicChords(cMajor);
    expect(chords.map((entry) => entry.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    expect(chords.map((entry) => entry.quality)).toEqual(['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']);
  });
});

describe('detección de tonalidad', () => {
  it('reconoce una cadencia ii-V-I en Do mayor', () => {
    const chords = [
      createChord(parseNote('D'), 'min'),
      createChord(parseNote('G'), '7'),
      createChord(parseNote('C'), 'maj7'),
    ];
    const detection = detectKeys(chords);
    expect(detection.top?.key.name).toBe('C mayor');
    expect(detection.top?.compatibility).toBe('Alta');
  });

  it('marca ambigüedad entre relativa mayor y menor', () => {
    const chords = [
      createChord(parseNote('A'), 'min'),
      createChord(parseNote('F'), 'maj'),
      createChord(parseNote('C'), 'maj'),
      createChord(parseNote('G'), 'maj'),
    ];
    const detection = detectKeys(chords);
    const names = detection.candidates.map((entry) => entry.key.name);
    expect(names).toContain('C mayor');
    expect(names).toContain('A menor');
    expect(detection.ambiguous).toBe(true);
  });

  it('devuelve datos bajos con un solo acorde', () => {
    const detection = detectKeys([createChord(parseNote('C'), 'maj')]);
    expect(detection.lowData).toBe(true);
  });
});
