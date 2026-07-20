# Hearth Architecture

## Product surface

Hearth is a **desktop-first friend chat**: 1:1 / small-group **P2P** voice, screen share, and files. Optional **Supabase** for accounts, friend requests, and presence. It is **not** a full Discord clone (no plugin marketplace, no multi-server CQRS).

## Inspired by Toju (patterns, not a fork)

Toju (`Desktop/toju`) is a mature monorepo (Angular + Electron + signaling server + Playwright). Hearth adopts its **proven boundaries**, not its full stack.

```
┌─────────────────┐   auth / friends (opt)     ┌──────────────────┐
│  Hearth client  │◄──────────────────────────►│ Supabase         │
│  Electron + UI  │                            └──────────────────┘
└────────┬────────┘
         │ PeerJS path + presence WS (signaling only)
         ▼
┌─────────────────┐
│ signal-server   │  /peerjs · /presence · /health
│ (embed or VPS)  │  media never traverses here
└────────┬────────┘
         │ after SDP/ICE: direct WebRTC P2P
         ▼
    Friend devices
```

**Phase 2 (current):** self-hosted PeerJS (`ExpressPeerServer`) + presence WebSocket.  
Public `0.peerjs.com` is fallback only when `signal.enabled === false`.  
Media (audio/video/files) is always P2P — never through the signal process.

## Layers

| Layer | Owns |
|-------|------|
| `main.js` + `main/*` | Window, tray, icon, display-media singleton, IPC, auto-update, optional signal embed |
| `preload.js` | Narrow `window.api` bridge; paths stay outside the renderer |
| `public/app.js` | UI + PeerJS session (to be split into domains) |
| `public/infrastructure/` | Presence WS client |
| `public/cloud/` | Supabase client |
| `signal-server/` | PeerJS + presence (LAN / VPS / Electron embed) |
| `storage.js` | Local JSON userData |
| `tests/ui/` | Playwright UI lab |

## Media invariants (from Toju lessons)

1. **Display media handler** registered **once** per app run (`main/display-media.js`).
2. On hangup / peer leave: clear **all** remote audio/video `srcObject`, peer voice elements, screen calls.
3. File transfer: **admit once**, use capability tokens, ordered bounded chunks and SHA-256 finalization.
4. Screen system audio: native WASAPI default-output loopback; Chromium capture is fallback only.
5. Cloud PeerJS identity: random session ID published through the authenticated profile; incoming calls/data must match it.
6. Renderer: sandboxed, context-isolated and unable to navigate away from the packaged app entry.

## What we will not import wholesale from Toju

- Angular 21 + NgRx product shell  
- Room/server/plugin/TypeORM CQRS  
- Capacitor mobile  

## Docs

- `LESSONS.md` — durable agent rules  
- `docs/TOJU-ADAPT.md` — mapping table  
- `CLOUD.md`, `DAGITIM.md`, `tests/README.md`
