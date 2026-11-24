import { dataService } from '@/services/data/DataService';
import { G55_TEXT } from '@/content/games/g55';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  canGoToEditor, makeBackwardsStimulus, normalOrder,
} from '@/games/runtime/g55Logic';

describe('G-55 Empezar por el final', () => {
  it('usa el banco de temas existente', () => {
    expect(dataService.getPool('themes').length).toBeGreaterThan(0);
  });

  it('invierte los versos anteriores y deja el final al último', () => {
    const previous = ['Tercero escrito', 'Segundo escrito', 'Primero escrito'];
    expect(normalOrder('Último verso', previous)).toEqual([
      'Primero escrito', 'Segundo escrito', 'Tercero escrito', 'Último verso',
    ]);
    expect(G55_TEXT.viewNormal).toBe('Ver en orden normal');
  });

  it('solo habilita el editor con final y al menos un verso anterior', () => {
    expect(canGoToEditor('Último verso', ['Verso anterior'])).toBe(true);
    expect(canGoToEditor('', ['Verso anterior'])).toBe(false);
    expect(canGoToEditor('Último verso', ['  '])).toBe(false);
  });

  it('muestra el tema, el final y los anteriores en orden normal en el editor', () => {
    const stimulus = makeBackwardsStimulus({
      theme: 'La vuelta',
      finalVerse: 'Último verso',
      previous: ['Tercero', 'Segundo', 'Primero'],
      title: G55_TEXT.editorTitle('La vuelta'),
      groupTitles: {
        theme: G55_TEXT.themeGroup,
        finalVerse: G55_TEXT.finalGroup,
        previous: G55_TEXT.previousGroup,
      },
      note: G55_TEXT.editorNote,
    });
    expect(stimulus.gameId).toBe('g55');
    expect(stimulus.items).toEqual(['Primero', 'Segundo', 'Tercero', 'Último verso']);
    expect(stimulus.groups).toEqual([
      { title: 'Tema', items: ['La vuelta'] },
      { title: 'Último verso', items: ['Último verso'] },
      { title: 'Versos anteriores (en orden normal)', items: ['Primero', 'Segundo', 'Tercero'] },
    ]);
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g55')?.name).toBe('Empezar por el final');
    expect(gameById('g55')?.themeId).toBe('g55');
    expect(gameThemes.g55.id).toBe('g55');
  });
});
