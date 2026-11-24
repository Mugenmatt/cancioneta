import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolId, PoolItem } from '@/core/types';
import { G34_TEXT } from '@/content/games/g34';
import { makeNarratorStimulus, narratorSummary, type NarratorAxes } from './g34Logic';
import { ActionBar, Note, PromptCard } from './ui';

type Setter = (item: PoolItem | null) => void;

export function NarratorGame() {
  const theme = useGameTheme('g34');
  const [person, setPerson] = useState<PoolItem | null>(null);
  const [distance, setDistance] = useState<PoolItem | null>(null);
  const [reliability, setReliability] = useState<PoolItem | null>(null);
  const [withTheme, setWithTheme] = useState(false);
  const [themeItem, setThemeItem] = useState<PoolItem | null>(null);

  const drawAxis = async (pool: PoolId, setter: Setter) => {
    const [next] = await randomService.draw(pool, 1);
    setter(next ?? null);
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      void drawAxis('narrator_person', setPerson);
      void drawAxis('narrator_distance', setDistance);
      void drawAxis('narrator_reliability', setReliability);
    });
  }, []);

  const axes: NarratorAxes = {
    person: person?.text ?? '',
    distance: distance?.text ?? '',
    reliability: reliability?.text ?? '',
    theme: withTheme ? themeItem?.text ?? '' : '',
  };
  const ready = Boolean(person && distance && reliability);
  const summary = ready ? narratorSummary(axes) : '';
  const stimulus = ready ? makeNarratorStimulus({
    axes,
    title: G34_TEXT.editorTitle(summary),
    note: G34_TEXT.editorNote,
    groupTitles: {
      person: G34_TEXT.groupPerson,
      distance: G34_TEXT.groupDistance,
      reliability: G34_TEXT.groupReliability,
      theme: G34_TEXT.groupTheme,
    },
  }) : undefined;

  const enableTheme = () => {
    setWithTheme(true);
    if (!themeItem) void drawAxis('themes', setThemeItem);
  };

  return (
    <View>
      <Note theme={theme}>{G34_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G34_TEXT.personEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.axis, { color: theme.ink }]}>{person?.text ?? G34_TEXT.loading}</AppText>
        <Button label={G34_TEXT.anotherPerson} tone="secondary" small onPress={() => void drawAxis('narrator_person', setPerson)} accent={theme.accentText} accentInk={theme.accentInk} style={styles.button} />
      </PromptCard>
      <PromptCard theme={theme} eyebrow={G34_TEXT.distanceEyebrow} style={{ marginTop: spacing.sm }}>
        <AppText style={[styles.axis, { color: theme.ink }]}>{distance?.text ?? G34_TEXT.loading}</AppText>
        <Button label={G34_TEXT.anotherDistance} tone="secondary" small onPress={() => void drawAxis('narrator_distance', setDistance)} accent={theme.accentText} accentInk={theme.accentInk} style={styles.button} />
      </PromptCard>
      <PromptCard theme={theme} eyebrow={G34_TEXT.reliabilityEyebrow} style={{ marginTop: spacing.sm }}>
        <AppText style={[styles.axis, { color: theme.ink }]}>{reliability?.text ?? G34_TEXT.loading}</AppText>
        <Button label={G34_TEXT.anotherReliability} tone="secondary" small onPress={() => void drawAxis('narrator_reliability', setReliability)} accent={theme.accentText} accentInk={theme.accentInk} style={styles.button} />
      </PromptCard>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G34_TEXT.themeTitle}</AppText>
        <View style={styles.pills}>
          <Pill label={G34_TEXT.withoutTheme} selected={!withTheme} color={theme.accentText} onPress={() => setWithTheme(false)} />
          <Pill label={G34_TEXT.withTheme} selected={withTheme} color={theme.accentText} onPress={enableTheme} />
        </View>
        {withTheme ? (
          <PromptCard theme={theme} eyebrow={G34_TEXT.themeEyebrow} style={{ marginTop: spacing.sm }}>
            <AppText style={[styles.theme, { color: theme.ink }]}>{themeItem?.text ?? G34_TEXT.loading}</AppText>
            <Button label={G34_TEXT.anotherTheme} tone="secondary" small onPress={() => void drawAxis('themes', setThemeItem)} accent={theme.accentText} accentInk={theme.accentInk} style={styles.button} />
          </PromptCard>
        ) : null}
      </View>

      <ActionBar text={summary ? G34_TEXT.consigna(summary) : ''} theme={theme} stimulus={stimulus} sendLabel={G34_TEXT.send} />
      <Note theme={theme}>{G34_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  theme: { fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 30 },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  block: { marginTop: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
});
