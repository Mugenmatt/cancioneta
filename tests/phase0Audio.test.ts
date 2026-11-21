import { removeTemporaryAudio } from '@/games/phase0/audio';

jest.mock('expo-audio', () => ({ RecordingPresets: { LOW_QUALITY: {} } }));
jest.mock('@/services/random/RandomService', () => ({ randomService: { int: () => 7 } }));
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({ exists: true, delete: jest.fn() })),
}));

describe('removeTemporaryAudio', () => {
  const revoke = jest.fn();
  const { File } = jest.requireMock('expo-file-system') as { File: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revoke });
  });

  it('revoca una URL blob sin usar expo-file-system', () => {
    removeTemporaryAudio('blob:https://cancioneta.test/abc');

    expect(revoke).toHaveBeenCalledWith('blob:https://cancioneta.test/abc');
    expect(File).not.toHaveBeenCalled();
  });

  it('borra un archivo nativo con expo-file-system', () => {
    removeTemporaryAudio('file:///tmp/grabacion.m4a');

    expect(File).toHaveBeenCalledWith('file:///tmp/grabacion.m4a');
    const instance = File.mock.results[0].value as { delete: jest.Mock };
    expect(instance.delete).toHaveBeenCalled();
  });

  it('no hace nada cuando no hay uri', () => {
    removeTemporaryAudio(null);

    expect(revoke).not.toHaveBeenCalled();
    expect(File).not.toHaveBeenCalled();
  });
});
