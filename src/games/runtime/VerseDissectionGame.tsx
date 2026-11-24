import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { spacing } from '@/design/tokens';
import {
  G39_RESOURCES, G39_TEXT, type G39ResourceId,
} from '@/content/games/g39';
import {
  cleanVerse, makeDissectionStimulus,
} from './g39Logic';
import { ActionBar, GameField, Note } from './ui';

export function VerseDissectionGame() {
  const theme = useGameTheme('g39');
  const [verse, setVerse] = useState('');
  const [resourceId, setResourceId] = useState<G39ResourceId | null>(null);
  const resource = G39_RESOURCES.find((option) => option.id === resourceId);
  const verseText = cleanVerse(verse);
  const stimulus = resource && verseText
    ? makeDissectionStimulus({
      verse: verseText,
      resourceLabel: resource.label,
      title: G39_TEXT.editorTitle(resource.label),
      groupTitles: { verse: G39_TEXT.verseGroup, resource: G39_TEXT.resourceGroup },
      note: G39_TEXT.editorNote,
    })
    : undefined;

  return (
    <View>
      <Note theme={theme}>{G39_TEXT.intro}</Note>

      <GameField
        theme={theme}
        label={G39_TEXT.verseLabel}
        value={verse}
        onChangeText={setVerse}
        placeholder={G39_TEXT.versePlaceholder}
        multiline
        style={styles.field}
      />

      <View style={styles.block}>
        <AppText variant="label" color={theme.accentText}>{G39_TEXT.resourceTitle}</AppText>
        <View style={styles.options}>
          {G39_RESOURCES.map((option) => (
            <Pill
              key={option.id}
              label={option.label}
              selected={resourceId === option.id}
              color={theme.accentText}
              onPress={() => setResourceId(option.id)}
            />
          ))}
        </View>
      </View>

      <ActionBar
        text={resource ? G39_TEXT.consigna(resource.label) : ''}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G39_TEXT.send}
        disabled={!stimulus}
      />
      <Note theme={theme}>{G39_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: spacing.md },
  block: { marginTop: spacing.md },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
});
