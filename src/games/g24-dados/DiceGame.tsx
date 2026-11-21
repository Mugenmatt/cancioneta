import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { TimerBadge } from '@/design/components/Feedback';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import { useLyricsStore } from '@/stores/lyricsStore';
import type { PoolId } from '@/core/types';
import { DICE, DICE_DURATIONS, DICE_TEXT } from '@/content/games/g24';
import { applyDraw, canRollDie, poolsToRoll } from './logic';

export function DiceGame() {
  const router = useRouter();
  const theme = useGameTheme('g24');
  const insertStimulus = useLyricsStore((s) => s.insertStimulus);
  const [values, setValues] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [rolling, setRolling] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(false);

  const drawOne = async (pool: PoolId, force = false) => {
    if (!canRollDie(locked, pool, force)) return;
    const [item] = await randomService.draw(pool, 1);
    if (!item) return;
    setValues((current) => applyDraw(current, pool, item.text));
  };

  const drawAll = async (force = false) => {
    setRolling(true);
    const pools = poolsToRoll(DICE, locked, force);
    await Promise.all(pools.map((pool) => drawOne(pool, force)));
    setRolling(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    void drawAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = (minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const total = minutes * 60;
    setTimerSeconds(total);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimerRunning(false);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const scene = DICE.map((die) => DICE_TEXT.sceneLine(die.label, values[die.pool] ?? DICE_TEXT.missing)).join('\n');

  const copy = async () => {
    await Clipboard.setStringAsync(scene);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  const sendToEditor = () => {
    insertStimulus(scene);
    router.push('/escribir');
  };

  return (
    <View>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color={theme.inkSoft}>
            {DICE_TEXT.intro}
          </AppText>
        </View>
        <Button label={DICE_TEXT.rollAll} small onPress={() => void drawAll(false)} loading={rolling} accent={theme.accent} accentInk={theme.accentInk} />
      </View>

      <View style={styles.grid}>
        {DICE.map((die) => {
          const isLocked = Boolean(locked[die.pool]);
          return (
            <Pressable
              key={die.pool}
              accessibilityRole="button"
              accessibilityLabel={DICE_TEXT.dieLabel(die.label, values[die.pool] ?? DICE_TEXT.unrolled)}
              accessibilityHint={isLocked ? DICE_TEXT.lockedHintBlocked : DICE_TEXT.lockedHint}
              onPress={() => void drawOne(die.pool)}
              style={({ pressed }) => [
                styles.die,
                {
                  backgroundColor: theme.surface,
                  borderColor: isLocked ? theme.accent : alpha(theme.ink, 0.18),
                  borderWidth: isLocked ? 2 : 1,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.dieHead}>
                <Feather name={die.icon} size={15} color={theme.accentText} />
                <AppText variant="caption" color={theme.accentText} style={{ fontFamily: fonts.sansSemiBold, flex: 1, marginLeft: 6 }}>
                  {die.label}
                </AppText>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityLabel={isLocked ? DICE_TEXT.unlock(die.label) : DICE_TEXT.lock(die.label)}
                  accessibilityState={{ checked: isLocked }}
                  hitSlop={8}
                  onPress={() => setLocked((current) => ({ ...current, [die.pool]: !current[die.pool] }))}
                >
                  <Feather name={isLocked ? 'lock' : 'unlock'} size={14} color={isLocked ? theme.accent : theme.inkSoft} />
                </Pressable>
              </View>
              <AppText style={[styles.dieText, { color: theme.ink }]}>{values[die.pool] ?? DICE_TEXT.waiting}</AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.timerBox, { borderColor: alpha(theme.ink, 0.16) }]}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color={theme.inkSoft}>{DICE_TEXT.timerLabel}</AppText>
          <View style={styles.pills}>
            {DICE_DURATIONS.map((minutes) => (
              <Pill
                key={minutes}
                label={DICE_TEXT.minutes(minutes)}
                selected={timerSeconds === minutes * 60 && timerRunning}
                onPress={() => startTimer(minutes)}
              />
            ))}
          </View>
        </View>
        {timerRunning || timerSeconds > 0 ? (
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <TimerBadge seconds={timerSeconds} running={timerRunning} accent={theme.accent} accentText={theme.accentText} />
            <Pressable accessibilityRole="button" accessibilityLabel={DICE_TEXT.stopTimer} onPress={stopTimer}>
              <AppText variant="caption" color={theme.inkSoft}>{DICE_TEXT.stop}</AppText>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label={copied ? DICE_TEXT.copied : DICE_TEXT.copy} tone="secondary" small onPress={() => void copy()} accent={theme.accentText} accentInk={theme.accentInk} />
        <Button label={DICE_TEXT.send} small onPress={sendToEditor} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <AppText variant="caption" color={theme.inkSoft} style={{ marginTop: spacing.sm, lineHeight: 18 }}>
        {DICE_TEXT.note}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  die: { width: '48.5%', minHeight: 144, borderRadius: radii.card, padding: spacing.sm },
  dieHead: { flexDirection: 'row', alignItems: 'center' },
  dieText: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, marginTop: spacing.sm },
  timerBox: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: spacing.md, marginTop: spacing.md },
  pills: { flexDirection: 'row', gap: 6, marginTop: 6 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
});
