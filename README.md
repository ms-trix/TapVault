# TapVault

A Soft Keepsake web demo: seal a wholesome note to a physical NFC tag, then open it by holding the object.

This is the **TapVault** workshop-pitch frontend (migrated from an earlier Lovable prototype). Product decisions live in [`TAPVAULT_PITCH_SPEC.md`](./TAPVAULT_PITCH_SPEC.md).

## Develop locally

Needs [Bun](https://bun.sh) (or Node 20+).

```sh
git clone git@github.com:ms-trix/TapVault.git
cd TapVault
bun install
bun run dev
```

Open the URL Vite prints (usually `http://127.0.0.1:5173`).

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Local demo |
| `bun run build` | Production build |
| `bun run test` | Vitest |
| `bun run lint` | ESLint |

## Stack

TanStack Start / Vite, React, Tailwind CSS v4, Soft Keepsake pastel-butter design tokens.
