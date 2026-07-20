# Changelog

## 4.9.0

### Security, identity and transfer hardening

- Upgraded Electron to 43.1.1, electron-builder to 26.15.3 and Playwright to 1.61.1; npm audit is clean.
- Enabled Electron renderer sandboxing, denied unexpected navigation/popups and restricted media permissions to the app window.
- Cloud sessions now use random per-session PeerJS IDs stored in the authenticated profile; unknown peers and spoofed call metadata are rejected.
- Incoming peers are no longer added as friends automatically.
- File transfers now use main-process capability tokens, a 512 MB limit, ordered bounded chunks and end-to-end SHA-256 verification.
- File names, avatars, chat payloads, GIF URLs, reactions, timestamps and presence values are bounded and validated.
- Microphone capture and AudioContext resources are released when calls end; 0% volume settings now work correctly.
- Group call invitations carry validated membership metadata and synchronize missing local group records.
- Fixed Supabase presence status shadowing and hardened friendship/group/signaling RLS policies.
- Presence WebSocket now supports a shared deployment token, rejects username takeover, rate-limits clients and removes stale sockets.
- Added JavaScript syntax checks, signal security tests and a fixed Electron UI smoke harness.

## 4.8.2

### Native WASAPI system audio (fixes “ses yakalanamadı”)

- Root cause: Chromium `getDisplayMedia` + `audio: "loopback"` fails on multi-device PCs with `NotReadableError: Could not start audio source` (video OK, audio never starts)
- **Fix:** ship `assets/bin/wasapi-loopback.exe` — real Windows WASAPI default-render loopback → PCM → Web Audio MediaStreamTrack → PeerJS
- Screen share: video via getDisplayMedia (reliable) + **native default-output mix** when “sistem sesi” is on
- Chromium loopback kept only as last-resort fallback
- Full screen / window share use the same audio path (tied to Windows default playback device)

## 4.8.1

### Default-output loopback + mic toggle SFX

- Screen share audio = **Windows default playback device mix** (WASAPI loopback); full screen or window — same path
- Clear UI messages when loopback captured / missing
- Mic mute/unmute feedback sounds: `public/sounds/mic_on.mp3`, `mic_mute.mp3` (from Desktop/mic)

## 4.8.0

### Screen share rebuild + any-button hotkeys

- **Share button:** enabled whenever `inCall` / mediaCall exists; force-clear `disabled`; clear `outboundRing` on bind
- **Capture:** simple `getDisplayMedia({video:true, audio})` + loopback when audio wanted
- **Audio path:** primary video+audio call + optional `screen-audio` backup call; receiver attaches audio without thrashing video
- **Hotkeys:** capture **any** keyboard key or mouse button (Mouse1–5) with 400ms open-click ignore; global via Electron + uiohook (works over games)
- Labels: Sol tık / Sağ tık / Orta / Mouse 4–5

## 4.7.2

### Screen share unlock + global hotkeys + Mouse4

- **Screen share button stuck:** cleared `outboundRing` after call connects; button no longer stays disabled during active call
- **getDisplayMedia** simplified (`video: true`) for higher capture success
- **Global hotkeys:** `main/hotkeys.js` — Electron `globalShortcut` + `uiohook-napi` backup so mic/deafen work while a fullscreen game has focus; re-register on window blur
- **Mouse 4 / 5:** capturable in settings (mousedown/auxclick); registered via uiohook globally

## 4.7.1

### Fable 5 fix plan (critical bugs)

- **display-media:** callback exactly once; loopback only when `audioRequested`
- **Screen share:** single `kind:screen` call (no dual screen-audio / no dead addTrack renegotiation)
- **Screen receive:** no double `srcObject` reset; `ontrack` / `onaddtrack` for late audio; 3s missing-audio message
- **Incoming call:** 30s timeout → missed; close when caller hangs up; reject second call while busy
- **AudioContext.resume** after create (silent mic on auto-answer)
- **hangup:** `screen-stop` to all media peers before clear
- **endCallUi:** reset remote placeholder text
- **Group chat-edit/delete/react** use `msg.groupId`
- **Temp data handler** removed after bind (no double hello)
- **Noise toggle** updates all mediaCalls
- **ICE:** remove dead openrelay TURN
- **GIF XSS:** createElement img; **ESC** only exits fullscreen when open
- **sendGif** group-aware; missed-call `from` fix for inbound

## 4.7.0

### Critical: city-to-city calls + desktop icon + groups UI

- **Default signaling = public PeerJS** (`signal.enabled: false`) so Yalova↔İzmir style calls work after download without a shared VPS signal host. Own signal remains optional via `cloud/signal.json`.
- **Calls always attempt `peer.call`** even if the data channel is not open yet (MediaConnection independent of chat DataConnection).
- **Desktop / exe icon:** `signAndEditExecutable: true` so the flame icon is written into `Hearth.exe` and NSIS shortcuts.
- **EN/TR:** auth labels + placeholders (`username`, email, password, optional display name, chat search, message box, add-friend).
- **Group rooms pane:** hidden by default; appears when a group is created (2+ friends selected → group call) or when groups exist.

### Prior (4.6.x)

- Clickable chat links with open confirm
- Screen system audio multi-path
- Media/chat splitter, status colors, signal embed EADDRINUSE fix

## 4.6.1

### Links, i18n, screen system audio

- Chat links with confirm + `shell.openExternal`
- EN/TR system message pass
- Screen loopback + screen-audio call + voice inject

## 4.6.0

### Splitter + stabilite release

- Media/chat splitter rewrite
- Single-instance + port-busy safe signal
- Status color dots, missed-call spam guard

## 4.5.0

### Own signal server (phase 2)

- `signal-server/` PeerJS + presence (optional; not default for internet)

## 4.4.0

### Toju-inspired architecture (phase 0–1)

- display-media singleton, icon paths, hangup cleanup
