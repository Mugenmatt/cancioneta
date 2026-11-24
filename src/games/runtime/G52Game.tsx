import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { spacing } from '@/design/tokens';
import { G52_TEXT } from '@/content/games/g52';
import { randomService } from '@/services/random/RandomService';
import {
  isDurationInRange,
  makeG52Draft,
  makeG52Stimulus,
  mixFragments,
  selectedTexts,
  splitFragments,
} from './g52Logic';
import { ActionBar, GameField, GameIntro, Note, PromptCard, runtimeStyles } from './ui';
import { useAudioCapture } from './useAudioCapture';
import { useOfflineTranscription } from './useOfflineTranscription';

export function G52Game() {
  const theme = useGameTheme('g52');
  const capture = useAudioCapture('g52');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [mixedItems, setMixedItems] = useState<string[] | null>(null);
  const [recordedSeconds, setRecordedSeconds] = useState(0);

  const transcription = useOfflineTranscription(() => {
    setSelectedIds(new Set());
    setMixedItems(null);
  });

  const fragments = useMemo(
    () => splitFragments(transcription.transcript).map((fragment) => ({
      ...fragment,
      selected: selectedIds.has(fragment.id),
    })),
    [transcription.transcript, selectedIds],
  );
  const chosen = selectedTexts(fragments);
  const draft = makeG52Draft(mixedItems ?? chosen);
  const stimulus = makeG52Stimulus(transcription.transcript, chosen);

  const stop = async () => {
    const seconds = capture.recordingSeconds;
    const uri = await capture.stopRecording();
    if (uri) setRecordedSeconds(seconds);
    return uri;
  };

  const transcribe = async () => {
    const uri = capture.audioUri ?? await stop();
    if (uri) transcription.start(uri);
  };

  const toggle = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setMixedItems(null);
  };

  const mix = () => {
    if (chosen.length === 0) return;
    setMixedItems(mixFragments(chosen, randomService));
  };

  const finish = () => {
    if (transcription.transcribing) transcription.stop();
    capture.clearAudio();
    transcription.reset();
    setSelectedIds(new Set());
    setMixedItems(null);
    setRecordedSeconds(0);
  };

  const notice = capture.notice;
  const noticeText = notice
    ? { web: G52_TEXT.webNotice, permission: G52_TEXT.permissionDenied, recording: G52_TEXT.recordingError }[notice]
    : null;

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{G52_TEXT.intro}</GameIntro>
      <Note theme={theme}>{G52_TEXT.privacy}</Note>
      {noticeText ? <Note theme={theme}>{noticeText}</Note> : null}
      {transcription.manualAvailable ? <Note theme={theme}>{G52_TEXT.transcriptionUnavailable}</Note> : null}
      {transcription.error ? <Note theme={theme}>{G52_TEXT.transcriptionError}</Note> : null}
      {transcription.transcribing ? <Note theme={theme}>{G52_TEXT.transcribing}</Note> : null}

      <PromptCard theme={theme} eyebrow={G52_TEXT.record}>
        <Note theme={theme}>{G52_TEXT.durationHint}</Note>
        <View style={runtimeStyles.row}>
          <Button
            label={capture.isRecording ? G52_TEXT.stop : G52_TEXT.record}
            small
            onPress={() => void (capture.isRecording ? stop() : capture.startRecording())}
            accent={theme.accent}
            accentInk={theme.accentInk}
          />
          {capture.audioUri ? (
            <Button
              label={G52_TEXT.listen}
              tone="secondary"
              small
              onPress={capture.togglePlayback}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          ) : null}
          {capture.audioUri && transcription.available ? (
            <Button
              label={G52_TEXT.transcribe}
              tone="secondary"
              small
              loading={transcription.transcribing}
              onPress={() => void transcribe()}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          ) : null}
        </View>
        {capture.isRecording ? (
          <AppText variant="caption" color={theme.accentText}>{G52_TEXT.recordingSeconds(capture.recordingSeconds)}</AppText>
        ) : null}
        {!capture.isRecording && capture.audioUri ? (
          <AppText variant="caption" color={theme.inkSoft}>
            {isDurationInRange(recordedSeconds) ? G52_TEXT.durationOk : G52_TEXT.durationOut}
          </AppText>
        ) : null}
      </PromptCard>

      {transcription.manualAvailable || transcription.transcript ? (
        <PromptCard theme={theme} eyebrow={G52_TEXT.transcriptEyebrow}>
          <Note theme={theme}>{G52_TEXT.transcriptNote}</Note>
          <GameField
            theme={theme}
            value={transcription.transcript}
            onChangeText={transcription.setTranscript}
            placeholder={G52_TEXT.manualLabel}
            multiline
            style={{ marginTop: spacing.sm }}
          />
        </PromptCard>
      ) : null}

      {fragments.length > 0 ? (
        <PromptCard theme={theme} eyebrow={G52_TEXT.fragmentEyebrow}>
          <Note theme={theme}>{G52_TEXT.markNote}</Note>
          <AppText variant="caption" color={theme.accentText}>{G52_TEXT.selectedCount(chosen.length)}</AppText>
          <View style={runtimeStyles.row}>
            {fragments.map((fragment) => (
              <Pill
                key={fragment.id}
                label={fragment.text}
                selected={fragment.selected}
                color={theme.accentText}
                onPress={() => toggle(fragment.id)}
              />
            ))}
          </View>
          <View style={runtimeStyles.row}>
            <Button
              label={G52_TEXT.mix}
              tone="secondary"
              small
              disabled={chosen.length === 0}
              onPress={mix}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          </View>
        </PromptCard>
      ) : null}

      {mixedItems ? (
        <PromptCard theme={theme} eyebrow={G52_TEXT.mixedLabel}>
          {mixedItems.map((line, index) => (
            <AppText key={`${index}-${line}`} style={runtimeStyles.text} color={theme.ink}>{line}</AppText>
          ))}
        </PromptCard>
      ) : null}

      {chosen.length === 0 && !mixedItems ? <Note theme={theme}>{G52_TEXT.emptySelection}</Note> : null}
      <View style={runtimeStyles.row}>
        <Button label={G52_TEXT.finish} tone="danger" small onPress={finish} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <ActionBar text={draft} stimulus={stimulus} theme={theme} sendLabel={G52_TEXT.send} disabled={chosen.length === 0} />
    </View>
  );
}
