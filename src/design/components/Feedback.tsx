import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '../ThemeProvider';
import { alpha, fonts, radii, spacing } from '../tokens';
import { AppText } from './Text';

export function ProgressBar({ value, total, accent, label }: { value: number; total: number; accent?: string; label?: string }) {
  const { colors } = useCoreTheme();
  const ratio = total <= 0 ? 0 : Math.min(1, Math.max(0, value / total));
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: value }} accessibilityLabel={label}>
      <View style={[styles.track, { backgroundColor: colors.lineSubtle }]}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: accent ?? colors.accentCore }]} />
      </View>
      {label ? (
        <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 6 }}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

export function TimerBadge({ seconds, running, accent, accentText }: { seconds: number; running: boolean; accent?: string; accentText?: string }) {
  const { colors } = useCoreTheme();
  const [pulse] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!running) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.72, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [running, pulse]);
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return (
    <Animated.View
      accessibilityRole="timer"
      accessibilityLabel={`Temporizador: ${mins} minutos ${secs} segundos`}
      style={[
        styles.timer,
        { borderColor: alpha(accent ?? colors.accentCore, 0.4), backgroundColor: alpha(accent ?? colors.accentCore, 0.12) },
        { opacity: running ? pulse : 1 },
      ]}
    >
      <Feather name="clock" size={14} color={accentText ?? accent ?? colors.accentCore} />
      <AppText variant="caption" color={accentText ?? accent ?? colors.accentCore} style={{ marginLeft: 6, fontFamily: fonts.sansSemiBold }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </AppText>
    </Animated.View>
  );
}

export function LockToggle({ locked, onPress, accent, label = 'Bloquear' }: { locked: boolean; onPress: () => void; accent?: string; label?: string }) {
  const { colors } = useCoreTheme();
  const tint = accent ?? colors.accentCore;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: locked }}
      onPress={onPress}
      style={[styles.lock, { borderColor: locked ? tint : colors.lineSubtle, backgroundColor: locked ? alpha(tint, 0.14) : 'transparent' }]}
    >
      <Feather name={locked ? 'lock' : 'unlock'} size={14} color={locked ? tint : colors.textMuted} />
    </Pressable>
  );
}

export function EmptyState({ title, body, action, accent }: { title: string; body?: string; action?: React.ReactNode; accent?: string }) {
  const { colors } = useCoreTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { borderColor: alpha(accent ?? colors.accentCore, 0.35) }]}>
        <Feather name="feather" size={22} color={accent ?? colors.accentCore} />
      </View>
      <AppText variant="title" style={{ textAlign: 'center', marginTop: spacing.md, fontSize: 24 }}>{title}</AppText>
      {body ? <AppText variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: spacing.xs, maxWidth: 300 }}>{body}</AppText> : null}
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  timer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  lock: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
