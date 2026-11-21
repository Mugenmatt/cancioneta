import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { StimulusCard } from '@/design/components/StimulusCard';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { useLyricsStore } from '@/stores/lyricsStore';
import { COMMON_TEXT } from '@/content/games/common';
import { TITLE_TEXT } from '@/content/games/g02-g05';
import { createTitleGameController, type TitleGameState } from './controller';

export function TitleGame() {
  const router = useRouter();
  const theme = useGameTheme('g02');
  const insertStimulus = useLyricsStore((s) => s.insertStimulus);
  const controller = useMemo(() => createTitleGameController(randomService), []);
  const [state, setState] = useState<TitleGameState>(() => controller.getState());
  const [drawing, setDrawing] = useState(false);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  const draw = async (haptic = false) => {
    setDrawing(true);
    const next = await controller.draw();
    setState(next);
    setDrawing(false);
    if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = state.card;

  const copy = async () => {
    if (!card) return;
    await Clipboard.setStringAsync(TITLE_TEXT.coverBody(card.text, card.author));
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  const sendToEditor = () => {
    if (!card) return;
    insertStimulus(TITLE_TEXT.coverBody(card.text, card.author));
    router.push('/escribir');
  };

  return (
    <View>
      <AppText variant="caption" color={theme.inkSoft} style={styles.intro}>
        {TITLE_TEXT.intro}
      </AppText>

      <StimulusCard
        theme={theme}
        eyebrow={TITLE_TEXT.coverKind(card?.kind, card?.year)}
        style={styles.cover}
      >
        <View style={[styles.rule, { backgroundColor: alpha(theme.accent, 0.45) }]} />
        <AppText style={[styles.eyebrow, { color: theme.accentText }]}>{TITLE_TEXT.coverEyebrow}</AppText>
        <AppText style={[styles.title, { color: theme.ink }]}>
          {card?.text ?? (state.error ?? COMMON_TEXT.loading)}
        </AppText>
        <View style={{ flex: 1 }} />
        {card?.author ? (
          <View style={[styles.authorRow, { borderColor: alpha(theme.ink, 0.2) }]}>
            <Feather name="pen-tool" size={14} color={theme.accentText} />
            <AppText style={[styles.author, { color: theme.inkSoft }]}>{card.author}</AppText>
          </View>
        ) : null}
      </StimulusCard>

      {card?.tags?.length ? (
        <View style={styles.tags}>
          {card.tags.map((tag) => (
            <Pressable key={tag} disabled style={[styles.tag, { borderColor: alpha(theme.ink, 0.2) }]}>
              <AppText variant="caption" color={theme.inkSoft}>#{tag}</AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={TITLE_TEXT.anotherCard}
          small
          loading={drawing}
          onPress={() => void draw(true)}
          accent={theme.accent}
          accentInk={theme.accentInk}
        />
        <Button
          label={copied ? COMMON_TEXT.copied : COMMON_TEXT.copy}
          tone="secondary"
          small
          disabled={!card}
          onPress={() => void copy()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
        />
        <Button
          label={COMMON_TEXT.sendToNotebook}
          tone="secondary"
          small
          disabled={!card}
          onPress={sendToEditor}
          accent={theme.accentText}
          accentInk={theme.accentInk}
        />
      </View>

      <AppText variant="caption" color={theme.inkSoft} style={styles.note}>
        {TITLE_TEXT.note}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { lineHeight: 19, marginBottom: spacing.md },
  cover: { minHeight: 330, justifyContent: 'flex-end' },
  rule: { height: 3, width: 44, marginBottom: spacing.md },
  eyebrow: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 2.4 },
  title: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -1, marginTop: spacing.sm },
  authorRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.xl },
  author: { fontFamily: fonts.serifItalic, fontSize: 19, lineHeight: 26, marginLeft: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  tag: { borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: 10, paddingVertical: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  note: { lineHeight: 18, marginTop: spacing.sm },
});
