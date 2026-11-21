import type { PoolItem } from '@/core/types';
import type { RandomService } from '@/services/random/RandomService';
import { TITLE_TEXT } from '@/content/games/g02-g05';

export interface TitleGameState {
  card: PoolItem | null;
  draws: number;
  error: string | null;
}

export interface TitleGameController {
  getState(): TitleGameState;
  draw(): Promise<TitleGameState>;
  serialize(): TitleGameState;
  dispose(): void;
}

export function createTitleGameController(random: Pick<RandomService, 'draw'>): TitleGameController {
  let state: TitleGameState = { card: null, draws: 0, error: null };

  return {
    getState: () => state,
    async draw() {
      const [card] = await random.draw('titles', 1);
      state = {
        card: card ?? null,
        draws: state.draws + 1,
        error: card ? null : TITLE_TEXT.searchError,
      };
      return state;
    },
    serialize: () => state,
    dispose: () => undefined,
  };
}
