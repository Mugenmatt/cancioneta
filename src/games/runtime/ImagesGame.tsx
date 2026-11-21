import { useCallback, useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { AppText } from '@/design/components/Text';
import { Pill } from '@/design/components/Primitives';
import { ActionBar, Note } from './ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { randomService } from '@/services/random/RandomService';
import type { PoolItem } from '@/core/types';
import { licenseLabel } from '@/content/games/common';
import { IMAGES_TEXT } from '@/content/games/g19';
import { alpha, fonts, spacing } from '@/design/tokens';

const IMAGE_HEADERS = { 'User-Agent': 'Cancioneta/1.0' };

const PALETTES: [string, string][] = [
  ['#7C8FA3', '#27384A'], ['#C66A4A', '#4A1D14'], ['#8A9B91', '#27352D'],
  ['#9BA66D', '#38421F'], ['#7A6A9A', '#2A2038'], ['#D6B36A', '#5A3E12'],
];

export function ImagesGame() {
  const theme = useGameTheme('g19');
  const [mode, setMode] = useState<'random' | 'thematic'>('random');
  const [images, setImages] = useState<(PoolItem | null)[]>([null, null, null]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const drawSet = useCallback(async (nextMode: 'random' | 'thematic') => {
    setFailed({});
    if (nextMode === 'random') {
      const next = await randomService.draw('images', 3);
      setImages([next[0] ?? null, next[1] ?? null, next[2] ?? null]);
      return;
    }
    const [first] = await randomService.draw('images', 1);
    const tag = first?.tags?.[0];
    const rest = tag
      ? await randomService.draw('images', 2, { filter: (item) => Boolean(item.tags?.includes(tag)) })
      : await randomService.draw('images', 2);
    setImages([first ?? null, rest[0] ?? null, rest[1] ?? null]);
  }, []);

  useEffect(() => { void Promise.resolve().then(() => { void drawSet('random'); }); }, [drawSet]);

  const replace = async (index: number) => {
    const previous = images[index];
    if (previous) setFailed((current) => ({ ...current, [previous.fingerprint]: false }));
    if (mode === 'thematic') {
      const anchor = images.find((item, i) => i !== index && item?.tags?.length)?.tags?.[0];
      const [next] = await randomService.draw('images', 1, anchor ? { filter: (item) => Boolean(item.tags?.includes(anchor)) } : {});
      setImages((current) => current.map((item, i) => (i === index ? next ?? item : item)));
      return;
    }
    const [next] = await randomService.draw('images', 1);
    setImages((current) => current.map((item, i) => (i === index ? next ?? item : item)));
  };

  const setModeAndDraw = (nextMode: 'random' | 'thematic') => {
    setMode(nextMode);
    void drawSet(nextMode);
  };

  const body = images.filter((item): item is PoolItem => Boolean(item))
    .map((item) => IMAGES_TEXT.bodyLine(item, licenseLabel(item.license))).join('\n');

  return (
    <View>
      <Note theme={theme}>{IMAGES_TEXT.intro}</Note>
      <View style={styles.pills}>
        <Pill label={IMAGES_TEXT.random} selected={mode === 'random'} onPress={() => setModeAndDraw('random')} color={theme.accentText} />
        <Pill label={IMAGES_TEXT.thematic} selected={mode === 'thematic'} onPress={() => setModeAndDraw('thematic')} color={theme.accentText} />
      </View>
      <View style={styles.grid}>
        {images.map((item, index) => {
          const palette = PALETTES[Number(item?.extra?.palette ?? index) % PALETTES.length];
          return (
            <View key={index} style={styles.slot}>
              <Pressable accessibilityRole="button" accessibilityLabel={IMAGES_TEXT.open(item?.text ?? IMAGES_TEXT.titleFallback)} onPress={() => item && setOpenIndex(index)} style={styles.imageButton}>
                <LinearGradient colors={palette} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.image}>
                  {item?.externalLink && !failed[item.fingerprint] ? (
                    <Image
                      source={{ uri: item.externalLink, headers: IMAGE_HEADERS }}
                      resizeMode="cover"
                      style={StyleSheet.absoluteFill}
                      onError={() => item && setFailed((current) => ({ ...current, [item.fingerprint]: true }))}
                    />
                  ) : (
                    <View style={[styles.form, { borderColor: alpha('#FFFFFF', 0.5) }]} />
                  )}
                  <AppText style={styles.number}>{String(Number(item?.extra?.seed ?? index + 1)).padStart(2, '0')}</AppText>
                  <AppText variant="caption" color="#FFFFFF" style={{ fontFamily: fonts.sansSemiBold }}>
                    {item?.text ?? IMAGES_TEXT.loading}
                  </AppText>
                </LinearGradient>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={IMAGES_TEXT.change} onPress={() => void replace(index)} style={styles.replace}>
                <Feather name="refresh-cw" size={12} color={theme.accentText} />
                <AppText variant="caption" color={theme.accentText} style={{ marginLeft: 4 }}>{IMAGES_TEXT.change}</AppText>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={styles.source}>
        <Feather name="image" size={14} color={theme.accentText} />
        <AppText variant="caption" color={theme.inkSoft} style={{ flex: 1, marginLeft: 6 }}>
          {IMAGES_TEXT.sourceNote}
        </AppText>
      </View>
      <ActionBar text={body} theme={theme} />

      <Modal visible={openIndex !== null} transparent animationType="fade" onRequestClose={() => setOpenIndex(null)}>
        <View style={styles.modal}>
          <Pressable accessibilityRole="button" accessibilityLabel={IMAGES_TEXT.close} onPress={() => setOpenIndex(null)} style={styles.close}>
            <Feather name="x" size={26} color="#FFFFFF" />
          </Pressable>
          {openIndex !== null ? (
            <LinearGradient colors={PALETTES[Number(images[openIndex]?.extra?.palette ?? openIndex) % PALETTES.length]} style={styles.fullImage}>
              {images[openIndex]?.externalLink && !failed[images[openIndex]!.fingerprint] ? (
                <Image
                  source={{ uri: images[openIndex]?.externalLink, headers: IMAGE_HEADERS }}
                  resizeMode="contain"
                  style={StyleSheet.absoluteFill}
                  onError={() => {
                    const item = images[openIndex];
                    if (item) setFailed((current) => ({ ...current, [item.fingerprint]: true }));
                  }}
                />
              ) : (
                <View style={[styles.bigForm, { borderColor: alpha('#FFFFFF', 0.45) }]} />
              )}
              <AppText style={styles.bigNumber}>{String(Number(images[openIndex]?.extra?.seed ?? openIndex + 1)).padStart(2, '0')}</AppText>
              <AppText variant="label" color="#FFFFFF">{images[openIndex]?.text}</AppText>
                <AppText variant="caption" color="#FFFFFF" style={{ marginTop: 6 }}>
                {IMAGES_TEXT.bodyLine(images[openIndex]!, licenseLabel(images[openIndex]!.license))}
              </AppText>
            </LinearGradient>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  grid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  slot: { flex: 1 },
  imageButton: { borderRadius: 14, overflow: 'hidden' },
  image: { aspectRatio: 0.72, padding: spacing.sm, justifyContent: 'flex-end' },
  form: { position: 'absolute', top: '18%', left: '18%', width: '55%', height: '42%', borderRadius: 999, borderWidth: 1 },
  number: { position: 'absolute', top: 8, right: 9, fontFamily: fonts.sansBold, color: '#FFFFFF', fontSize: 11 },
  replace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 32, marginTop: 4 },
  source: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', padding: spacing.lg, justifyContent: 'center' },
  close: { position: 'absolute', top: 48, right: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  fullImage: { width: '100%', aspectRatio: 0.78, borderRadius: 22, padding: spacing.xl, justifyContent: 'flex-end', overflow: 'hidden' },
  bigForm: { position: 'absolute', top: '12%', left: '16%', width: '58%', height: '48%', borderRadius: 999, borderWidth: 1 },
  bigNumber: { position: 'absolute', top: 18, right: 22, fontFamily: fonts.sansBold, color: '#FFFFFF', fontSize: 14 },
});
