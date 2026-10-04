/** Soft mechanical SFX via Web Audio — no mp3 assets required. */

let sharedCtx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  return sharedCtx;
}

async function resume(ctx: AudioContext) {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* Autoplay policies can block until a later gesture. */
    }
  }
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    type = "sine",
    attack = 0.005,
    gain = 0.08,
  }: {
    frequency: number;
    start: number;
    duration: number;
    type?: OscillatorType;
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

/** Short tactile click when a tag is detected. */
export async function playClick() {
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t = ctx.currentTime;
  tone(ctx, { frequency: 980, start: t, duration: 0.045, type: "triangle", gain: 0.07 });
  tone(ctx, { frequency: 620, start: t + 0.02, duration: 0.05, type: "square", gain: 0.03 });
}

/** Soft “safe unlock” for opening a sealed note. */
export async function playUnlock() {
  const ctx = getCtx();
  if (!ctx) return;
  await resume(ctx);
  const t = ctx.currentTime;
  tone(ctx, { frequency: 220, start: t, duration: 0.08, type: "sine", gain: 0.06 });
  tone(ctx, { frequency: 330, start: t + 0.07, duration: 0.09, type: "triangle", gain: 0.05 });
  tone(ctx, { frequency: 440, start: t + 0.15, duration: 0.16, type: "sine", gain: 0.045 });
  tone(ctx, { frequency: 660, start: t + 0.28, duration: 0.22, type: "sine", gain: 0.035 });
}
