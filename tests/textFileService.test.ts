import {
  isWebPlatform,
  printHtml,
  readTextFile,
  releaseTextFile,
  saveTextFile,
  shareText,
} from '@/services/export/TextFileService';

jest.mock('react-native', () => ({ Platform: { OS: 'web' } }));
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'cache' },
  File: jest.fn().mockImplementation(() => ({
    uri: 'file://mapa.json',
    exists: true,
    write: jest.fn(),
    delete: jest.fn(),
    text: jest.fn().mockResolvedValue('contenido nativo'),
  })),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-print', () => ({
  printAsync: jest.fn().mockResolvedValue(undefined),
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file://mapa.pdf' }),
}));

const { Platform } = jest.requireMock('react-native') as { Platform: { OS: string } };
const { File } = jest.requireMock('expo-file-system') as { File: jest.Mock };
const Sharing = jest.requireMock('expo-sharing') as {
  isAvailableAsync: jest.Mock;
  shareAsync: jest.Mock;
};
const Print = jest.requireMock('expo-print') as {
  printAsync: jest.Mock;
  printToFileAsync: jest.Mock;
};

describe('TextFileService', () => {
  const anchor = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
  const createObjectURL = jest.fn(() => 'blob:descarga');
  const revokeObjectURL = jest.fn();
  const fetchMock = jest.fn().mockResolvedValue({ text: () => Promise.resolve('contenido web') });

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'web';
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        createElement: jest.fn(() => anchor),
        body: { appendChild: jest.fn() },
      },
    });
  });

  it('detecta la plataforma web', () => {
    expect(isWebPlatform()).toBe(true);
    Platform.OS = 'ios';
    expect(isWebPlatform()).toBe(false);
  });

  it('descarga un archivo con Blob en web', async () => {
    await saveTextFile('mapa.mapa.json', '{}', 'application/json');

    expect(createObjectURL).toHaveBeenCalled();
    expect(anchor.download).toBe('mapa.mapa.json');
    expect(anchor.click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:descarga');
    expect(File).not.toHaveBeenCalled();
  });

  it('guarda y comparte un archivo temporal en nativo', async () => {
    Platform.OS = 'ios';

    await saveTextFile('mapa.mapa.json', '{}', 'application/json');

    const file = File.mock.results[0].value as { write: jest.Mock; delete: jest.Mock };
    expect(file.write).toHaveBeenCalledWith('{}');
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file://mapa.json', expect.objectContaining({ mimeType: 'application/json' }));
    expect(file.delete).toHaveBeenCalled();
  });

  it('lee un uri blob con fetch en web', async () => {
    await expect(readTextFile('blob:grabacion')).resolves.toBe('contenido web');
    expect(fetchMock).toHaveBeenCalledWith('blob:grabacion');
  });

  it('libera un uri blob en web', () => {
    releaseTextFile('blob:grabacion');

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:grabacion');
    expect(File).not.toHaveBeenCalled();
  });

  it('usa el diálogo de impresión en web', async () => {
    await printHtml('<p>mapa</p>', 'Mapa mental');

    expect(Print.printAsync).toHaveBeenCalledWith({ html: '<p>mapa</p>' });
    expect(Print.printToFileAsync).not.toHaveBeenCalled();
  });

  it('comparte texto por el menú del sistema', async () => {
    await shareText('letra', 'Compartir');

    expect(Sharing.shareAsync).toHaveBeenCalledWith('letra', { dialogTitle: 'Compartir' });
  });
});
