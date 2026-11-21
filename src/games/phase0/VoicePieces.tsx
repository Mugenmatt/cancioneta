import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { GameTheme } from '@/design/themes';
import { AppText } from '@/design/components/Text';
import { alpha, fontSizes, fonts, lineHeights, radii, spacing } from '@/design/tokens';
import type { Fragment, Phrase } from './logic';
import { PHASE0_CONTENT } from '@/content/phase0';

export function PhraseList({ phrases, theme, onToggle }: {
  phrases: Phrase[];
  theme: GameTheme;
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.list}>
      {phrases.map((phrase) => (
        <Pressable
          key={phrase.id}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: phrase.selected }}
          accessibilityLabel={PHASE0_CONTENT.voice.phraseAccessibility(phrase.selected, phrase.text)}
          onPress={() => onToggle(phrase.id)}
          style={({ pressed }) => [
            styles.row,
            { borderColor: alpha(theme.accent, phrase.selected ? 0.6 : 0.18), backgroundColor: alpha(theme.surface, 0.7) },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name={phrase.selected ? 'check-square' : 'square'} size={fontSizes.body} color={theme.accentText} />
          <AppText style={[styles.phrase, { color: theme.ink }]}>{phrase.text}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

export function FragmentList({ fragments, theme, onEdit }: {
  fragments: Fragment[];
  theme: GameTheme;
  onEdit: (id: string, text: string) => void;
}) {
  return (
    <View style={styles.list}>
      {fragments.map((fragment, index) => (
        <View key={fragment.id} style={[styles.card, { borderColor: alpha(theme.accent, 0.3), backgroundColor: alpha(theme.surface, 0.7) }]}>
          <AppText variant="label" color={theme.accentText}>{PHASE0_CONTENT.voice.fragmentLabel(index + 1)}</AppText>
          <AppText variant="caption" color={theme.inkSoft}>{PHASE0_CONTENT.voice.originalLabel}</AppText>
          <AppText style={[styles.original, { color: theme.inkSoft }]}>{fragment.originalText}</AppText>
          <AppText variant="caption" color={theme.accentText}>{PHASE0_CONTENT.voice.editedLabel}</AppText>
          <TextInput
            value={fragment.editedText}
            onChangeText={(value) => onEdit(fragment.id, value)}
            placeholder={PHASE0_CONTENT.voice.editPlaceholder}
            placeholderTextColor={theme.inkSoft}
            multiline
            textAlignVertical="top"
            style={[styles.input, { color: theme.ink, borderColor: alpha(theme.ink, 0.22) }]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, gap: spacing.sm },
  phrase: { flex: 1, fontFamily: fonts.serif, fontSize: fontSizes.body, lineHeight: fontSizes.body * lineHeights.reading },
  card: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, gap: spacing.xs },
  original: { fontFamily: fonts.serifItalic, fontSize: fontSizes.small, lineHeight: fontSizes.small * lineHeights.body },
  input: { minHeight: spacing.xxxl, borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, fontFamily: fonts.serif, fontSize: fontSizes.body, lineHeight: fontSizes.body * lineHeights.reading },
});
