# Implementation plan: Entrance, photo, timed unlock

Spec: `docs/superpowers/specs/2026-10-07-tapvault-entrance-photo-unlock-design.md`

## Files

| File | Role |
|------|------|
| `mobile/src/types.ts` | Screen, ScanMode, UnlockDraft, Note fields |
| `mobile/src/lib/storage.ts` | resetDemo helper |
| `mobile/src/lib/media.ts` | copy/resolve/delete media in documents |
| `mobile/src/lib/unlock.ts` | resolve UnlockDraft → ISO; format countdown |
| `mobile/src/components/PhotoRow.tsx` | pick/preview/remove photo |
| `mobile/src/components/UnlockAtRow.tsx` | presets + custom picker |
| `mobile/src/components/FillAction.tsx` | L→R fill press row |
| `mobile/src/screens/EntranceScreen.tsx` | home + splash continuity + reset |
| `mobile/src/screens/ScanScreen.tsx` | mode read/write, back, no leave-note |
| `mobile/src/screens/SealScreen.tsx` | photo + unlock + continue |
| `mobile/src/screens/LockedScreen.tsx` | hard lock UI |
| `mobile/src/screens/RevealScreen.tsx` | show photo |
| `mobile/src/components/ui.tsx` | optional onNewNote |
| `mobile/App.tsx` | state machine wiring |
| `mobile/app.json` | image-picker plugin |
| `mobile/AGENTS.md` | state-machine exception |
| `mobile/package.json` | new deps via expo install |

## Tasks

1. Install deps + app.json permissions  
2. Types + unlock + media helpers  
3. FillAction + EntranceScreen + splash ownership  
4. ScanScreen mode + SealScreen continue/photo/unlock  
5. App.tsx full wiring (sealOnTag, BackHandler, openNote guard)  
6. Locked + Reveal  
7. Reset demo + AGENTS note  
8. `tsc --noEmit` / lint  

## Verify

Manual checklist from spec Testing section.
