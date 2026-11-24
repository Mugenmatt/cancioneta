import { dataService } from '@/services/data/DataService';
import { G43_TEXT } from '@/content/games/g43';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import { makeStrangerStimulus, plainLines } from '@/games/runtime/g43Logic';

describe('G-43 Contar a un extraño', () => {
  it('usa el banco de situaciones existente como disparador opcional', () => {
    expect(dataService.getPool('situations').length).toBeGreaterThan(0);
    expect(G43_TEXT.triggerTitle).toContain('opcional');
  });

  it('mantiene cada línea del relato sin adornos', () => {
    expect(plainLines('  Me quedé sin colectivo.\n\n Caminé bajo la lluvia.  ')).toEqual([
      'Me quedé sin colectivo.', 'Caminé bajo la lluvia.',
    ]);
  });

  it('pone el relato arriba del cuaderno en un grupo plegable', () => {
    const stimulus = makeStrangerStimulus({
      plain: 'Me quedé sin colectivo.\nCaminé bajo la lluvia.',
      title: G43_TEXT.editorTitle,
      groupTitle: G43_TEXT.plainGroup,
      note: G43_TEXT.editorNote,
    });
    expect(stimulus.gameId).toBe('g43');
    expect(stimulus.groups).toEqual([
      { title: 'Versión sin adornos', items: ['Me quedé sin colectivo.', 'Caminé bajo la lluvia.'] },
    ]);
    expect(stimulus.note).toContain('sin perder ningún dato');
    expect(G43_TEXT.stepTwoBody).toContain('conservando toda la información');
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g43')?.name).toBe('Contar a un extraño');
    expect(gameById('g43')?.themeId).toBe('g43');
    expect(gameThemes.g43.id).toBe('g43');
  });
});
