# Hearth Signal Server

Toju-inspired **minimal** signaling host:

| Path | Role |
|------|------|
| `/peerjs` | PeerJS server (WebRTC offer/answer/ICE for Hearth clients) |
| `/presence` | WebSocket roster + status_update |
| `/health` | JSON health |

**Media never goes through this process** — only signaling metadata.

## Run

```bash
# from Hearth project root
npm run signal
# or
node signal-server/index.js
```

Default: `http://0.0.0.0:9000`

## Client config (`cloud/config.json`)

```json
{
  "enabled": true,
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseAnonKey": "…",
  "signal": {
    "enabled": true,
    "host": "127.0.0.1",
    "port": 9000,
    "secure": false,
    "peerPath": "/peerjs",
    "presencePath": "/presence"
  }
}
```

All friends must point to the **same** signal host (LAN IP or VPS).

## Production

Run on a small VPS; open TCP `9000` (or put behind nginx with WSS).  
Update every client’s `signal.host` to that public hostname and `"secure": true` if TLS.
