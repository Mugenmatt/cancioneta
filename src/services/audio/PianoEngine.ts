import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { PIANO_SAMPLE_FILES } from './pianoSamples';

const MIN_MIDI = 36;
const MAX_MIDI = 84;
const VOICE_COUNT = 16;

function playableMidi(midi: number): number {
  let value = midi;
  while (value < MIN_MIDI) value += 12;
  while (value > MAX_MIDI) value -= 12;
  return value;
}

interface Voice {
  player: AudioPlayer;
  midi: number | null;
  startedAt: number;
}

export class PianoEngine {
  private voices: Voice[] = [];
  private modeReady = false;
  private volume = 0.65;
  private muted = false;

  async prepare(): Promise<void> {
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

  private voiceFor(midi: number): Voice {
    const free = this.voices.find((voice) => !voice.player.playing);
    if (free) return free;
    if (this.voices.length < VOICE_COUNT) {
      const voice: Voice = { player: createAudioPlayer(null), midi: null, startedAt: 0 };
      this.voices.push(voice);
      return voice;
    }
    return this.voices.reduce((oldest, voice) => (voice.startedAt < oldest.startedAt ? voice : oldest), this.voices[0]);
  }

  async playMidi(midi: number, velocity = 1): Promise<void> {
    await this.prepare();
    const target = playableMidi(midi);
    const source = PIANO_SAMPLE_FILES[target];
    if (!source) return;
    const voice = this.voiceFor(target);
    try {
      voice.player.pause();
      if (voice.midi !== target) {
        voice.player.replace(source);
        voice.midi = target;
      }
      voice.player.volume = this.muted ? 0 : Math.max(0, Math.min(1, this.volume * velocity));
      voice.startedAt = Date.now();
      await voice.player.seekTo(0);
      voice.player.play();
    } catch {
      // Un sample que falla no debe romper la interacción.
    }
  }

  async playMidiSequence(midis: number[], spacingMs = 35, velocity = 1): Promise<void> {
    for (let i = 0; i < midis.length; i += 1) {
      void this.playMidi(midis[i], velocity);
      if (i < midis.length - 1) await new Promise((resolve) => setTimeout(resolve, spacingMs));
    }
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  dispose(): void {
    for (const voice of this.voices) {
      try {
        voice.player.release();
      } catch {
        // noop
      }
    }
    this.voices = [];
  }
}

export const piano = new PianoEngine();

export class Metronome {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(bpm: number, onTick: (beat: number) => void): void {
    this.stop();
    let beat = 0;
    const interval = Math.max(80, 60000 / Math.max(40, Math.min(200, bpm)));
    onTick(beat);
    this.timer = setInterval(() => {
      beat = (beat + 1) % 4;
      onTick(beat);
    }, interval);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  isRunning(): boolean {
    return this.timer !== null;
  }
}

export const metronome = new Metronome();
