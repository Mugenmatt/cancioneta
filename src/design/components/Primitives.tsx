import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '../ThemeProvider';
import { alpha, fonts, hitSlop, minTouch, radii, spacing } from '../tokens';
import { goBackOrHome, HOME_HREF } from '../../core/navigation';
import { NAVIGATION_TEXT } from '../../content/app';
import { AppText } from './Text';

export function Pill({ label, color, selected = false, onPress, accessibilityLabel }: {
  label: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useCoreTheme();
  const tint = color ?? colors.accentCore;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: selected ? tint : colors.lineSubtle, backgroundColor: selected ? alpha(tint, 0.16) : 'transparent' },
      ]}
    >
      <AppText variant="caption" color={selected ? tint : colors.textSecondary} style={{ fontFamily: fonts.sansMedium }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function SectionLabel({ children, color }: { children: ReactNode; color?: string }) {
  const { colors } = useCoreTheme();
  return (
    <AppText variant="label" color={color ?? colors.textMuted} style={{ marginBottom: spacing.sm }}>
      {children}
    </AppText>
  );
}

export function Divider({ color }: { color?: string }) {
  const { colors } = useCoreTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: color ?? colors.lineSubtle }} />;
}

export function Surface({ children, style, color, border }: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
  border?: string;
}) {
  const { colors } = useCoreTheme();
  return (
    <View style={[styles.surface, { backgroundColor: color ?? colors.bgRaised, borderColor: border ?? colors.lineSubtle }, style]}>
      {children}
    </View>
  );
}

export function BackButton({ label = NAVIGATION_TEXT.back, color }: { label?: string; color?: string }) {
  const router = useRouter();
  const { colors } = useCoreTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={hitSlop}
      onPress={() => goBackOrHome(router, HOME_HREF)}
      style={styles.back}
    >
      <Feather name="chevron-left" size={22} color={color ?? colors.textPrimary} />
      <AppText variant="caption" color={color ?? colors.textPrimary} style={{ marginLeft: 2 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, color, size = 22 }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  const { colors } = useCoreTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { borderColor: colors.lineSubtle }, pressed && { opacity: 0.6 }]}
    >
      <Feather name={icon} size={size} color={color ?? colors.textPrimary} />
    </Pressable>
  );
}

export function ScreenHeader({ title, subtitle, right, onBack = true, color }: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: boolean;
  color?: string;
}) {
  const { colors } = useCoreTheme();
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {onBack ? <BackButton color={color} /> : null}
        {title ? (
          <View style={{ marginLeft: onBack ? spacing.md : 0, flex: 1 }}>
            <AppText variant="caption" color={color ?? colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }} numberOfLines={1}>
              {title}
            </AppText>
            {subtitle ? <AppText variant="caption" color={color ?? colors.textMuted} numberOfLines={1}>{subtitle}</AppText> : null}
          </View>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs, minHeight: minTouch, justifyContent: 'center',
  },
  surface: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: minTouch, minWidth: minTouch },
  iconButton: {
    width: minTouch, height: minTouch, borderRadius: minTouch / 2, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md, minHeight: minTouch,
  },
});
