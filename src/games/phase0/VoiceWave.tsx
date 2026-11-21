import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, minTouch, motion, spacing } from '@/design/tokens';

export function VoiceWave({ active }: { active: boolean }) {
  const theme = useGameTheme('f0-1');
  const progress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: motion.base, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: motion.base, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, progress]);

  return (
    <View style={styles.wave} accessibilityRole="image">
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const height = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [spacing.xs + (index % 3) * spacing.xxs, minTouch + ((index + 1) % 3) * spacing.sm],
        });
        return (
          <Animated.View
            key={index}
            style={[styles.bar, { height, backgroundColor: alpha(theme.accent, 0.75 - index * 0.08) }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wave: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: minTouch },
  bar: { width: spacing.xs, borderRadius: spacing.xxs },
});
