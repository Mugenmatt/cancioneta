import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { ActionBar, GameField, Note, PromptCard } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { dataService } from '@/services/data/DataService';
import type { PoolItem } from '@/core/types';
import { acrosticLetters } from './logic';
import { alpha, fonts, spacing } from '@/design/tokens';
import { COMMON_TEXT } from '@/content/games/common';
import { ACROSTIC_TEXT } from '@/content/games/g32';
import { RESTRICTIONS_TEXT } from '@/content/games/g22';

export function RestriccionesGame() {
  const theme = useGameTheme('g22');
  const [situation, setSituation] = useState<PoolItem | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const restrictions = dataService.getPool('restrictions');
  const draw = async () => { const [next] = await randomService.draw('situations', 1); setSituation(next ?? null); };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);
  const toggle = (text: string) => setSelected((current) => current.includes(text) ? current.filter((entry) => entry !== text) : [...current, text]);
  const addCustom = () => {
    if (!custom.trim() || selected.includes(custom.trim())) return;
    setSelected((current) => [...current, custom.trim()]);
    setCustom('');
  };
  const body = [situation?.text ?? '', ...selected.map(RESTRICTIONS_TEXT.bodyItem)].filter(Boolean).join('\n');
  return (
    <View>
      <Note theme={theme}>{RESTRICTIONS_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={RESTRICTIONS_TEXT.situationEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.source, { color: theme.ink }]}>{situation?.text ?? COMMON_TEXT.loading}</AppText>
      </PromptCard>
      <View style={styles.pills}>
        {restrictions.map((restriction) => (
          <Pill key={restriction.id} label={restriction.text} selected={selected.includes(restriction.text)} onPress={() => toggle(restriction.text)} color={theme.accentText} />
        ))}
      </View>
      <View style={styles.customRow}>
        <View style={{ flex: 1 }}><GameField theme={theme} value={custom} onChangeText={setCustom} placeholder={RESTRICTIONS_TEXT.customPlaceholder} /></View>
        <Button label={RESTRICTIONS_TEXT.add} small onPress={addCustom} disabled={!custom.trim()} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <View style={styles.buttons}><Button label={RESTRICTIONS_TEXT.anotherSituation} tone="secondary" small onPress={() => void draw()} accent={theme.accentText} accentInk={theme.accentInk} /></View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

export function AcrosticoGame() {
  const theme = useGameTheme('g32');
  const [target, setTarget] = useState('');
  const [lines, setLines] = useState<Record<number, string>>({});
  const letters = acrosticLetters(target);
  const drawRandomWord = async () => {
    const [next] = await randomService.draw('words.noun', 1);
    setTarget(next?.text ?? '');
    setLines({});
  };
  const body = letters.map((letter, index) => ACROSTIC_TEXT.body(letter, lines[index] ?? '')).join('\n');
  return (
    <View>
      <Note theme={theme}>{ACROSTIC_TEXT.intro}</Note>
      <GameField theme={theme} label={ACROSTIC_TEXT.targetLabel} value={target} onChangeText={(value) => { setTarget(value); setLines({}); }} placeholder={ACROSTIC_TEXT.targetPlaceholder} style={{ marginTop: spacing.md }} />
      <View style={styles.buttons}>
        <Button label={ACROSTIC_TEXT.randomWord} tone="secondary" small onPress={() => void drawRandomWord()} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <View style={{ gap: 6, marginTop: spacing.md }}>
        {letters.map((letter, index) => (
          <View key={`${letter}-${index}`} style={styles.acrosticRow}>
            <View style={[styles.letter, { backgroundColor: theme.accent }]}>
              <AppText variant="label" color={theme.accentInk}>{letter}</AppText>
            </View>
            <TextInput
              value={lines[index] ?? ''}
              onChangeText={(value) => setLines((current) => ({ ...current, [index]: value }))}
              placeholder={ACROSTIC_TEXT.linePlaceholder(letter)}
              placeholderTextColor={theme.inkSoft}
              style={[styles.acrosticInput, { color: theme.ink, borderColor: alpha(theme.ink, 0.2) }]}
            />
          </View>
        ))}
      </View>
      <ActionBar text={target ? `${target}\n\n${body}` : ''} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  source: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  customRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  acrosticRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  letter: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  acrosticInput: { flex: 1, borderBottomWidth: 1, minHeight: 40, paddingVertical: 8, fontFamily: fonts.serif, fontSize: 16 },
});
