import { useState } from 'react';
import { PanResponder, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { fonts, minTouch, radii, spacing } from '@/design/tokens';
import { clampVolume, positionFromVolume, volumeFromPosition } from '@/design/volumeSliderMath';

interface VolumeSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
}

export function VolumeSlider({ label, value, onValueChange }: VolumeSliderProps) {
  const { colors } = useCoreTheme();
  const [width, setWidth] = useState(0);
  const safeValue = clampVolume(value);
  const percent = Math.round(safeValue * 100);
  const position = positionFromVolume(safeValue, width);

  const updateFromEvent = (event: GestureResponderEvent) => {
    onValueChange(volumeFromPosition(event.nativeEvent.locationX, width));
  };

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: updateFromEvent,
    onPanResponderMove: updateFromEvent,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
        <AppText variant="caption" color={colors.textMuted} style={{ fontFamily: fonts.sansSemiBold }}>{percent}%</AppText>
      </View>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent}%` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          const action = event.nativeEvent.actionName;
          if (action === 'increment') onValueChange(clampVolume(safeValue + 0.05));
          if (action === 'decrement') onValueChange(clampVolume(safeValue - 0.05));
        }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={styles.touchArea}
        {...responder.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: colors.lineSubtle }]}>
          <View style={[styles.fill, { backgroundColor: colors.accentCore, width: position }]} />
        </View>
        <View style={[
          styles.thumb,
          {
            left: position,
            borderColor: colors.accentCore,
            backgroundColor: colors.bgRaised,
          },
        ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxs },
  touchArea: { height: minTouch, justifyContent: 'center' },
  track: { height: spacing.xxs, borderRadius: radii.chip, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.chip },
  thumb: {
    position: 'absolute',
    width: spacing.md,
    height: spacing.md,
    borderRadius: radii.chip,
    borderWidth: spacing.xxs / 2,
    marginLeft: -spacing.xs,
    marginTop: -spacing.xs,
    top: '50%',
  },
});
