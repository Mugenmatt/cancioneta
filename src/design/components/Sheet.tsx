import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCoreTheme } from '../ThemeProvider';
import { NAVIGATION_TEXT } from '../../content/app';
import { minTouch, motion, radii, shadows, spacing } from '../tokens';
import { AppText } from './Text';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  fullHeight?: boolean;
}

const enterEasing = Easing.bezier(
  motion.easing.enter[0],
  motion.easing.enter[1],
  motion.easing.enter[2],
  motion.easing.enter[3],
);

export function Sheet({ visible, onClose, title, children, fullHeight = false }: SheetProps) {
  const { colors, reduceMotion } = useCoreTheme();
  const offset = spacing.xl + spacing.xs;
  const translate = useSharedValue(offset);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) {
      translate.set(0);
      opacity.set(1);
      return;
    }
    translate.set(offset);
    opacity.set(0);
    translate.set(withTiming(0, { duration: motion.base, easing: enterEasing }));
    opacity.set(withTiming(1, { duration: motion.base, easing: enterEasing }));
  }, [visible, reduceMotion, offset, translate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.get() }],
    opacity: opacity.get(),
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel={NAVIGATION_TEXT.close} />
        <Animated.View
          style={[
            styles.sheet,
            fullHeight ? styles.full : styles.auto,
            {
              backgroundColor: colors.bgRaised,
              shadowColor: shadows.color,
            },
            animatedStyle,
          ]}
        >
          <SafeAreaView edges={['bottom']} style={{ flex: fullHeight ? 1 : undefined }}>
            <View style={[styles.grabber, { backgroundColor: colors.lineStrong }]} />
            {title ? (
              <View style={styles.head}>
                <AppText variant="title" style={{ fontSize: 22, flex: 1 }}>{title}</AppText>
                <Pressable accessibilityRole="button" accessibilityLabel={NAVIGATION_TEXT.close} onPress={onClose} style={styles.close}>
                  <Feather name="x" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            ) : null}
            <View style={{ flex: fullHeight ? 1 : undefined, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              {children}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet,
    maxHeight: '92%', ...shadows.sheet,
  },
  auto: { paddingBottom: spacing.xs },
  full: { height: '88%' },
  grabber: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.xs },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  close: { width: minTouch, height: minTouch, alignItems: 'center', justifyContent: 'center' },
});
