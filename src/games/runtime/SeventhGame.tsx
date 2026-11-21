import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, Note, PromptCard } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { useLyricsStore } from '@/stores/lyricsStore';
import { readonlyLyricsBridge } from './lyricsBridge';
import { COMMON_TEXT } from '@/content/games/common';
import { SEVENTH_TEXT } from '@/content/games/g21';
import type { LyricsSnapshotLine, PoolItem } from '@/core/types';
import { alpha, fonts, radii, spacing } from '@/design/tokens';

export function SeventhGame() {
  const theme = useGameTheme('g21');
  useLyricsStore((state) => state.sections);
  const [reference, setReference] = useState<PoolItem | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const lines = readonlyLyricsBridge.getLyricsSnapshot().lines;

  const drawReference = async () => {
    const [next] = await randomService.draw('poems_songs_ref', 1);
    setReference(next ?? null);
  };

  useEffect(() => { void Promise.resolve().then(() => { void drawReference(); }); }, []);

  const drawSuggestions = async () => {
    const next: Record<string, string> = {};
    for (const line of lines) {
      if (line.words.length < 7) continue;
      const [item] = await randomService.draw('words.noun', 1, { filter: (candidate) => candidate.text !== line.words[6] });
      if (item) next[keyOf(line)] = item.text;
    }
    setSuggestions(next);
  };

  const openReference = async () => {
    if (!reference?.externalLink) return;
    try { await Linking.openURL(reference.externalLink); }
    catch { Alert.alert(SEVENTH_TEXT.linkErrorTitle, SEVENTH_TEXT.linkErrorBody); }
  };

  const body = lines.map((line) => SEVENTH_TEXT.lineBody(line, suggestions[keyOf(line)])).join('\n\n');

  return (
    <View>
      <Note theme={theme}>{SEVENTH_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={SEVENTH_TEXT.referenceEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.reference, { color: theme.ink }]}>{reference?.text ?? COMMON_TEXT.loading}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 4 }}>{reference?.author ?? ''}{reference?.kind ? ` · ${reference.kind}` : ''}</AppText>
        <View style={styles.pills}>
          {reference?.externalLink ? (
            <Pressable accessibilityRole="link" onPress={() => void openReference()} style={styles.link}>
              <Feather name="external-link" size={13} color={theme.accentText} />
              <AppText variant="caption" color={theme.accentText} style={{ marginLeft: 5 }}>{SEVENTH_TEXT.searchWork}</AppText>
            </Pressable>
          ) : null}
          <Button label={SEVENTH_TEXT.anotherWork} tone="secondary" small onPress={() => void drawReference()} accent={theme.accentText} accentInk={theme.accentInk} />
        </View>
      </PromptCard>

      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {lines.length === 0 ? (
          <AppText variant="caption" color={theme.inkSoft}>{SEVENTH_TEXT.noLines}</AppText>
        ) : lines.map((line) => (
          <View key={keyOf(line)} style={[styles.line, { borderColor: alpha(theme.ink, 0.16), backgroundColor: alpha(theme.surface, 0.45) }]}>
            <AppText style={[styles.lineText, { color: theme.ink }]}>{line.text}</AppText>
            {line.words.length < 7 ? (
              <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 4 }}>{SEVENTH_TEXT.shortLine}</AppText>
            ) : (
              <View style={styles.wordRow}>
                <View style={[styles.wordPill, { backgroundColor: alpha(theme.ink, 0.08) }]}>
                  <AppText variant="caption" color={theme.inkSoft}>{SEVENTH_TEXT.seventh(line.words[6] ?? '')}</AppText>
                </View>
                <Feather name="arrow-right" size={12} color={theme.inkSoft} />
                <View style={[styles.wordPill, { backgroundColor: alpha(theme.accent, 0.16) }]}>
                  <AppText variant="caption" color={theme.accentText}>{suggestions[keyOf(line)] ?? COMMON_TEXT.noSuggestion}</AppText>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <Button label={SEVENTH_TEXT.drawWords} small onPress={() => void drawSuggestions()} disabled={lines.length === 0} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <Note theme={theme}>{SEVENTH_TEXT.note}</Note>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function keyOf(line: LyricsSnapshotLine): string {
  return `${line.sectionId}:${line.stanzaId}:${line.lineIndex}`;
}

const styles = StyleSheet.create({
  reference: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  link: { flexDirection: 'row', alignItems: 'center', minHeight: 36 },
  line: { borderWidth: 1, borderRadius: radii.card, padding: spacing.sm },
  lineText: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 23 },
  wordRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  wordPill: { borderRadius: radii.chip, paddingHorizontal: 8, paddingVertical: 3 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
});
