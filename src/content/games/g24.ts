import type { PoolId } from '@/core/types';

export const DICE: { pool: PoolId; label: string; icon: 'map-pin' | 'user' | 'box' | 'zap' | 'heart' | 'star' }[] = [
  { pool: 'dice_lugar', label: 'Lugar', icon: 'map-pin' },
  { pool: 'dice_personaje', label: 'Personaje', icon: 'user' },
  { pool: 'dice_objeto', label: 'Objeto', icon: 'box' },
  { pool: 'dice_accion', label: 'Acción', icon: 'zap' },
  { pool: 'dice_emocion', label: 'Emoción', icon: 'heart' },
  { pool: 'dice_cualidad', label: 'Cualidad', icon: 'star' },
];

export const DICE_DURATIONS = [5, 10, 15] as const;

export const DICE_TEXT = {
  intro: 'Tirá los dados. Bloqueá lo que te sirva. Escribí una canción con todo.',
  rollAll: 'Tirar todos',
  lockedHint: 'Tocar para volver a tirar',
  lockedHintBlocked: 'Bloqueado: desbloqueá para volver a tirar',
  unrolled: 'sin tirar',
  waiting: '…',
  missing: '—',
  dieLabel: (label: string, value: string) => `${label}: ${value}`,
  lock: (label: string) => `Bloquear ${label}`,
  unlock: (label: string) => `Desbloquear ${label}`,
  stopTimer: 'Detener temporizador',
  stop: 'Detener',
  minutes: (value: number) => `${value} min`,
  timerLabel: 'Temporizador opcional',
  copy: 'Copiar escena',
  copied: 'Copiada',
  send: 'Llevar al cuaderno',
  note: '«Llevar al cuaderno» agrega la escena como una estrofa nueva. Tu texto existente no se modifica.',
  sceneLine: (label: string, value: string) => `${label}: ${value}`,
} as const;
