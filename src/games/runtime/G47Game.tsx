import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design/components/Text';
import { Button } from '@/design/components/Button';
import { useGameTheme } from '@/design/ThemeProvider';
import { alpha, fonts, spacing } from '@/design/tokens';
import {
  G47_MODES, G47_RULES, G47_TEXT,
  type G47ModeId, type G47RuleId,
} from '@/content/games/g47';
import { practiceMetronome } from '@/services/audio/PracticeMetronome';
import { dataService } from '@/services/data/DataService';
import { isWebPlatform } from '@/services/export/TextFileService';
import { randomService } from '@/services/random/RandomService';
import {
  accentBeatFromDraw, makeStimulus, offbeatText, pulsePattern, ruleTitles,
  speakSingText, stepSeconds, twistedText,
} from './g47Logic';
import { useAudioCapture } from './useAudioCapture';
import { ActionBar, GameField, MiniButton, Note, PromptCard, runtimeStyles } from './ui';

const MODE_LABELS: Record<G47ModeId, string> = {
  twisted: G47_TEXT.modeTwisted,
  offbeat: G47_TEXT.modeOffbeat,
  speakSing: G47_TEXT.modeSpeakSing,
};

export function G47Game() {
  const theme = useGameTheme('g47');
  const isWeb = useMemo(() => isWebPlatform(), []);
  const capture = useAudioCapture('g47');
  const [mode, setMode] = useState<G47ModeId>('twisted');
  const [rules, setRules] = useState<G47RuleId[]>([]);
  const [melodyNote, setMelodyNote] = useState('');
  const [accentBeat, setAccentBeat] = useState(() => accentBeatFromDraw(randomService.int(4)));
  const [withOffbeats, setWithOffbeats] = useState(false);
  const [offbeatPhrase, setOffbeatPhrase] = useState('');
  const [phrase, setPhrase] = useState(() =>
    randomService.pickOne(dataService.getPool('mutant_proverbs'))?.text ?? '');
  const [singNotes, setSingNotes] = useState('');
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [activePulse, setActivePulse] = useState<number | null>(null);
  const [audioProblem, setAudioProblem] = useState(false);

  useEffect(() => () => practiceMetronome.stop(), []);

  const pulses = useMemo(() => pulsePattern(accentBeat, withOffbeats), [accentBeat, withOffbeats]);

  const stopMetronome = () => {
    practiceMetronome.stop();
    setMetronomeActive(false);
    setActivePulse(null);
  };

  const toggleMetronome = async () => {
    if (metronomeActive) {
      stopMetronome();
      return;
    }
    const started = await practiceMetronome.start(pulses, stepSeconds(withOffbeats), setActivePulse);
    setAudioProblem(!started);
    setMetronomeActive(started);
  };

  const changeAccent = () => {
    stopMetronome();
    setAccentBeat(accentBeatFromDraw(randomService.int(4)));
  };

  const toggleOffbeats = () => {
    stopMetronome();
    setWithOffbeats((current) => !current);
  };

  const toggleRule = (id: G47RuleId) => setRules((current) =>
    current.includes(id) ? current.filter((rule) => rule !== id) : [...current, id],
  );

  const draft = mode === 'twisted'
    ? twistedText({ rules, note: melodyNote })
    : mode === 'offbeat'
      ? offbeatText({ accentBeat, withOffbeats, phrase: offbeatPhrase })
      : speakSingText({ phrase, notes: singNotes });
  const ready = mode === 'twisted'
    ? Boolean(melodyNote.trim())
    : mode === 'offbeat'
      ? Boolean(offbeatPhrase.trim())
      : Boolean(phrase.trim() && singNotes.trim());
  const items = mode === 'twisted'
    ? [...ruleTitles(rules), melodyNote.trim()]
    : mode === 'offbeat'
      ? [offbeatPhrase.trim()]
      : [phrase.trim(), singNotes.trim()];
  const stimulus = makeStimulus(mode, items, mode === 'twisted'
    ? G47_TEXT.twisted.editorNote
    : mode === 'offbeat' ? G47_TEXT.offbeat.editorNote : G47_TEXT.speakSing.editorNote);

  return (
    <View>
      <Note theme={theme}>{G47_TEXT.intro}</Note>

      <View style={runtimeStyles.row}>
        {G47_MODES.map((id) => (
          <MiniButton
            key={id}
            label={MODE_LABELS[id]}
            theme={theme}
            onPress={() => { stopMetronome(); setMode(id); }}
          />
        ))}
      </View>

      {mode === 'twisted' ? (
        <View style={styles.block}>
          <Note theme={theme}>{G47_TEXT.twisted.step1}</Note>
          {isWeb ? <Note theme={theme}>{G47_TEXT.twisted.webNotice}</Note> : null}
          {capture.notice === 'permission' ? <Note theme={theme}>{G47_TEXT.twisted.permissionNotice}</Note> : null}
          {capture.notice === 'recording' ? <Note theme={theme}>{G47_TEXT.twisted.recordingNotice}</Note> : null}
          <View style={runtimeStyles.row}>
            <MiniButton
              label={capture.isRecording ? G47_TEXT.twisted.stop : G47_TEXT.twisted.record}
              icon={capture.isRecording ? 'square' : 'mic'}
              theme={theme}
              disabled={!capture.canRecord}
              onPress={() => void (capture.isRecording ? capture.stopRecording() : capture.startRecording())}
            />
            <MiniButton
              label={capture.isPlaying ? G47_TEXT.twisted.pause : G47_TEXT.twisted.play}
              icon={capture.isPlaying ? 'pause' : 'play'}
              theme={theme}
              disabled={!capture.audioUri}
              onPress={capture.togglePlayback}
            />
            <MiniButton
              label={G47_TEXT.twisted.clear}
              icon="trash-2"
              theme={theme}
              disabled={!capture.audioUri}
              onPress={capture.clearAudio}
            />
          </View>
          {capture.audioUri ? <Note theme={theme}>{G47_TEXT.twisted.audioReady}</Note> : null}
          <Note theme={theme}>{G47_TEXT.twisted.seconds(capture.recordingSeconds)}</Note>

          <Note theme={theme}>{G47_TEXT.twisted.step2}</Note>
          <PromptCard theme={theme} eyebrow={G47_TEXT.twisted.rulesEyebrow}>
            {G47_RULES.map((rule) => (
              <View key={rule.id} style={styles.rule}>
                <MiniButton
                  label={`${rules.includes(rule.id) ? '✓ ' : ''}${rule.title}`}
                  theme={theme}
                  onPress={() => toggleRule(rule.id)}
                />
                <Note theme={theme}>{rule.detail}</Note>
              </View>
            ))}
          </PromptCard>
          <GameField
            theme={theme}
            label={G47_TEXT.twisted.note}
            value={melodyNote}
            onChangeText={setMelodyNote}
            placeholder={G47_TEXT.twisted.notePlaceholder}
            multiline
            style={styles.block}
          />
        </View>
      ) : null}

      {mode === 'offbeat' ? (
        <View style={styles.block}>
          <Note theme={theme}>{G47_TEXT.offbeat.step1}</Note>
          <PromptCard theme={theme} eyebrow={G47_TEXT.offbeat.accentEyebrow}>
            <AppText style={runtimeStyles.strong} color={theme.accentText}>
              {G47_TEXT.offbeat.accent(accentBeat)}
            </AppText>
            <View style={runtimeStyles.row}>
              <MiniButton label={G47_TEXT.offbeat.anotherAccent} icon="refresh-cw" theme={theme} onPress={changeAccent} />
              <MiniButton
                label={`${withOffbeats ? '✓ ' : ''}${G47_TEXT.offbeat.advanced}`}
                theme={theme}
                onPress={toggleOffbeats}
              />
            </View>
          </PromptCard>
          <AppText variant="label" color={theme.accentText}>{G47_TEXT.offbeat.patternEyebrow}</AppText>
          <View style={runtimeStyles.row}>
            {pulses.map((pulse, index) => (
              <View
                key={`${pulse.label}-${index}`}
                style={[
                  styles.pulse,
                  {
                    borderColor: pulse.kind === 'accent' ? theme.accent : theme.inkSoft,
                    backgroundColor: activePulse === index
                      ? alpha(theme.accent, 0.3)
                      : pulse.kind === 'accent' ? alpha(theme.accent, 0.14) : alpha(theme.ink, 0.04),
                  },
                ]}
              >
                <AppText variant="label" color={pulse.kind === 'accent' ? theme.accentText : theme.ink}>
                  {pulse.label}
                </AppText>
              </View>
            ))}
          </View>
          <View style={runtimeStyles.row}>
            <Button
              label={metronomeActive ? G47_TEXT.offbeat.stop : G47_TEXT.offbeat.start}
              small
              onPress={() => void toggleMetronome()}
              accent={theme.accent}
              accentInk={theme.accentInk}
            />
          </View>
          {isWeb ? <Note theme={theme}>{G47_TEXT.offbeat.webNotice}</Note> : null}
          {audioProblem ? <Note theme={theme}>{G47_TEXT.offbeat.audioError}</Note> : null}
          <GameField
            theme={theme}
            label={G47_TEXT.offbeat.phrase}
            value={offbeatPhrase}
            onChangeText={setOffbeatPhrase}
            placeholder={G47_TEXT.offbeat.phrasePlaceholder}
            multiline
            style={styles.block}
          />
        </View>
      ) : null}

      {mode === 'speakSing' ? (
        <View style={styles.block}>
          <PromptCard theme={theme} eyebrow={G47_TEXT.speakSing.phraseEyebrow}>
            <AppText style={styles.phrase}>«{phrase}»</AppText>
            <MiniButton label={G47_TEXT.speakSing.drawPhrase} icon="refresh-cw" theme={theme} onPress={() => {
              void randomService.draw('mutant_proverbs', 1).then(([item]) => {
                if (item) setPhrase(item.text);
              });
            }} />
          </PromptCard>
          <Note theme={theme}>{G47_TEXT.speakSing.step1}</Note>
          <Note theme={theme}>{G47_TEXT.speakSing.step2}</Note>
          <Note theme={theme}>{G47_TEXT.speakSing.step3}</Note>
          <GameField
            theme={theme}
            label={G47_TEXT.speakSing.notes}
            value={singNotes}
            onChangeText={setSingNotes}
            placeholder={G47_TEXT.speakSing.notesPlaceholder}
            multiline
            style={styles.block}
          />
        </View>
      ) : null}

      <ActionBar
        text={draft}
        theme={theme}
        stimulus={stimulus}
        sendLabel={G47_TEXT.send}
        disabled={!ready}
      />
      <Note theme={theme}>{G47_TEXT.privacy}</Note>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.md },
  rule: { marginBottom: spacing.sm },
  pulse: {
    minWidth: 42, alignItems: 'center', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  phrase: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 27 },
});
