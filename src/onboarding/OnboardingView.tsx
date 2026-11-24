import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { ONBOARDING_PAGES, ONBOARDING_UI_TEXT } from '@/content/onboarding';
import { alpha, fontSizes, minTouch, radii, spacing } from '@/design/tokens';

export function OnboardingView({ review, onDone }: { review: boolean; onDone: () => void }) {
  const { colors } = useCoreTheme();
  const [index, setIndex] = useState(0);

  const page = ONBOARDING_PAGES[index];
  const last = index === ONBOARDING_PAGES.length - 1;

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.top}>
        <AppText variant="display" color={colors.accentCore} style={styles.wordmark}>
          {ONBOARDING_UI_TEXT.wordmark}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={review ? ONBOARDING_UI_TEXT.closeLabel : ONBOARDING_UI_TEXT.skipLabel}
          onPress={onDone}
          style={styles.skip}
        >
          <AppText variant="caption" color={colors.textMuted}>
            {review ? ONBOARDING_UI_TEXT.close : ONBOARDING_UI_TEXT.skip}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.stage}>
        <View style={[styles.icon, { backgroundColor: alpha(colors.accentCore, 0.12), borderColor: alpha(colors.accentCore, 0.3) }]}>
          <Feather name={page.icon} size={fontSizes.title} color={colors.accentCore} />
        </View>
        <AppText variant="label" color={colors.accentCore} style={{ marginTop: spacing.xl }}>{page.eyebrow}</AppText>
        <AppText variant="display" style={styles.title}>{page.title}</AppText>
        <AppText variant="serif" style={styles.body}>{page.body}</AppText>
        <View style={[styles.note, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }]}>
          <Feather name="info" size={fontSizes.small} color={colors.textMuted} />
          <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: spacing.sm }}>
            {page.note}
          </AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={ONBOARDING_UI_TEXT.progress(index + 1, ONBOARDING_PAGES.length)}>
          {ONBOARDING_PAGES.map((entry, dotIndex) => (
            <View
              key={entry.id}
              style={[styles.dot, {
                backgroundColor: dotIndex === index ? colors.accentCore : colors.lineStrong,
                width: dotIndex === index ? spacing.xl - spacing.xs : spacing.xs,
              }]}
            />
          ))}
        </View>
        <View style={styles.actions}>
          {index > 0 ? (
            <Button label={ONBOARDING_UI_TEXT.back} tone="secondary" onPress={() => setIndex((current) => Math.max(0, current - 1))} />
          ) : null}
          <View style={{ flex: 1 }} />
          <Button
            label={last ? (review ? ONBOARDING_UI_TEXT.reviewDone : ONBOARDING_UI_TEXT.start) : ONBOARDING_UI_TEXT.next}
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
  wordmark: { fontSize: fontSizes.title },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skip: { minWidth: minTouch, minHeight: minTouch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  stage: { flex: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  icon: { width: spacing.xxxl, height: spacing.xxxl, borderRadius: radii.card, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: spacing.sm },
  body: { marginTop: spacing.md },
  note: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.lg },
  footer: { gap: spacing.lg },
  dots: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { height: spacing.xs, borderRadius: radii.chip },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
