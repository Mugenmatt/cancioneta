import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCoreTheme } from '../ThemeProvider';
import { motion, radii, shadows, spacing } from '../tokens';
import { AppText } from './Text';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  fullHeight?: boolean;
}

export function Sheet({ visible, onClose, title, children, fullHeight = false }: SheetProps) {
  const { colors, reduceMotion } = useCoreTheme();
  const offset = spacing.xl + spacing.xs;
  const [translate] = useState(() => new Animated.Value(offset));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      translate.setValue(offset);
      opacity.setValue(0);
      if (reduceMotion) {
        translate.setValue(0);
        opacity.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.spring(translate, { toValue: 0, useNativeDriver: true, friction: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: motion.base, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, reduceMotion, offset, translate, opacity]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Cerrar" />
        <Animated.View
          style={[
            styles.sheet,
            fullHeight ? styles.full : styles.auto,
            {
              backgroundColor: colors.bgRaised,
              shadowColor: shadows.color,
              transform: [{ translateY: translate }],
              opacity,
            },
          ]}
        >
          <SafeAreaView edges={['bottom']} style={{ flex: fullHeight ? 1 : undefined }}>
            <View style={[styles.grabber, { backgroundColor: colors.lineStrong }]} />
            {title ? (
              <View style={styles.head}>
                <AppText variant="title" style={{ fontSize: 22, flex: 1 }}>{title}</AppText>
                <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={onClose} style={styles.close}>
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
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
