import { minTouch, spacing } from '@/design/tokens';

const MIN_CARD_WIDTH = minTouch * 3 + spacing.sm * 2;
const HORIZONTAL_INSET = spacing.lg * 2;

export function getChordCardLayout(windowWidth: number, fontScale = 1) {
  const availableWidth = Math.max(spacing.md, windowWidth - HORIZONTAL_INSET);
  const minWidth = MIN_CARD_WIDTH * Math.max(1, fontScale);
  const columns = Math.max(1, Math.floor((availableWidth + spacing.sm) / (minWidth + spacing.sm)));
  const cardWidth = Math.min(availableWidth, (availableWidth - spacing.sm * (columns - 1)) / columns);
  return { columns, cardWidth };
}
