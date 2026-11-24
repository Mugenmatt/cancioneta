import { coreColors } from '@/design/tokens';

export const APP_META = {
  name: 'Cancioneta',
  description: 'Componé canciones con juegos creativos, acordes y estructuras poéticas.',
  lang: 'es-AR',
  themeColor: coreColors.light.bgBase,
} as const;

export const NAVIGATION_TEXT = {
  back: 'Volver',
  close: 'Cerrar',
} as const;

export const DICE_TEXT = {
  label: 'Tirar',
  hint: 'sorprendeme',
} as const;

export const TAB_LABELS = {
  home: 'Inicio',
  rhymes: 'Rimas',
  chords: 'Acordes',
  games: 'Juegos',
  write: 'Escribir',
} as const;

export const CHORDS_TEXT = {
  title: 'Acordes',
  laboratory: 'Laboratorio',
  rollChords: 'Tirar acordes',
  rollProgression: 'Tirar progresión',
  settings: 'Ajustes',
  explore: 'Explorar',
  key: 'Tonalidad',
  changeKey: 'Cambiar tonalidad',
  redetect: 'Volver a detectar',
  possible: 'Posible:',
  noKey: 'Sin tonalidad',
  keyManual: 'Elegida a mano',
  keyAmbiguous: 'Ambigua · elegí una',
  keyAuto: 'Detección automática',
  chooseKey: 'Elegir tonalidad',
  automatic: 'Automática',
  automaticDetail: 'Detecta desde los acordes o sortea al tirar',
  quality: 'Calidad',
  count: 'Cantidad',
  sevenths: 'Séptimas',
  yes: 'Sí',
  no: 'No',
  meter: 'Compás',
  adventure: 'Aventura armónica',
  order: 'Orden',
  moveLeft: 'Mover a la izquierda',
  sound: 'Sonido',
  tempo: 'Tempo',
  bpm: 'Pulso por minuto',
  bpmUnit: 'BPM',
  volume: 'Volumen',
  metronomeVolume: 'Volumen del metrónomo',
  chordsVolume: 'Volumen de los acordes',
  play: 'Escuchar',
  stop: 'Parar',
  loop: 'Repetir progresión',
  metronome: 'Metrónomo',
  playChord: 'Escuchar acorde',
  lockChord: 'Bloquear acorde',
  unlockChord: 'Desbloquear acorde',
  lowerHalf: 'Bajar medio tono',
  raiseHalf: 'Subir medio tono',
  changeQuality: 'Cambiar calidad de',
  addChord: 'Agregar acorde',
  maxChords: 'Máximo 16 acordes',
  clearProgression: 'Borrar progresión',
  exploreHint: 'Tirá una progresión o elegí una tonalidad para ver relaciones.',
  chordsInKey: 'Acordes en',
  neighborKeys: 'Tonalidades vecinas',
  substitutions: 'Sustituciones',
  secondaryDominants: 'Dominantes secundarias',
  currentProgression: 'Progresión actual',
  steps: {
    progression: 'Progresión',
    sound: 'Sonido',
    order: 'Orden',
    explore: 'Explorar',
  },
} as const;

export function chordsKeyTitle(keyName: string | null, possibleName: string | null): string {
  if (keyName) return keyName;
  if (possibleName) return `${CHORDS_TEXT.possible} ${possibleName}`;
  return CHORDS_TEXT.noKey;
}

export function chordsKeySource(manual: boolean, ambiguous: boolean): string {
  if (manual) return CHORDS_TEXT.keyManual;
  return ambiguous ? CHORDS_TEXT.keyAmbiguous : CHORDS_TEXT.keyAuto;
}

export function chordsMeterLabel(id: string): string {
  return `${CHORDS_TEXT.meter} ${id}`;
}

export function chordsMoveLabel(name: string): string {
  return `${CHORDS_TEXT.moveLeft} ${name}`;
}

export function chordsBpmValue(value: number): string {
  return `${value} ${CHORDS_TEXT.bpmUnit}`;
}

export function chordsInKeyText(keyName: string, chords: string[]): string {
  return `${CHORDS_TEXT.chordsInKey} ${keyName}: ${chords.join(' · ')}`;
}

export function chordsQualityChangeLabel(name: string): string {
  return `${CHORDS_TEXT.changeQuality} ${name}`;
}
