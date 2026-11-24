import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, minTouch, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import type { PoolId, PoolItem } from '@/core/types';
import { G36_TEXT } from '@/content/games/g36';
import {
  applyWheelDraws, makeFormStimulus, singleWheelDraw, WHEEL_KEYS, wheelSummary,
  type WheelKey, type WheelLocks, type WheelSlots,
} from './g36Logic';
import { ActionBar, Note, PromptCard } from './ui';

const POOLS: Record<WheelKey, PoolId> = {
  style: 'form_styles',
  meter: 'form_meters',
  structure: 'form_structures',
};

export function FormWheelGame() {
  const theme = useGameTheme('g36');
  const [values, setValues] = useState<WheelSlots<PoolItem | null>>({ style: null, meter: null, structure: null });
  const [locks, setLocks] = useState<WheelLocks>({ style: false, meter: false, structure: false });

  useEffect(() => {
    void Promise.resolve().then(async () => {
      const [style] = await randomService.draw('form_styles', 1);
      const [meter] = await randomService.draw('form_meters', 1);
      const [structure] = await randomService.draw('form_structures', 1);
      setValues({ style: style ?? null, meter: meter ?? null, structure: structure ?? null });
    });
  }, []);

  const rollOne = async (key: WheelKey) => {
    const [next] = await randomService.draw(POOLS[key], 1);
    if (!next) return;
    setValues((current) => applyWheelDraws(current, singleWheelDraw(key, next), locks));
  };

  const rollAll = async () => {
    const drawn: Partial<WheelSlots<PoolItem | null>> = {};
    for (const key of WHEEL_KEYS) {
      if (locks[key]) continue;
      const [next] = await randomService.draw(POOLS[key], 1);
      if (next) Object.assign(drawn, singleWheelDraw(key, next));
    }
    setValues((current) => applyWheelDraws(current, drawn, locks));
  };

  const toggleLock = (key: WheelKey) => setLocks((current) => ({ ...current, [key]: !current[key] }));

  const summary = wheelSummary({
    style: values.style?.text ?? '',
    meter: values.meter?.text ?? '',
    structure: values.structure?.text ?? '',
  });
  const stimulus = summary ? makeFormStimulus({
    values: { style: values.style?.text ?? '', meter: values.meter?.text ?? '', structure: values.structure?.text ?? '' },
    title: G36_TEXT.editorTitle(summary),
    note: G36_TEXT.editorNote,
    groupTitles: { style: G36_TEXT.groupStyle, meter: G36_TEXT.groupMeter, structure: G36_TEXT.groupStructure },
  }) : undefined;

  return (
    <View>
      <Note theme={theme}>{G36_TEXT.intro}</Note>

      <Button label={G36_TEXT.rollAll} tone="secondary" small onPress={() => void rollAll()} accent={theme.accentText} accentInk={theme.accentInk} style={styles.rollAll} />

      {WHEEL_KEYS.map((key) => {
        const wheel = G36_TEXT.wheels[key];
        const locked = locks[key];
        return (
          <PromptCard key={key} theme={theme} eyebrow={wheel} style={styles.card}>
            <View style={styles.row}>
              <AppText style={[styles.value, { color: theme.ink, flex: 1 }]}>{values[key]?.text ?? G36_TEXT.loading}</AppText>
              <Pressable
                accessibilityRole="switch"
                accessibilityLabel={locked ? G36_TEXT.unlock(wheel) : G36_TEXT.lock(wheel)}
                accessibilityState={{ checked: locked }}
                hitSlop={6}
                onPress={() => toggleLock(key)}
                style={[
                  styles.lock,
                  { borderColor: locked ? theme.accent : alpha(theme.ink, 0.24), backgroundColor: locked ? alpha(theme.accent, 0.14) : 'transparent' },
                ]}
              >
                <Feather name={locked ? 'lock' : 'unlock'} size={16} color={locked ? theme.accentText : theme.inkSoft} />
                {locked ? <AppText variant="caption" color={theme.accentText} style={styles.lockLabel}>{G36_TEXT.lockedHint}</AppText> : null}
              </Pressable>
            </View>
            <Button label={G36_TEXT.rollOne(wheel)} tone="secondary" small disabled={locked} onPress={() => void rollOne(key)} accent={theme.accentText} accentInk={theme.accentInk} style={styles.rollOne} />
          </PromptCard>
        );
      })}

      <ActionBar text={summary ? G36_TEXT.consigna(summary) : ''} theme={theme} stimulus={stimulus} sendLabel={G36_TEXT.send} />
      <Note theme={theme}>{G36_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  rollAll: { alignSelf: 'flex-start', marginTop: spacing.md },
  card: { marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  value: { fontFamily: fonts.display, fontSize: 23, lineHeight: 29 },
  lock: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, minHeight: minTouch },
  lockLabel: { marginLeft: 5 },
  rollOne: { alignSelf: 'flex-start', marginTop: spacing.sm },
});
