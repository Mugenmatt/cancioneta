import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import { G50_SECTIONS, G50_TEXT, type EmotionSlot } from '@/content/games/g50';
import {
  assignEmotions, emotionSummary, excludeForSlot, makeEmotionArcStimulus,
  replaceEmotion, type EmotionSlots,
} from './g50Logic';
import { ActionBar, Note, PromptCard } from './ui';

const EMPTY: EmotionSlots = { verse: null, preChorus: null, chorus: null };

export function EmotionArcGame() {
  const theme = useGameTheme('g50');
  const [slots, setSlots] = useState<EmotionSlots>(EMPTY);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      const drawn = await randomService.draw('emotion_arc', 3);
      if (drawn.length > 0) setSlots(assignEmotions(drawn));
    });
  }, []);

  const rollAll = async () => {
    const drawn = await randomService.draw('emotion_arc', 3);
    if (drawn.length > 0) setSlots(assignEmotions(drawn));
  };

  const rollOne = async (slot: EmotionSlot) => {
    const [next] = await randomService.draw('emotion_arc', 1, {
      excludeFingerprints: excludeForSlot(slots, slot),
    });
    if (next) setSlots((current) => replaceEmotion(current, slot, next));
  };

  const ready = G50_SECTIONS.every((section) => Boolean(slots[section.id]));
  const summary = emotionSummary(slots);
  const stimulus = ready ? makeEmotionArcStimulus({
    slots,
    title: G50_TEXT.editorTitle,
    note: G50_TEXT.editorNote,
    groupTitle: G50_TEXT.group,
  }) : undefined;

  return (
    <View>
      <Note theme={theme}>{G50_TEXT.intro}</Note>
      <Button label={G50_TEXT.drawAll} tone="secondary" small onPress={() => void rollAll()} accent={theme.accentText} accentInk={theme.accentInk} style={styles.rollAll} />

      {G50_SECTIONS.map((section) => (
        <PromptCard key={section.id} theme={theme} eyebrow={section.label} style={styles.card}>
          <AppText variant="caption" color={theme.inkSoft}>{section.hint}</AppText>
          <AppText style={[styles.emotion, { color: theme.ink }]}>{slots[section.id]?.text ?? G50_TEXT.loading}</AppText>
          <Button
            label={G50_TEXT.another(section.label)}
            tone="secondary"
            small
            onPress={() => void rollOne(section.id)}
            accent={theme.accentText}
            accentInk={theme.accentInk}
            style={styles.button}
          />
        </PromptCard>
      ))}

      <ActionBar text={ready ? G50_TEXT.consigna(summary) : ''} theme={theme} stimulus={stimulus} sendLabel={G50_TEXT.send} />
      <Note theme={theme}>{G50_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  rollAll: { alignSelf: 'flex-start', marginTop: spacing.md },
  card: { marginTop: spacing.sm },
  emotion: { fontFamily: fonts.displayItalic, fontSize: 26, lineHeight: 32, marginTop: 4 },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
});
