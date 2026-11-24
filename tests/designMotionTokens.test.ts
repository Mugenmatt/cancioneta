import { motion, shadows, spacing } from '@/design/tokens';

describe('tokens de movimiento y elevación', () => {
  it('define las duraciones de movimiento del sistema', () => {
    expect(motion.fast).toBe(120);
    expect(motion.base).toBe(240);
    expect(motion.slow).toBe(480);
  });

  it('expresa los radios y desplazamientos de las sombras con tokens de espaciado', () => {
    expect(shadows.sheet.shadowRadius).toBe(spacing.lg);
    expect(shadows.sheet.shadowOffset.height).toBe(-spacing.xs);
    expect(shadows.raised.shadowOffset.height).toBe(spacing.xxs);
  });
});
