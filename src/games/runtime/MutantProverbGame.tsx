import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G49_STANZA_COUNTS, G49_TEXT } from '@/content/games/g49';
import {
  assembleStanzas, makeMutantStimulus, writtenStanzas,
} from './g49Logic';
import { ActionBar, GameField, Note } from './ui';

export function MutantProverbGame() {
  const theme = useGameTheme('g49');
  const [item, setItem] = useState<PoolItem | null>(null);
  const [count, setCount] = useState<number>(G49_STANZA_COUNTS[0]);
  const [stanzas, setStanzas] = useState<string[]>(() => G49_STANZA_COUNTS.map(() => ''));

  const draw = async () => {
    const [next] = await randomService.draw('mutant_proverbs', 1);
    setItem(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void draw(); }); }, []);

  const phrase = item?.text ?? '';
  const stimulus = phrase
    ? makeMutantStimulus({
      phrase,
      title: G49_TEXT.editorTitle(phrase),
      groupTitle: G49_TEXT.phraseGroup,
      note: G49_TEXT.editorNote,
      doneLabel: G49_TEXT.checkDone,
      pendingLabel: G49_TEXT.checkPending,
    })
    : undefined;
  const written = writtenStanzas(stanzas.slice(0, count));

  const update = (index: number, value: string) => setStanzas((current) =>
    current.map((text, position) => (position === index ? value : text)));

  return (
    <View>
      <Note theme={theme}>{G49_TEXT.intro}</Note>

      <View style={[styles.banner, { borderColor: theme.accent, backgroundColor: alpha(theme.accent, 0.1) }]}>
        <AppText variant="label" color={theme.accentText}>{G49_TEXT.phraseEyebrow}</AppText>
        <AppText style={[styles.phrase, { color: theme.ink }]}>{phrase || G49_TEXT.loading}</AppText>
        <Button
          label={G49_TEXT.anotherPhrase}
          tone="secondary"
          small
          onPress={() => void draw()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </View>

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G49_TEXT.countEyebrow}</AppText>
        <View style={styles.pills}>
          {G49_STANZA_COUNTS.map((value) => (
            <Pill
              key={value}
              label={G49_TEXT.countLabel(value)}
              selected={count === value}
              color={theme.accentText}
              onPress={() => setCount(value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <AppText variant="caption" color={theme.inkSoft}>{G49_TEXT.writtenCount(written.length, count)}</AppText>
        {stanzas.slice(0, count).map((text, index) => (
          <GameField
            key={index}
            theme={theme}
            label={G49_TEXT.stanzaEyebrow(index)}
            value={text}
            onChangeText={(value) => update(index, value)}
            placeholder={G49_TEXT.stanzaPlaceholder(index, phrase)}
            multiline
            style={styles.field}
          />
        ))}
      </View>

      <ActionBar
        text={assembleStanzas(stanzas.slice(0, count))}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G49_TEXT.send}
        disabled={!stimulus || written.length < count}
      />
      <Note theme={theme}>{G49_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderWidth: 2, borderRadius: 18, padding: spacing.md, marginTop: spacing.md },
  phrase: { fontFamily: fonts.display, fontSize: 29, lineHeight: 36, marginTop: spacing.xs },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  block: { marginTop: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  field: { marginTop: spacing.sm },
});
