# TapVault

A Soft Keepsake web demo: seal a wholesome note to a physical NFC tag, then open it by holding the object.

This is the **TapVault** workshop-pitch frontend (migrated from an earlier Lovable prototype). Product decisions live in [`TAPVAULT_PITCH_SPEC.md`](./TAPVAULT_PITCH_SPEC.md).

## Develop locally

### Web Soft Keepsake reference (Vite)

Needs [Bun](https://bun.sh) (or Node 20+).

```sh
git clone git@github.com:ms-trix/TapVault.git
cd TapVault
bun install
bun run dev
```

### iPhone Simulator path (Expo) — Workshop A

```sh
cd mobile
npm install
npx expo start
```

Then press `i` for **iOS Simulator** (Mac + Xcode). Mock NFC / Soft Keepsake screens land in the next tasks.

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Web Soft Keepsake demo |
| `bun run build` | Web production build |
| `bun run test` | Web Vitest |
| `cd mobile && npx expo start` | Expo → iOS Simulator |

## Stack

- **Web reference:** TanStack Start / Vite, Soft Keepsake tokens  
- **Pitch app (A):** Expo (iOS) + AsyncStorage + mock NFC UUID lookup — no API/DB
