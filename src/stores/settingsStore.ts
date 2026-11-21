import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

interface SettingsState {
  hydrated: boolean;
  theme: ThemePreference;
  includeStructure: boolean;
  reduceMotion: boolean;
  onboardingDone: boolean;
  onboardingReview: boolean;
  setTheme: (theme: ThemePreference) => void;
  setIncludeStructure: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  completeOnboarding: () => void;
  reviewOnboarding: () => void;
  dismissOnboardingReview: () => void;
  hydrate: () => Promise<void>;
}

const KEY = 'cancioneta.settings.v1';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function persist(state: Pick<SettingsState, 'theme' | 'includeStructure' | 'reduceMotion' | 'onboardingDone'>) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void AsyncStorage.setItem(KEY, JSON.stringify(state));
  }, 300);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  theme: 'system',
  includeStructure: true,
  reduceMotion: false,
  onboardingDone: false,
  onboardingReview: false,
  setTheme: (theme) => {
    set({ theme });
    persist({ ...get(), theme });
  },
  setIncludeStructure: (includeStructure) => {
    set({ includeStructure });
    persist({ ...get(), includeStructure });
  },
  setReduceMotion: (reduceMotion) => {
    set({ reduceMotion });
    persist({ ...get(), reduceMotion });
  },
  completeOnboarding: () => {
    set({ onboardingDone: true, onboardingReview: false });
    persist({ ...get(), onboardingDone: true });
  },
  reviewOnboarding: () => set({ onboardingReview: true }),
  dismissOnboardingReview: () => set({ onboardingReview: false }),
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>;
        set({
          theme: parsed.theme ?? 'system',
          includeStructure: parsed.includeStructure ?? true,
          reduceMotion: parsed.reduceMotion ?? false,
          onboardingDone: parsed.onboardingDone ?? false,
        });
      }
    } catch {
      // Ajustes corruptos: se usan los valores por defecto.
    } finally {
      set({ hydrated: true });
    }
  },
}));
