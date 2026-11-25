import { dataService } from '@/services/data/DataService';

describe('DataService', () => {
  it('construye pools con ids y huellas únicas', () => {
    const report = dataService.getReport();
    expect(report.totalItems).toBeGreaterThan(500);
    expect(report.testData).toBe(false);
    const nouns = dataService.getPool('words.noun');
    expect(nouns.length).toBeGreaterThan(200);
    expect(new Set(nouns.map((item) => item.id)).size).toBe(nouns.length);
    expect(new Set(nouns.map((item) => item.fingerprint)).size).toBe(nouns.length);
    expect(nouns.every((item) => item.id.startsWith('words.noun:'))).toBe(true);
  });

  it('no duplica huellas en los pools culturales compartidos', () => {
    const pools = ['titles', 'characters', 'songs', 'poems_songs_ref', 'quote_public', 'script_phrases'] as const;
    const fingerprints = pools.flatMap((pool) => dataService.getPool(pool).map((item) => item.fingerprint));
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
  });

  it('conserva las 12 semillas de cut-up sin colisionar con prompts', () => {
    const cutups = dataService.getPool('cutup_texts');
    expect(cutups).toHaveLength(12);
    expect(new Set(cutups.map((item) => item.fingerprint)).size).toBe(12);
    const promptTexts = new Set(dataService.getPool('prompts').map((item) => item.text));
    expect(cutups.some((item) => promptTexts.has(item.text))).toBe(false);
  });

  it('conserva licencias y metadatos', () => {
    const songs = dataService.getPool('songs');
    expect(songs.length).toBeGreaterThan(0);
    expect(songs.every((item) => item.license === 'metadata_only' || item.license === 'cc0')).toBe(true);
    expect(songs.every((item) => Boolean(item.externalLink ?? item.sourceUrl))).toBe(true);
    expect(songs.some((item) => item.license === 'cc0' && item.sourceUrl?.includes('musicbrainz.org'))).toBe(true);
    const quotes = dataService.getPool('quote_public');
    expect(quotes.every((item) => item.license === 'public_domain' || item.license === 'original')).toBe(true);
  });

  it('busca por texto sin romper acentos', () => {
    expect(dataService.search('casa').length).toBeGreaterThan(0);
    expect(dataService.search('').length).toBe(0);
  });

  it('registra el pool de juegos', () => {
    dataService.registerGamePool(['g01', 'g02']);
    expect(dataService.getPool('games')).toHaveLength(2);
  });

  it('expone créditos completos', () => {
    const credits = dataService.getCredits();
    expect(credits.length).toBeGreaterThanOrEqual(5);
    expect(credits.every((entry) => entry.source && entry.license && entry.attribution)).toBe(true);
  });

  it('declara la licencia exacta de cada fuente y de los íconos', () => {
    const credits = dataService.getCredits();
    const fonts = ['Fraunces (identidad)', 'Literata (escritura)', 'Inter (interfaz)'];
    for (const source of fonts) {
      const entry = credits.find((credit) => credit.source === source);
      expect(entry?.license).toBe('SIL Open Font License 1.1');
      expect(entry?.attribution).toMatch(/Paquete @expo-google-fonts\//);
    }
    expect(credits.find((credit) => credit.source === 'Íconos Feather')?.license).toBe('MIT');
  });
});
