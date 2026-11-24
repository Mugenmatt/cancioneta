import { useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCoreTheme } from '../ThemeProvider';
import { motion, semanticRoles, shadows } from '../tokens';
import { AppText } from './Text';

interface DiceButtonProps {
  onPress: () => void;
  label?: string;
  accent?: string;
  accentInk?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function DiceButton({ onPress, label = 'Tirar', accent, accentInk, disabled, compact = false }: DiceButtonProps) {
  const { mode, colors, reduceMotion } = useCoreTheme();
  const [rotate] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const color = accent ?? colors.accentCore;

  const press = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!reduceMotion) {
      rotate.setValue(0);
      scale.setValue(1);
      Animated.parallel([
        Animated.timing(rotate, { toValue: 1, duration: motion.slow, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.12, duration: motion.fast, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]),
      ]).start();
    }
    onPress();
  };

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

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
          { backgroundColor: color, shadowColor: shadows.color, transform: [{ rotate: spin }, { scale }] },
        ]}
      >
        <Feather name="shuffle" size={compact ? 20 : 26} color={accentInk ?? semanticRoles[mode]['accent.onAccent']} />
      </Animated.View>
      {compact ? null : (
        <View style={{ marginLeft: 10 }}>
          <AppText variant="label" color={color} style={{ fontSize: 11 }}>{label}</AppText>
          <AppText variant="caption" color={colors.textMuted}>sorprendeme</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  compact: { minHeight: 40 },
  square: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    ...shadows.raised,
  },
});
