import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { alpha } from '../tokens';
import type { GameTheme } from '../themes';
import { useEntranceStyle } from '../useEntranceStyle';

export function Motif({ theme }: { theme: GameTheme }) {
  const { width, height } = useWindowDimensions();
  const accent = theme.accent;
  const line = alpha(theme.ink, 0.08);
  const entranceStyle = useEntranceStyle(theme.entrance);
  const withEntrance = (content: ReactNode) => (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, entranceStyle]}>
      {content}
    </Animated.View>
  );

  switch (theme.motif) {
    case 'halo':
      return withEntrance(
        <>
          <View style={[styles.circle, { width: 360, height: 360, top: -140, right: -120, backgroundColor: alpha(accent, 0.16) }]} />
          <View style={[styles.circle, { width: 180, height: 180, bottom: 60, left: -90, borderColor: alpha(accent, 0.35) }]} />
        </>
      );
    case 'grid':
      return withEntrance(
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 9 }, (_, i) => (
            <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: (height / 10) * (i + 1), height: 1, backgroundColor: line }} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <View key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: (width / 6) * (i + 1), width: 1, backgroundColor: line }} />
          ))}
        </View>
      );
    case 'stripes':
      return withEntrance(
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 7 }, (_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute', top: -80, bottom: -80, width: 2,
                left: i * (width / 6) + 20, backgroundColor: alpha(accent, 0.14),
                transform: [{ rotate: '18deg' }],
              }}
            />
          ))}
        </View>
      );
    case 'wave':
      return withEntrance(
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 4 }, (_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute', left: -40, right: -40, height: 90 + i * 26,
                bottom: -30 + i * 34, borderTopWidth: 2, borderColor: alpha(accent, 0.18 - i * 0.03),
                borderRadius: 80, transform: [{ scaleX: 1.2 }],
              }}
            />
          ))}
        </View>
      );
    case 'orbit':
      return withEntrance(
        <>
          <View style={[styles.ring, { width: 320, height: 320, top: -110, right: -110, borderColor: alpha(accent, 0.25) }]} />
          <View style={[styles.ring, { width: 210, height: 210, top: -55, right: -55, borderColor: alpha(accent, 0.16) }]} />
          <View style={[styles.circle, { width: 10, height: 10, top: 150, right: 64, backgroundColor: accent }]} />
        </>
      );
    case 'rings':
      return withEntrance(
        <View style={[styles.ring, { width: 260, height: 260, alignSelf: 'center', top: height * 0.08, borderColor: alpha(accent, 0.22), borderWidth: 10 }]}>
          <View style={[styles.ring, { width: 120, height: 120, borderColor: alpha(accent, 0.4), borderWidth: 6 }]} />
        </View>
      );
    case 'beam':
      return withEntrance(
        <LinearGradient
          pointerEvents="none"
          colors={[alpha(accent, 0.28), 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 0.6 }}
          style={[styles.beam, { width: width * 0.9, height: height * 0.6, top: -height * 0.12, right: -width * 0.35 }]}
        />
      );
    case 'blur':
      return withEntrance(
        <>
          <View style={[styles.circle, { width: 260, height: 260, top: -100, left: -80, backgroundColor: alpha(accent, 0.2) }]} />
          <View style={[styles.circle, { width: 180, height: 180, bottom: 40, right: -70, backgroundColor: alpha(accent, 0.12) }]} />
        </>
      );
    case 'stairs':
      return withEntrance(
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 6 }, (_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute', bottom: 0, left: i * 24, width: 24, height: 30 + i * 26,
                backgroundColor: alpha(accent, 0.05 + i * 0.015),
              }}
            />
          ))}
        </View>
      );
    case 'paper':
      return withEntrance(
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 14 }, (_, i) => (
            <View key={i} style={{ position: 'absolute', left: 24, right: 24, top: 80 + i * 42, height: 1, backgroundColor: alpha(theme.ink, 0.055) }} />
          ))}
          <View style={{ position: 'absolute', top: 66, bottom: 0, left: 46, width: 1, backgroundColor: alpha(accent, 0.2) }} />
        </View>
      );
    case 'window':
      return withEntrance(
        <View style={[styles.frame, { borderColor: alpha(accent, 0.2), top: height * 0.09, left: width * 0.1, width: width * 0.8, height: height * 0.42 }]}>
          <View style={{ flex: 1, borderRightWidth: 1, borderColor: alpha(accent, 0.16) }} />
          <View style={{ flex: 1 }} />
        </View>
      );
    case 'grain':
    default:
      return withEntrance(
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 26 }, (_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 2, height: 2, borderRadius: 1,
                left: (i * 73) % width, top: (i * 149) % height,
                backgroundColor: alpha(theme.ink, 0.12),
              }}
            />
          ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  circle: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'transparent' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  beam: { position: 'absolute', transform: [{ rotate: '-18deg' }] },
  frame: { position: 'absolute', borderWidth: 1, flexDirection: 'row' },
});
