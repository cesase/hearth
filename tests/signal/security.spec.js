const assert = require("assert/strict");
const http = require("http");
const WebSocket = require("ws");

process.env.PORT = "0";
process.env.HOST = "127.0.0.1";
process.env.HEARTH_SIGNAL_TOKEN = "test-only-presence-token";

const { server } = require("../../signal-server/index.js");

function onceListening() {
  if (server.listening) return Promise.resolve();
  return new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
}

function nextJson(ws, predicate = () => true, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("WebSocket message timeout"));
    }, timeoutMs);
    const onMessage = (raw) => {
      let value;
      try {
        value = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (!predicate(value)) return;
      cleanup();
      resolve(value);
    };
    const cleanup = () => {
      clearTimeout(timer);
      ws.off("message", onMessage);
    };
    ws.on("message", onMessage);
  });
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.once("open", () => resolve(ws));
    ws.once("error", reject);
  });
}

function expectUnauthorized(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.once("unexpected-response", (_request, response) => {
      try {
        assert.equal(response.statusCode, 401);
        response.resume();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    ws.once("open", () => reject(new Error("Unauthenticated socket was accepted")));
    ws.once("error", () => {});
  });
}

async function health(port) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}/health`, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

async function run() {
  await onceListening();
  const port = server.address().port;
  const bareUrl = `ws://127.0.0.1:${port}/presence`;
  const url = `${bareUrl}?token=${encodeURIComponent(process.env.HEARTH_SIGNAL_TOKEN)}`;

  await expectUnauthorized(bareUrl);

  const alice = await connect(url);
  alice.send(JSON.stringify({ type: "identify", username: "alice", status: "root" }));
  const identified = await nextJson(alice, (msg) => msg.type === "identified");
  const aliceEntry = identified.users.find((user) => user.username === "alice");
  assert.equal(aliceEntry.status, "online", "invalid status must be normalized");

  const duplicate = await connect(url);
  duplicate.send(JSON.stringify({ type: "identify", username: "alice" }));
  const duplicateError = await nextJson(duplicate, (msg) => msg.type === "error");
  assert.equal(duplicateError.code, "USERNAME_IN_USE");

  alice.send(JSON.stringify({ type: "ping" }));
  await nextJson(alice, (msg) => msg.type === "pong");
  const status = await health(port);
  assert.equal(status.ok, true);
  assert.equal(status.online, 1, "duplicate identify must not evict the active user");

  alice.close();
  duplicate.close();
  await new Promise((resolve) => server.close(resolve));
  console.log("Signal security tests OK");
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  try {
    server.close();
  } catch {}
  process.exit(1);
});
