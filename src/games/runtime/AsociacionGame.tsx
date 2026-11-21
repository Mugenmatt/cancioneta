import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { dataService } from '@/services/data/DataService';
import type { PoolItem } from '@/core/types';
import { alpha, fontSizes, fonts, lineHeights, radii, spacing } from '@/design/tokens';
import {
  ASSOCIATION_DEFAULT_KINDS,
  ASSOCIATION_KINDS,
  ASSOCIATION_TEXT,
  type AssociationKind,
} from '@/content/games/g01';
import { otherColumnsFingerprints, replaceColumn, takeUniqueWords } from './logic';
import { createAssociationStimulus } from './associationStimulus';

function drawFor(kind: AssociationKind, groupSet: ReadonlySet<string>): PoolItem[] {
  const config = ASSOCIATION_KINDS.find((entry) => entry.id === kind) ?? ASSOCIATION_KINDS[0];
  const pools = config.pools.map((pool) => dataService.getPool(pool));
  return takeUniqueWords(pools, groupSet, randomService, 10);
}

export function AsociacionGame() {
  const theme = useGameTheme('g01');
  const [kinds, setKinds] = useState<AssociationKind[]>([...ASSOCIATION_DEFAULT_KINDS]);
  const [columns, setColumns] = useState<PoolItem[][]>([[], [], []]);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);

  const drawColumn = (index: number, kind: AssociationKind) => {
    if (busy.current) return;
    busy.current = true;
    const groupSet = otherColumnsFingerprints(columns, index);
    const items = drawFor(kind, groupSet);
    setColumns((previous) => replaceColumn(previous, index, items));
    setKinds((previous) => previous.map((entry, i) => (i === index ? kind : entry)));
    busy.current = false;
  };

  const drawAll = useCallback((nextKinds: AssociationKind[]) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    const drawn: PoolItem[][] = [];
    const groupSet = new Set<string>();
    for (const kind of nextKinds) {
      const items = drawFor(kind, groupSet);
      items.forEach((item) => groupSet.add(item.fingerprint));
      drawn.push(items);
    }
    setColumns(drawn);
    setLoading(false);
    busy.current = false;
  }, []);

  useEffect(() => { drawAll([...ASSOCIATION_DEFAULT_KINDS]); }, [drawAll]);

  const cycleKind = (index: number) => {
    const current = ASSOCIATION_KINDS.findIndex((entry) => entry.id === kinds[index]);
    const next = ASSOCIATION_KINDS[(current + 1) % ASSOCIATION_KINDS.length].id;
    setKinds((previous) => previous.map((kind, i) => (i === index ? next : kind)));
    drawColumn(index, next);
  };

  const allWords = columns.flat().map((item) => item.text);
  const body = columns.map((column, index) => ASSOCIATION_TEXT.body(index, column.map((item) => item.text))).join('\n');
  const stimulus = createAssociationStimulus(columns, kinds);

  return (
    <View>
      <Note theme={theme}>{ASSOCIATION_TEXT.intro}</Note>
      <View style={styles.columns}>
        {columns.map((column, index) => (
          <View key={index} style={[styles.column, { borderColor: alpha(theme.ink, 0.18), backgroundColor: alpha(theme.surface, 0.55) }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={ASSOCIATION_TEXT.changeCategory(index)} onPress={() => cycleKind(index)} style={styles.columnHead}>
              <AppText variant="label" color={theme.accentText} numberOfLines={1} style={{ flex: 1 }}>
                {ASSOCIATION_KINDS.find((entry) => entry.id === kinds[index])?.label ?? ASSOCIATION_TEXT.fallbackKind}
              </AppText>
              <Feather name="refresh-cw" size={12} color={theme.accentText} />
            </Pressable>
            {column.map((item) => (
              <View key={item.id} style={[styles.word, { backgroundColor: alpha(theme.accent, 0.09), borderColor: alpha(theme.accent, 0.22) }]}>
                <AppText style={[styles.wordText, { color: theme.ink }]}>{item.text}</AppText>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ASSOCIATION_TEXT.regenerateColumn(index)}
              onPress={() => drawColumn(index, kinds[index] ?? ASSOCIATION_DEFAULT_KINDS[index])}
              style={({ pressed }) => [
                styles.regenerate,
                { borderColor: alpha(theme.accentText, 0.45) },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="refresh-cw" size={12} color={theme.accentText} />
              <AppText variant="caption" color={theme.accentText} style={styles.regenerateLabel}>
                {ASSOCIATION_TEXT.regenerateShort}
              </AppText>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={styles.buttons}>
        <Button label={ASSOCIATION_TEXT.regenerateAll} small loading={loading} onPress={() => drawAll(kinds)} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <Note theme={theme}>{ASSOCIATION_TEXT.total(allWords.length)}</Note>
      <ActionBar text={body} theme={theme} stimulus={stimulus} />
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  column: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: radii.card, padding: spacing.xxs, gap: spacing.xxs },
  columnHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, minHeight: 34 },
  word: { borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.xxs, paddingVertical: spacing.xxs },
  wordText: { fontFamily: fonts.sansMedium, fontSize: fontSizes.body, lineHeight: fontSizes.body * lineHeights.body },
  regenerate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radii.chip,
    minHeight: 32,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  regenerateLabel: { fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
});
