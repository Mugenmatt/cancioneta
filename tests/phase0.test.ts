import type { PoolId, PoolItem } from '@/core/types';
import type { DrawOptions } from '@/services/random/RandomService';
import { createPromptController, createSpyController } from '@/games/phase0/controllers';
import {
  SPY_QUESTION_COUNT,
  appendTranscriptChunk,
  countWords,
  createFragments,
  editFragment,
  exportFragments,
  formatClock,
  getPageProgress,
  hasOfflineSpanish,
  splitIntoSentences,
  togglePhraseSelection,
} from '@/games/phase0/logic';

function makeItem(id: string, pool: PoolId): PoolItem {
  return { id, pool, text: id, lang: 'es', license: 'original', fingerprint: id };
}

describe('lógica de Fase 0', () => {
  it('cuenta palabras y calcula progreso de páginas', () => {
    expect(countWords('  uno   dos\n tres ')).toBe(3);
    expect(countWords('')).toBe(0);

    const full = getPageProgress(Array(825).fill('palabra').join(' '));
    expect(full.words).toBe(825);
    expect(full.page).toBe(3);
    expect(full.completedPages).toBe(3);
    expect(full.percent).toBe(100);

    const partial = getPageProgress(Array(251).fill('palabra').join(' '));
    expect(partial.page).toBe(1);
    expect(partial.wordsIntoPage).toBe(251);
    expect(partial.targetWords).toBe(825);
  });

  it('formatea el reloj sin segundos negativos', () => {
    expect(formatClock(61)).toBe('01:01');
    expect(formatClock(-4)).toBe('00:00');
  });

  it('selecciona frases y edita fragmentos sin tocar el original', () => {
    const phrases = splitIntoSentences('Salí. Miré? Volví!');
    expect(phrases.map((phrase) => phrase.text)).toEqual(['Salí.', 'Miré?', 'Volví!']);

    const selected = togglePhraseSelection(phrases, phrases[1].id);
    expect(phrases[1].selected).toBe(false);
    expect(selected[1].selected).toBe(true);

    const fragments = createFragments(selected);
    expect(fragments).toHaveLength(1);
    expect(fragments[0].originalText).toBe('Miré?');

    const edited = editFragment(fragments, fragments[0].id, 'Miré de nuevo.');
    expect(fragments[0].editedText).toBe('Miré?');
    expect(exportFragments(edited)).toBe('Miré de nuevo.');
  });

  it('une transcripción sin repetir y valida reconocimiento offline', () => {
    expect(appendTranscriptChunk('Hola', 'Hola')).toBe('Hola');
    expect(appendTranscriptChunk('Hola', 'mundo')).toBe('Hola mundo');
    expect(hasOfflineSpanish(false, { locales: ['es-ES'], installedLocales: [] })).toBe(false);
    expect(hasOfflineSpanish(true, { locales: ['en-US'], installedLocales: ['es-ES'] })).toBe(true);
    expect(hasOfflineSpanish(true, { locales: ['es-ES'], installedLocales: [] })).toBe(true);
  });
});

describe('controladores de Fase 0', () => {
  it('El Espía no repite preguntas en el conjunto mostrado', async () => {
    const items = ['a', 'b', 'c', 'd'].map((id) => makeItem(id, 'spy_questions'));
    const calls: PoolId[] = [];
    const random = {
      draw: async (pool: PoolId, n: number) => {
        calls.push(pool);
        return [...items, items[0]].slice(0, n);
      },
    };

    const state = await createSpyController(random).start();
    expect(calls).toEqual(['spy_questions']);
    expect(state.questions).toHaveLength(SPY_QUESTION_COUNT);
    expect(new Set(state.questions.map((item) => item.fingerprint)).size).toBe(SPY_QUESTION_COUNT);
    expect(state.error).toBeNull();
  });

  it('Prompt sortea consigna e imagen de forma independiente', async () => {
    const prompts = ['p1', 'p2'].map((id) => makeItem(id, 'prompts'));
    const images = ['i1', 'i2'].map((id) => makeItem(id, 'images'));
    const excluded: Record<'prompts' | 'images', Array<string | undefined>> = { prompts: [], images: [] };
    const random = {
      draw: async (pool: 'prompts' | 'images', n: number, opts?: DrawOptions) => {
        const banned = opts?.excludeFingerprints;
        excluded[pool].push(banned ? [...banned][0] : undefined);
        const source = pool === 'prompts' ? prompts : images;
        return [source.find((item) => !banned?.has(item.fingerprint)) ?? source[0]].slice(0, n);
      },
    };

    const controller = createPromptController(random);
    const first = await controller.deal('both');
    expect([first.prompt?.fingerprint, first.image?.fingerprint]).toEqual(['p1', 'i1']);

    const afterPrompt = await controller.deal('prompt');
    expect(afterPrompt.prompt?.fingerprint).toBe('p2');
    expect(afterPrompt.image?.fingerprint).toBe('i1');
    expect(excluded.prompts).toEqual([undefined, 'p1']);
    expect(excluded.images).toEqual([undefined]);

    const afterImage = await controller.deal('image');
    expect(afterImage.prompt?.fingerprint).toBe('p2');
    expect(afterImage.image?.fingerprint).toBe('i2');
    expect(excluded.images).toEqual([undefined, 'i1']);
    expect(excluded.prompts).toEqual([undefined, 'p1']);
  });
});
