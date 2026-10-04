import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Plus, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Screen = "scan" | "seal" | "locked" | "reveal";
type ScanPhase = "listening" | "detecting" | "found";
type Note = { recipient: string; message: string; from: string };

/** Keep these aligned with CSS animation durations in styles.css */
const TIMING = {
  detectMs: 1500,
  foundHoldMs: 1300,
  unlockMs: 920,
} as const;

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

function Index() {
  const [screen, setScreen] = useState<Screen>("scan");
  const [note, setNote] = useState<Note>(demoNote);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [scanPhase, setScanPhase] = useState<ScanPhase>("listening");
  const [opening, setOpening] = useState(false);
  const [revealFromUnlock, setRevealFromUnlock] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("tapvault-keepsake");
      if (saved) {
        const parsed = JSON.parse(saved) as Note;
        if (parsed.recipient && parsed.message && parsed.from) {
          setNote(parsed);
        }
      }
    } catch {
      /* The demo works without storage. */
    }
  }, []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const moveTo = (next: Screen, options?: { fromUnlock?: boolean }) => {
    clearTimers();
    if (next === "scan") setScanPhase("listening");
    setOpening(false);
    setRevealFromUnlock(Boolean(options?.fromUnlock));
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const sealNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newNote = {
      recipient: recipient.trim(),
      message: message.trim(),
      from: from.trim(),
    };
    if (!newNote.recipient || !newNote.message || !newNote.from) return;
    setNote(newNote);
    try {
      window.localStorage.setItem("tapvault-keepsake", JSON.stringify(newNote));
    } catch {
      /* Continue without storage. */
    }
    moveTo("locked");
  };

  const useDemo = () => {
    if (scanPhase !== "listening") return;
    setScanPhase("detecting");
    setNote(demoNote);
    timers.current.push(
      setTimeout(() => setScanPhase("found"), TIMING.detectMs),
      setTimeout(() => moveTo("locked"), TIMING.detectMs + TIMING.foundHoldMs),
    );
  };

  const openNote = () => {
    if (opening) return;
    setOpening(true);
    timers.current.push(
      setTimeout(() => moveTo("reveal", { fromUnlock: true }), TIMING.unlockMs),
    );
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
            <form className="experience-body screen-enter" key="seal" onSubmit={sealNote}>
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
                  <span>For {note.recipient}</span>
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
