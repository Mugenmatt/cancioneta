import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';
import { coreColors, type ColorMode, type CoreColors } from './tokens';
import { themeFor, type GameTheme } from './themes';

export interface CoreTheme {
  mode: ColorMode;
  colors: CoreColors;
  reduceMotion: boolean;
}

export function useCoreTheme(): CoreTheme {
  const system = useColorScheme();
  const preference = useSettingsStore((s) => s.theme);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const mode: ColorMode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  return { mode, colors: coreColors[mode], reduceMotion };
}

export function useGameTheme(id: string): GameTheme {
  const { mode } = useCoreTheme();
  return themeFor(id, mode);
}
