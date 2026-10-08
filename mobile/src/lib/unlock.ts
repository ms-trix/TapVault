import type { UnlockDraft } from "../types";

export function resolveUnlockAt(draft: UnlockDraft, now = new Date()): string | undefined {
  if (draft.kind === "none") return undefined;
  if (draft.kind === "30m") {
    return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  }
  if (draft.kind === "2h") {
    return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  }
  if (draft.kind === "tomorrow") {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
    return next.toISOString();
  }
  return draft.at.toISOString();
}

export function parseUnlockAt(unlockAt?: string): Date | null {
  if (!unlockAt) return null;
  const d = new Date(unlockAt);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function isUnlocked(unlockAt?: string, now = Date.now()): boolean {
  const d = parseUnlockAt(unlockAt);
  if (!d) return true;
  return d.getTime() <= now;
}

export function remainingMs(unlockAt: string, now = Date.now()): number {
  const d = parseUnlockAt(unlockAt);
  if (!d) return 0;
  return Math.max(0, d.getTime() - now);
}

/** Countdown under 24h as HH:MM:SS; beyond as short weekday time. */
export function formatCountdown(ms: number, unlockAt: string): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.ceil(ms / 1000);
  if (totalSec >= 24 * 60 * 60) {
    const d = parseUnlockAt(unlockAt);
    if (!d) return "Soon";
    return d.toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatUnlockLabel(unlockAt: string): string {
  const d = parseUnlockAt(unlockAt);
  if (!d) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
