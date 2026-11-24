import { G52_MAX_SECONDS, G52_MIN_SECONDS, G52_TEXT } from '@/content/games/g52';
import { gameThemes } from '@/design/themes';
import { gameById } from '@/games/registry';
import {
  isDurationInRange,
  makeG52Draft,
  makeG52Stimulus,
  mixFragments,
  selectedTexts,
  splitFragments,
  toggleFragment,
  type FragmentShuffler,
} from '@/games/runtime/g52Logic';

const literal = 'y no se ya la coso del mármol. Después vino el ruido. y otra vez lo mismo.';
const reverseShuffler: FragmentShuffler = {
  shuffle: <T,>(items: readonly T[]): T[] => [...items].reverse(),
};

describe('G-52 Transcripción torcida', () => {
  it('pide entre 30 y 60 segundos de grabación', () => {
    expect(G52_MIN_SECONDS).toBe(30);
    expect(G52_MAX_SECONDS).toBe(60);
    expect(isDurationInRange(29)).toBe(false);
    expect(isDurationInRange(30)).toBe(true);
    expect(isDurationInRange(60)).toBe(true);
    expect(isDurationInRange(61)).toBe(false);
  });

  it('separa la transcripción literal en fragmentos y permite marcarlos', () => {
    const fragments = splitFragments(literal);
    expect(fragments.map((fragment) => fragment.text)).toEqual([
      'y no se ya la coso del mármol.',
      'Después vino el ruido.',
      'y otra vez lo mismo.',
    ]);
    expect(fragments.every((fragment) => !fragment.selected)).toBe(true);

    const marked = toggleFragment(fragments, fragments[0].id);
    expect(marked[0].selected).toBe(true);
    expect(selectedTexts(marked)).toEqual(['y no se ya la coso del mármol.']);
    expect(selectedTexts(toggleFragment(marked, fragments[0].id))).toEqual([]);
  });

  it('mezcla los fragmentos marcados con el sistema de azar existente', () => {
    const items = ['uno', 'dos', 'tres'];
    expect(mixFragments(items, reverseShuffler)).toEqual(['tres', 'dos', 'uno']);
    expect(items).toEqual(['uno', 'dos', 'tres']);
    expect(makeG52Draft(['tres', 'dos', 'uno'])).toBe('tres\ndos\nuno');
  });

  it('mantiene la transcripción literal en el panel del editor', () => {
    const stimulus = makeG52Stimulus(literal, ['y no se ya la coso del mármol.']);
    expect(stimulus.gameId).toBe('g52');
    expect(stimulus.title).toBe(G52_TEXT.editorTitle);
    expect(stimulus.groups?.[0]).toEqual({ title: G52_TEXT.transcriptEyebrow, items: [literal] });
    expect(stimulus.groups?.[1].items).toEqual(['y no se ya la coso del mármol.']);
  });

  it('tiene ficha y tema propios', () => {
    expect(gameById('g52')?.name).toBe('Transcripción torcida');
    expect(gameById('g52')?.themeId).toBe('g52');
    expect(gameThemes.g52.id).toBe('g52');
  });
});
