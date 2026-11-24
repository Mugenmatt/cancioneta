import {
  G48_MAX_VERSES, G48_MIN_VERSES, G48_SHOTS, G48_TEXT,
} from '@/content/games/g48';
import { assignShots, makeShotStimulus } from '@/games/runtime/g48Logic';

describe('G-48 Plano a plano', () => {
  it('tiene los seis planos pedidos con etiqueta y pista', () => {
    expect([G48_MIN_VERSES, G48_MAX_VERSES]).toEqual([4, 6]);
    expect(G48_SHOTS.map((shot) => shot.label)).toEqual([
      'Panorámica', 'Plano general', 'Plano medio', 'Primer plano', 'Plano detalle', 'Mirada subjetiva',
    ]);
    expect(G48_SHOTS.every((shot) => shot.hint.length > 20)).toBe(true);
    expect(new Set(G48_SHOTS.map((shot) => shot.id)).size).toBe(6);
  });

  it('asigna un plano por verso en orden o al azar sin repetir planos', () => {
    expect(assignShots(4, 'ordered', G48_SHOTS, []).map((shot) => shot.label)).toEqual([
      'Panorámica', 'Plano general', 'Plano medio', 'Primer plano',
    ]);
    const reversed = [...G48_SHOTS].reverse();
    expect(assignShots(6, 'random', G48_SHOTS, reversed)).toEqual([...reversed]);
    expect(assignShots(9, 'ordered', G48_SHOTS, []).map((shot) => shot.id)).toEqual(G48_SHOTS.map((shot) => shot.id));
    expect(assignShots(1, 'ordered', G48_SHOTS, [])).toHaveLength(4);
  });

  it('etiqueta cada verso y la escena en el editor', () => {
    const shots = assignShots(4, 'ordered', G48_SHOTS, []);
    const stimulus = makeShotStimulus({
      shots,
      scene: 'Una estación vacía',
      title: G48_TEXT.editorTitle(4),
      note: G48_TEXT.editorNote,
      groupTitles: { scene: G48_TEXT.groupScene, verse: G48_TEXT.verseGroup },
    });
    expect(stimulus.gameId).toBe('g48');
    expect(stimulus.groups).toHaveLength(5);
    expect(stimulus.groups?.[0]).toEqual({ title: 'Lugar o escena inicial', items: ['Una estación vacía'] });
    expect(stimulus.groups?.[1].title).toBe('Verso 1 — Panorámica');
    expect(stimulus.groups?.[4].title).toBe('Verso 4 — Primer plano');
  });

  it('omite el grupo de escena cuando no se escribió una', () => {
    const stimulus = makeShotStimulus({
      shots: assignShots(5, 'ordered', G48_SHOTS, []),
      scene: '   ',
      title: G48_TEXT.editorTitle(5),
      note: '',
      groupTitles: { scene: G48_TEXT.groupScene, verse: G48_TEXT.verseGroup },
    });
    expect(stimulus.groups).toHaveLength(5);
    expect(stimulus.groups?.[0].title).toBe('Verso 1 — Panorámica');
  });
});
