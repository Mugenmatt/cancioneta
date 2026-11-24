import {
  G51_EXAMPLES, G51_FREE_DEFAULT, G51_FREE_MAX, G51_FREE_MIN,
  G51_MOLDS, G51_TEXT,
} from '@/content/games/g51';
import { GAME_INTROS } from '@/content/gameIntros';
import { gameThemes } from '@/design/themes';
import { gameById } from '@/games/registry';
import {
  assembledText, clampFreeLimit, countSyllables, lineStatus, makeStimulus,
  moldLengths, resolvedCount,
} from '@/games/runtime/g51Logic';

describe('G-51 Métrica fija', () => {
  it('reconoce diptongos, hiatos, sinalefa y h muda', () => {
    expect(countSyllables('río')).toBe(2);
    expect(countSyllables('puente')).toBe(2);
    expect(countSyllables('viaje')).toBe(2);
    expect(countSyllables('ahora')).toBe(3);
    expect(countSyllables('de ahora')).toBe(3);
    expect(countSyllables('¡Hola!')).toBe(2);
    expect(countSyllables('')).toBe(0);
  });

  it('aplica la ley del acento final', () => {
    expect(countSyllables('cantar')).toBe(3);
    expect(countSyllables('casa')).toBe(2);
    expect(countSyllables('esdrújula')).toBe(3);
    expect(countSyllables('mañana')).toBe(3);
  });

  it('cuenta los veinte versos originales de ejemplo', () => {
    const expected = [8, 8, 9, 8, 8, 8, 8, 8, 9, 8, 7, 8, 7, 8, 8, 7, 9, 10, 9, 10];
    expect(G51_EXAMPLES).toHaveLength(20);
    expect(G51_EXAMPLES.map(countSyllables)).toEqual(expected);
  });

  it('ofrece seis moldes y un tope libre acotado', () => {
    expect(G51_MOLDS.map((mold) => mold.id)).toEqual([
      '8-8-8-8', '8-8-8-6', '7-7-7-7', '11-11-11-11', '10-6-10-6', 'free',
    ]);
    expect(moldLengths('8-8-8-6', G51_FREE_DEFAULT)).toEqual([8, 8, 8, 6]);
    expect(moldLengths('free', G51_FREE_DEFAULT)).toEqual([12, 12, 12, 12]);
    expect(clampFreeLimit(2)).toBe(G51_FREE_MIN);
    expect(clampFreeLimit(99)).toBe(G51_FREE_MAX);
  });

  it('marca coincidencia, error y tope con corrección manual', () => {
    expect(lineStatus(9, 8, null, 12)).toBe('mismatch');
    expect(lineStatus(9, 8, 8, 12)).toBe('match');
    expect(lineStatus(13, null, null, 12)).toBe('overLimit');
    expect(lineStatus(12, null, null, 12)).toBe('match');
    expect(resolvedCount(9, 8)).toBe(8);
    expect(resolvedCount(9, null)).toBe(9);
  });

  it('prepara el texto y el panel del editor con los conteos corregidos', () => {
    const lines = ['Bajo el puente canta el río', '', 'Amaneció sin avisar', ''];
    const counts = [8, 0, 8, 0];
    expect(assembledText(lines)).toBe('Bajo el puente canta el río\nAmaneció sin avisar');
    expect(makeStimulus(G51_MOLDS[0].label, lines, counts)).toEqual({
      gameId: 'g51',
      title: `${G51_TEXT.moldEyebrow}: ${G51_MOLDS[0].label}`,
      items: [
        '8 · Bajo el puente canta el río',
        '8 · Amaneció sin avisar',
      ],
      note: G51_TEXT.editorNote,
    });
  });

  it('tiene registro, tema propio e intro completa', () => {
    expect(gameById('g51')?.name).toBe('Métrica fija');
    expect(gameById('g51')?.themeId).toBe('g51');
    expect(gameThemes.g51.id).toBe('g51');
    expect(GAME_INTROS.g51.steps.length).toBeGreaterThan(0);
    expect(GAME_INTROS.g51.examples.length).toBeGreaterThan(0);
  });
});
