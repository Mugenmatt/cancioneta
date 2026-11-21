import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Alert, PanResponder, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { GameField, MiniButton, Note } from './ui';
import { MapCanvas } from './MapCanvas';
import { loadMapFile } from './mapFile';
import { mapToSvg } from './mapSvg';
import { useGameTheme } from '@/design/ThemeProvider';
import { dataService } from '@/services/data/DataService';
import { isWebPlatform, printHtml, readTextFile, releaseTextFile, saveTextFile, shareText } from '@/services/export/TextFileService';
import { randomService } from '@/services/random/RandomService';
import { normalizeWord } from './logic';
import {
  MAP_LIMITS,
  canFillChildren,
  createMapNode,
  fillChildren,
  findNode,
  findParent,
  layoutMap,
  mapExportEntries,
  maxNodeNumber,
  moveChild,
  parseMapPayload,
  removeChild,
  serializeMap,
  setChildText,
  suggestMapChildSuggestions,
  updateNodeText,
  type MapRelation,
  type MapNode,
} from './mapLogic';
import { MAP_TEXT } from '@/content/games/g23';
import { alpha, radii, spacing } from '@/design/tokens';

function relationLabel(relation: MapRelation): string {
  return MAP_TEXT.relationLabels[relation];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
}

function toHtml(entries: { text: string; relation: MapRelation }[]): string {
  return entries
    .filter((entry) => entry.text.trim())
    .map((entry) => (
      `<div style="padding:6px 0;font-family:Georgia,serif;font-size:16px">${escapeHtml(MAP_TEXT.exportLine(entry.text, relationLabel(entry.relation)))}</div>`
    ))
    .join('');
}

export function MapGame() {
  const theme = useGameTheme('g23');
  const [root, setRoot] = useState<MapNode | null>(null);
  const [draft, setDraft] = useState('');
  const [zoom, setZoom] = useState(1);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const counter = useRef(1);
  const canvasRef = useRef<ComponentRef<typeof View> | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panBase, setPanBase] = useState({ x: 0, y: 0 });

  const nounPool = useMemo(() => dataService.getPool('words.noun').map((item) => item.text), []);
  const rankByWord = useMemo(() => new Map(nounPool.map((word, index) => [normalizeWord(word), index])), [nounPool]);
  const layout = useMemo(() => (root ? layoutMap(root) : null), [root]);
  const selected = root && selectedId ? findNode(root, selectedId) : undefined;
  const selectedParent = root && selectedId ? findParent(root, selectedId) : undefined;
  const selectedIndex = selectedParent?.children.findIndex((child) => child?.id === selectedId) ?? -1;

  const rankWord = (word: string) => rankByWord.get(normalizeWord(word)) ?? nounPool.length;

  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) + Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => { setPanBase(offset); },
    onPanResponderMove: (_, gesture) => {
      setOffset({ x: panBase.x + gesture.dx, y: panBase.y + gesture.dy });
    },
  });

  const nextId = () => {
    counter.current += 1;
    return `n_${counter.current}`;
  };

  const centerOn = (id: string) => {
    const position = layout?.positions[id];
    if (!position) return;
    setSelectedId(id);
    setOffset({ x: spacing.xl - position.x * zoom, y: spacing.xl - position.y * zoom });
  };

  const start = () => {
    if (!draft.trim()) return;
    const id = nextId();
    setRoot(createMapNode(id, draft.trim()));
    setSelectedId(id);
    setDraft('');
    setOffset({ x: 0, y: 0 });
  };

  const generateChildren = (node: MapNode, generated: boolean) => {
    if (!root) return;
    if (!canFillChildren(root, node.id, MAP_LIMITS.childSlots)) {
      Alert.alert(MAP_TEXT.fullTitle, MAP_TEXT.fullBody);
      return;
    }
    if (!generated) {
      setRoot((current) => current ? fillChildren(current, node.id, ['', '', ''], nextId) : current);
      return;
    }
    const parent = findNode(root, node.id);
    if (!parent) return;
    const used = mapExportEntries(root).map((entry) => entry.text).filter((word) => word !== parent.text);
    const picked = suggestMapChildSuggestions(
      parent.text,
      used,
      dataService.getRelations(parent.text),
      nounPool,
      rankWord,
      randomService,
    );
    setRoot((current) => current ? fillChildren(current, node.id, picked, nextId) : current);
  };

  const replaceSlot = (parentId: string, index: number, exclude?: string) => {
    if (!root) return;
    const parent = findNode(root, parentId);
    if (!parent) return;
    const used = mapExportEntries(root).map((entry) => entry.text).filter((word) => word !== exclude);
    const [suggestion] = suggestMapChildSuggestions(
      parent.text,
      used,
      dataService.getRelations(parent.text),
      nounPool,
      rankWord,
      randomService,
      1,
    );
    if (suggestion) setRoot((current) => current ? setChildText(current, parentId, index, suggestion.word, nextId, suggestion.relation) : current);
  };

  const addManualChild = () => {
    if (!selected || !manualText.trim()) return;
    const index = selected.children.findIndex((child) => !child);
    if (index < 0) return;
    setRoot((current) => current ? setChildText(current, selected.id, index, manualText.trim(), nextId, 'manual') : current);
    setManualText('');
  };

  const exportJson = async () => {
    if (!root) return;
    await Clipboard.setStringAsync(JSON.stringify(serializeMap(root), null, 2));
    Alert.alert(MAP_TEXT.copiedTitle, MAP_TEXT.copiedBody);
  };

  const applyImport = (imported: MapNode) => {
    setRoot(imported);
    setSelectedId(imported.id);
    counter.current = Math.max(counter.current, maxNodeNumber(imported));
    setImportText('');
    setShowImport(false);
  };

  const importJson = () => {
    try {
      applyImport(parseMapPayload(importText, nextId));
    } catch {
      Alert.alert(MAP_TEXT.importErrorTitle, MAP_TEXT.importErrorBody);
    }
  };

  const importFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      applyImport(await loadMapFile(asset.uri, {
        read: readTextFile,
        remove: releaseTextFile,
      }, nextId));
    } catch {
      Alert.alert(MAP_TEXT.importErrorTitle, MAP_TEXT.fileImportErrorBody);
    }
  };

  const saveFile = async () => {
    if (!root) return;
    try {
      await saveTextFile(`mapa-${Date.now()}.mapa.json`, JSON.stringify(serializeMap(root), null, 2), 'application/json');
      Alert.alert(MAP_TEXT.savedTitle, MAP_TEXT.savedBody());
    } catch {
      Alert.alert(MAP_TEXT.savedErrorTitle, MAP_TEXT.savedErrorBody);
    }
  };

  const exportImage = async () => {
    if (isWebPlatform() && layout) {
      try {
        await saveTextFile(`mapa-${Date.now()}.svg`, mapToSvg(layout, theme), 'image/svg+xml');
        Alert.alert(MAP_TEXT.savedTitle, MAP_TEXT.savedBody());
      } catch {
        Alert.alert(MAP_TEXT.imageErrorTitle, MAP_TEXT.imageErrorBody);
      }
      return;
    }
    if (!canvasRef.current) return;
    try {
      const uri = await captureRef(canvasRef.current as never, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: MAP_TEXT.image });
      else Alert.alert(MAP_TEXT.imageErrorTitle, MAP_TEXT.imageErrorBody);
    } catch {
      Alert.alert(MAP_TEXT.imageErrorTitle, MAP_TEXT.imageErrorBody);
    }
  };

  const shareWhatsapp = async () => {
    if (!root) return;
    const text = mapExportEntries(root)
      .filter((entry) => entry.text.trim())
      .map((entry) => MAP_TEXT.exportLine(entry.text, relationLabel(entry.relation)))
      .join('\n');
    try { await shareText(MAP_TEXT.whatsappMessage(text), MAP_TEXT.whatsapp); }
    catch { Alert.alert(MAP_TEXT.shareErrorTitle, MAP_TEXT.shareErrorBody); }
  };

  const exportPdf = async () => {
    if (!root) return;
    try {
      await printHtml(
        `<html><body style="padding:32px"><h1 style="font-family:Georgia,serif">${MAP_TEXT.pdfTitle}</h1>${toHtml(mapExportEntries(root))}</body></html>`,
        MAP_TEXT.pdf,
      );
    } catch {
      Alert.alert(MAP_TEXT.pdfErrorTitle, MAP_TEXT.pdfErrorBody);
    }
  };

  return (
    <View>
      <Note theme={theme}>{MAP_TEXT.intro}</Note>
      {!root || !layout ? (
        <View style={{ marginTop: spacing.md }}>
          <GameField theme={theme} label={MAP_TEXT.rootLabel} value={draft} onChangeText={setDraft} placeholder={MAP_TEXT.rootPlaceholder} />
          <Button label={MAP_TEXT.create} small onPress={start} disabled={!draft.trim()} accent={theme.accent} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
        </View>
      ) : (
        <View>
          <View style={styles.toolbar}>
            <Button label={MAP_TEXT.zoomOut} tone="secondary" small onPress={() => setZoom((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))} accent={theme.accentText} accentInk={theme.accentInk} />
            <AppText variant="caption" color={theme.inkSoft}>{Math.round(zoom * 100)}%</AppText>
            <Button label={MAP_TEXT.zoomIn} tone="secondary" small onPress={() => setZoom((value) => Math.min(1.35, Number((value + 0.1).toFixed(2))))} accent={theme.accentText} accentInk={theme.accentInk} />
            <Button label={MAP_TEXT.newMap} tone="secondary" small onPress={() => { setRoot(null); setSelectedId(null); }} accent={theme.accentText} accentInk={theme.accentInk} />
          </View>
          <View style={[styles.viewport, { borderColor: alpha(theme.ink, 0.16), backgroundColor: alpha(theme.surface, 0.4) }]} {...pan.panHandlers}>
            <View style={{ width: layout.width, height: layout.height, transform: [{ translateX: offset.x }, { translateY: offset.y }, { scale: zoom }], transformOrigin: 'top left' }}>
              <MapCanvas
                layout={layout}
                theme={theme}
                selectedId={selectedId}
                canvasRef={canvasRef}
                onSelect={centerOn}
                onTextChange={(id, text) => setRoot((current) => current ? updateNodeText(current, id, text) : current)}
              />
            </View>
          </View>
          {selected ? (
            <View style={[styles.detail, { borderColor: alpha(theme.ink, 0.18), backgroundColor: alpha(theme.surface, 0.6) }]}>
              <AppText variant="label" color={theme.accentText}>{MAP_TEXT.selectedTitle}</AppText>
              <AppText variant="body" style={{ marginTop: spacing.xxs, color: theme.ink }}>
                {selected.text || MAP_TEXT.emptyNode} · {relationLabel(selected.relation)}
              </AppText>
              <View style={styles.detailActions}>
                <MiniButton label={MAP_TEXT.centerNode} theme={theme} icon="crosshair" onPress={() => centerOn(selected.id)} />
                {selectedParent && selectedIndex >= 0 ? (
                  <>
                    <MiniButton label={MAP_TEXT.goToParent} theme={theme} icon="arrow-up" onPress={() => centerOn(selectedParent.id)} />
                    <MiniButton label={MAP_TEXT.regenerateNode} theme={theme} icon="refresh-cw" onPress={() => replaceSlot(selectedParent.id, selectedIndex, selected.text)} />
                    <MiniButton label={MAP_TEXT.moveUp} theme={theme} icon="chevron-up" disabled={selectedIndex === 0} onPress={() => setRoot((current) => current ? moveChild(current, selectedParent.id, selectedIndex, selectedIndex - 1) : current)} />
                    <MiniButton label={MAP_TEXT.moveDown} theme={theme} icon="chevron-down" disabled={selectedIndex === MAP_LIMITS.childSlots - 1} onPress={() => setRoot((current) => current ? moveChild(current, selectedParent.id, selectedIndex, selectedIndex + 1) : current)} />
                    <MiniButton label={MAP_TEXT.deleteTitle} theme={theme} icon="trash-2" onPress={() => Alert.alert(MAP_TEXT.deleteTitle, MAP_TEXT.deleteBody, [
                      { text: MAP_TEXT.deleteCancel, style: 'cancel' },
                      { text: MAP_TEXT.deleteConfirm, style: 'destructive', onPress: () => {
                        setRoot((current) => current ? removeChild(current, selectedParent.id, selectedIndex) : current);
                        setSelectedId(selectedParent.id);
                      } },
                    ])} />
                  </>
                ) : null}
                <MiniButton label={MAP_TEXT.closeSelection} theme={theme} icon="x" onPress={() => setSelectedId(null)} />
              </View>
              {selected.children.every((child) => !child) && selected.children.length === MAP_LIMITS.childSlots ? (
                <View style={styles.detailActions}>
                  <MiniButton label={MAP_TEXT.suggestedChildren} theme={theme} icon="zap" onPress={() => generateChildren(selected, true)} />
                  <MiniButton label={MAP_TEXT.manualChildren} theme={theme} icon="plus" onPress={() => generateChildren(selected, false)} />
                </View>
              ) : null}
              {selected.children.some((child) => !child) ? (
                <View style={styles.manualRow}>
                  <GameField theme={theme} value={manualText} onChangeText={setManualText} placeholder={MAP_TEXT.manualPlaceholder} style={{ flex: 1 }} />
                  <Button label={MAP_TEXT.addManualChild} small onPress={addManualChild} disabled={!manualText.trim()} accent={theme.accent} accentInk={theme.accentInk} />
                </View>
              ) : null}
            </View>
          ) : null}
          <View style={styles.exportRow}>
            <Button label={MAP_TEXT.copyJson} tone="secondary" small onPress={() => void exportJson()} accent={theme.accentText} accentInk={theme.accentInk} />
            <Button label={MAP_TEXT.saveFile} tone="secondary" small onPress={() => void saveFile()} accent={theme.accentText} accentInk={theme.accentInk} />
            <Button label={MAP_TEXT.import} tone="secondary" small onPress={() => setShowImport((value) => !value)} accent={theme.accentText} accentInk={theme.accentInk} />
            <Button label={MAP_TEXT.importFile} tone="secondary" small onPress={() => void importFile()} accent={theme.accentText} accentInk={theme.accentInk} />
            <Button label={MAP_TEXT.image} tone="secondary" small onPress={() => void exportImage()} accent={theme.accentText} accentInk={theme.accentInk} />
            <Button label={MAP_TEXT.pdf} tone="secondary" small onPress={() => void exportPdf()} accent={theme.accentText} accentInk={theme.accentInk} />
            <Button label={MAP_TEXT.whatsapp} tone="secondary" small onPress={() => void shareWhatsapp()} accent={theme.accentText} accentInk={theme.accentInk} />
          </View>
          {showImport ? (
            <View style={{ marginTop: spacing.sm }}>
              <GameField theme={theme} label={MAP_TEXT.pasteJson} value={importText} onChangeText={setImportText} placeholder={MAP_TEXT.jsonPlaceholder} multiline />
              <Button label={MAP_TEXT.importMap} small onPress={importJson} disabled={!importText.trim()} accent={theme.accent} accentInk={theme.accentInk} style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
  viewport: { height: spacing.xxxl * 8, borderWidth: 1, borderRadius: radii.card, overflow: 'hidden' },
  detail: { borderWidth: 1, borderRadius: radii.card, padding: spacing.sm, marginTop: spacing.sm },
  detailActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  manualRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, marginTop: spacing.sm },
  exportRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
});
