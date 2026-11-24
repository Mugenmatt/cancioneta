import { StyleSheet, View } from 'react-native';
import { CHORDS_TEXT, chordsInKeyText } from '@/content/app';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { Pill, SectionLabel } from '@/design/components/Primitives';
import { fonts, spacing } from '@/design/tokens';
import { commonSubstitutions, relatedKeys, secondaryDominants } from '@/music/relations';
import { chordName, diatonicChords, formatChord, type Chord, type Key } from '@/music/theory';

interface ChordsExploreContentProps {
  currentKey: Key;
  chords: Chord[];
}

export function ChordsExploreContent({ currentKey, chords }: ChordsExploreContentProps) {
  const { colors } = useCoreTheme();
  const relations = relatedKeys(currentKey);
  const substitutions = commonSubstitutions(currentKey);
  const dominants = secondaryDominants(currentKey);
  const scaleChords = diatonicChords(currentKey).map((d) => chordName(d.root, d.quality));

  return (
    <View>
      <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.sm }}>
        {chordsInKeyText(currentKey.name, scaleChords)}
      </AppText>

      <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.neighborKeys}</SectionLabel>
      <View style={styles.pillRow}>
        {relations.map((key) => <Pill key={key.name} label={key.name} />)}
      </View>

      <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.substitutions}</SectionLabel>
      {substitutions.map((item) => (
        <View key={item.title} style={[styles.relation, { borderColor: colors.lineSubtle }]}>
          <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>{item.title}</AppText>
          <AppText variant="caption" color={colors.accentCore}>{item.chords.join('  →  ')}</AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xxs / 2 }}>{item.detail}</AppText>
        </View>
      ))}

      <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.secondaryDominants}</SectionLabel>
      {dominants.map((item) => (
        <View key={item.title} style={[styles.relation, { borderColor: colors.lineSubtle }]}>
          <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>{item.title}</AppText>
          <AppText variant="caption" color={colors.accentCore}>{item.chords.join('  →  ')}</AppText>
        </View>
      ))}

      <SectionLabel color={colors.textMuted}>{CHORDS_TEXT.currentProgression}</SectionLabel>
      <AppText variant="body" color={colors.textSecondary}>
        {chords.map((chord) => formatChord(chord)).join('  ·  ')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  relation: { borderTopWidth: 1, paddingVertical: spacing.sm, marginBottom: spacing.xs },
});
