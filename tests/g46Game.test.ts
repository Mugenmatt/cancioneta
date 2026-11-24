import { G46_SECTION_SIZES, G46_TURN_COUNT, G46_TEXT } from '@/content/games/g46';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  assembledText, authorForTurn, authorLabel, canReveal, labeledVerse,
  makeDuoStimulus, previousVerse, setupLabel, structuredVerses,
  type DuoSetup, type DuoVerse,
} from '@/games/runtime/g46Logic';

const setup: DuoSetup = { nameA: 'Maitén', nameB: 'Nico', topic: 'La estación vacía' };

function chain(count = G46_TURN_COUNT): DuoVerse[] {
  return Array.from({ length: count }, (_, index) => ({
    author: authorForTurn(index),
    text: `Verso ${index + 1}`,
  }));
}

describe('G-46 Dúo por turnos', () => {
  it('alterna doce turnos entre A y B', () => {
    expect(G46_TURN_COUNT).toBe(12);
    expect(Array.from({ length: 12 }, (_, turn) => authorForTurn(turn)))
      .toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
  });

  it('usa nombre o etiqueta de jugador, siempre con A/B', () => {
    expect(authorLabel('Maitén', 0)).toBe('A · Maitén');
    expect(authorLabel('  ', 1)).toBe('B · Jugador 2');
    expect(setupLabel({ ...setup, nameB: '  ' }, 1)).toBe('B · Jugador 2');
    expect(labeledVerse({ author: 0, text: ' Hola ' }, setup)).toBe('A · Maitén: Hola');
  });

  it('muestra solo el verso anterior', () => {
    const verses = chain(4);
    expect(previousVerse(verses, 0)).toBe('');
    expect(previousVerse(verses, 1)).toBe('Verso 1');
    expect(previousVerse(verses, 3)).toBe('Verso 3');
    expect(previousVerse(verses, 12)).toBe('');
  });

  it('revela recién con doce versos escritos y en orden alternado', () => {
    expect(canReveal(chain(11))).toBe(false);
    expect(canReveal(chain())).toBe(true);
    expect(canReveal(chain().map((verse, index) => index === 4 ? { ...verse, text: '   ' } : verse))).toBe(false);
    expect(canReveal(chain().map((verse, index) => index === 4 ? { ...verse, author: 1 } : verse))).toBe(false);
  });

  it('reparte 4, 2 y 6 versos en las tres secciones', () => {
    expect(G46_SECTION_SIZES).toEqual({ verse: 4, preChorus: 2, chorus: 6 });
    const sections = structuredVerses(chain(), setup);
    expect(sections.verse).toHaveLength(4);
    expect(sections.preChorus).toHaveLength(2);
    expect(sections.chorus).toHaveLength(6);
    expect(sections.verse[0]).toBe('A · Maitén: Verso 1');
    expect(sections.preChorus[0]).toBe('A · Maitén: Verso 5');
    expect(sections.chorus[5]).toBe('B · Nico: Verso 12');
    expect(sections.verse.flat().join('|')).not.toContain('undefined');
  });

  it('arma el texto del editor con encabezados y etiquetas', () => {
    const text = assembledText(structuredVerses(chain(), setup));
    expect(text.startsWith(`${G46_TEXT.sectionVerse}\nA · Maitén: Verso 1`)).toBe(true);
    expect(text).toContain(`\n${G46_TEXT.sectionPreChorus}\nA · Maitén: Verso 5`);
    expect(text).toContain(`\n${G46_TEXT.sectionChorus}\nA · Maitén: Verso 7`);
    expect(text.trim().split('\n')).toHaveLength(12 + 3 + 2);
  });

  it('mantiene las tres secciones visibles en el panel del editor', () => {
    const sections = structuredVerses(chain(), setup);
    const stimulus = makeDuoStimulus(setup, sections);
    expect(stimulus.gameId).toBe('g46');
    expect(stimulus.groups).toEqual([
      { title: 'VERSO (4)', items: sections.verse },
      { title: 'PRE-ESTRIBILLO (2)', items: sections.preChorus },
      { title: 'ESTRIBILLO (6)', items: sections.chorus },
    ]);
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g46')?.name).toBe('Dúo por turnos');
    expect(gameById('g46')?.themeId).toBe('g46');
    expect(gameThemes.g46.id).toBe('g46');
  });
});
