import { useCallback, useEffect, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { appendTranscriptChunk, canRecordAudio, hasOfflineSpanish, ignoreError } from '@/services/audio/recording';

export interface OfflineTranscription {
  available: boolean;
  checking: boolean;
  transcribing: boolean;
  transcript: string;
  error: boolean;
  manualAvailable: boolean;
  setTranscript: (value: string) => void;
  start: (uri: string) => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Transcripción on-device reutilizada por los Juegos con voz. Nunca envía audio a la red.
 * Si no hay motor en español, habilita el campo manual de transcripción asistida.
 */
export function useOfflineTranscription(onFinal?: (text: string) => void): OfflineTranscription {
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(() => canRecordAudio());
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscriptState] = useState('');
  const [error, setError] = useState(false);
  const transcriptRef = useRef('');
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const update = useCallback((value: string) => {
    transcriptRef.current = value;
    setTranscriptState(value);
    onFinalRef.current?.(value);
  }, []);

  useEffect(() => {
    if (!canRecordAudio()) return;
    let active = true;
    const check = async () => {
      try {
        const supported = ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
        const locales = await ExpoSpeechRecognitionModule.getSupportedLocales({});
        if (active) setAvailable(hasOfflineSpanish(supported, locales));
      } catch {
        if (active) setAvailable(false);
      } finally {
        if (active) setChecking(false);
      }
    };
    void check();
    return () => { active = false; };
  }, []);

  useEffect(() => () => ignoreError(() => ExpoSpeechRecognitionModule.abort()), []);

  useSpeechRecognitionEvent('result', (event) => {
    if (!event.isFinal) return;
    const chunk = event.results.map((result) => result.transcript).join(' ');
    update(appendTranscriptChunk(transcriptRef.current, chunk));
  });

  useSpeechRecognitionEvent('end', () => {
    setTranscribing(false);
    onFinalRef.current?.(transcriptRef.current);
  });

  useSpeechRecognitionEvent('error', () => {
    setTranscribing(false);
    setError(true);
  });

  const start = useCallback((uri: string) => {
    if (!available || !uri || transcribing) return;
    setError(false);
    update('');
    setTranscribing(true);
    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'es-ES',
        requiresOnDeviceRecognition: true,
        continuous: true,
        interimResults: false,
        addsPunctuation: true,
        audioSource: { uri },
      });
    } catch {
      setTranscribing(false);
      setError(true);
    }
  }, [available, transcribing, update]);

  const stop = useCallback(() => {
    ignoreError(() => ExpoSpeechRecognitionModule.stop());
    setTranscribing(false);
  }, []);

  const reset = useCallback(() => {
    update('');
    setError(false);
  }, [update]);

  return {
    available,
    checking,
    transcribing,
    transcript,
    error,
    manualAvailable: (!available && !checking) || error,
    setTranscript: update,
    start,
    stop,
    reset,
  };
}
