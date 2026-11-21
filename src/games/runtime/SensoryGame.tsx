import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, GameField, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { dataService } from '@/services/data/DataService';
import { getWordDefinition } from '@/services/definitions/DefinitionService';
import { SENSES, SENSORY_TEXT } from '@/content/games/g20';
import { alpha, radii, spacing } from '@/design/tokens';

type Sense = (typeof SENSES)[number];

function pickRandomQuestion(questions: readonly { text: string }[]): string {
  return randomService.pickOne(questions)?.text ?? '';
}

function buildRandomSelection(allQuestions: readonly { text: string; tags?: string[] }[]): string[] {
  return SENSES.flatMap((sense) => {
    const senseQuestions = allQuestions.filter((item) => item.tags?.includes(sense));
    const picked = pickRandomQuestion(senseQuestions);
    return picked ? [picked] : [];
  });
}

export function SensoryGame() {
  const theme = useGameTheme('g20');
  const [subject, setSubject] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [definition, setDefinition] = useState('');
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const questions = dataService.getPool('sensory_questions');

  const loadDefinition = useCallback(async (word: string) => {
    setDefinitionLoading(true);
    const result = await getWordDefinition(word);
    setDefinition(result.definition);
    setDefinitionLoading(false);
  }, []);

  const suggest = useCallback(async () => {
    const [item] = await randomService.draw('words.noun', 1);
    const word = item?.text ?? '';
    setSubject(word);
    setSelected(buildRandomSelection(questions));
    setShowDefinition(false);
    setDefinition('');
    if (word) void loadDefinition(word);
  }, [loadDefinition, questions]);

  useEffect(() => { void Promise.resolve().then(() => { void suggest(); }); }, [suggest]);

  const toggle = (text: string) => setSelected((current) => current.includes(text) ? current.filter((entry) => entry !== text) : [...current, text]);
  const body = [subject, ...selected].filter(Boolean).join('\n');
  return (
    <View>
      <Note theme={theme}>{SENSORY_TEXT.intro}</Note>
      <View style={styles.subjectRow}>
        <View style={{ flex: 1 }}><GameField theme={theme} label={SENSORY_TEXT.subjectLabel} value={subject} onChangeText={setSubject} placeholder={SENSORY_TEXT.subjectPlaceholder} /></View>
        <Button label={SENSORY_TEXT.random} tone="secondary" small onPress={() => void suggest()} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <View style={[styles.definitionCard, { borderColor: alpha(theme.ink, 0.18), backgroundColor: alpha(theme.surface, 0.45) }]}>
        <View style={styles.definitionHead}>
          <AppText variant="label" color={theme.accentText}>{SENSORY_TEXT.definition}</AppText>
          <Button
            label={showDefinition ? SENSORY_TEXT.hideDefinition : SENSORY_TEXT.showDefinition}
            tone="ghost"
            small
            onPress={() => setShowDefinition((current) => !current)}
            accent={theme.accentText}
            accentInk={theme.accentInk}
          />
        </View>
        {showDefinition ? (
          <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 6, lineHeight: 19 }}>
            {definitionLoading ? SENSORY_TEXT.definitionLoading : (definition || SENSORY_TEXT.definitionUnavailable)}
          </AppText>
        ) : null}
      </View>
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {SENSES.map((sense: Sense) => {
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
  definitionCard: { borderWidth: 1, borderRadius: radii.card, padding: spacing.sm, marginTop: spacing.sm },
  definitionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  sense: { borderWidth: 1, borderRadius: radii.card, padding: spacing.sm },
  question: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
  marker: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, marginTop: 2 },
});
