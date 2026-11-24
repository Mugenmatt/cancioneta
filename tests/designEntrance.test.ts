import { entranceDuration, entrancePose, modalAnimation } from '@/design/entrance';
import type { Entrance } from '@/design/themes';
import { motion, spacing } from '@/design/tokens';

const entrances: Entrance[] = ['rise', 'flip', 'fade', 'drop', 'slide'];

describe('pose de entrada de los temas', () => {
  it('usa desplazamientos de token para cada entrada', () => {
    expect(entrancePose('rise', false)).toEqual({ opacity: 0, translateX: 0, translateY: spacing.lg, rotate: 0 });
    expect(entrancePose('drop', false)).toEqual({ opacity: 0, translateX: 0, translateY: -spacing.lg, rotate: 0 });
    expect(entrancePose('slide', false)).toEqual({ opacity: 0, translateX: spacing.lg, translateY: 0, rotate: 0 });
    expect(entrancePose('flip', false)).toEqual({ opacity: 0, translateX: 0, translateY: 0, rotate: -spacing.xs });
    expect(entrancePose('fade', false)).toEqual({ opacity: 0, translateX: 0, translateY: 0, rotate: 0 });
  });

  it('con reducir movimiento conserva solo el fundido', () => {
    for (const entrance of entrances) {
      const pose = entrancePose(entrance, true);
      expect(pose.opacity).toBe(0);
      expect(pose.translateX).toBe(0);
      expect(pose.translateY).toBe(0);
      expect(pose.rotate).toBe(0);
    }
  });

  it('usa las duraciones de movimiento del sistema', () => {
    expect(entranceDuration(false)).toBe(motion.slow);
    expect(entranceDuration(true)).toBe(motion.fast);
  });

  it('desactiva el fundido del modal con reducir movimiento', () => {
    expect(modalAnimation(false)).toBe('fade');
    expect(modalAnimation(true)).toBe('none');
  });
});
