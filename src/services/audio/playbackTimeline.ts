import { nextPlaybackStep } from '@/music/playback';
import { pulseIntervalMs, type Accent, type Meter } from '@/music/meter';
import type { Chord } from '@/music/theory';
import { voicingForProgression } from '@/music/voicing';

export const NOTE_SPACING_SECONDS = 0;

const EPSILON = 0.000001;

export interface PlaybackConfig {
  bpm: number;
  meter: Meter;
  chords: Chord[];
  loop: boolean;
  metronome: boolean;
}

export type PlaybackEvent =
  | { kind: 'pulse'; time: number; pulse: number; accent: Accent }
  | { kind: 'note'; time: number; midi: number; velocity: number; step: number };

export class PlaybackTimeline {
  private readonly config: PlaybackConfig;
  private readonly pulseSeconds: number;
  private readonly barSeconds: number;
  private readonly queue: PlaybackEvent[] = [];
  private readonly voicings: number[][];
  private pulse = 0;
  private step = 0;
  private time: number;
  private endAt: number | null = null;

  constructor(config: PlaybackConfig, startTime: number) {
    this.config = config;
    this.pulseSeconds = pulseIntervalMs(config.bpm) / 1000;
    this.barSeconds = config.meter.pulses * this.pulseSeconds;
    this.voicings = voicingForProgression(config.chords);
    this.time = startTime;
  }

  get endTime(): number | null {
    return this.endAt;
  }

  get hasEvents(): boolean {
    return this.queue.length > 0 || this.canScheduleMore();
  }

  takeEventsUntil(horizon: number): PlaybackEvent[] {
    const due: PlaybackEvent[] = [];
    while (this.canScheduleMore()) {
      if (this.queue.length > 0 && this.queue[0].time > horizon) break;
      this.fillPulse();
      while (this.queue.length > 0 && this.queue[0].time <= horizon) {
        due.push(this.queue.shift() as PlaybackEvent);
      }
    }
    return due;
  }

  private canScheduleMore(): boolean {
    return this.endAt === null || this.time < this.endAt - EPSILON;
  }

  private fillPulse(): void {
    const { meter, chords, loop, metronome } = this.config;
    const pulseInBar = this.pulse % meter.pulses;
    const barTime = this.time;

    if (metronome) {
      this.queue.push({
        kind: 'pulse',
        time: barTime,
        pulse: pulseInBar,
        accent: meter.accents[pulseInBar] ?? 'weak',
      });
    }

    if (pulseInBar === 0) {
      if (chords.length === 0) {
        this.endAt = barTime;
        return;
      }
      const midis = this.voicings[this.step];
      if (midis) {
        const balance = 1 / Math.sqrt(midis.length);
        for (let i = 0; i < midis.length; i += 1) {
          this.queue.push({
            kind: 'note',
            time: barTime + i * NOTE_SPACING_SECONDS,
            midi: midis[i],
            velocity: (i === 0 ? 1 : 0.78) * balance,
            step: this.step,
          });
        }
      }
      const next = nextPlaybackStep(this.step, chords.length, loop);
      if (next === null) this.endAt = barTime + this.barSeconds;
      else this.step = next;
    }

    this.pulse += 1;
    this.time += this.pulseSeconds;
  }
}
