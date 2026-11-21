import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { ActionBar, GameField, Note, PromptCard } from './ui';
import { AcrosticoGame, RestriccionesGame } from './PromptToolsExtra';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { alpha, fontSizes, fonts, radii, spacing } from '@/design/tokens';
import { COMMON_TEXT } from '@/content/games/common';
import { CONTAR_MOSTRAR_PATTERNS, CONTAR_MOSTRAR_TEXT } from '@/content/games/g03-g04';
import { CONEXION_EXAMPLES, CONEXION_TEXT, PERSPECTIVE_CATEGORIES, PERSPECTIVE_TEXT, type PerspectiveCategory } from '@/content/games/g12-g14';
import { INVISIBLE_WORDS_TEXT } from '@/content/games/g07';
import { dataService } from '@/services/data/DataService';
import { fingerprint } from '@/services/random/fingerprint';

export function PromptTools({ id }: { id: string }) {
  if (id === 'g04') return <ContarMostrar />;
  if (id === 'g07') return <InvisibleWords />;
  if (id === 'g12') return <Conexion />;
  if (id === 'g14') return <Perspectiva />;
  if (id === 'g22') return <RestriccionesGame />;
  if (id === 'g32') return <AcrosticoGame />;
  return null;
}

function ContarMostrar() {
  const theme = useGameTheme('g04');
  const [prompt, setPrompt] = useState<PoolItem | null>(null);
  const [pattern, setPattern] = useState<string>(CONTAR_MOSTRAR_PATTERNS[2]);
  const draw = async () => { const [next] = await randomService.draw('prompts', 1); setPrompt(next ?? null); };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  const body = prompt ? CONTAR_MOSTRAR_TEXT.body(prompt.text, pattern) : '';
  return (
    <View>
      <Note theme={theme}>{CONTAR_MOSTRAR_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={CONTAR_MOSTRAR_TEXT.promptEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.prompt, { color: theme.ink }]}>{prompt?.text ?? COMMON_TEXT.searchingPrompt}</AppText>
      </PromptCard>
      <View style={[styles.compare, { borderColor: alpha(theme.ink, 0.18) }]}>
        <View style={styles.compareCol}>
          <AppText variant="label" color={theme.accentText}>{CONTAR_MOSTRAR_TEXT.count}</AppText>
          <AppText variant="caption" color={theme.inkSoft}>{CONTAR_MOSTRAR_TEXT.countExample}</AppText>
        </View>
        <View style={styles.compareCol}>
          <AppText variant="label" color={theme.accentText}>{CONTAR_MOSTRAR_TEXT.show}</AppText>
          <AppText variant="caption" color={theme.inkSoft}>{CONTAR_MOSTRAR_TEXT.showExample}</AppText>
        </View>
      </View>
      <View style={styles.pills}>
        {CONTAR_MOSTRAR_PATTERNS.map((value) => <Pill key={value} label={value} selected={pattern === value} onPress={() => setPattern(value)} color={theme.accentText} />)}
      </View>
      <Button label={CONTAR_MOSTRAR_TEXT.anotherPrompt} small onPress={() => void draw()} accent={theme.accent} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function InvisibleWords() {
  const theme = useGameTheme('g07');
  const [prompt, setPrompt] = useState<PoolItem | null>(null);
  const [words, setWords] = useState<string[]>(['', '', '', '']);

  const drawPrompt = async () => {
    const [next] = await randomService.draw('prompts', 1);
    setPrompt(next ?? null);
  };

  const drawWord = async (index: number) => {
    const exclude = new Set(words.filter((_, i) => i !== index).map((word) => word.trim().toLowerCase()).filter(Boolean));
    const [next] = await randomService.draw('words.noun', 1, {
      filter: (item) => !exclude.has(item.text.trim().toLowerCase()),
    });
    if (!next) return;
    setWords((current) => current.map((entry, i) => (i === index ? next.text : entry)));
  };

  const drawAllWords = async () => {
    const items = await randomService.draw('words.noun', 4);
    if (items.length === 0) return;
    setWords((current) => current.map((entry, index) => items[index]?.text ?? entry));
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      void drawPrompt();
      void drawAllWords();
    });
  }, []);

  const filled = words.map((word) => word.trim()).filter(Boolean);
  const body = prompt ? INVISIBLE_WORDS_TEXT.body(prompt.text, filled) : '';

  return (
    <View>
      <Note theme={theme}>{INVISIBLE_WORDS_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={CONTAR_MOSTRAR_TEXT.promptEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.prompt, { color: theme.ink }]}>{prompt?.text ?? COMMON_TEXT.searchingPrompt}</AppText>
      </PromptCard>
      <View style={styles.wordsGrid}>
        {words.map((word, index) => (
          <View key={index} style={styles.wordCard}>
            <AppText variant="label" color={theme.accentText}>{INVISIBLE_WORDS_TEXT.wordLabel(index)}</AppText>
            <View style={[styles.wordValue, { borderColor: alpha(theme.ink, 0.16), backgroundColor: alpha(theme.surface, 0.65) }]}>
              <AppText style={[styles.wordText, { color: theme.ink }]}>{word || INVISIBLE_WORDS_TEXT.emptyVisible}</AppText>
            </View>
            <Button
              label={INVISIBLE_WORDS_TEXT.regenerateWord(index)}
              tone="secondary"
              small
              onPress={() => void drawWord(index)}
              accent={theme.accentText}
              accentInk={theme.accentInk}
              style={styles.wordButton}
            />
          </View>
        ))}
      </View>
      <View style={[styles.visibleWords, { borderColor: alpha(theme.accent, 0.4), backgroundColor: alpha(theme.accent, 0.08) }]}>
        <AppText variant="label" color={theme.accentText}>{INVISIBLE_WORDS_TEXT.alwaysVisible}</AppText>
        <AppText style={[styles.invisible, { color: theme.ink }]}>{filled.length ? filled.join(' · ') : INVISIBLE_WORDS_TEXT.emptyVisible}</AppText>
      </View>
      <View style={styles.buttons}>
        <Button label={INVISIBLE_WORDS_TEXT.regenerateAll} small onPress={() => void drawAllWords()} accent={theme.accent} accentInk={theme.accentInk} />
        <Button label={INVISIBLE_WORDS_TEXT.anotherPrompt} tone="secondary" small onPress={() => void drawPrompt()} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function Conexion() {
  const theme = useGameTheme('g12');
  const [source, setSource] = useState<PoolItem | null>(null);
  const [qualities, setQualities] = useState('');
  const [target, setTarget] = useState('');
  const draw = async () => { const [next] = await randomService.draw('words.noun', 1); setSource(next ?? null); };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  const body = source ? CONEXION_TEXT.body(source.text, qualities, target) : '';
  return (
    <View>
      <Note theme={theme}>{CONEXION_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={CONEXION_TEXT.sourceEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.source, { color: theme.ink }]}>{source?.text ?? COMMON_TEXT.loading}</AppText>
      </PromptCard>
      <GameField theme={theme} label={CONEXION_TEXT.qualitiesLabel} value={qualities} onChangeText={setQualities} placeholder={CONEXION_TEXT.qualitiesPlaceholder} multiline style={{ marginTop: spacing.md }} />
      <GameField theme={theme} label={CONEXION_TEXT.targetLabel} value={target} onChangeText={setTarget} placeholder={CONEXION_TEXT.targetPlaceholder} style={{ marginTop: spacing.sm }} />
      <View style={styles.examples}>
        <AppText variant="label" color={theme.accentText}>{CONEXION_TEXT.examplesTitle}</AppText>
        {CONEXION_EXAMPLES.map((example) => (
          <View key={example.title} style={styles.example}>
            <AppText variant="caption" color={theme.ink} style={{ fontFamily: fonts.sansSemiBold }}>{example.title}</AppText>
            <AppText variant="caption" color={theme.inkSoft} style={{ lineHeight: 18 }}>{example.body}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.buttons}><Button label={CONEXION_TEXT.anotherSource} small onPress={() => void draw()} accent={theme.accent} accentInk={theme.accentInk} /></View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function Perspectiva() {
  const theme = useGameTheme('g14');
  const [noun, setNoun] = useState<PoolItem | null>(null);
  const [category, setCategory] = useState<PerspectiveCategory | 'all'>('all');

  const draw = useCallback(async () => {
    if (category === 'all') {
      const [next] = await randomService.draw('words.noun', 1);
      setNoun(next ?? null);
      return;
    }
    const config = PERSPECTIVE_CATEGORIES.find((entry) => entry.id === category);
    if (!config) return;
    const available = new Set(dataService.getPool('words.noun').map((item) => item.text.toLocaleLowerCase('es')));
    const candidates = config.words.filter((word) => available.has(word.toLocaleLowerCase('es')));
    const [chosen] = randomService.shuffle(candidates.length > 0 ? candidates : [...config.words]);
    if (!chosen) {
      setNoun(null);
      return;
    }
    const key = fingerprint(chosen);
    const existing = dataService.getPool('words.noun').find((item) => item.fingerprint === key);
    setNoun(existing ?? {
      id: `g14-${key.slice(0, 8)}`,
      pool: 'words.noun',
      text: chosen,
      lang: 'es',
      license: 'cc_by_sa',
      fingerprint: key,
    });
  }, [category]);

  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, [draw]);

  return (
    <View>
      <Note theme={theme}>{PERSPECTIVE_TEXT.intro}</Note>
      <View style={styles.pills}>
        <Pill label={PERSPECTIVE_TEXT.anyCategory} selected={category === 'all'} onPress={() => setCategory('all')} color={theme.accentText} />
        {PERSPECTIVE_CATEGORIES.map((entry) => (
          <Pill key={entry.id} label={entry.label} selected={category === entry.id} onPress={() => setCategory(entry.id)} color={theme.accentText} />
        ))}
      </View>
       <View style={[styles.nounStage, { borderColor: theme.accent, backgroundColor: alpha(theme.accent, 0.1) }]}>
         <Feather name="eye" size={fontSizes.lead * 2} color={alpha(theme.accent, 0.35)} />
         <AppText style={[styles.noun, { color: theme.ink }]}>{noun?.text ?? COMMON_TEXT.loading}</AppText>
       </View>
      <Button label={PERSPECTIVE_TEXT.anotherNoun} small onPress={() => void draw()} accent={theme.accent} accentInk={theme.accentInk} style={{ alignSelf: 'center', marginTop: spacing.md }} />
      <ActionBar text={noun ? PERSPECTIVE_TEXT.body(noun.text) : ''} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 29 },
  source: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38 },
  compare: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: spacing.sm, marginTop: spacing.md, gap: spacing.md },
  compareCol: { flex: 1, gap: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  wordsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  wordCard: { width: '48%', gap: 6 },
  wordValue: { borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, minHeight: 48, justifyContent: 'center' },
  wordText: { fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 22 },
  wordButton: { alignSelf: 'stretch' },
  visibleWords: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md },
  invisible: { fontFamily: fonts.displayItalic, fontSize: 27, lineHeight: 34, marginTop: 4 },
  examples: { gap: 8, borderTopWidth: 1, borderColor: alpha('#888888', 0.25), marginTop: spacing.md, paddingTop: spacing.sm },
  example: { gap: 2 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  nounStage: { borderWidth: 2, borderRadius: radii.sheet, minHeight: 190, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md, padding: spacing.lg },
  noun: { fontFamily: fonts.display, fontSize: 50, lineHeight: 56, textAlign: 'center' },
});
