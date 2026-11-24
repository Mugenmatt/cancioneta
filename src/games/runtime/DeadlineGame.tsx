import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { TimerBadge } from '@/design/components/Feedback';
import { useCoreTheme, useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import { useLyricsStore } from '@/stores/lyricsStore';
import type { PoolItem } from '@/core/types';
import { G33_DURATIONS, G33_TEXT } from '@/content/games/g33';
import { COMMON_TEXT } from '@/content/games/common';
import { includesTarget, remainingSeconds } from '@/editor/stimulusStatus';
import { deadlineAtFrom, makeDeadlineStimulus } from './g33Logic';
import { ActionBar, GameField, Note, PromptCard } from './ui';

export function DeadlineGame() {
  const theme = useGameTheme('g33');
  const { colors } = useCoreTheme();
  const [word, setWord] = useState<PoolItem | null>(null);
  const [invented, setInvented] = useState('');
  const [useInvented, setUseInvented] = useState(false);
  const [minutes, setMinutes] = useState<number>(G33_DURATIONS[0].minutes);
  const [deadlineAt, setDeadlineAt] = useState<number | undefined>();
  const [now, setNow] = useState(() => Date.now());
  const lyrics = useLyricsStore((state) => state.exportText(false));

  const draw = async () => {
    const [next] = await randomService.draw('deadline_words', 1);
    setWord(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  useEffect(() => {
    if (!deadlineAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  const target = (useInvented ? invented.trim() : word?.text ?? '').trim();
  const found = Boolean(target && includesTarget(lyrics, target));
  const seconds = remainingSeconds(deadlineAt, now);

  const start = () => {
    if (!target) return;
    const startedAt = Date.now();
    setNow(startedAt);
    setDeadlineAt(deadlineAtFrom(minutes, startedAt));
  };

  const stimulus = target
    ? makeDeadlineStimulus({
      target,
      deadlineAt,
      title: G33_TEXT.editorTitle(target),
      groupTitle: G33_TEXT.editorGroup,
      note: G33_TEXT.editorNote,
      deadlineLabel: G33_TEXT.timeLabel,
      doneLabel: G33_TEXT.checkDone,
      pendingLabel: G33_TEXT.checkPending,
    })
    : undefined;

  return (
    <View>
      <Note theme={theme}>{G33_TEXT.intro}</Note>

      <View style={[styles.banner, { borderColor: theme.accent, backgroundColor: alpha(theme.accent, 0.08) }]}>
        <View style={styles.bannerHead}>
          <AppText variant="label" color={theme.accentText}>{G33_TEXT.wordLabel}</AppText>
          {deadlineAt ? (
            <TimerBadge seconds={seconds} running={seconds > 0} accent={theme.accent} accentText={theme.accentText} />
          ) : null}
        </View>
        <AppText style={[styles.target, { color: theme.ink }]}>{target || G33_TEXT.targetFallback}</AppText>
        <View style={styles.bannerFoot}>
          <AppText variant="caption" color={theme.inkSoft}>
            {deadlineAt ? (seconds > 0 ? G33_TEXT.running : G33_TEXT.reached) : G33_TEXT.notStarted}
          </AppText>
          <View style={styles.check}>
            <Feather name={found ? 'check-circle' : 'circle'} size={16} color={found ? colors.stateSuccess : theme.inkSoft} />
            <AppText variant="caption" color={found ? colors.stateSuccess : theme.inkSoft} style={{ marginLeft: 6 }}>
              {found ? G33_TEXT.bannerDone : G33_TEXT.bannerPending}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.pills}>
        <Pill label={G33_TEXT.poolOption} selected={!useInvented} color={theme.accentText} onPress={() => setUseInvented(false)} />
        <Pill label={G33_TEXT.inventedOption} selected={useInvented} color={theme.accentText} onPress={() => setUseInvented(true)} />
      </View>

      {useInvented ? (
        <GameField
          theme={theme}
          label={G33_TEXT.inventedLabel}
          value={invented}
          onChangeText={setInvented}
          placeholder={G33_TEXT.inventedPlaceholder}
          style={{ marginTop: spacing.sm }}
        />
      ) : (
        <PromptCard theme={theme} eyebrow={G33_TEXT.poolOption} style={{ marginTop: spacing.md }}>
          <AppText style={[styles.word, { color: theme.ink }]}>{word?.text ?? COMMON_TEXT.loading}</AppText>
          <Button
            label={G33_TEXT.anotherWord}
            tone="secondary"
            small
            onPress={() => void draw()}
            accent={theme.accentText}
            accentInk={theme.accentInk}
            style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
          />
        </PromptCard>
      )}

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G33_TEXT.deadlineTitle}</AppText>
        <View style={styles.pills}>
          {G33_DURATIONS.map((option) => (
            <Pill
              key={option.minutes}
              label={option.label}
              selected={minutes === option.minutes}
              color={theme.accentText}
              onPress={() => setMinutes(option.minutes)}
            />
          ))}
        </View>
        <Button
          label={deadlineAt ? G33_TEXT.restart : G33_TEXT.start}
          small
          onPress={start}
          disabled={!target}
          accent={theme.accent}
          accentInk={theme.accentInk}
          style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
        />
      </View>

      <ActionBar text={target} theme={theme} stimulus={stimulus} sendLabel={G33_TEXT.send} />
      <Note theme={theme}>{G33_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderWidth: 2, borderRadius: 18, padding: spacing.md, marginTop: spacing.md },
  bannerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  target: { fontFamily: fonts.display, fontSize: 32, lineHeight: 39, marginTop: spacing.xs },
  bannerFoot: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.xs, marginTop: spacing.sm },
  check: { flexDirection: 'row', alignItems: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  word: { fontFamily: fonts.displayItalic, fontSize: 28, lineHeight: 34 },
  block: { marginTop: spacing.md },
});
