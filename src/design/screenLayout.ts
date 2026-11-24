import { contentWidth, spacing } from './tokens';

export type ScreenMaxWidth = keyof typeof contentWidth;

export interface ScreenLayout {
  maxWidth: number;
  paddingHorizontal: number;
}

export function getScreenLayout(windowWidth: number, maxWidth: ScreenMaxWidth): ScreenLayout {
  const width = Number.isFinite(windowWidth) ? Math.max(0, windowWidth) : 0;
  return {
    maxWidth: contentWidth[maxWidth],
    paddingHorizontal: width >= contentWidth.reading ? spacing.xl : spacing.lg,
  };
}
