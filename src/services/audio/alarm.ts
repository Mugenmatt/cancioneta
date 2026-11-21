import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const ALARM_SOURCE = require('../../../assets/audio/alarm-soft.wav');

let activePlayer: AudioPlayer | null = null;

async function ensureMode(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
      shouldPlayInBackground: false,
    });
  } catch {
    // El modo de audio no debe bloquear la alarma.
  }
}

export async function playAlarm(times = 3): Promise<void> {
  await ensureMode();
  if (activePlayer) {
    try { activePlayer.pause(); } catch { /* noop */ }
    try { activePlayer.remove(); } catch { /* noop */ }
    activePlayer = null;
  }
  const player = createAudioPlayer(ALARM_SOURCE);
  activePlayer = player;
  player.volume = 0.7;

  for (let i = 0; i < times; i += 1) {
    if (activePlayer !== player) return;
    try {
      await player.seekTo(0);
      player.play();
    } catch {
      break;
    }
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 1800);
      const sub = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          clearTimeout(timeout);
          sub.remove();
          resolve();
        }
      });
    });
  }

  if (activePlayer === player) {
    try { player.remove(); } catch { /* noop */ }
    activePlayer = null;
  }
}

export function stopAlarm(): void {
  if (!activePlayer) return;
  try { activePlayer.pause(); } catch { /* noop */ }
  try { activePlayer.remove(); } catch { /* noop */ }
  activePlayer = null;
}
