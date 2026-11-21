import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCoreTheme } from '@/design/ThemeProvider';
import { Screen } from '@/design/components/Screen';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill, SectionLabel } from '@/design/components/Primitives';
import { Sheet } from '@/design/components/Sheet';
import { alpha, fonts, radii, spacing } from '@/design/tokens';
import { dataService } from '@/services/data/DataService';
import type { PoolId, PoolItem } from '@/core/types';

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'words', label: 'Palabras' },
  { id: 'culture', label: 'Cultura' },
  { id: 'prompts', label: 'Consignas' },
  { id: 'dice', label: 'Dados' },
  { id: 'images', label: 'Imágenes' },
] as const;

const WORDS: PoolId[] = ['words.noun', 'words.verb', 'words.adj'];
const CULTURE: PoolId[] = ['titles', 'characters', 'songs', 'poems_songs_ref', 'quote_public', 'script_phrases'];
const PROMPTS: PoolId[] = ['prompts', 'situations', 'restrictions', 'themes', 'universes', 'sensory_questions', 'cutup_texts', 'portal_seeds', 'confession_topics', 'letter_triggers', 'spy_questions'];
const DICE: PoolId[] = ['dice_lugar', 'dice_personaje', 'dice_objeto', 'dice_accion', 'dice_emocion', 'dice_cualidad'];

const POOL_LABEL: Partial<Record<PoolId, string>> = {
  'words.noun': 'Sustantivo', 'words.verb': 'Verbo', 'words.adj': 'Adjetivo',
  titles: 'Título', characters: 'Personaje', songs: 'Canción', poems_songs_ref: 'Poema / canción',
  quote_public: 'Cita', script_phrases: 'Guion', prompts: 'Consigna', situations: 'Situación',
  restrictions: 'Restricción', themes: 'Tema', universes: 'Universo', sensory_questions: 'Sentido',
  cutup_texts: 'Cut-up', portal_seeds: 'Portal', confession_topics: 'Confesión',
  letter_triggers: 'Carta', spy_questions: 'Espía', images: 'Imagen',
  dice_lugar: 'Dado · lugar', dice_personaje: 'Dado · personaje', dice_objeto: 'Dado · objeto',
  dice_accion: 'Dado · acción', dice_emocion: 'Dado · emoción', dice_cualidad: 'Dado · cualidad',
};

const LICENSE_LABEL: Record<PoolItem['license'], string> = {
  original: 'Original',
  public_domain: 'Dominio público',
  cc0: 'CC0',
  cc_by: 'CC BY',
  cc_by_sa: 'CC BY-SA',
  metadata_only: 'Solo metadatos',
  permission: 'Con permiso',
};

export default function MaterialScreen() {
  const { colors } = useCoreTheme();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PoolItem | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const report = dataService.getReport();

  const pools = useMemo<PoolId[] | undefined>(() => {
    if (filter === 'words') return WORDS;
    if (filter === 'culture') return CULTURE;
    if (filter === 'prompts') return PROMPTS;
    if (filter === 'dice') return DICE;
    if (filter === 'images') return ['images'];
    return undefined;
  }, [filter]);

  const items = useMemo(() => {
    if (query.trim()) return dataService.search(query, pools).slice(0, 50);
    const source = pools ? pools.flatMap((pool) => dataService.getPool(pool)) : dataService.getAll();
    return source.filter((item) => item.pool !== 'games').slice(0, 60);
  }, [query, pools]);

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Screen scroll>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={colors.accentCore}>Material</AppText>
          <AppText variant="title" style={{ marginTop: 4 }}>Palabras y mundos</AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
            {report.totalItems} piezas de prueba. Todo se puede buscar.
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver créditos"
          onPress={() => setCreditsOpen(true)}
          style={[styles.credits, { borderColor: colors.lineSubtle }]}
        >
          <Feather name="info" size={17} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.search, { backgroundColor: colors.bgRaised, borderColor: colors.lineSubtle }]}>
        <Feather name="search" size={17} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar una palabra, un título, una consigna…"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Buscar en el material"
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.sans }]}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')}>
            <Feather name="x-circle" size={17} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filters}>
        {FILTERS.map((entry) => (
          <Pill
            key={entry.id}
            label={entry.label}
            selected={filter === entry.id}
            onPress={() => setFilter(entry.id)}
          />
        ))}
      </View>

      <View style={[styles.notice, { borderColor: alpha(colors.stateWarning, 0.35), backgroundColor: alpha(colors.stateWarning, 0.08) }]}>
        <Feather name="alert-circle" size={15} color={colors.stateWarning} />
        <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: 8 }}>
          Este paquete es contenido original de prueba. Las fichas culturales muestran solo metadatos y enlaces.
        </AppText>
      </View>

      <SectionLabel color={colors.textMuted}>{items.length} resultados</SectionLabel>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={`${item.pool}:${item.id}`}
            accessibilityRole="button"
            accessibilityLabel={item.text}
            onPress={() => { setSelected(item); setCopied(false); }}
            style={({ pressed }) => [
              styles.row,
              { borderColor: colors.lineSubtle, backgroundColor: colors.bgRaised },
              pressed && { opacity: 0.75 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={colors.accentCore} style={{ fontFamily: fonts.sansSemiBold, fontSize: 10 }}>
                {POOL_LABEL[item.pool] ?? item.pool}
              </AppText>
              <AppText variant="body" style={{ fontFamily: fonts.serif, marginTop: 3 }} numberOfLines={2}>
                {item.text}
              </AppText>
              {item.author || item.work ? (
                <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 3 }} numberOfLines={1}>
                  {[item.author, item.work, item.year].filter(Boolean).join(' · ')}
                </AppText>
              ) : null}
            </View>
            <Feather name="chevron-right" size={17} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Sheet visible={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? POOL_LABEL[selected.pool] ?? 'Material' : ''}>
        {selected ? (
          <View>
            <AppText style={styles.detailText}>{selected.text}</AppText>
            {selected.author || selected.work ? (
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
                {[selected.author, selected.work, selected.year].filter(Boolean).join(' · ')}
              </AppText>
            ) : null}
            <View style={styles.metaRow}>
              <View style={[styles.meta, { borderColor: colors.lineSubtle }]}>
                <AppText variant="caption" color={colors.textMuted}>{LICENSE_LABEL[selected.license]}</AppText>
              </View>
              {selected.tags?.slice(0, 3).map((tag) => (
                <View key={tag} style={[styles.meta, { borderColor: colors.lineSubtle }]}>
                  <AppText variant="caption" color={colors.textMuted}>#{tag}</AppText>
                </View>
              ))}
            </View>
            {selected.externalLink ? (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Abrir enlace externo"
                onPress={() => void Linking.openURL(selected.externalLink as string)}
                style={{ marginTop: spacing.md }}
              >
                <AppText variant="caption" color={colors.accentCore}>
                  Abrir enlace para investigar
                </AppText>
              </Pressable>
            ) : null}
            <View style={styles.sheetActions}>
              <Button label={copied ? 'Copiado' : 'Copiar'} onPress={() => void copy(selected.text)} tone="secondary" />
            </View>
          </View>
        ) : null}
      </Sheet>

      <Sheet visible={creditsOpen} onClose={() => setCreditsOpen(false)} title="Créditos y licencias">
        {dataService.getCredits().map((entry) => (
          <View key={entry.source} style={[styles.credit, { borderColor: colors.lineSubtle }]}>
            <AppText variant="caption" color={colors.textPrimary} style={{ fontFamily: fonts.sansSemiBold }}>
              {entry.source}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 3 }}>
              {entry.attribution}
            </AppText>
            <AppText variant="caption" color={colors.accentCore} style={{ marginTop: 3 }}>
              {entry.license}
            </AppText>
          </View>
        ))}
        <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          La revisión legal de citas protegidas sigue pendiente. Hasta entonces, la app solo incluye material original, de dominio público o metadatos.
        </AppText>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md, marginBottom: spacing.lg },
  credits: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.field, paddingHorizontal: spacing.sm, minHeight: 48 },
  searchInput: { flex: 1, marginLeft: spacing.xs, fontSize: 15, paddingVertical: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md, marginBottom: spacing.md },
  notice: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, marginBottom: spacing.lg },
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.field, padding: spacing.sm, minHeight: 60, gap: spacing.xs },
  detailText: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 34 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  meta: { borderWidth: 1, borderRadius: radii.chip, paddingHorizontal: 10, paddingVertical: 4 },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  credit: { borderTopWidth: 1, paddingVertical: spacing.sm },
});
