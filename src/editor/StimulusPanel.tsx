import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { Pill } from '@/design/components/Primitives';
import { TimerBadge } from '@/design/components/Feedback';
import { hitSlop, minTouch, radii, spacing } from '@/design/tokens';
import { EDITOR_TEXT } from '@/content/editor';
import { useStimulusStore } from '@/stores/stimulusStore';
import { useLyricsStore } from '@/stores/lyricsStore';
import { includesTarget, remainingSeconds } from './stimulusStatus';

export function StimulusPanel() {
  const { colors } = useCoreTheme();
  const summary = useStimulusStore((state) => state.summary);
  const collapsed = useStimulusStore((state) => state.collapsed);
  const toggle = useStimulusStore((state) => state.toggleStimulusPanel);
  const clear = useStimulusStore((state) => state.clearStimulusPanel);
  const lyrics = useLyricsStore((state) => state.exportText(false));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!summary?.deadlineAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [summary?.deadlineAt]);
  if (!summary) return null;

  const seconds = remainingSeconds(summary.deadlineAt, now);
  const reached = Boolean(summary.check && includesTarget(lyrics, summary.check.target));

  const groups = summary.groups ?? [{ title: EDITOR_TEXT.stimulusGroupFallback, items: summary.items }];
  const toggleLabel = collapsed ? EDITOR_TEXT.stimulusExpand : EDITOR_TEXT.stimulusCollapse;

  return (
    <View style={[styles.panel, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }]}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={toggleLabel}
          accessibilityState={{ expanded: !collapsed }}
          hitSlop={hitSlop}
          onPress={toggle}
          style={styles.headToggle}
        >
          <Feather name={collapsed ? 'chevron-down' : 'chevron-up'} size={18} color={colors.accentCore} />
          <View style={{ flex: 1, marginLeft: spacing.xs }}>
            <AppText variant="label" color={colors.accentCore}>{EDITOR_TEXT.stimulusTitle}</AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>{summary.title}</AppText>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={EDITOR_TEXT.stimulusClear}
          hitSlop={hitSlop}
          onPress={clear}
          style={styles.clear}
        >
          <Feather name="x" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      {summary.deadlineAt || summary.check ? (
        <View style={styles.meta}>
          {summary.deadlineAt ? (
            <View style={styles.metaItem}>
              <TimerBadge seconds={seconds} running={seconds > 0} accent={colors.accentCore} accentText={colors.accentCore} />
              <AppText variant="caption" color={colors.textMuted} style={{ marginLeft: spacing.xs }}>
                {seconds > 0 ? summary.deadlineLabel : EDITOR_TEXT.stimulusDeadlineReached}
              </AppText>
            </View>
          ) : null}
          {summary.check ? (
            <View style={styles.metaItem}>
              <Feather
                name={reached ? 'check-circle' : 'circle'}
                size={16}
                color={reached ? colors.stateSuccess : colors.textMuted}
              />
              <AppText variant="caption" color={reached ? colors.stateSuccess : colors.textMuted} style={{ marginLeft: spacing.xs }}>
                {reached ? summary.check.doneLabel : summary.check.pendingLabel}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}
      {collapsed ? (
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
          {EDITOR_TEXT.stimulusHidden(summary.items.length)}
        </AppText>
      ) : (
        <View style={{ marginTop: spacing.sm }}>
          {summary.note ? (
            <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>{summary.note}</AppText>
          ) : null}
          {groups.map((group, index) => (
            <View key={`${group.title}-${index}`} style={styles.group}>
              <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.xs }}>{group.title}</AppText>
              <View style={styles.chips}>
                {group.items.map((item, itemIndex) => (
                  <Pill key={`${item}-${itemIndex}`} label={item} />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', minHeight: minTouch },
  headToggle: { flexDirection: 'row', alignItems: 'center', flex: 1, minHeight: minTouch },
  clear: { width: minTouch, height: minTouch, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  group: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
