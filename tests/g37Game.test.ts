import { dataService } from '@/services/data/DataService';
import {
  G37_MAX_VERSES, G37_MIN_VERSES, G37_MORAL_VERSES, G37_TEXT,
} from '@/content/games/g37';
import { fableSummary, makeFableStimulus } from '@/games/runtime/g37Logic';

describe('G-37 Fábula', () => {
  it('tiene 24 protagonistas y 24 conflictos originales sin repetir', () => {
    for (const pool of ['fable_protagonists', 'fable_conflicts'] as const) {
      const items = dataService.getPool(pool);
      expect(items).toHaveLength(24);
      expect(items.every((item) => item.license === 'original')).toBe(true);
      expect(new Set(items.map((item) => item.fingerprint)).size).toBe(24);
    }
    expect(dataService.getPool('fable_protagonists').some((item) => item.text.startsWith('Un zorro'))).toBe(true);
    expect(dataService.getPool('fable_conflicts').some((item) => item.text.startsWith('Debe elegir'))).toBe(true);
  });

  it('pide 8 a 12 versos y una moraleja de 2', () => {
    expect([G37_MIN_VERSES, G37_MAX_VERSES, G37_MORAL_VERSES]).toEqual([8, 12, 2]);
    expect(G37_TEXT.versePlan).toContain('8 y 12');
    expect(G37_TEXT.versePlan).toContain('2 versos');
  });

  it('junta protagonista y conflicto en la consigna', () => {
    expect(fableSummary({ protagonist: 'Un zorro', conflict: 'Quiere cruzar el río.' })).toBe('Un zorro — Quiere cruzar el río.');
    expect(G37_TEXT.consigna('Un zorro', 'Quiere cruzar el río.')).toContain('8 y 12 versos');
  });

  it('marca la moraleja como bloque final en el editor', () => {
    const stimulus = makeFableStimulus({
      seeds: { protagonist: 'Una llave', conflict: 'No encuentra su puerta.' },
      title: G37_TEXT.editorTitle('Una llave'),
      note: G37_TEXT.editorNote,
      groupTitles: { body: G37_TEXT.groupBody, moral: G37_TEXT.groupMoral },
      moralLines: [G37_TEXT.moralFirst, G37_TEXT.moralSecond],
    });
    expect(stimulus.gameId).toBe('g37');
    expect(stimulus.groups).toHaveLength(2);
    expect(stimulus.groups?.[0]).toEqual({
      title: 'Cuerpo de la fábula (8 a 12 versos)',
      items: ['Una llave', 'No encuentra su puerta.'],
    });
    expect(stimulus.groups?.[1]).toEqual({
      title: 'Moraleja (últimos 2 versos)',
      items: ['Primer verso de la moraleja', 'Segundo verso de la moraleja'],
    });
  });
});
