import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, minTouch, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G41_MIN_QUESTIONS, G41_TEXT } from '@/content/games/g41';
import { COMMON_TEXT } from '@/content/games/common';
import {
  canGoToEditor, makeQuestionStimulus, selectedQuestions, writtenQuestions,
  type QuestionEntry,
} from './g41Logic';
import { ActionBar, GameField, Note, PromptCard } from './ui';

function initialQuestions(): QuestionEntry[] {
  return Array.from({ length: G41_MIN_QUESTIONS }, (_, id) => ({ id, text: '', selected: false }));
}

export function TitleQuestionGame() {
  const theme = useGameTheme('g41');
  const [title, setTitle] = useState<PoolItem | null>(null);
  const [entries, setEntries] = useState<QuestionEntry[]>(initialQuestions);
  const [nextId, setNextId] = useState(G41_MIN_QUESTIONS);

  const draw = async () => {
    const [next] = await randomService.draw('question_titles', 1);
    setTitle(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);

  const update = (id: number, text: string) => setEntries((current) =>
    current.map((entry) => (entry.id === id ? { ...entry, text } : entry)));

  const toggle = (id: number) => setEntries((current) => current.map((entry) =>
    entry.id === id && entry.text.trim() ? { ...entry, selected: !entry.selected } : entry));

  const addQuestion = () => {
    setEntries((current) => [...current, { id: nextId, text: '', selected: false }]);
    setNextId(nextId + 1);
  };

  const chosen = selectedQuestions(entries);
  const body = chosen.join('\n');
  const stimulus = makeQuestionStimulus({
    title: G41_TEXT.editorTitle(title?.text ?? ''),
    questions: chosen,
    groupTitle: G41_TEXT.selectedQuestionsTitle,
    note: G41_TEXT.editorNote,
  });

  return (
    <View>
      <Note theme={theme}>{G41_TEXT.intro}</Note>
      <PromptCard theme={theme} eyebrow={G41_TEXT.titleEyebrow} style={{ marginTop: spacing.md }}>
        <AppText style={[styles.title, { color: theme.ink }]}>{title?.text ?? COMMON_TEXT.loading}</AppText>
        <Button
          label={G41_TEXT.anotherTitle}
          tone="secondary"
          small
          onPress={() => void draw()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
        />
      </PromptCard>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G41_TEXT.questionsEyebrow}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 4, marginBottom: spacing.sm }}>
          {G41_TEXT.questionsCount(writtenQuestions(entries).length)}
        </AppText>
        {entries.map((entry, index) => (
          <View key={entry.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <GameField
                theme={theme}
                value={entry.text}
                onChangeText={(value) => update(entry.id, value)}
                placeholder={G41_TEXT.questionPlaceholder(index)}
                multiline
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={entry.selected ? G41_TEXT.unmark(index) : G41_TEXT.mark(index)}
              accessibilityState={{ checked: entry.selected }}
              disabled={!entry.text.trim()}
              hitSlop={8}
              onPress={() => toggle(entry.id)}
              style={[
                styles.check,
                { borderColor: entry.selected ? theme.accent : alpha(theme.ink, 0.24), backgroundColor: entry.selected ? alpha(theme.accent, 0.14) : 'transparent' },
                !entry.text.trim() && styles.disabled,
              ]}
            >
              <Feather name={entry.selected ? 'check-square' : 'square'} size={18} color={entry.selected ? theme.accentText : theme.inkSoft} />
            </Pressable>
          </View>
        ))}
        <Button
          label={G41_TEXT.addQuestion}
          tone="secondary"
          small
          onPress={addQuestion}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
        />
      </View>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G41_TEXT.selectionEyebrow}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: 4 }}>
          {G41_TEXT.selectedCount(chosen.length)}
        </AppText>
      </View>

      <ActionBar
        text={body}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G41_TEXT.send}
        disabled={!canGoToEditor(entries)}
      />
      <Note theme={theme}>{G41_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.displayItalic, fontSize: 28, lineHeight: 35 },
  block: { marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  check: { width: minTouch, height: minTouch, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
