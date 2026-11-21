import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useCoreTheme } from '../ThemeProvider';
import { alpha, minTouch, radii, spacing } from '../tokens';
import { AppText } from './Text';

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger' | 'onAccent';

interface ButtonProps {
  label: string;
  onPress: () => void;
  tone?: Tone;
  accent?: string;
  accentInk?: string;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  tone = 'primary',
  accent,
  accentInk,
  icon,
  disabled = false,
  loading = false,
  small = false,
  haptic = true,
  style,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { colors } = useCoreTheme();
  const accentColor = accent ?? colors.accentCore;
  const accentText = accentInk ?? '#FFFFFF';

  const palette: Record<Tone, { bg: string; fg: string; border: string }> = {
    primary: { bg: accentColor, fg: accentText, border: accentColor },
    onAccent: { bg: accentText, fg: accentColor, border: accentText },
    secondary: { bg: 'transparent', fg: accentColor, border: accentColor },
    ghost: { bg: 'transparent', fg: colors.textSecondary, border: 'transparent' },
    danger: { bg: 'transparent', fg: colors.stateError, border: alpha(colors.stateError, 0.35) },
  };
  const p = palette[tone];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={() => {
        if (haptic) void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.regular,
        { backgroundColor: p.bg, borderColor: p.border },
        pressed && { opacity: 0.78, transform: [{ scale: 0.985 }] },
        (disabled || loading) && { opacity: 0.62 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <AppText
            variant="label"
            color={p.fg}
            style={[styles.label, small && { fontSize: 11 }, icon ? { marginLeft: spacing.xs } : null]}
          >
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.chip,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouch,
    paddingHorizontal: spacing.lg,
  },
  regular: { paddingVertical: 14 },
  small: { paddingVertical: 8, paddingHorizontal: spacing.md },
  label: { letterSpacing: 1.1 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
