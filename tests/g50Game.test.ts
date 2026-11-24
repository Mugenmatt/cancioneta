import type { PoolItem } from '@/core/types';
import { dataService } from '@/services/data/DataService';
import { G50_SECTIONS, G50_TEXT } from '@/content/games/g50';
import {
  assignEmotions, emotionSummary, excludeForSlot, makeEmotionArcStimulus, replaceEmotion,
  type EmotionSlots,
} from '@/games/runtime/g50Logic';

function item(text: string): PoolItem {
  return {
    id: `emotion:${text}`,
    pool: 'emotion_arc',
    text,
    lang: 'es',
    license: 'original',
    fingerprint: `emotion:${text}`,
  };
}

const slots: EmotionSlots = assignEmotions([item('Alegría'), item('Inquietud'), item('Esperanza')]);

describe('G-50 Arco emocional', () => {
  it('tiene cuarenta emociones originales sin repetir', () => {
    const emotions = dataService.getPool('emotion_arc');
    expect(emotions).toHaveLength(40);
    expect(emotions.every((entry) => entry.license === 'original')).toBe(true);
    expect(new Set(emotions.map((entry) => entry.fingerprint)).size).toBe(40);
    expect(emotions.map((entry) => entry.text)).toContain('Alegría');
    expect(emotions.map((entry) => entry.text)).toContain('Arrepentimiento');
  });

  it('asigna tres emociones distintas a verso, pre-estribillo y estribillo', () => {
    expect(G50_SECTIONS.map((section) => section.label)).toEqual(['Verso', 'Pre-estribillo', 'Estribillo']);
    expect(slots.verse?.text).toBe('Alegría');
    expect(slots.preChorus?.text).toBe('Inquietud');
    expect(slots.chorus?.text).toBe('Esperanza');
    expect(emotionSummary(slots)).toBe('Verso: Alegría · Pre-estribillo: Inquietud · Estribillo: Esperanza');
  });

  it('cambia una sola emoción y excluye las otras dos del sorteo', () => {
    const next = item('Alivio');
    const changed = replaceEmotion(slots, 'chorus', next);
    expect(changed.verse).toBe(slots.verse);
    expect(changed.preChorus).toBe(slots.preChorus);
    expect(changed.chorus?.text).toBe('Alivio');
    expect([...excludeForSlot(changed, 'chorus')]).toEqual([
      'emotion:Alegría', 'emotion:Inquietud',
    ]);
    expect(excludeForSlot(slots, 'verse').has('emotion:Alegría')).toBe(false);
  });

  it('muestra tres bloques etiquetados en el editor', () => {
    const stimulus = makeEmotionArcStimulus({
      slots,
      title: G50_TEXT.editorTitle,
      note: G50_TEXT.editorNote,
      groupTitle: G50_TEXT.group,
    });
    expect(stimulus.gameId).toBe('g50');
    expect(stimulus.items).toEqual(['Alegría', 'Inquietud', 'Esperanza']);
    expect(stimulus.groups).toEqual([
      { title: 'Verso — emoción asignada', items: ['Alegría'] },
      { title: 'Pre-estribillo — emoción asignada', items: ['Inquietud'] },
      { title: 'Estribillo — emoción asignada', items: ['Esperanza'] },
    ]);
  });
});
