import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Mic, Plus, ScanLine, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { playClick, playUnlock } from "@/lib/sfx";

type Screen = "scan" | "seal" | "locked" | "reveal";
type ScanPhase = "listening" | "detecting" | "found";
type Note = {
  recipient: string;
  message: string;
  from: string;
  voiceDataUrl?: string;
  voiceDurationSec?: number;
};

/** Keep these aligned with CSS animation durations in styles.css */
const TIMING = {
  detectMs: 1500,
  foundHoldMs: 1300,
  unlockMs: 920,
} as const;

const STORAGE_KEY = "tapvault-keepsake";
const MAX_VOICE_SEC = 30;

const demoNote: Note = {
  recipient: "Mom",
  message:
    "For all the little things you did that felt ordinary at the time, but meant everything to me. I hope you know how loved you are.",
  from: "Alex",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TapVault — A message you can hold" },
      {
        name: "description",
        content: "A personal note connected to a small NFC tag. Explore the TapVault scanning demo.",
      },
      { property: "og:title", content: "TapVault — A message you can hold" },
      {
        property: "og:description",
        content: "A personal note connected to a small NFC tag. Explore the TapVault scanning demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function NfcMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M9 7c-3 2-3 8 0 10M12 4c-6 3-6 13 0 16m3-13c3 2 3 8 0 10" />
    </svg>
  );
}

function stepLabel(screen: Screen, scanPhase: ScanPhase) {
  if (screen === "scan") {
    if (scanPhase === "found") return "Demo tag found";
    if (scanPhase === "detecting") return "Reading demo tag";
    return "Demo scan";
  }
  if (screen === "seal") return "A new note";
  if (screen === "locked") return "A sealed note";
  return "A moment to keep";
}

function formatDuration(sec: number) {
  const whole = Math.max(0, Math.floor(sec));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function readStoredNote(): Note | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Note;
    if (parsed.recipient && parsed.message && parsed.from) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredNote(note: Note) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
  } catch {
    /* Storage full / private mode — demo still works in memory. */
  }
}

function Index() {
  const [screen, setScreen] = useState<Screen>("scan");
  const [note, setNote] = useState<Note>(demoNote);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [scanPhase, setScanPhase] = useState<ScanPhase>("listening");
  const [opening, setOpening] = useState(false);
  const [revealFromUnlock, setRevealFromUnlock] = useState(false);
  const [draftVoiceUrl, setDraftVoiceUrl] = useState<string | undefined>();
  const [draftVoiceSec, setDraftVoiceSec] = useState<number | undefined>();
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const recordStartedAt = useRef(0);
  const recordTick = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Pre-seed: ensure a known demo note exists so cold-start pitch never opens empty.
    const existing = readStoredNote();
    if (existing) {
      setNote(existing);
    } else {
      writeStoredNote(demoNote);
      setNote(demoNote);
    }
    return () => {
      timers.current.forEach(clearTimeout);
      stopRecordingCleanup();
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const stopRecordingCleanup = () => {
    if (recordTick.current) {
      clearInterval(recordTick.current);
      recordTick.current = null;
    }
    mediaRecorder.current?.stop();
    mediaRecorder.current = null;
    mediaStream.current?.getTracks().forEach((track) => track.stop());
    mediaStream.current = null;
    setRecording(false);
  };

  const moveTo = (next: Screen, options?: { fromUnlock?: boolean }) => {
    clearTimers();
    if (next === "scan") setScanPhase("listening");
    if (next === "seal") {
      setVoiceError(null);
    }
    setOpening(false);
    setRevealFromUnlock(Boolean(options?.fromUnlock));
    setPlayingVoice(false);
    audioRef.current?.pause();
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const sealNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newNote: Note = {
      recipient: recipient.trim(),
      message: message.trim(),
      from: from.trim(),
      voiceDataUrl: draftVoiceUrl,
      voiceDurationSec: draftVoiceSec,
    };
    if (!newNote.recipient || !newNote.message || !newNote.from) return;
    setNote(newNote);
    writeStoredNote(newNote);
    void playClick();
    moveTo("locked");
  };

  const useDemo = () => {
    if (scanPhase !== "listening") return;
    setScanPhase("detecting");
    // Always use the pre-seeded demo note for the pitch path (reliable every time).
    setNote(demoNote);
    writeStoredNote(demoNote);
    void playClick();
    timers.current.push(
      setTimeout(() => {
        setScanPhase("found");
        void playClick();
      }, TIMING.detectMs),
      setTimeout(() => moveTo("locked"), TIMING.detectMs + TIMING.foundHoldMs),
    );
  };

  const openNote = () => {
    if (opening) return;
    setOpening(true);
    void playUnlock();
    timers.current.push(setTimeout(() => moveTo("reveal", { fromUnlock: true }), TIMING.unlockMs));
  };

  const startRecording = async () => {
    setVoiceError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError("Voice notes need mic access in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      chunks.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = typeof reader.result === "string" ? reader.result : undefined;
          const elapsed = Math.min(MAX_VOICE_SEC, (Date.now() - recordStartedAt.current) / 1000);
          setDraftVoiceUrl(url);
          setDraftVoiceSec(Number(elapsed.toFixed(1)));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        mediaStream.current = null;
      };
      recordStartedAt.current = Date.now();
      setRecordSec(0);
      setRecording(true);
      recorder.start();
      recordTick.current = setInterval(() => {
        const elapsed = (Date.now() - recordStartedAt.current) / 1000;
        setRecordSec(elapsed);
        if (elapsed >= MAX_VOICE_SEC) {
          stopRecording();
        }
      }, 200);
    } catch {
      setVoiceError("Couldn’t reach the microphone. Check permissions and try again.");
    }
  };

  const stopRecording = () => {
    if (recordTick.current) {
      clearInterval(recordTick.current);
      recordTick.current = null;
    }
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    mediaRecorder.current = null;
    setRecording(false);
  };

  const clearVoice = () => {
    stopRecordingCleanup();
    setDraftVoiceUrl(undefined);
    setDraftVoiceSec(undefined);
    setRecordSec(0);
    setVoiceError(null);
  };

  const togglePlayVoice = async () => {
    if (!note.voiceDataUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(note.voiceDataUrl);
      audioRef.current.onended = () => setPlayingVoice(false);
    }
    if (playingVoice) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoice(false);
      return;
    }
    audioRef.current.src = note.voiceDataUrl;
    try {
      await audioRef.current.play();
      setPlayingVoice(true);
    } catch {
      setPlayingVoice(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Button variant="ghost" className="brand" aria-label="TapVault home" onClick={() => moveTo("scan")}>
          <span className="brand-mark">
            <NfcMark />
          </span>
          <span>
            <span className="brand-name">TapVault</span>
            <span className="brand-subtitle">touch to open</span>
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Leave a new note"
          title="Leave a new note"
          onClick={() => moveTo("seal")}
        >
          <Plus />
        </Button>
      </header>

      <main className="app-main">
        <section className="experience" aria-label="TapVault experience">
          <div className="experience-top">
            <span className="step" role="status" aria-live="polite">
              <span
                className={`step-dot ${screen === "scan" && scanPhase === "listening" ? "step-dot-live" : ""}`}
              />{" "}
              {stepLabel(screen, scanPhase)}
            </span>
          </div>

          {screen === "scan" && (
            <div className={`experience-body scan-screen ${scanPhase}`} key="scan">
              <div className="scan-main">
                <div className="object-stage">
                  <div className="scan-orbit scan-orbit-outer" aria-hidden="true" />
                  <div className="scan-orbit scan-orbit-inner" aria-hidden="true" />
                  <div className="scan-trace" aria-hidden="true" />
                  <div className="scan-center" aria-hidden="true">
                    <NfcMark />
                    <span className="scan-success">
                      <Check />
                    </span>
                  </div>
                </div>
                <div className="scan-copy" aria-live="polite">
                  <h1 className="scan-title">
                    {scanPhase === "found" ? (
                      "Note found."
                    ) : scanPhase === "detecting" ? (
                      "Reading the tag…"
                    ) : (
                      <>
                        Hold a tag
                        <br />
                        to your phone.
                      </>
                    )}
                  </h1>
                  <p className="scan-subtitle">
                    {scanPhase === "found"
                      ? "Ready to open."
                      : scanPhase === "detecting"
                        ? "Finding the note inside."
                        : "A little note, waiting to be opened."}
                  </p>
                </div>
              </div>
              <div className="experience-bottom scan-footer">
                <Button
                  variant="keepsake"
                  className="full-button scan-demo-button"
                  type="button"
                  onClick={useDemo}
                  disabled={scanPhase !== "listening"}
                >
                  <ScanLine />{" "}
                  {scanPhase === "found"
                    ? "Tag found"
                    : scanPhase === "detecting"
                      ? "Reading tag…"
                      : "Use demo tag"}{" "}
                  <ArrowRight className="scan-button-arrow" />
                </Button>
                <Button variant="ghost" className="leave-action" type="button" onClick={() => moveTo("seal")}>
                  Leave a note <ArrowRight />
                </Button>
              </div>
            </div>
          )}

          {screen === "seal" && (
            <form className="experience-body screen-enter seal-screen" key="seal" onSubmit={sealNote}>
              <div className="form-back">
                <Button variant="ghost" className="back-action" type="button" onClick={() => moveTo("scan")}>
                  <ArrowLeft /> Back
                </Button>
              </div>
              <h1 className="view-heading">Leave a note</h1>
              <p className="view-support">A few words they can keep close.</p>
              <div className="form-fields">
                <div className="field">
                  <label htmlFor="recipient">For</label>
                  <input
                    id="recipient"
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder="Someone special"
                    required
                    maxLength={60}
                  />
                </div>
                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write what you want them to remember…"
                    required
                    maxLength={1000}
                  />
                </div>
                <div className="field">
                  <label htmlFor="from">From</label>
                  <input
                    id="from"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    placeholder="Your name"
                    required
                    maxLength={60}
                  />
                </div>

                <div className="voice-block">
                  <div className="voice-row">
                    <div className="voice-left">
                      <span className="voice-mic" aria-hidden="true">
                        <Mic />
                      </span>
                      <div>
                        <div className="voice-title">Voice note</div>
                        <div className="voice-meta">
                          {recording
                            ? `Recording ${formatDuration(recordSec)}`
                            : draftVoiceUrl
                              ? `Saved · ${formatDuration(draftVoiceSec ?? 0)}`
                              : "Optional · up to 30 seconds"}
                        </div>
                      </div>
                    </div>
                    <div className="voice-actions">
                      {draftVoiceUrl && !recording ? (
                        <Button type="button" variant="ghost" className="voice-text-btn" onClick={clearVoice}>
                          Remove
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="quiet"
                        className="voice-record-btn"
                        onClick={recording ? stopRecording : startRecording}
                      >
                        {recording ? <Square /> : <Mic />}
                        {recording ? "Stop" : draftVoiceUrl ? "Re-record" : "Record"}
                      </Button>
                    </div>
                  </div>
                  {voiceError ? <p className="voice-error">{voiceError}</p> : null}
                </div>
              </div>
              <div className="form-bottom experience-bottom">
                <p className="form-hint">Your note stays on this device for the demo.</p>
                <Button variant="keepsake" className="full-button" type="submit">
                  Seal this note <ArrowRight className="mini-icon" />
                </Button>
              </div>
            </form>
          )}

          {screen === "locked" && (
            <div
              className={`experience-body screen-enter locked-screen ${opening ? "is-opening" : ""}`}
              key="locked"
            >
              <div className="locked-main">
                <span className="meta-line">
                  For {note.recipient} · From {note.from}
                </span>
                <div className="locked-emblem" aria-hidden="true">
                  <NfcMark />
                </div>
                <h1 className="locked-title">Still sealed.</h1>
                <p className="teaser">A few words are waiting here, just for {note.recipient}.</p>
              </div>
              <div className="experience-bottom">
                <div className="ready-row">
                  <strong>Ready to open</strong>
                  <span>{note.voiceDataUrl ? "Note + voice" : `For ${note.recipient}`}</span>
                </div>
                <Button variant="keepsake" className="full-button" onClick={openNote} disabled={opening}>
                  {opening ? "Opening…" : "Open the note"} <ArrowRight className="mini-icon" />
                </Button>
                <Button variant="link" className="text-action back-to-start" type="button" onClick={() => moveTo("scan")}>
                  Back to start
                </Button>
              </div>
            </div>
          )}

          {screen === "reveal" && (
            <div
              className={`experience-body screen-enter reveal-screen ${revealFromUnlock ? "from-unlock" : ""}`}
              key="reveal"
            >
              <div className="reveal-main">
                <span className="reveal-kicker">From {note.from}</span>
                <h1 className="reveal-heading">For {note.recipient}.</h1>
                <article className="letter">
                  <p className="letter-message">{note.message}</p>
                  <p className="letter-signature">{note.from}</p>
                  {note.voiceDataUrl ? (
                    <div className="letter-voice">
                      <Button
                        type="button"
                        variant="keepsake"
                        className="voice-play-btn"
                        onClick={togglePlayVoice}
                        aria-label={playingVoice ? "Stop voice note" : "Play voice note"}
                      >
                        {playingVoice ? <Square /> : <span className="play-triangle">▶</span>}
                      </Button>
                      <div className="letter-voice-copy">
                        <div className="voice-title">Voice note</div>
                        <div className="voice-meta">{formatDuration(note.voiceDurationSec ?? 0)}</div>
                      </div>
                    </div>
                  ) : null}
                </article>
                <p className="opened-caption">Opened by holding this gift</p>
              </div>
              <div className="experience-bottom reveal-actions">
                <Button variant="quiet" onClick={() => moveTo("scan")}>
                  <ArrowLeft className="mini-icon" /> Start again
                </Button>
                <Button variant="keepsake" onClick={() => moveTo("seal")}>
                  <Plus className="mini-icon" /> New note
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
