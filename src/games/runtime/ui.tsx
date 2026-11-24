import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { alpha, fonts, minTouch, radii, spacing } from '@/design/tokens';
import type { GameTheme } from '@/design/themes';
import { useLyricsStore } from '@/stores/lyricsStore';
import { useStimulusStore } from '@/stores/stimulusStore';
import { COMMON_TEXT } from '@/content/games/common';
import type { StimulusSummary } from '@/core/types';

export function GameIntro({ theme, children }: { theme: GameTheme; children: ReactNode }) {
  return (
    <AppText variant="caption" color={theme.inkSoft} style={styles.intro}>
      {children}
    </AppText>
  );
}

export function ActionBar({ text, theme, sendLabel = COMMON_TEXT.sendToNotebook, stimulus, disabled = false }: {
  text: string;
  theme: GameTheme;
  sendLabel?: string;
  stimulus?: StimulusSummary;
  disabled?: boolean;
}) {
  const router = useRouter();
  const insertStimulus = useLyricsStore((state) => state.insertStimulus);
  const setStimulusPanel = useStimulusStore((state) => state.setStimulusPanel);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!text.trim()) return;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  const send = () => {
    if (!text.trim() || disabled) return;
    if (stimulus) setStimulusPanel(stimulus);
    else insertStimulus(text);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/escribir');
  };

  return (
    <View style={styles.actions}>
      <Button
        label={copied ? COMMON_TEXT.copied : COMMON_TEXT.copy}
        tone="secondary"
        small
        disabled={!text.trim()}
        onPress={() => void copy()}
        accent={theme.accentText}
        accentInk={theme.accentInk}
      />
      <Button
        label={sendLabel}
        small
        disabled={disabled || !text.trim()}
        onPress={send}
        accent={theme.accent}
        accentInk={theme.accentInk}
      />
    </View>
  );
}

export function GameField({ theme, value, onChangeText, placeholder, multiline = false, style, label }: {
  theme: GameTheme;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  return (
    <View style={style}>
      {label ? <AppText variant="label" color={theme.accentText} style={{ marginBottom: 6 }}>{label}</AppText> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.inkSoft}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { color: theme.ink, borderColor: alpha(theme.ink, 0.22), backgroundColor: alpha(theme.surface, 0.72) },
        ]}
      />
    </View>
  );
}

export function MiniButton({ label, onPress, theme, disabled, icon }: {
  label: string;
  onPress: () => void;
  theme: GameTheme;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.mini,
        { borderColor: theme.accentText },
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.6 },
      ]}
    >
      {icon ? <Feather name={icon} size={13} color={theme.accentText} /> : null}
      <AppText variant="caption" color={theme.accentText} style={{ marginLeft: icon ? 5 : 0, fontFamily: fonts.sansSemiBold }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function PromptCard({ theme, eyebrow, children, style }: {
  theme: GameTheme;
  eyebrow: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: alpha(theme.accent, 0.3) }, style]}>
      <AppText variant="label" color={theme.accentText}>{eyebrow}</AppText>
      <View style={{ marginTop: spacing.sm }}>{children}</View>
    </View>
  );
}

export function Note({ theme, children }: { theme: GameTheme; children: ReactNode }) {
  return (
    <AppText variant="caption" color={theme.inkSoft} style={styles.note}>
      {children}
    </AppText>
  );
}

export const runtimeStyles = StyleSheet.create({
  stack: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' },
  block: { marginTop: spacing.md },
  label: { marginBottom: 6 },
  text: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 27 },
  strong: { fontFamily: fonts.display, fontSize: 28, lineHeight: 35 },
});

const styles = StyleSheet.create({
  intro: { lineHeight: 19, marginBottom: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  field: {
    borderWidth: 1, borderRadius: radii.field, minHeight: 46, paddingHorizontal: spacing.sm,
    paddingVertical: 10, fontFamily: fonts.sans, fontSize: 15,
  },
  fieldMultiline: { minHeight: 120, paddingTop: spacing.sm },
  mini: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.chip,
    paddingHorizontal: 10, paddingVertical: 6, minHeight: minTouch,
  },
  card: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md },
  note: { lineHeight: 18, marginTop: spacing.sm },
});
