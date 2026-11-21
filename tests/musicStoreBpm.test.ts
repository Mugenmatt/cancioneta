import { useMusicStore } from '@/stores/musicStore';

describe('rango de BPM en el laboratorio', () => {
  it('arranca en 120 BPM', () => {
    expect(useMusicStore.getState().bpm).toBe(120);
  });

  it('acepta hasta 600 y recorta los valores fuera de rango', () => {
    useMusicStore.getState().setBpm(600);
    expect(useMusicStore.getState().bpm).toBe(600);
    useMusicStore.getState().setBpm(601);
    expect(useMusicStore.getState().bpm).toBe(600);
    useMusicStore.getState().setBpm(39);
    expect(useMusicStore.getState().bpm).toBe(40);
  });
});
