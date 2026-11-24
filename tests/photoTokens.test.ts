import {
  PHOTO_GRADIENTS,
  PHOTO_INK,
  PHOTO_SCRIM_OPACITY,
  photoGradient,
  photoWorstCaseBackground,
} from '@/design/photoTokens';
import { contrastRatio, mix, shadows } from '@/design/tokens';

describe('tokens de imágenes del collage', () => {
  it('selecciona la paleta sin salirse del rango', () => {
    expect(photoGradient(0)).toEqual(PHOTO_GRADIENTS[0]);
    expect(photoGradient(6)).toEqual(PHOTO_GRADIENTS[0]);
    expect(photoGradient(-1)).toEqual(PHOTO_GRADIENTS[PHOTO_GRADIENTS.length - 1]);
    expect(photoGradient('x')).toEqual(PHOTO_GRADIENTS[0]);
  });

  it('mantiene contraste AA del texto sobre fotos y gradientes', () => {
    const backgrounds = [
      photoWorstCaseBackground(),
      ...PHOTO_GRADIENTS.flatMap(([from, to]) => [
        mix(from, shadows.color, PHOTO_SCRIM_OPACITY),
        mix(to, shadows.color, PHOTO_SCRIM_OPACITY),
      ]),
    ];
    for (const background of backgrounds) {
      expect(contrastRatio(PHOTO_INK, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
