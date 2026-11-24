import { Pressable, StyleSheet, View } from 'react-native';
import { CHORDS_TEXT } from '@/content/app';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { Sheet } from '@/design/components/Sheet';
import { alpha, minTouch, radii, spacing } from '@/design/tokens';
import { KEYS, type Key } from '@/music/theory';

interface ChordsKeySheetProps {
  visible: boolean;
  onClose: () => void;
  selectedKeyName: string | null;
  onAutomatic: () => void;
  onSelect: (key: Key) => void;
}

export function ChordsKeySheet({
  visible, onClose, selectedKeyName, onAutomatic, onSelect,
}: ChordsKeySheetProps) {
  const { colors } = useCoreTheme();
  return (
    <Sheet visible={visible} onClose={onClose} title={CHORDS_TEXT.chooseKey} fullHeight>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={CHORDS_TEXT.automatic}
        onPress={onAutomatic}
        style={[styles.option, { borderColor: !selectedKeyName ? colors.accentCore : colors.lineSubtle }]}
      >
        <AppText variant="body" color={!selectedKeyName ? colors.accentCore : colors.textPrimary}>{CHORDS_TEXT.automatic}</AppText>
        <AppText variant="caption" color={colors.textMuted}>{CHORDS_TEXT.automaticDetail}</AppText>
      </Pressable>
      <View style={styles.grid}>
        {KEYS.map((key) => {
          const selected = selectedKeyName === key.name;
          return (
            <Pressable
              key={key.name}
              accessibilityRole="button"
              accessibilityLabel={key.name}
              onPress={() => onSelect(key)}
              style={[styles.chip, {
                borderColor: selected ? colors.accentCore : colors.lineSubtle,
                backgroundColor: selected ? alpha(colors.accentCore, 0.12) : 'transparent',
              }]}
            >
              <AppText variant="caption" color={selected ? colors.accentCore : colors.textSecondary}>
                {key.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1, borderRadius: radii.field, padding: spacing.md,
    marginBottom: spacing.sm, minHeight: minTouch,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    borderWidth: 1, borderRadius: radii.chip,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, minHeight: minTouch,
  },
});
