import { alpha, mix, shadows } from './tokens';

export type PhotoGradient = [string, string];

export const PHOTO_GRADIENTS: PhotoGradient[] = [
  ['#7C8FA3', '#27384A'], ['#C66A4A', '#4A1D14'], ['#8A9B91', '#27352D'],
  ['#9BA66D', '#38421F'], ['#7A6A9A', '#2A2038'], ['#D6B36A', '#5A3E12'],
];

export const PHOTO_INK = '#FFFFFF';
export const PHOTO_SCRIM_OPACITY = 0.64;
export const PHOTO_SCRIM = alpha(shadows.color, PHOTO_SCRIM_OPACITY);
export const PHOTO_MODAL_BACKDROP = alpha(shadows.color, 0.9);

export function photoGradient(index?: unknown): PhotoGradient {
  const value = Number(index ?? 0);
  const finite = Number.isFinite(value) ? Math.trunc(value) : 0;
  const wrapped = ((finite % PHOTO_GRADIENTS.length) + PHOTO_GRADIENTS.length) % PHOTO_GRADIENTS.length;
  return PHOTO_GRADIENTS[wrapped];
}

export function photoWorstCaseBackground(): string {
  return mix(PHOTO_INK, shadows.color, PHOTO_SCRIM_OPACITY);
}
