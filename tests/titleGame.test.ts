import { RandomService, MemoryLedgerStorage } from '@/services/random/RandomService';
import { createTitleGameController } from '@/games/g02-titulo/controller';

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

describe('G-02 Desde el Título', () => {
  it('sortea un título con autor', async () => {
    const random = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(3) });
    const controller = createTitleGameController(random);
    const state = await controller.draw();
    expect(state.card).not.toBeNull();
    expect(state.card?.text.length).toBeGreaterThan(0);
    expect(state.card?.author?.length).toBeGreaterThan(0);
    expect(state.draws).toBe(1);
    expect(state.error).toBeNull();
  });

  it('no repite títulos antes de agotar el pool', async () => {
    const random = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(5) });
    const controller = createTitleGameController(random);
    const seen = new Set<string>();
    for (let i = 0; i < 6; i += 1) {
      const state = await controller.draw();
      expect(state.card).not.toBeNull();
      if (state.card) {
        expect(seen.has(state.card.fingerprint)).toBe(false);
        seen.add(state.card.fingerprint);
      }
    }
  });

  it('informa si el pool está vacío', async () => {
    const empty = {
      draw: async () => [] as never[],
    };
    const controller = createTitleGameController(empty);
    const state = await controller.draw();
    expect(state.card).toBeNull();
    expect(state.error).toMatch(/no hay títulos/i);
  });

  it('serializa el estado de la sesión', async () => {
    const random = new RandomService({ storage: new MemoryLedgerStorage(), rng: seeded(7) });
    const controller = createTitleGameController(random);
    const state = await controller.draw();
    expect(controller.serialize()).toEqual(state);
  });
});
