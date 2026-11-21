import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ActionBar, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { COLLAGES, COLLAGE_SIZES, COLLAGE_TEXT } from '@/content/games/g28-g29';
import { alpha, fonts, spacing } from '@/design/tokens';

export function CollageGame() {
  const theme = useGameTheme('g28');
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  const choose = () => {
    setIndex(randomService.int(COLLAGES.length));
    setOrder(randomService.shuffle([0, 1, 2, 3, 4, 5]));
  };

  useEffect(() => { void Promise.resolve().then(choose); }, []);
  const collage = COLLAGES[index];
  const words = order.map((position) => collage.words[position]).filter(Boolean);
  const body = COLLAGE_TEXT.body(collage.atmosphere, words);
  return (
    <View>
      <Note theme={theme}>{COLLAGE_TEXT.intro}</Note>
      <View style={[styles.canvas, { backgroundColor: theme.surface, borderColor: alpha(theme.accent, 0.35) }]}>
        <AppText variant="label" color={theme.accentText} style={{ marginBottom: spacing.sm }}>{collage.atmosphere.toUpperCase()}</AppText>
        <View style={styles.words}>
          {words.map((word, i) => (
            <AppText
              key={`${word}-${i}`}
              style={[
                styles.word,
                {
                  color: i % 3 === 0 ? theme.accent : theme.ink,
                  fontSize: COLLAGE_SIZES[i % COLLAGE_SIZES.length],
                  lineHeight: COLLAGE_SIZES[i % COLLAGE_SIZES.length] * 1.05,
                  fontFamily: i % 2 === 0 ? fonts.display : fonts.sansBold,
                  transform: [{ rotate: `${(i % 2 === 0 ? -1 : 1) * (2 + (i % 3))}deg` }],
                },
              ]}
            >
              {word}
            </AppText>
          ))}
        </View>
      </View>
      <Button label={COLLAGE_TEXT.anotherAtmosphere} small onPress={choose} accent={theme.accent} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
      <ActionBar text={body} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { borderWidth: 1, minHeight: 280, padding: spacing.lg, marginTop: spacing.md, justifyContent: 'center' },
  words: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: spacing.sm },
  word: { letterSpacing: -0.5 },
});
