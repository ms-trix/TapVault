import { Audio } from 'expo-av';

export const MAX_VOICE_SEC = 30;

export function formatDuration(sec: number) {
  const whole = Math.max(0, Math.floor(sec));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

let recording: Audio.Recording | null = null;
let sound: Audio.Sound | null = null;

export async function startVoiceRecording(): Promise<void> {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Microphone access is needed for voice notes.');
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  if (recording) {
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      /* ignore */
    }
    recording = null;
  }

  const next = new Audio.Recording();
  await next.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await next.startAsync();
  recording = next;
}

export async function stopVoiceRecording(): Promise<{ uri: string; durationSec: number }> {
  if (!recording) throw new Error('No active recording.');
  const status = await recording.getStatusAsync();
  const millis =
    typeof status.durationMillis === 'number' ? status.durationMillis : 0;
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });

  if (!uri) throw new Error('Recording failed to save.');
  const durationSec = Math.min(MAX_VOICE_SEC, Math.max(0.5, millis / 1000));
  return { uri, durationSec: Number(durationSec.toFixed(1)) };
}

export async function cancelVoiceRecording() {
  if (!recording) return;
  try {
    await recording.stopAndUnloadAsync();
  } catch {
    /* ignore */
  }
  recording = null;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });
}

export async function playVoice(uri: string, onEnded?: () => void) {
  await stopVoicePlayback();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });
  const { sound: next } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true },
    (status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        onEnded?.();
        void stopVoicePlayback();
      }
    },
  );
  sound = next;
}

export async function stopVoicePlayback() {
  if (!sound) return;
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch {
    /* ignore */
  }
  sound = null;
}
