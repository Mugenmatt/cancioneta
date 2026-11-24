import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { StimulusCard } from '@/design/components/StimulusCard';
import { alpha, fonts, minTouch, spacing } from '@/design/tokens';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { useLyricsStore } from '@/stores/lyricsStore';
import { COMMON_TEXT } from '@/content/games/common';
import { SKIN_TEXT } from '@/content/games/g02-g05';
import { createSkinGameController, type SkinGameState } from './controller';

function descriptionOf(character: SkinGameState['character']): string {
  const value = character?.extra?.description;
  return typeof value === 'string' ? value : '';
}

export function SkinGame() {
  const router = useRouter();
  const theme = useGameTheme('g05');
  const insertStimulus = useLyricsStore((s) => s.insertStimulus);
  const controller = useMemo(() => createSkinGameController(randomService), []);
  const [state, setState] = useState<SkinGameState>(() => controller.getState());
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

  const character = state.character;
  const description = descriptionOf(character);

  const copy = async () => {
    if (!character) return;
    const body = SKIN_TEXT.fileBody(character.text, character.work, description);
    await Clipboard.setStringAsync(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  const openLink = async () => {
    if (!character?.externalLink) return;
    try {
      await Linking.openURL(character.externalLink);
    } catch {
      Alert.alert(SKIN_TEXT.linkErrorTitle, SKIN_TEXT.linkErrorBody);
    }
  };

  const sendToEditor = () => {
    if (!character) return;
    const prompt = SKIN_TEXT.editorPrompt(character.text, character.work, description);
    insertStimulus(prompt);
    router.push('/escribir');
  };

  return (
    <View>
      <AppText variant="caption" color={theme.inkSoft} style={styles.intro}>
        {SKIN_TEXT.intro}
      </AppText>

      <StimulusCard
        theme={theme}
        eyebrow={SKIN_TEXT.fileEyebrow(character?.kind)}
        style={styles.card}
      >
        <View style={styles.profile}>
          <View style={[styles.silhouette, { backgroundColor: alpha(theme.accent, 0.15), borderColor: alpha(theme.accent, 0.28) }]}>
            <Feather name="user" size={30} color={theme.accentText} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <AppText style={[styles.name, { color: theme.ink }]}>
              {character?.text ?? (state.error ?? SKIN_TEXT.searching)}
            </AppText>
            {character?.work ? (
              <AppText style={[styles.work, { color: theme.inkSoft }]}>{character.work}</AppText>
            ) : null}
          </View>
        </View>

        {description ? (
          <View style={[styles.descriptionBox, { borderColor: alpha(theme.ink, 0.16) }]}>
            <AppText variant="label" color={theme.accentText}>{SKIN_TEXT.whoIs}</AppText>
            <AppText style={[styles.description, { color: theme.ink }]}>{description}</AppText>
          </View>
        ) : null}

        {character?.externalLink ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={SKIN_TEXT.investigateLabel(character.text)}
            onPress={() => void openLink()}
            style={({ pressed }) => [styles.link, pressed && { opacity: 0.65 }]}
          >
            <Feather name="external-link" size={14} color={theme.accentText} />
            <AppText variant="caption" color={theme.accentText} style={{ marginLeft: 6, fontFamily: fonts.sansSemiBold }}>
              {SKIN_TEXT.investigate}
            </AppText>
          </Pressable>
        ) : null}
      </StimulusCard>

      <View style={styles.actions}>
        <Button label={SKIN_TEXT.anotherCharacter} small loading={drawing} onPress={() => void draw(true)} accent={theme.accent} accentInk={theme.accentInk} />
        <Button label={copied ? COMMON_TEXT.copied : SKIN_TEXT.copyFile} tone="secondary" small disabled={!character} onPress={() => void copy()} accent={theme.accentText} accentInk={theme.accentInk} />
        <Button label={COMMON_TEXT.sendToNotebook} tone="secondary" small disabled={!character} onPress={sendToEditor} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>

      <AppText variant="caption" color={theme.inkSoft} style={styles.note}>
        {SKIN_TEXT.note}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { lineHeight: 19, marginBottom: spacing.md },
  card: { minHeight: 300 },
  profile: { flexDirection: 'row', alignItems: 'center' },
  silhouette: { width: 72, height: 86, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.7 },
  work: { fontFamily: fonts.serifItalic, fontSize: 17, lineHeight: 23, marginTop: 2 },
  descriptionBox: { borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.lg },
  description: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 25, marginTop: spacing.xs },
  link: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', minHeight: minTouch, marginTop: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  note: { lineHeight: 18, marginTop: spacing.sm },
});
