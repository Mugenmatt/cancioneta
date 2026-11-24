import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { fonts, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { G56_TEXT } from '@/content/games/g56';
import {
  assembledLyrics, makeTraitorStimulus, modeFromItem, type ContradictionMode,
} from './g56Logic';
import { ActionBar, GameField, Note, PromptCard } from './ui';

export function TraitorChorusGame() {
  const theme = useGameTheme('g56');
  const [item, setItem] = useState<PoolItem | null>(null);
  const [stanza, setStanza] = useState('');
  const [chorus, setChorus] = useState('');

  const drawMode = async () => {
    const [next] = await randomService.draw('contradiction_modes', 1);
    setItem(next ?? null);
  };
  useEffect(() => { void Promise.resolve().then(() => { void drawMode(); }); }, []);

  const mode: ContradictionMode | null = item ? modeFromItem(item) : null;
  const stimulus = mode && mode.instruction && stanza.trim() && chorus.trim()
    ? makeTraitorStimulus({
      mode,
      stanza,
      chorus,
      title: G56_TEXT.editorTitle(mode.label),
      groupTitles: {
        mode: G56_TEXT.modeGroup,
        stanza: G56_TEXT.stanzaGroup,
        chorus: G56_TEXT.chorusGroup,
      },
      note: G56_TEXT.editorNote,
    })
    : undefined;

  return (
    <View>
      <Note theme={theme}>{G56_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G56_TEXT.modeEyebrow} style={styles.card}>
        <AppText style={[styles.mode, { color: theme.ink }]}>{mode?.label ?? G56_TEXT.loading}</AppText>
        <AppText variant="caption" color={theme.inkSoft} style={styles.instruction}>
          {mode?.instruction ?? G56_TEXT.loading}
        </AppText>
        <Button
          label={G56_TEXT.anotherMode}
          tone="secondary"
          small
          onPress={() => void drawMode()}
          accent={theme.accentText}
          accentInk={theme.accentInk}
          style={styles.button}
        />
      </PromptCard>

      <View style={styles.sideBySide}>
        <View style={styles.half}>
          <PromptCard theme={theme} eyebrow={G56_TEXT.stanzaEyebrow}>
            <GameField
              theme={theme}
              value={stanza}
              onChangeText={setStanza}
              placeholder={G56_TEXT.stanzaPlaceholder}
              multiline
            />
          </PromptCard>
        </View>
        <View style={styles.half}>
          <PromptCard theme={theme} eyebrow={G56_TEXT.chorusEyebrow}>
            <GameField
              theme={theme}
              value={chorus}
              onChangeText={setChorus}
              placeholder={G56_TEXT.chorusPlaceholder}
              multiline
            />
          </PromptCard>
        </View>
      </View>

      <ActionBar
        text={assembledLyrics(stanza, chorus)}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G56_TEXT.send}
        disabled={!stimulus}
      />
      <Note theme={theme}>{G56_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md },
  mode: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30 },
  instruction: { marginTop: spacing.xs },
  button: { alignSelf: 'flex-start', marginTop: spacing.sm },
  sideBySide: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  half: { flex: 1 },
});
