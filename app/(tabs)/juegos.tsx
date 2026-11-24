import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { EmptyState } from '@/design/components/Feedback';
import { SectionLabel } from '@/design/components/Primitives';
import { alpha, fontSizes, fonts, lineHeights, minTouch, radii, spacing } from '@/design/tokens';
import { gameThemes } from '@/design/themes';
import { GAME_FLOW_TEXT, PHASE_LABEL } from '@/content/gameFlow';
import { GAME_REGISTRY, gameCounts, type GameMeta, type GamePhase } from '@/games/registry';

const PHASES: GamePhase[] = ['fase0', 'original', 'nuevo'];

export default function GamesScreen() {
  const router = useRouter();
  const { colors } = useCoreTheme();
  const [query, setQuery] = useState('');
  const counts = gameCounts();

  const games = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return GAME_REGISTRY;
    return GAME_REGISTRY.filter((game) =>
      `${game.name} ${game.summary} ${game.tags.join(' ')}`.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <Screen scroll contentStyle={{ paddingTop: spacing.md }}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={colors.accentCore}>{GAME_FLOW_TEXT.games}</AppText>
          <AppText variant="title" style={{ marginTop: 4 }}>{GAME_FLOW_TEXT.gamesSubtitle}</AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
            {GAME_FLOW_TEXT.overview(counts.games, counts.fase0)}
          </AppText>
        </View>
        <View style={[styles.count, { backgroundColor: colors.accentSoft }]}>
          <AppText style={{ fontFamily: fonts.display, fontSize: fontSizes.title, color: colors.accentCore }}>{counts.total}</AppText>
        </View>
      </View>

      <View style={[styles.search, { backgroundColor: colors.bgRaised, borderColor: colors.lineSubtle }]}>
        <Feather name="search" size={17} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={GAME_FLOW_TEXT.searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={GAME_FLOW_TEXT.searchLabel}
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.sans }]}
          autoCorrect={false}
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel={GAME_FLOW_TEXT.clearSearch} onPress={() => setQuery('')} style={styles.searchClear}>
            <Feather name="x-circle" size={17} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {PHASES.map((phase) => {
        const phaseGames = games.filter((game) => game.phase === phase);
        if (phaseGames.length === 0) return null;
        return (
          <View key={phase} style={styles.group}>
            <SectionLabel color={colors.textMuted}>{PHASE_LABEL[phase]}</SectionLabel>
            {phaseGames.map((game) => (
              <GameRow key={game.id} game={game} onPress={() => router.push(`/juego/${game.id}`)} />
            ))}
          </View>
        );
      })}

      {games.length === 0 ? (
        <EmptyState
          title={GAME_FLOW_TEXT.emptySearchTitle}
          body={GAME_FLOW_TEXT.emptySearchBody}
          action={<Button label={GAME_FLOW_TEXT.clearSearch} small onPress={() => setQuery('')} />}
        />
      ) : null}
    </Screen>
  );
}

function GameRow({ game, onPress }: { game: GameMeta; onPress: () => void }) {
  const theme = gameThemes[game.themeId] ?? gameThemes.g01;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${game.name}. ${game.summary}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.surface, borderColor: alpha(theme.accent, 0.22) },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.number, { backgroundColor: alpha(theme.accent, 0.16) }]}>
        <AppText variant="caption" color={theme.accentText} style={{ fontFamily: fonts.sansBold, fontSize: fontSizes.caption }}>
          {game.phase === 'fase0' ? GAME_FLOW_TEXT.fase0Number : GAME_FLOW_TEXT.number(game.number)}
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontFamily: fonts.display, fontSize: fontSizes.lead, lineHeight: fontSizes.lead * lineHeights.tight, color: theme.ink }}>
          {game.name}
        </AppText>
        <AppText variant="caption" color={theme.inkSoft} numberOfLines={2} style={{ marginTop: 3 }}>
          {game.summary}
        </AppText>
      </View>
      <Feather name="chevron-right" size={17} color={theme.inkSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg },
  count: { width: minTouch + spacing.xs, height: minTouch + spacing.xs, borderRadius: radii.card, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.sm, minHeight: 48 },
  searchInput: { flex: 1, marginLeft: spacing.xs, fontSize: fontSizes.body, paddingVertical: spacing.xs + spacing.xxs / 2 },
  searchClear: { width: minTouch, height: minTouch, marginRight: -spacing.sm, alignItems: 'center', justifyContent: 'center' },
  group: { marginTop: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radii.card, padding: spacing.sm, marginBottom: spacing.xs, minHeight: 78 },
  number: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
