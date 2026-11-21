jest.mock('expo-audio', () => {
  const players: Array<Record<string, jest.Mock | number | boolean>> = [];
  return {
    __players: players,
    createAudioPlayer: jest.fn(() => {
      const player = {
        playing: false,
        volume: 0,
        replace: jest.fn(),
        seekTo: jest.fn(() => Promise.resolve()),
        play: jest.fn(),
        pause: jest.fn(),
        release: jest.fn(),
      };
      players.push(player);
      return player;
    }),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  };
});

import { getMeter } from '@/music/meter';
import { MetronomeEngine } from '@/services/audio/MetronomeEngine';

const audio = jest.requireMock('expo-audio');

type MockPlayer = { play: jest.Mock; volume: number };

function players(): MockPlayer[] {
  return audio.__players as MockPlayer[];
}

async function flushAudio(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('motor del metrónomo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    audio.__players.length = 0;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('suena en el primer pulso con acento fuerte', async () => {
    const engine = new MetronomeEngine();
    const listener = jest.fn();
    engine.start(90, getMeter('4/4'), listener);
    await flushAudio();

    expect(listener).toHaveBeenCalledWith(0, 'strong');
    expect(audio.__players).toHaveLength(1);
    expect(audio.__players[0].play).toHaveBeenCalledTimes(1);
    expect(audio.__players[0].volume).toBe(1);
    engine.dispose();
  });

  it('diferencia el acento secundario del pulso débil', async () => {
    const engine = new MetronomeEngine();
    engine.start(120, getMeter('4/4'), jest.fn());
    await flushAudio();

    jest.advanceTimersByTime(500);
    await flushAudio();
    jest.advanceTimersByTime(500);
    await flushAudio();

    const volumes = players().map((player) => player.volume);
    expect(volumes).toEqual([1, 0.45, 0.72]);
    engine.dispose();
  });

  it('respeta la cantidad de pulsos del compás elegido', async () => {
    const engine = new MetronomeEngine();
    const listener = jest.fn();
    engine.start(120, getMeter('6/8'), listener);
    await flushAudio();

    jest.advanceTimersByTime(500);
    await flushAudio();
    jest.advanceTimersByTime(500);
    await flushAudio();

    expect(listener.mock.calls.map(([pulse]) => pulse)).toEqual([0, 1, 0]);
    expect(listener.mock.calls[1][1]).toBe('secondary');
    engine.dispose();
  });

  it('deja de sonar al detenerse', async () => {
    const engine = new MetronomeEngine();
    engine.start(120, getMeter('3/4'), jest.fn());
    await flushAudio();
    engine.stop();
    const playsAfterStop = players().reduce((total: number, player) => total + player.play.mock.calls.length, 0);

    jest.advanceTimersByTime(2000);
    await flushAudio();

    const playsAfterWait = players().reduce((total: number, player) => total + player.play.mock.calls.length, 0);
    expect(playsAfterWait).toBe(playsAfterStop);
    expect(engine.isRunning()).toBe(false);
  });
});
