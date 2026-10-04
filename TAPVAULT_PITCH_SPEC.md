# TapVault — Pitch Spec & Design Source of Truth

> **One-pager for sharing.** Combines the original product blueprint with workshop-pitch scope and the Soft Keepsake design decisions locked in review.

**Premise:** Turn any physical object or NFC sticker into a tactile digital capsule. To open it, you must hold the object.

---

## 1. Pitch hook

### Problem
In a digital world where everything lives in the cloud, messages have lost weight, intimacy, and sense of place.

### Solution
**TapVault** restores physical presence to digital information. A wholesome message is sealed to a real object. The recipient can only open it by tapping that object with their phone.

### 1-minute demo moment
1. Presenter holds a physical object (gift box, card, notebook) with a cheap NFC sticker.
2. Phone taps the tag → haptic feedback + mechanical unlock sound.
3. Screen unlocks and reveals a time-locked / sealed wholesome message (text + optional short audio).
4. Closing line: the message lives with the object — you have to be there to open it.

### Academic / workshop fit
- Individual mobile app
- NFC integration (UID as physical key) for bonus credit
- Clear real-world utility + creativity

---

## 2. Scope decisions (locked)

| Decision | Choice |
|---|---|
| Success target | Working **1-minute workshop pitch** (functional demo, not a full product) |
| Hero use case | Leaving a **wholesome message for someone else** |
| Hero flow | **Time Capsule** — seal now → tap later → ritual unlock → reveal |
| Stretch (optional) | Local **Dead-Drop** guestbook beat after the hero demo |
| Out of scope | Keycard privacy vault, real encryption, cloud sync, accounts, passcodes |
| Security language | Theatrical seal: “sealed to the object / only opens with physical tap” — **not** hard crypto claims |
| Storage | Local `AsyncStorage` on the demo phone; pre-seed a vault for live reliability |

---

## 3. Capsule types (original pillars vs pitch)

| Type | Idea | Pitch status |
|---|---|---|
| **Time Capsule** | Gift / card / heirloom; unlock date + physical tap; teaser until ready | **Hero — build this** |
| **Dead-Drop** | Shared guestbook at a physical spot | **Stretch** (local only, no multiplayer cloud) |
| **Keycard** | Personal private notes on a carried object | **Out of pitch scope** |

---

## 4. User flow

```
┌─────────────────────────────┐
│  1. Scanner                 │
│  Wait for NFC / demo tag    │
└──────────────┬──────────────┘
               │ tag tapped
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ 2. Seal     │  │ 3. Locked   │
│ (new tag)   │  │ (known tag) │
└─────────────┘  └──────┬──────┘
                        │ tap when ready
                        ▼
                 ┌─────────────┐
                 │ 4. Reveal   │
                 │ message +   │
                 │ optional    │
                 │ voice       │
                 └─────────────┘
```

### Demo script (~60s)
1. **Spoken:** “I sealed a message into this gift for someone I care about.”
2. **Tap** object → scanner reacts → haptics + click SFX.
3. **Locked:** short teaser (for live reliability, vault can already be “ready to open”).
4. **Unlock ritual:** animation + vault-open SFX.
5. **Reveal:** wholesome text + optional audio.
6. **Spoken:** “The message only exists where the object is — you have to be there to open it.”

---

## 5. Screens (UI source of truth — Soft Keepsake v3)

### 5.1 Scanner
- Brand: **TapVault** with quiet subtitle “touch to open”
- Object-first mark: small NFC **sticker** graphic (not a heart emoji)
- Quiet concentric rings / listening state
- Copy: “Hold the gift to your phone”
- Demo escape hatch: underlined **Use demo tag** (not a loud pill chip)

### 5.2 Seal (create Time Capsule)
- Title: **Leave a note**
- Support: “It stays inside this gift until they hold it.”
- Clear blocks (readable, not form-kit clutter):
  - **For** — e.g. Mom
  - **Message** — wholesome text
  - **Opens** — e.g. On her birthday
- Voice row: **Voice note** on the left, duration **0:18** on the right (together, not floating)
- Primary CTA: **Seal into this gift** (dark cocoa button)

### 5.3 Locked
- Title: **Still sealed**
- Meta badge: e.g. Birthday box · Alex
- Simple gift + ribbon visual (ceremonial, not clipart-heavy)
- Teaser only (not the full message): e.g. “Open when you need a reminder that you’re loved.”
- Footer: **Ready to open** / “Hold the gift to your phone”

### 5.4 Reveal
- Meta: From **Alex** · Birthday box
- Letter block:
  - For Mom
  - Message body (plain readable type)
  - Sign-off: Alex
  - Voice control under the message: play + **Voice note** + **0:18**
- Footer: “Opened by holding this gift”

### Rejected directions
- “Pop” experiments (bold butter slabs, scrapbook stickers, dark object-stage) — **rejected**
- Heart-emoji brand hero, neon yellow, mustard amber, multi-tone gradient backgrounds — **rejected**
- Italic hard-to-read serif inside content boxes — **rejected**

---

## 6. Design system (locked)

### Name
**Soft Keepsake — pastel butter**

### Color tokens

| Token | Hex | Role |
|---|---|---|
| Cream fill | `#faf6eb` | Screen background (flat, even — no gradient patches) |
| Border | `#e8dfc4` / `#e0d6b8` | Cards, letter sheet, dividers |
| Butter accent | `#e8d89a` / `#e6d59a` | NFC tag, ribbon, soft accents |
| Ink | `#3f392c` / `#4a4335` | Primary text, dark CTA |
| Mute | `#6f6756` / `#8a8170` | Secondary text |

### Typography
| Role | Face | Rules |
|---|---|---|
| Short titles only | **Instrument Serif** | 2–4 words; display moments |
| Body + UI | **DM Sans** | Regular weight; always readable |
| Avoid | Italic in boxes, ALL-CAPS field labels, fluffy meta (“Opened with love · just now”) | |

### Craft principles
1. One hero per screen.
2. Object / gift vernacular over generic app chrome.
3. Voice duration always attached to the voice control.
4. Flat backgrounds only.
5. Quiet demo controls (underline link, not badge clusters).
6. Pitch sensory layer: haptics + mechanical click / vault-open sound.

---

## 7. Data model (pitch MVP)

```ts
export type VaultType = 'time_capsule'; // 'dead_drop' later as stretch

export interface Vault {
  tagId: string;             // NFC Tag UID (or mock ID)
  title: string;             // e.g. "Birthday Box"
  type: VaultType;
  creatorName: string;
  createdAt: string;         // ISO
  unlockDate?: string;       // ISO — Time Capsule
  isSealed: boolean;
  entries: VaultEntry[];
}

export interface VaultEntry {
  id: string;
  author: string;
  content: string;           // Message text
  audioUrl?: string;         // Local URI
  photoUrl?: string;         // Optional / low priority for pitch
  timestamp: string;
}
```

Lookup key: `tagId` → vault in AsyncStorage.

---

## 8. Recommended tech stack

| Layer | Choice |
|---|---|
| App | React Native via **Expo** (TypeScript) |
| NFC | `react-native-nfc-manager` + **Mock mode** for rehearsal |
| Storage | `@react-native-async-storage/async-storage` |
| Haptics | `expo-haptics` |
| Audio | `expo-av` (record/playback + SFX) |
| Motion | `react-native-reanimated` (unlock transition) |
| Icons | `lucide-react-native` (sparingly) |

**SFX assets:** `click.mp3`, `vault-open.mp3`

**Config:** iOS `NFCReaderUsageDescription`, Android NFC permissions when real NFC is wired.

---

## 9. Implementation milestones

### M0 — Foundation
- Scaffold Expo TypeScript app
- Install deps (AsyncStorage, haptics, AV, icons, Reanimated as needed)
- Scanner shell + Mock NFC
- Navigation: Scanner → Seal → Locked/Reveal
- Collect SFX; draft spoken 1-min script

### M1 — Seal Time Capsule
- Create/seal flow: for, message, opens-on, optional voice
- Persist vault by `tagId`
- Ceremonial “Seal into this gift” action

### M2 — Locked → Reveal ritual
- Locked teaser state
- Gate reveal behind tap (mock or real)
- Unlock animation + message/audio reveal

### M3 — Real NFC
- Wire `react-native-nfc-manager`
- Bind real sticker UID
- Keep Mock mode for rehearsal

### M4 — Pitch polish
- Haptic patterns, SFX timing
- Pre-seed demo vault on known tag
- Device rehearsal until the minute is reliable

### M5 — Stretch (only if M0–M4 are solid)
- Local Dead-Drop add/read as a short second beat
- Still no cloud

### Explicit non-goals
- Supabase / multi-device sync
- Real encryption / key derivation
- Passcodes, accounts, auth
- Full Keycard product
- Heavy photo gallery polish

---

## 10. Build order

```
M0 Foundation → M1 Seal → M2 Unlock Ritual → M3 Real NFC → M4 Pitch Polish → (M5 Dead-Drop)
```

---

## 11. Original vs this pitch doc

| Source | Role |
|---|---|
| `TAPVAULT_SPEC.md` (home folder) | Original full blueprint (3 capsule types, Phase 2 Supabase, etc.) |
| **This file** | What we are actually building for Workshop pitch + locked Soft Keepsake design |

If the two disagree, **this file wins** for the pitch build.

---

## 12. Checklist before the live minute

- [ ] Physical object + NFC sticker ready
- [ ] Pre-seeded vault opens reliably on that tag
- [ ] Mock mode works as backup
- [ ] Haptics + unlock SFX audible/feelable in the room
- [ ] Reveal shows wholesome text (+ voice if used)
- [ ] Spoken script rehearsed to ~60s
- [ ] Battery / Do Not Disturb / NFC enabled on demo phone

---

*Soft Keepsake design baseline: craft v3 (readable). Pop-direction experiments were reviewed and rejected.*
