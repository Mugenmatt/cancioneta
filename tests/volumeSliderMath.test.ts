import { clampVolume, positionFromVolume, volumeFromPosition } from '@/design/volumeSliderMath';

describe('matemática del slider de volumen', () => {
  it('limita el valor entre 0 y 1', () => {
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(0.4)).toBe(0.4);
    expect(clampVolume(3)).toBe(1);
    expect(clampVolume(Number.NaN)).toBe(0);
  });

  it('traduce la posición a pasos del 5%', () => {
    expect(volumeFromPosition(0, 200)).toBe(0);
    expect(volumeFromPosition(50, 200)).toBe(0.25);
    expect(volumeFromPosition(101, 200)).toBe(0.5);
    expect(volumeFromPosition(400, 200)).toBe(1);
    expect(volumeFromPosition(100, 0)).toBe(0);
  });

  it('traduce el valor a posición', () => {
    expect(positionFromVolume(0.5, 200)).toBe(100);
    expect(positionFromVolume(2, 200)).toBe(200);
    expect(positionFromVolume(0.4, -10)).toBe(0);
  });
});
