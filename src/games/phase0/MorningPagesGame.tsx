import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, TimerBadge } from '@/design/components/Feedback';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { spacing } from '@/design/tokens';
import { ActionBar, GameField, GameIntro, Note, runtimeStyles } from '@/games/runtime/ui';
import { formatClock, getPageProgress } from './logic';
import { PHASE0_CONTENT } from '@/content/phase0';

export function MorningPagesGame() {
  const theme = useGameTheme('f0-2');
  const [text, setText] = useState('');
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const progress = getPageProgress(text);

  useEffect(() => {
    if (!timerOn) return;
    const interval = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(interval);
  }, [timerOn]);

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
        <TimerBadge seconds={seconds} running={timerOn} accent={theme.accent} accentText={theme.accentText} />
      </View>

      <Note theme={theme}>
        {progress.completedPages >= progress.totalPages
          ? PHASE0_CONTENT.pages.goalReached
          : PHASE0_CONTENT.pages.goal}
      </Note>

      <Button
        label={timerOn ? PHASE0_CONTENT.pages.timerOff : PHASE0_CONTENT.pages.timerOn}
        tone="secondary"
        small
        onPress={() => setTimerOn((current) => !current)}
        accent={theme.accentText}
        accentInk={theme.accentInk}
        accessibilityHint={PHASE0_CONTENT.pages.timerLabel(formatClock(seconds))}
      />

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
  field: { minHeight: spacing.xxxl * 4 },
});
