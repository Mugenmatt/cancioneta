import type { RandomSource } from '@/core/types';
import { createChord, MAX_CHORD_COUNT, progressionFingerprint, rollProgression } from '@/music/progressionDice';
import { KEYS, QUALITIES, parseNote } from '@/music/theory';

function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return {
    next,
    int(maxExclusive: number) {
      return Math.floor(next() * Math.max(1, maxExclusive));
    },
    shuffle<T>(items: readonly T[]): T[] {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}

const cMajor = KEYS.find((key) => key.name === 'C mayor');

describe('dados de progresión', () => {
  it('genera la cantidad pedida y cierra en tónica o dominante', () => {
    const result = rollProgression({
      count: 6,
      keyState: { key: null, source: 'auto' },
      sevenths: false,
      adventure: 20,
      random: seeded(9),
    });
    expect(result.chords).toHaveLength(6);
    expect(result.degrees).toHaveLength(6);
    expect([1, 5]).toContain(result.degrees[5]);
  });

  it('genera hasta 16 acordes y no pasa del máximo', () => {
    const result = rollProgression({
      count: 20,
      keyState: { key: null, source: 'auto' },
      sevenths: false,
      adventure: 20,
      random: seeded(21),
    });
    expect(result.chords).toHaveLength(MAX_CHORD_COUNT);
    expect(result.degrees).toHaveLength(MAX_CHORD_COUNT);
  });

  it('con séptimas activas mezcla triadas y séptimas', () => {
    let sawSeventh = false;
    for (let seed = 1; seed <= 20; seed += 1) {
      const result = rollProgression({
        count: 8,
        keyState: { key: null, source: 'auto' },
        sevenths: true,
        adventure: 20,
        random: seeded(seed),
      });
      const sizes = result.chords.map((chord) => QUALITIES[chord.quality].intervals.length);
      expect(sizes.some((size) => size === 3)).toBe(true);
      if (sizes.some((size) => size > 3)) sawSeventh = true;
    }
    expect(sawSeventh).toBe(true);
  });

  it('respeta los acordes bloqueados', () => {
    if (!cMajor) throw new Error('Falta C mayor');
    const locked = createChord(parseNote('F'), 'maj', true);
    const result = rollProgression({
      count: 4,
      keyState: { key: cMajor, source: 'manual' },
      sevenths: true,
      adventure: 40,
      current: [locked],
      random: seeded(13),
    });
    expect(result.chords[0].id).toBe(locked.id);
    expect(result.chords[0].locked).toBe(true);
    expect(result.key.name).toBe('C mayor');
  });

  it('infiere la tonalidad desde acordes bloqueados', () => {
    const current = [
      createChord(parseNote('D'), 'min', true),
      createChord(parseNote('G'), '7', true),
      createChord(parseNote('C'), 'maj7', true),
    ];
    const result = rollProgression({
      count: 6,
      keyState: { key: null, source: 'auto' },
      sevenths: false,
      adventure: 30,
      current,
      random: seeded(17),
    });
    expect(result.key.name).toBe('C mayor');
  });

  it('produce una huella estable', () => {
    const key = KEYS[0];
    const a = [createChord(parseNote('C'), 'maj'), createChord(parseNote('G'), 'maj')];
    const b = [createChord(parseNote('C'), 'maj'), createChord(parseNote('G'), 'maj')];
    expect(progressionFingerprint(key, a)).toBe(progressionFingerprint(key, b));
  });
});
