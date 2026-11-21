import { getMeter } from '@/music/meter';
import { createChord } from '@/music/progressionDice';
import { parseNote } from '@/music/theory';
import { chordMidi, voicingForProgression } from '@/music/voicing';
import { NOTE_SPACING_SECONDS, PlaybackTimeline, type PlaybackConfig } from '@/services/audio/playbackTimeline';

const chords = [
  createChord(parseNote('C'), 'maj', false, 'c'),
  createChord(parseNote('G'), 'maj', false, 'g'),
];

const baseConfig: PlaybackConfig = {
  bpm: 120,
  meter: getMeter('4/4'),
  chords,
  loop: true,
  metronome: true,
};

describe('PlaybackTimeline', () => {
  it('programa pulsos y acordes con el mismo tiempo base', () => {
    const timeline = new PlaybackTimeline(baseConfig, 10);
    const events = timeline.takeEventsUntil(12.1);
    const pulses = events.filter((event) => event.kind === 'pulse');
    const notes = events.filter((event) => event.kind === 'note');

    expect(pulses.map((event) => event.time)).toEqual([10, 10.5, 11, 11.5, 12]);
    expect(notes[0].time).toBe(pulses[0].time);
    expect(notes[1].time).toBeCloseTo(10 + NOTE_SPACING_SECONDS);
    expect(notes[2].time).toBeCloseTo(10 + NOTE_SPACING_SECONDS * 2);
    expect(notes.map((event) => (event.kind === 'note' ? event.step : -1)).filter((step, index) => index % 4 === 0)).toEqual([0, 1]);
  });

  it('mantiene el loop sin perder el downbeat', () => {
    const timeline = new PlaybackTimeline(baseConfig, 0);
    const events = timeline.takeEventsUntil(4.1);
    const notes = events.filter((event) => event.kind === 'note');

    const stepsAt = (time: number) => Array.from(new Set(
      notes.filter((event) => event.kind === 'note' && event.time === time).map((event) => event.step),
    ));
    expect(stepsAt(0)).toEqual([0]);
    expect(stepsAt(2)).toEqual([1]);
    expect(stepsAt(4)).toEqual([0]);
  });

  it('termina al final del último compás cuando no hay loop', () => {
    const timeline = new PlaybackTimeline({ ...baseConfig, loop: false }, 0);
    const events = timeline.takeEventsUntil(4.1);
    const pulses = events.filter((event) => event.kind === 'pulse');
    const notes = events.filter((event) => event.kind === 'note');

    expect(timeline.endTime).toBe(4);
    expect(pulses.map((event) => event.time)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]);
    expect(notes.map((event) => (event.kind === 'note' ? event.step : -1)).filter((step, index) => index % 4 === 0)).toEqual([0, 1]);
    expect(timeline.hasEvents).toBe(false);
  });

  it('alinea el primer acorde con el primer pulso al cambiar el tempo', () => {
    const slow = new PlaybackTimeline({ ...baseConfig, bpm: 90 }, 100);
    const slowEvents = slow.takeEventsUntil(102.1);
    const fast = new PlaybackTimeline({ ...baseConfig, bpm: 140 }, 102);
    const fastEvents = fast.takeEventsUntil(102.9);
    const slowPulseTimes = slowEvents.filter((event) => event.kind === 'pulse').map((event) => event.time);
    const fastPulseTimes = fastEvents.filter((event) => event.kind === 'pulse').map((event) => event.time);
    const fastNotes = fastEvents.filter((event) => event.kind === 'note');

    expect(slowPulseTimes[3]).toBeCloseTo(102);
    expect(fastNotes[0].time).toBe(102);
    expect(fastPulseTimes[0]).toBe(102);
    expect(fastPulseTimes[1]).toBeCloseTo(102 + 60 / 140);
  });

  it('usa la progresión nueva desde el reinicio', () => {
    const changedChords = [
      createChord(parseNote('D'), 'maj', false, 'd'),
      createChord(parseNote('A'), 'maj', false, 'a'),
    ];
    const timeline = new PlaybackTimeline({ ...baseConfig, chords: changedChords }, 5);
    const events = timeline.takeEventsUntil(5.1);
    const notes = events.filter((event) => event.kind === 'note');

    expect(notes.map((event) => (event.kind === 'note' ? event.midi : -1))).toEqual(chordMidi(changedChords[0]));
  });

  it('aplica la progresión encolada recién en el próximo compás', () => {
    const changedChords = [
      createChord(parseNote('D'), 'maj', false, 'd'),
      createChord(parseNote('A'), 'maj', false, 'a'),
    ];
    const timeline = new PlaybackTimeline(baseConfig, 0);
    const firstBar = timeline.takeEventsUntil(2.1);
    timeline.setPendingConfig({ chords: changedChords });
    const rest = timeline.takeEventsUntil(4.1);
    const events = [...firstBar, ...rest];
    const notesAt = (time: number) => events
      .filter((event) => event.kind === 'note' && event.time === time)
      .map((event) => (event.kind === 'note' ? event.midi : -1));

    expect(notesAt(0)).toEqual(voicingForProgression(chords)[0]);
    expect(notesAt(2)).toEqual(voicingForProgression(chords)[1]);
    expect(notesAt(4)).toEqual(voicingForProgression(changedChords)[0]);
  });
});
