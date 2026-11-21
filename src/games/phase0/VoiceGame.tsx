import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import {
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fontSizes, fonts, lineHeights, radii, spacing } from '@/design/tokens';
import { ActionBar, GameIntro, Note, PromptCard, runtimeStyles } from '@/games/runtime/ui';
import { PHASE0_CONTENT } from '@/content/phase0';
import { ignoreError, removeTemporaryAudio, temporaryRecordingOptions } from './audio';
import {
  appendTranscriptChunk,
  createFragments,
  editFragment,
  exportFragments,
  hasOfflineSpanish,
  splitIntoSentences,
  type Fragment,
  type Phrase,
} from './logic';
import { FragmentList, PhraseList } from './VoicePieces';
import { VoiceWave } from './VoiceWave';

const noticeText = {
  unavailable: PHASE0_CONTENT.voice.unavailableNotice,
  permission: PHASE0_CONTENT.voice.permissionDenied,
  recording: PHASE0_CONTENT.voice.recordingError,
  transcription: PHASE0_CONTENT.voice.transcriptionError,
  selection: PHASE0_CONTENT.voice.emptySelection,
} as const;

type NoticeKey = keyof typeof noticeText;

export function VoiceGame() {
  const theme = useGameTheme('f0-1');
  const options = useMemo(() => temporaryRecordingOptions(), []);
  const recorder = useAudioRecorder(options);
  const recorderStatus = useAudioRecorderState(recorder);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri);
  const playerStatus = useAudioPlayerStatus(player);
  const audioUriRef = useRef<string | null>(null);
  const [offlineAvailable, setOfflineAvailable] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [notice, setNotice] = useState<NoticeKey | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const phrases = useMemo<Phrase[]>(
    () => splitIntoSentences(transcript).map((phrase) => ({ ...phrase, selected: selectedIds.has(phrase.id) })),
    [transcript, selectedIds],
  );
  const exportedText = useMemo(() => exportFragments(fragments), [fragments]);
  const manualAvailable = (!offlineAvailable && !checkingAvailability) || notice === 'transcription';

  const assignAudioUri = useCallback((uri: string | null) => {
    audioUriRef.current = uri;
    setAudioUri(uri);
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscript('');
    setSelectedIds(new Set());
    setFragments([]);
  }, []);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const supported = ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
        const locales = await ExpoSpeechRecognitionModule.getSupportedLocales({});
        if (active) setOfflineAvailable(hasOfflineSpanish(supported, locales));
      } catch {
        if (active) setOfflineAvailable(false);
      } finally {
        if (active) setCheckingAvailability(false);
      }
    };
    void check();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => {
    if (recorder.isRecording) void recorder.stop().catch(() => undefined);
    player.pause();
    ignoreError(() => ExpoSpeechRecognitionModule.abort());
    removeTemporaryAudio(audioUriRef.current);
    audioUriRef.current = null;
  }, [recorder, player]);

  useSpeechRecognitionEvent('result', (event) => {
    if (!event.isFinal) return;
    const chunk = event.results.map((result) => result.transcript).join(' ');
    setTranscript((current) => appendTranscriptChunk(current, chunk));
    setSelectedIds(new Set());
    setFragments([]);
  });

  useSpeechRecognitionEvent('end', () => setTranscribing(false));

  useSpeechRecognitionEvent('error', () => {
    setTranscribing(false);
    setNotice('transcription');
  });

  const startRecording = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setNotice('permission');
      return;
    }
    try {
      if (recorder.isRecording) await recorder.stop();
      removeTemporaryAudio(audioUriRef.current);
      assignAudioUri(null);
      await recorder.prepareToRecordAsync();
      recorder.record();
      clearTranscription();
      setNotice(null);
    } catch {
      setNotice('recording');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri ?? recorderStatus.url;
      if (uri) assignAudioUri(uri);
      else setNotice('recording');
    } catch {
      setNotice('recording');
    }
  };

  const togglePlayback = () => {
    if (!audioUri) return;
    if (playerStatus.playing) {
      player.pause();
      return;
    }
    if (player.duration > 0 && player.currentTime >= player.duration) void player.seekTo(0);
    player.play();
  };

  const startTranscription = () => {
    if (!audioUri || !offlineAvailable || transcribing) return;
    setNotice(null);
    clearTranscription();
    setTranscribing(true);
    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'es-ES',
        requiresOnDeviceRecognition: true,
        continuous: true,
        interimResults: false,
        addsPunctuation: true,
        audioSource: { uri: audioUri },
      });
    } catch {
      setTranscribing(false);
      setNotice('transcription');
    }
  };

  const stopTranscription = () => {
    ignoreError(() => ExpoSpeechRecognitionModule.stop());
    setTranscribing(false);
  };

  const saveFragments = () => {
    const selected = phrases.filter((phrase) => phrase.selected);
    if (selected.length === 0) {
      setNotice('selection');
      return;
    }
    setFragments(createFragments(selected));
    setNotice(null);
  };

  const finish = async () => {
    if (recorder.isRecording) {
      try {
        await recorder.stop();
      } catch {
        setNotice('recording');
      }
    }
    if (transcribing) stopTranscription();
    player.pause();
    removeTemporaryAudio(audioUriRef.current);
    assignAudioUri(null);
  };

  const steps = Object.values(PHASE0_CONTENT.voice.steps).join(' → ');

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{PHASE0_CONTENT.voice.intro}</GameIntro>
      <AppText variant="caption" color={theme.accentText}>{steps}</AppText>
      <Note theme={theme}>{PHASE0_CONTENT.voice.privacyNote}</Note>

      {manualAvailable ? <Note theme={theme}>{noticeText.unavailable}</Note> : null}
      {notice && notice !== 'unavailable' ? <Note theme={theme}>{noticeText[notice]}</Note> : null}

      <PromptCard theme={theme} eyebrow={PHASE0_CONTENT.voice.steps.recorder}>
        <VoiceWave active={recorderStatus.isRecording} />
        <View style={runtimeStyles.row}>
          <Button
            label={recorderStatus.isRecording ? PHASE0_CONTENT.voice.stopRecording : PHASE0_CONTENT.voice.record}
            small
            onPress={() => void (recorderStatus.isRecording ? stopRecording() : startRecording())}
            accent={theme.accent}
            accentInk={theme.accentInk}
          />
          {audioUri ? (
            <Button
              label={playerStatus.playing ? PHASE0_CONTENT.voice.pause : PHASE0_CONTENT.voice.play}
              tone="secondary"
              small
              onPress={togglePlayback}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          ) : null}
        </View>
        {audioUri && offlineAvailable ? (
          <View style={runtimeStyles.row}>
            <Button
              label={transcribing ? PHASE0_CONTENT.voice.stopTranscription : PHASE0_CONTENT.voice.transcribe}
              tone="secondary"
              small
              loading={transcribing}
              onPress={transcribing ? stopTranscription : startTranscription}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          </View>
        ) : null}
        {transcribing ? <Note theme={theme}>{PHASE0_CONTENT.voice.transcribing}</Note> : null}
      </PromptCard>

      {manualAvailable ? (
        <PromptCard theme={theme} eyebrow={PHASE0_CONTENT.voice.manualLabel}>
          <TextInput
            value={transcript}
            onChangeText={(value) => {
              setTranscript(value);
              setSelectedIds(new Set());
              setFragments([]);
            }}
            placeholder={PHASE0_CONTENT.voice.manualPlaceholder}
            placeholderTextColor={theme.inkSoft}
            multiline
            textAlignVertical="top"
            style={[styles.input, { color: theme.ink, borderColor: alpha(theme.ink, 0.22) }]}
          />
        </PromptCard>
      ) : null}

      {transcript.length > 0 ? (
        <PromptCard theme={theme} eyebrow={PHASE0_CONTENT.voice.steps.selection}>
          <Note theme={theme}>{PHASE0_CONTENT.voice.selectNote}</Note>
          <AppText variant="caption" color={theme.accentText}>{PHASE0_CONTENT.voice.selectedCount(phrases.filter((phrase) => phrase.selected).length)}</AppText>
          <PhraseList
            phrases={phrases}
            theme={theme}
            onToggle={(id) => setSelectedIds((current) => {
              const next = new Set(current);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })}
          />
          <Button
            label={PHASE0_CONTENT.voice.saveFragments}
            small
            onPress={saveFragments}
            accent={theme.accent}
            accentInk={theme.accentInk}
          />
        </PromptCard>
      ) : (
        <Note theme={theme}>{PHASE0_CONTENT.voice.noTranscript}</Note>
      )}

      {fragments.length > 0 ? (
        <PromptCard theme={theme} eyebrow={PHASE0_CONTENT.voice.steps.fragments}>
          <Note theme={theme}>{PHASE0_CONTENT.voice.originalNote}</Note>
          <FragmentList
            fragments={fragments}
            theme={theme}
            onEdit={(id, value) => setFragments((current) => editFragment(current, id, value))}
          />
        </PromptCard>
      ) : null}

      <View style={runtimeStyles.row}>
        <Button
          label={PHASE0_CONTENT.voice.exportAll}
          small
          disabled={fragments.length === 0}
          onPress={() => void Clipboard.setStringAsync(exportedText)}
          accent={theme.accent}
          accentInk={theme.accentInk}
        />
        <Button
          label={PHASE0_CONTENT.voice.finish}
          tone="danger"
          small
          onPress={() => void finish()}
          accent={theme.accent}
          accentInk={theme.accentInk}
        />
      </View>

      <ActionBar text={exportedText} theme={theme} sendLabel={PHASE0_CONTENT.voice.sendLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: spacing.xxxl * 2,
    borderWidth: 1,
    borderRadius: radii.field,
    padding: spacing.sm,
    fontFamily: fonts.serif,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * lineHeights.reading,
  },
});
