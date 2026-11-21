import { Asset } from 'expo-asset';
import {
  AudioContext,
  AudioManager,
  type AudioBuffer,
  type AudioBufferSourceNode,
  type GainNode,
} from 'react-native-audio-api';
import type { Accent } from '@/music/meter';
import type { Chord } from '@/music/theory';
import { PIANO_SAMPLE_FILES } from './pianoSamples';
import { PlaybackTimeline, type PlaybackConfig } from './playbackTimeline';

const MIN_MIDI = 36;
const MAX_MIDI = 84;
const LOOKAHEAD_SECONDS = 0.12;
const SCHEDULER_INTERVAL_MS = 25;
const PIANO_VOLUME = 0.65;
const CLICK_SECONDS: Record<Accent, number> = { strong: 0.075, secondary: 0.055, weak: 0.04 };
const TICK_VOLUME: Record<Accent, number> = { strong: 0.5, secondary: 0.36, weak: 0.225 };

type SoundKind = 'chords' | 'metronome';

interface ActiveGain {
  base: number;
  kind: SoundKind;
}

export interface ScheduledPlaybackCallbacks {
  onStart?: () => void;
  onStep: (step: number) => void;
  onPulse: (pulse: number, accent: Accent) => void;
  onFinish: () => void;
}

function playableMidi(midi: number): number {
  let value = midi;
  while (value < MIN_MIDI) value += 12;
  while (value > MAX_MIDI) value -= 12;
  return value;
}

function volumeScale(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0, Math.min(1, value));
}

function createClickBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 0x9e3779b9;
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = (seed / 0xffffffff) * 2 - 1;
    const highPassed = noise - previous * 0.75;
    previous = noise;
    const progress = i / length;
    const envelope = Math.exp(-progress * 16) * Math.min(1, progress * 500);
    data[i] = highPassed * envelope * 0.7;
  }
  return buffer;
}

export class AudioScheduler {
  private context: AudioContext | null = null;
  private readonly buffers = new Map<number, AudioBuffer>();
  private readonly clickBuffers = new Map<Accent, AudioBuffer>();
  private readonly sources = new Set<AudioBufferSourceNode>();
  private readonly gains = new Map<GainNode, ActiveGain>();
  private readonly uiTimers = new Set<ReturnType<typeof setTimeout>>();
  private preparePromise: Promise<void> | null = null;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private finishTimer: ReturnType<typeof setTimeout> | null = null;
  private timeline: PlaybackTimeline | null = null;
  private callbacks: ScheduledPlaybackCallbacks | null = null;
  private config: PlaybackConfig | null = null;
  private chordsVolume = 1;
  private metronomeVolume = 1;
  private progressionSignature: string | null = null;
  private currentBpm: number | null = null;
  private currentMetronome: boolean | null = null;
  private currentLoop: boolean | null = null;
  private runId = 0;

  prepare(): Promise<void> {
    if (!this.preparePromise) {
      this.preparePromise = this.prepareInternal().catch((error: unknown) => {
        this.preparePromise = null;
        throw error;
      });
    }
    return this.preparePromise;
  }

  async start(config: PlaybackConfig, callbacks: ScheduledPlaybackCallbacks): Promise<void> {
    this.stop();
    const token = this.runId;
    await this.prepare();
    if (token !== this.runId || !this.context) return;

    this.config = { ...config };
    this.progressionSignature = JSON.stringify(config.chords);
    this.currentBpm = config.bpm;
    this.currentMetronome = config.metronome;
    this.currentLoop = config.loop;
    this.callbacks = callbacks;
    this.timeline = new PlaybackTimeline(this.config, this.context.currentTime + LOOKAHEAD_SECONDS);
    this.callbacks.onStart?.();
    this.schedulerTimer = setInterval(this.tick, SCHEDULER_INTERVAL_MS);
    this.tick();
  }

  stop(): void {
    this.runId += 1;
    if (this.schedulerTimer) clearInterval(this.schedulerTimer);
    this.schedulerTimer = null;
    if (this.finishTimer) clearTimeout(this.finishTimer);
    this.finishTimer = null;
    for (const timer of this.uiTimers) clearTimeout(timer);
    this.uiTimers.clear();
    this.timeline = null;
    this.callbacks = null;
    this.config = null;

    const now = this.context?.currentTime ?? 0;
    for (const source of this.sources) {
      try {
        source.stop(now);
        source.disconnect();
      } catch {
        source.disconnect();
      }
    }
    this.sources.clear();
    this.gains.clear();
  }

  setLoop(loop: boolean): void {
    if (loop === this.currentLoop) return;
    this.currentLoop = loop;
    if (this.config) this.config.loop = loop;
    this.timeline?.setPendingConfig({ loop });
  }

  setProgression(chords: Chord[]): void {
    const signature = JSON.stringify(chords);
    if (signature === this.progressionSignature) return;
    this.progressionSignature = signature;
    this.timeline?.setPendingConfig({ chords });
  }

  setTempo(bpm: number): void {
    if (bpm === this.currentBpm) return;
    this.currentBpm = bpm;
    this.timeline?.setPendingConfig({ bpm });
  }

  setMetronome(enabled: boolean): void {
    if (enabled === this.currentMetronome) return;
    this.currentMetronome = enabled;
    this.timeline?.setPendingConfig({ metronome: enabled });
  }

  setVolumes(chordsVolume: number, metronomeVolume: number): void {
    this.chordsVolume = volumeScale(chordsVolume);
    this.metronomeVolume = volumeScale(metronomeVolume);
    for (const [node, active] of this.gains) {
      const scale = active.kind === 'chords' ? this.chordsVolume : this.metronomeVolume;
      node.gain.value = active.base * scale;
    }
  }

  async playPreview(midis: number[], spacingMs = 0, velocity = 1): Promise<void> {
    await this.prepare();
    const context = this.context;
    if (!context) return;
    const start = context.currentTime;
    const spacing = Math.max(0, spacingMs) / 1000;
    const balance = 1 / Math.sqrt(midis.length);
    for (let i = 0; i < midis.length; i += 1) {
      const buffer = this.buffers.get(playableMidi(midis[i]));
      if (!buffer) continue;
      const level = (i === 0 ? velocity : velocity * 0.78) * balance;
      this.playBuffer(buffer, start + i * spacing, PIANO_VOLUME * level, 'chords');
    }
  }

  private async prepareInternal(): Promise<void> {
    AudioManager.setSystemOptions({ ios: { category: 'playback', options: ['mixWithOthers'] } });
    const context = new AudioContext();
    if (context.state === 'suspended') await context.resume();
    this.context = context;

    for (const accent of ['strong', 'secondary', 'weak'] as const) {
      this.clickBuffers.set(accent, createClickBuffer(context, CLICK_SECONDS[accent]));
    }

    const midis = Object.keys(PIANO_SAMPLE_FILES).map(Number);
    await Promise.all(midis.map(async (midi) => {
      const source = PIANO_SAMPLE_FILES[midi];
      if (!source) return;
      const asset = Asset.fromModule(source);
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      if (!uri) return;
      const buffer = await context.decodeAudioData(uri);
      this.buffers.set(midi, buffer);
    }));
  }

  private readonly tick = (): void => {
    const context = this.context;
    const timeline = this.timeline;
    if (!context || !timeline) return;

    const events = timeline.takeEventsUntil(context.currentTime + LOOKAHEAD_SECONDS);
    for (const event of events) {
      if (event.kind === 'note') {
        const buffer = this.buffers.get(playableMidi(event.midi));
        if (buffer) this.playBuffer(buffer, event.time, PIANO_VOLUME * event.velocity, 'chords');
        this.scheduleUi(event.time, () => this.callbacks?.onStep(event.step));
      } else {
        const buffer = this.clickBuffers.get(event.accent);
        if (buffer) this.playBuffer(buffer, event.time, TICK_VOLUME[event.accent], 'metronome');
        this.scheduleUi(event.time, () => this.callbacks?.onPulse(event.pulse, event.accent));
      }
    }

    const endTime = timeline.endTime;
    if (endTime === null && this.finishTimer !== null) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
    if (endTime !== null && this.finishTimer === null) {
      this.finishTimer = setTimeout(() => {
        this.finishTimer = null;
        const finish = this.callbacks?.onFinish;
        this.stop();
        finish?.();
      }, Math.max(0, (endTime - context.currentTime) * 1000));
    }
  };

  private playBuffer(buffer: AudioBuffer, when: number, baseVolume: number, kind: SoundKind): void {
    const context = this.context;
    if (!context) return;

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    const scale = kind === 'chords' ? this.chordsVolume : this.metronomeVolume;
    gain.gain.value = Math.max(0, Math.min(1, baseVolume * scale));
    this.gains.set(gain, { base: baseVolume, kind });
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => {
      this.sources.delete(source);
      this.gains.delete(gain);
      source.disconnect();
      gain.disconnect();
    };
    this.sources.add(source);
    source.start(when);
  }

  private scheduleUi(time: number, callback: () => void): void {
    const context = this.context;
    if (!context) return;
    const delay = Math.max(0, (time - context.currentTime) * 1000);
    const timer = setTimeout(() => {
      this.uiTimers.delete(timer);
      if (this.timeline) callback();
    }, delay);
    this.uiTimers.add(timer);
  }
}

export const audioScheduler = new AudioScheduler();
