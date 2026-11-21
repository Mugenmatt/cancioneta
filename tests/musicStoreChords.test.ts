import { createChord, MAX_CHORD_COUNT } from '@/music/progressionDice';
import { parseNote } from '@/music/theory';
import { randomService } from '@/services/random/RandomService';
import { useMusicStore } from '@/stores/musicStore';

describe('límite de acordes en el laboratorio', () => {
  beforeEach(() => {
    jest.spyOn(randomService, 'isProgressionUsed').mockResolvedValue(false);
    jest.spyOn(randomService, 'markProgression').mockResolvedValue(undefined);
    useMusicStore.setState({
      chords: [createChord(parseNote('C'), 'maj')],
      count: 1,
      isPlaying: false,
      currentStep: -1,
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('agrega acordes hasta 16 y después no agrega más', () => {
    for (let i = 1; i < MAX_CHORD_COUNT; i += 1) {
      useMusicStore.getState().addChord();
    }
    expect(useMusicStore.getState().chords).toHaveLength(MAX_CHORD_COUNT);
    expect(useMusicStore.getState().count).toBe(MAX_CHORD_COUNT);

    const ids = useMusicStore.getState().chords.map((chord) => chord.id);
    useMusicStore.getState().addChord();
    expect(useMusicStore.getState().chords.map((chord) => chord.id)).toEqual(ids);
  });

  it('limita a 16 la cantidad elegida', async () => {
    useMusicStore.getState().setCount(20);
    expect(useMusicStore.getState().count).toBe(MAX_CHORD_COUNT);
    await Promise.resolve();
    await Promise.resolve();
    expect(useMusicStore.getState().chords).toHaveLength(MAX_CHORD_COUNT);
  });
});
