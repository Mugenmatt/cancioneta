import { useEffect, useMemo } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useCoreTheme } from './ThemeProvider';
import { entranceDuration, entrancePose } from './entrance';
import type { Entrance } from './themes';
import { motion } from './tokens';

const easing = Easing.bezier(
  motion.easing.enter[0],
  motion.easing.enter[1],
  motion.easing.enter[2],
  motion.easing.enter[3],
);

export function useEntranceStyle(entrance: Entrance) {
  const { reduceMotion } = useCoreTheme();
  const pose = useMemo(() => entrancePose(entrance, reduceMotion), [entrance, reduceMotion]);
  const duration = entranceDuration(reduceMotion);
  const opacity = useSharedValue(pose.opacity);
  const translateX = useSharedValue(pose.translateX);
  const translateY = useSharedValue(pose.translateY);
  const rotate = useSharedValue(pose.rotate);

  useEffect(() => {
    const timing = { duration, easing };
    opacity.set(pose.opacity);
    translateX.set(pose.translateX);
    translateY.set(pose.translateY);
    rotate.set(pose.rotate);
    opacity.set(withTiming(1, timing));
    translateX.set(withTiming(0, timing));
    translateY.set(withTiming(0, timing));
    rotate.set(withTiming(0, timing));
  }, [duration, pose, opacity, translateX, translateY, rotate]);

  return useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
      { rotate: `${rotate.get()}deg` },
    ],
  }));
}
