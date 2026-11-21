import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { BackButton, Pill, SectionLabel } from '@/design/components/Primitives';
import { fonts, radii, spacing } from '@/design/tokens';
import { useSettingsStore, type ThemePreference } from '@/stores/settingsStore';
import { dataService } from '@/services/data/DataService';
import { randomService } from '@/services/random/RandomService';

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'Sistema' },
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
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
      'Borrar memoria de sorteos',
      'Los juegos y pools podrán volver a mostrar material que ya viste. Tu letra no se toca.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => { void randomService.reset(); },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={{ paddingTop: spacing.sm }}>
      <BackButton label="Inicio" />

      <View style={styles.head}>
        <AppText variant="label" color={colors.accentCore}>Ajustes</AppText>
        <AppText variant="title" style={{ marginTop: 4 }}>Cómo se siente</AppText>
      </View>

      <SectionLabel color={colors.textMuted}>Apariencia</SectionLabel>
      <View style={styles.pillRow}>
        {THEMES.map((entry) => (
          <Pill key={entry.id} label={entry.label} selected={theme === entry.id} onPress={() => setTheme(entry.id)} />
        ))}
      </View>

      <View style={[styles.rows, { borderColor: colors.lineSubtle }]}>
        <Row icon="activity" title="Reducir movimiento" body="Menos animaciones y transiciones.">
          <Switch
            value={reduceMotion}
            onValueChange={setReduceMotion}
            trackColor={{ true: colors.accentCore, false: colors.lineStrong }}
            accessibilityLabel="Reducir movimiento"
          />
        </Row>
        <Row icon="type" title="Incluir nombres de secciones" body="Al exportar, agrega Verso, Estribillo, etc.">
          <Switch
            value={includeStructure}
            onValueChange={setIncludeStructure}
            trackColor={{ true: colors.accentCore, false: colors.lineStrong }}
            accessibilityLabel="Incluir nombres de secciones"
          />
        </Row>
      </View>

      <View style={[styles.card, { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised }]}>
        <View style={styles.cardHead}>
          <Feather name="database" size={18} color={colors.accentCore} />
          <AppText variant="body" style={{ fontFamily: fonts.sansSemiBold, marginLeft: 8 }}>Paquete de datos</AppText>
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
          {report.totalItems} piezas cargadas en {Object.keys(report.byPool).filter((key) => report.byPool[key] > 0).length} pools.
        </AppText>
        {topPools.map(([pool, count]) => (
          <View key={pool} style={styles.poolRow}>
            <AppText variant="caption" color={colors.textMuted}>{pool}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{count}</AppText>
          </View>
        ))}
      </View>

      <View style={[styles.rows, { borderColor: colors.lineSubtle }]}>
        <Row icon="shuffle" title="Memoria de sorteos" body="Los juegos evitan repetir hasta agotar el material.">
          <Button label="Borrar" tone="danger" small onPress={resetLedger} />
        </Row>
      </View>

      <PressableLink
        icon="compass"
        title="Introducción"
        body="Repasar qué se guarda y cómo empezar."
        onPress={() => { reviewOnboarding(); router.push('/onboarding'); }}
      />

      <PressableLink
        icon="book-open"
        title="Créditos y licencias"
        body="Ver fuentes del material y tipografías."
        onPress={() => router.push('/material')}
      />

      <View style={[styles.card, { borderColor: colors.lineSubtle }]}>
        <View style={styles.cardHead}>
          <Feather name="shield" size={18} color={colors.accentCore} />
          <AppText variant="body" style={{ fontFamily: fonts.sansSemiBold, marginLeft: 8 }}>Privacidad</AppText>
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm, lineHeight: 20 }}>
          Cancioneta no tiene cuentas, nube, analíticas ni anuncios. La letra, las grabaciones y los mapas viven en memoria o en archivos temporales. Solo se guardan ajustes y una huella técnica para no repetir sorteos.
        </AppText>
      </View>

      <AppText variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.lg }}>
        Cancioneta 0.1.0 · offline first
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
      <Feather name={icon} size={17} color={colors.textMuted} />
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
      <Feather name={icon} size={17} color={colors.accentCore} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <AppText variant="body" style={{ fontFamily: fonts.sansMedium }}>{title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>{body}</AppText>
      </View>
      <Feather name="chevron-right" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { marginTop: spacing.md, marginBottom: spacing.lg },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  rows: { borderWidth: 1, borderRadius: radii.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, minHeight: 64, backgroundColor: 'transparent' },
  card: { borderWidth: 1, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  poolRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginTop: spacing.md },
});
