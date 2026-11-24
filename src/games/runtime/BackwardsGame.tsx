import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G55_TEXT } from '@/content/games/g55';
import {
  canGoToEditor, makeBackwardsStimulus, normalOrder,
} from './g55Logic';
import {
  ActionBar, GameField, MiniButton, Note, PromptCard,
} from './ui';

export function BackwardsGame() {
  const theme = useGameTheme('g55');
  const [themeItem, setThemeItem] = useState<PoolItem | null>(null);
  const [finalVerse, setFinalVerse] = useState('');
  const [previous, setPrevious] = useState<string[]>(() => ['']);
  const [showNormal, setShowNormal] = useState(false);

  const drawTheme = async () => {
    const [next] = await randomService.draw('themes', 1);
    setThemeItem(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void drawTheme(); }); }, []);

  const ordered = normalOrder(finalVerse, previous);
  const stimulus = themeItem
    ? makeBackwardsStimulus({
      theme: themeItem.text,
      finalVerse,
      previous,
      title: G55_TEXT.editorTitle(themeItem.text),
      groupTitles: {
        theme: G55_TEXT.themeGroup,
        finalVerse: G55_TEXT.finalGroup,
        previous: G55_TEXT.previousGroup,
      },
      note: G55_TEXT.editorNote,
    })
    : undefined;

  return (
    <View>
      <Note theme={theme}>{G55_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G55_TEXT.themeEyebrow} style={styles.card}>
        <AppText style={[styles.seed, { color: theme.ink }]}>{themeItem?.text ?? G55_TEXT.loading}</AppText>
        <Button
          label={G55_TEXT.anotherTheme}
          tone="secondary"
          small
          onPress={() => void drawTheme()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </PromptCard>

      <View style={styles.block}>
        <Pill
          label={showNormal ? G55_TEXT.viewWriting : G55_TEXT.viewNormal}
          selected={showNormal}
          color={theme.accentText}
          onPress={() => setShowNormal((current) => !current)}
        />
      </View>

      {showNormal ? (
        <View style={styles.block}>
          <AppText variant="label" color={theme.accentText}>{G55_TEXT.normalOrderTitle}</AppText>
          {ordered.map((verse, index) => (
            <AppText key={index} style={[styles.orderedVerse, { color: theme.ink }]}>{verse}</AppText>
          ))}
        </View>
      ) : (
        <View style={styles.block}>
          <AppText variant="label" color={theme.accentText}>{G55_TEXT.previousEyebrow}</AppText>
          {previous.map((value, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.field}>
                <GameField
                  theme={theme}
                  value={value}
                  onChangeText={(next) => setPrevious((current) => current.map((text, position) => (position === index ? next : text)))}
                  placeholder={G55_TEXT.previousPlaceholder}
                  multiline
                />
              </View>
              <MiniButton
                label={G55_TEXT.removePrevious(index)}
                icon="x"
                theme={theme}
                disabled={previous.length <= 1}
                onPress={() => setPrevious((current) => current.filter((_, position) => position !== index))}
              />
            </View>
          ))}
          <Button
            label={G55_TEXT.addPrevious}
            tone="secondary"
            small
            onPress={() => setPrevious((current) => ['', ...current])}
            accent={theme.accentText}
            accentInk={theme.accentInk}
            style={styles.button}
          />
        </View>
      )}

      {!showNormal ? (
        <GameField
          theme={theme}
          label={G55_TEXT.finalEyebrow}
          value={finalVerse}
          onChangeText={setFinalVerse}
          placeholder={G55_TEXT.finalPlaceholder}
          multiline
          style={styles.finalField}
        />
      ) : null}

      <ActionBar
        text={ordered.join('\n')}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G55_TEXT.send}
        disabled={!stimulus || !canGoToEditor(finalVerse, previous)}
      />
      <Note theme={theme}>{G55_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md },
  seed: { fontFamily: fonts.displayItalic, fontSize: 25, lineHeight: 31 },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  block: { marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  field: { flex: 1 },
  orderedVerse: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, marginTop: spacing.sm },
  finalField: { marginTop: spacing.md },
});
