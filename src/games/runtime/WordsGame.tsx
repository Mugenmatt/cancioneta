import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { ActionBar, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { assignPositions, type PositionedWord } from './logic';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { COMMON_TEXT } from '@/content/games/common';
import { WORD_CATEGORIES, WORDS_TEXT, type WordCategory } from '@/content/games/g03-g04';

async function drawMixed(categories: WordCategory[], count: number): Promise<PoolItem[]> {
  const pools = WORD_CATEGORIES.filter((entry) => categories.includes(entry.id)).map((entry) => entry.pool);
  if (pools.length === 0) return [];
  const parts = await Promise.all(pools.map((pool) => randomService.draw(pool, count)));
  return randomService.shuffle(parts.flat()).slice(0, count);
}

export function WordsGame({ id }: { id: string }) {
  return id === 'g03' ? <RevealGame /> : <ClavadasGame />;
}

function RevealGame() {
  const theme = useGameTheme('g03');
  const [count, setCount] = useState(6);
  const [categories, setCategories] = useState<WordCategory[]>(['noun', 'adj', 'verb']);
  const [items, setItems] = useState<PoolItem[]>([]);
  const [revealed, setRevealed] = useState(0);

  const draw = useCallback(async () => {
    const next = await drawMixed(categories, count);
    setItems(next);
    setRevealed(0);
  }, [categories, count]);

  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, [draw]);

  const toggle = (category: WordCategory) => {
    setCategories((current) => {
      if (current.includes(category)) {
        return current.length === 1 ? current : current.filter((entry) => entry !== category);
      }
      return [...current, category];
    });
  };

  const visible = items.slice(0, revealed);
  return (
    <View>
      <Note theme={theme}>{WORDS_TEXT.revealIntro}</Note>
      <View style={styles.pills}>
        {[3, 5, 7, 10].map((value) => (
          <Pill key={value} label={WORDS_TEXT.revealCount(value)} selected={count === value} onPress={() => setCount(value)} color={theme.accentText} />
        ))}
      </View>
      <View style={styles.pills}>
        {WORD_CATEGORIES.map((category) => (
          <Pill key={category.id} label={category.label} selected={categories.includes(category.id)} onPress={() => toggle(category.id)} color={theme.accentText} />
        ))}
      </View>
      <View style={styles.revealGrid}>
        {items.map((item, index) => {
          const open = index < revealed;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={open ? item.text : COMMON_TEXT.cardUndiscovered(index)}
              onPress={() => setRevealed((current) => Math.max(current, index + 1))}
              style={[styles.card, { backgroundColor: open ? alpha(theme.accent, 0.12) : alpha(theme.surface, 0.6), borderColor: open ? theme.accent : alpha(theme.ink, 0.2) }]}
            >
              <AppText style={[styles.cardText, { color: open ? theme.ink : theme.inkSoft }]}>{open ? item.text : WORDS_TEXT.revealCard}</AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.buttons}>
        <Button label={WORDS_TEXT.revealOne} small onPress={() => setRevealed((current) => Math.min(items.length, current + 1))} disabled={revealed >= items.length} accent={theme.accent} accentInk={theme.accentInk} />
        <Button label={WORDS_TEXT.hide} tone="secondary" small onPress={() => setRevealed(0)} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <ActionBar text={visible.map((item) => item.text).join(', ')} theme={theme} />
    </View>
  );
}

function ClavadasGame() {
  const theme = useGameTheme('g11');
  const [count, setCount] = useState(12);
  const [categories, setCategories] = useState<WordCategory[]>(['noun', 'adj', 'verb']);
  const [rows, setRows] = useState<PositionedWord[]>([]);

  const draw = useCallback(async () => {
    const items = await drawMixed(categories, count);
    setRows(assignPositions(items.map((item) => item.text), randomService));
  }, [categories, count]);

  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, [draw]);

  const toggle = (category: WordCategory) => {
    setCategories((current) => {
      if (current.includes(category)) return current.length === 1 ? current : current.filter((entry) => entry !== category);
      return [...current, category];
    });
  };

  const body = rows.map((row) => WORDS_TEXT.pinnedBody(row.word, row.position)).join('\n');
  return (
    <View>
      <Note theme={theme}>{WORDS_TEXT.pinnedIntro}</Note>
      <View style={styles.pills}>
        {[6, 10, 12, 16, 20, 24].map((value) => (
          <Pill key={value} label={WORDS_TEXT.pinnedCount(value)} selected={count === value} onPress={() => setCount(value)} color={theme.accentText} />
        ))}
      </View>
      <View style={styles.pills}>
        {WORD_CATEGORIES.map((category) => (
          <Pill key={category.id} label={category.label} selected={categories.includes(category.id)} onPress={() => toggle(category.id)} color={theme.accentText} />
        ))}
      </View>
      <View style={[styles.table, { borderColor: alpha(theme.ink, 0.18) }]}>
        {rows.map((row, index) => (
          <View key={`${row.word}-${index}`} style={[styles.tableRow, index > 0 && { borderTopColor: alpha(theme.ink, 0.12), borderTopWidth: 1 }]}>
            <AppText style={[styles.wordCell, { color: theme.ink }]}>{row.word}</AppText>
            <View style={[styles.position, { backgroundColor: alpha(theme.accent, 0.14) }]}>
              <AppText variant="caption" color={theme.accentText} style={{ fontFamily: fonts.sansSemiBold }}>{row.position}</AppText>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.buttons}>
        <Button label={WORDS_TEXT.anotherCombination} small onPress={() => void draw()} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  revealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  card: { width: '31%', minHeight: 58, borderWidth: 1, borderRadius: radii.card, padding: 8, justifyContent: 'center' },
  cardText: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  table: { borderWidth: 1, borderRadius: radii.card, marginTop: spacing.md, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 9 },
  wordCell: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14 },
  position: { borderRadius: radii.chip, paddingHorizontal: 9, paddingVertical: 3 },
});
