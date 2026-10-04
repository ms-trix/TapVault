import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type AudioContextType = {
  state: string;
  currentTime: number;
  resume: () => Promise<void>;
  createOscillator: () => {
    type: string;
    frequency: { setValueAtTime: (v: number, t: number) => void };
    connect: (n: unknown) => void;
    start: (t: number) => void;
    stop: (t: number) => void;
  };
  createGain: () => {
    gain: {
      setValueAtTime: (v: number, t: number) => void;
      exponentialRampToValueAtTime: (v: number, t: number) => void;
    };
    connect: (n: unknown) => void;
  };
  destination: unknown;
};

let sharedCtx: AudioContextType | null = null;

function getCtx(): AudioContextType | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: new () => AudioContextType;
    webkitAudioContext?: new () => AudioContextType;
  };
  const AudioCtx = w.AudioContext || w.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  return sharedCtx;
}

async function resume(ctx: AudioContextType) {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* gesture required */
    }
  }
}

function tone(
  ctx: AudioContextType,
  {
    frequency,
    start,
    duration,
    type = 'sine',
    attack = 0.005,
    gain = 0.08,
  }: {
    frequency: number;
    start: number;
    duration: number;
    type?: string;
    attack?: number;
    gain?: number;
  },
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

async function haptic(style: 'light' | 'medium' | 'success') {
  if (Platform.OS === 'web') return;
  try {
    if (style === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (style === 'medium') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    /* Simulator / unsupported */
  }
}

/** Short tactile click when a tag is detected. */
export async function playClick() {
  void haptic('light');
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t = ctx.currentTime;
  tone(ctx, { frequency: 980, start: t, duration: 0.045, type: 'triangle', gain: 0.07 });
  tone(ctx, { frequency: 620, start: t + 0.02, duration: 0.05, type: 'square', gain: 0.03 });
}

/** Soft “safe unlock” for opening a sealed note. */
export async function playUnlock() {
  void haptic('success');
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t = ctx.currentTime;
  tone(ctx, { frequency: 220, start: t, duration: 0.08, type: 'sine', gain: 0.06 });
  tone(ctx, { frequency: 330, start: t + 0.07, duration: 0.09, type: 'triangle', gain: 0.05 });
  tone(ctx, { frequency: 440, start: t + 0.15, duration: 0.16, type: 'sine', gain: 0.045 });
  tone(ctx, { frequency: 660, start: t + 0.28, duration: 0.22, type: 'sine', gain: 0.035 });
}
