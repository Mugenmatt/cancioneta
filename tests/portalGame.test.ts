import { alliteratesWith, rhymesWith, suggestPortalWord } from '@/games/runtime/logic';

const rng = {
  int: () => 0,
  shuffle: <T,>(items: readonly T[]): T[] => [...items],
};

describe('Palabra Portal', () => {
  it('calcula rimas y aliteraciones sin depender de un pool fijo', () => {
    expect(rhymesWith('casa', 'masa')).toBe(true);
    expect(rhymesWith('casa', 'cielo')).toBe(false);
    expect(alliteratesWith('casa', 'camino')).toBe(true);
  });

  it('prioriza relaciones y nunca repite sugerencias', () => {
    const relations = {
      synonyms: ['sendero'],
      hypernyms: ['camino'],
      hyponyms: [],
      related: ['cabaña'],
    };
    const suggestion = suggestPortalWord(
      'bosque',
      ['sendero', 'camino', 'cabaña'],
      relations,
      ['lobo', 'hoja', 'bosque', 'oscuro'],
      rng,
    );
    expect(suggestion).toBe('lobo');
  });
});
