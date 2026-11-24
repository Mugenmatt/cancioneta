import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CHORDS_TEXT, chordsKeySource, chordsKeyTitle } from '@/content/app';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { DiceButton } from '@/design/components/DiceButton';
import { Pill } from '@/design/components/Primitives';
import { ProgressBar } from '@/design/components/Feedback';
import { Sheet } from '@/design/components/Sheet';
import { fontSizes, fonts, lineHeights, minTouch, radii, semanticRoles, spacing } from '@/design/tokens';
import { getScreenLayout } from '@/design/screenLayout';
import { ChordCard } from '@/music/components/ChordCard';
import { ChordsKeySheet } from '@/music/components/ChordsKeySheet';
import { ChordsSecondarySheet } from '@/music/components/ChordsSecondarySheet';
import { getChordCardLayout } from '@/music/components/chordCardLayout';
import { getMeter, type MeterId } from '@/music/meter';
import {
  QUALITIES, QUALITY_ORDER, diatonicChords, formatChord, noteFromPitchClass, pitchClass, type Chord,
} from '@/music/theory';
import { detectKeys } from '@/music/keyDetector';
import { MAX_CHORD_COUNT } from '@/music/progressionDice';
import { chordMidi } from '@/music/voicing';
import { audioScheduler } from '@/services/audio/AudioScheduler';
import { useMusicStore } from '@/stores/musicStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function ChordsScreen() {
  const { colors, mode } = useCoreTheme();
  const { width, fontScale } = useWindowDimensions();
  const screenLayout = useMemo(() => getScreenLayout(width, 'reading'), [width]);
  const cardLayoutWidth = Math.min(width, screenLayout.maxWidth)
    - screenLayout.paddingHorizontal * 2
    + spacing.lg * 2;
  const { columns, cardWidth } = useMemo(
    () => getChordCardLayout(cardLayoutWidth, fontScale),
    [cardLayoutWidth, fontScale],
  );
  const {
    chords, count, keyState, bpm, adventure, includeSevenths, isPlaying, currentStep,
    roll, addChord, toggleLock, cycleRoot, setQuality, moveChord, setCount, setBpm, setAdventure,
    setSevenths, setKey, clear, setPlaying, setStep,
  } = useMusicStore();
  const { metronomeVolume, chordsVolume, setMetronomeVolume, setChordsVolume } = useSettingsStore();
  const [qualityFor, setQualityFor] = useState<string | null>(null);
  const [keyOpen, setKeyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loop, setLoop] = useState(true);
  const [meterId, setMeterId] = useState<MeterId>('4/4');
  const [beat, setBeat] = useState(-1);
  const [metronomeArmed, setMetronomeArmed] = useState(false);
  const loopRef = useRef(loop);

  useEffect(() => {
    loopRef.current = loop;
    audioScheduler.setLoop(loop);
  }, [loop]);

  useEffect(() => {
    audioScheduler.setVolumes(chordsVolume, metronomeVolume);
  }, [chordsVolume, metronomeVolume]);

  const detection = useMemo(() => detectKeys(chords), [chords]);
  const displayKey = keyState.key ?? detection.top?.key ?? null;
  const diatonic = displayKey ? diatonicChords(displayKey) : [];
  const selectedChord = chords.find((c) => c.id === qualityFor) ?? null;
  const meter = useMemo(() => getMeter(meterId), [meterId]);
  const playbackRef = useRef({ bpm, meter, chords, metronome: metronomeArmed, loop });

  useEffect(() => {
    playbackRef.current = { bpm, meter, chords, metronome: metronomeArmed, loop };
  }, [bpm, meter, chords, metronomeArmed, loop]);

  const stop = useCallback(() => {
    audioScheduler.stop();
    setPlaying(false);
    setStep(-1);
    setBeat(-1);
  }, [setPlaying, setStep]);

  useEffect(() => {
    const config = playbackRef.current;
    if (!isPlaying || config.chords.length === 0) return;
    void audioScheduler.start({ ...config }, {
      onStart: () => {
        setStep(0);
        setBeat(-1);
      },
      onStep: (step) => setStep(step),
      onPulse: (pulse) => setBeat(pulse),
      onFinish: () => {
        setPlaying(false);
        setStep(-1);
        setBeat(-1);
      },
    });
    return () => audioScheduler.stop();
  }, [isPlaying, setPlaying, setStep]);

  useEffect(() => {
    audioScheduler.setProgression(chords);
  }, [chords]);

  useEffect(() => {
    audioScheduler.setTempo(bpm);
  }, [bpm]);

  useEffect(() => {
    audioScheduler.setMeter(meter);
  }, [meter]);

  useEffect(() => {
    audioScheduler.setMetronome(metronomeArmed);
  }, [metronomeArmed]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
      return;
    }
    if (chords.length === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaying(true);
  }, [chords.length, isPlaying, setPlaying, stop]);

  const toggleMetronome = () => {
    setMetronomeArmed((armed) => !armed);
    setBeat(-1);
  };

  const degreeFor = (chord: Chord): string => {
    const match = diatonic.find((d) => pitchClass(d.root) === pitchClass(chord.root));
    return match ? match.roman : 'prestado';
  };

  const detectNow = () => {
    stop();
    setKey(null, 'auto');
  };

  const keyTitle = chordsKeyTitle(keyState.key?.name ?? null, detection.top?.key.name ?? null);
  const keySource = chordsKeySource(Boolean(keyState.key), detection.ambiguous);

  return (
    <Screen scroll>
      <View style={styles.head}>
        <View style={styles.headText}>
          <AppText variant="label" color={colors.accentCore}>{CHORDS_TEXT.laboratory}</AppText>
          <AppText variant="title" style={styles.title}>{CHORDS_TEXT.title}</AppText>
        </View>
        <DiceButton compact label={CHORDS_TEXT.rollChords} onPress={() => void roll()} />
      </View>

      <View style={[styles.keyCard, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CHORDS_TEXT.changeKey}
          onPress={() => setKeyOpen(true)}
          style={styles.keyMain}
        >
          <View style={styles.keyText}>
            <AppText variant="label" color={colors.textMuted}>{CHORDS_TEXT.key}</AppText>
            <AppText style={[styles.keyName, { color: colors.textPrimary }]}>{keyTitle}</AppText>
            <AppText variant="caption" color={keyState.key ? colors.accentCore : colors.textMuted}>{keySource}</AppText>
            {detection.top ? (
              <View style={styles.score}>
                <ProgressBar value={detection.top.score} total={100} accent={colors.accentCore} />
              </View>
            ) : null}
          </View>
        </Pressable>
        <View style={styles.keyRight}>
          <Feather name="chevron-down" size={spacing.md} color={colors.textMuted} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CHORDS_TEXT.redetect}
            onPress={detectNow}
            style={styles.refresh}
          >
            <Feather name="refresh-cw" size={spacing.md} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.actionRow}>
        <DiceButton label={CHORDS_TEXT.rollProgression} onPress={() => void roll()} />
        <View style={styles.spacer} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CHORDS_TEXT.settings}
          onPress={() => setSettingsOpen(true)}
          style={[styles.smallAction, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="sliders" size={spacing.md} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.actionText}>{CHORDS_TEXT.settings}</AppText>
        </Pressable>
      </View>

      <View style={styles.chordGrid}>
        {chords.map((chord, index) => (
          <ChordCard
            key={chord.id}
            chord={chord}
            degree={degreeFor(chord)}
            accent={colors.accentCore}
            current={currentStep === index}
            width={cardWidth}
            compact={columns > 1}
            onPlay={() => void audioScheduler.playPreview(chordMidi(chord))}
            onLock={() => toggleLock(chord.id)}
            onRootChange={(semitones) => {
              const nextPc = (pitchClass(chord.root) + semitones + 120) % 12;
              const next = { ...chord, root: noteFromPitchClass(nextPc, keyState.key?.mode === 'minor' ? 'flat' : 'sharp') };
              cycleRoot(chord.id, semitones);
              void audioScheduler.playPreview(chordMidi(next));
            }}
            onQuality={() => setQualityFor(chord.id)}
          />
        ))}
        {chords.length < MAX_CHORD_COUNT ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CHORDS_TEXT.addChord}
            onPress={addChord}
            style={({ pressed }) => [
              styles.addCard,
              { width: cardWidth, borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised },
              pressed && { opacity: 0.72 },
            ]}
          >
            <Feather name="plus" size={spacing.xl} color={colors.accentCore} />
          </Pressable>
        ) : (
          <View style={[styles.addCard, { width: cardWidth, borderColor: colors.lineSubtle }]}>
            <AppText variant="caption" color={colors.textMuted} style={styles.maxText}>
              {CHORDS_TEXT.maxChords}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.playRow}>
        <Button
          label={isPlaying ? CHORDS_TEXT.stop : CHORDS_TEXT.play}
          onPress={togglePlay}
          icon={<Feather name={isPlaying ? 'square' : 'play'} size={spacing.sm} color={semanticRoles[mode]['accent.onAccent']} />}
          style={styles.playButton}
        />
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={CHORDS_TEXT.loop}
          accessibilityState={{ checked: loop }}
          onPress={() => setLoop((value) => !value)}
          style={[styles.toggle, { borderColor: loop ? colors.accentCore : colors.lineSubtle }]}
        >
          <Feather name="repeat" size={spacing.md + spacing.xxs / 2} color={loop ? colors.accentCore : colors.textMuted} />
        </Pressable>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={CHORDS_TEXT.metronome}
          accessibilityState={{ checked: metronomeArmed }}
          onPress={toggleMetronome}
          style={[styles.toggle, { borderColor: metronomeArmed ? colors.accentCore : colors.lineSubtle }]}
        >
          <Feather name="clock" size={spacing.md + spacing.xxs / 2} color={metronomeArmed ? colors.accentCore : colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.beats}>
        {meter.accents.map((accent, pulse) => (
          <View
            key={pulse}
            style={[
              styles.beat,
              accent !== 'weak' && styles.beatAccent,
              {
                backgroundColor: beat === pulse
                  ? colors.accentCore
                  : accent === 'weak' ? colors.lineSubtle : colors.lineStrong,
              },
            ]}
          />
        ))}
      </View>

      <Sheet
        visible={Boolean(qualityFor)}
        onClose={() => setQualityFor(null)}
        title={selectedChord ? formatChord(selectedChord) : CHORDS_TEXT.quality}
      >
        <View style={styles.qualityGrid}>
          {QUALITY_ORDER.map((quality) => (
            <Pill
              key={quality}
              label={`${QUALITIES[quality].symbol || 'maj'} · ${QUALITIES[quality].label}`}
              selected={selectedChord?.quality === quality}
              onPress={() => {
                if (selectedChord) {
                  setQuality(selectedChord.id, quality);
                  void audioScheduler.playPreview(chordMidi({ ...selectedChord, quality }));
                }
                setQualityFor(null);
              }}
            />
          ))}
        </View>
      </Sheet>

      <ChordsKeySheet
        visible={keyOpen}
        onClose={() => setKeyOpen(false)}
        selectedKeyName={keyState.key?.name ?? null}
        onAutomatic={() => { setKey(null, 'auto'); setKeyOpen(false); }}
        onSelect={(key) => { setKey(key, 'manual'); setKeyOpen(false); }}
      />

      <ChordsSecondarySheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        count={count}
        includeSevenths={includeSevenths}
        meterId={meterId}
        adventure={adventure}
        bpm={bpm}
        metronomeVolume={metronomeVolume}
        chordsVolume={chordsVolume}
        chords={chords}
        displayKey={displayKey}
        onCount={setCount}
        onSevenths={setSevenths}
        onMeter={setMeterId}
        onAdventure={setAdventure}
        onBpm={setBpm}
        onMetronomeVolume={setMetronomeVolume}
        onChordsVolume={setChordsVolume}
        onClear={clear}
        onMoveLeft={(index) => moveChord(index, index - 1)}
      />
    </Screen>
  );
}

const beatSize = spacing.xxs + spacing.xxs / 2;

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md, marginBottom: spacing.md },
  headText: { flex: 1 },
  title: { marginTop: spacing.xxs },
  keyCard: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.card,
    padding: spacing.md, marginBottom: spacing.md,
  },
  keyMain: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', minHeight: minTouch },
  keyText: { flex: 1 },
  keyName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.title,
    lineHeight: fontSizes.title * lineHeights.tight,
    marginTop: spacing.xxs,
  },
  score: { marginTop: spacing.sm },
  keyRight: { alignItems: 'center', marginLeft: spacing.sm },
  refresh: {
    width: minTouch, height: minTouch, borderRadius: minTouch / 2,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  spacer: { flex: 1 },
  smallAction: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: radii.chip, paddingHorizontal: spacing.sm, minHeight: minTouch,
  },
  actionText: { marginLeft: spacing.xs },
  chordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  addCard: {
    minHeight: minTouch * 3,
    borderRadius: radii.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  maxText: { textAlign: 'center' },
  playRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  playButton: { flex: 1 },
  toggle: {
    width: minTouch, height: minTouch, borderRadius: minTouch / 2,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  beats: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, justifyContent: 'center' },
  beat: { width: beatSize, height: beatSize, borderRadius: beatSize / 2 },
  beatAccent: { width: spacing.xs, height: spacing.xs, borderRadius: spacing.xxs },
  qualityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
