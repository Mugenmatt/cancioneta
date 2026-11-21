import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TimerBadge } from '@/design/components/Feedback';
import { Button } from '@/design/components/Button';
import { AppText } from '@/design/components/Text';
import { useGameTheme } from '@/design/ThemeProvider';
import { fontSizes, fonts, lineHeights, spacing } from '@/design/tokens';
import { ActionBar, GameField, GameIntro, Note, PromptCard, runtimeStyles } from '@/games/runtime/ui';
import { randomService } from '@/services/random/RandomService';
import { PHASE0_CONTENT } from '@/content/phase0';
import { createSpyController, type SpyState } from './controllers';
import { formatClock, OBSERVATION_SECONDS } from './logic';

type ObservationPhase = 'ready' | 'observing' | 'writing';

export function SpyGame() {
  const theme = useGameTheme('f0-4');
  const controller = useMemo(() => createSpyController(randomService), []);
  const [state, setState] = useState<SpyState>(() => controller.getState());
  const [started, setStarted] = useState(false);
  const [observing, setObserving] = useState(false);
  const [seconds, setSeconds] = useState(OBSERVATION_SECONDS);
  const [text, setText] = useState('');
  const phase: ObservationPhase = !started ? 'ready' : observing && seconds > 0 ? 'observing' : 'writing';

  useEffect(() => {
    let active = true;
    void controller.start().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, [controller]);

  useEffect(() => {
    if (!observing || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [observing, seconds]);

  const beginObservation = () => {
    setSeconds(OBSERVATION_SECONDS);
    setStarted(true);
    setObserving(true);
  };

  const message = state.error
    ? PHASE0_CONTENT.spy.error
    : phase === 'observing'
      ? PHASE0_CONTENT.spy.observing
      : phase === 'writing'
        ? PHASE0_CONTENT.spy.observed
        : PHASE0_CONTENT.spy.intro;

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{message}</GameIntro>

      {state.questions.length > 0 ? (
        <PromptCard theme={theme} eyebrow={PHASE0_CONTENT.spy.questionsEyebrow}>
          <View style={styles.questions}>
            {state.questions.map((question, index) => (
              <View key={question.fingerprint} style={styles.questionRow}>
                <AppText variant="label" color={theme.accentText}>{String(index + 1).padStart(2, '0')}</AppText>
                <AppText style={[styles.question, { color: theme.ink }]}>{question.text}</AppText>
              </View>
            ))}
          </View>
        </PromptCard>
      ) : null}

      <View style={styles.controls}>
        <TimerBadge seconds={seconds} running={observing && seconds > 0} accent={theme.accent} accentText={theme.accentText} />
        {phase === 'observing' ? (
          <Button
            label={PHASE0_CONTENT.spy.stopObservation}
            tone="secondary"
            small
            onPress={() => setObserving(false)}
            accent={theme.accentText}
            accentInk={theme.accentInk}
          />
        ) : (
          <Button
            label={PHASE0_CONTENT.spy.startObservation}
            small
            disabled={state.questions.length === 0}
            onPress={beginObservation}
            accent={theme.accent}
            accentInk={theme.accentInk}
          />
        )}
        <AppText variant="caption" color={theme.inkSoft}>
          {PHASE0_CONTENT.spy.timerLabel(formatClock(seconds))}
        </AppText>
      </View>

      {phase === 'writing' ? (
        <>
          <GameField
            theme={theme}
            label={PHASE0_CONTENT.common.writingLabel}
            value={text}
            onChangeText={setText}
            placeholder={PHASE0_CONTENT.spy.placeholder}
            multiline
            style={styles.field}
          />
          <ActionBar text={text} theme={theme} sendLabel={PHASE0_CONTENT.spy.sendLabel} />
        </>
      ) : null}

      <Note theme={theme}>{PHASE0_CONTENT.common.privacyNote}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  questions: { gap: spacing.sm },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  question: { flex: 1, fontFamily: fonts.serif, fontSize: fontSizes.body, lineHeight: fontSizes.body * lineHeights.reading },
  controls: { gap: spacing.sm },
  field: { minHeight: spacing.xxxl * 4 },
});
