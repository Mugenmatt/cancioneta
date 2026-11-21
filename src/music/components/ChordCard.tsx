import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import type { Chord } from '@/music/theory';
import { QUALITIES, formatChord } from '@/music/theory';

interface ChordCardProps {
  chord: Chord;
  degree: string;
  accent: string;
  current: boolean;
  onPlay: () => void;
  onLock: () => void;
  onRootChange: (semitones: number) => void;
  onQuality: () => void;
}

export function ChordCard({
  chord, degree, accent, current, onPlay, onLock, onRootChange, onQuality,
}: ChordCardProps) {
  const { colors } = useCoreTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgRaised,
          borderColor: current ? accent : colors.lineSubtle,
          borderWidth: current ? 2 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Escuchar ${formatChord(chord)}`}
          onPress={onPlay}
          style={{ flex: 1 }}
        >
          <AppText variant="caption" color={colors.textMuted} style={{ fontFamily: fonts.sansSemiBold }}>
            {degree}
          </AppText>
          <AppText style={[styles.name, { color: colors.textPrimary }]}>{formatChord(chord)}</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={chord.locked ? 'Desbloquear acorde' : 'Bloquear acorde'}
          accessibilityState={{ checked: chord.locked }}
          onPress={onLock}
          hitSlop={8}
          style={[styles.lock, {
            borderColor: chord.locked ? accent : colors.lineSubtle,
            backgroundColor: chord.locked ? alpha(accent, 0.14) : 'transparent',
          }]}
        >
          <Feather name={chord.locked ? 'lock' : 'unlock'} size={13} color={chord.locked ? accent : colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bajar medio tono"
          onPress={() => onRootChange(-1)}
          style={[styles.step, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="minus" size={14} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cambiar calidad de ${formatChord(chord)}`}
          onPress={onQuality}
          style={[styles.quality, { borderColor: colors.lineSubtle }]}
        >
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {QUALITIES[chord.quality].label}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subir medio tono"
          onPress={() => onRootChange(1)}
          style={[styles.step, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="plus" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radii.card, padding: spacing.sm + 2, minHeight: 132 },
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, marginTop: 2 },
  lock: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 'auto', paddingTop: spacing.sm },
  step: { width: 28, height: 28, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quality: { flex: 1, minHeight: 28, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});
