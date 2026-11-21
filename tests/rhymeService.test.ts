import { filterRhymes, RhymeService, type RhymeResults } from '@/services/rhyme/RhymeService';

const fakeFetch = (perfect: string[], near: string[], fail = false) => jest.fn(async (url: string) => {
  if (fail) throw new Error('sin red');
  const words = url.includes('rel_rhy=') ? perfect : near;
  return { ok: true, json: async () => words.map((word) => ({ word })) };
});

describe('RhymeService', () => {
  it('combina rimas locales y online sin duplicados y con filtro por tipo', async () => {
    const fetchFn = fakeFetch(['clamor', 'amor', 'sol', 'glamor', 'loco'], ['dolor', 'sol']);
    const results = await new RhymeService(fetchFn).search('amor');

    expect(results.query).toBe('amor');
    expect(results.online).toBe(true);
    expect(results.consonants).toContain('clamor');
    expect(results.consonants).toContain('glamor');
    expect(results.consonants).toContain('dolor');
    expect(results.consonants).not.toContain('amor');
    expect(results.assonants).toContain('sol');
    expect([...results.consonants, ...results.assonants].filter((word) => word === 'sol')).toHaveLength(1);

    expect(filterRhymes(results, 'consonant')).toEqual(results.consonants);
    expect(filterRhymes(results, 'assonant')).toEqual(results.assonants);
    expect(filterRhymes(results, 'all')).toEqual([...results.consonants, ...results.assonants]);
  });

  it('consulta el vocabulario español sin clave de API', async () => {
    const fetchFn = fakeFetch([], []);
    await new RhymeService(fetchFn).search('amor');
    const urls = fetchFn.mock.calls.map((call) => call[0]);
    expect(urls).toHaveLength(2);
    expect(urls.every((url) => url.includes('v=es'))).toBe(true);
    expect(urls.some((url) => url.includes('rel_rhy=amor'))).toBe(true);
    expect(urls.some((url) => url.includes('rel_nry=amor'))).toBe(true);
    expect(urls.every((url) => !url.includes('key='))).toBe(true);
  });

  it('sigue devolviendo rimas locales cuando falla la red', async () => {
    const fetchFn = fakeFetch([], [], true);
    const results: RhymeResults = await new RhymeService(fetchFn).search('amor');
    expect(results.online).toBe(false);
    expect(results.consonants).not.toContain('clamor');
  });

  it('no consulta nada para una búsqueda vacía', async () => {
    const fetchFn = fakeFetch([], []);
    const results = await new RhymeService(fetchFn).search('   ');
    expect(results).toEqual({ query: '', consonants: [], assonants: [], online: false });
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
