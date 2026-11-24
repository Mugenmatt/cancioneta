import { dataService } from '@/services/data/DataService';
import {
  applyWheelDraws, makeFormStimulus, singleWheelDraw, wheelSummary,
  type WheelLocks, type WheelSlots,
} from '@/games/runtime/g36Logic';
import { G36_TEXT } from '@/content/games/g36';

const current: WheelSlots<string> = { style: 'Milonga', meter: '4/4', structure: 'Sin estribillo' };
const unlocked: WheelLocks = { style: false, meter: false, structure: false };

describe('G-36 Ruleta de forma', () => {
  it('tiene semillas originales en las tres ruedas', () => {
    const styles = dataService.getPool('form_styles');
    const meters = dataService.getPool('form_meters');
    const structures = dataService.getPool('form_structures');
    expect(styles).toHaveLength(24);
    expect(meters.map((item) => item.text)).toEqual(['4/4', '3/4', '6/8', '12/8']);
    expect(structures.map((item) => item.text)).toEqual([
      'Solo estrofas tipo balada', 'Verso y estribillo', 'Con puente instrumental',
      'Estribillo primero', 'Sin estribillo',
    ]);
    for (const items of [styles, meters, structures]) {
      expect(items.every((item) => item.license === 'original')).toBe(true);
      expect(new Set(items.map((item) => item.fingerprint)).size).toBe(items.length);
    }
  });

  it('respeta las ruedas bloqueadas al tirar', () => {
    const drawn = { style: 'Ska de verano', meter: '6/8', structure: 'Estribillo primero' };
    expect(applyWheelDraws(current, drawn, unlocked)).toEqual(drawn);
    expect(applyWheelDraws(current, drawn, { ...unlocked, meter: true })).toEqual({
      style: 'Ska de verano', meter: '4/4', structure: 'Estribillo primero',
    });
    expect(applyWheelDraws(current, {}, unlocked)).toEqual(current);
  });

  it('arma el sorteo de una sola rueda sin tocar las otras', () => {
    expect(singleWheelDraw('meter', '3/4')).toEqual({ meter: '3/4' });
    expect(applyWheelDraws(current, singleWheelDraw('meter', '3/4'), unlocked)).toEqual({
      style: 'Milonga', meter: '3/4', structure: 'Sin estribillo',
    });
  });

  it('muestra la consigna con las tres ruedas en el editor', () => {
    const summary = wheelSummary(current);
    expect(summary).toBe('Milonga · 4/4 · Sin estribillo');
    const stimulus = makeFormStimulus({
      values: current,
      title: G36_TEXT.editorTitle(summary),
      note: G36_TEXT.editorNote,
      groupTitles: { style: G36_TEXT.groupStyle, meter: G36_TEXT.groupMeter, structure: G36_TEXT.groupStructure },
    });
    expect(stimulus.gameId).toBe('g36');
    expect(stimulus.groups).toEqual([
      { title: 'Estilo o género', items: ['Milonga'] },
      { title: 'Compás', items: ['4/4'] },
      { title: 'Estructura', items: ['Sin estribillo'] },
    ]);
    expect(stimulus.note).toContain('sin audio');
  });
});
