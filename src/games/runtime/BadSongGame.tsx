import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { TimerBadge } from '@/design/components/Feedback';
import { useCoreTheme, useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, motion, radii, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import { useLyricsStore } from '@/stores/lyricsStore';
import type { PoolItem } from '@/core/types';
import { G44_MINUTES, G44_TEXT } from '@/content/games/g44';
import { COMMON_TEXT } from '@/content/games/common';
import { remainingSeconds } from '@/editor/stimulusStatus';
import { badSongDeadline, makeBadSongStimulus } from './g44Logic';
import { ActionBar, Note, PromptCard } from './ui';

const enterEasing = Easing.bezier(
  motion.easing.enter[0], motion.easing.enter[1], motion.easing.enter[2], motion.easing.enter[3],
);
const exitEasing = Easing.bezier(
  motion.easing.exit[0], motion.easing.exit[1], motion.easing.exit[2], motion.easing.exit[3],
);

export function BadSongGame() {
  const theme = useGameTheme('g44');
  const { reduceMotion } = useCoreTheme();
  const [prompt, setPrompt] = useState<PoolItem | null>(null);
  const [deadlineAt, setDeadlineAt] = useState(() => badSongDeadline(G44_MINUTES, Date.now()));
  const [now, setNow] = useState(() => Date.now());
  const [torn, setTorn] = useState(false);
  const clear = useLyricsStore((state) => state.clear);
  const crumple = useSharedValue(0);

  const draw = useCallback(async () => {
    const [next] = await randomService.draw('bad_song_prompts', 1);
    setPrompt(next ?? null);
    setTorn(false);
    crumple.set(0);
    const startedAt = Date.now();
    setNow(startedAt);
    setDeadlineAt(badSongDeadline(G44_MINUTES, startedAt));
  }, [crumple]);
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, [draw]);
  useEffect(() => {
    if (!deadlineAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  const seconds = remainingSeconds(deadlineAt, now);
  const consigna = prompt?.text ?? '';
  const stimulus = consigna
    ? makeBadSongStimulus({
      prompt: consigna,
      title: G44_TEXT.editorTitle(consigna),
      groupTitle: G44_TEXT.promptEyebrow,
      note: G44_TEXT.goodBody,
    })
    : undefined;

  const finishTirar = () => {
    clear();
    setTorn(true);
  };

  const tirar = () => {
    if (reduceMotion) {
      finishTirar();
      return;
    }
    crumple.set(withSequence(
      withTiming(0.55, { duration: motion.fast, easing: enterEasing }),
      withTiming(1, { duration: motion.base, easing: exitEasing }, (finished) => {
        if (finished) runOnJS(finishTirar)();
      }),
    ));
  };

  const crumpleStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: 1 - 0.7 * crumple.get() },
      { scaleY: 1 - 0.35 * crumple.get() },
      { rotate: `${crumple.get() * 75}deg` },
    ],
    opacity: 1 - crumple.get(),
  }));

  return (
    <View>
      <Note theme={theme}>{G44_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G44_TEXT.promptEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.prompt, { color: theme.ink }]}>{consigna || COMMON_TEXT.loading}</AppText>
        <View style={styles.timerRow}>
          <TimerBadge seconds={seconds} running={seconds > 0} accent={theme.accent} accentText={theme.accentText} />
          <AppText variant="caption" color={theme.inkSoft} style={{ marginLeft: spacing.xs }}>
            {seconds > 0 ? G44_TEXT.timeLabel : G44_TEXT.reached}
          </AppText>
        </View>
        <Button
          label={G44_TEXT.anotherPrompt}
          tone="secondary"
          small
          onPress={() => void draw()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
        />
      </PromptCard>

      {torn ? (
        <PromptCard theme={theme} eyebrow={G44_TEXT.goodTitle} style={{ marginTop: spacing.md }}>
          <AppText style={[styles.good, { color: theme.ink }]}>{G44_TEXT.goodBody}</AppText>
        </PromptCard>
      ) : (
        <View style={styles.trash}>
          <Animated.View
            style={[
              styles.paper,
              { borderColor: theme.accent, backgroundColor: alpha(theme.accent, 0.12) },
              crumpleStyle,
            ]}
          >
            <Feather name="file-text" size={30} color={theme.accentText} />
          </Animated.View>
          <Button
            label={G44_TEXT.tirar}
            small
            onPress={tirar}
            accent={theme.accent}
            accentInk={theme.accentInk}
          />
          <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: spacing.xs }}>
            {G44_TEXT.tirarHint}
          </AppText>
        </View>
      )}

      <ActionBar
        text={consigna}
        theme={theme}
        stimulus={stimulus}
        sendLabel={torn ? G44_TEXT.goodSend : G44_TEXT.writeBad}
      />
      <Note theme={theme}>{G44_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: { fontFamily: fonts.displayItalic, fontSize: 26, lineHeight: 33 },
  timerRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: spacing.sm },
  trash: { alignItems: 'center', marginTop: spacing.lg },
  paper: {
    width: 64, height: 64, borderRadius: radii.card, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  good: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 25 },
});
