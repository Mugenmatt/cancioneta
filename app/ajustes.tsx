import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { BackButton, Pill, SectionLabel } from '@/design/components/Primitives';
import { fontSizes, fonts, minTouch, radii, spacing } from '@/design/tokens';
import { SETTINGS_TEXT } from '@/content/ajustes';
import { useSettingsStore, type ThemePreference } from '@/stores/settingsStore';
import { dataService } from '@/services/data/DataService';
import { randomService } from '@/services/random/RandomService';

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: SETTINGS_TEXT.themes.system },
  { id: 'light', label: SETTINGS_TEXT.themes.light },
  { id: 'dark', label: SETTINGS_TEXT.themes.dark },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useCoreTheme();
  const {
    theme, setTheme, includeStructure, setIncludeStructure, reduceMotion, setReduceMotion,
    reviewOnboarding,
  } = useSettingsStore();
  const report = dataService.getReport();
  const topPools = Object.entries(report.byPool).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const resetLedger = () => {
    Alert.alert(
      SETTINGS_TEXT.resetAlert.title,
      SETTINGS_TEXT.resetAlert.message,
      [
        { text: SETTINGS_TEXT.resetAlert.cancel, style: 'cancel' },
        {
          text: SETTINGS_TEXT.resetAlert.confirm,
          style: 'destructive',
          onPress: () => { void randomService.reset(); },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={{ paddingTop: spacing.sm }}>
      <BackButton label={SETTINGS_TEXT.back} />

      <View style={styles.head}>
        <AppText variant="label" color={colors.accentCore}>{SETTINGS_TEXT.eyebrow}</AppText>
        <AppText variant="title" style={{ marginTop: spacing.xxs }}>{SETTINGS_TEXT.title}</AppText>
      </View>

      <SectionLabel color={colors.textMuted}>{SETTINGS_TEXT.appearance}</SectionLabel>
      <View style={styles.pillRow}>
        {THEMES.map((entry) => (
          <Pill key={entry.id} label={entry.label} selected={theme === entry.id} onPress={() => setTheme(entry.id)} />
        ))}
      </View>

      <View style={[styles.rows, { borderColor: colors.lineSubtle }]}>
        <Row icon="activity" title={SETTINGS_TEXT.reduceMotion.title} body={SETTINGS_TEXT.reduceMotion.body}>
          <View style={styles.switchWrap}>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ true: colors.accentCore, false: colors.lineStrong }}
              accessibilityLabel={SETTINGS_TEXT.reduceMotion.title}
            />
          </View>
        </Row>
        <Row icon="type" title={SETTINGS_TEXT.includeStructure.title} body={SETTINGS_TEXT.includeStructure.body}>
          <View style={styles.switchWrap}>
            <Switch
              value={includeStructure}
              onValueChange={setIncludeStructure}
              trackColor={{ true: colors.accentCore, false: colors.lineStrong }}
              accessibilityLabel={SETTINGS_TEXT.includeStructure.title}
            />
          </View>
        </Row>
      </View>

      <View style={[styles.card, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }]}>
        <View style={styles.cardHead}>
          <Feather name="database" size={fontSizes.reading} color={colors.accentCore} />
          <AppText variant="body" style={{ fontFamily: fonts.sansSemiBold, marginLeft: spacing.xs }}>{SETTINGS_TEXT.dataTitle}</AppText>
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
          {SETTINGS_TEXT.dataSummary(
            report.totalItems,
            Object.keys(report.byPool).filter((key) => report.byPool[key] > 0).length,
          )}
        </AppText>
        {topPools.map(([pool, count]) => (
          <View key={pool} style={styles.poolRow}>
            <AppText variant="caption" color={colors.textMuted}>{pool}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{count}</AppText>
          </View>
        ))}
      </View>

      <View style={[styles.rows, { borderColor: colors.lineSubtle }]}>
        <Row icon="shuffle" title={SETTINGS_TEXT.memory.title} body={SETTINGS_TEXT.memory.body}>
          <Button label={SETTINGS_TEXT.memory.action} tone="danger" small onPress={resetLedger} />
        </Row>
      </View>

      <PressableLink
        icon="compass"
        title={SETTINGS_TEXT.introduction.title}
        body={SETTINGS_TEXT.introduction.body}
        onPress={() => { reviewOnboarding(); router.push('/onboarding'); }}
      />

      <PressableLink
        icon="book-open"
        title={SETTINGS_TEXT.credits.title}
        body={SETTINGS_TEXT.credits.body}
        onPress={() => router.push('/material')}
      />

      <View style={[styles.card, { borderColor: colors.lineSubtle }]}>
        <View style={styles.cardHead}>
          <Feather name="shield" size={fontSizes.reading} color={colors.accentCore} />
          <AppText variant="body" style={{ fontFamily: fonts.sansSemiBold, marginLeft: spacing.xs }}>{SETTINGS_TEXT.privacy.title}</AppText>
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
          {SETTINGS_TEXT.privacy.body}
        </AppText>
      </View>

      <AppText variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.lg }}>
        {SETTINGS_TEXT.footer}
      </AppText>
    </Screen>
  );
}

function Row({ icon, title, body, children }: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  const { colors } = useCoreTheme();
  return (
    <View style={styles.row}>
      <Feather name={icon} size={fontSizes.body} color={colors.textMuted} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <AppText variant="body" style={{ fontFamily: fonts.sansMedium }}>{title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>{body}</AppText>
      </View>
      {children}
    </View>
  );
}

function PressableLink({ icon, title, body, onPress }: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { colors } = useCoreTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.rows, styles.linkRow, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }, pressed && { opacity: 0.72 }]}
    >
      <Feather name={icon} size={fontSizes.body} color={colors.accentCore} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <AppText variant="body" style={{ fontFamily: fonts.sansMedium }}>{title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>{body}</AppText>
      </View>
      <Feather name="chevron-right" size={fontSizes.body} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { marginTop: spacing.md, marginBottom: spacing.lg },
  pillRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  rows: { borderWidth: 1, borderRadius: radii.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, minHeight: minTouch + spacing.lg, backgroundColor: 'transparent' },
  switchWrap: { minWidth: minTouch, minHeight: minTouch, alignItems: 'flex-end', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  poolRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xxs },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginTop: spacing.md, minHeight: minTouch },
});
