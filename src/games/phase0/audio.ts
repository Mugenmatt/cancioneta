import { File } from 'expo-file-system';
import { RecordingPresets, type RecordingOptions } from 'expo-audio';
import { randomService } from '@/services/random/RandomService';

export function temporaryRecordingOptions(): RecordingOptions {
  return {
    ...RecordingPresets.LOW_QUALITY,
    directory: 'cache',
    fileName: `f0-1-${Date.now()}-${randomService.int(1000000)}`,
  };
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
