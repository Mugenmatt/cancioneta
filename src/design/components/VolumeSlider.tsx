import { useState } from 'react';
import { PanResponder, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { useCoreTheme } from '@/design/ThemeProvider';
import { AppText } from '@/design/components/Text';
import { fonts, minTouch, radii, spacing } from '@/design/tokens';
import { clampToRange, positionFromValue, valueFromPosition } from '@/design/volumeSliderMath';

interface VolumeSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
}

export function VolumeSlider({ label, value, onValueChange, min = 0, max = 1, step = 0.05, formatValue }: VolumeSliderProps) {
  const { colors } = useCoreTheme();
  const [width, setWidth] = useState(0);
  const safeValue = clampToRange(value, min, max, step);
  const percent = Math.round(((safeValue - min) / (max - min)) * 100);
  const display = formatValue ? formatValue(safeValue) : `${percent}%`;
  const position = positionFromValue(safeValue, width, min, max);

  const updateFromEvent = (event: GestureResponderEvent) => {
    onValueChange(valueFromPosition(event.nativeEvent.locationX, width, min, max, step));
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
        <AppText variant="caption" color={colors.textMuted} style={{ fontFamily: fonts.sansSemiBold }}>{display}</AppText>
      </View>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: safeValue, text: display }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          const action = event.nativeEvent.actionName;
          if (action === 'increment') onValueChange(clampToRange(safeValue + step, min, max, step));
          if (action === 'decrement') onValueChange(clampToRange(safeValue - step, min, max, step));
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
