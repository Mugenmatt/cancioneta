import type { LyricsSnapshot } from '@/core/types';
import { useLyricsStore } from '@/stores/lyricsStore';

export interface ReadonlyLyricsBridge {
  getLyricsSnapshot(): LyricsSnapshot;
}

export const readonlyLyricsBridge: ReadonlyLyricsBridge = {
  getLyricsSnapshot: () => useLyricsStore.getState().snapshot(),
};
