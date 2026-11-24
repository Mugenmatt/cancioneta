import { dataService } from '@/services/data/DataService';
import { G54_MAX_VERSES, G54_MIN_VERSES, G54_TEXT } from '@/content/games/g54';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  canGoToEditor, filledVerses, makeQuestionVersesStimulus, versesWithoutQuestionMark,
} from '@/games/runtime/g54Logic';

describe('G-54 Solo preguntas', () => {
  it('pide entre 8 y 16 versos y usa el banco de temas existente', () => {
    expect([G54_MIN_VERSES, G54_MAX_VERSES]).toEqual([8, 16]);
    expect(dataService.getPool('themes').length).toBeGreaterThan(0);
  });

  it('habilita el editor solo con la cantidad pedida', () => {
    const eight = Array.from({ length: 8 }, (_, index) => `¿Verso ${index + 1}?`);
    expect(filledVerses(eight)).toHaveLength(8);
    expect(canGoToEditor(eight)).toBe(true);
    expect(canGoToEditor(eight.slice(0, 7))).toBe(false);
    expect(canGoToEditor([...eight, '¿Uno más?', '¿Otro?'])).toBe(true);
  });

  it('detecta suavemente qué versos no tienen signo de interrogación', () => {
    const values = ['¿Quién volvió?', 'La luz sigue encendida', '', '¿Y ahora?'];
    expect(versesWithoutQuestionMark(values)).toEqual([1]);
    const stimulus = makeQuestionVersesStimulus({
      theme: 'La espera',
      values,
      title: G54_TEXT.editorTitle('La espera'),
      groupTitles: { theme: G54_TEXT.themeGroup, issues: G54_TEXT.issuesGroup },
      issueLabel: G54_TEXT.issueLabel,
      note: G54_TEXT.editorNote,
      doneLabel: G54_TEXT.checkDone,
      pendingLabel: G54_TEXT.checkPending,
    });
    expect(stimulus.gameId).toBe('g54');
    expect(stimulus.groups).toEqual([
      { title: 'Tema', items: ['La espera'] },
      { title: 'Versos sin signo de interrogación', items: ['Verso 2'] },
    ]);
    expect(stimulus.check?.target).toBe('?');
  });

  it('no muestra el grupo de avisos cuando todos son preguntas', () => {
    const stimulus = makeQuestionVersesStimulus({
      theme: 'La espera',
      values: ['¿Volviste?'],
      title: G54_TEXT.editorTitle('La espera'),
      groupTitles: { theme: G54_TEXT.themeGroup, issues: G54_TEXT.issuesGroup },
      issueLabel: G54_TEXT.issueLabel,
      note: G54_TEXT.editorNote,
      doneLabel: G54_TEXT.checkDone,
      pendingLabel: G54_TEXT.checkPending,
    });
    expect(stimulus.groups).toHaveLength(1);
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g54')?.name).toBe('Solo preguntas');
    expect(gameById('g54')?.themeId).toBe('g54');
    expect(gameThemes.g54.id).toBe('g54');
  });
});
