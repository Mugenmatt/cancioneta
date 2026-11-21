import { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { Sheet } from '@/design/components/Sheet';
import { StimulusPanel } from '@/editor/StimulusPanel';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { SECTION_NAMES, useLyricsStore } from '@/stores/lyricsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { SongSection } from '@/core/types';

const KIND_LABEL: Record<SongSection['kind'], string> = {
  intro: 'Intro', verse: 'Verso', chorus: 'Estribillo', bridge: 'Puente', outro: 'Outro', custom: 'Libre',
};

export default function WriteScreen() {
  const { colors } = useCoreTheme();
  const {
    sections, activeSectionId, setActiveSection, addSection, removeSection, renameSection,
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

  const totalWords = words();
  const lineCount = snapshot().lines.length;
  const exportValue = exportText(includeStructure);

  const copy = async () => {
    if (!exportValue.trim()) return;
    await Clipboard.setStringAsync(exportValue);
    markExported();
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const share = async () => {
    if (!exportValue.trim()) return;
    try {
      const result = await Share.share({ title: 'Mi canción', message: exportValue });
      if (result?.action !== Share.dismissedAction) markExported();
      setExportOpen(false);
    } catch (error) {
      const cancelled = typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
      if (cancelled) return;
      Alert.alert('No se pudo abrir el menú de compartir', 'Podés copiar la letra y pegarla en WhatsApp.');
    }
  };

  const confirmClear = () => {
    Alert.alert('Vaciar el cuaderno', 'Se borra la letra de esta sesión. No se puede recuperar.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: () => { clear(); setExportOpen(false); } },
    ]);
  };

  return (
    <Screen scroll contentStyle={{ paddingTop: spacing.md }}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={colors.accentCore}>Cuaderno</AppText>
          <AppText variant="title" style={{ marginTop: 4 }}>Escribir</AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
            {totalWords} palabras · {lineCount} versos · solo en memoria
          </AppText>
          {!exported && totalWords > 0 ? (
            <View style={[styles.dirty, { backgroundColor: alpha(colors.stateWarning, 0.14) }]}>
              <Feather name="upload-cloud" size={12} color={colors.stateWarning} />
              <AppText variant="caption" color={colors.stateWarning} style={{ marginLeft: 5, fontFamily: fonts.sansSemiBold }}>
                Sin exportar
              </AppText>
            </View>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exportar letra"
          onPress={() => setExportOpen(true)}
          style={[styles.round, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="share" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <Button label="Agregar sección" tone="secondary" small onPress={() => setAddOpen(true)} icon={<Feather name="plus" size={14} color={colors.accentCore} />} />
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deshacer"
          accessibilityState={{ disabled: past.length === 0 }}
          disabled={past.length === 0}
          onPress={undo}
          style={[styles.mini, { borderColor: colors.lineSubtle }, past.length === 0 && styles.disabled]}
        >
          <Feather name="rotate-ccw" size={14} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rehacer"
          accessibilityState={{ disabled: future.length === 0 }}
          disabled={future.length === 0}
          onPress={redo}
          style={[styles.mini, { borderColor: colors.lineSubtle }, future.length === 0 && styles.disabled]}
        >
          <Feather name="rotate-cw" size={14} color={colors.textSecondary} />
        </Pressable>
        <Button label={copied ? 'Copiado' : 'Copiar'} tone="ghost" small onPress={() => void copy()} />
      </View>

      <StimulusPanel />

      {sections.map((section) => {
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
                accessibilityLabel={`Renombrar ${section.name}`}
                onPress={() => { setRenaming(section); setRenameText(section.name); }}
                style={{ flex: 1 }}
              >
                <AppText variant="caption" color={colors.accentCore} style={{ fontFamily: fonts.sansSemiBold, fontSize: 10 }}>
                  {KIND_LABEL[section.kind]}
                </AppText>
                <AppText style={{ fontFamily: fonts.display, fontSize: 23, lineHeight: 29, marginTop: 2 }}>
                  {section.name}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Agregar estrofa a ${section.name}`}
                onPress={() => addStanza(section.id)}
                style={[styles.mini, { borderColor: colors.lineSubtle }]}
              >
                <Feather name="plus" size={14} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Quitar ${section.name}`}
                onPress={() => removeSection(section.id)}
                style={[styles.mini, { borderColor: colors.lineSubtle, marginLeft: 6 }]}
              >
                <Feather name="trash-2" size={14} color={colors.textMuted} />
              </Pressable>
            </View>

            {section.stanzas.map((stanza, index) => (
              <View key={stanza.id} style={styles.stanza}>
                {section.stanzas.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Quitar estrofa"
                    onPress={() => removeStanza(section.id, stanza.id)}
                    style={styles.stanzaRemove}
                  >
                    <Feather name="x" size={12} color={colors.textMuted} />
                  </Pressable>
                ) : null}
                <TextInput
                  value={stanza.text}
                  onChangeText={(text) => updateStanza(section.id, stanza.id, text)}
                  onFocus={() => setActiveSection(section.id)}
                  placeholder={index === 0 ? 'Una imagen, una frase, algo que no te animás a decir…' : 'Otra estrofa…'}
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel={`Estrofa ${index + 1} de ${section.name}`}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, { color: colors.textPrimary, fontFamily: fonts.serif }]}
                />
              </View>
            ))}
          </View>
        );
      })}

      <View style={[styles.privacy, { borderColor: colors.lineSubtle }]}>
        <Feather name="lock" size={15} color={colors.accentCore} />
        <AppText variant="caption" color={colors.textMuted} style={{ flex: 1, marginLeft: 8 }}>
          La letra no se guarda en el teléfono. Si querés conservarla, exportala antes de cerrar la app.
        </AppText>
      </View>

      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title="Nueva sección">
        <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
          Elegí una función. Después podés renombrarla.
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

      <Sheet visible={exportOpen} onClose={() => setExportOpen(false)} title="Exportar">
        <AppText variant="caption" color={colors.textMuted}>
          Se comparte el texto tal como está. No se envía nada a ningún servidor.
        </AppText>
        <View style={[styles.exportPreview, { borderColor: colors.lineSubtle }]}>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={3}>
            {exportValue.trim() ? exportValue : 'Todavía no escribiste nada.'}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Incluir nombres de secciones"
          accessibilityState={{ checked: includeStructure }}
          onPress={() => setIncludeStructure(!includeStructure)}
          style={styles.switchRow}
        >
          <AppText variant="body" style={{ flex: 1 }}>Incluir nombres de secciones</AppText>
          <View style={[styles.switch, { backgroundColor: includeStructure ? colors.accentCore : colors.lineStrong }]}>
            <View style={[styles.knob, { transform: [{ translateX: includeStructure ? 18 : 2 }] }]} />
          </View>
        </Pressable>
        <View style={styles.exportActions}>
          <Button label="Compartir" onPress={() => void share()} disabled={!exportValue.trim()} />
          <Button label={copied ? 'Copiado' : 'Copiar'} tone="secondary" onPress={() => void copy()} disabled={!exportValue.trim()} />
        </View>
        <Button label="Vaciar cuaderno" tone="danger" onPress={confirmClear} style={{ marginTop: spacing.md }} />
      </Sheet>

      <Sheet visible={Boolean(renaming)} onClose={() => setRenaming(null)} title="Renombrar sección">
        <TextInput
          value={renameText}
          onChangeText={setRenameText}
          accessibilityLabel="Nombre de la sección"
          style={[styles.renameInput, { color: colors.textPrimary, borderColor: colors.lineSubtle, fontFamily: fonts.serif }]}
          autoFocus
        />
        <Button
          label="Guardar"
          onPress={() => {
            if (renaming && renameText.trim()) renameSection(renaming.id, renameText.trim());
            setRenaming(null);
          }}
          style={{ marginTop: spacing.md }}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  dirty: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: radii.chip, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  disabled: { opacity: 0.55 },
  round: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  section: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  mini: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stanza: { position: 'relative', marginTop: spacing.xs },
  stanzaRemove: { position: 'absolute', right: 4, top: 2, zIndex: 2, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  input: { fontSize: 18, lineHeight: 28, minHeight: 94, paddingTop: 8, paddingRight: 24, paddingBottom: 8 },
  privacy: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.xs },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exportPreview: { borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, marginTop: spacing.md, minHeight: 70 },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, marginTop: spacing.sm },
  switch: { width: 40, height: 24, borderRadius: 12, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  exportActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  renameInput: { borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.sm, paddingVertical: 12, fontSize: 18 },
});
