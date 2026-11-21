import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { BackButton } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { GAME_FLOW_TEXT } from '@/content/gameFlow';
import { PHASE_LABEL, gameById, gameIds } from '@/games/registry';
import { DiceGame } from '@/games/g24-dados/DiceGame';
import { TitleGame } from '@/games/g02-titulo/TitleGame';
import { SkinGame } from '@/games/g05-piel/SkinGame';
import { RUNTIME_GAME_IDS, RuntimeGame } from '@/games/runtime';

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return gameIds().map((id) => ({ id }));
}

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const game = gameById(id ?? '');
  const theme = useGameTheme(game?.themeId ?? 'g01');
  const [startedId, setStartedId] = useState<string | null>(null);
  const started = startedId === id;

  if (!game) {
    return (
      <Screen scroll>
        <BackButton />
        <View style={{ marginTop: spacing.xxl, alignItems: 'center' }}>
          <Feather name="search" size={24} color={theme.accentText} />
          <AppText variant="title" style={{ marginTop: spacing.md }}>{GAME_FLOW_TEXT.notFoundTitle}</AppText>
          <Button label={GAME_FLOW_TEXT.seeAll} onPress={() => router.replace('/juegos')} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen gameTheme={theme} scroll contentStyle={{ paddingTop: spacing.sm }}>
      <BackButton color={theme.ink} />

      <View style={styles.head}>
        <View style={[styles.number, { backgroundColor: theme.accent }]}>
          <AppText variant="caption" color={theme.accentInk} style={{ fontFamily: fonts.sansBold }}>
            {game.phase === 'fase0' ? GAME_FLOW_TEXT.fase0Number : GAME_FLOW_TEXT.number(game.number)}
          </AppText>
        </View>
        <AppText variant="label" color={theme.accentText} style={{ marginLeft: spacing.sm }}>
          {PHASE_LABEL[game.phase]}
        </AppText>
      </View>

      <AppText style={[styles.title, { color: theme.ink }]}>{game.name}</AppText>
      <AppText style={[styles.summary, { color: theme.inkSoft }]}>{game.summary}</AppText>

      <View style={styles.tags}>
        {game.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { borderColor: alpha(theme.ink, 0.22) }]}>
            <AppText variant="caption" color={theme.inkSoft}>{GAME_FLOW_TEXT.tag(tag)}</AppText>
          </View>
        ))}
      </View>

      {!started ? (
        <View style={[styles.intro, { borderColor: alpha(theme.ink, 0.16) }]}>
          <AppText variant="label" color={theme.accentText}>{GAME_FLOW_TEXT.objective}</AppText>
          <AppText variant="caption" color={theme.ink} style={{ marginTop: 4 }}>{game.summary}</AppText>
          <AppText variant="label" color={theme.accentText} style={{ marginTop: spacing.md }}>{GAME_FLOW_TEXT.stepsTitle}</AppText>
          {GAME_FLOW_TEXT.steps.map((step) => (
            <AppText key={step} variant="caption" color={theme.inkSoft} style={{ lineHeight: 19 }}>{step}</AppText>
          ))}
          <AppText variant="label" color={theme.accentText} style={{ marginTop: spacing.md }}>{GAME_FLOW_TEXT.examplesTitle}</AppText>
          {GAME_FLOW_TEXT.examples(game.summary, game.tags).map((example) => (
            <AppText key={example} variant="caption" color={theme.inkSoft} style={{ lineHeight: 19 }}>{example}</AppText>
          ))}
          <Button
            label={GAME_FLOW_TEXT.begin}
            onPress={() => setStartedId(id ?? '')}
            accent={theme.accent}
            accentInk={theme.accentInk}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      ) : (
        <View style={[styles.runtime, { borderColor: alpha(theme.ink, 0.16), backgroundColor: alpha(theme.surface, 0.8) }]}>
          {game.id === 'g24' ? <DiceGame /> : null}
          {game.id === 'g02' ? <TitleGame /> : null}
          {game.id === 'g05' ? <SkinGame /> : null}
          {RUNTIME_GAME_IDS.has(game.id) ? <RuntimeGame id={game.id} /> : null}
        </View>
      )}

      <View style={[styles.note, { borderColor: alpha(theme.ink, 0.14) }]}>
        <Feather name="shield" size={15} color={theme.accentText} />
        <AppText variant="caption" color={theme.inkSoft} style={{ flex: 1, marginLeft: 8 }}>
          {GAME_FLOW_TEXT.privacyNote}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  number: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 44, lineHeight: 49, letterSpacing: -1, marginTop: spacing.md },
  summary: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 29, marginTop: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  tag: { borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: 10, paddingVertical: 4 },
  runtime: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.lg },
  intro: { borderWidth: 1, borderRadius: radii.card, padding: spacing.lg, marginTop: spacing.lg },
  note: { flexDirection: 'row', alignItems: 'flex-start', borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.lg },
});
