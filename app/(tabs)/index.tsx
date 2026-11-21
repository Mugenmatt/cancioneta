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
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { gameThemes } from '@/design/themes';
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
          <AppText variant="label" color={colors.accentCore}>Cancioneta</AppText>
          <AppText variant="caption" color={colors.textMuted}>Cuaderno de canciones</AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajustes"
          onPress={() => router.push('/ajustes')}
          style={[styles.settings, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="settings" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.hero, { backgroundColor: theme.bg, borderColor: alpha(theme.accent, 0.3) }]}>
        <Motif theme={theme} />
        <View style={styles.heroInner}>
          <AppText variant="label" color={theme.accentText}>Primero la voz</AppText>
          <AppText style={[styles.heroTitle, { color: theme.ink }]}>
            Una canción empieza con una palabra mal elegida.
          </AppText>
          <AppText style={[styles.heroBody, { color: theme.inkSoft }]}>
            Jugá, escribí, escuchá. Sin cuenta, sin nube, sin deberes.
          </AppText>
          <View style={styles.heroActions}>
            <Button
              label="Abrir cuaderno"
              onPress={() => router.push('/escribir')}
              accent={theme.accent}
              accentInk={theme.accentInk}
            />
            <View style={{ width: spacing.sm }} />
            <Button
              label="Tirar acordes"
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
          title="Calentar"
          body="Fase 0"
          onPress={() => router.push('/juegos')}
        />
        <QuickCard
          icon="music"
          title="Probar"
          body="Acordes"
          onPress={() => router.push('/acordes')}
        />
        <QuickCard
          icon="book-open"
          title="Buscar"
          body="Material"
          onPress={() => router.push('/material')}
        />
      </View>

      <View style={styles.section}>
        <SectionLabel color={colors.textMuted}>Un juego para hoy</SectionLabel>
        <Button
          label="A escribir"
          onPress={openRandomGame}
          accent={theme.accent}
          accentInk={theme.accentInk}
        />
      </View>

      <View style={[styles.privacy, { borderColor: colors.lineSubtle }]}>
        <Feather name="shield" size={18} color={colors.accentCore} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>
            Tu letra no se guarda al salir
          </AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
            Cancioneta funciona offline. Exportá lo que quieras conservar.
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
  settings: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
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
