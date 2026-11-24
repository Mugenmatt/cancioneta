import { contentWidth, spacing } from '@/design/tokens';
import { getScreenLayout } from '@/design/screenLayout';

describe('getScreenLayout', () => {
  it('usa el ancho de lectura y el padding compacto por default', () => {
    expect(getScreenLayout(390, 'reading')).toEqual({
      maxWidth: contentWidth.reading,
      paddingHorizontal: spacing.lg,
    });
  });

  it('usa el ancho de grilla cuando se pide', () => {
    expect(getScreenLayout(1024, 'grid')).toEqual({
      maxWidth: contentWidth.grid,
      paddingHorizontal: spacing.xl,
    });
  });

  it('aumenta el padding al llegar al umbral de lectura', () => {
    expect(getScreenLayout(contentWidth.reading - 1, 'reading').paddingHorizontal).toBe(spacing.lg);
    expect(getScreenLayout(contentWidth.reading, 'reading').paddingHorizontal).toBe(spacing.xl);
  });

  it('tolera anchors inválidos', () => {
    expect(getScreenLayout(Number.NaN, 'reading').paddingHorizontal).toBe(spacing.lg);
    expect(getScreenLayout(-10, 'grid').paddingHorizontal).toBe(spacing.lg);
  });
});
