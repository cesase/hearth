# Changelog

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
