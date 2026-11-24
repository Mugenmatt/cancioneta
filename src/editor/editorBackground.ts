import { mix, type CoreColors } from '@/design/tokens';

export type EditorBackground = readonly [string, string];

const WRITING_END_BLEND = 0.35;

export function editorBackground(colors: CoreColors, writing: boolean, focusMode: boolean): EditorBackground {
  if (focusMode) return [colors.bgBase, colors.bgBase];
  return [colors.bgBase, writing ? mix(colors.bgBase, colors.bgSunken, WRITING_END_BLEND) : colors.bgSunken];
}
