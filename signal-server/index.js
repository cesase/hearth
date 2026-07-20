/**
 * Hearth signal server (Toju-inspired, minimal)
 * - PeerJS signaling: /peerjs (ExpressPeerServer)
 * - Presence WS: /presence
 * Media never flows through this server.
 *
 * Usage: node signal-server/index.js
 * Env: PORT=9000  HOST=0.0.0.0
 */
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");
const { ExpressPeerServer } = require("peer");

const PORT = Number(process.env.PORT || process.env.HEARTH_SIGNAL_PORT || 9000);
const HOST = process.env.HOST || "0.0.0.0";
const PRESENCE_TOKEN = String(process.env.HEARTH_SIGNAL_TOKEN || "");
const ALLOWED_STATUSES = new Set(["online", "idle", "dnd", "invisible"]);

const app = express();
app.use(express.json({ limit: "32kb" }));

/** @type {Map<string, { ws: import('ws').WebSocket, username: string, status: string, statusText: string, displayName: string, at: number }>} */
const presenceByUser = new Map();

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hearth-signal",
    peerPath: "/peerjs",
    presencePath: "/presence",
    online: presenceByUser.size,
  });
});

const server = http.createServer(app);

// --- PeerJS signaling (SDP/ICE for MediaConnection + DataConnection) ---
// ExpressPeerServer attaches its own upgrade listener on `server`.
const peerServer = ExpressPeerServer(server, {
  path: "/",
  allow_discovery: false,
  proxied: true,
});
app.use("/peerjs", peerServer);

peerServer.on("connection", () => {});
peerServer.on("disconnect", () => {});

function rosterPayload() {
  const users = [];
  for (const [username, meta] of presenceByUser) {
    if (meta.ws.readyState === 1) {
      users.push({
        username,
        displayName: meta.displayName || username,
        status: meta.status || "online",
        statusText: meta.statusText || "",
        at: meta.at,
      });
    }
  }
  return { type: "roster", users };
}

function broadcastPresence(exceptUsername) {
  const msg = JSON.stringify(rosterPayload());
  for (const [un, meta] of presenceByUser) {
    if (un === exceptUsername) continue;
    if (meta.ws.readyState === 1) {
      try {
        meta.ws.send(msg);
      } catch {}
    }
  }
}

function send(ws, obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

// Presence WS must not share `{ server, path }` with PeerJS — PeerJS rejects
// unknown upgrade paths with 400. Route /presence first via noServer.
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024, perMessageDeflate: false });

// Steal upgrade: presence first, then original PeerJS handlers
const priorUpgrade = server.listeners("upgrade").slice();
server.removeAllListeners("upgrade");
server.on("upgrade", (req, socket, head) => {
  let pathname = "/";
  let requestUrl;
  try {
    requestUrl = new URL(req.url || "/", "http://localhost");
    pathname = requestUrl.pathname || "/";
  } catch {
    pathname = String(req.url || "/").split("?")[0] || "/";
  }
  if (pathname === "/presence" || pathname.startsWith("/presence/")) {
    if (PRESENCE_TOKEN && requestUrl?.searchParams.get("token") !== PRESENCE_TOKEN) {
      socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
    return;
  }
  for (const fn of priorUpgrade) {
    try {
      fn.call(server, req, socket, head);
    } catch (e) {
      console.warn("[hearth-signal] upgrade peer", e && e.message ? e.message : e);
    }
  }
});

wss.on("connection", (ws) => {
  let boundUser = null;
  let rateWindow = Date.now();
  let rateCount = 0;
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (raw) => {
    const now = Date.now();
    if (now - rateWindow >= 10000) {
      rateWindow = now;
      rateCount = 0;
    }
    if (++rateCount > 120) {
      ws.close(1008, "rate limit");
      return;
    }
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (!msg || typeof msg.type !== "string") return;

    if (msg.type === "identify") {
      const username = String(msg.username || "")
        .trim()
        .toLowerCase();
      if (!/^[a-z0-9._]{3,20}$/.test(username)) {
        send(ws, { type: "error", code: "BAD_USERNAME" });
        return;
      }
      const prev = presenceByUser.get(username);
      if (prev && prev.ws !== ws) {
        send(ws, { type: "error", code: "USERNAME_IN_USE" });
        ws.close(4009, "username in use");
        return;
      }
      boundUser = username;
      presenceByUser.set(username, {
        ws,
        username,
        displayName: String(msg.displayName || username).trim().slice(0, 48) || username,
        status: ALLOWED_STATUSES.has(msg.status) ? msg.status : "online",
        statusText: String(msg.statusText || "").slice(0, 80),
        at: Date.now(),
      });
      send(ws, { type: "identified", username, users: rosterPayload().users });
      broadcastPresence(username);
      return;
    }

    if (!boundUser) {
      send(ws, { type: "error", code: "AUTH_REQUIRED" });
      return;
    }

    if (msg.type === "status_update") {
      const meta = presenceByUser.get(boundUser);
      if (!meta) return;
      if (ALLOWED_STATUSES.has(msg.status)) meta.status = msg.status;
      if (msg.statusText !== undefined) meta.statusText = String(msg.statusText).slice(0, 80);
      meta.at = Date.now();
      const out = JSON.stringify({
        type: "status_update",
        username: boundUser,
        status: meta.status,
        statusText: meta.statusText,
        displayName: meta.displayName,
      });
      for (const [, m] of presenceByUser) {
        if (m.ws.readyState === 1) {
          try {
            m.ws.send(out);
          } catch {}
        }
      }
      return;
    }

    if (msg.type === "ping") {
      send(ws, { type: "pong", t: Date.now() });
      return;
    }

    // Direct signal relay (future native RTC; optional)
    if (
      msg.type === "offer" ||
      msg.type === "answer" ||
      msg.type === "ice_candidate" ||
      msg.type === "signal"
    ) {
      const target = String(msg.to || msg.targetUserId || "")
        .trim()
        .toLowerCase();
      const dest = presenceByUser.get(target);
      if (!dest || dest.ws.readyState !== 1) {
        send(ws, { type: "error", code: "PEER_OFFLINE", to: target });
        return;
      }
      try {
        dest.ws.send(
          JSON.stringify({
            ...msg,
            from: boundUser,
            fromUserId: boundUser,
          })
        );
      } catch {}
    }
  });

  ws.on("close", () => {
    if (!boundUser) return;
    const cur = presenceByUser.get(boundUser);
    if (cur && cur.ws === ws) {
      presenceByUser.delete(boundUser);
      broadcastPresence();
    }
  });
});

const heartbeatTimer = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch {}
  }
}, 30000);
heartbeatTimer.unref();
wss.on("close", () => clearInterval(heartbeatTimer));

let listenAttempted = false;

function startListen() {
  if (server.listening || listenAttempted) return server;
  if (process.env.HEARTH_SIGNAL_SKIP_LISTEN === "1") {
    console.warn("[hearth-signal] skip listen (HEARTH_SIGNAL_SKIP_LISTEN=1)");
    return server;
  }
  listenAttempted = true;

  // Electron: EADDRINUSE “Uncaught Exception” diyaloğuna düşmesin
  const onErr = (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.warn(
        `[hearth-signal] port ${PORT} already in use — başka Hearth/signal çalışıyor; gömülü sunucu atlandı`
      );
      return;
    }
    console.error("[hearth-signal] listen error", err && err.message ? err.message : err);
  };
  server.removeAllListeners("error");
  server.on("error", onErr);

  try {
    server.listen(PORT, HOST, () => {
      console.log(`[hearth-signal] http://${HOST}:${PORT}`);
      console.log(`  PeerJS path : /peerjs`);
      console.log(`  Presence WS : ws://<host>:${PORT}/presence`);
      console.log(`  Health      : http://127.0.0.1:${PORT}/health`);
    });
  } catch (e) {
    onErr(e);
  }
  return server;
}

// Embedded from Electron main OR standalone `node signal-server/index.js`
// main.js port boş mu diye bakıp require eder; yine de güvenli dinle
try {
  startListen();
} catch (e) {
  if (e && e.code === "EADDRINUSE") {
    console.warn(`[hearth-signal] port ${PORT} busy — skip embed`);
  } else {
    console.error("[hearth-signal] start failed", e && e.message ? e.message : e);
  }
}

module.exports = { server, PORT, startListen };
