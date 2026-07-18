# Hearth Architecture

## Product surface

Hearth is a **desktop-first friend chat**: 1:1 / small-group **P2P** voice, screen share, and files. Optional **Supabase** for accounts, friend requests, and presence. It is **not** a full Discord clone (no plugin marketplace, no multi-server CQRS).

## Inspired by Toju (patterns, not a fork)

Toju (`Desktop/toju`) is a mature monorepo (Angular + Electron + signaling server + Playwright). Hearth adopts its **proven boundaries**, not its full stack.

```
┌─────────────────┐   WS / cloud (meta only)   ┌──────────────────┐
│  Hearth client  │◄──────────────────────────►│ Supabase (auth,  │
│  Electron + UI  │   accounts / friends       │  friends, presence) │
└────────┬────────┘                            └──────────────────┘
         │
         │ WebRTC media + data (P2P)
         ▼
    Friend devices
```

**Today:** PeerJS still provides public signaling for WebRTC.  
**Target (phase 2):** own lightweight signal server (Toju-style offer/answer/ICE + status), media never on server.

## Layers

| Layer | Owns |
|-------|------|
| `main.js` + `main/*` | Window, tray, icon, display-media singleton, IPC, auto-update |
| `preload.js` | `window.api` bridge only |
| `public/app.js` | UI + PeerJS session (to be split into domains) |
| `public/cloud/` | Supabase client |
| `storage.js` | Local JSON userData |
| `tests/ui/` | Playwright UI lab |

## Media invariants (from Toju lessons)

1. **Display media handler** registered **once** per app run (`main/display-media.js`).
2. On hangup / peer leave: clear **all** remote audio/video `srcObject`, peer voice elements, screen calls.
3. File transfer: **admit once** (accept/reject); never leave `sendFileBusy` stuck after decline.
4. Screen system audio: Electron `audio: "loopback"` when requested.

## What we will not import wholesale from Toju

- Angular 21 + NgRx product shell  
- Room/server/plugin/TypeORM CQRS  
- Capacitor mobile  

## Docs

- `LESSONS.md` — durable agent rules  
- `docs/TOJU-ADAPT.md` — mapping table  
- `CLOUD.md`, `DAGITIM.md`, `tests/README.md`
