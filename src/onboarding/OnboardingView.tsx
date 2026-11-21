import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ONBOARDING_PAGES } from '@/content/onboarding';
import { alpha, fonts, radii, spacing } from '@/design/tokens';

export function OnboardingView({ review, onDone }: { review: boolean; onDone: () => void }) {
  const { colors } = useCoreTheme();
  const [index, setIndex] = useState(0);

  const page = ONBOARDING_PAGES[index];
  const last = index === ONBOARDING_PAGES.length - 1;

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.top}>
        <AppText variant="label" color={colors.accentCore}>Cancioneta</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={review ? 'Cerrar introducción' : 'Saltear introducción'}
          onPress={onDone}
          style={styles.skip}
        >
          <AppText variant="caption" color={colors.textMuted}>{review ? 'Cerrar' : 'Saltear'}</AppText>
        </Pressable>
      </View>

      <View style={styles.stage}>
        <View style={[styles.icon, { backgroundColor: alpha(colors.accentCore, 0.12), borderColor: alpha(colors.accentCore, 0.3) }]}>
          <Feather name={page.icon} size={30} color={colors.accentCore} />
        </View>
        <AppText variant="label" color={colors.accentCore} style={{ marginTop: spacing.xl }}>{page.eyebrow}</AppText>
        <AppText style={styles.title}>{page.title}</AppText>
        <AppText style={styles.body}>{page.body}</AppText>
        <View style={[styles.note, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }]}>
          <Feather name="info" size={15} color={colors.textMuted} />
          <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: spacing.sm, lineHeight: 19 }}>
            {page.note}
          </AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Pantalla ${index + 1} de ${ONBOARDING_PAGES.length}`}>
          {ONBOARDING_PAGES.map((entry, dotIndex) => (
            <View
              key={entry.id}
              style={[styles.dot, {
                backgroundColor: dotIndex === index ? colors.accentCore : colors.lineStrong,
                width: dotIndex === index ? 22 : 7,
              }]}
            />
          ))}
        </View>
        <View style={styles.actions}>
          {index > 0 ? (
            <Button label="Atrás" tone="secondary" onPress={() => setIndex((current) => Math.max(0, current - 1))} />
          ) : null}
          <View style={{ flex: 1 }} />
          <Button
            label={last ? (review ? 'Volver' : 'Empezar') : 'Siguiente'}
            onPress={() => {
              if (last) {
                onDone();
                return;
              }
              setIndex((current) => Math.min(ONBOARDING_PAGES.length - 1, current + 1));
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingTop: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  stage: { flex: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  icon: { width: 68, height: 68, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 40, lineHeight: 47, letterSpacing: -1, marginTop: spacing.sm },
  body: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 29, marginTop: spacing.md },
  note: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.lg },
  footer: { gap: spacing.lg },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { height: 7, borderRadius: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
