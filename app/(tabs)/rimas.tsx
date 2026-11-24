import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { EmptyState } from '@/design/components/Feedback';
import { Pill, SectionLabel } from '@/design/components/Primitives';
import { fontSizes, fonts, hitSlop, minTouch, radii, spacing } from '@/design/tokens';
import { RIMAS_TEXT } from '@/content/rimas';
import { filterRhymes, rhymeService, type RhymeFilter, type RhymeResults } from '@/services/rhyme/RhymeService';

const FILTERS: { id: RhymeFilter; label: string }[] = [
  { id: 'all', label: RIMAS_TEXT.filters.all },
  { id: 'consonant', label: RIMAS_TEXT.filters.consonant },
  { id: 'assonant', label: RIMAS_TEXT.filters.assonant },
];

export default function RimasScreen() {
  const { colors } = useCoreTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RhymeResults | null>(null);
  const [filter, setFilter] = useState<RhymeFilter>('all');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const words = results ? filterRhymes(results, filter) : [];

  const search = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      setResults(await rhymeService.search(query));
      setFilter('all');
      setCopied(null);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (word: string) => {
    await Clipboard.setStringAsync(word);
    setCopied(word);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <Screen scroll>
      <View style={styles.head}>
        <AppText variant="label" color={colors.accentCore}>{RIMAS_TEXT.eyebrow}</AppText>
        <AppText variant="title" style={{ marginTop: spacing.xxs }}>{RIMAS_TEXT.title}</AppText>
        <AppText variant="serif" color={colors.textSecondary} style={{ marginTop: spacing.xxs }}>
          {RIMAS_TEXT.subtitle}
        </AppText>
      </View>

      <View style={[styles.search, { backgroundColor: colors.bgRaised, borderColor: colors.lineSubtle }]}>
        <Feather name="search" size={fontSizes.body} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void search()}
          placeholder={RIMAS_TEXT.placeholder}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={RIMAS_TEXT.title}
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.sans }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={RIMAS_TEXT.clear}
            hitSlop={hitSlop}
            onPress={() => setQuery('')}
            style={styles.clear}
          >
            <Feather name="x-circle" size={fontSizes.body} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <Button label={RIMAS_TEXT.search} onPress={() => void search()} loading={loading} disabled={!query.trim()} small />
      </View>

      {results ? (
        <View>
          <View style={styles.filters}>
            {FILTERS.map((entry) => (
              <Pill
                key={entry.id}
                label={entry.label}
                selected={filter === entry.id}
                onPress={() => setFilter(entry.id)}
              />
            ))}
          </View>

          <SectionLabel color={colors.textMuted}>
            {RIMAS_TEXT.results(words.length)}
          </SectionLabel>

          {words.length === 0 ? (
            <EmptyState
              title={RIMAS_TEXT.emptyTitle}
              body={RIMAS_TEXT.empty}
              action={
                <Button
                  label={RIMAS_TEXT.clear}
                  small
                  onPress={() => {
                    setQuery('');
                    setResults(null);
                  }}
                />
              }
            />
          ) : (
            <View style={styles.list}>
              {words.map((word) => (
                <Pressable
                  key={word}
                  accessibilityRole="button"
                  accessibilityLabel={copied === word ? RIMAS_TEXT.copied : RIMAS_TEXT.copyWord(word)}
                  onPress={() => void copy(word)}
                  style={({ pressed }) => [
                    styles.row,
                    { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <AppText style={styles.word}>{word}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {results.consonants.includes(word) ? RIMAS_TEXT.filters.consonant : RIMAS_TEXT.filters.assonant}
                  </AppText>
                  <Feather
                    name={copied === word ? 'check' : 'copy'}
                    size={fontSizes.body}
                    color={copied === word ? colors.stateSuccess : colors.textMuted}
                  />
                </Pressable>
              ))}
            </View>
          )}

          <AppText variant="caption" color={colors.textMuted} style={styles.note}>
            {results.online ? RIMAS_TEXT.onlineNote : RIMAS_TEXT.offlineNote}
          </AppText>
          {results.online ? (
            <AppText variant="caption" color={colors.accentCore}>{RIMAS_TEXT.credit}</AppText>
          ) : null}
        </View>
      ) : (
        <EmptyState title={RIMAS_TEXT.idleTitle} body={RIMAS_TEXT.idle} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { marginTop: spacing.md, marginBottom: spacing.lg },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.field,
    paddingHorizontal: spacing.sm,
    minHeight: minTouch,
    gap: spacing.xs,
  },
  searchInput: { flex: 1, fontSize: fontSizes.body, paddingVertical: spacing.sm },
  clear: { minWidth: minTouch, minHeight: minTouch, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.md },
  list: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.field,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: minTouch,
  },
  word: { flex: 1, fontFamily: fonts.serif, fontSize: fontSizes.reading },
  note: { marginTop: spacing.lg },
});
