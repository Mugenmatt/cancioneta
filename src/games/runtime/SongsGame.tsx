import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, GameField, Note, PromptCard } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { COMMON_TEXT } from '@/content/games/common';
import { SONGS_TEXT, SONGS_UI_TEXT, type SongsGameId } from '@/content/games/g08-g10';
import { alpha, fonts, spacing } from '@/design/tokens';

export function SongsGame({ id }: { id: string }) {
  const theme = useGameTheme(id);
  const [song, setSong] = useState<PoolItem | null>(null);
  const [original, setOriginal] = useState('');
  const [inversion, setInversion] = useState('');
  const [inversions, setInversions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const copy = SONGS_TEXT[id as SongsGameId] ?? SONGS_TEXT.g08;

  const draw = async () => {
    setLoading(true);
    const [next] = await randomService.draw('songs', 1);
    setSong(next ?? null);
    setLoading(false);
  };

  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);

  const open = async () => {
    if (!song?.externalLink) return;
    try { await Linking.openURL(song.externalLink); }
    catch { Alert.alert(SONGS_UI_TEXT.linkErrorTitle, SONGS_UI_TEXT.linkErrorBody); }
  };

  const addInversion = () => {
    if (!original.trim() || !inversion.trim()) return;
    setInversions((current) => [...current, SONGS_UI_TEXT.bodyInversion(original.trim(), inversion.trim())]);
    setOriginal('');
    setInversion('');
  };

  const body = [
    song ? SONGS_UI_TEXT.bodySong(song.text, song.author, song.year) : '',
    song?.externalLink ? SONGS_UI_TEXT.bodyLink(song.externalLink) : '',
    ...inversions,
  ].filter(Boolean).join('\n');

  return (
    <View>
      <Note theme={theme}>{copy.intro}</Note>
      <PromptCard theme={theme} eyebrow={SONGS_UI_TEXT.songEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.title, { color: theme.ink }]}>{song?.text ?? COMMON_TEXT.loading}</AppText>
        <AppText style={[styles.artist, { color: theme.inkSoft }]}>{song?.author ?? COMMON_TEXT.unknownArtist}{song?.year ? ` · ${song.year}` : ''}</AppText>
        {song?.externalLink ? (
          <Pressable accessibilityRole="link" onPress={() => void open()} style={styles.link}>
            <Feather name="external-link" size={14} color={theme.accentText} />
            <AppText variant="caption" color={theme.accentText} style={{ marginLeft: 6, fontFamily: fonts.sansSemiBold }}>
              {SONGS_UI_TEXT.listen}
            </AppText>
          </Pressable>
        ) : null}
      </PromptCard>

      <View style={styles.steps}>
        {copy.steps.map((step) => (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, { backgroundColor: theme.accent }]} />
            <AppText variant="caption" color={theme.inkSoft} style={{ flex: 1, lineHeight: 18 }}>{step}</AppText>
          </View>
        ))}
      </View>

      {id === 'g10' ? (
        <View style={[styles.inversionBox, { borderColor: alpha(theme.ink, 0.18) }]}>
          <AppText variant="label" color={theme.accentText}>{SONGS_UI_TEXT.inversionTitle}</AppText>
          {inversions.map((entry) => (
            <AppText key={entry} style={[styles.inversion, { color: theme.ink }]}>{entry}</AppText>
          ))}
          <GameField theme={theme} label={SONGS_UI_TEXT.originalExpression} value={original} onChangeText={setOriginal} placeholder={SONGS_UI_TEXT.originalPlaceholder} />
          <GameField theme={theme} label={SONGS_UI_TEXT.inversion} value={inversion} onChangeText={setInversion} placeholder={SONGS_UI_TEXT.inversionPlaceholder} />
          <Button label={SONGS_UI_TEXT.addInversion} tone="secondary" small onPress={addInversion} accent={theme.accentText} accentInk={theme.accentInk} disabled={!original.trim() || !inversion.trim()} />
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Button label={SONGS_UI_TEXT.anotherSong} small loading={loading} onPress={() => void draw()} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <Note theme={theme}>{SONGS_UI_TEXT.note}</Note>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 31, lineHeight: 37 },
  artist: { fontFamily: fonts.serifItalic, fontSize: 17, marginTop: 4 },
  link: { flexDirection: 'row', alignItems: 'center', minHeight: 40, marginTop: spacing.sm },
  steps: { gap: 7, marginTop: spacing.md },
  step: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 8 },
  inversionBox: { borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: spacing.md, marginTop: spacing.md, gap: 8 },
  inversion: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 23 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
