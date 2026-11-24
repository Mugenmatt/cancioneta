import { File, Paths } from 'expo-file-system';
import { RecordingPresets, type RecordingOptions } from 'expo-audio';
import { randomService } from '@/services/random/RandomService';
import { isWebPlatform } from '@/services/export/TextFileService';
import { isTemporaryAudioName } from './temporaryAudioName';

/**
 * Opciones de grabación temporal usadas por los Juegos con audio.
 * Misma política que Voz desatada: archivo en `cache`, nombre unique y borrado manual.
 */
export function temporaryRecordingOptions(gameId: string): RecordingOptions {
  return {
    ...RecordingPresets.LOW_QUALITY,
    directory: 'cache',
    fileName: `${gameId}-${Date.now()}-${randomService.int(1000000)}`,
  };
}

export function canRecordAudio(): boolean {
  return !isWebPlatform();
}

export function ignoreError(action: () => void): void {
  try {
    action();
  } catch {
    return;
  }
}

export function removeTemporaryAudio(uri: string | null): void {
  if (!uri) return;
  if (uri.startsWith('blob:')) {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(uri);
    }
    return;
  }
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    return;
  }
}

/** Al iniciar la app: borra grabaciones huérfanas de una sesión anterior. */
export function cleanupTemporaryAudio(): number {
  if (isWebPlatform()) return 0;
  try {
    const cache = Paths.cache;
    if (!cache.exists) return 0;
    let removed = 0;
    for (const entry of cache.list()) {
      if (entry instanceof File && isTemporaryAudioName(entry.name)) {
        entry.delete();
        removed += 1;
      }
    }
    return removed;
  } catch {
    return 0;
  }
}

export function appendTranscriptChunk(current: string, chunk: string): string {
  const cleaned = chunk.trim();
  if (!cleaned) return current;
  if (current.includes(cleaned)) return current;
  return [current.trim(), cleaned].filter(Boolean).join(' ').trim();
}

export interface OfflineLocales {
  locales: string[];
  installedLocales: string[];
}

export function hasOfflineSpanish(supported: boolean, available: OfflineLocales): boolean {
  const isSpanish = (locale: string) => /^es([-_]|$)/i.test(locale);
  if (!supported) return false;
  if (available.installedLocales.some(isSpanish)) return true;
  return available.installedLocales.length === 0 && available.locales.some(isSpanish);
}
