import { dataService } from '@/services/data/DataService';
import { G56_TEXT } from '@/content/games/g56';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import {
  assembledLyrics, makeTraitorStimulus, modeFromItem,
} from '@/games/runtime/g56Logic';

describe('G-56 Estribillo traidor', () => {
  it('tiene cuatro consignas originales de contradicción', () => {
    const items = dataService.getPool('contradiction_modes');
    expect(items.map((item) => item.text)).toEqual([
      'Ironía', 'Negación', 'Cambio de punto de vista', 'Mentira piadosa',
    ]);
    expect(items.every((item) => item.license === 'original')).toBe(true);
    expect(items.every((item) => modeFromItem(item).instruction.length > 20)).toBe(true);
  });

  it('junta la estrofa y el estribillo con un espacio entre ambos', () => {
    expect(assembledLyrics(' Una estrofa ', ' El estribillo ')).toBe('Una estrofa\n\nEl estribillo');
  });

  it('muestra los dos textos lado a lado en el editor con la consigna', () => {
    const stimulus = makeTraitorStimulus({
      mode: { label: 'Ironía', instruction: 'Decir lo contrario fingiendo acuerdo.' },
      stanza: 'Me fui sin despedirme.',
      chorus: 'Qué lindo que fue todo.',
      title: G56_TEXT.editorTitle('Ironía'),
      groupTitles: {
        mode: G56_TEXT.modeGroup,
        stanza: G56_TEXT.stanzaGroup,
        chorus: G56_TEXT.chorusGroup,
      },
      note: G56_TEXT.editorNote,
    });
    expect(stimulus.gameId).toBe('g56');
    expect(stimulus.groups).toEqual([
      { title: 'Consigna', items: ['Decir lo contrario fingiendo acuerdo.'] },
      { title: 'Estrofa', items: ['Me fui sin despedirme.'] },
      { title: 'Estribillo', items: ['Qué lindo que fue todo.'] },
    ]);
  });

  it('tiene tema propio y ficha en el registro', () => {
    expect(gameById('g56')?.name).toBe('Estribillo traidor');
    expect(gameById('g56')?.themeId).toBe('g56');
    expect(gameThemes.g56.id).toBe('g56');
  });
});
