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
    "presencePath": "/presence",
    "authToken": "UZUN_RASTGELE_ORTAK_TOKEN"
  }
}
```

All friends must point to the **same** signal host (LAN IP or VPS). For a public
server, set `HEARTH_SIGNAL_TOKEN` on the server to the same long random value as
`signal.authToken` in every client. This protects presence; WebRTC media remains P2P.

## Production

Run behind TLS/WSS and a reverse proxy with connection rate limits. Do not expose
an unprotected development server to the internet. Update every client’s
`signal.host` to the public hostname and set `"secure": true`.
