import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DICE_TEXT } from '../../content/app';
import { useCoreTheme } from '../ThemeProvider';
import { minTouch, motion, radii, semanticRoles, shadows, spacing } from '../tokens';
import { AppText } from './Text';

interface DiceButtonProps {
  onPress: () => void;
  label?: string;
  accent?: string;
  accentInk?: string;
  disabled?: boolean;
  compact?: boolean;
}

const enterEasing = Easing.bezier(
  motion.easing.enter[0],
  motion.easing.enter[1],
  motion.easing.enter[2],
  motion.easing.enter[3],
);

export function DiceButton({ onPress, label = DICE_TEXT.label, accent, accentInk, disabled, compact = false }: DiceButtonProps) {
  const { mode, colors, reduceMotion } = useCoreTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const color = accent ?? colors.accentCore;

  const press = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!reduceMotion) {
      rotation.set(0);
      rotation.set(withTiming(1, { duration: motion.slow, easing: enterEasing }));
      scale.set(1);
      scale.set(withSequence(
        withTiming(1.12, { duration: motion.fast, easing: enterEasing }),
        withSpring(1, { duration: motion.spring.duration, dampingRatio: motion.spring.dampingRatio, reduceMotion: ReduceMotion.System }),
      ));
    }
    onPress();
  };

  const spinStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.get() * 360}deg` },
      { scale: scale.get() },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={press}
      style={({ pressed }) => [styles.wrap, compact && styles.compact, pressed && { opacity: 0.8 }, disabled && { opacity: 0.6 }]}
    >
      <Animated.View
        style={[
          styles.square,
          { backgroundColor: color, shadowColor: shadows.color },
          spinStyle,
        ]}
      >
        <Feather name="shuffle" size={compact ? spacing.md : spacing.lg - spacing.xxs} color={accentInk ?? semanticRoles[mode]['accent.onAccent']} />
      </Animated.View>
      {compact ? null : (
        <View style={{ marginLeft: spacing.sm }}>
          <AppText variant="label" color={color} style={{ fontSize: spacing.md - spacing.xxs }}>{label}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{DICE_TEXT.hint}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', minHeight: minTouch },
  compact: { minHeight: minTouch },
  square: {
    width: minTouch + spacing.xs, height: minTouch + spacing.xs, borderRadius: radii.card,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.raised,
  },
});
