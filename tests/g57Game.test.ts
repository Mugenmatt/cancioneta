import { dataService } from '@/services/data/DataService';
import { G57_MIN_VERSES, G57_TEXT } from '@/content/games/g57';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  assembledDialogue, canGoToEditor, initialVerses, makeVoicesStimulus,
  nextVoice, pairFromItem, voiceLines, writtenVerses, type VoiceVerse,
} from '@/games/runtime/g57Logic';

function filled(count: number): VoiceVerse[] {
  return initialVerses().slice(0, count).map((verse, index) => ({ ...verse, text: `Verso ${index + 1}` }));
}

describe('G-57 Dos voces', () => {
  it('tiene 40 parejas originales sin repetir', () => {
    const items = dataService.getPool('voice_pairs');
    expect(items).toHaveLength(40);
    expect(items.every((item) => item.license === 'original')).toBe(true);
    expect(new Set(items.map((item) => item.fingerprint)).size).toBe(40);
    expect(items.every((item) => {
      const pair = pairFromItem(item);
      return Boolean(pair.a && pair.b && pair.a !== pair.b);
    })).toBe(true);
  });

  it('empieza con ocho versos alternados y mantiene la alternancia al agregar', () => {
    const initial = initialVerses();
    expect(G57_MIN_VERSES).toBe(8);
    expect(initial.map((verse) => verse.voice)).toEqual(['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']);
    expect(nextVoice(initial)).toBe('A');
    expect(nextVoice(initial.slice(0, 7))).toBe('B');
  });

  it('pide al menos ocho versos escritos y armo el diálogo en orden', () => {
    expect(canGoToEditor(initialVerses())).toBe(false);
    expect(canGoToEditor(filled(8))).toBe(true);
    expect(writtenVerses(filled(8))).toHaveLength(8);
    expect(assembledDialogue(filled(3))).toBe('Verso 1\nVerso 2\nVerso 3');
    expect(G57_TEXT.noNarrator).toContain('Sin narrador');
  });

  it('separa las voces en el panel del editor, sin narrador', () => {
    const stimulus = makeVoicesStimulus({
      pair: { a: 'La que espera', b: 'El que se fue' },
      verses: filled(4),
      title: G57_TEXT.editorTitle('La que espera', 'El que se fue'),
      groupTitles: {
        a: G57_TEXT.groupA('La que espera'),
        b: G57_TEXT.groupB('El que se fue'),
        note: G57_TEXT.noteGroup,
      },
      note: G57_TEXT.editorNote,
    });
    expect(stimulus.gameId).toBe('g57');
    expect(voiceLines(filled(4), 'A')).toEqual(['Verso 1', 'Verso 3']);
    expect(voiceLines(filled(4), 'B')).toEqual(['Verso 2', 'Verso 4']);
    expect(stimulus.groups).toEqual([
      { title: 'Voz A: La que espera', items: ['Verso 1', 'Verso 3'] },
      { title: 'Voz B: El que se fue', items: ['Verso 2', 'Verso 4'] },
      { title: 'Cómo leerlo', items: [G57_TEXT.editorNote] },
    ]);
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g57')?.name).toBe('Dos voces');
    expect(gameById('g57')?.themeId).toBe('g57');
    expect(gameThemes.g57.id).toBe('g57');
  });
});
