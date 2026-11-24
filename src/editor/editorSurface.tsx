import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Screen } from '@/design/components/Screen';
import { useCoreTheme } from '@/design/ThemeProvider';
import { contentWidth, spacing } from '@/design/tokens';
import { editorBackground } from './editorBackground';

interface EditorSurfaceProps {
  children: ReactNode;
  writing: boolean;
  focusMode: boolean;
}

export function EditorSurface({ children, writing, focusMode }: EditorSurfaceProps) {
  const { colors } = useCoreTheme();
  return (
    <Screen
      scroll
      maxWidth="reading"
      backgroundColors={editorBackground(colors, writing, focusMode)}
      contentStyle={[styles.reading, focusMode && styles.focused]}
    >
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  reading: { width: '100%', maxWidth: contentWidth.reading, alignSelf: 'center' },
  focused: { paddingTop: spacing.xs },
});
