# TapVault mobile: Entrance, photo, timed unlock

**Date:** 2026-10-07  
**Scope:** Expo mobile app (`mobile/`) only — local AsyncStorage demo; no cloud sync.  
**Approach:** Extend the existing screen state machine (do not migrate to Expo Router for this work).  
**AGENTS.md exception:** This prototype keeps the `App.tsx` state machine; do not migrate these screens to Expo Router as part of this feature.

## Problem

- App opens straight on Scan; “Leave a note” is a small GhostLink and does not read as a peer feature.
- Notes are text + optional voice only — no photo.
- There is no way for the creator to set when a viewer may open the note.

## Goals

1. New **Entrance** home with two equal peer actions: Scan a tag / Leave a note.
2. Optional **one photo** on a note (camera or library).
3. Optional **unlock-at** time with **hard lock** until that moment (presets + custom date/time).
4. Leave-a-note flow: **write → scan-to-seal → locked** (tap seals the composed note onto the tag).

## Non-goals

- Real NFC hardware (keep simulate CTA).
- Multi-photo albums, accounts, or backend sync.
- Soft unlock / “open early” escape on Locked (use Reset demo instead).
- Migrating navigation to Expo Router.
- Changing the web pitch route unless needed later.
- Hover-only interactions (press is the real affordance; fill runs on press).

## Decisions (locked)

| Topic | Decision |
|--------|----------|
| Navigation architecture | Extend `Screen` state machine in `App.tsx` |
| Launch screen | `entrance` (not `scan`) |
| Entrance layout | Layout X: brand + headline + lede + two rows (no card chrome) |
| Entrance copy | Headline: “What would you like to do?” · Lede: “Scan a sealed note, or write one of your own.” |
| Entrance motion | Left→right ink fill on press (~280ms) via native-driver `translateX` mask; press scale; ScreenEnter stagger; disable both rows after first press |
| Brand mark | Existing `NfcMark` (butter tile + wave SVG) — never “NFC” lettering |
| Leave-a-note order | Write (Seal) → Scan-to-seal → Locked |
| Read path | Entrance → Scan → Locked → Reveal |
| Photo | Optional, one image, camera or library |
| Unlock draft | Store preset in draft; resolve `unlockAt` **at seal time** |
| Tomorrow | Local calendar tomorrow at **09:00** |
| Unlock behavior | Hard lock until `unlockAt`; if unset, open immediately |
| Demo recovery | Long-press brand mark on Entrance → Reset demo note |
| Media persistence | Copy photo (and voice) into app documents; store relative paths |
| Back | Scan → Entrance; Seal → Entrance; Scan-to-seal → Seal; Locked → Entrance; Android `BackHandler` mirrors this |

## Navigation flow

```
App open → Entrance
            ├─ Scan a tag  → Scan (mode=read)
            │                    └─ → Locked → Reveal
            └─ Leave a note → Seal (compose)
                                 └─ Continue → Scan-to-seal (mode=write)
                                      └─ simulate → save → Locked → Reveal

Reveal: Start again → Entrance · New note → Seal
Entrance long-press mark → reset DEMO_TAG_ID to demoNote
```

## Data model

```ts
export type Note = {
  recipient: string;
  message: string;
  from: string;
  voiceUri?: string;       // relative docs path or legacy absolute URI
  voiceDurationSec?: number;
  photoUri?: string;       // relative docs path or legacy absolute URI
  unlockAt?: string;       // ISO-8601; omit = open immediately
};

export type UnlockDraft =
  | { kind: 'none' }
  | { kind: '30m' }
  | { kind: '2h' }
  | { kind: 'tomorrow' }
  | { kind: 'custom'; at: Date };

export type Screen = 'entrance' | 'scan' | 'seal' | 'scanSeal' | 'locked' | 'reveal';
export type ScanMode = 'read' | 'write';
```

Resolve unlock when sealing:

- `30m` → `now + 30 minutes`
- `2h` → `now + 2 hours`
- `tomorrow` → next local calendar day at 09:00
- `custom` → chosen datetime (picker `minimumDate = now + 1 min`)

## Splash continuity

- **Entrance** owns continuity assemble: accepts `continuityAssemble`, `onMarkReady`, `onAssembleDone` (same contract as today’s ScanScreen).
- After assemble completes, `continuityAssemble` becomes false.
- **ScanScreen** always receives `continuityAssemble={false}` on later visits so listening pulse works.

## Entrance screen

- New `EntranceScreen`; SoftAmbient + AppHeader with `NfcMark`.
- Two peer paper rows; L→R ink fill then navigate; reduce-motion → navigate immediately.
- Long-press mark → confirm Reset demo → `saveVault(DEMO_TAG_ID, demoNote)` + toast/quiet feedback.
- Remove Scan GhostLink and header `+` (or make `onNewNote` optional and omit it).

## Seal screen

- For / Message / From + VoiceRow + **PhotoRow** + **UnlockAtRow**.
- Draft keeps `photoUri` (temp picker URI until seal) and `UnlockDraft`.
- CTA “Continue to seal” → `scanSeal` (no persist yet).
- Block Continue / photo pick while voice is recording.
- Back → Entrance (draft kept in App state intentionally).

## ScanScreen modes

- Prop `mode: 'read' | 'write'`, optional `onBack`.
- Read copy: existing listening / detecting / found.
- Write copy: “Hold a tag to seal this note.” / “Sealing…” / “Sealed to this tag.”
- `moveTo` resets `scanPhase` for both `scan` and `scanSeal`.
- Read simulate: `useDemoTag` (load vault → locked).
- Write simulate: `sealOnTag` — do **not** load vault; persist draft note; await `saveVault`; on failure stay + error; disable Back while detecting; on found → locked.
- `stepLabel`: entrance / scanSeal cases.

## Media files

- Dependencies: `expo-image-picker`, `expo-file-system`, `@react-native-community/datetimepicker` via `npx expo install`.
- Configure picker permissions via `expo-image-picker` plugin in `app.json`.
- On seal: copy photo + voice into documents (`tapvault-media/`), store relative names; resolve to absolute URI on load/display.
- Delete previous media for the tag when overwriting a seal when feasible.

## Locked / open

- Countdown from `Date.now()` every 1s; recompute on `AppState` active.
- At zero, enable Open without reload.
- `openNote` guards: refuse if still before `unlockAt`.
- Unparseable `unlockAt` → treat as unlocked.
- Device clock change can unlock (accepted for demo).
- Display: under 24h as `HH:MM:SS` / “Opens in …”; beyond 24h as “Opens Thu 9:00”.
- Footer: “Sealed until …” when locked; meta includes photo/voice hints.
- Header home + Locked back → Entrance.

## Date picker platforms

- iOS: spinner/sheet datetime.
- Android: date step then time step.
- Web: hide Custom or use simple fallbacks; presets still work.

## Reveal

- Photo above letter (max height ~220, contain); then message + voice.
- Start again → Entrance; New note → Seal.

## Testing (manual)

1. Cold start → Entrance; splash hides; fill then navigate.
2. Read path: Scan → Locked → Reveal → Start again → Entrance.
3. Write path: Seal + photo + 30m → Scan-to-seal → Locked countdown; Open disabled; after time Open works.
4. Write with no unlock → Open immediate.
5. Back mappings + Android back.
6. Preseeded note without unlock still opens.
7. Seal timed note, Reset demo, Scan path opens immediately.
8. Background app during countdown; return; remaining time correct.
