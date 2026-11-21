import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '@/stores/settingsStore';

describe('volúmenes en ajustes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    useSettingsStore.setState({ metronomeVolume: 1, chordsVolume: 1, hydrated: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('guarda y limita los volúmenes', () => {
    useSettingsStore.getState().setMetronomeVolume(0.35);
    useSettingsStore.getState().setChordsVolume(2);

    expect(useSettingsStore.getState().metronomeVolume).toBe(0.35);
    expect(useSettingsStore.getState().chordsVolume).toBe(1);

    jest.advanceTimersByTime(300);
    const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const saved = JSON.parse(calls[calls.length - 1][1]) as Record<string, number>;

    expect(saved.metronomeVolume).toBe(0.35);
    expect(saved.chordsVolume).toBe(1);
  });

  it('recupera los volúmenes guardados al hidratar', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({
      metronomeVolume: 0.25,
      chordsVolume: 0.75,
    }));

    await useSettingsStore.getState().hydrate();

    expect(useSettingsStore.getState().metronomeVolume).toBe(0.25);
    expect(useSettingsStore.getState().chordsVolume).toBe(0.75);
  });
});
