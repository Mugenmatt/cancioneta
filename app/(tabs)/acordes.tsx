import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { DiceButton } from '@/design/components/DiceButton';
import { Pill, SectionLabel } from '@/design/components/Primitives';
import { ProgressBar } from '@/design/components/Feedback';
import { Sheet } from '@/design/components/Sheet';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { ChordCard } from '@/music/components/ChordCard';
import { getChordCardLayout } from '@/music/components/chordCardLayout';
import { chordIntervalMs, nextPlaybackStep } from '@/music/playback';
import {
  KEYS, QUALITIES, QUALITY_ORDER, chordName, diatonicChords, formatChord, noteFromPitchClass, pitchClass, type Chord, type Key,
} from '@/music/theory';
import { detectKeys } from '@/music/keyDetector';
import { chordMidi } from '@/music/voicing';
import { commonSubstitutions, secondaryDominants, relatedKeys } from '@/music/relations';
import { piano, metronome } from '@/services/audio/PianoEngine';
import { useMusicStore } from '@/stores/musicStore';

const ADVENTURE = [0, 25, 50, 75, 100];
const COUNTS = [4, 6, 8];

export default function ChordsScreen() {
  const { colors } = useCoreTheme();
  const { width, fontScale } = useWindowDimensions();
  const { columns, cardWidth } = useMemo(() => getChordCardLayout(width, fontScale), [width, fontScale]);
  const {
    chords, count, keyState, bpm, adventure, includeSevenths, isPlaying, currentStep,
    roll, toggleLock, cycleRoot, setQuality, moveChord, setCount, setBpm, setAdventure,
    setSevenths, setKey, clear, setPlaying, setStep,
  } = useMusicStore();
  const [qualityFor, setQualityFor] = useState<string | null>(null);
  const [keyOpen, setKeyOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [loop, setLoop] = useState(true);
  const [beat, setBeat] = useState(-1);
  const [beatRunning, setBeatRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);
  const loopRef = useRef(loop);
  const chordsRef = useRef(chords);
  const previousChordsRef = useRef(chords);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const detection = useMemo(() => detectKeys(chords), [chords]);
  const displayKey = keyState.key ?? detection.top?.key ?? null;
  const diatonic = displayKey ? diatonicChords(displayKey) : [];
  const selectedChord = chords.find((c) => c.id === qualityFor) ?? null;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setPlaying(false);
    setStep(-1);
    stepRef.current = 0;
  }, [setPlaying, setStep]);

  const playStep = useCallback((step: number) => {
    const chord = chordsRef.current[step];
    if (!chord) return;
    stepRef.current = step;
    setStep(step);
    void piano.playMidiSequence(chordMidi(chord), 35);
  }, [setStep]);

  useEffect(() => {
    chordsRef.current = chords;
    if (chords === previousChordsRef.current) return;
    previousChordsRef.current = chords;
    if (!isPlaying || chords.length === 0) return;
    playStep(0);
  }, [chords, isPlaying, playStep]);

  useEffect(() => {
    if (!isPlaying) return;
    const advance = () => {
      const next = nextPlaybackStep(stepRef.current, chordsRef.current.length, loopRef.current);
      if (next === null) {
        stop();
        return;
      }
      playStep(next);
    };
    intervalRef.current = setInterval(advance, chordIntervalMs(bpm));
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [bpm, isPlaying, playStep, stop]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
      return;
    }
    if (chordsRef.current.length === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaying(true);
    playStep(0);
  }, [isPlaying, playStep, setPlaying, stop]);

  const toggleBeat = () => {
    if (beatRunning) {
      metronome.stop();
      setBeatRunning(false);
      setBeat(-1);
      return;
    }
    setBeatRunning(true);
    metronome.start(bpm, (tick) => {
      setBeat(tick);
      if (tick === 0) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  };

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    metronome.stop();
  }, []);

  const degreeFor = (chord: Chord): string => {
    const match = diatonic.find((d) => pitchClass(d.root) === pitchClass(chord.root));
    return match ? match.roman : 'prestado';
  };

  const detectNow = () => {
    stop();
    setKey(null, 'auto');
  };

  const keyTitle = keyState.key ? keyState.key.name : detection.top ? `Posible: ${detection.top.key.name}` : 'Sin tonalidad';
  const keySource = keyState.key ? 'Elegida a mano' : detection.ambiguous ? 'Ambigua · elegí una' : 'Detección automática';

  return (
    <Screen scroll>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={colors.accentCore}>Laboratorio</AppText>
          <AppText variant="title" style={{ marginTop: 4 }}>Acordes</AppText>
        </View>
        <DiceButton compact label="Tirar acordes" onPress={() => void roll()} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cambiar tonalidad"
        onPress={() => setKeyOpen(true)}
        style={[styles.keyCard, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }]}
      >
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={colors.textMuted}>Tonalidad</AppText>
          <AppText style={[styles.keyName, { color: colors.textPrimary }]}>{keyTitle}</AppText>
          <AppText variant="caption" color={keyState.key ? colors.accentCore : colors.textMuted}>{keySource}</AppText>
          {detection.top ? (
            <View style={{ marginTop: spacing.sm }}>
              <ProgressBar value={detection.top.score} total={100} accent={colors.accentCore} />
            </View>
          ) : null}
        </View>
        <View style={styles.keyRight}>
          <Feather name="chevron-down" size={18} color={colors.textMuted} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a detectar"
            hitSlop={8}
            onPress={detectNow}
            style={{ marginTop: spacing.sm }}
          >
            <Feather name="refresh-cw" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </Pressable>

      <View style={styles.actionRow}>
        <DiceButton label="Tirar progresión" onPress={() => void roll()} />
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explorar tonalidad"
          onPress={() => setExploreOpen(true)}
          style={[styles.smallAction, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="compass" size={15} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 6 }}>Explorar</AppText>
        </Pressable>
      </View>

      <View style={styles.options}>
        <View style={{ flex: 1 }}>
          <SectionLabel color={colors.textMuted}>Acordes</SectionLabel>
          <View style={styles.pillRow}>
            {COUNTS.map((n) => <Pill key={n} label={String(n)} selected={count === n} onPress={() => setCount(n)} />)}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel color={colors.textMuted}>Séptimas</SectionLabel>
          <Pill label={includeSevenths ? 'Sí' : 'No'} selected={includeSevenths} onPress={() => setSevenths(!includeSevenths)} />
        </View>
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
            onPlay={() => void piano.playMidiSequence(chordMidi(chord), 35)}
            onLock={() => toggleLock(chord.id)}
            onRootChange={(semitones) => {
              const nextPc = (pitchClass(chord.root) + semitones + 120) % 12;
              const next = { ...chord, root: noteFromPitchClass(nextPc, keyState.key?.mode === 'minor' ? 'flat' : 'sharp') };
              cycleRoot(chord.id, semitones);
              void piano.playMidiSequence(chordMidi(next), 30);
            }}
            onQuality={() => setQualityFor(chord.id)}
          />
        ))}
      </View>

      <View style={styles.playRow}>
        <Button
          label={isPlaying ? 'Parar' : 'Escuchar'}
          onPress={togglePlay}
          icon={<Feather name={isPlaying ? 'square' : 'play'} size={15} color="#FFFFFF" />}
          style={{ flex: 1 }}
        />
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Repetir progresión"
          accessibilityState={{ checked: loop }}
          onPress={() => setLoop((value) => !value)}
          style={[styles.loop, { borderColor: loop ? colors.accentCore : colors.lineSubtle }]}
        >
          <Feather name="repeat" size={17} color={loop ? colors.accentCore : colors.textMuted} />
        </Pressable>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Metrónomo"
          accessibilityState={{ checked: beatRunning }}
          onPress={toggleBeat}
          style={[styles.loop, { borderColor: beatRunning ? colors.accentCore : colors.lineSubtle }]}
        >
          <Feather name="clock" size={17} color={beatRunning ? colors.accentCore : colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.beats}>
        {[0, 1, 2, 3].map((tick) => (
          <View key={tick} style={[styles.beat, { backgroundColor: beat === tick ? colors.accentCore : colors.lineSubtle }]} />
        ))}
      </View>

      <View style={styles.bpmRow}>
        <AppText variant="caption" color={colors.textMuted}>Pulso</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Bajar tempo" onPress={() => setBpm(bpm - 5)} style={[styles.stepBtn, { borderColor: colors.lineSubtle }]}>
          <Feather name="minus" size={14} color={colors.textSecondary} />
        </Pressable>
        <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold, minWidth: 58, textAlign: 'center' }}>
          {bpm} BPM
        </AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Subir tempo" onPress={() => setBpm(bpm + 5)} style={[styles.stepBtn, { borderColor: colors.lineSubtle }]}>
          <Feather name="plus" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <SectionLabel color={colors.textMuted}>Aventura armónica</SectionLabel>
        <View style={styles.pillRow}>
          {ADVENTURE.map((value) => (
            <Pill key={value} label={`${value}%`} selected={adventure === value} onPress={() => setAdventure(value)} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Vaciar" tone="ghost" small onPress={clear} />
        <View style={{ flex: 1 }} />
        {chords.map((chord, index) => (
          <Pressable
            key={chord.id}
            accessibilityRole="button"
            accessibilityLabel={`Mover ${formatChord(chord)} a la izquierda`}
            disabled={index === 0}
            onPress={() => moveChord(index, index - 1)}
            style={{ opacity: index === 0 ? 0.45 : 0.8, padding: 4 }}
          >
            <Feather name="chevron-left" size={14} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Sheet visible={Boolean(qualityFor)} onClose={() => setQualityFor(null)} title={selectedChord ? formatChord(selectedChord) : 'Calidad'}>
        <View style={styles.qualityGrid}>
          {QUALITY_ORDER.map((quality) => (
            <Pill
              key={quality}
              label={`${QUALITIES[quality].symbol || 'maj'} · ${QUALITIES[quality].label}`}
              selected={selectedChord?.quality === quality}
              onPress={() => {
                if (selectedChord) {
                  setQuality(selectedChord.id, quality);
                  void piano.playMidiSequence(chordMidi({ ...selectedChord, quality }), 30);
                }
                setQualityFor(null);
              }}
            />
          ))}
        </View>
      </Sheet>

      <Sheet visible={keyOpen} onClose={() => setKeyOpen(false)} title="Elegir tonalidad" fullHeight>
        <Pressable
          accessibilityRole="button"
          onPress={() => { setKey(null, 'auto'); setKeyOpen(false); }}
          style={[styles.keyOption, { borderColor: !keyState.key ? colors.accentCore : colors.lineSubtle }]}
        >
          <AppText variant="body" color={!keyState.key ? colors.accentCore : colors.textPrimary}>Automática</AppText>
          <AppText variant="caption" color={colors.textMuted}>Detecta desde los acordes o sortea al tirar</AppText>
        </Pressable>
        <View style={styles.keyGrid}>
          {KEYS.map((key) => (
            <Pressable
              key={key.name}
              accessibilityRole="button"
              accessibilityLabel={key.name}
              onPress={() => { setKey(key, 'manual'); setKeyOpen(false); }}
              style={[styles.keyChip, {
                borderColor: keyState.key?.name === key.name ? colors.accentCore : colors.lineSubtle,
                backgroundColor: keyState.key?.name === key.name ? alpha(colors.accentCore, 0.12) : 'transparent',
              }]}
            >
              <AppText variant="caption" color={keyState.key?.name === key.name ? colors.accentCore : colors.textSecondary}>
                {key.name}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Sheet>

      <Sheet visible={exploreOpen} onClose={() => setExploreOpen(false)} title={displayKey ? displayKey.name : 'Explorar'} fullHeight>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {displayKey ? <ExploreContent currentKey={displayKey} chords={chords} /> : (
            <AppText variant="body" color={colors.textSecondary}>Tirá una progresión o elegí una tonalidad para ver relaciones.</AppText>
          )}
        </ScrollView>
      </Sheet>
    </Screen>
  );
}

function ExploreContent({ currentKey, chords }: { currentKey: Key; chords: Chord[] }) {
  const { colors } = useCoreTheme();
  const relations = relatedKeys(currentKey);
  const substitutions = commonSubstitutions(currentKey);
  const dominants = secondaryDominants(currentKey);
  return (
    <View>
      <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.sm }}>
        Acordes en {currentKey.name}: {diatonicChords(currentKey).map((d) => chordName(d.root, d.quality)).join(' · ')}
      </AppText>
      <SectionLabel color={colors.textMuted}>Tonalidades vecinas</SectionLabel>
      <View style={styles.pillRow}>
        {relations.map((key) => (
          <Pill key={key.name} label={key.name} />
        ))}
      </View>
      <View style={{ height: spacing.md }} />
      <SectionLabel color={colors.textMuted}>Sustituciones</SectionLabel>
      {substitutions.map((item) => (
        <View key={item.title} style={[styles.relation, { borderColor: colors.lineSubtle }]}>
          <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>{item.title}</AppText>
          <AppText variant="caption" color={colors.accentCore}>{item.chords.join('  →  ')}</AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>{item.detail}</AppText>
        </View>
      ))}
      <View style={{ height: spacing.md }} />
      <SectionLabel color={colors.textMuted}>Dominantes secundarias</SectionLabel>
      {dominants.map((item) => (
        <View key={item.title} style={[styles.relation, { borderColor: colors.lineSubtle }]}>
          <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>{item.title}</AppText>
          <AppText variant="caption" color={colors.accentCore}>{item.chords.join('  →  ')}</AppText>
        </View>
      ))}
      <View style={{ height: spacing.md }} />
      <SectionLabel color={colors.textMuted}>Progresión actual</SectionLabel>
      <AppText variant="body" color={colors.textSecondary}>
        {chords.map((chord) => formatChord(chord)).join('  ·  ')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md, marginBottom: spacing.md },
  keyCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.md },
  keyName: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, marginTop: 2 },
  keyRight: { alignItems: 'center', marginLeft: spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  smallAction: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: spacing.sm, minHeight: 38 },
  options: { flexDirection: 'row', gap: spacing.md },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  playRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  loop: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  beats: { flexDirection: 'row', gap: 6, marginTop: spacing.sm, justifyContent: 'center' },
  beat: { width: 7, height: 7, borderRadius: 4 },
  bpmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  stepBtn: { width: 30, height: 30, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  qualityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keyOption: { borderWidth: 1, borderRadius: radii.field, padding: spacing.md, marginBottom: spacing.sm },
  keyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  keyChip: { borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: 12, paddingVertical: 8 },
  relation: { borderTopWidth: 1, paddingVertical: spacing.sm },
});
