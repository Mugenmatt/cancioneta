import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import {
  G48_MAX_VERSES, G48_MIN_VERSES, G48_SHOTS, G48_TEXT, type Shot,
} from '@/content/games/g48';
import { assignShots, makeShotStimulus, type ShotOrder } from './g48Logic';
import { ActionBar, GameField, Note, PromptCard } from './ui';

const COUNTS = Array.from(
  { length: G48_MAX_VERSES - G48_MIN_VERSES + 1 },
  (_, index) => G48_MIN_VERSES + index,
);

export function ShotPlanGame() {
  const theme = useGameTheme('g48');
  const [count, setCount] = useState(G48_MIN_VERSES);
  const [order, setOrder] = useState<ShotOrder>('ordered');
  const [scene, setScene] = useState('');
  const [shuffled, setShuffled] = useState<readonly Shot[]>(() => randomService.shuffle(G48_SHOTS));

  const assigned = assignShots(count, order, G48_SHOTS, shuffled);
  const orderLabel = order === 'ordered' ? G48_TEXT.orderedLabel : G48_TEXT.randomLabel;
  const stimulus = makeShotStimulus({
    shots: assigned,
    scene: scene.trim(),
    title: G48_TEXT.editorTitle(count),
    note: G48_TEXT.editorNote,
    groupTitles: { scene: G48_TEXT.groupScene, verse: G48_TEXT.verseGroup },
  });

  return (
    <View>
      <Note theme={theme}>{G48_TEXT.intro}</Note>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G48_TEXT.countEyebrow}</AppText>
        <View style={styles.pills}>
          {COUNTS.map((value) => (
            <Pill key={value} label={G48_TEXT.countLabel(value)} selected={count === value} color={theme.accentText} onPress={() => setCount(value)} />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G48_TEXT.orderEyebrow}</AppText>
        <View style={styles.pills}>
          <Pill label={G48_TEXT.orderedLabel} selected={order === 'ordered'} color={theme.accentText} onPress={() => setOrder('ordered')} />
          <Pill label={G48_TEXT.randomLabel} selected={order === 'random'} color={theme.accentText} onPress={() => setOrder('random')} />
          {order === 'random' ? (
            <Button label={G48_TEXT.reshuffle} tone="secondary" small onPress={() => setShuffled(randomService.shuffle(G48_SHOTS))} accent={theme.accentText} accentInk={theme.accentInk} />
          ) : null}
        </View>
      </View>

      <GameField
        theme={theme}
        label={G48_TEXT.sceneLabel}
        value={scene}
        onChangeText={setScene}
        placeholder={G48_TEXT.scenePlaceholder}
        style={styles.block}
      />

      <PromptCard theme={theme} eyebrow={G48_TEXT.editorTitle(count)} style={styles.block}>
        {assigned.map((shot, index) => (
          <View key={`${shot.id}-${index}`} style={styles.verse}>
            <AppText variant="label" color={theme.accentText}>{G48_TEXT.verseGroup(index, shot.label)}</AppText>
            <AppText variant="caption" color={theme.inkSoft}>{shot.hint}</AppText>
          </View>
        ))}
      </PromptCard>

      <ActionBar text={G48_TEXT.consigna(count, orderLabel, scene.trim())} theme={theme} stimulus={stimulus} sendLabel={G48_TEXT.send} />
      <Note theme={theme}>{G48_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  verse: { marginBottom: spacing.sm },
});
