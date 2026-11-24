import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, spacing } from '@/design/tokens';
import { dataService } from '@/services/data/DataService';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G35_SCHEMES, G35_TEXT } from '@/content/games/g35';
import { makeRhymeStimulus, schemeById } from './g35Logic';
import { ActionBar, Note, PromptCard } from './ui';

export function RhymeMoldGame() {
  const theme = useGameTheme('g35');
  const [current, setCurrent] = useState<PoolItem | null>(null);

  const draw = async () => {
    const [next] = await randomService.draw('rhyme_schemes', 1, {
      excludeFingerprints: current ? new Set([current.fingerprint]) : undefined,
    });
    if (next) setCurrent(next);
  };
  useEffect(() => {
    void Promise.resolve().then(async () => {
      const [first] = await randomService.draw('rhyme_schemes', 1);
      if (first) setCurrent(first);
    });
  }, []);

  const choose = (id: string) => {
    const item = dataService.getPool('rhyme_schemes').find((entry) => entry.text === id);
    if (item) setCurrent(item);
  };

  const scheme = schemeById(current?.text);
  const stimulus = scheme ? makeRhymeStimulus({
    scheme,
    title: G35_TEXT.editorTitle(scheme.pattern),
    note: G35_TEXT.editorNote,
    groupTitles: { scheme: G35_TEXT.schemeGroup, example: G35_TEXT.exampleGroup },
  }) : undefined;

  return (
    <View>
      <Note theme={theme}>{G35_TEXT.intro}</Note>

      <View style={styles.head}>
        <AppText variant="label" color={theme.accentText}>{G35_TEXT.cardEyebrow}</AppText>
        <Button label={G35_TEXT.draw} tone="secondary" small onPress={() => void draw()} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <View style={styles.cards}>
        {G35_SCHEMES.map((entry) => {
          const selected = entry.id === current?.text;
          return (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityLabel={`${entry.pattern} — ${entry.name}`}
              accessibilityState={{ selected }}
              onPress={() => choose(entry.id)}
              style={[
                styles.card,
                {
                  borderColor: selected ? theme.accent : alpha(theme.ink, 0.2),
                  backgroundColor: selected ? alpha(theme.accent, 0.12) : alpha(theme.surface, 0.6),
                },
              ]}
            >
              <AppText style={[styles.pattern, { color: selected ? theme.accentText : theme.ink }]}>{entry.pattern}</AppText>
              <AppText variant="caption" color={theme.inkSoft}>{entry.name}</AppText>
            </Pressable>
          );
        })}
      </View>

      {scheme ? (
        <PromptCard theme={theme} eyebrow={G35_TEXT.selectedEyebrow} style={{ marginTop: spacing.md }}>
          <AppText style={[styles.pattern, { color: theme.ink }]}>{scheme.pattern}</AppText>
          <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 4 }}>{scheme.hint}</AppText>
          <AppText variant="label" color={theme.accentText} style={{ marginTop: spacing.sm }}>{G35_TEXT.exampleEyebrow}</AppText>
          {scheme.lines.map((line, index) => (
            <AppText key={`${scheme.id}-${index}`} style={[styles.line, { color: theme.ink }]}>{line}</AppText>
          ))}
        </PromptCard>
      ) : null}

      <ActionBar text={scheme ? G35_TEXT.consigna(scheme.pattern) : ''} theme={theme} stimulus={stimulus} sendLabel={G35_TEXT.send} />
      <Note theme={theme}>{G35_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, minWidth: 92 },
  pattern: { fontFamily: fonts.display, fontSize: 20, lineHeight: 25 },
  line: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 22, marginTop: 6 },
});
