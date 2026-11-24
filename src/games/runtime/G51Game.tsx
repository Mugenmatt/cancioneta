import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { useCoreTheme, useGameTheme } from '@/design/ThemeProvider';
import { alpha, spacing } from '@/design/tokens';
import {
  G51_FREE_DEFAULT, G51_MOLDS, G51_TEXT,
  type G51MoldId,
} from '@/content/games/g51';
import {
  assembledText, clampFreeLimit, countSyllables, lineStatus, makeStimulus,
  moldLengths, resolvedCount,
} from './g51Logic';
import { ActionBar, GameField, MiniButton, Note, PromptCard, runtimeStyles } from './ui';

const EMPTY_LINES = ['', '', '', ''];
const EMPTY_MANUAL: (number | null)[] = [null, null, null, null];

export function G51Game() {
  const theme = useGameTheme('g51');
  const { colors } = useCoreTheme();
  const [moldId, setMoldId] = useState<G51MoldId>('8-8-8-8');
  const [freeLimit, setFreeLimit] = useState(G51_FREE_DEFAULT);
  const [lines, setLines] = useState<string[]>(EMPTY_LINES);
  const [manual, setManual] = useState<(number | null)[]>(EMPTY_MANUAL);

  const limit = clampFreeLimit(freeLimit);
  const expected = moldLengths(moldId, limit);
  const counts = lines.map(countSyllables);
  const moldLabel = G51_MOLDS.find((mold) => mold.id === moldId)?.label ?? '';
  const statuses = lines.map((line, index) =>
    lineStatus(counts[index], expected?.[index] ?? null, manual[index], limit),
  );
  const statusLabel = (status: typeof statuses[number]) => status === 'match'
    ? G51_TEXT.matches
    : status === 'mismatch' ? G51_TEXT.mismatch : G51_TEXT.overLimit;
  const hasLines = lines.some((line) => line.trim());
  const stimulus = hasLines
    ? makeStimulus(moldLabel, lines, lines.map((_, index) => resolvedCount(counts[index], manual[index])))
    : undefined;

  const setLine = (index: number, value: string) =>
    setLines((current) => current.map((line, i) => i === index ? value : line));
  const setManualCount = (index: number, value: string) => {
    const parsed = Number(value.replace(/\D/g, ''));
    setManual((current) => current.map((item, i) => i === index ? (parsed > 0 ? parsed : null) : item));
  };

  return (
    <View>
      <Note theme={theme}>{G51_TEXT.intro}</Note>

      <PromptCard theme={theme} eyebrow={G51_TEXT.moldEyebrow}>
        <View style={runtimeStyles.row}>
          {G51_MOLDS.map((mold) => (
            <MiniButton
              key={mold.id}
              label={mold.id === moldId ? `✓ ${mold.label}` : mold.label}
              theme={theme}
              onPress={() => setMoldId(mold.id)}
            />
          ))}
        </View>
        {moldId === 'free' ? (
          <View style={styles.block}>
            <AppText variant="label" color={theme.accentText}>{G51_TEXT.freeLimit(limit)}</AppText>
            <View style={runtimeStyles.row}>
              <MiniButton
                label={G51_TEXT.lessLimit}
                icon="minus"
                theme={theme}
                onPress={() => setFreeLimit((current) => clampFreeLimit(current - 1))}
              />
              <MiniButton
                label={G51_TEXT.moreLimit}
                icon="plus"
                theme={theme}
                onPress={() => setFreeLimit((current) => clampFreeLimit(current + 1))}
              />
            </View>
          </View>
        ) : null}
      </PromptCard>

      {lines.map((line, index) => {
        const reference = expected?.[index] ?? null;
        const status = statuses[index];
        const color = status === 'match' ? colors.stateSuccess : colors.stateError;
        return (
          <View key={index} style={[styles.verse, { borderColor: alpha(color, 0.45) }]}>
            <AppText variant="label" color={theme.accentText}>{G51_TEXT.verseEyebrow(index + 1)}</AppText>
            <GameField
              theme={theme}
              value={line}
              onChangeText={(value) => setLine(index, value)}
              placeholder={G51_TEXT.verseEyebrow(index + 1)}
              multiline
              style={styles.field}
            />
            <View style={runtimeStyles.row}>
              <AppText variant="caption" color={theme.inkSoft}>
                {manual[index] === null
                  ? G51_TEXT.counted(counts[index], reference)
                  : G51_TEXT.manual(manual[index] as number)}
              </AppText>
              <AppText variant="caption" color={color}>{statusLabel(status)}</AppText>
            </View>
            <GameField
              theme={theme}
              label={G51_TEXT.correctionLabel(index + 1)}
              value={manual[index] === null ? '' : String(manual[index])}
              onChangeText={(value) => setManualCount(index, value)}
              placeholder={G51_TEXT.approximate}
            />
          </View>
        );
      })}

      <View style={runtimeStyles.row}>
        <MiniButton
          label={G51_TEXT.resetCorrections}
          icon="refresh-cw"
          theme={theme}
          onPress={() => setManual(EMPTY_MANUAL)}
        />
      </View>

      <ActionBar
        text={assembledText(lines)}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G51_TEXT.send}
        disabled={!hasLines}
      />
      <Note theme={theme}>{G51_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  verse: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginTop: spacing.md,
  },
  field: { marginTop: spacing.xs },
  block: { marginTop: spacing.sm },
});
