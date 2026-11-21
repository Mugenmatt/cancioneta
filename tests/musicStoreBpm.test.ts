import { useMusicStore } from '@/stores/musicStore';

describe('rango de BPM en el laboratorio', () => {
  it('acepta hasta 300 y recorta los valores fuera de rango', () => {
    useMusicStore.getState().setBpm(300);
    expect(useMusicStore.getState().bpm).toBe(300);
    useMusicStore.getState().setBpm(301);
    expect(useMusicStore.getState().bpm).toBe(300);
    useMusicStore.getState().setBpm(39);
    expect(useMusicStore.getState().bpm).toBe(40);
  });
});
