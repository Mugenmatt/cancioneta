import type { ComponentRef, RefObject } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { AppText } from '@/design/components/Text';
import { MAP_TEXT } from '@/content/games/g23';
import { MAP_LAYOUT, type MapLayout } from './mapLogic';
import { alpha, fontSizes, fonts, radii, spacing } from '@/design/tokens';
import type { useGameTheme } from '@/design/ThemeProvider';

type Theme = ReturnType<typeof useGameTheme>;

export function MapCanvas({ layout, theme, selectedId, canvasRef, onSelect, onTextChange }: {
  layout: MapLayout;
  theme: Theme;
  selectedId: string | null;
  canvasRef: RefObject<ComponentRef<typeof View> | null>;
  onSelect: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
}) {
  const label = (relation: keyof typeof MAP_TEXT.relationLabels) => MAP_TEXT.relationLabels[relation];
  return (
    <View ref={canvasRef} collapsable={false} style={{ width: layout.width, height: layout.height }}>
      <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill}>
        {layout.connections.map((connection) => {
          const from = layout.positions[connection.from];
          const to = layout.positions[connection.to];
          if (!from || !to) return null;
          return (
            <Line
              key={`${connection.from}-${connection.to}`}
              x1={from.x + MAP_LAYOUT.nodeWidth}
              y1={from.y + MAP_LAYOUT.nodeHeight / 2}
              x2={to.x}
              y2={to.y + MAP_LAYOUT.nodeHeight / 2}
              stroke={alpha(theme.ink, 0.42)}
              strokeWidth={spacing.xxs / 2}
            />
          );
        })}
      </Svg>
      {layout.entries.map((entry) => (
        <Pressable
          key={entry.id}
          accessibilityRole="button"
          accessibilityLabel={`${label(entry.relation)}: ${entry.text || MAP_TEXT.emptyNode}`}
          onPress={() => onSelect(entry.id)}
          style={[
            styles.card,
            {
              left: entry.x,
              top: entry.y,
              width: MAP_LAYOUT.nodeWidth,
              height: MAP_LAYOUT.nodeHeight,
              borderColor: selectedId === entry.id ? theme.accent : alpha(theme.ink, 0.22),
              backgroundColor: alpha(theme.surface, 0.92),
            },
          ]}
        >
          <View style={styles.meta}>
            <View style={[styles.level, { backgroundColor: theme.accent }]}>
              <AppText variant="caption" color={theme.accentInk} style={styles.levelText}>{entry.depth}</AppText>
            </View>
            <AppText variant="caption" color={theme.accentText} numberOfLines={1} style={styles.relation}>
              {label(entry.relation)}
            </AppText>
          </View>
          <TextInput
            value={entry.text}
            onChangeText={(text) => onTextChange(entry.id, text)}
            onFocus={() => onSelect(entry.id)}
            placeholder={MAP_TEXT.nodePlaceholder}
            placeholderTextColor={theme.inkSoft}
            style={[styles.input, { color: theme.ink }]}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  level: { width: 18, height: 18, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  levelText: { fontFamily: fonts.sansBold, fontSize: 10 },
  relation: { flex: 1, fontFamily: fonts.sansSemiBold },
  input: { flex: 1, fontFamily: fonts.serif, fontSize: fontSizes.small, minHeight: 24, paddingVertical: 2 },
});
