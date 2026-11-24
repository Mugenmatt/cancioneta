import type { Entrance } from './themes';
import { motion, spacing } from './tokens';

export interface EntrancePose {
  opacity: number;
  translateX: number;
  translateY: number;
  rotate: number;
}

export function entrancePose(entrance: Entrance, reduceMotion: boolean): EntrancePose {
  if (reduceMotion) return { opacity: 0, translateX: 0, translateY: 0, rotate: 0 };

  switch (entrance) {
    case 'rise':
      return { opacity: 0, translateX: 0, translateY: spacing.lg, rotate: 0 };
    case 'drop':
      return { opacity: 0, translateX: 0, translateY: -spacing.lg, rotate: 0 };
    case 'slide':
      return { opacity: 0, translateX: spacing.lg, translateY: 0, rotate: 0 };
    case 'flip':
      return { opacity: 0, translateX: 0, translateY: 0, rotate: -spacing.xs };
    case 'fade':
    default:
      return { opacity: 0, translateX: 0, translateY: 0, rotate: 0 };
  }
}

export function entranceDuration(reduceMotion: boolean): number {
  return reduceMotion ? motion.fast : motion.slow;
}
