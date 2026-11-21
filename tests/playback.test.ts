import { nextPlaybackStep } from '@/music/playback';

describe('avance de la progresión', () => {
  it('avanza al siguiente acorde', () => {
    expect(nextPlaybackStep(0, 4, true)).toBe(1);
    expect(nextPlaybackStep(5, 8, false)).toBe(6);
  });

  it('vuelve al primero al terminar con loop', () => {
    expect(nextPlaybackStep(3, 4, true)).toBe(0);
    expect(nextPlaybackStep(7, 8, true)).toBe(0);
  });

  it('se detiene al terminar sin loop', () => {
    expect(nextPlaybackStep(3, 4, false)).toBeNull();
  });

  it('arranca desde cero y no avanza sin acordes', () => {
    expect(nextPlaybackStep(-1, 6, true)).toBe(0);
    expect(nextPlaybackStep(0, 0, true)).toBeNull();
  });
});
