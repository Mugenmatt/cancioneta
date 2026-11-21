import { useCallback, useEffect, useMemo, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { MiniButton, ActionBar, GameField, GameIntro, Note, PromptCard, runtimeStyles } from '@/games/runtime/ui';
import { useGameTheme } from '@/design/ThemeProvider';
import { fontSizes, fonts, lineHeights, spacing } from '@/design/tokens';
import { randomService } from '@/services/random/RandomService';
import { PHASE0_CONTENT } from '@/content/phase0';
import { PromptArtwork } from './PromptArtwork';
import { createPromptController, type PromptState, type PromptTarget } from './controllers';
import { getPageProgress, PROSE_MAX_PAGES } from './logic';

const SWIPE_DISTANCE = spacing.xxl;

export function PromptGame() {
  const theme = useGameTheme('f0-3');
  const controller = useMemo(() => createPromptController(randomService), []);
  const [state, setState] = useState<PromptState>(() => controller.getState());
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const progress = getPageProgress(text, PROSE_MAX_PAGES);

  const deal = useCallback(async (target: PromptTarget) => {
    setLoading(true);
    const next = await controller.deal(target);
    setState(next);
    setLoading(false);
  }, [controller]);

  useEffect(() => {
    let active = true;
    void controller.deal('both').then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, [controller]);

  const createSwipeResponder = useCallback((target: 'prompt' | 'image') => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) >= SWIPE_DISTANCE) void deal(target);
    },
  }), [deal]);

  const promptSwipe = useMemo(() => createSwipeResponder('prompt'), [createSwipeResponder]);
  const imageSwipe = useMemo(() => createSwipeResponder('image'), [createSwipeResponder]);
  const message = state.error ? PHASE0_CONTENT.prompt.error : loading ? PHASE0_CONTENT.prompt.loading : PHASE0_CONTENT.prompt.intro;
  const license = state.image ? PHASE0_CONTENT.prompt.license[state.image.license] : '';

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{message}</GameIntro>

      <View style={styles.pair}>
        <View {...promptSwipe.panHandlers}>
          <PromptCard theme={theme} eyebrow={PHASE0_CONTENT.prompt.promptEyebrow}>
            <AppText style={[styles.prompt, { color: theme.ink }]}>
              {state.prompt?.text ?? PHASE0_CONTENT.prompt.loading}
            </AppText>
            <View style={styles.control}>
              <MiniButton
                label={PHASE0_CONTENT.prompt.nextPrompt}
                theme={theme}
                disabled={loading}
                icon="refresh-cw"
                onPress={() => void deal('prompt')}
              />
            </View>
          </PromptCard>
        </View>

        <View {...imageSwipe.panHandlers}>
          <PromptCard theme={theme} eyebrow={PHASE0_CONTENT.prompt.imageEyebrow}>
            {state.image ? <PromptArtwork item={state.image} /> : null}
            <AppText style={[styles.imageTitle, { color: theme.ink }]}>{state.image?.text ?? PHASE0_CONTENT.prompt.loading}</AppText>
            <AppText variant="caption" color={theme.inkSoft}>
              {`${PHASE0_CONTENT.prompt.attributionLabel}: ${state.image?.attribution ?? PHASE0_CONTENT.prompt.originalComposition}`}
            </AppText>
            <AppText variant="caption" color={theme.inkSoft}>
              {`${PHASE0_CONTENT.prompt.licenseLabel}: ${license}`}
            </AppText>
            <View style={styles.control}>
              <MiniButton
                label={PHASE0_CONTENT.prompt.nextImage}
                theme={theme}
                disabled={loading}
                icon="refresh-cw"
                onPress={() => void deal('image')}
              />
            </View>
          </PromptCard>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label={PHASE0_CONTENT.prompt.changeBoth}
          small
          loading={loading}
          onPress={() => void deal('both')}
          accent={theme.accent}
          accentInk={theme.accentInk}
        />
      </View>

      <Note theme={theme}>{PHASE0_CONTENT.prompt.swipeNote}</Note>
      <Note theme={theme}>
        {PHASE0_CONTENT.pages.progressLabel(progress.page, progress.totalPages, progress.wordsIntoPage, progress.targetWords / progress.totalPages)}
      </Note>
      <Note theme={theme}>{PHASE0_CONTENT.prompt.proseGoal}</Note>

      <GameField
        theme={theme}
        label={PHASE0_CONTENT.common.writingLabel}
        value={text}
        onChangeText={setText}
        placeholder={PHASE0_CONTENT.prompt.placeholder}
        multiline
        style={styles.field}
      />

      <Note theme={theme}>{PHASE0_CONTENT.common.privacyNote}</Note>
      <ActionBar text={text} theme={theme} sendLabel={PHASE0_CONTENT.prompt.sendLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  pair: { gap: spacing.md },
  prompt: { fontFamily: fonts.displayItalic, fontSize: fontSizes.lead, lineHeight: fontSizes.lead * lineHeights.body },
  imageTitle: { fontFamily: fonts.sansSemiBold, fontSize: fontSizes.body, marginTop: spacing.sm },
  control: { marginTop: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  field: { minHeight: spacing.xxxl * 4 },
});
