import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioRecorder,
} from "expo-audio";

export const MAX_VOICE_SEC = 30;

export function formatDuration(sec: number) {
  const whole = Math.max(0, Math.floor(sec));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

let recording: AudioRecorder | null = null;
let player: AudioPlayer | null = null;

export async function startVoiceRecording(): Promise<void> {
  const permission = await requestRecordingPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Microphone access is needed for voice notes.");
  }

  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });

  if (recording) {
    try {
      await recording.stop();
    } catch {
      /* ignore */
    }
    recording = null;
  }

  const next = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
  await next.prepareToRecordAsync();
  next.record();
  recording = next;
}

export async function stopVoiceRecording(): Promise<{ uri: string; durationSec: number }> {
  if (!recording) throw new Error("No active recording.");
  const seconds = recording.getStatus().durationMillis / 1000;
  await recording.stop();
  // Brief settle so the file URI is ready before we copy it on seal.
  await new Promise((r) => setTimeout(r, 80));
  const uri = recording.uri;
  recording = null;

  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  });

  if (!uri) throw new Error("Recording failed to save.");
  const durationSec = Math.min(MAX_VOICE_SEC, Math.max(0.5, seconds));
  return { uri, durationSec: Number(durationSec.toFixed(1)) };
}

export async function cancelVoiceRecording() {
  if (!recording) return;
  try {
    await recording.stop();
  } catch {
    /* ignore */
  }
  recording = null;
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  });
}

export async function playVoice(uri: string, onEnded?: () => void) {
  await stopVoicePlayback();
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  });
  const next = createAudioPlayer({ uri }, { updateInterval: 200 });
  let started = false;
  next.addListener("playbackStatusUpdate", (status) => {
    if (!status.isLoaded) return;
    if (!started) {
      started = true;
      next.play();
    }
    if (status.didJustFinish) {
      onEnded?.();
      void stopVoicePlayback();
    }
  });
  player = next;
  if (next.isLoaded) {
    started = true;
    next.play();
  }
}

export async function stopVoicePlayback() {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    /* ignore */
  }
  player = null;
}
