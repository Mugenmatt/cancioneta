import { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { Sheet } from '@/design/components/Sheet';
import { EDITOR_TEXT } from '@/content/editor';
import { EditorSurface } from '@/editor/editorSurface';
import { StimulusPanel } from '@/editor/StimulusPanel';
import { alpha, fontSizes, fonts, hitSlop, lineHeights, minTouch, motion, radii, spacing } from '@/design/tokens';
import { SECTION_NAMES, useLyricsStore } from '@/stores/lyricsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { SongSection } from '@/core/types';

export default function WriteScreen() {
  const { colors } = useCoreTheme();
  const {
    sections, activeSectionId, setActiveSection, addSection, removeSection, renameSection, moveSection,
    addStanza, removeStanza, updateStanza, clear, snapshot, words, exportText,
    undo, redo, markExported, past, future, exported,
  } = useLyricsStore();
  const includeStructure = useSettingsStore((s) => s.includeStructure);
  const setIncludeStructure = useSettingsStore((s) => s.setIncludeStructure);
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState<SongSection | null>(null);
  const [renameText, setRenameText] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [writing, setWriting] = useState(false);

  const totalWords = words();
  const lineCount = snapshot().lines.length;
  const exportValue = exportText(includeStructure);

  const copy = async () => {
    if (!exportValue.trim()) return;
    await Clipboard.setStringAsync(exportValue);
    markExported();
    setCopied(true);
    setTimeout(() => setCopied(false), motion.slow * 3);
  };

  const share = async () => {
    if (!exportValue.trim()) return;
    try {
      const result = await Share.share({ title: EDITOR_TEXT.shareTitle, message: exportValue });
      if (result?.action !== Share.dismissedAction) markExported();
      setExportOpen(false);
    } catch (error) {
      const cancelled = typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
      if (cancelled) return;
      Alert.alert(EDITOR_TEXT.shareErrorTitle, EDITOR_TEXT.shareErrorMessage);
    }
  };

  const confirmClear = () => {
    Alert.alert(EDITOR_TEXT.clearTitle, EDITOR_TEXT.clearMessage, [
      { text: EDITOR_TEXT.cancel, style: 'cancel' },
      { text: EDITOR_TEXT.clearAction, style: 'destructive', onPress: () => { clear(); setExportOpen(false); } },
    ]);
  };

  return (
    <EditorSurface writing={writing} focusMode={focusMode}>
      {focusMode ? (
        <View style={styles.focusBar}>
          <AppText variant="label" color={colors.accentCore}>{EDITOR_TEXT.focusLabel}</AppText>
          <Button
            label={EDITOR_TEXT.exitFocus}
            accessibilityHint={EDITOR_TEXT.focusOff}
            tone="secondary"
            small
            onPress={() => setFocusMode(false)}
          />
        </View>
      ) : (
        <>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <AppText variant="label" color={colors.accentCore}>{EDITOR_TEXT.notebook}</AppText>
              <AppText variant="title" style={{ marginTop: spacing.xxs }}>{EDITOR_TEXT.title}</AppText>
              <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xxs / 2 }}>
                {EDITOR_TEXT.stats(totalWords, lineCount)}
              </AppText>
              {!exported && totalWords > 0 ? (
                <View style={[styles.dirty, { backgroundColor: alpha(colors.stateWarning, 0.14) }]}>
                  <Feather name="upload-cloud" size={fontSizes.caption} color={colors.stateWarning} />
                  <AppText variant="caption" color={colors.stateWarning} style={{ marginLeft: spacing.xxs, fontFamily: fonts.sansSemiBold }}>
                    {EDITOR_TEXT.notExported}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.dock}>
            <Button
              label={EDITOR_TEXT.addSection}
              tone="secondary"
              small
              onPress={() => setAddOpen(true)}
              icon={<Feather name="plus" size={fontSizes.small} color={colors.accentCore} />}
            />
            <View style={{ flex: 1 }} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={EDITOR_TEXT.undo}
              accessibilityState={{ disabled: past.length === 0 }}
              disabled={past.length === 0}
              onPress={undo}
              style={[styles.mini, { borderColor: colors.lineSubtle }, past.length === 0 && styles.disabled]}
            >
              <Feather name="rotate-ccw" size={fontSizes.small} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={EDITOR_TEXT.redo}
              accessibilityState={{ disabled: future.length === 0 }}
              disabled={future.length === 0}
              onPress={redo}
              style={[styles.mini, { borderColor: colors.lineSubtle }, future.length === 0 && styles.disabled]}
            >
              <Feather name="rotate-cw" size={fontSizes.small} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={EDITOR_TEXT.focusOn}
              onPress={() => setFocusMode(true)}
              style={[styles.mini, { borderColor: colors.lineSubtle }]}
            >
              <Feather name="eye-off" size={fontSizes.body} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={EDITOR_TEXT.exportLetter}
              onPress={() => setExportOpen(true)}
              style={[styles.mini, { borderColor: colors.lineSubtle }]}
            >
              <Feather name="share" size={fontSizes.body} color={colors.textSecondary} />
            </Pressable>
          </View>

          <StimulusPanel />
        </>
      )}

      {sections.map((section, index) => {
        const active = activeSectionId === section.id;
        return (
          <View
            key={section.id}
            style={[styles.section, {
              borderColor: active ? colors.accentCore : colors.lineSubtle,
              backgroundColor: colors.bgRaised,
            }]}
          >
            <View style={styles.sectionHead}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={EDITOR_TEXT.renameSection(section.name)}
                accessibilityState={{ disabled: focusMode }}
                disabled={focusMode}
                onPress={() => { setRenaming(section); setRenameText(section.name); }}
                style={{ flex: 1 }}
              >
                <AppText variant="caption" color={colors.accentCore} style={{ fontFamily: fonts.sansSemiBold, fontSize: fontSizes.caption }}>
                  {EDITOR_TEXT.kindLabels[section.kind]}
                </AppText>
                <AppText style={{ fontFamily: fonts.display, fontSize: fontSizes.lead, lineHeight: fontSizes.lead * lineHeights.title, marginTop: spacing.xxs / 2 }}>
                  {section.name}
                </AppText>
              </Pressable>
              {focusMode ? null : (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={EDITOR_TEXT.moveSectionUp(section.name)}
                    accessibilityState={{ disabled: index === 0 }}
                    disabled={index === 0}
                    onPress={() => moveSection(section.id, -1)}
                    style={[styles.mini, { borderColor: colors.lineSubtle }, index === 0 && styles.disabled]}
                  >
                    <Feather name="arrow-up" size={fontSizes.small} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={EDITOR_TEXT.moveSectionDown(section.name)}
                    accessibilityState={{ disabled: index === sections.length - 1 }}
                    disabled={index === sections.length - 1}
                    onPress={() => moveSection(section.id, 1)}
                    style={[styles.mini, { borderColor: colors.lineSubtle }, index === sections.length - 1 && styles.disabled]}
                  >
                    <Feather name="arrow-down" size={fontSizes.small} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={EDITOR_TEXT.addStanza(section.name)}
                    onPress={() => addStanza(section.id)}
                    style={[styles.mini, { borderColor: colors.lineSubtle }]}
                  >
                    <Feather name="plus" size={fontSizes.small} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={EDITOR_TEXT.removeSection(section.name)}
                    onPress={() => removeSection(section.id)}
                    style={[styles.mini, { borderColor: colors.lineSubtle }]}
                  >
                    <Feather name="trash-2" size={fontSizes.small} color={colors.textMuted} />
                  </Pressable>
                </>
              )}
            </View>

            {section.stanzas.map((stanza, index) => (
              <View key={stanza.id} style={styles.stanza}>
                {section.stanzas.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={EDITOR_TEXT.removeStanza}
                    hitSlop={hitSlop}
                    onPress={() => removeStanza(section.id, stanza.id)}
                    style={styles.stanzaRemove}
                  >
                    <Feather name="x" size={fontSizes.caption} color={colors.textMuted} />
                  </Pressable>
                ) : null}
                <TextInput
                  value={stanza.text}
                  onChangeText={(text) => updateStanza(section.id, stanza.id, text)}
                  onFocus={() => { setActiveSection(section.id); setWriting(true); }}
                  onBlur={() => setWriting(false)}
                  placeholder={EDITOR_TEXT.stanzaPlaceholder(index === 0)}
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel={EDITOR_TEXT.stanzaLabel(index, section.name)}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, { color: colors.textPrimary, fontFamily: fonts.serif }]}
                />
              </View>
            ))}
          </View>
        );
      })}

      {focusMode ? null : (
        <View style={[styles.privacy, { borderColor: colors.lineSubtle }]}>
          <Feather name="lock" size={fontSizes.small} color={colors.accentCore} />
          <AppText variant="caption" color={colors.textMuted} style={{ flex: 1, marginLeft: spacing.xs }}>
            {EDITOR_TEXT.privacyNote}
          </AppText>
        </View>
      )}

      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title={EDITOR_TEXT.addSheetTitle}>
        <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
          {EDITOR_TEXT.addSheetMessage}
        </AppText>
        <View style={styles.pillRow}>
          {SECTION_NAMES.map((entry) => (
            <Pill
              key={entry.kind}
              label={entry.name}
              onPress={() => { addSection(entry.kind); setAddOpen(false); }}
            />
          ))}
        </View>
      </Sheet>

      <Sheet visible={exportOpen} onClose={() => setExportOpen(false)} title={EDITOR_TEXT.exportSheetTitle}>
        <AppText variant="caption" color={colors.textMuted}>
          {EDITOR_TEXT.exportSheetMessage}
        </AppText>
        <View style={[styles.exportPreview, { borderColor: colors.lineSubtle }]}>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={3}>
            {exportValue.trim() ? exportValue : EDITOR_TEXT.emptyExport}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={EDITOR_TEXT.includeStructure}
          accessibilityState={{ checked: includeStructure }}
          onPress={() => setIncludeStructure(!includeStructure)}
          style={styles.switchRow}
        >
          <AppText variant="body" style={{ flex: 1 }}>{EDITOR_TEXT.includeStructure}</AppText>
          <View style={[styles.switch, { backgroundColor: includeStructure ? colors.accentCore : colors.lineStrong }]}>
            <View style={[styles.knob, {
              backgroundColor: colors.bgRaised,
              transform: [{ translateX: includeStructure ? SWITCH_WIDTH - KNOB_SIZE - KNOB_INSET : KNOB_INSET }],
            }]} />
          </View>
        </Pressable>
        <View style={styles.exportActions}>
          <Button label={EDITOR_TEXT.share} onPress={() => void share()} disabled={!exportValue.trim()} />
          <Button label={copied ? EDITOR_TEXT.copied : EDITOR_TEXT.copy} tone="secondary" onPress={() => void copy()} disabled={!exportValue.trim()} />
        </View>
        <Button label={EDITOR_TEXT.clearNotebook} tone="danger" onPress={confirmClear} style={{ marginTop: spacing.md }} />
      </Sheet>

      <Sheet visible={Boolean(renaming)} onClose={() => setRenaming(null)} title={EDITOR_TEXT.renameSheetTitle}>
        <TextInput
          value={renameText}
          onChangeText={setRenameText}
          accessibilityLabel={EDITOR_TEXT.sectionNameLabel}
          style={[styles.renameInput, { color: colors.textPrimary, borderColor: colors.lineSubtle, fontFamily: fonts.serif }]}
          autoFocus
        />
        <Button
          label={EDITOR_TEXT.save}
          onPress={() => {
            if (renaming && renameText.trim()) renameSection(renaming.id, renameText.trim());
            setRenaming(null);
          }}
          style={{ marginTop: spacing.md }}
        />
      </Sheet>
    </EditorSurface>
  );
}

const SWITCH_WIDTH = spacing.xl + spacing.xs;
const SWITCH_HEIGHT = spacing.lg;
const KNOB_SIZE = spacing.lg - spacing.xxs;
const KNOB_INSET = spacing.xxs / 2;

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  focusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  dirty: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: radii.chip, paddingHorizontal: spacing.xs, paddingVertical: KNOB_INSET, marginTop: spacing.xs },
  disabled: { opacity: 0.55 },
  dock: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.xs },
  section: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginBottom: spacing.sm },
  mini: { width: minTouch, height: minTouch, borderRadius: radii.chip, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stanza: { position: 'relative', marginTop: spacing.xs },
  stanzaRemove: { position: 'absolute', right: spacing.xxs, top: KNOB_INSET, zIndex: 2, width: minTouch / 2, height: minTouch / 2, alignItems: 'center', justifyContent: 'center' },
  input: { fontSize: fontSizes.reading, lineHeight: fontSizes.reading * lineHeights.reading, minHeight: spacing.xxl * 2, paddingTop: spacing.xs, paddingRight: spacing.lg, paddingBottom: spacing.xs },
  privacy: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.xs },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  exportPreview: { borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, marginTop: spacing.md, minHeight: spacing.xxl + spacing.lg },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: minTouch + spacing.xs, marginTop: spacing.sm },
  switch: { width: SWITCH_WIDTH, height: SWITCH_HEIGHT, borderRadius: SWITCH_HEIGHT / 2, justifyContent: 'center' },
  knob: { width: KNOB_SIZE, height: KNOB_SIZE, borderRadius: KNOB_SIZE / 2 },
  exportActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  renameInput: { borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: fontSizes.reading },
});
