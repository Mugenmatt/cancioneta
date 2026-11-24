import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  CHORDS_TEXT, chordsQualityChangeLabel,
} from '@/content/app';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { alpha, fontSizes, fonts, lineHeights, minTouch, radii, spacing } from '@/design/tokens';
import type { Chord } from '@/music/theory';
import { QUALITIES, formatChord } from '@/music/theory';

interface ChordCardProps {
  chord: Chord;
  degree: string;
  accent: string;
  current: boolean;
  width: number;
  compact?: boolean;
  onPlay: () => void;
  onLock: () => void;
  onRootChange: (semitones: number) => void;
  onQuality: () => void;
}

export function ChordCard({
  chord, degree, accent, current, width, compact = false, onPlay, onLock, onRootChange, onQuality,
}: ChordCardProps) {
  const { colors } = useCoreTheme();
  return (
    <View
      style={[
        styles.card,
        {
          width,
          backgroundColor: colors.bgRaised,
          borderColor: current ? accent : colors.lineSubtle,
          borderWidth: current ? 2 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${CHORDS_TEXT.playChord} ${formatChord(chord)}`}
          onPress={onPlay}
          style={styles.play}
        >
          <AppText variant="caption" color={colors.textMuted} style={{ fontFamily: fonts.sansSemiBold }}>
            {degree}
          </AppText>
          <AppText
            numberOfLines={1}
            style={[styles.name, compact && styles.nameCompact, { color: colors.textPrimary }]}
          >
            {formatChord(chord)}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={chord.locked ? CHORDS_TEXT.unlockChord : CHORDS_TEXT.lockChord}
          accessibilityState={{ checked: chord.locked }}
          onPress={onLock}
          style={[styles.lock, {
            borderColor: chord.locked ? accent : colors.lineSubtle,
            backgroundColor: chord.locked ? alpha(accent, 0.14) : 'transparent',
          }]}
        >
          <Feather name={chord.locked ? 'lock' : 'unlock'} size={spacing.sm + spacing.xxs / 2} color={chord.locked ? accent : colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CHORDS_TEXT.lowerHalf}
          onPress={() => onRootChange(-1)}
          style={[styles.step, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="minus" size={spacing.md - spacing.xxs / 2} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={chordsQualityChangeLabel(formatChord(chord))}
          onPress={onQuality}
          style={[styles.quality, { borderColor: colors.lineSubtle }]}
        >
          <AppText
            variant="caption"
            color={colors.textSecondary}
            numberOfLines={1}
            style={styles.qualityText}
          >
            {QUALITIES[chord.quality].symbol || 'maj'}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CHORDS_TEXT.raiseHalf}
          onPress={() => onRootChange(1)}
          style={[styles.step, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="plus" size={spacing.md - spacing.xxs / 2} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const stepSize = minTouch;

const styles = StyleSheet.create({
  card: { borderRadius: radii.card, padding: spacing.xs, minHeight: minTouch * 3 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  play: { flex: 1, minHeight: minTouch, justifyContent: 'center' },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes.title,
    lineHeight: fontSizes.title * lineHeights.tight,
    marginTop: spacing.xxs,
  },
  nameCompact: { fontSize: fontSizes.lead, lineHeight: fontSizes.lead * lineHeights.tight },
  lock: {
    width: stepSize,
    height: stepSize,
    borderRadius: radii.field,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginTop: 'auto', paddingTop: spacing.sm },
  step: {
    width: stepSize,
    height: stepSize,
    borderRadius: radii.field,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quality: {
    flex: 1,
    minHeight: stepSize,
    borderRadius: radii.field,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
  },
  qualityText: { fontFamily: fonts.sansSemiBold },
});
