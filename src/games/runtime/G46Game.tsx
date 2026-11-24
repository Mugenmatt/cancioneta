import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, spacing } from '@/design/tokens';
import { G46_SECTION_SIZES, G46_TEXT } from '@/content/games/g46';
import { randomService } from '@/services/random/RandomService';
import {
  assembledText, authorForTurn, canReveal, makeDuoStimulus, previousVerse,
  setupLabel, structuredVerses, type DuoSetup, type DuoVerse,
} from './g46Logic';
import { ActionBar, GameField, MiniButton, Note, PromptCard } from './ui';

type Phase = 'setup' | 'turn' | 'handoff' | 'reveal';

const EMPTY_SETUP: DuoSetup = { nameA: '', nameB: '', topic: '' };

export function G46Game() {
  const theme = useGameTheme('g46');
  const [phase, setPhase] = useState<Phase>('setup');
  const [setup, setSetup] = useState<DuoSetup>(EMPTY_SETUP);
  const [verses, setVerses] = useState<DuoVerse[]>([]);
  const [draft, setDraft] = useState('');

  const turn = verses.length;
  const author = authorForTurn(turn);
  const authorName = setupLabel(setup, author);

  const drawTopic = async () => {
    const [item] = await randomService.draw('themes', 1);
    if (item) setSetup((current) => ({ ...current, topic: item.text }));
  };

  const start = () => {
    setVerses([]);
    setDraft('');
    setPhase('turn');
  };

  const saveVerse = () => {
    const text = draft.trim();
    if (!text) return;
    setVerses((current) => [...current, { author: authorForTurn(current.length), text }]);
    setDraft('');
    setPhase('handoff');
  };

  const continueTurn = () => setPhase(canReveal(verses) ? 'reveal' : 'turn');
  const sections = structuredVerses(verses, setup);
  const ready = canReveal(verses);

  return (
    <View>
      <Note theme={theme}>{G46_TEXT.intro}</Note>

      {phase === 'setup' ? (
        <PromptCard theme={theme} eyebrow={G46_TEXT.setupEyebrow}>
          <GameField
            theme={theme}
            label={G46_TEXT.nameA}
            value={setup.nameA}
            onChangeText={(nameA) => setSetup((current) => ({ ...current, nameA }))}
            placeholder={G46_TEXT.nameA}
          />
          <View style={styles.spaced} />
          <GameField
            theme={theme}
            label={G46_TEXT.nameB}
            value={setup.nameB}
            onChangeText={(nameB) => setSetup((current) => ({ ...current, nameB }))}
            placeholder={G46_TEXT.nameB}
          />
          <View style={styles.spaced} />
          <GameField
            theme={theme}
            label={G46_TEXT.topicEyebrow}
            value={setup.topic}
            onChangeText={(topic) => setSetup((current) => ({ ...current, topic }))}
            placeholder={G46_TEXT.topicPlaceholder}
          />
          <View style={styles.row}>
            <MiniButton label={G46_TEXT.drawTopic} icon="refresh-cw" theme={theme} onPress={() => void drawTopic()} />
          </View>
          <Button
            label={G46_TEXT.start}
            small
            onPress={start}
            accent={theme.accent}
            accentInk={theme.accentInk}
            style={styles.spaced}
          />
        </PromptCard>
      ) : null}

      {phase === 'turn' ? (
        <View style={styles.block}>
          <AppText variant="label" color={theme.accentText}>{G46_TEXT.turnEyebrow(turn + 1)}</AppText>
          <AppText variant="caption" color={theme.inkSoft}>{G46_TEXT.turnAuthor(authorName)}</AppText>
          <PromptCard theme={theme} eyebrow={G46_TEXT.previousEyebrow} style={styles.card}>
            <AppText style={styles.verse}>{previousVerse(verses, turn) || G46_TEXT.noPrevious}</AppText>
          </PromptCard>
          <GameField
            theme={theme}
            label={G46_TEXT.yourVerse}
            value={draft}
            onChangeText={setDraft}
            placeholder={G46_TEXT.yourVersePlaceholder}
            multiline
            style={styles.card}
          />
          <Button
            label={G46_TEXT.confirmVerse}
            small
            disabled={!draft.trim()}
            onPress={saveVerse}
            accent={theme.accent}
            accentInk={theme.accentInk}
            style={styles.card}
          />
        </View>
      ) : null}

      {phase === 'handoff' ? (
        <PromptCard theme={theme} eyebrow={G46_TEXT.handoffEyebrow} style={styles.card}>
          <AppText style={styles.verse}>{G46_TEXT.handoff(authorName)}</AppText>
          <Button
            label={G46_TEXT.handoffReady}
            small
            onPress={continueTurn}
            accent={theme.accent}
            accentInk={theme.accentInk}
            style={styles.spaced}
          />
        </PromptCard>
      ) : null}

      {phase === 'reveal' && ready ? (
        <View style={styles.block}>
          <AppText variant="label" color={theme.accentText}>{G46_TEXT.revealEyebrow}</AppText>
          <Note theme={theme}>{G46_TEXT.revealNote}</Note>
          <Note theme={theme}>
            {G46_TEXT.structureNote([
              G46_SECTION_SIZES.verse,
              G46_SECTION_SIZES.preChorus,
              G46_SECTION_SIZES.chorus,
            ])}
          </Note>
          {verses.map((verse, index) => (
            <View key={index} style={[styles.revealed, { borderColor: alpha(theme.accent, 0.35) }]}>
              <AppText style={styles.verse}>{setupLabel(setup, verse.author)}: {verse.text}</AppText>
            </View>
          ))}
          <ActionBar
            text={assembledText(sections)}
            theme={theme}
            stimulus={makeDuoStimulus(setup, sections)}
            sendLabel={G46_TEXT.send}
          />
        </View>
      ) : null}

      <Note theme={theme}>{G46_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.md },
  card: { marginTop: spacing.md },
  spaced: { marginTop: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  verse: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 27 },
  revealed: { borderLeftWidth: 3, paddingLeft: spacing.sm, marginTop: spacing.xs },
});
