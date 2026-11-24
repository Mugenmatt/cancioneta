import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useCoreTheme } from '../ThemeProvider';
import { getScreenLayout, type ScreenMaxWidth } from '../screenLayout';
import type { GameTheme } from '../themes';
import { Motif } from './Motif';

interface ScreenProps {
  children: ReactNode;
  gameTheme?: GameTheme;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bottomInset?: boolean;
  maxWidth?: ScreenMaxWidth;
}

export function Screen({
  children,
  gameTheme,
  edges = ['top'],
  style,
  padded = true,
  scroll = false,
  contentStyle,
  bottomInset = false,
  maxWidth = 'reading',
}: ScreenProps) {
  const { colors } = useCoreTheme();
  const { width } = useWindowDimensions();
  const bg = gameTheme?.bg ?? colors.bgBase;
  const bgAlt = gameTheme?.bgAlt ?? colors.bgSunken;
  const allEdges: Edge[] = bottomInset ? [...edges, 'bottom'] : edges;
  const layout = getScreenLayout(width, maxWidth);
  const maxWidthStyle = { maxWidth: layout.maxWidth };
  const paddingStyle = { paddingHorizontal: layout.paddingHorizontal };

  const body = (
    <SafeAreaView edges={allEdges} style={[styles.safe, style]}>
      <View style={styles.container}>
        {scroll ? (
          <ScrollView
            style={[styles.scroll, styles.centered, maxWidthStyle]}
            contentContainerStyle={[padded && paddingStyle, styles.scrollContent, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, styles.centered, maxWidthStyle, padded && paddingStyle, contentStyle]}>
            {children}
          </View>
        )}
      </View>
    </SafeAreaView>
  );

  return (
    <LinearGradient colors={[bg, bgAlt]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={styles.fill}>
      {gameTheme ? <Motif theme={gameTheme} /> : null}
      {body}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, alignItems: 'center' },
  centered: { width: '100%' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
});
