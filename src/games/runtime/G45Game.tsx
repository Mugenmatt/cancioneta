import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { TimerBadge } from '@/design/components/Feedback';
import { Pill } from '@/design/components/Primitives';
import { useGameTheme } from '@/design/ThemeProvider';
import { spacing } from '@/design/tokens';
import { remainingSeconds } from '@/editor/stimulusStatus';
import { G45_REST_MINUTES, G45_TEXT } from '@/content/games/g45';
import {
  canFinish,
  makeG45Draft,
  makeG45Stimulus,
  restDeadline,
  splitLines,
} from './g45Logic';
import { ActionBar, GameField, GameIntro, MiniButton, Note, PromptCard, runtimeStyles } from './ui';
import { useAudioCapture } from './useAudioCapture';
import { useOfflineTranscription } from './useOfflineTranscription';

type Section = 'low' | 'high';
type PairStage = 'idle' | 'low' | 'high' | 'done';

export function G45Game() {
  const theme = useGameTheme('g45');
  const low = useAudioCapture('g45-low');
  const high = useAudioCapture('g45-high');
  const activeSection = useRef<Section>('low');
  const finishedUri = useRef<string | null>(null);

  const [lowText, setLowText] = useState('');
  const [highText, setHighText] = useState('');
  const [connection, setConnection] = useState('');
  const [addPreChorus, setAddPreChorus] = useState(false);
  const [preChorus, setPreChorus] = useState('');
  const [centralLine, setCentralLine] = useState('');
  const [pairStage, setPairStage] = useState<PairStage>('idle');
  const [restAt, setRestAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [returned, setReturned] = useState(false);

  const transcription = useOfflineTranscription((text) => {
    if (activeSection.current === 'low') setLowText(text);
    else setHighText(text);
  });

  const { playFromStart: playHigh, pause: pauseHigh } = high;
  const playBoth = () => {
    if (!low.audioUri || !high.audioUri) return;
    finishedUri.current = null;
    setPairStage('low');
    low.playFromStart();
  };

  useEffect(() => {
    if (pairStage === 'low' && low.didJustFinish && finishedUri.current !== low.audioUri && high.audioUri) {
      finishedUri.current = low.audioUri;
      setPairStage('high');
      playHigh();
    } else if (pairStage === 'high' && high.didJustFinish && finishedUri.current !== high.audioUri) {
      finishedUri.current = high.audioUri;
      setPairStage('done');
      pauseHigh();
    }
  }, [pairStage, low.didJustFinish, low.audioUri, high.audioUri, high.didJustFinish, playHigh, pauseHigh]);

  useEffect(() => {
    if (!restAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [restAt]);

  const restSeconds = remainingSeconds(restAt ?? undefined, now);
  const restFinished = restAt !== null && restSeconds <= 0;
  const showReturn = returned || restFinished;

  const transcribe = async (section: Section) => {
    const capture = section === 'low' ? low : high;
    const uri = capture.audioUri ?? await capture.stopRecording();
    if (!uri) return;
    activeSection.current = section;
    transcription.reset();
    transcription.start(uri);
  };

  const skipRest = () => {
    setRestAt(null);
    setReturned(true);
  };

  const finish = () => {
    if (transcription.transcribing) transcription.stop();
    low.pause();
    high.pause();
    low.clearAudio();
    high.clearAudio();
    setLowText('');
    setHighText('');
    setConnection('');
    setCentralLine('');
    setPreChorus('');
    setAddPreChorus(false);
    setPairStage('idle');
    setRestAt(null);
    setReturned(false);
  };

  const notice = low.notice ?? high.notice;
  const noticeText = notice
    ? { web: G45_TEXT.webNotice, permission: G45_TEXT.permissionDenied, recording: G45_TEXT.recordingError }[notice]
    : null;
  const canSend = canFinish(lowText, highText, connection);
  const draft = useMemo(
    () => makeG45Draft({ lowText, highText, connection, addPreChorus, preChorus, centralLine }),
    [lowText, highText, connection, addPreChorus, preChorus, centralLine],
  );
  const stimulus = useMemo(
    () => makeG45Stimulus({ lowText, highText, connection, addPreChorus, preChorus, centralLine }),
    [lowText, highText, connection, addPreChorus, preChorus, centralLine],
  );
  const chorusOptions = splitLines(highText);

  const sectionCard = (section: Section) => {
    const capture = section === 'low' ? low : high;
    const content = section === 'low' ? G45_TEXT.section1 : G45_TEXT.section2;
    const text = section === 'low' ? lowText : highText;
    const setText = section === 'low' ? setLowText : setHighText;
    return (
      <PromptCard theme={theme} eyebrow={content.eyebrow}>
        <Note theme={theme}>{content.instruction}</Note>
        <View style={runtimeStyles.row}>
          <Button
            label={capture.isRecording ? content.stop : content.record}
            small
            onPress={() => void (capture.isRecording ? capture.stopRecording() : capture.startRecording())}
            accent={theme.accent}
            accentInk={theme.accentInk}
          />
          {capture.audioUri ? (
            <Button
              label={content.listen}
              tone="secondary"
              small
              onPress={capture.togglePlayback}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          ) : null}
          {capture.audioUri && transcription.available ? (
            <Button
              label={content.transcribe}
              tone="secondary"
              small
              loading={transcription.transcribing}
              onPress={() => void transcribe(section)}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          ) : null}
        </View>
        {capture.isRecording ? (
          <AppText variant="caption" color={theme.accentText}>{G45_TEXT.recordSeconds(capture.recordingSeconds)}</AppText>
        ) : null}
        {transcription.manualAvailable || text ? (
          <GameField
            theme={theme}
            label={content.transcriptLabel}
            value={text}
            onChangeText={setText}
            placeholder={G45_TEXT.manualLabel}
            multiline
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
        {text ? <AppText variant="caption" color={theme.inkSoft}>{G45_TEXT.lineCount(splitLines(text).length)}</AppText> : null}
      </PromptCard>
    );
  };

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{G45_TEXT.intro}</GameIntro>
      <Note theme={theme}>{G45_TEXT.privacy}</Note>
      {noticeText ? <Note theme={theme}>{noticeText}</Note> : null}
      {transcription.manualAvailable ? <Note theme={theme}>{G45_TEXT.transcriptionUnavailable}</Note> : null}
      {transcription.error ? <Note theme={theme}>{G45_TEXT.transcriptionError}</Note> : null}
      {transcription.transcribing ? <Note theme={theme}>{G45_TEXT.transcribing}</Note> : null}

      {sectionCard('low')}
      {sectionCard('high')}

      <PromptCard theme={theme} eyebrow={G45_TEXT.playBoth}>
        <Button
          label={pairStage === 'done' ? G45_TEXT.listenAgain : G45_TEXT.playBoth}
          small
          disabled={!low.audioUri || !high.audioUri}
          onPress={playBoth}
          accent={theme.accent}
          accentInk={theme.accentInk}
        />
        {pairStage === 'done' ? <Note theme={theme}>{G45_TEXT.restDone}</Note> : null}
      </PromptCard>

      {low.audioUri && high.audioUri && !showReturn ? (
        <PromptCard theme={theme} eyebrow={G45_TEXT.restEyebrow}>
          <Note theme={theme}>{G45_TEXT.restIntro}</Note>
          <View style={runtimeStyles.row}>
            <Button
              label={G45_TEXT.startRest}
              small
              disabled={restAt !== null}
              onPress={() => {
                const startedAt = Date.now();
                setNow(startedAt);
                setRestAt(restDeadline(G45_REST_MINUTES, startedAt));
              }}
              accent={theme.accent}
              accentInk={theme.accentInk}
            />
            <Button
              label={G45_TEXT.skipRest}
              tone="secondary"
              small
              onPress={skipRest}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          </View>
          {restAt ? (
            <View style={runtimeStyles.row}>
              <TimerBadge seconds={restSeconds} running={restSeconds > 0} accent={theme.accent} accentText={theme.accentText} />
              <AppText variant="caption" color={theme.inkSoft}>{G45_TEXT.restRunning}</AppText>
              <MiniButton label={G45_TEXT.skipRest} theme={theme} onPress={skipRest} />
            </View>
          ) : null}
        </PromptCard>
      ) : null}

      {showReturn ? (
        <PromptCard theme={theme} eyebrow={G45_TEXT.connectionQuestion}>
          <Note theme={theme}>{G45_TEXT.lineCountHint}</Note>
          <GameField
            theme={theme}
            label={G45_TEXT.connectionQuestion}
            value={connection}
            onChangeText={setConnection}
            placeholder={G45_TEXT.connectionPlaceholder}
            multiline
          />
          <AppText variant="label" color={theme.accentText} style={{ marginTop: spacing.sm }}>{G45_TEXT.optionsEyebrow}</AppText>
          <Note theme={theme}>{G45_TEXT.verseChorus}</Note>
          <View style={runtimeStyles.row}>
            <Pill label={G45_TEXT.addPreChorus} selected={addPreChorus} color={theme.accentText} onPress={() => setAddPreChorus((value) => !value)} />
          </View>
          {addPreChorus ? (
            <GameField
              theme={theme}
              value={preChorus}
              onChangeText={setPreChorus}
              placeholder={G45_TEXT.preChorusPlaceholder}
              multiline
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
          <AppText variant="label" color={theme.accentText} style={{ marginTop: spacing.sm }}>{G45_TEXT.chorusLineTitle}</AppText>
          <View style={runtimeStyles.row}>
            {chorusOptions.map((line, index) => (
              <MiniButton key={`${index}-${line}`} label={G45_TEXT.chooseLine(line)} theme={theme} onPress={() => setCentralLine(line)} />
            ))}
          </View>
          {centralLine ? <Note theme={theme}>{G45_TEXT.chosenLine(centralLine)}</Note> : null}
        </PromptCard>
      ) : null}

      {!low.audioUri || !high.audioUri ? <Note theme={theme}>{G45_TEXT.noAudio}</Note> : null}
      <View style={runtimeStyles.row}>
        <Button label={G45_TEXT.finish} tone="danger" small onPress={finish} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <ActionBar text={draft} stimulus={stimulus} theme={theme} sendLabel={G45_TEXT.send} disabled={!canSend} />
    </View>
  );
}
