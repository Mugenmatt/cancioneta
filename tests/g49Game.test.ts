import { dataService } from '@/services/data/DataService';
import { G49_STANZA_COUNTS, G49_TEXT } from '@/content/games/g49';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  assembleStanzas, makeMutantStimulus, writtenStanzas,
} from '@/games/runtime/g49Logic';

describe('G-49 Refrán mutante', () => {
  it('tiene 40 frases cortas originales sin repetir', () => {
    const items = dataService.getPool('mutant_proverbs');
    expect(items).toHaveLength(40);
    expect(items.every((item) => item.license === 'original')).toBe(true);
    expect(new Set(items.map((item) => item.fingerprint)).size).toBe(40);
    expect(items.every((item) => item.text.length < 45)).toBe(true);
  });

  it('ofrece tres o cuatro estrofas', () => {
    expect([...G49_STANZA_COUNTS]).toEqual([3, 4]);
  });

  it('arma las estrofas separadas por lineas en blanco', () => {
    expect(assembleStanzas([' Una ', '', ' Dos'])).toBe('Una\n\nDos');
    expect(writtenStanzas([' ', 'Dos'])).toEqual(['Dos']);
  });

  it('mantiene la frase fija y avisa su aparición en el editor', () => {
    const phrase = 'Nadie guarda esa llave';
    const stimulus = makeMutantStimulus({
      phrase,
      title: G49_TEXT.editorTitle(phrase),
      groupTitle: G49_TEXT.phraseGroup,
      note: G49_TEXT.editorNote,
      doneLabel: G49_TEXT.checkDone,
      pendingLabel: G49_TEXT.checkPending,
    });
    expect(stimulus.gameId).toBe('g49');
    expect(stimulus.items).toEqual([phrase]);
    expect(stimulus.groups).toEqual([{ title: 'Frase que vuelve', items: [phrase] }]);
    expect(stimulus.check?.target).toBe(phrase);
    expect(G49_TEXT.editorNote).toContain('Cada estrofa cierra con la misma frase');
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g49')?.name).toBe('Refrán mutante');
    expect(gameById('g49')?.themeId).toBe('g49');
    expect(gameThemes.g49.id).toBe('g49');
  });
});
