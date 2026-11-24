import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G43_TEXT } from '@/content/games/g43';
import { makeStrangerStimulus } from './g43Logic';
import { ActionBar, GameField, Note, PromptCard } from './ui';

export function StrangerStoryGame() {
  const theme = useGameTheme('g43');
  const [withTrigger, setWithTrigger] = useState(false);
  const [trigger, setTrigger] = useState<PoolItem | null>(null);
  const [plain, setPlain] = useState('');

  const drawTrigger = async () => {
    const [next] = await randomService.draw('situations', 1);
    setTrigger(next ?? null);
  };

  const enableTrigger = () => {
    setWithTrigger(true);
    if (!trigger) void drawTrigger();
  };

  const stimulus = plain.trim()
    ? makeStrangerStimulus({
      plain,
      title: G43_TEXT.editorTitle,
      groupTitle: G43_TEXT.plainGroup,
      note: G43_TEXT.editorNote,
    })
    : undefined;

  return (
    <View>
      <Note theme={theme}>{G43_TEXT.intro}</Note>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G43_TEXT.triggerTitle}</AppText>
        <View style={styles.pills}>
          <Pill label={G43_TEXT.withoutTrigger} selected={!withTrigger} color={theme.accentText} onPress={() => setWithTrigger(false)} />
          <Pill label={G43_TEXT.withTrigger} selected={withTrigger} color={theme.accentText} onPress={enableTrigger} />
        </View>
        {withTrigger ? (
          <PromptCard theme={theme} eyebrow={G43_TEXT.triggerEyebrow} style={styles.card}>
            <AppText style={[styles.seed, { color: theme.ink }]}>{trigger?.text ?? G43_TEXT.loading}</AppText>
            <Button
              label={G43_TEXT.anotherTrigger}
              tone="secondary"
              small
              onPress={() => void drawTrigger()}
              accent={theme.accentText}
              accentInk={theme.accentInk}
              style={styles.button}
            />
          </PromptCard>
        ) : null}
      </View>

      <GameField
        theme={theme}
        label={G43_TEXT.plainEyebrow}
        value={plain}
        onChangeText={setPlain}
        placeholder={G43_TEXT.plainPlaceholder}
        multiline
        style={styles.field}
      />

      {plain.trim() ? (
        <PromptCard theme={theme} eyebrow={G43_TEXT.stepTwoTitle} style={styles.card}>
          <AppText variant="caption" color={theme.inkSoft}>{G43_TEXT.stepTwoBody}</AppText>
        </PromptCard>
      ) : null}

      <ActionBar
        text={plain}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G43_TEXT.send}
        disabled={!stimulus}
      />
      <Note theme={theme}>{G43_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  card: { marginTop: spacing.sm },
  seed: { fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 30 },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  field: { marginTop: spacing.md },
});
