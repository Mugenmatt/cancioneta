import { isTemporaryAudioName } from '@/services/audio/temporaryAudioName';

describe('nombres de audio temporal', () => {
  it('reconoce grabaciones de la app con o sin extensión', () => {
    expect(isTemporaryAudioName('g45-1730000000000-123456.m4a')).toBe(true);
    expect(isTemporaryAudioName('f0-1-1730000000000-0.wav')).toBe(true);
    expect(isTemporaryAudioName('g53-1730000000000-7')).toBe(true);
  });

  it('no reconoce otros archivos de la carpeta temporal', () => {
    expect(isTemporaryAudioName('letra.txt')).toBe(false);
    expect(isTemporaryAudioName('g45-1730000000000-123456-extra.m4a')).toBe(false);
    expect(isTemporaryAudioName('copia-g45-1730000000000-1.m4a')).toBe(false);
    expect(isTemporaryAudioName('g45-1730000000000-1234567.m4a')).toBe(false);
    expect(isTemporaryAudioName('hola-1730000000000-1.m4a')).toBe(false);
  });
});
