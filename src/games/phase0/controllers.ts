import type { PoolItem } from '@/core/types';
import type { RandomService } from '@/services/random/RandomService';
import { SPY_QUESTION_COUNT } from './logic';

export type Phase0Error = 'empty' | null;

export interface SpyState {
  questions: PoolItem[];
  error: Phase0Error;
}

export interface PromptState {
  prompt: PoolItem | null;
  image: PoolItem | null;
  error: Phase0Error;
}

export type PromptTarget = 'prompt' | 'image' | 'both';

type RandomDraw = Pick<RandomService, 'draw'>;

async function drawOne(random: RandomDraw, pool: 'prompts' | 'images', excludeFingerprint?: string): Promise<PoolItem | null> {
  const options = excludeFingerprint ? { excludeFingerprints: new Set([excludeFingerprint]) } : {};
  const [item] = await random.draw(pool, 1, options);
  if (item) return item;
  if (!excludeFingerprint) return null;
  const [fallback] = await random.draw(pool, 1);
  return fallback ?? null;
}

export function createSpyController(random: RandomDraw) {
  let state: SpyState = { questions: [], error: null };

  return {
    getState: () => state,
    async start(): Promise<SpyState> {
      const drawn = await random.draw('spy_questions', SPY_QUESTION_COUNT);
      const questions = Array.from(new Map(drawn.map((item) => [item.fingerprint, item])).values())
        .slice(0, SPY_QUESTION_COUNT);
      state = { questions, error: questions.length === 0 ? 'empty' : null };
      return state;
    },
  };
}

export function createPromptController(random: RandomDraw) {
  let state: PromptState = { prompt: null, image: null, error: null };

  return {
    getState: () => state,
    async deal(target: PromptTarget = 'both'): Promise<PromptState> {
      const needsPrompt = target === 'prompt' || target === 'both';
      const needsImage = target === 'image' || target === 'both';
      const [prompt, image] = await Promise.all([
        needsPrompt ? drawOne(random, 'prompts', state.prompt?.fingerprint) : Promise.resolve(state.prompt),
        needsImage ? drawOne(random, 'images', state.image?.fingerprint) : Promise.resolve(state.image),
      ]);
      const error = (needsPrompt && !prompt) || (needsImage && !image) ? 'empty' : null;
      state = { prompt, image, error };
      return state;
    },
  };
}
