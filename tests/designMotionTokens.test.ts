import { motion, shadows, spacing } from '@/design/tokens';

describe('tokens de movimiento y elevación', () => {
  it('define las duraciones de movimiento del sistema', () => {
    expect(motion.fast).toBe(120);
    expect(motion.base).toBe(240);
    expect(motion.slow).toBe(480);
  });

  it('define el resorte compartido de dados y tarjetas y la curva de entrada', () => {
    expect(motion.spring).toEqual({ duration: motion.slow, dampingRatio: 0.8 });
    expect(motion.easing.enter).toEqual([0.215, 0.61, 0.355, 1]);
  });

  it('expresa los radios y desplazamientos de las sombras con tokens de espaciado', () => {
    expect(shadows.sheet.shadowRadius).toBe(spacing.lg);
    expect(shadows.sheet.shadowOffset.height).toBe(-spacing.xs);
    expect(shadows.raised.shadowOffset.height).toBe(spacing.xxs);
  });
});
