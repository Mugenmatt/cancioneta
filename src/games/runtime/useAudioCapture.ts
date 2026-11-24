import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import {
  canRecordAudio,
  ignoreError,
  removeTemporaryAudio,
  temporaryRecordingOptions,
} from '@/services/audio/recording';

export type AudioNotice = 'web' | 'permission' | 'recording';

export interface AudioCapture {
  canRecord: boolean;
  notice: AudioNotice | null;
  isRecording: boolean;
  recordingSeconds: number;
  audioUri: string | null;
  isPlaying: boolean;
  didJustFinish: boolean;
  currentTime: number;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  togglePlayback: () => void;
  playFromStart: () => void;
  pause: () => void;
  clearAudio: () => void;
}

/**
 * Grabadora temporal + reproductor de un solo archivo, compartida por los Juegos con audio.
 * No persiste nada: todos los URI se liberan al desmontar.
 */
export function useAudioCapture(gameId: string): AudioCapture {
  const canRecord = useMemo(() => canRecordAudio(), []);
  const options = useMemo(() => temporaryRecordingOptions(gameId), [gameId]);
  const recorder = useAudioRecorder(options);
  const recorderState = useAudioRecorderState(recorder);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [notice, setNotice] = useState<AudioNotice | null>(() => (canRecord ? null : 'web'));
  const player = useAudioPlayer(audioUri);
  const status = useAudioPlayerStatus(player);
  const trackedUris = useRef<Set<string>>(new Set());

  const track = useCallback((uri: string) => {
    trackedUris.current.add(uri);
    setAudioUri(uri);
  }, []);

  const startRecording = useCallback(async () => {
    if (!canRecord) {
      setNotice('web');
      return;
    }
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setNotice('permission');
      return;
    }
    try {
      if (recorder.isRecording) await recorder.stop();
      await recorder.prepareToRecordAsync();
      recorder.record();
      setNotice(null);
    } catch {
      setNotice('recording');
    }
  }, [canRecord, recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      await recorder.stop();
      const uri = recorder.uri ?? recorderState.url;
      if (uri) {
        track(uri);
        return uri;
      }
      setNotice('recording');
    } catch {
      setNotice('recording');
    }
    return null;
  }, [recorder, recorderState.url, track]);

  const pause = useCallback(() => {
    player.pause();
  }, [player]);

  const playFromStart = useCallback(() => {
    if (!audioUri) return;
    void player.seekTo(0);
    player.play();
  }, [audioUri, player]);

  const togglePlayback = useCallback(() => {
    if (!audioUri) return;
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) {
      void player.seekTo(0);
    }
    player.play();
  }, [audioUri, player, status]);

  const clearAudio = useCallback(() => {
    player.pause();
    if (audioUri) {
      removeTemporaryAudio(audioUri);
      trackedUris.current.delete(audioUri);
    }
    setAudioUri(null);
  }, [audioUri, player]);

  useEffect(() => () => {
    if (recorder.isRecording) void recorder.stop().catch(() => undefined);
    player.pause();
    ignoreError(() => {
      for (const uri of trackedUris.current) removeTemporaryAudio(uri);
      trackedUris.current.clear();
    });
  }, [recorder, player]);

  return {
    canRecord,
    notice,
    isRecording: recorderState.isRecording,
    recordingSeconds: Math.max(0, Math.floor(recorderState.durationMillis / 1000)),
    audioUri,
    isPlaying: status.playing,
    didJustFinish: status.didJustFinish,
    currentTime: status.currentTime,
    duration: status.duration,
    startRecording,
    stopRecording,
    togglePlayback,
    playFromStart,
    pause,
    clearAudio,
  };
}
