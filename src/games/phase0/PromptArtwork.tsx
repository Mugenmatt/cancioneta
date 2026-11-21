import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { PoolItem } from '@/core/types';
import { PHASE0_CONTENT } from '@/content/phase0';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, radii, spacing } from '@/design/tokens';

function metadataNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const IMAGE_HEADERS = { 'User-Agent': 'Cancioneta/1.0' };

export function PromptArtwork({ item }: { item: PoolItem }) {
  const theme = useGameTheme('f0-3');
  const [failed, setFailed] = useState(false);
  const seed = metadataNumber(item.extra?.seed, 1);
  const palette = metadataNumber(item.extra?.palette, 0);
  const form = metadataNumber(item.extra?.form, 0);
  const tones = [alpha(theme.accent, 0.42), alpha(theme.ink, 0.16), alpha(theme.accent, 0.2), alpha(theme.ink, 0.1)];
  const showPhoto = Boolean(item.externalLink) && !failed;

  return (
    <View style={[styles.canvas, { backgroundColor: alpha(theme.accent, 0.07) }]} accessibilityLabel={item.externalLink ? item.text : PHASE0_CONTENT.prompt.originalComposition}>
      {showPhoto ? (
        <Image
          source={{ uri: item.externalLink, headers: IMAGE_HEADERS }}
          style={styles.photo}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : tones.map((tone, index) => (
        <View
          key={`${item.fingerprint}-${index}`}
          style={{
            position: 'absolute',
            left: spacing.xs * ((seed + index + palette) % 5),
            top: spacing.xs * ((palette + index * 2) % 4),
            width: spacing.xl + ((form + index) % 3) * spacing.md,
            height: spacing.lg + ((seed + index) % 3) * spacing.sm,
            borderRadius: index % 2 === 0 ? radii.card : radii.chip,
            backgroundColor: tone,
            transform: [{ rotate: `${((form + index) % 4) * 12 - 18}deg` }],
          }}
        />
      ))}
      <View style={[styles.rule, { backgroundColor: alpha(theme.accent, 0.5) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { height: spacing.xxxl * 3, borderRadius: radii.card, overflow: 'hidden' },
  photo: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' },
  rule: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, height: spacing.xxs },
});
