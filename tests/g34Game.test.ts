import { dataService } from '@/services/data/DataService';
import { makeNarratorStimulus, narratorSummary } from '@/games/runtime/g34Logic';
import { G34_TEXT } from '@/content/games/g34';

describe('G-34 Narrador', () => {
  it('tiene semillas originales sin repetir en los tres ejes', () => {
    const pools = ['narrator_person', 'narrator_distance', 'narrator_reliability'] as const;
    const sizes = pools.map((pool) => {
      const items = dataService.getPool(pool);
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((item) => item.license === 'original')).toBe(true);
      expect(new Set(items.map((item) => item.fingerprint)).size).toBe(items.length);
      return items.length;
    });
    expect(sizes).toEqual([3, 4, 4]);
    expect(dataService.getPool('narrator_reliability').map((item) => item.text)).toEqual([
      'Sincero', 'Mentiroso', 'Se engaña a sí mismo', 'Cínico',
    ]);
  });

  it('compone el resumen con o sin tema opcional', () => {
    const axes = { person: 'Primera persona', distance: 'Otro lugar', reliability: 'Mentiroso' };
    expect(narratorSummary(axes)).toBe('Primera persona · Otro lugar · Mentiroso');
    expect(narratorSummary({ ...axes, theme: 'Separación' })).toBe('Primera persona · Otro lugar · Mentiroso · Separación');
  });

  it('muestra los tres ejes y el tema en el editor', () => {
    const stimulus = makeNarratorStimulus({
      axes: { person: 'Segunda persona', distance: 'Otra época', reliability: 'Sincero', theme: 'Regreso' },
      title: G34_TEXT.editorTitle('Segunda persona · Otra época · Sincero · Regreso'),
      note: G34_TEXT.editorNote,
      groupTitles: {
        person: G34_TEXT.groupPerson,
        distance: G34_TEXT.groupDistance,
        reliability: G34_TEXT.groupReliability,
        theme: G34_TEXT.groupTheme,
      },
    });
    expect(stimulus.gameId).toBe('g34');
    expect(stimulus.groups).toEqual([
      { title: 'Persona gramatical', items: ['Segunda persona'] },
      { title: 'Distancia', items: ['Otra época'] },
      { title: 'Fiabilidad', items: ['Sincero'] },
      { title: 'Tema opcional', items: ['Regreso'] },
    ]);
  });

  it('omite el grupo del tema cuando no se activó', () => {
    const stimulus = makeNarratorStimulus({
      axes: { person: 'Tercera persona', distance: 'Otro oficio', reliability: 'Cínico' },
      title: 'Narrador',
      note: '',
      groupTitles: { person: 'P', distance: 'D', reliability: 'F', theme: 'T' },
    });
    expect(stimulus.groups).toHaveLength(3);
    expect(stimulus.items).toEqual(['Tercera persona', 'Otro oficio', 'Cínico']);
  });
});
