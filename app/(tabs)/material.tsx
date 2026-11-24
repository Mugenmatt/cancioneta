import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { EmptyState } from '@/design/components/Feedback';
import { Pill, SectionLabel } from '@/design/components/Primitives';
import { Sheet } from '@/design/components/Sheet';
import { alpha, fontSizes, fonts, hitSlop, lineHeights, minTouch, radii, spacing } from '@/design/tokens';
import { MATERIAL_TEXT } from '@/content/material';
import { dataService } from '@/services/data/DataService';
import type { PoolId, PoolItem } from '@/core/types';

type FilterId = 'all' | 'words' | 'culture' | 'prompts' | 'dice' | 'images';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: MATERIAL_TEXT.filters.all },
  { id: 'words', label: MATERIAL_TEXT.filters.words },
  { id: 'culture', label: MATERIAL_TEXT.filters.culture },
  { id: 'prompts', label: MATERIAL_TEXT.filters.prompts },
  { id: 'dice', label: MATERIAL_TEXT.filters.dice },
  { id: 'images', label: MATERIAL_TEXT.filters.images },
];

const WORDS: PoolId[] = ['words.noun', 'words.verb', 'words.adj'];
const CULTURE: PoolId[] = ['titles', 'characters', 'songs', 'poems_songs_ref', 'quote_public', 'script_phrases'];
const PROMPTS: PoolId[] = ['prompts', 'situations', 'restrictions', 'themes', 'universes', 'sensory_questions', 'cutup_texts', 'portal_seeds', 'confession_topics', 'letter_triggers', 'spy_questions'];
const DICE: PoolId[] = ['dice_lugar', 'dice_personaje', 'dice_objeto', 'dice_accion', 'dice_emocion', 'dice_cualidad'];

const POOL_LABEL: Partial<Record<PoolId, string>> = MATERIAL_TEXT.poolLabels;

export default function MaterialScreen() {
  const { colors } = useCoreTheme();
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PoolItem | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const report = dataService.getReport();

  const pools = useMemo<PoolId[] | undefined>(() => {
    if (filter === 'words') return WORDS;
    if (filter === 'culture') return CULTURE;
    if (filter === 'prompts') return PROMPTS;
    if (filter === 'dice') return DICE;
    if (filter === 'images') return ['images'];
    return undefined;
  }, [filter]);

  const items = useMemo(() => {
    if (query.trim()) return dataService.search(query, pools).slice(0, 50);
    const source = pools ? pools.flatMap((pool) => dataService.getPool(pool)) : dataService.getAll();
    return source.filter((item) => item.pool !== 'games').slice(0, 60);
  }, [query, pools]);

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Screen scroll>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={colors.accentCore}>{MATERIAL_TEXT.eyebrow}</AppText>
          <AppText variant="title" style={{ marginTop: spacing.xxs }}>{MATERIAL_TEXT.title}</AppText>
          <AppText variant="serif" color={colors.textSecondary} style={{ marginTop: spacing.xxs }}>
            {MATERIAL_TEXT.subtitle(report.totalItems)}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={MATERIAL_TEXT.creditsLabel}
          hitSlop={hitSlop}
          onPress={() => setCreditsOpen(true)}
          style={[styles.credits, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="info" size={fontSizes.body} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.search, { backgroundColor: colors.bgRaised, borderColor: colors.lineSubtle }]}>
        <Feather name="search" size={fontSizes.body} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={MATERIAL_TEXT.searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={MATERIAL_TEXT.searchLabel}
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.sans }]}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={MATERIAL_TEXT.clearSearch}
            hitSlop={hitSlop}
            onPress={() => setQuery('')}
            style={styles.clear}
          >
            <Feather name="x-circle" size={fontSizes.body} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

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

      <View style={[styles.notice, { borderColor: alpha(colors.stateWarning, 0.35), backgroundColor: alpha(colors.stateWarning, 0.08) }]}>
        <Feather name="alert-circle" size={fontSizes.small} color={colors.stateWarning} />
        <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: spacing.xs }}>
          {MATERIAL_TEXT.notice}
        </AppText>
      </View>

      <SectionLabel color={colors.textMuted}>{MATERIAL_TEXT.results(items.length)}</SectionLabel>
      {items.length === 0 ? (
        <EmptyState
          title={MATERIAL_TEXT.emptyTitle}
          body={MATERIAL_TEXT.emptyBody}
          action={
            <Button
              label={MATERIAL_TEXT.clearFilters}
              small
              onPress={() => {
                setQuery('');
                setFilter('all');
              }}
            />
          }
        />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={`${item.pool}:${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={item.text}
              onPress={() => { setSelected(item); setCopied(false); }}
              style={({ pressed }) => [
                styles.row,
                { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised },
                pressed && { opacity: 0.75 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color={colors.accentCore} style={{ fontFamily: fonts.sansSemiBold }}>
                  {POOL_LABEL[item.pool] ?? item.pool}
                </AppText>
                <AppText variant="body" style={{ fontFamily: fonts.serif, marginTop: spacing.xxs }} numberOfLines={2}>
                  {item.text}
                </AppText>
                {item.author || item.work ? (
                  <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xxs }} numberOfLines={1}>
                    {[item.author, item.work, item.year].filter(Boolean).join(' · ')}
                  </AppText>
                ) : null}
              </View>
              <Feather name="chevron-right" size={fontSizes.body} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      )}

      <Sheet visible={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? POOL_LABEL[selected.pool] ?? MATERIAL_TEXT.detailFallback : ''}>
        {selected ? (
          <View>
            <AppText style={styles.detailText}>{selected.text}</AppText>
            {selected.author || selected.work ? (
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
                {[selected.author, selected.work, selected.year].filter(Boolean).join(' · ')}
              </AppText>
            ) : null}
            <View style={styles.metaRow}>
              <View style={[styles.meta, { borderColor: colors.lineSubtle }]}>
                <AppText variant="caption" color={colors.textMuted}>{MATERIAL_TEXT.license[selected.license]}</AppText>
              </View>
              {selected.tags?.slice(0, 3).map((tag) => (
                <View key={tag} style={[styles.meta, { borderColor: colors.lineSubtle }]}>
                  <AppText variant="caption" color={colors.textMuted}>#{tag}</AppText>
                </View>
              ))}
            </View>
            {selected.externalLink ? (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={MATERIAL_TEXT.openLinkLabel}
                hitSlop={hitSlop}
                onPress={() => void Linking.openURL(selected.externalLink as string)}
                style={styles.link}
              >
                <AppText variant="caption" color={colors.accentCore}>
                  {MATERIAL_TEXT.openLink}
                </AppText>
              </Pressable>
            ) : null}
            <View style={styles.sheetActions}>
              <Button label={copied ? MATERIAL_TEXT.copied : MATERIAL_TEXT.copy} onPress={() => void copy(selected.text)} tone="secondary" />
            </View>
          </View>
        ) : null}
      </Sheet>

      <Sheet visible={creditsOpen} onClose={() => setCreditsOpen(false)} title={MATERIAL_TEXT.creditsTitle}>
        {dataService.getCredits().map((entry) => (
          <View key={entry.source} style={[styles.credit, { borderColor: colors.lineSubtle }]}>
            <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>
              {entry.source}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xxs }}>
              {entry.attribution}
            </AppText>
            <AppText variant="caption" color={colors.accentCore} style={{ marginTop: spacing.xxs }}>
              {entry.license}
            </AppText>
          </View>
        ))}
        <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          {MATERIAL_TEXT.creditsNote}
        </AppText>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md, marginBottom: spacing.lg },
  credits: { width: minTouch, height: minTouch, borderRadius: minTouch / 2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  clear: { minWidth: minTouch, minHeight: minTouch, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.sm, minHeight: minTouch + spacing.xxs },
  searchInput: { flex: 1, marginLeft: spacing.xs, fontSize: fontSizes.body, paddingVertical: spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.md },
  notice: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, marginBottom: spacing.lg },
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, minHeight: minTouch + spacing.md, gap: spacing.xs },
  detailText: { fontFamily: fonts.serif, fontSize: fontSizes.lead, lineHeight: fontSizes.lead * lineHeights.body },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  meta: { borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  link: { marginTop: spacing.md, minHeight: minTouch, justifyContent: 'center' },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  credit: { borderTopWidth: 1, paddingVertical: spacing.sm },
});
