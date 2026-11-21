import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { CHAIN_RULES, CHAIN_TEXT } from '@/content/games/g31';
import {
  buildChainLexicon,
  chainWordKey,
  generateChainGrid,
  isChainAdjacent,
  pathChainWord,
  trimChainPath,
} from './chainLogic';
import { alpha, fonts, radii, spacing } from '@/design/tokens';

const SIZE = CHAIN_RULES.gridSize;
const LEXICON = buildChainLexicon(SIZE);
interface FoundWord { key: string; display: string }

export function LetterChainGame() {
  const theme = useGameTheme('g31');
  const [grid, setGrid] = useState<string[][]>([]);
  const [path, setPath] = useState<{ row: number; col: number }[]>([]);
  const [found, setFound] = useState<FoundWord[]>([]);
  const [message, setMessage] = useState('');
  const [guaranteed, setGuaranteed] = useState(true);

  const generate = useCallback(() => {
    const result = generateChainGrid(LEXICON, SIZE, CHAIN_RULES.minimumWords, randomService);
    setGrid(result.grid);
    setPath([]);
    setFound([]);
    setMessage('');
    setGuaranteed(result.guaranteed);
  }, []);

  useEffect(() => { void Promise.resolve().then(generate); }, [generate]);

  const press = (row: number, col: number) => {
    setMessage('');
    setPath((current) => {
      if (current.some((cell) => cell.row === row && cell.col === col)) return trimChainPath(current, row, col);
      const last = current[current.length - 1];
      if (last && !isChainAdjacent(last, { row, col })) return [{ row, col }];
      if (current.length >= SIZE) return current;
      return [...current, { row, col }];
    });
  };

  const check = () => {
    const raw = chainWordKey(pathChainWord(grid, path));
    const display = LEXICON.byKey.get(raw);
    if (raw.length < 3) { setMessage(CHAIN_TEXT.minLetters); return; }
    if (!display) { setMessage(CHAIN_TEXT.notInDictionary(raw)); return; }
    if (found.some((entry) => entry.key === raw)) { setMessage(CHAIN_TEXT.duplicate); setPath([]); return; }
    setFound((current) => [...current, { key: raw, display }]);
    setPath([]);
    setMessage(CHAIN_TEXT.success(display.toUpperCase()));
  };

  const body = found.map((entry) => entry.display).join(', ');
  return (
    <View>
      <Note theme={theme}>{CHAIN_TEXT.intro} {guaranteed ? CHAIN_TEXT.guaranteedWords(CHAIN_RULES.minimumWords) : CHAIN_TEXT.notEnoughWords(CHAIN_RULES.minimumWords)}</Note>
      <View style={[styles.grid, { borderColor: alpha(theme.ink, 0.18) }]}>
        {grid.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((letter, c) => {
              const active = path.some((cell) => cell.row === r && cell.col === c);
              return (
                <Pressable
                  key={`${r}-${c}`}
                  accessibilityRole="button"
                  accessibilityLabel={CHAIN_TEXT.letter(letter)}
                  onPress={() => press(r, c)}
                  style={[styles.cell, { borderColor: active ? theme.accent : alpha(theme.ink, 0.12), backgroundColor: active ? alpha(theme.accent, 0.2) : alpha(theme.surface, 0.5) }]}
                >
                  <AppText style={[styles.letter, { color: theme.ink }]}>{letter.toUpperCase()}</AppText>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <View style={[styles.current, { borderColor: alpha(theme.ink, 0.16) }]}>
        <AppText variant="label" color={theme.accentText}>{CHAIN_TEXT.currentTitle}</AppText>
        <AppText style={[styles.currentWord, { color: theme.ink }]}>{pathChainWord(grid, path).toUpperCase() || CHAIN_TEXT.empty}</AppText>
      </View>
      {message ? <AppText variant="caption" color={theme.accentText} style={{ marginTop: 6 }}>{message}</AppText> : null}
      <View style={styles.buttons}>
        <Button label={CHAIN_TEXT.check} small onPress={check} disabled={path.length < 3} accent={theme.accent} accentInk={theme.accentInk} />
        <Button label={CHAIN_TEXT.clear} tone="secondary" small onPress={() => setPath([])} accent={theme.accentText} accentInk={theme.accentInk} />
        <Button label={CHAIN_TEXT.newGrid} tone="secondary" small onPress={generate} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <View style={[styles.found, { borderColor: alpha(theme.ink, 0.16) }]}>
        <AppText variant="label" color={theme.accentText}>{CHAIN_TEXT.foundTitle}</AppText>
        <View style={styles.foundWrap}>
          {found.map((word) => (
            <View key={word.key} style={[styles.foundChip, { backgroundColor: alpha(theme.accent, 0.12) }]}>
              <AppText variant="caption" color={theme.ink}>{word.display}</AppText>
            </View>
          ))}
          {found.length === 0 ? <AppText variant="caption" color={theme.inkSoft}>{CHAIN_TEXT.noWordsYet}</AppText> : null}
        </View>
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { borderWidth: 1, borderRadius: radii.card, padding: 6, marginTop: spacing.md, gap: 4 },
  gridRow: { flexDirection: 'row', gap: 4 },
  cell: { flex: 1, aspectRatio: 1, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: fonts.sansBold, fontSize: 16 },
  current: { borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: spacing.sm, marginTop: spacing.md },
  currentWord: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: 2 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  found: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md },
  foundWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  foundChip: { borderRadius: radii.chip, paddingHorizontal: 9, paddingVertical: 4 },
});
