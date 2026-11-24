import { G47_BPM, G47_MODES, G47_RULES, G47_TEXT } from '@/content/games/g47';
import { gameById } from '@/games/registry';
import { gameThemes } from '@/design/themes';
import { GAME_INTROS } from '@/content/gameIntros';
import {
  accentBeatFromDraw, makeStimulus, offbeatText, pulsePattern,
  ruleTitles, speakSingText, stepSeconds, twistedText,
} from '@/games/runtime/g47Logic';

describe('G-47 Taller de melodía', () => {
  it('tiene tres modos en un solo Juego', () => {
    expect(G47_MODES).toEqual(['twisted', 'offbeat', 'speakSing']);
    expect(G47_RULES.map((rule) => rule.id)).toEqual(['invert', 'durations', 'leap', 'stretch']);
    expect(G47_RULES.every((rule) => rule.title && rule.detail)).toBe(true);
  });

  it('sorteo el acento entre los tiempos 1 y 4', () => {
    expect([0, 1, 2, 3].map(accentBeatFromDraw)).toEqual([1, 2, 3, 4]);
    expect(accentBeatFromDraw(-1)).toBe(1);
    expect(accentBeatFromDraw(9)).toBe(4);
  });

  it('marca el acento en el patrón simple de cuatro tiempos', () => {
    expect(pulsePattern(3, false)).toEqual([
      { label: '1', kind: 'beat' },
      { label: '2', kind: 'beat' },
      { label: '3', kind: 'accent' },
      { label: '4', kind: 'beat' },
    ]);
  });

  it('marca el "y" entre tiempos sin perder el acento sorteado', () => {
    const pulses = pulsePattern(2, true);
    expect(pulses.map((pulse) => pulse.label)).toEqual(['1', 'y', '2', 'y', '3', 'y', '4', 'y']);
    expect(pulses.map((pulse) => pulse.kind)).toEqual([
      'beat', 'offbeat', 'accent', 'offbeat', 'beat', 'offbeat', 'beat', 'offbeat',
    ]);
    expect(pulses.filter((pulse) => pulse.kind === 'accent')).toHaveLength(1);
    expect(stepSeconds(false)).toBeCloseTo(60 / G47_BPM);
    expect(stepSeconds(true)).toBeCloseTo(30 / G47_BPM);
  });

  it('nombra las reglas elegidas y arma el texto de cada modo', () => {
    expect(ruleTitles(['invert', 'stretch'])).toEqual(['Invertir la dirección', 'Estirar y comprimir']);
    expect(twistedText({ rules: ['invert'], note: '  Sube al revés  ' }))
      .toBe(`${G47_TEXT.modeTwisted}\nInvertir la dirección\nSube al revés`);
    expect(offbeatText({ accentBeat: 4, withOffbeats: true, phrase: ' Frase ' }))
      .toContain(`${G47_TEXT.offbeat.accent(4)} · ${G47_TEXT.offbeat.advanced}`);
    expect(speakSingText({ phrase: 'Vení para acá', notes: ' Se me abrió la voz ' }))
      .toContain('Se me abrió la voz');
  });

  it('prepara el panel del editor para el modo activo', () => {
    const stimulus = makeStimulus('speakSing', ['Vení para acá', 'Se me abrió la voz'], G47_TEXT.speakSing.editorNote);
    expect(stimulus).toEqual({
      gameId: 'g47',
      title: G47_TEXT.modeSpeakSing,
      items: ['Vení para acá', 'Se me abrió la voz'],
      note: G47_TEXT.speakSing.editorNote,
    });
    expect(makeStimulus('twisted', [''], 'nota').items).toEqual([]);
  });

  it('tiene registro, tema propio e intro completa', () => {
    expect(gameById('g47')?.name).toBe('Taller de melodía');
    expect(gameById('g47')?.themeId).toBe('g47');
    expect(gameThemes.g47.id).toBe('g47');
    expect(GAME_INTROS.g47.steps.length).toBeGreaterThan(0);
    expect(GAME_INTROS.g47.examples.length).toBeGreaterThan(0);
  });
});
