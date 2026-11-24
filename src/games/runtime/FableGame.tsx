import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolId, PoolItem } from '@/core/types';
import { G37_TEXT } from '@/content/games/g37';
import { makeFableStimulus } from './g37Logic';
import { ActionBar, Note, PromptCard } from './ui';

type Setter = (item: PoolItem | null) => void;

export function FableGame() {
  const theme = useGameTheme('g37');
  const [protagonist, setProtagonist] = useState<PoolItem | null>(null);
  const [conflict, setConflict] = useState<PoolItem | null>(null);

  const drawSeed = async (pool: PoolId, setter: Setter) => {
    const [next] = await randomService.draw(pool, 1);
    setter(next ?? null);
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      void drawSeed('fable_protagonists', setProtagonist);
      void drawSeed('fable_conflicts', setConflict);
    });
  }, []);

  const seeds = { protagonist: protagonist?.text ?? '', conflict: conflict?.text ?? '' };
  const ready = Boolean(protagonist && conflict);
  const stimulus = ready ? makeFableStimulus({
    seeds,
    title: G37_TEXT.editorTitle(seeds.protagonist),
    note: G37_TEXT.editorNote,
    groupTitles: { body: G37_TEXT.groupBody, moral: G37_TEXT.groupMoral },
    moralLines: [G37_TEXT.moralFirst, G37_TEXT.moralSecond],
  }) : undefined;

  return (
    <View>
      <Note theme={theme}>{G37_TEXT.intro}</Note>
      <AppText variant="caption" color={theme.inkSoft} style={styles.plan}>{G37_TEXT.versePlan}</AppText>

      <PromptCard theme={theme} eyebrow={G37_TEXT.protagonistEyebrow} style={styles.card}>
        <AppText style={[styles.seed, { color: theme.ink }]}>{protagonist?.text ?? G37_TEXT.loading}</AppText>
        <Button label={G37_TEXT.anotherProtagonist} tone="secondary" small onPress={() => void drawSeed('fable_protagonists', setProtagonist)} accent={theme.accentText} accentInk={theme.accentInk} style={styles.button} />
      </PromptCard>
      <PromptCard theme={theme} eyebrow={G37_TEXT.conflictEyebrow} style={styles.card}>
        <AppText style={[styles.seed, { color: theme.ink }]}>{conflict?.text ?? G37_TEXT.loading}</AppText>
        <Button label={G37_TEXT.anotherConflict} tone="secondary" small onPress={() => void drawSeed('fable_conflicts', setConflict)} accent={theme.accentText} accentInk={theme.accentInk} style={styles.button} />
      </PromptCard>

      <ActionBar text={ready ? G37_TEXT.consigna(seeds.protagonist, seeds.conflict) : ''} theme={theme} stimulus={stimulus} sendLabel={G37_TEXT.send} />
      <Note theme={theme}>{G37_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  plan: { marginTop: 4 },
  card: { marginTop: spacing.md },
  seed: { fontFamily: fonts.displayItalic, fontSize: 25, lineHeight: 31 },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
});
