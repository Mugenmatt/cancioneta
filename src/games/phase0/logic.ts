export const MORNING_TARGET_PAGES = 3;
export const WORDS_PER_PAGE = 275;
export const MIN_WORDS_PER_PAGE = 250;
export const MAX_WORDS_PER_PAGE = 300;
export const SPY_QUESTION_COUNT = 4;
export const OBSERVATION_SECONDS = 60;
export const PROSE_MIN_PAGES = 2;
export const PROSE_MAX_PAGES = 4;

export interface PageProgress {
  words: number;
  page: number;
  totalPages: number;
  completedPages: number;
  targetWords: number;
  wordsIntoPage: number;
  percent: number;
}

export interface Phrase {
  id: string;
  start: number;
  end: number;
  text: string;
  selected: boolean;
}

export interface Fragment {
  id: string;
  sourceId: string;
  originalText: string;
  editedText: string;
}

export function countWords(text: string): number {
  return text
    .split(/\s+/u)
    .filter((token) => /[\p{L}\p{N}]/u.test(token))
    .length;
}

export function getPageProgress(
  text: string,
  totalPages = MORNING_TARGET_PAGES,
  wordsPerPage = WORDS_PER_PAGE,
): PageProgress {
  const safePages = Math.max(1, totalPages);
  const safeWordsPerPage = Math.max(1, wordsPerPage);
  const words = countWords(text);
  const pages = words / safeWordsPerPage;
  const completedPages = Math.min(safePages, Math.floor(pages));
  const page = Math.min(safePages, Math.max(1, Math.ceil(pages)));
  const wordsIntoPage = words === 0 ? 0 : ((words - 1) % safeWordsPerPage) + 1;

  return {
    words,
    page,
    totalPages: safePages,
    completedPages,
    targetWords: safePages * safeWordsPerPage,
    wordsIntoPage,
    percent: Math.min(100, Math.round((words / (safePages * safeWordsPerPage)) * 100)),
  };
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function splitIntoSentences(text: string): Phrase[] {
  const phrases: Phrase[] = [];
  const matches = text.matchAll(/[^.!?…]+(?:[.!?…]+|$)/gu);
  let index = 0;

  for (const match of matches) {
    const value = match[0].trim();
    if (!value) continue;
    const start = match.index ?? index;
    phrases.push({
      id: `phrase-${index}`,
      start,
      end: start + match[0].length,
      text: value,
      selected: false,
    });
    index += 1;
  }

  return phrases;
}

export function togglePhraseSelection(phrases: Phrase[], id: string): Phrase[] {
  return phrases.map((phrase) =>
    phrase.id === id ? { ...phrase, selected: !phrase.selected } : phrase,
  );
}

export function createFragments(phrases: Phrase[]): Fragment[] {
  return phrases
    .filter((phrase) => phrase.selected)
    .map((phrase) => ({
      id: `fragment-${phrase.id}`,
      sourceId: phrase.id,
      originalText: phrase.text,
      editedText: phrase.text,
    }));
}

export function editFragment(fragments: Fragment[], id: string, editedText: string): Fragment[] {
  return fragments.map((fragment) =>
    fragment.id === id ? { ...fragment, editedText } : fragment,
  );
}

export function exportFragments(fragments: Fragment[], separator = '\n\n'): string {
  return fragments.map((fragment) => fragment.editedText).join(separator);
}

export function appendTranscriptChunk(current: string, chunk: string): string {
  const cleaned = chunk.trim();
  if (!cleaned) return current;
  if (current.includes(cleaned)) return current;
  return [current.trim(), cleaned].filter(Boolean).join(' ').trim();
}

export function hasOfflineSpanish(
  supported: boolean,
  locales: { locales: string[]; installedLocales: string[] },
): boolean {
  const isSpanish = (locale: string) => /^es([-_]|$)/i.test(locale);
  if (!supported) return false;
  if (locales.installedLocales.some(isSpanish)) return true;
  return locales.installedLocales.length === 0 && locales.locales.some(isSpanish);
}
