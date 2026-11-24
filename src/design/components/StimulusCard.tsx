import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import type { GameTheme } from '../themes';
import { alpha, fonts, radii, spacing } from '../tokens';
import { useEntranceStyle } from '../useEntranceStyle';
import { AppText } from './Text';

interface StimulusCardProps {
  theme: GameTheme;
  children: ReactNode;
  eyebrow?: string;
  caption?: string;
  style?: StyleProp<ViewStyle>;
  large?: boolean;
  footer?: ReactNode;
}

export function StimulusCard({ theme, children, eyebrow, caption, style, large = false, footer }: StimulusCardProps) {
  const entranceStyle = useEntranceStyle(theme.entrance);
  return (
    <Animated.View
      style={[
        styles.card,
        entranceStyle,
        {
          backgroundColor: theme.surface,
          borderColor: alpha(theme.accent, 0.28),
          shadowColor: theme.bg,
        },
        style,
      ]}
    >
      {eyebrow ? (
        <AppText variant="label" color={theme.accentText} style={{ marginBottom: spacing.sm }}>
          {eyebrow}
        </AppText>
      ) : null}
      <View style={large ? styles.large : undefined}>{children}</View>
      {caption ? (
        <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: spacing.md }}>
          {caption}
        </AppText>
      ) : null}
      {footer}
    </Animated.View>
  );
}

export function StimulusText({ theme, children, italic }: { theme: GameTheme; children: ReactNode; italic?: boolean }) {
  return (
    <AppText
      style={{
        fontFamily: italic ? fonts.displayItalic : fonts.displayRegular,
        fontSize: 28,
        lineHeight: 37,
        color: theme.ink,
      }}
    >
      {children}
    </AppText>
  );
}

export function StimulusNote({ theme, children }: { theme: GameTheme; children: ReactNode }) {
  return (
    <AppText variant="caption" color={theme.inkSoft} style={{ fontFamily: fonts.sans, lineHeight: 19 }}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card, borderWidth: 1, padding: spacing.lg,
    shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 5,
  },
  large: { minHeight: 120, justifyContent: 'center' },
});
