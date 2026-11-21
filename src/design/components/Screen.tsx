import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useCoreTheme } from '../ThemeProvider';
import type { GameTheme } from '../themes';
import { spacing } from '../tokens';
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
}: ScreenProps) {
  const { colors } = useCoreTheme();
  const bg = gameTheme?.bg ?? colors.bgBase;
  const bgAlt = gameTheme?.bgAlt ?? colors.bgSunken;
  const allEdges: Edge[] = bottomInset ? [...edges, 'bottom'] : edges;

  const body = (
    <SafeAreaView edges={allEdges} style={[styles.safe, style]}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[padded && styles.padded, styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, padded && styles.padded, contentStyle]}>{children}</View>
      )}
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  padded: { paddingHorizontal: spacing.lg },
});
