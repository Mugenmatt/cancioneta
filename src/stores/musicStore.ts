import { create } from 'zustand';
import type { Chord, Key, KeyState, QualityId } from '@/music/theory';
import { createChord, progressionFingerprint, rollProgression, type RollResult } from '@/music/progressionDice';
import { parseNote, noteFromPitchClass, pitchClass } from '@/music/theory';
import { detectKeys } from '@/music/keyDetector';
import { randomService } from '@/services/random/RandomService';

interface MusicState {
  chords: Chord[];
  count: number;
  keyState: KeyState;
  bpm: number;
  adventure: number;
  includeSevenths: boolean;
  isPlaying: boolean;
  currentStep: number;
  lastRoll: RollResult | null;
  roll: () => Promise<void>;
  addChord: () => void;
  removeChord: (id: string) => void;
  updateChord: (id: string, root: Chord['root'], quality: QualityId) => void;
  cycleRoot: (id: string, semitones: number) => void;
  setQuality: (id: string, quality: QualityId) => void;
  toggleLock: (id: string) => void;
  moveChord: (from: number, to: number) => void;
  setCount: (count: number) => void;
  setBpm: (bpm: number) => void;
  setAdventure: (adventure: number) => void;
  setSevenths: (enabled: boolean) => void;
  setKey: (key: Key | null, source?: 'auto' | 'manual') => void;
  detect: () => void;
  clear: () => void;
  setPlaying: (playing: boolean) => void;
  setStep: (step: number) => void;
}

const initialChords = (): Chord[] => [
  createChord(parseNote('C'), 'maj'),
  createChord(parseNote('G'), 'maj'),
  createChord(parseNote('A'), 'min'),
  createChord(parseNote('F'), 'maj'),
];

export const useMusicStore = create<MusicState>((set, get) => ({
  chords: initialChords(),
  count: 4,
  keyState: { key: null, source: 'auto' },
  bpm: 90,
  adventure: 20,
  includeSevenths: false,
  isPlaying: false,
  currentStep: -1,
  lastRoll: null,

  roll: async () => {
    const state = get();
    let result = rollProgression({
      count: state.count,
      keyState: state.keyState,
      sevenths: state.includeSevenths,
      adventure: state.adventure,
      current: state.chords,
      random: randomService,
    });
    let fingerprint = progressionFingerprint(result.key, result.chords);
    for (let attempt = 0; attempt < 10 && await randomService.isProgressionUsed(fingerprint); attempt += 1) {
      result = rollProgression({
        count: state.count,
        keyState: state.keyState,
        sevenths: state.includeSevenths,
        adventure: state.adventure + attempt * 5,
        current: state.chords,
        random: randomService,
      });
      fingerprint = progressionFingerprint(result.key, result.chords);
    }
    await randomService.markProgression(fingerprint);
    set({ chords: result.chords, lastRoll: result });
  },

  addChord: () => set((state) => {
    if (state.chords.length >= 8) return state;
    const key = state.keyState.key;
    const root = key ? key.tonic : parseNote('C');
    return { chords: [...state.chords, createChord(root, 'maj')], count: state.chords.length + 1 };
  }),

  removeChord: (id) => set((state) => ({
    chords: state.chords.length <= 1 ? state.chords : state.chords.filter((c) => c.id !== id),
    count: state.chords.length <= 1 ? state.count : state.chords.length - 1,
  })),

  updateChord: (id, root, quality) => set((state) => ({
    chords: state.chords.map((c) => (c.id === id ? { ...c, root, quality } : c)),
  })),

  cycleRoot: (id, semitones) => set((state) => ({
    chords: state.chords.map((c) => {
      if (c.id !== id) return c;
      const nextPc = (pitchClass(c.root) + semitones + 120) % 12;
      return { ...c, root: noteFromPitchClass(nextPc, state.keyState.key?.mode === 'minor' ? 'flat' : 'sharp') };
    }),
  })),

  setQuality: (id, quality) => set((state) => ({
    chords: state.chords.map((c) => (c.id === id ? { ...c, quality } : c)),
  })),

  toggleLock: (id) => set((state) => ({
    chords: state.chords.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)),
  })),

  moveChord: (from, to) => set((state) => {
    if (from === to || from < 0 || to < 0 || from >= state.chords.length || to >= state.chords.length) return state;
    const chords = [...state.chords];
    const [item] = chords.splice(from, 1);
    chords.splice(to, 0, item);
    return { chords };
  }),

  setCount: (count) => {
    const next = Math.max(1, Math.min(8, count));
    set({ count: next });
    void get().roll();
  },

  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(200, Math.round(bpm))) }),
  setAdventure: (adventure) => set({ adventure: Math.max(0, Math.min(100, Math.round(adventure))) }),
  setSevenths: (enabled) => set({ includeSevenths: enabled }),

  setKey: (key, source = 'manual') => set({ keyState: { key, source } }),

  detect: () => {
    const detection = detectKeys(get().chords);
    if (detection.top) set({ keyState: { key: detection.top.key, source: 'auto' } });
  },

  clear: () => set({ chords: [createChord(parseNote('C'), 'maj')], count: 1, keyState: { key: null, source: 'auto' }, lastRoll: null }),

  setPlaying: (playing) => set({ isPlaying: playing, currentStep: playing ? get().currentStep : -1 }),
  setStep: (step) => set({ currentStep: step }),
}));

export const CURRENT_MUSIC_STORE_VERSION = 1;
