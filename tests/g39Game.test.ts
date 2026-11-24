import { G39_RESOURCES, G39_TEXT } from '@/content/games/g39';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import { cleanVerse, makeDissectionStimulus } from '@/games/runtime/g39Logic';

describe('G-39 Disección de un verso', () => {
  it('ofrece las cinco preguntas guiadas', () => {
    expect(G39_RESOURCES.map((option) => option.label)).toEqual([
      'Imagen', 'Sonido', 'Giro inesperado', 'Emoción', 'Ritmo',
    ]);
  });

  it('no guarda ni busca el verso del usuario', () => {
    expect(G39_TEXT.intro).toContain('No se guarda ni se busca');
    expect(G39_TEXT.privacy).toContain('no se guarda');
  });

  it('pide un verso propio con el mismo recurso sobre otro tema', () => {
    expect(G39_TEXT.consigna('Imagen')).toBe('Escribí un verso propio con el mismo recurso (Imagen), pero sobre otro tema.');
  });

  it('normaliza el verso sin multiplicar espacios', () => {
    expect(cleanVerse('  un   verso \n cualquiera  ')).toBe('un verso cualquiera');
  });

  it('muestra verso y recurso en el editor', () => {
    const stimulus = makeDissectionStimulus({
      verse: 'un verso cualquiera',
      resourceLabel: 'Sonido',
      title: G39_TEXT.editorTitle('Sonido'),
      groupTitles: { verse: G39_TEXT.verseGroup, resource: G39_TEXT.resourceGroup },
      note: G39_TEXT.editorNote,
    });
    expect(stimulus.gameId).toBe('g39');
    expect(stimulus.groups).toEqual([
      { title: 'Verso que trajiste', items: ['un verso cualquiera'] },
      { title: 'Recurso elegido', items: ['Sonido'] },
    ]);
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g39')?.name).toBe('Disección de un verso');
    expect(gameById('g39')?.themeId).toBe('g39');
    expect(gameThemes.g39.id).toBe('g39');
  });
});
