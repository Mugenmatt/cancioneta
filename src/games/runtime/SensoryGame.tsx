import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, GameField, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { dataService } from '@/services/data/DataService';
import { SENSES, SENSORY_TEXT } from '@/content/games/g20';
import { alpha, radii, spacing } from '@/design/tokens';

export function SensoryGame() {
  const theme = useGameTheme('g20');
  const [subject, setSubject] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const questions = dataService.getPool('sensory_questions');

  const suggest = async () => {
    const [item] = await randomService.draw('words.noun', 1);
    setSubject(item?.text ?? '');
  };

  useEffect(() => { void Promise.resolve().then(() => { void suggest(); }); }, []);

  const toggle = (text: string) => setSelected((current) => current.includes(text) ? current.filter((entry) => entry !== text) : [...current, text]);
  const body = [subject, ...selected].filter(Boolean).join('\n');
  return (
    <View>
      <Note theme={theme}>{SENSORY_TEXT.intro}</Note>
      <View style={styles.subjectRow}>
        <View style={{ flex: 1 }}><GameField theme={theme} label={SENSORY_TEXT.subjectLabel} value={subject} onChangeText={setSubject} placeholder={SENSORY_TEXT.subjectPlaceholder} /></View>
        <Button label={SENSORY_TEXT.random} tone="secondary" small onPress={() => void suggest()} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {SENSES.map((sense) => {
          const senseQuestions = questions.filter((item) => item.tags?.includes(sense));
          return (
            <View key={sense} style={[styles.sense, { borderColor: alpha(theme.ink, 0.18), backgroundColor: alpha(theme.surface, 0.55) }]}>
              <AppText variant="label" color={theme.accentText}>{sense}</AppText>
              {senseQuestions.map((question) => {
                const active = selected.includes(question.text);
                return (
                  <Pressable key={question.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => toggle(question.text)} style={styles.question}>
                    <View style={[styles.marker, { borderColor: theme.accent, backgroundColor: active ? theme.accent : 'transparent' }]} />
                    <AppText variant="caption" color={active ? theme.ink : theme.inkSoft} style={{ flex: 1, lineHeight: 18 }}>{question.text}</AppText>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  subjectRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  sense: { borderWidth: 1, borderRadius: radii.card, padding: spacing.sm },
  question: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
  marker: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, marginTop: 2 },
});
