import { RandomService, MemoryLedgerStorage } from '@/services/random/RandomService';
import { dataService } from '@/services/data/DataService';

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

describe('RandomService', () => {
  it('sortea sin repetir dentro de la misma sesión', async () => {
    const service = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(7) });
    const items = await service.draw('words.noun', 12);
    const fingerprints = new Set(items.map((item) => item.fingerprint));
    expect(items).toHaveLength(12);
    expect(fingerprints.size).toBe(12);
    const stats = await service.stats('words.noun');
    expect(stats.used).toBe(12);
  });

  it('cierra el ciclo solo al agotar el pool', async () => {
    const service = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(11) });
    const pool = dataService.getPool('dice_lugar');
    const all = await service.draw('dice_lugar', pool.length);
    expect(all).toHaveLength(pool.length);
    expect((await service.stats('dice_lugar')).cycle).toBe(0);
    const next = await service.draw('dice_lugar', 1);
    expect(next).toHaveLength(1);
    const stats = await service.stats('dice_lugar');
    expect(stats.cycle).toBe(1);
    expect(stats.used).toBe(1);
  });

  it('persiste el ledger y evita repetir entre instancias', async () => {
    const storage = new MemoryLedgerStorage();
    const first = new RandomService({ storage, rng: seeded(21) });
    const drawn = await first.draw('themes', 4);
    await first.flush();
    const second = new RandomService({ storage, rng: seeded(21) });
    const again = await second.draw('themes', 4);
    const overlap = again.filter((item) => drawn.some((old) => old.fingerprint === item.fingerprint));
    expect(overlap).toHaveLength(0);
    expect((await second.stats('themes')).used).toBe(8);
  });

  it('comparte huellas entre pools culturales', async () => {
    const service = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(31) });
    const titles = await service.draw('titles', 5);
    const characters = await service.draw('characters', 5);
    const titleFingerprints = new Set(titles.map((item) => item.fingerprint));
    expect(characters.every((item) => !titleFingerprints.has(item.fingerprint))).toBe(true);
    expect(service.getSnapshot().shared.length).toBeGreaterThanOrEqual(10);
  });

  it('registra progresiones sin repetirlas', async () => {
    const service = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(41) });
    expect(await service.isProgressionUsed('c mayor|C,G,Am,F')).toBe(false);
    await service.markProgression('c mayor|C,G,Am,F');
    expect(await service.isProgressionUsed('c mayor|C,G,Am,F')).toBe(true);
  });

  it('elige n elementos distintos sin modificar el ledger', () => {
    const service = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(61) });
    const items = ['a', 'b', 'c', 'd'];

    expect(service.pickN(items, 0)).toEqual([]);
    const picked = service.pickN(items, 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    expect(picked.every((item) => items.includes(item))).toBe(true);
    expect(service.pickN(items, 9)).toHaveLength(items.length);
    expect(service.getSnapshot().pools).toEqual({});
  });

  it('puede reiniciar la memoria', async () => {
    const service = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(51) });
    await service.draw('words.verb', 3);
    await service.reset();
    expect((await service.stats('words.verb')).used).toBe(0);
  });
});
