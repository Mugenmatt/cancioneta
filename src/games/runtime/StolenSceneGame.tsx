import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { TimerBadge } from '@/design/components/Feedback';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G38_TEXT, G38_TIMER_MINUTES } from '@/content/games/g38';
import { remainingSeconds } from '@/editor/stimulusStatus';
import {
  makeSceneStimulus, sceneDeadlineAt, sceneFromItem, type StolenScene,
} from './g38Logic';
import { ActionBar, Note, PromptCard } from './ui';

export function StolenSceneGame() {
  const theme = useGameTheme('g38');
  const [item, setItem] = useState<PoolItem | null>(null);
  const [timed, setTimed] = useState(false);
  const [deadlineAt, setDeadlineAt] = useState<number | undefined>();
  const [now, setNow] = useState(() => Date.now());

  const draw = async () => {
    const [next] = await randomService.draw('stolen_scenes', 1);
    setItem(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  useEffect(() => {
    if (!deadlineAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  const scene: StolenScene | null = item ? sceneFromItem(item) : null;
  const seconds = remainingSeconds(deadlineAt, now);
  const stimulus = scene
    ? makeSceneStimulus({
      scene,
      deadlineAt,
      title: G38_TEXT.editorTitle(scene.character),
      groupTitles: {
        scene: G38_TEXT.editorGroup,
        character: G38_TEXT.characterGroup,
        unsaid: G38_TEXT.unsaidGroup,
      },
      note: G38_TEXT.editorNote,
      timeLabel: G38_TEXT.timeLabel,
    })
    : undefined;

  const toggleTimer = () => {
    if (timed) {
      setTimed(false);
      setDeadlineAt(undefined);
      return;
    }
    const startedAt = Date.now();
    setNow(startedAt);
    setDeadlineAt(sceneDeadlineAt(G38_TIMER_MINUTES, startedAt));
    setTimed(true);
  };

  return (
    <View>
      <Note theme={theme}>{G38_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G38_TEXT.sceneEyebrow} style={styles.card}>
        <AppText style={[styles.scene, { color: theme.ink }]}>{scene?.description ?? G38_TEXT.loading}</AppText>
        <View style={styles.detail}>
          <AppText variant="label" color={theme.accentText}>{G38_TEXT.characterEyebrow}</AppText>
          <AppText style={{ color: theme.ink }}>{scene?.character ?? G38_TEXT.loading}</AppText>
        </View>
        <View style={styles.detail}>
          <AppText variant="label" color={theme.accentText}>{G38_TEXT.unsaidEyebrow}</AppText>
          <AppText style={{ color: theme.ink }}>{scene?.unsaid ?? G38_TEXT.loading}</AppText>
        </View>
        <Button
          label={G38_TEXT.anotherScene}
          tone="secondary"
          small
          onPress={() => void draw()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </PromptCard>

      <View style={styles.timer}>
        <AppText variant="label" color={theme.accentText}>{G38_TEXT.timerTitle}</AppText>
        <View style={styles.row}>
          <Pill
            label={timed ? G38_TEXT.timerOn : G38_TEXT.timerOff}
            selected={timed}
            color={theme.accentText}
            onPress={toggleTimer}
          />
          {deadlineAt ? (
            <TimerBadge seconds={seconds} running={seconds > 0} accent={theme.accent} accentText={theme.accentText} />
          ) : null}
        </View>
        <AppText variant="caption" color={theme.inkSoft} style={styles.timerHint}>
          {!deadlineAt ? G38_TEXT.timerIdle : (seconds > 0 ? G38_TEXT.timerActive : G38_TEXT.timerReached)}
        </AppText>
      </View>

      <ActionBar
        text={scene ? G38_TEXT.consigna(scene.description, scene.character, scene.unsaid) : ''}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G38_TEXT.send}
      />
      <Note theme={theme}>{G38_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md },
  scene: { fontFamily: fonts.displayItalic, fontSize: 25, lineHeight: 32 },
  detail: { marginTop: spacing.sm },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  timer: { marginTop: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  timerHint: { marginTop: spacing.xs },
});
