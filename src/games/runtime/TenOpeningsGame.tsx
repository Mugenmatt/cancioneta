import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, minTouch, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G42_TEXT, G42_TOTAL } from '@/content/games/g42';
import {
  canGoToEditor, favoriteOpenings, makeOpeningsStimulus, writtenOpenings, type OpeningEntry,
} from './g42Logic';
import { ActionBar, GameField, Note, PromptCard } from './ui';

function initialEntries(): OpeningEntry[] {
  return Array.from({ length: G42_TOTAL }, (_, id) => ({ id, text: '', selected: false }));
}

export function TenOpeningsGame() {
  const theme = useGameTheme('g42');
  const [entries, setEntries] = useState<OpeningEntry[]>(initialEntries);
  const [withTheme, setWithTheme] = useState(false);
  const [themeItem, setThemeItem] = useState<PoolItem | null>(null);

  const drawTheme = async () => {
    const [next] = await randomService.draw('themes', 1);
    setThemeItem(next ?? null);
  };

  const enableTheme = () => {
    setWithTheme(true);
    if (!themeItem) void drawTheme();
  };

  const update = (id: number, text: string) => setEntries((current) =>
    current.map((entry) => (entry.id === id ? { ...entry, text } : entry)));

  const toggle = (id: number) => setEntries((current) => current.map((entry) =>
    entry.id === id && entry.text.trim()
      ? { ...entry, selected: !entry.selected }
      : entry));

  const themeText = withTheme ? themeItem?.text ?? '' : '';
  const favorites = favoriteOpenings(entries);
  const stimulus = makeOpeningsStimulus({
    theme: themeText,
    favorites,
    title: G42_TEXT.editorTitle(themeText),
    groupTitles: { theme: G42_TEXT.themeGroup, favorites: G42_TEXT.favoritesGroup },
    note: G42_TEXT.editorNote,
  });

  return (
    <View>
      <Note theme={theme}>{G42_TEXT.intro}</Note>
      <Note theme={theme}>{G42_TEXT.criterion}</Note>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G42_TEXT.themeTitle}</AppText>
        <View style={styles.pills}>
          <Pill label={G42_TEXT.withoutTheme} selected={!withTheme} color={theme.accentText} onPress={() => setWithTheme(false)} />
          <Pill label={G42_TEXT.withTheme} selected={withTheme} color={theme.accentText} onPress={enableTheme} />
        </View>
        {withTheme ? (
          <PromptCard theme={theme} eyebrow={G42_TEXT.themeEyebrow} style={styles.card}>
            <AppText style={[styles.seed, { color: theme.ink }]}>{themeItem?.text ?? G42_TEXT.loading}</AppText>
            <Button
              label={G42_TEXT.anotherTheme}
              tone="secondary"
              small
              onPress={() => void drawTheme()}
              accent={theme.accentText}
              accentInk={theme.accentInk}
              style={styles.button}
            />
          </PromptCard>
        ) : null}
      </View>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G42_TEXT.openingsEyebrow}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={styles.counter}>
          {G42_TEXT.openingsCount(writtenOpenings(entries).length)}
        </AppText>
        {entries.map((entry, index) => (
          <View key={entry.id} style={styles.row}>
            <AppText variant="caption" color={theme.accentText} style={styles.number}>{index + 1}.</AppText>
            <View style={styles.field}>
              <GameField
                theme={theme}
                value={entry.text}
                onChangeText={(value) => update(entry.id, value)}
                placeholder={G42_TEXT.openingPlaceholder(index)}
                multiline
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={entry.selected ? G42_TEXT.unmark(index) : G42_TEXT.mark(index)}
              accessibilityState={{ checked: entry.selected }}
              disabled={!entry.text.trim()}
              hitSlop={8}
              onPress={() => toggle(entry.id)}
              style={[
                styles.check,
                { borderColor: entry.selected ? theme.accent : alpha(theme.ink, 0.24), backgroundColor: entry.selected ? alpha(theme.accent, 0.14) : 'transparent' },
                !entry.text.trim() && styles.disabled,
              ]}
            >
              <Feather name={entry.selected ? 'check-square' : 'square'} size={18} color={entry.selected ? theme.accentText : theme.inkSoft} />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G42_TEXT.favoritesEyebrow}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={styles.counter}>
          {G42_TEXT.favoritesCount(favorites.length)}
        </AppText>
      </View>

      <ActionBar
        text={favorites.join('\n')}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G42_TEXT.send}
        disabled={!canGoToEditor(entries)}
      />
      <Note theme={theme}>{G42_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  card: { marginTop: spacing.sm },
  seed: { fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 30 },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  counter: { marginTop: 4, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  number: { fontFamily: fonts.sansSemiBold },
  field: { flex: 1 },
  check: { width: minTouch, height: minTouch, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
