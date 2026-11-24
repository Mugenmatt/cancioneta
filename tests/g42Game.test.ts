import { dataService } from '@/services/data/DataService';
import { G42_FAVORITES, G42_TEXT, G42_TOTAL } from '@/content/games/g42';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  canGoToEditor, favoriteOpenings, makeOpeningsStimulus, writtenOpenings, type OpeningEntry,
} from '@/games/runtime/g42Logic';

function entries(texts: readonly string[], selected: readonly number[] = []): OpeningEntry[] {
  return texts.map((text, id) => ({ id, text, selected: selected.includes(id) }));
}

describe('G-42 Diez primeros versos', () => {
  it('pide diez aperturas y tres favoritas', () => {
    expect([G42_TOTAL, G42_FAVORITES]).toEqual([10, 3]);
    expect(G42_TEXT.criterion).toContain('preguntarse');
  });

  it('usa el banco de temas existente para el tema opcional', () => {
    expect(dataService.getPool('themes').length).toBeGreaterThan(0);
  });

  it('solo habilita el editor con diez aperturas y tres favoritas', () => {
    const ten = entries(Array.from({ length: 10 }, (_, index) => `Apertura ${index + 1}`), [0, 1, 2]);
    expect(writtenOpenings(ten)).toHaveLength(10);
    expect(favoriteOpenings(ten)).toHaveLength(3);
    expect(canGoToEditor(ten)).toBe(true);
    expect(canGoToEditor(entries(ten.slice(0, 9).map((entry) => entry.text), [0, 1, 2]))).toBe(false);
    expect(canGoToEditor(entries(ten.map((entry) => entry.text), [0, 1]))).toBe(false);
  });

  it('ignora favoritas marcadas en aperturas vacías', () => {
    const withEmptyFavorite = entries(['Una', 'Dos'], [0, 1]);
    expect(favoriteOpenings(withEmptyFavorite)).toEqual(['Una', 'Dos']);
    expect(favoriteOpenings(entries(['Una', ''], [0, 1]))).toEqual(['Una']);
  });

  it('muestra el tema y las tres favoritas en el editor', () => {
    const stimulus = makeOpeningsStimulus({
      theme: 'La espera',
      favorites: ['Una', 'Dos', 'Tres'],
      title: G42_TEXT.editorTitle('La espera'),
      groupTitles: { theme: G42_TEXT.themeGroup, favorites: G42_TEXT.favoritesGroup },
      note: G42_TEXT.editorNote,
    });
    expect(stimulus.gameId).toBe('g42');
    expect(stimulus.groups).toEqual([
      { title: 'Tema opcional', items: ['La espera'] },
      { title: 'Aperturas favoritas', items: ['Una', 'Dos', 'Tres'] },
    ]);
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g42')?.name).toBe('Diez primeros versos');
    expect(gameById('g42')?.themeId).toBe('g42');
    expect(gameThemes.g42.id).toBe('g42');
  });
});
