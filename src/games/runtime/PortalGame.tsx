import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, GameField, Note, PromptCard } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { dataService } from '@/services/data/DataService';
import { PORTAL_TEXT } from '@/content/games/g06';
import { suggestPortalWord } from './logic';
import { alpha, fonts, radii, spacing } from '@/design/tokens';

interface Column { seed: string; entries: string[]; }

export function PortalGame() {
  const theme = useGameTheme('g06');
  const [columns, setColumns] = useState<Column[]>([]);
  const [seed, setSeed] = useState('');
  const [entries, setEntries] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const drawSeed = async () => {
    const [item] = await randomService.draw('portal_seeds', 1);
    setSeed(item?.text ?? PORTAL_TEXT.seedFallback);
  };

  useEffect(() => { void Promise.resolve().then(() => { void drawSeed(); }); }, []);

  const add = (value: string) => {
    const clean = value.trim();
    if (!clean || entries.length >= 10 || entries.includes(clean) || clean === seed) return;
    const next = [...entries, clean];
    setDraft('');
    setSuggestion('');
    if (next.length === 10) {
      setColumns((current) => [...current, { seed, entries: next }]);
      setSeed(clean);
      setEntries([]);
    } else {
      setEntries(next);
    }
  };

  const suggest = () => {
    const available = dataService.getPool('words.noun').map((item) => item.text);
    const next = suggestPortalWord(seed, [...entries, suggestion], dataService.getRelations(seed), available, randomService);
    if (next) setSuggestion(next);
  };

  const completed = columns.length >= 4;
  const body = [
    ...columns.map((column) => PORTAL_TEXT.bodyLine(column.seed, column.entries)),
    ...(entries.length > 0 ? [PORTAL_TEXT.bodyLine(seed, entries)] : []),
  ].join('\n');

  return (
    <View>
      <Note theme={theme}>{PORTAL_TEXT.intro}</Note>
      {columns.map((column, index) => (
        <PromptCard key={`${column.seed}-${index}`} theme={theme} eyebrow={PORTAL_TEXT.columnEyebrow(index, column.seed)} style={{ marginTop: spacing.md }}>
          <View style={styles.wordWrap}>
            {column.entries.map((word) => (
              <View key={word} style={[styles.chip, { borderColor: alpha(theme.accent, 0.35), backgroundColor: alpha(theme.accent, 0.09) }]}>
                <AppText variant="caption" color={theme.ink}>{word}</AppText>
              </View>
            ))}
          </View>
        </PromptCard>
      ))}

      {!completed ? (
        <View style={[styles.active, { borderColor: theme.accent, backgroundColor: alpha(theme.surface, 0.72) }]}>
          <AppText variant="label" color={theme.accentText}>{PORTAL_TEXT.portal(columns.length + 1)}</AppText>
          <AppText style={[styles.seed, { color: theme.ink }]}>{seed}</AppText>
          <AppText variant="caption" color={theme.inkSoft}>{PORTAL_TEXT.progress(entries.length)}</AppText>
          <GameField theme={theme} value={draft} onChangeText={setDraft} placeholder={PORTAL_TEXT.associationPlaceholder} label={PORTAL_TEXT.associationLabel} style={{ marginTop: spacing.sm }} />
          <View style={styles.buttons}>
            <Button label={PORTAL_TEXT.add} small onPress={() => add(draft)} disabled={!draft.trim()} accent={theme.accent} accentInk={theme.accentInk} />
            <Button label={suggestion ? PORTAL_TEXT.suggestionAction(suggestion) : PORTAL_TEXT.suggestion} tone="secondary" small onPress={() => (suggestion ? add(suggestion) : suggest())} accent={theme.accentText} accentInk={theme.accentInk} />
          </View>
          {suggestion ? (
            <Button label={PORTAL_TEXT.anotherSuggestion} tone="secondary" small onPress={suggest} accent={theme.accentText} accentInk={theme.accentInk} style={{ marginTop: spacing.sm }} />
          ) : null}
        </View>
      ) : (
        <Note theme={theme}>{PORTAL_TEXT.completed}</Note>
      )}

      <View style={styles.buttons}>
        <Button label={PORTAL_TEXT.restart} tone="secondary" small onPress={() => { setColumns([]); setEntries([]); setDraft(''); setSuggestion(''); void drawSeed(); }} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  active: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md },
  seed: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, marginTop: 2, marginBottom: 4 },
  wordWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: 8, paddingVertical: 4 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
});
