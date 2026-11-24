import { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { DEV_GALLERY_TEXT } from '@/content/devGallery';
import { GAME_REGISTRY } from '@/games/registry';
import { useCoreTheme } from '@/design/ThemeProvider';
import { auditGalleryContrast, galleryEntries, GALLERY_MODES, type GalleryEntry } from '@/design/galleryAudit';
import { themeFor, type GameTheme } from '@/design/themes';
import { alpha, minTouch, radii, spacing } from '@/design/tokens';
import { Button } from '@/design/components/Button';
import { DiceButton } from '@/design/components/DiceButton';
import { EmptyState, LockToggle, ProgressBar, TimerBadge } from '@/design/components/Feedback';
import { Sheet } from '@/design/components/Sheet';
import { Pill, ScreenHeader, SectionLabel, Surface } from '@/design/components/Primitives';
import { Screen } from '@/design/components/Screen';
import { StimulusCard, StimulusText } from '@/design/components/StimulusCard';
import { AppText } from '@/design/components/Text';
import { VolumeSlider } from '@/design/components/VolumeSlider';
import { WordChip } from '@/design/components/WordChip';

export default function GalleryScreen() {
  const { colors, reduceMotion } = useCoreTheme();
  const { fontScale } = useWindowDimensions();
  const entries = useMemo(() => galleryEntries(), []);
  const audit = useMemo(() => auditGalleryContrast(), []);
  const contrastOk = audit.findings.length === 0;

  return (
    <Screen scroll bottomInset maxWidth="grid" backgroundColors={[colors.bgBase, colors.bgSunken]}>
      <ScreenHeader title={DEV_GALLERY_TEXT.title} subtitle={DEV_GALLERY_TEXT.eyebrow} />
      <AppText variant="lead" color={colors.textSecondary}>{DEV_GALLERY_TEXT.subtitle}</AppText>

      <Surface style={styles.block}>
        <SectionLabel>{DEV_GALLERY_TEXT.sections.checks}</SectionLabel>
        <AuditRow
          label={DEV_GALLERY_TEXT.sections.themes}
          detail={DEV_GALLERY_TEXT.count(entries.length)}
          ok={entries.length === GAME_REGISTRY.length}
        />
        <AuditRow label={DEV_GALLERY_TEXT.audit.contrastLabel} detail={DEV_GALLERY_TEXT.audit.contrast(audit.checked, audit.findings.length)} ok={contrastOk} />
        <AuditRow
          label={DEV_GALLERY_TEXT.audit.textScaleLabel}
          detail={DEV_GALLERY_TEXT.audit.textScale(Math.round(fontScale * 100))}
          ok={fontScale <= 2}
        />
        <AuditRow
          label={DEV_GALLERY_TEXT.audit.reduceMotionLabel}
          detail={reduceMotion ? DEV_GALLERY_TEXT.audit.reduceMotionOn : DEV_GALLERY_TEXT.audit.reduceMotionOff}
          ok
        />
        <AuditRow label={DEV_GALLERY_TEXT.audit.tokens} detail={DEV_GALLERY_TEXT.audit.pass} ok />
        <AppText variant="caption" color={colors.textMuted} style={styles.note}>
          {DEV_GALLERY_TEXT.audit.manual}
        </AppText>
      </Surface>

      <SectionLabel>{DEV_GALLERY_TEXT.sections.themes}</SectionLabel>
      {entries.map((entry) => <ThemeCard key={entry.id} entry={entry} />)}

      <SectionLabel>{DEV_GALLERY_TEXT.sections.components}</SectionLabel>
      <ComponentSamples />

      <SectionLabel>{DEV_GALLERY_TEXT.sections.fonts}</SectionLabel>
      <Surface>
        <AppText variant="body" color={colors.textSecondary}>{DEV_GALLERY_TEXT.fontNote}</AppText>
      </Surface>
    </Screen>
  );
}

function AuditRow({ label, detail, ok }: { label: string; detail: string; ok: boolean }) {
  const { colors } = useCoreTheme();
  return (
    <View style={[styles.auditRow, { borderBottomColor: colors.lineSubtle }]}>
      <AppText variant="body" color={colors.textPrimary} style={styles.auditLabel}>{label}</AppText>
      <AppText variant="caption" color={ok ? colors.stateSuccess : colors.stateError} style={styles.auditDetail}>
        {`${ok ? DEV_GALLERY_TEXT.audit.pass : DEV_GALLERY_TEXT.audit.fail} · ${detail}`}
      </AppText>
    </View>
  );
}

function ThemePanel({ theme, modeLabel }: { theme: GameTheme; modeLabel: string }) {
  return (
    <View style={[styles.themePanel, { backgroundColor: theme.bg, borderColor: alpha(theme.accent, 0.28) }]}>
      <AppText variant="label" color={theme.accentText}>{modeLabel}</AppText>
      <StimulusText theme={theme}>{DEV_GALLERY_TEXT.themeCard.sample}</StimulusText>
      <AppText variant="caption" color={theme.inkSoft} style={styles.panelName}>{theme.name}</AppText>
      <View style={styles.swatches}>
        <View style={[styles.swatch, { backgroundColor: theme.surface, borderColor: theme.inkSoft }]} />
        <View style={[styles.swatch, { backgroundColor: theme.accent, borderColor: theme.inkSoft }]} />
      </View>
    </View>
  );
}

function ThemeCard({ entry }: { entry: GalleryEntry }) {
  const { colors } = useCoreTheme();
  return (
    <Surface style={styles.themeCard}>
      <View style={styles.themeHeader}>
        <AppText variant="title" color={colors.textPrimary} style={styles.themeName}>{entry.name}</AppText>
        <Pill label={DEV_GALLERY_TEXT.numberLabel(entry.number, entry.id)} />
      </View>
      <View style={styles.panels}>
        {GALLERY_MODES.map((mode) => (
          <ThemePanel key={mode} theme={themeFor(entry.id, mode)} modeLabel={DEV_GALLERY_TEXT.mode[mode]} />
        ))}
      </View>
    </Surface>
  );
}

function ComponentSamples() {
  const { colors } = useCoreTheme();
  const [selected, setSelected] = useState(false);
  const [locked, setLocked] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const sampleTheme = themeFor('g01', 'light');

  return (
    <>
      <Surface style={styles.block}>
        <SectionLabel>{DEV_GALLERY_TEXT.components.buttons}</SectionLabel>
        <View style={styles.row}>
          <Button label={DEV_GALLERY_TEXT.components.buttonPrimary} onPress={() => setSelected(!selected)} small />
          <Button label={DEV_GALLERY_TEXT.components.buttonSecondary} onPress={() => setSelected(!selected)} tone="secondary" small />
          <Button label={DEV_GALLERY_TEXT.components.buttonGhost} onPress={() => setSelected(!selected)} tone="ghost" small />
        </View>
        <View style={styles.row}>
          <Button label={DEV_GALLERY_TEXT.components.buttonDanger} onPress={() => setSelected(!selected)} tone="danger" small />
          <Button label={DEV_GALLERY_TEXT.components.buttonLoading} onPress={() => undefined} loading small />
          <Button label={DEV_GALLERY_TEXT.components.buttonDisabled} onPress={() => undefined} disabled small />
          <Button label={DEV_GALLERY_TEXT.components.openSheet} onPress={() => setSheetOpen(true)} small />
        </View>
      </Surface>

      <Surface style={styles.block}>
        <SectionLabel>{DEV_GALLERY_TEXT.components.selections}</SectionLabel>
        <View style={styles.row}>
          <Pill label={DEV_GALLERY_TEXT.mode.light} selected={selected} onPress={() => setSelected(!selected)} />
          <Pill label={DEV_GALLERY_TEXT.mode.dark} selected={!selected} onPress={() => setSelected(!selected)} />
          <LockToggle
            locked={locked}
            onPress={() => setLocked(!locked)}
            label={locked ? DEV_GALLERY_TEXT.components.unlock : DEV_GALLERY_TEXT.components.lock}
          />
        </View>
        <AppText variant="caption" color={colors.textMuted}>{DEV_GALLERY_TEXT.components.chipsLabel}</AppText>
        <View style={styles.row}>
          <WordChip word={DEV_GALLERY_TEXT.components.word} />
          <WordChip word={DEV_GALLERY_TEXT.components.selectedWord} selected />
          <WordChip word={DEV_GALLERY_TEXT.components.word} locked />
          <WordChip word={DEV_GALLERY_TEXT.components.hiddenWord} revealed={false} />
        </View>
        <ProgressBar value={3} total={5} label={DEV_GALLERY_TEXT.components.progressLabel} />
        <TimerBadge seconds={125} running />
        <DiceButton label={DEV_GALLERY_TEXT.components.dice} onPress={() => setSelected(!selected)} compact />
        <VolumeSlider label={DEV_GALLERY_TEXT.components.volume} value={volume} onValueChange={setVolume} />
      </Surface>

      <StimulusCard
        theme={sampleTheme}
        eyebrow={DEV_GALLERY_TEXT.components.stimulusEyebrow}
        caption={DEV_GALLERY_TEXT.components.stimulusCaption}
      >
        <StimulusText theme={sampleTheme}>{DEV_GALLERY_TEXT.components.word}</StimulusText>
      </StimulusCard>

      <EmptyState
        title={DEV_GALLERY_TEXT.components.emptyTitle}
        body={DEV_GALLERY_TEXT.components.emptyBody}
        action={<Button label={DEV_GALLERY_TEXT.components.dice} onPress={() => setSelected(!selected)} small />}
      />

      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title={DEV_GALLERY_TEXT.components.sheetTitle}>
        <AppText variant="body" color={colors.textSecondary}>{DEV_GALLERY_TEXT.components.sheetBody}</AppText>
        <Button label={DEV_GALLERY_TEXT.components.close} onPress={() => setSheetOpen(false)} small />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: spacing.lg },
  note: { marginTop: spacing.sm },
  auditRow: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start',
    paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  auditLabel: { flexShrink: 1, marginRight: spacing.sm },
  auditDetail: { flexShrink: 1 },
  themeCard: { marginBottom: spacing.md },
  themeHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: spacing.sm },
  themeName: { flexShrink: 1, marginRight: spacing.sm },
  panels: { flexDirection: 'column' },
  themePanel: {
    borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md, marginBottom: spacing.sm, minHeight: minTouch,
  },
  panelName: { marginTop: spacing.xs },
  swatches: { flexDirection: 'row', marginTop: spacing.sm },
  swatch: {
    width: spacing.xl, height: spacing.xl, borderRadius: radii.field,
    borderWidth: StyleSheet.hairlineWidth, marginRight: spacing.xs,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: spacing.sm },
});
