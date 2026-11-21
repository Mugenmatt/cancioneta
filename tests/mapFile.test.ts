import { loadMapFile } from '@/games/runtime/mapFile';

const payload = JSON.stringify({
  schema: 'cancioneta.mapa',
  version: 2,
  root: {
    id: 'n_1',
    text: 'raíz',
    children: [{ id: 'n_2', text: 'hijo', children: [] }],
  },
});

describe('Importación de archivos del mapa', () => {
  it('lee, valida y borra la copia temporal', async () => {
    const remove = jest.fn();
    const root = await loadMapFile('cache://mapa', { read: async () => payload, remove }, () => 'n_9');
    expect(root.children[0]?.text).toBe('hijo');
    expect(remove).toHaveBeenCalledWith('cache://mapa');
  });

  it('borra la copia temporal aunque el JSON sea inválido', async () => {
    const remove = jest.fn();
    await expect(loadMapFile('cache://mapa', { read: async () => '{', remove }, () => 'n_9')).rejects.toThrow();
    expect(remove).toHaveBeenCalledWith('cache://mapa');
  });
});
