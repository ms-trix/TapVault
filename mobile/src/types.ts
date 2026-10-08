export type Screen = "entrance" | "scan" | "seal" | "scanSeal" | "locked" | "reveal";
export type ScanPhase = "listening" | "detecting" | "found";
export type ScanMode = "read" | "write";

export type Note = {
  recipient: string;
  message: string;
  from: string;
  voiceUri?: string;
  voiceDurationSec?: number;
  photoUri?: string;
  unlockAt?: string;
};

export type UnlockDraft =
  | { kind: "none" }
  | { kind: "30m" }
  | { kind: "2h" }
  | { kind: "tomorrow" }
  | { kind: "custom"; at: Date };

export const demoNote: Note = {
  recipient: "Mom",
  message:
    "For all the little things you did that felt ordinary at the time, but meant everything to me. I hope you know how loved you are.",
  from: "Alex",
};
