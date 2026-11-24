/**
 * Nombres generados por `temporaryRecordingOptions`: `<gameId>-<timestamp>-<random>`.
 * La extensión la agrega expo-audio según la plataforma.
 */
const TEMPORARY_AUDIO_NAME = /^(?:f0-[1-5]|g\d{2})-\d{10,}-\d{1,6}(?:\.[A-Za-z0-9]+)?$/;

export function isTemporaryAudioName(name: string): boolean {
  return TEMPORARY_AUDIO_NAME.test(name);
}
