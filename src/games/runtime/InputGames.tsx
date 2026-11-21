import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { ActionBar, GameField, Note, PromptCard } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { letterDestinations } from '@/data/prompts';
import type { PoolItem } from '@/core/types';
import { COMMON_TEXT } from '@/content/games/common';
import { PIENSO_EN_VOS_TEXT } from '@/content/games/g13-g15';
import { CARTA_TEXT, SECRETO_TEXT, TRENZA_TEXT, UNIVERSO_TEXT } from '@/content/games/g25-g27';
import { braidPhrases } from './logic';
import { alpha, fonts, radii, spacing } from '@/design/tokens';

export function InputGames({ id }: { id: string }) {
  if (id === 'g15') return <PiensoEnVos />;
  if (id === 'g25') return <Carta />;
  if (id === 'g26') return <SecretoConfesion />;
  if (id === 'g27') return <Universo />;
  if (id === 'g30') return <Trenza />;
  return null;
}

function PiensoEnVos() {
  const theme = useGameTheme('g15');
  const [noun, setNoun] = useState<PoolItem | null>(null);
  const [mode, setMode] = useState(1);
  const [people, setPeople] = useState('');
  const [things, setThings] = useState('');
  const draw = async () => { const [next] = await randomService.draw('words.noun', 1); setNoun(next ?? null); };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  const modes = PIENSO_EN_VOS_TEXT.modes;
  const body = PIENSO_EN_VOS_TEXT.body(
    noun?.text ?? '',
    modes.find((entry) => entry.value === mode)?.label ?? '',
    people,
    things,
  );
  return (
    <View>
      <Note theme={theme}>{PIENSO_EN_VOS_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={PIENSO_EN_VOS_TEXT.nounEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.big, { color: theme.ink }]}>{noun?.text ?? COMMON_TEXT.loading}</AppText>
      </PromptCard>
      <View style={styles.pills}>
        {modes.map((entry) => <Pill key={entry.value} label={entry.label} selected={mode === entry.value} onPress={() => setMode(entry.value)} color={theme.accentText} />)}
      </View>
      <GameField theme={theme} label={PIENSO_EN_VOS_TEXT.peopleLabel} value={people} onChangeText={setPeople} placeholder={PIENSO_EN_VOS_TEXT.peoplePlaceholder} multiline style={{ marginTop: spacing.md }} />
      <GameField theme={theme} label={PIENSO_EN_VOS_TEXT.thingsLabel} value={things} onChangeText={setThings} placeholder={PIENSO_EN_VOS_TEXT.thingsPlaceholder} multiline style={{ marginTop: spacing.sm }} />
              <Button label={PIENSO_EN_VOS_TEXT.anotherNoun} tone="secondary" small onPress={() => void draw()} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function Carta() {
  const theme = useGameTheme('g25');
  const [trigger, setTrigger] = useState<PoolItem | null>(null);
  const [destination, setDestination] = useState<string>(letterDestinations[0] ?? '');
  const [letter, setLetter] = useState('');
  const [fragments, setFragments] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const draw = async () => { const [next] = await randomService.draw('letter_triggers', 1); setTrigger(next ?? null); };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);

  const rescue = () => {
    const lines = letter.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 8);
    setFragments(lines);
    setChosen([]);
  };
  const toggle = (line: string) => setChosen((current) => current.includes(line) ? current.filter((entry) => entry !== line) : [...current, line]);
  const body = [destination, trigger?.text ?? '', ...chosen].filter(Boolean).join('\n\n');
  return (
    <View>
      <Note theme={theme}>{CARTA_TEXT.intro}</Note>
      <View style={styles.pills}>
        {letterDestinations.map((entry) => <Pill key={entry} label={entry} selected={destination === entry} onPress={() => setDestination(entry)} color={theme.accentText} />)}
      </View>
      <PromptCard theme={theme} eyebrow={CARTA_TEXT.triggerEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.prompt, { color: theme.ink }]}>{trigger?.text ?? CARTA_TEXT.searching}</AppText>
      </PromptCard>
      <GameField theme={theme} label={CARTA_TEXT.letterLabel} value={letter} onChangeText={setLetter} placeholder={CARTA_TEXT.letterPlaceholder} multiline style={{ marginTop: spacing.md, minHeight: 180 }} />
      <View style={styles.buttons}>
        <Button label={CARTA_TEXT.rescue} small onPress={rescue} disabled={!letter.trim()} accent={theme.accent} accentInk={theme.accentInk} />
        <Button label={CARTA_TEXT.anotherTrigger} tone="secondary" small onPress={() => void draw()} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      {fragments.length ? (
        <View style={styles.fragments}>
          <AppText variant="label" color={theme.accentText}>{CARTA_TEXT.fragmentsTitle}</AppText>
          {fragments.map((line) => {
            const active = chosen.includes(line);
            return (
              <Pressable key={line} onPress={() => toggle(line)} style={[styles.fragment, { borderColor: active ? theme.accent : alpha(theme.ink, 0.16), backgroundColor: active ? alpha(theme.accent, 0.1) : 'transparent' }]}>
                <AppText variant="caption" color={active ? theme.ink : theme.inkSoft} style={{ lineHeight: 18 }}>{line}</AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function SecretoConfesion() {
  const theme = useGameTheme('g26');
  const [topic, setTopic] = useState<PoolItem | null>(null);
  const [hidden, setHidden] = useState('');
  const [confession, setConfession] = useState('');
  const draw = async () => { const [next] = await randomService.draw('confession_topics', 1); setTopic(next ?? null); };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  const body = SECRETO_TEXT.body(topic?.text ?? '', hidden, confession);
  return (
    <View>
      <Note theme={theme}>{SECRETO_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={SECRETO_TEXT.topicEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.prompt, { color: theme.ink }]}>{topic?.text ?? SECRETO_TEXT.searching}</AppText>
      </PromptCard>
      <View style={[styles.twoPanels, { borderColor: alpha(theme.ink, 0.16) }]}>
        <View style={styles.panel}>
          <AppText variant="label" color={theme.accentText}>{SECRETO_TEXT.hiddenTitle}</AppText>
          <GameField theme={theme} value={hidden} onChangeText={setHidden} placeholder={SECRETO_TEXT.hiddenPlaceholder} multiline />
        </View>
        <View style={[styles.panel, { borderLeftColor: alpha(theme.ink, 0.14), borderLeftWidth: 1 }]}>
          <AppText variant="label" color={theme.accentText}>{SECRETO_TEXT.confessionTitle}</AppText>
          <GameField theme={theme} value={confession} onChangeText={setConfession} placeholder={SECRETO_TEXT.confessionPlaceholder} multiline />
        </View>
      </View>
      <Button label={SECRETO_TEXT.anotherTopic} tone="secondary" small onPress={() => void draw()} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function Universo() {
  const theme = useGameTheme('g27');
  const [subject, setSubject] = useState<PoolItem | null>(null);
  const [universe, setUniverse] = useState<PoolItem | null>(null);
  const drawSubject = async () => { const [next] = await randomService.draw('themes', 1); setSubject(next ?? null); };
  const drawUniverse = async () => { const [next] = await randomService.draw('universes', 1); setUniverse(next ?? null); };
  useEffect(() => { void Promise.resolve().then(() => { void drawSubject(); void drawUniverse(); }); }, []);
  const terms = String(universe?.extra?.terms ?? '').split('|').filter(Boolean);
  const body = UNIVERSO_TEXT.body(subject?.text ?? '', universe?.text ?? '', terms);
  return (
    <View>
      <Note theme={theme}>{UNIVERSO_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={UNIVERSO_TEXT.subjectEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.big, { color: theme.ink }]}>{subject?.text ?? COMMON_TEXT.loading}</AppText>
        <Button label={UNIVERSO_TEXT.anotherSubject} tone="secondary" small onPress={() => void drawSubject()} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
      </PromptCard>
      <PromptCard theme={theme} eyebrow={UNIVERSO_TEXT.universeEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.big, { color: theme.ink }]}>{universe?.text ?? COMMON_TEXT.loading}</AppText>
        <View style={styles.pills}>
          {terms.map((term) => (
            <View key={term} style={[styles.term, { borderColor: alpha(theme.accent, 0.35), backgroundColor: alpha(theme.accent, 0.08) }]}>
              <AppText variant="caption" color={theme.ink}>{term}</AppText>
            </View>
          ))}
        </View>
        <Button label={UNIVERSO_TEXT.anotherUniverse} tone="secondary" small onPress={() => void drawUniverse()} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
      </PromptCard>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

function Trenza() {
  const theme = useGameTheme('g30');
  const [phrases, setPhrases] = useState(['', '', '']);
  const [result, setResult] = useState('');
  const braid = () => {
    const order = randomService.shuffle([0, 1, 2]);
    setResult(braidPhrases(phrases, order));
  };
  const update = (index: number, value: string) => {
    setPhrases((current) => current.map((entry, i) => (i === index ? value : entry)));
    setResult('');
  };
  return (
    <View>
      <Note theme={theme}>{TRENZA_TEXT.intro}</Note>
      {phrases.map((phrase, index) => (
        <GameField key={index} theme={theme} label={TRENZA_TEXT.phraseLabel(index)} value={phrase} onChangeText={(value) => update(index, value)} placeholder={TRENZA_TEXT.phrasePlaceholder} multiline style={{ marginTop: spacing.sm }} />
      ))}
      <View style={styles.buttons}>
        <Button label={TRENZA_TEXT.braid} small onPress={braid} disabled={phrases.some((phrase) => !phrase.trim())} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      {result ? (
        <View style={[styles.result, { borderColor: theme.accent, backgroundColor: alpha(theme.accent, 0.08) }]}>
          <AppText variant="label" color={theme.accentText}>{TRENZA_TEXT.resultTitle}</AppText>
          <AppText style={[styles.resultText, { color: theme.ink }]}>{result}</AppText>
        </View>
      ) : null}
      <ActionBar text={result} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  prompt: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 29 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  fragments: { gap: 6, marginTop: spacing.md },
  fragment: { borderWidth: 1, borderRadius: radii.field, padding: 8 },
  twoPanels: { borderWidth: 1, borderRadius: radii.card, marginTop: spacing.md, overflow: 'hidden' },
  panel: { padding: spacing.sm },
  term: { borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: 8, paddingVertical: 3 },
  result: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md },
  resultText: { fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 32, marginTop: 4 },
});
