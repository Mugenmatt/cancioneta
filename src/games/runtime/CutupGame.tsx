import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { ActionBar, GameField, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { CUTUP_TEXT } from '@/content/games/g28-g29';
import { cutUpFragments } from './logic';
import { alpha, fonts, radii, spacing } from '@/design/tokens';

interface Fragment { id: string; text: string; locked: boolean; }

export function CutupGame() {
  const theme = useGameTheme('g29');
  const [mode, setMode] = useState<'casa' | 'propio'>('casa');
  const [source, setSource] = useState('');
  const [own, setOwn] = useState('');
  const [fragments, setFragments] = useState<Fragment[]>([]);

  const drawSource = async () => {
    const [item] = await randomService.draw('cutup_texts', 1);
    setSource(item?.text ?? '');
  };

  useEffect(() => { void Promise.resolve().then(() => { void drawSource(); }); }, []);

  const cut = () => {
    const text = mode === 'casa' ? source : own;
    const pieces = cutUpFragments(text).map((piece, index) => ({ id: `f-${index}-${piece}`, text: piece, locked: false }));
    setFragments(randomService.shuffle(pieces));
  };

  const shuffleUnlocked = () => {
    setFragments((current) => {
      const unlocked = current.filter((fragment) => !fragment.locked);
      const shuffled = randomService.shuffle(unlocked);
      let cursor = 0;
      return current.map((fragment) => (fragment.locked ? fragment : shuffled[cursor++]));
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    setFragments((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length || current[index].locked || current[target].locked) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const toggleLock = (index: number) => {
    setFragments((current) => current.map((fragment, i) => (i === index ? { ...fragment, locked: !fragment.locked } : fragment)));
  };

  const body = fragments.map((fragment) => fragment.text).join(' ');
  return (
    <View>
      <Note theme={theme}>{CUTUP_TEXT.intro}</Note>
      <View style={styles.pills}>
        <Pill label={CUTUP_TEXT.houseMode} selected={mode === 'casa'} onPress={() => setMode('casa')} color={theme.accentText} />
        <Pill label={CUTUP_TEXT.ownMode} selected={mode === 'propio'} onPress={() => setMode('propio')} color={theme.accentText} />
      </View>
      {mode === 'casa' ? (
        <View style={[styles.source, { borderColor: alpha(theme.ink, 0.18), backgroundColor: alpha(theme.surface, 0.6) }]}>
          <AppText style={[styles.sourceText, { color: theme.inkSoft }]}>{source || CUTUP_TEXT.searching}</AppText>
          <Button label={CUTUP_TEXT.anotherText} tone="secondary" small onPress={() => void drawSource()} accent={theme.accentText} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
        </View>
      ) : (
        <GameField theme={theme} label={CUTUP_TEXT.ownLabel} value={own} onChangeText={setOwn} placeholder={CUTUP_TEXT.ownPlaceholder} multiline style={{ marginTop: spacing.md }} />
      )}
      <View style={styles.buttons}>
        <Button label={CUTUP_TEXT.cutAndShuffle} small onPress={cut} disabled={mode === 'casa' ? !source : !own.trim()} accent={theme.accent} accentInk={theme.accentInk} />
        <Button label={CUTUP_TEXT.shuffleAgain} tone="secondary" small onPress={shuffleUnlocked} disabled={fragments.length === 0} accent={theme.accentText} accentInk={theme.accentInk} />
      </View>
      <View style={{ gap: 6, marginTop: spacing.md }}>
        {fragments.map((fragment, index) => (
          <View key={fragment.id} style={[styles.fragment, { borderColor: fragment.locked ? theme.accent : alpha(theme.ink, 0.16), backgroundColor: fragment.locked ? alpha(theme.accent, 0.08) : 'transparent' }]}>
            <AppText style={[styles.fragmentText, { color: theme.ink }]}>{fragment.text}</AppText>
            <View style={styles.fragmentActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={CUTUP_TEXT.moveUp} onPress={() => move(index, -1)} hitSlop={6}><Feather name="arrow-up" size={14} color={theme.inkSoft} /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={CUTUP_TEXT.moveDown} onPress={() => move(index, 1)} hitSlop={6}><Feather name="arrow-down" size={14} color={theme.inkSoft} /></Pressable>
              <Pressable accessibilityRole="switch" accessibilityLabel={fragment.locked ? CUTUP_TEXT.unlock : CUTUP_TEXT.lock} accessibilityState={{ checked: fragment.locked }} onPress={() => toggleLock(index)} hitSlop={6}>
                <Feather name={fragment.locked ? 'lock' : 'unlock'} size={14} color={fragment.locked ? theme.accent : theme.inkSoft} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  source: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md },
  sourceText: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  fragment: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radii.field, padding: 8 },
  fragmentText: { flex: 1, fontFamily: fonts.serif, fontSize: 15, lineHeight: 21 },
  fragmentActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
