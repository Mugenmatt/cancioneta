import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { getMeter, nextMetronomePulse, pulseIntervalMs, type Accent, type Meter } from '@/music/meter';
import { PIANO_SAMPLE_FILES } from './pianoSamples';

const TICK_MIDI: Record<Accent, number> = { strong: 84, secondary: 79, weak: 72 };
const TICK_VOLUME: Record<Accent, number> = { strong: 1, secondary: 0.72, weak: 0.45 };

interface Voice {
  player: AudioPlayer;
  midi: number | null;
}

export type MetronomeListener = (pulse: number, accent: Accent) => void;

export class MetronomeEngine {
  private voices = new Map<Accent, Voice>();
  private modeReady = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private meter: Meter = getMeter('4/4');
  private pulse = 0;
  private listener: MetronomeListener | null = null;

  private async prepare(): Promise<void> {
    if (this.modeReady) return;
    this.modeReady = true;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        allowsRecording: false,
        shouldPlayInBackground: false,
      });
    } catch {
      this.modeReady = false;
    }
  }

  private async playTick(accent: Accent): Promise<void> {
    await this.prepare();
    const midi = TICK_MIDI[accent];
    const source = PIANO_SAMPLE_FILES[midi];
    if (!source) return;
    let voice = this.voices.get(accent);
    if (!voice) {
      voice = { player: createAudioPlayer(null), midi: null };
      this.voices.set(accent, voice);
    }
    try {
      voice.player.pause();
      if (voice.midi !== midi) {
        voice.player.replace(source);
        voice.midi = midi;
      }
      voice.player.volume = TICK_VOLUME[accent];
      await voice.player.seekTo(0);
      voice.player.play();
    } catch {
      // Un fallo del sample no debe cortar el metrónomo.
    }
  }

  private emit(): void {
    const accent = this.meter.accents[this.pulse];
    this.listener?.(this.pulse, accent);
    void this.playTick(accent);
  }

  start(bpm: number, meter: Meter, listener: MetronomeListener): void {
    this.stop();
    this.meter = meter;
    this.listener = listener;
    this.pulse = 0;
    this.emit();
    this.timer = setInterval(() => {
      this.pulse = nextMetronomePulse(this.pulse, this.meter);
      this.emit();
    }, pulseIntervalMs(bpm));
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.pulse = 0;
    this.listener = null;
  }

  isRunning(): boolean {
    return this.timer !== null;
  }

  dispose(): void {
    this.stop();
    for (const voice of this.voices.values()) {
      try {
        voice.player.release();
      } catch {
        // noop
      }
    }
    this.voices.clear();
  }
}

export const metronomeEngine = new MetronomeEngine();
