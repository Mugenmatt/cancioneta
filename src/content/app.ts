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

export const TAB_LABELS = {
  home: 'Inicio',
  rhymes: 'Rimas',
  chords: 'Acordes',
  games: 'Juegos',
  write: 'Escribir',
} as const;

export const CHORDS_TEXT = {
  volume: 'Volumen',
  metronomeVolume: 'Volumen del metrónomo',
  chordsVolume: 'Volumen de los acordes',
  addChord: 'Agregar acorde',
  maxChords: 'Máximo 16 acordes',
  clearProgression: 'Borrar progresión',
  tempo: 'Tempo',
  bpm: 'Pulso por minuto',
} as const;
