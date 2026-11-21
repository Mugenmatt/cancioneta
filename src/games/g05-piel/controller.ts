import type { PoolItem } from '@/core/types';
import type { RandomService } from '@/services/random/RandomService';
import { SKIN_TEXT } from '@/content/games/g02-g05';

export interface SkinGameState {
  character: PoolItem | null;
  draws: number;
  error: string | null;
}

export interface SkinGameController {
  getState(): SkinGameState;
  draw(): Promise<SkinGameState>;
  serialize(): SkinGameState;
  dispose(): void;
}

export function createSkinGameController(random: Pick<RandomService, 'draw'>): SkinGameController {
  let state: SkinGameState = { character: null, draws: 0, error: null };

  return {
    getState: () => state,
    async draw() {
      const [character] = await random.draw('characters', 1);
      state = {
        character: character ?? null,
        draws: state.draws + 1,
        error: character ? null : SKIN_TEXT.searchError,
      };
      return state;
    },
    serialize: () => state,
    dispose: () => undefined,
  };
}
