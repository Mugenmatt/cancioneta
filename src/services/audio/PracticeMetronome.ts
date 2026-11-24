import {
  AudioContext,
  AudioManager,
  type AudioBuffer,
  type AudioBufferSourceNode,
} from 'react-native-audio-api';
import type { Pulse } from '@/games/runtime/g47Logic';
import { ignoreError } from './recording';

const LOOKAHEAD_SECONDS = 0.12;
const SCHEDULER_INTERVAL_MS = 25;
const CLICK_SECONDS = { accent: 0.075, beat: 0.055, offbeat: 0.035 } as const;
const CLICK_VOLUME = { accent: 0.55, beat: 0.36, offbeat: 0.22 } as const;

type ClickKind = keyof typeof CLICK_SECONDS;

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
    data[i] = highPassed * Math.exp(-progress * 16) * Math.min(1, progress * 500) * 0.7;
  }
  return buffer;
}

/**
 * Metrónomo acentuado para el Juego de melodía. Reutiliza el mismo patrón de
 * click sintético de AudioScheduler, sin assets, sin permisos y sin tocar Fase 1.
 */
export class PracticeMetronome {
  private context: AudioContext | null = null;
  private clicks: Record<ClickKind, AudioBuffer> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly uiTimers = new Set<ReturnType<typeof setTimeout>>();
  private readonly sources = new Set<AudioBufferSourceNode>();
  private steps: Pulse[] = [];
  private stepDuration = 0;
  private nextTime = 0;
  private index = 0;
  private onPulse: ((index: number) => void) | null = null;

  private async prepare(): Promise<void> {
    if (!this.context) {
      AudioManager.setSystemOptions({ ios: { category: 'playback', options: ['mixWithOthers'] } });
      const context = new AudioContext();
      if (context.state === 'suspended') await context.resume();
      this.context = context;
      this.clicks = {
        accent: createClickBuffer(context, CLICK_SECONDS.accent),
        beat: createClickBuffer(context, CLICK_SECONDS.beat),
        offbeat: createClickBuffer(context, CLICK_SECONDS.offbeat),
      };
    }
  }

  async start(steps: readonly Pulse[], stepDuration: number, onPulse: (index: number) => void): Promise<boolean> {
    this.stop();
    if (!steps.length || stepDuration <= 0) return false;
    try {
      await this.prepare();
    } catch {
      return false;
    }
    const context = this.context;
    const clicks = this.clicks;
    if (!context || !clicks) return false;

    this.steps = [...steps];
    this.stepDuration = stepDuration;
    this.onPulse = onPulse;
    this.index = 0;
    this.nextTime = context.currentTime + LOOKAHEAD_SECONDS;
    this.timer = setInterval(this.tick, SCHEDULER_INTERVAL_MS);
    this.tick();
    return true;
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    for (const timer of this.uiTimers) clearTimeout(timer);
    this.uiTimers.clear();
    for (const source of this.sources) {
      ignoreError(() => source.stop());
      source.disconnect();
    }
    this.sources.clear();
    this.steps = [];
    this.onPulse = null;
  }

  dispose(): void {
    this.stop();
    this.context = null;
    this.clicks = null;
  }

  private readonly tick = (): void => {
    const context = this.context;
    const clicks = this.clicks;
    if (!context || !clicks || !this.timer) return;

    while (this.nextTime < context.currentTime + LOOKAHEAD_SECONDS) {
      const index = this.index % this.steps.length;
      const pulse = this.steps[index];
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = clicks[pulse.kind];
      gain.gain.value = CLICK_VOLUME[pulse.kind];
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        this.sources.delete(source);
        source.disconnect();
        gain.disconnect();
      };
      this.sources.add(source);
      source.start(this.nextTime);

      const delay = Math.max(0, (this.nextTime - context.currentTime) * 1000);
      const uiTimer = setTimeout(() => {
        this.uiTimers.delete(uiTimer);
        this.onPulse?.(index);
      }, delay);
      this.uiTimers.add(uiTimer);

      this.nextTime += this.stepDuration;
      this.index += 1;
    }
  };
}

export const practiceMetronome = new PracticeMetronome();
