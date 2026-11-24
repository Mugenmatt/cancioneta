import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G57_TEXT } from '@/content/games/g57';
import {
  assembledDialogue, canGoToEditor, initialVerses, makeVoicesStimulus,
  nextVoice, pairFromItem, writtenVerses,
} from './g57Logic';
import { ActionBar, GameField, MiniButton, Note, PromptCard } from './ui';

export function TwoVoicesGame() {
  const theme = useGameTheme('g57');
  const [item, setItem] = useState<PoolItem | null>(null);
  const [verses, setVerses] = useState(initialVerses);

  const drawPair = async () => {
    const [next] = await randomService.draw('voice_pairs', 1);
    setItem(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void drawPair(); }); }, []);

  const pair = item ? pairFromItem(item) : null;
  const stimulus = pair && pair.a && pair.b
    ? makeVoicesStimulus({
      pair,
      verses,
      title: G57_TEXT.editorTitle(pair.a, pair.b),
      groupTitles: {
        a: G57_TEXT.groupA(pair.a),
        b: G57_TEXT.groupB(pair.b),
        note: G57_TEXT.noteGroup,
      },
      note: G57_TEXT.editorNote,
    })
    : undefined;

  const update = (index: number, text: string) => setVerses((current) =>
    current.map((verse, position) => (position === index ? { ...verse, text } : verse)));

  return (
    <View>
      <Note theme={theme}>{G57_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G57_TEXT.pairEyebrow} style={styles.card}>
        <View style={styles.pairRow}>
          <View style={[styles.voiceTag, { borderColor: theme.accent, backgroundColor: alpha(theme.accent, 0.12) }]}>
            <AppText variant="label" color={theme.accentText}>{pair?.a ?? G57_TEXT.loading}</AppText>
          </View>
          <View style={[styles.voiceTag, { borderColor: theme.inkSoft, backgroundColor: alpha(theme.ink, 0.06) }]}>
            <AppText variant="label" color={theme.ink}>{pair?.b ?? G57_TEXT.loading}</AppText>
          </View>
        </View>
        <Button
          label={G57_TEXT.anotherPair}
          tone="secondary"
          small
          onPress={() => void drawPair()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </PromptCard>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G57_TEXT.versesEyebrow}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={styles.counter}>
          {G57_TEXT.versesCount(writtenVerses(verses).length)}
        </AppText>
        <Note theme={theme}>{G57_TEXT.noNarrator}</Note>
        {verses.map((verse, index) => {
          const character = verse.voice === 'A' ? pair?.a ?? '' : pair?.b ?? '';
          const isA = verse.voice === 'A';
          return (
            <View
              key={index}
              style={[
                styles.verse,
                {
                  borderColor: isA ? theme.accent : theme.inkSoft,
                  backgroundColor: isA ? alpha(theme.accent, 0.08) : alpha(theme.ink, 0.04),
                },
              ]}
            >
              <AppText variant="label" color={isA ? theme.accentText : theme.ink}>
                {G57_TEXT.voiceEyebrow(character)}
              </AppText>
              <View style={styles.row}>
                <View style={styles.field}>
                  <GameField
                    theme={theme}
                    value={verse.text}
                    onChangeText={(text) => update(index, text)}
                    placeholder={G57_TEXT.versePlaceholder(character)}
                    multiline
                  />
                </View>
                <MiniButton
                  label={G57_TEXT.removeVerse(index)}
                  icon="x"
                  theme={theme}
                  onPress={() => setVerses((current) => current.filter((_, position) => position !== index))}
                />
              </View>
            </View>
          );
        })}
        <Button
          label={G57_TEXT.addVerse}
          tone="secondary"
          small
          onPress={() => setVerses((current) => [...current, { voice: nextVoice(current), text: '' }])}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </View>

      <ActionBar
        text={assembledDialogue(verses)}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G57_TEXT.send}
        disabled={!stimulus || !canGoToEditor(verses)}
      />
      <Note theme={theme}>{G57_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md },
  pairRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  voiceTag: { borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  block: { marginTop: spacing.md },
  counter: { marginTop: 4 },
  verse: { borderLeftWidth: 3, borderRadius: 12, padding: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  field: { flex: 1 },
});
