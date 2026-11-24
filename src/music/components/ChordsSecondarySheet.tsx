import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  CHORDS_TEXT, chordsBpmValue, chordsMeterLabel, chordsMoveLabel,
} from '@/content/app';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill, SectionLabel } from '@/design/components/Primitives';
import { Sheet } from '@/design/components/Sheet';
import { VolumeSlider } from '@/design/components/VolumeSlider';
import { minTouch, spacing } from '@/design/tokens';
import { getChordCardLayout } from '@/music/components/chordCardLayout';
import { ChordsExploreContent } from '@/music/components/ChordsExploreContent';
import { MAX_BPM, METERS, MIN_BPM, getMeter, type MeterId } from '@/music/meter';
import { formatChord, type Chord, type Key } from '@/music/theory';

const ADVENTURE = [0, 25, 50, 75, 100];
const COUNTS = [4, 6, 8, 10, 12, 14, 16];
const STEPS = [
  { id: 'progression', label: CHORDS_TEXT.steps.progression },
  { id: 'sound', label: CHORDS_TEXT.steps.sound },
  { id: 'order', label: CHORDS_TEXT.steps.order },
  { id: 'explore', label: CHORDS_TEXT.steps.explore },
] as const;

type StepId = typeof STEPS[number]['id'];

interface ChordsSecondarySheetProps {
  visible: boolean;
  onClose: () => void;
  count: number;
  includeSevenths: boolean;
  meterId: MeterId;
  adventure: number;
  bpm: number;
  metronomeVolume: number;
  chordsVolume: number;
  chords: Chord[];
  displayKey: Key | null;
  onCount: (count: number) => void;
  onSevenths: (value: boolean) => void;
  onMeter: (id: MeterId) => void;
  onAdventure: (value: number) => void;
  onBpm: (value: number) => void;
  onMetronomeVolume: (value: number) => void;
  onChordsVolume: (value: number) => void;
  onClear: () => void;
  onMoveLeft: (index: number) => void;
}

export function ChordsSecondarySheet({
  visible, onClose, count, includeSevenths, meterId, adventure, bpm,
  metronomeVolume, chordsVolume, chords, displayKey,
  onCount, onSevenths, onMeter, onAdventure, onBpm,
  onMetronomeVolume, onChordsVolume, onClear, onMoveLeft,
}: ChordsSecondarySheetProps) {
  const { colors } = useCoreTheme();
  const { width, fontScale } = useWindowDimensions();
  const { columns, cardWidth } = useMemo(
    () => getChordCardLayout(width, fontScale),
    [width, fontScale],
  );
  const [step, setStep] = useState<StepId>('progression');
  const meter = useMemo(() => getMeter(meterId), [meterId]);

  return (
    <Sheet visible={visible} onClose={onClose} title={CHORDS_TEXT.settings} fullHeight>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.steps}>
          {STEPS.map((item) => (
            <Pill
              key={item.id}
              label={item.label}
              selected={step === item.id}
              onPress={() => setStep(item.id)}
            />
          ))}
        </View>

        {step === 'progression' ? (
          <View>
            <View style={[styles.groups, columns > 1 && styles.groupsWide]}>
              <View style={[styles.group, columns > 1 && { width: cardWidth }]}>
                <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.count}</SectionLabel>
                <View style={styles.pillRow}>
                  {COUNTS.map((value) => (
                    <Pill
                      key={value}
                      label={String(value)}
                      selected={count === value}
                      onPress={() => onCount(value)}
                    />
                  ))}
                </View>
              </View>

              <View style={[styles.group, columns > 1 && { width: cardWidth }]}>
                <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.sevenths}</SectionLabel>
                <Pill
                  label={includeSevenths ? CHORDS_TEXT.yes : CHORDS_TEXT.no}
                  selected={includeSevenths}
                  onPress={() => onSevenths(!includeSevenths)}
                />
              </View>

              <View style={[styles.group, columns > 1 && { width: cardWidth }]}>
                <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.meter}</SectionLabel>
                <View style={styles.pillRow}>
                  {METERS.map((item) => (
                    <Pill
                      key={item.id}
                      label={item.id}
                      accessibilityLabel={chordsMeterLabel(item.id)}
                      selected={meter.id === item.id}
                      onPress={() => onMeter(item.id)}
                    />
                  ))}
                </View>
              </View>

              <View style={[styles.group, columns > 1 && { width: cardWidth }]}>
                <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.adventure}</SectionLabel>
                <View style={styles.pillRow}>
                  {ADVENTURE.map((value) => (
                    <Pill
                      key={value}
                      label={`${value}%`}
                      selected={adventure === value}
                      onPress={() => onAdventure(value)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <Button
              label={CHORDS_TEXT.clearProgression}
              tone="danger"
              small
              icon={<Feather name="trash-2" size={spacing.md} color={colors.stateError} />}
              style={[styles.clear, { borderColor: colors.stateError }]}
              onPress={onClear}
            />
          </View>
        ) : null}

        {step === 'sound' ? (
          <View>
            <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.tempo}</SectionLabel>
            <VolumeSlider
              label={CHORDS_TEXT.bpm}
              value={bpm}
              min={MIN_BPM}
              max={MAX_BPM}
              step={1}
              formatValue={chordsBpmValue}
              onValueChange={onBpm}
            />
            <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.volume}</SectionLabel>
            <VolumeSlider
              label={CHORDS_TEXT.metronomeVolume}
              value={metronomeVolume}
              onValueChange={onMetronomeVolume}
            />
            <VolumeSlider
              label={CHORDS_TEXT.chordsVolume}
              value={chordsVolume}
              onValueChange={onChordsVolume}
            />
          </View>
        ) : null}

        {step === 'order' ? (
          <View>
            <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.order}</SectionLabel>
            {chords.map((chord, index) => (
              <View key={chord.id} style={[styles.orderRow, { borderColor: colors.lineSubtle }]}>
                <AppText variant="body" color={colors.textPrimary}>{formatChord(chord)}</AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={chordsMoveLabel(formatChord(chord))}
                  disabled={index === 0}
                  onPress={() => onMoveLeft(index)}
                  style={[styles.move, {
                    borderColor: index === 0 ? colors.lineSubtle : colors.accentCore,
                    opacity: index === 0 ? 0.45 : 1,
                  }]}
                >
                  <Feather
                    name="arrow-left"
                    size={spacing.md}
                    color={index === 0 ? colors.textMuted : colors.accentCore}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        {step === 'explore' ? (
          displayKey ? <ChordsExploreContent currentKey={displayKey} chords={chords} /> : (
            <AppText variant="body" color={colors.textSecondary}>{CHORDS_TEXT.exploreHint}</AppText>
          )
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xl + spacing.xs },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  groups: { gap: spacing.md },
  groupsWide: { flexDirection: 'row', flexWrap: 'wrap' },
  group: { gap: spacing.xxs },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  clear: { alignSelf: 'flex-start', marginTop: spacing.lg },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, minHeight: minTouch, paddingVertical: spacing.xs,
  },
  move: {
    width: minTouch, height: minTouch, borderRadius: minTouch / 2, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
