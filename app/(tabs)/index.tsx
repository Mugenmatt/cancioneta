import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Screen } from '@/design/components/Screen';
import { Motif } from '@/design/components/Motif';
import { SectionLabel } from '@/design/components/Primitives';
import { useCoreTheme } from '@/design/ThemeProvider';
import { alpha, fonts, minTouch, radii, spacing } from '@/design/tokens';
import { gameThemes } from '@/design/themes';
import { APP_META } from '@/content/app';
import { HOME_TEXT } from '@/content/home';
import { GAME_REGISTRY, type GameMeta } from '@/games/registry';
import { randomService } from '@/services/random/RandomService';

let lastHomeGameId: string | null = null;

function pickRandomGame(excludeId: string | null): GameMeta {
  const pool = excludeId ? GAME_REGISTRY.filter((game) => game.id !== excludeId) : GAME_REGISTRY;
  return randomService.pickOne(pool.length > 0 ? pool : GAME_REGISTRY) ?? GAME_REGISTRY[0];
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useCoreTheme();
  const [today, setToday] = useState<GameMeta>(() => pickRandomGame(null));

  const openRandomGame = useCallback(() => {
    const next = pickRandomGame(lastHomeGameId);
    lastHomeGameId = next.id;
    setToday(next);
    router.push(`/juego/${next.id}`);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const next = pickRandomGame(lastHomeGameId);
      lastHomeGameId = next.id;
      setToday(next);
    }, []),
  );

  const theme = gameThemes[today.themeId] ?? gameThemes.g01;

  return (
    <Screen scroll contentStyle={{ paddingTop: spacing.md }}>
      <View style={styles.brandRow}>
        <View>
          <AppText variant="label" color={colors.accentCore}>{APP_META.name}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{HOME_TEXT.tagline}</AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={HOME_TEXT.settings}
          onPress={() => router.push('/ajustes')}
          style={[styles.settings, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="settings" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.hero, { backgroundColor: theme.bg, borderColor: alpha(theme.accent, 0.3) }]}>
        <Motif theme={theme} />
        <View style={styles.heroInner}>
          <AppText variant="label" color={theme.accentText}>{HOME_TEXT.heroLabel}</AppText>
          <AppText style={[styles.heroTitle, { color: theme.ink }]}>
            {HOME_TEXT.heroTitle}
          </AppText>
          <AppText style={[styles.heroBody, { color: theme.inkSoft }]}>
            {HOME_TEXT.heroBody}
          </AppText>
          <View style={styles.heroActions}>
            <Button
              label={HOME_TEXT.openNotebook}
              onPress={() => router.push('/escribir')}
              accent={theme.accent}
              accentInk={theme.accentInk}
            />
            <View style={{ width: spacing.sm }} />
            <Button
              label={HOME_TEXT.rollChords}
              tone="secondary"
              onPress={() => router.push('/acordes')}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          </View>
        </View>
      </View>

      <View style={styles.quickRow}>
        <QuickCard
          icon="mic"
          title={HOME_TEXT.quick.warmup.title}
          body={HOME_TEXT.quick.warmup.body}
          onPress={() => router.push('/juegos')}
        />
        <QuickCard
          icon="music"
          title={HOME_TEXT.quick.chords.title}
          body={HOME_TEXT.quick.chords.body}
          onPress={() => router.push('/acordes')}
        />
        <QuickCard
          icon="search"
          title={HOME_TEXT.quick.rhymes.title}
          body={HOME_TEXT.quick.rhymes.body}
          onPress={() => router.push('/rimas')}
        />
      </View>

      <View style={styles.section}>
        <SectionLabel color={colors.textMuted}>{HOME_TEXT.dailySection}</SectionLabel>
        <Button
          label={HOME_TEXT.dailyAction}
          onPress={openRandomGame}
          accent={theme.accent}
          accentInk={theme.accentInk}
        />
      </View>

      <View style={[styles.privacy, { borderColor: colors.lineSubtle }]}>
        <Feather name="shield" size={18} color={colors.accentCore} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>
            {HOME_TEXT.privacyTitle}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
            {HOME_TEXT.privacyBody}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

function QuickCard({ icon, title, body, onPress }: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { colors } = useCoreTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${body}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quick,
        { backgroundColor: colors.bgRaised, borderColor: colors.lineSubtle },
        pressed && { opacity: 0.72 },
      ]}
    >
      <Feather name={icon} size={18} color={colors.accentCore} />
      <View style={{ marginTop: spacing.sm }}>
        <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>{title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>{body}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  settings: { width: minTouch, height: minTouch, borderRadius: minTouch / 2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: radii.card, borderWidth: 1, overflow: 'hidden', minHeight: 330 },
  heroInner: { padding: spacing.lg, paddingTop: spacing.xl, flex: 1, justifyContent: 'flex-end' },
  heroTitle: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, letterSpacing: -0.8, marginTop: spacing.sm },
  heroBody: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 24, marginTop: spacing.sm, maxWidth: 320 },
  heroActions: { flexDirection: 'row', marginTop: spacing.lg, flexWrap: 'wrap', gap: spacing.sm },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  quick: { flex: 1, borderWidth: 1, borderRadius: radii.card, padding: spacing.md, minHeight: 100 },
  section: { marginTop: spacing.xl },
  privacy: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.xl },
});
