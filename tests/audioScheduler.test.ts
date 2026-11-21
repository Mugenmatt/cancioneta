import { getMeter } from '@/music/meter';
import { createChord } from '@/music/progressionDice';
import { parseNote } from '@/music/theory';
import { AudioScheduler } from '@/services/audio/AudioScheduler';

interface MockContext {
  currentTime: number;
  state: string;
  sampleRate: number;
  destination: object;
  starts: number[];
  decodeAudioData: jest.Mock;
  createBuffer: jest.Mock;
  createBufferSource: jest.Mock;
  createGain: jest.Mock;
  resume: jest.Mock;
}

const mockAudio: { contexts: MockContext[]; gainValues: number[]; sources: { buffer: unknown }[] } = {
  contexts: [],
  gainValues: [],
  sources: [],
};

jest.mock('react-native-audio-api', () => {
  class FakeGainNode {
    gain = {
      _value: 0,
      get value(): number {
        return this._value;
      },
      set value(value: number) {
        this._value = value;
        mockAudio.gainValues.push(value);
      },
    };
    connect = jest.fn();
    disconnect = jest.fn();
  }

  class FakeSource {
    buffer: unknown = null;
    onended: (() => void) | null = null;
    connect = jest.fn();
    disconnect = jest.fn();
    stop = jest.fn();
    constructor() {
      mockAudio.sources.push(this);
    }
    start = jest.fn((when?: number) => {
      const context = mockAudio.contexts[mockAudio.contexts.length - 1];
      context.starts.push(when ?? 0);
    });
  }

  class FakeAudioContext {
    currentTime = 10;
    state = 'running';
    sampleRate = 48000;
    destination = {};
    starts: number[] = [];
    decodeAudioData = jest.fn().mockResolvedValue({});
    createBuffer = jest.fn((_channels: number, length: number, sampleRate: number) => ({
      length,
      sampleRate,
      numberOfChannels: 1,
      getChannelData: jest.fn(() => new Float32Array(length)),
    }));
    createBufferSource = jest.fn(() => new FakeSource());
    createGain = jest.fn(() => new FakeGainNode());
    resume = jest.fn().mockResolvedValue(undefined);
  }

  return {
    AudioContext: jest.fn().mockImplementation(() => {
      const context = new FakeAudioContext();
      mockAudio.contexts.push(context as unknown as MockContext);
      return context;
    }),
    AudioManager: { setSystemOptions: jest.fn() },
  };
});

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: 'file://sample.wav',
      uri: 'http://sample.wav',
    })),
  },
}));

jest.mock('@/services/audio/pianoSamples', () => {
  const files: Record<number, number> = {};
  for (let midi = 36; midi <= 84; midi += 1) files[midi] = midi;
  return { PIANO_SAMPLE_FILES: files };
});

describe('AudioScheduler', () => {
  let scheduler: AudioScheduler;

  beforeEach(() => {
    jest.useFakeTimers();
    mockAudio.contexts = [];
    mockAudio.gainValues = [];
    mockAudio.sources = [];
    scheduler = new AudioScheduler();
  });

  afterEach(() => {
    scheduler.stop();
    jest.useRealTimers();
  });

  it('programa el acorde y el pulso en el mismo instante del reloj de audio', async () => {
    await scheduler.start({
      bpm: 120,
      meter: getMeter('4/4'),
      chords: [createChord(parseNote('C'), 'maj', false, 'c')],
      loop: true,
      metronome: true,
    }, {
      onStep: jest.fn(),
      onPulse: jest.fn(),
      onFinish: jest.fn(),
    });

    const context = mockAudio.contexts[0];
    expect(context.decodeAudioData).toHaveBeenCalledWith('file://sample.wav');
    expect(context.starts[0]).toBeCloseTo(10.12);
    expect(context.starts[1]).toBe(context.starts[0]);
    expect(mockAudio.gainValues).toEqual(expect.arrayContaining([0.5, 0.325]));
  });

  it('genera un click sin nota para el metrónomo', async () => {
    await scheduler.start({
      bpm: 120,
      meter: getMeter('4/4'),
      chords: [createChord(parseNote('C'), 'maj', false, 'c')],
      loop: true,
      metronome: true,
    }, {
      onStep: jest.fn(),
      onPulse: jest.fn(),
      onFinish: jest.fn(),
    });

    const context = mockAudio.contexts[0];
    const clicks = context.createBuffer.mock.results.map((result) => result.value);
    expect(context.createBuffer).toHaveBeenCalledTimes(3);
    expect(mockAudio.sources.some((source) => clicks.includes(source.buffer))).toBe(true);
  });

  it('encola cambios sin crear otro contexto de audio', async () => {
    await scheduler.start({
      bpm: 120,
      meter: getMeter('4/4'),
      chords: [createChord(parseNote('C'), 'maj', false, 'c')],
      loop: true,
      metronome: true,
    }, {
      onStep: jest.fn(),
      onPulse: jest.fn(),
      onFinish: jest.fn(),
    });

    scheduler.setProgression([createChord(parseNote('D'), 'maj', false, 'd')]);
    scheduler.setTempo(240);
    scheduler.setMeter(getMeter('3/4'));
    scheduler.setMetronome(false);

    expect(mockAudio.contexts).toHaveLength(1);
  });

  it('aplica los volúmenes configurados a los sonidos ya programados', async () => {
    await scheduler.start({
      bpm: 120,
      meter: getMeter('4/4'),
      chords: [createChord(parseNote('C'), 'maj', false, 'c')],
      loop: true,
      metronome: true,
    }, {
      onStep: jest.fn(),
      onPulse: jest.fn(),
      onFinish: jest.fn(),
    });

    scheduler.setVolumes(0.5, 0.4);

    expect(mockAudio.gainValues).toEqual(expect.arrayContaining([0.1625, 0.2]));
  });
});
