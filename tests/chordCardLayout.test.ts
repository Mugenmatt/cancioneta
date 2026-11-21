import { spacing } from '@/design/tokens';
import { getChordCardLayout } from '@/music/components/chordCardLayout';

describe('layout de tarjetas de acorde', () => {
  it('usa una columna en pantallas compactas', () => {
    const layout = getChordCardLayout(320);
    expect(layout.columns).toBe(1);
    expect(layout.cardWidth).toBe(320 - spacing.lg * 2);
  });

  it('usa dos columnas en un celular estándar', () => {
    const layout = getChordCardLayout(390);
    expect(layout.columns).toBe(2);
    expect(layout.cardWidth).toBeCloseTo((390 - spacing.lg * 2 - spacing.sm) / 2);
  });

  it('no desborda con ocho acordes', () => {
    const layout = getChordCardLayout(375);
    const used = layout.columns * layout.cardWidth + (layout.columns - 1) * spacing.sm;
    expect(used).toBeLessThanOrEqual(375 - spacing.lg * 2);
  });

  it('pasa a una columna con texto ampliado al 200%', () => {
    const layout = getChordCardLayout(390, 2);
    expect(layout.columns).toBe(1);
  });
});
