import { coreColors } from '@/design/tokens';

export const APP_META = {
  name: 'Cancioneta',
  description: 'Componé canciones con juegos creativos, acordes y estructuras poéticas.',
  lang: 'es-AR',
  themeColor: coreColors.light.bgBase,
} as const;

export const NAVIGATION_TEXT = {
  back: 'Volver',
} as const;

export const CHORDS_TEXT = {
  volume: 'Volumen',
  metronomeVolume: 'Volumen del metrónomo',
  chordsVolume: 'Volumen de los acordes',
} as const;
