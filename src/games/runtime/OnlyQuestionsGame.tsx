import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G54_MAX_VERSES, G54_MIN_VERSES, G54_TEXT } from '@/content/games/g54';
import {
  canGoToEditor, filledVerses, makeQuestionVersesStimulus,
} from './g54Logic';
import { ActionBar, GameField, MiniButton, Note, PromptCard } from './ui';

export function OnlyQuestionsGame() {
  const theme = useGameTheme('g54');
  const [themeItem, setThemeItem] = useState<PoolItem | null>(null);
  const [verses, setVerses] = useState<string[]>(() => Array.from({ length: G54_MIN_VERSES }, () => ''));

  const drawTheme = async () => {
    const [next] = await randomService.draw('themes', 1);
    setThemeItem(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void drawTheme(); }); }, []);

  const update = (index: number, value: string) => setVerses((current) =>
    current.map((text, position) => (position === index ? value : text)));

  const stimulus = themeItem
    ? makeQuestionVersesStimulus({
      theme: themeItem.text,
      values: verses,
      title: G54_TEXT.editorTitle(themeItem.text),
      groupTitles: { theme: G54_TEXT.themeGroup, issues: G54_TEXT.issuesGroup },
      issueLabel: G54_TEXT.issueLabel,
      note: G54_TEXT.editorNote,
      doneLabel: G54_TEXT.checkDone,
      pendingLabel: G54_TEXT.checkPending,
    })
    : undefined;

  return (
    <View>
      <Note theme={theme}>{G54_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G54_TEXT.themeEyebrow} style={styles.card}>
        <AppText style={[styles.seed, { color: theme.ink }]}>{themeItem?.text ?? G54_TEXT.loading}</AppText>
        <Button
          label={G54_TEXT.anotherTheme}
          tone="secondary"
          small
          onPress={() => void drawTheme()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </PromptCard>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G54_TEXT.versesEyebrow}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={styles.counter}>
          {verses.length < G54_MIN_VERSES ? G54_TEXT.minPending : G54_TEXT.versesCount(filledVerses(verses).length)}
        </AppText>
        {verses.map((value, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.field}>
              <GameField
                theme={theme}
                value={value}
                onChangeText={(next) => update(index, next)}
                placeholder={G54_TEXT.versePlaceholder(index)}
                multiline
              />
            </View>
            <MiniButton
              label={G54_TEXT.removeVerse(index)}
              icon="x"
              theme={theme}
              disabled={verses.length <= G54_MIN_VERSES}
              onPress={() => setVerses((current) => current.filter((_, position) => position !== index))}
            />
          </View>
        ))}
        <Button
          label={G54_TEXT.addVerse}
          tone="secondary"
          small
          disabled={verses.length >= G54_MAX_VERSES}
          onPress={() => setVerses((current) => [...current, ''])}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </View>

      <ActionBar
        text={filledVerses(verses).join('\n')}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G54_TEXT.send}
        disabled={!stimulus || !canGoToEditor(verses)}
      />
      <Note theme={theme}>{G54_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md },
  seed: { fontFamily: fonts.displayItalic, fontSize: 25, lineHeight: 31 },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  block: { marginTop: spacing.md },
  counter: { marginTop: 4, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  field: { flex: 1 },
});
