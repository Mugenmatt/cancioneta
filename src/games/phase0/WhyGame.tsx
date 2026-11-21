import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fontSizes, fonts, lineHeights, radii, spacing } from '@/design/tokens';
import { ActionBar, GameIntro, Note, runtimeStyles } from '@/games/runtime/ui';
import { PHASE0_CONTENT } from '@/content/phase0';

export function WhyGame() {
  const theme = useGameTheme('f0-5');
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const insertQuestion = () => {
    const start = Math.max(0, Math.min(selection.start, text.length));
    const end = Math.max(start, Math.min(selection.end, text.length));
    const before = text.slice(0, start);
    const after = text.slice(end);
    const lead = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
    const insertion = `${lead}${PHASE0_CONTENT.why.question}\n`;
    const next = `${before}${insertion}${after}`;
    const cursor = before.length + insertion.length;
    setText(next);
    setSelection({ start: cursor, end: cursor });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{PHASE0_CONTENT.why.intro}</GameIntro>
      <Note theme={theme}>{PHASE0_CONTENT.why.goal}</Note>
      <Note theme={theme}>{PHASE0_CONTENT.why.shortcutNote}</Note>

      <Button
        label={PHASE0_CONTENT.why.addQuestion}
        small
        onPress={insertQuestion}
        accent={theme.accent}
        accentInk={theme.accentInk}
      />

      <AppText variant="label" color={theme.accentText}>{PHASE0_CONTENT.common.writingLabel}</AppText>
      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={setText}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        placeholder={PHASE0_CONTENT.why.placeholder}
        placeholderTextColor={theme.inkSoft}
        multiline
        textAlignVertical="top"
        style={[styles.field, { color: theme.ink, borderColor: alpha(theme.ink, 0.22), backgroundColor: alpha(theme.surface, 0.72) }]}
      />

      <Note theme={theme}>{PHASE0_CONTENT.common.privacyNote}</Note>
      <ActionBar text={text} theme={theme} sendLabel={PHASE0_CONTENT.why.sendLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: spacing.xxxl * 4,
    borderWidth: 1,
    borderRadius: radii.field,
    padding: spacing.md,
    fontFamily: fonts.serif,
    fontSize: fontSizes.reading,
    lineHeight: fontSizes.reading * lineHeights.reading,
  },
});
