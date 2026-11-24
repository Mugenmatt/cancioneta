import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '../ThemeProvider';
import { alpha, fonts, hitSlop, minTouch, radii, spacing } from '../tokens';
import { AppText } from './Text';

interface WordChipProps {
  word: string;
  accent?: string;
  accentInk?: string;
  selected?: boolean;
  locked?: boolean;
  revealed?: boolean;
  onPress?: () => void;
  onToggleLock?: () => void;
  index?: number;
}

export function WordChip({ word, accent, accentInk, selected, locked, revealed = true, onPress, onToggleLock, index }: WordChipProps) {
  const { colors } = useCoreTheme();
  const tint = accent ?? colors.accentCore;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${word}${locked ? ', bloqueada' : ''}${revealed ? '' : ', oculta'}`}
      accessibilityState={{ selected: Boolean(selected) }}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? tint : colors.lineSubtle,
          backgroundColor: selected ? alpha(tint, 0.14) : colors.bgRaised,
        },
        pressed && { opacity: 0.72 },
      ]}
    >
      {typeof index === 'number' ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.index}>{index + 1}</AppText>
      ) : null}
      <AppText
        variant="body"
        color={selected && accentInk ? accentInk : colors.textPrimary}
        style={{ fontFamily: fonts.serif, flexShrink: 1 }}
      >
        {revealed ? word : '• • •'}
      </AppText>
      {onToggleLock ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locked ? 'Desbloquear palabra' : 'Bloquear palabra'}
          hitSlop={hitSlop}
          onPress={onToggleLock}
          style={styles.lock}
        >
          <Feather name={locked ? 'lock' : 'unlock'} size={13} color={locked ? tint : colors.textMuted} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.chip,
    paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, minHeight: minTouch, marginRight: spacing.xs, marginBottom: spacing.xs,
  },
  index: { marginRight: spacing.xs - spacing.xxs, minWidth: spacing.md - spacing.xs },
  lock: { marginLeft: spacing.xs, width: minTouch, height: minTouch, alignItems: 'center', justifyContent: 'center' },
});
