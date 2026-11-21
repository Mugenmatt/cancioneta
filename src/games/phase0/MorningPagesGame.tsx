import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, TimerBadge } from '@/design/components/Feedback';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { spacing } from '@/design/tokens';
import { ActionBar, GameField, GameIntro, Note, runtimeStyles } from '@/games/runtime/ui';
import { playAlarm, stopAlarm } from '@/services/audio/alarm';
import { formatClock, getPageProgress } from './logic';
import { PHASE0_CONTENT } from '@/content/phase0';

const TIMER_OPTIONS = [0, 5, 10, 15, 20, 30] as const;
type TimerMinutes = (typeof TIMER_OPTIONS)[number];

export function MorningPagesGame() {
  const theme = useGameTheme('f0-2');
  const [text, setText] = useState('');
  const [timerOn, setTimerOn] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<TimerMinutes>(0);
  const [seconds, setSeconds] = useState(0);
  const [ended, setEnded] = useState(false);
  const alarmedTargetRef = useRef<number | null>(null);
  const progress = getPageProgress(text);

  useEffect(() => {
    if (!timerOn) return;
    const interval = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(interval);
  }, [timerOn]);

  useEffect(() => {
    if (!timerOn || timerMinutes === 0) return;
    const target = timerMinutes * 60;
    if (seconds >= target && alarmedTargetRef.current !== target) {
      alarmedTargetRef.current = target;
      setEnded(true);
      void playAlarm(3);
    }
  }, [seconds, timerMinutes, timerOn]);

  useEffect(() => () => stopAlarm(), []);

  const selectMinutes = (minutes: TimerMinutes) => {
    setTimerMinutes(minutes);
    setSeconds(0);
    setEnded(false);
    alarmedTargetRef.current = null;
    stopAlarm();
    setTimerOn(true);
  };

  const toggleTimer = () => {
    if (timerOn) {
      setTimerOn(false);
      setSeconds(0);
      setEnded(false);
      alarmedTargetRef.current = null;
      stopAlarm();
      return;
    }
    setSeconds(0);
    setEnded(false);
    alarmedTargetRef.current = null;
    setTimerOn(true);
  };

  const targetSeconds = timerMinutes === 0 ? null : timerMinutes * 60;
  const displaySeconds = targetSeconds === null ? seconds : Math.max(0, targetSeconds - seconds);

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{PHASE0_CONTENT.pages.intro}</GameIntro>

      <View style={styles.status}>
        <ProgressBar
          value={progress.words}
          total={progress.targetWords}
          accent={theme.accent}
          label={PHASE0_CONTENT.pages.progressLabel(progress.page, progress.totalPages, progress.wordsIntoPage, progress.targetWords / progress.totalPages)}
        />
        <TimerBadge seconds={displaySeconds} running={timerOn && !ended} accent={theme.accent} accentText={theme.accentText} />
      </View>

      <Note theme={theme}>
        {progress.completedPages >= progress.totalPages
          ? PHASE0_CONTENT.pages.goalReached
          : PHASE0_CONTENT.pages.goal}
      </Note>

      <View style={styles.timerOptions}>
        {TIMER_OPTIONS.map((minutes) => (
          <Pill
            key={minutes}
            label={minutes === 0 ? PHASE0_CONTENT.pages.timerFree : PHASE0_CONTENT.pages.timerMinutes(minutes)}
            selected={timerOn && timerMinutes === minutes}
            onPress={() => selectMinutes(minutes)}
            color={theme.accentText}
          />
        ))}
      </View>

      <Button
        label={timerOn ? PHASE0_CONTENT.pages.timerOff : PHASE0_CONTENT.pages.timerOn}
        tone="secondary"
        small
        onPress={toggleTimer}
        accent={theme.accentText}
        accentInk={theme.accentInk}
        accessibilityHint={PHASE0_CONTENT.pages.timerLabel(formatClock(displaySeconds))}
      />

      {ended ? <Note theme={theme}>{PHASE0_CONTENT.pages.timerEnded}</Note> : null}

      <GameField
        theme={theme}
        label={PHASE0_CONTENT.common.writingLabel}
        value={text}
        onChangeText={setText}
        placeholder={PHASE0_CONTENT.pages.placeholder}
        multiline
        style={styles.field}
      />

      <Note theme={theme}>{PHASE0_CONTENT.common.privacyNote}</Note>
      <ActionBar text={text} theme={theme} sendLabel={PHASE0_CONTENT.pages.sendLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  status: { gap: spacing.sm },
  timerOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  field: { minHeight: spacing.xxxl * 4 },
});
