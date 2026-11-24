import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { spacing } from '@/design/tokens';
import { G53_QUESTIONS, G53_TEXT } from '@/content/games/g53';
import {
  emptyAnswers,
  hasAnyAnswer,
  makeG53Draft,
  makeG53Stimulus,
  recordingLabel,
  secondsLeft,
  setAnswer,
} from './g53Logic';
import { ActionBar, GameField, GameIntro, Note, PromptCard, runtimeStyles } from './ui';
import { useAudioCapture } from './useAudioCapture';

export function G53Game() {
  const theme = useGameTheme('g53');
  const capture = useAudioCapture('g53');
  const [answers, setAnswers] = useState(emptyAnswers);

  const draft = useMemo(() => makeG53Draft(answers), [answers]);
  const stimulus = useMemo(() => makeG53Stimulus(answers), [answers]);

  const finish = () => {
    capture.clearAudio();
    setAnswers(emptyAnswers());
  };

  const notice = capture.notice;
  const noticeText = notice
    ? { web: G53_TEXT.webNotice, permission: G53_TEXT.permissionDenied, recording: G53_TEXT.recordingError }[notice]
    : null;

  return (
    <View style={runtimeStyles.stack}>
      <GameIntro theme={theme}>{G53_TEXT.intro}</GameIntro>
      <Note theme={theme}>{G53_TEXT.privacy}</Note>
      {noticeText ? <Note theme={theme}>{noticeText}</Note> : null}

      <PromptCard theme={theme} eyebrow={G53_TEXT.record}>
        <Note theme={theme}>{G53_TEXT.noTranscription}</Note>
        <View style={runtimeStyles.row}>
          <Button
            label={capture.isRecording ? G53_TEXT.stop : G53_TEXT.record}
            small
            onPress={() => void (capture.isRecording ? capture.stopRecording() : capture.startRecording())}
            accent={theme.accent}
            accentInk={theme.accentInk}
          />
          {capture.audioUri ? (
            <Button
              label={G53_TEXT.listen}
              tone="secondary"
              small
              onPress={capture.togglePlayback}
              accent={theme.accentText}
              accentInk={theme.accentInk}
            />
          ) : null}
        </View>
        {capture.isRecording ? (
          <AppText variant="caption" color={theme.accentText}>
            {recordingLabel(capture.recordingSeconds)} · {secondsLeft(capture.recordingSeconds)} s
          </AppText>
        ) : null}
        <Note theme={theme}>{G53_TEXT.canSkipAudio}</Note>
      </PromptCard>

      <PromptCard theme={theme} eyebrow={G53_TEXT.questionsEyebrow}>
        {G53_QUESTIONS.map((question) => (
          <GameField
            key={question.id}
            theme={theme}
            label={question.text}
            value={answers[question.id]}
            onChangeText={(value) => setAnswers((current) => setAnswer(current, question.id, value))}
            placeholder={question.placeholder}
            multiline
            style={{ marginTop: spacing.sm }}
          />
        ))}
      </PromptCard>

      <View style={runtimeStyles.row}>
        <Button label={G53_TEXT.finish} tone="danger" small onPress={finish} accent={theme.accent} accentInk={theme.accentInk} />
      </View>
      <ActionBar text={draft} stimulus={stimulus} theme={theme} sendLabel={G53_TEXT.send} disabled={!hasAnyAnswer(answers)} />
    </View>
  );
}
