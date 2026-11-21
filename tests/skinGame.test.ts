import { RandomService, MemoryLedgerStorage } from '@/services/random/RandomService';
import { createSkinGameController } from '@/games/g05-piel/controller';

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

describe('G-05 En la Piel', () => {
  it('sortea un personaje con obra y descripción', async () => {
    const random = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(11) });
    const controller = createSkinGameController(random);
    const state = await controller.draw();
    expect(state.character).not.toBeNull();
    expect(state.character?.text.length).toBeGreaterThan(0);
    expect(state.character?.work?.length).toBeGreaterThan(0);
    expect(typeof state.character?.extra?.description).toBe('string');
    expect(state.error).toBeNull();
  });

  it('no repite personajes antes de agotar el pool', async () => {
    const random = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(13) });
    const controller = createSkinGameController(random);
    const seen = new Set<string>();
    for (let i = 0; i < 5; i += 1) {
      const state = await controller.draw();
      if (!state.character) continue;
      expect(seen.has(state.character.fingerprint)).toBe(false);
      seen.add(state.character.fingerprint);
    }
  });

  it('informa si no hay personajes', async () => {
    const empty = { draw: async () => [] as never[] };
    const state = await createSkinGameController(empty).draw();
    expect(state.character).toBeNull();
    expect(state.error).toMatch(/no hay personajes/i);
  });
});
