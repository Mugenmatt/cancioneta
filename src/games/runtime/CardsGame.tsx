import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { ActionBar, Note, PromptCard } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { CARDS_TEXT } from '@/content/games/g13-g15';
import { COMMON_TEXT } from '@/content/games/common';
import { alpha, fonts, spacing } from '@/design/tokens';

export function CardsGame({ id }: { id: string }) {
  if (id === 'g16') return <ScriptCards />;
  if (id === 'g17') return <ReferencePair />;
  if (id === 'g18') return <InsistentVerse />;
  return <QuotePair />;
}

function QuotePair() {
  const theme = useGameTheme('g13');
  const [quotes, setQuotes] = useState<(PoolItem | null)[]>([null, null]);
  const draw = async (index: number) => {
    const [next] = await randomService.draw('quote_public', 1);
    setQuotes((current) => current.map((item, i) => (i === index ? next ?? null : item)));
  };
  useEffect(() => { void Promise.resolve().then(() => { void draw(0); void draw(1); }); }, []);
  const body = quotes.map((quote) => quote ? `${quote.text}\n— ${quote.author ?? COMMON_TEXT.fromHouse}` : '').filter(Boolean).join('\n\n');
  return (
    <View>
      <Note theme={theme}>{CARDS_TEXT.g13.intro}</Note>
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {quotes.map((quote, index) => (
          <PromptCard key={index} theme={theme} eyebrow={COMMON_TEXT.sentence(index)}>
            <AppText style={[styles.quote, { color: theme.ink }]}>{quote?.text ?? CARDS_TEXT.g13.searching}</AppText>
            <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 6 }}>
              {quote?.author ?? COMMON_TEXT.fromHouse}{quote?.work ? ` · ${quote.work}` : ''}
            </AppText>
            <Button label={CARDS_TEXT.g13.changeCard} tone="secondary" small onPress={() => void draw(index)} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
          </PromptCard>
        ))}
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function ScriptCards() {
  const theme = useGameTheme('g16');
  const [count, setCount] = useState(2);
  const [items, setItems] = useState<(PoolItem | null)[]>([]);
  const [shown, setShown] = useState<number | null>(null);

  const draw = async (index: number) => {
    const [next] = await randomService.draw('script_phrases', 1);
    setItems((current) => {
      const copy = [...current];
      copy[index] = next ?? null;
      return copy;
    });
  };

  useEffect(() => {
    const next = Array.from({ length: count }, () => null as PoolItem | null);
    void Promise.resolve().then(() => {
      setItems(next);
      void Promise.all(next.map((_, index) => draw(index)));
    });
  }, [count]);

  const body = items.filter(Boolean).map((item) => item?.text).join('\n');
  return (
    <View>
      <Note theme={theme}>{CARDS_TEXT.g16.intro}</Note>
      <View style={styles.pills}>
        {[1, 2, 3, 4].map((value) => (
          <Pill key={value} label={CARDS_TEXT.g16.count(value)} selected={count === value} onPress={() => setCount(value)} color={theme.accentText} />
        ))}
      </View>
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {items.map((item, index) => (
          <Pressable key={index} accessibilityRole="button" onPress={() => setShown(shown === index ? null : index)} style={[styles.script, { backgroundColor: theme.surface, borderColor: alpha(theme.ink, 0.2) }]}>
            <AppText style={[styles.scriptText, { color: theme.ink }]}>{item?.text ?? CARDS_TEXT.g16.empty}</AppText>
            {shown === index ? (
              <AppText variant="caption" color={theme.accentText} style={{ marginTop: 6 }}>
                {item?.author ?? COMMON_TEXT.fromHouse}{item?.work ? ` · ${item.work}` : ''}
              </AppText>
            ) : (
              <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 6 }}>{CARDS_TEXT.g16.showSource}</AppText>
            )}
            <Button label={CARDS_TEXT.g16.replace} tone="secondary" small onPress={() => void draw(index)} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
          </Pressable>
        ))}
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function ReferencePair() {
  const theme = useGameTheme('g17');
  const [items, setItems] = useState<(PoolItem | null)[]>([null, null]);
  const draw = async (index: number) => {
    const [next] = await randomService.draw('poems_songs_ref', 1);
    setItems((current) => current.map((item, i) => (i === index ? next ?? null : item)));
  };
  useEffect(() => { void Promise.resolve().then(() => { void draw(0); void draw(1); }); }, []);
  const body = items.filter(Boolean).map((item) => `${item?.text} — ${item?.author ?? ''}${item?.externalLink ? `\n${item.externalLink}` : ''}`).join('\n\n');
  return (
    <View>
      <Note theme={theme}>{CARDS_TEXT.g17.intro}</Note>
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {items.map((item, index) => (
          <PromptCard key={index} theme={theme} eyebrow={COMMON_TEXT.work(index)}>
            <AppText style={[styles.refTitle, { color: theme.ink }]}>{item?.text ?? CARDS_TEXT.g17.searching}</AppText>
            <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 4 }}>{item?.author ?? ''}{item?.kind ? ` · ${item.kind}` : ''}</AppText>
            <Button label={CARDS_TEXT.g17.changeWork} tone="secondary" small onPress={() => void draw(index)} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
          </PromptCard>
        ))}
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function InsistentVerse() {
  const theme = useGameTheme('g18');
  const [verse, setVerse] = useState<PoolItem | null>(null);
  const draw = async () => {
    const [next] = await randomService.draw('quote_public', 1);
    setVerse(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  return (
    <View>
      <Note theme={theme}>{CARDS_TEXT.g18.intro}</Note>
      <View style={[styles.verse, { borderColor: theme.accent, backgroundColor: alpha(theme.accent, 0.1) }]}>
        <Feather name="repeat" size={18} color={theme.accentText} />
        <AppText style={[styles.verseText, { color: theme.ink }]}>{verse?.text ?? CARDS_TEXT.g18.searching}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={{ textAlign: 'center', marginTop: 8 }}>{verse?.author ?? COMMON_TEXT.fromHouse}</AppText>
      </View>
      <Button label={CARDS_TEXT.g18.anotherVerse} small onPress={() => void draw()} accent={theme.accent} accentInk={theme.accentInk} style={{ alignSelf: 'center', marginTop: spacing.md }} />
      <ActionBar text={verse?.text ?? ''} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  quote: { fontFamily: fonts.displayItalic, fontSize: 25, lineHeight: 33 },
  script: { borderWidth: 1, borderRadius: 16, padding: spacing.md },
  scriptText: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 25 },
  refTitle: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  verse: { borderWidth: 2, borderRadius: 20, padding: spacing.lg, alignItems: 'center', marginTop: spacing.md },
  verseText: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, textAlign: 'center', marginTop: spacing.sm },
});
