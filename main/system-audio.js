/**
 * Windows default-output loopback via native WASAPI helper.
 * Chromium getDisplayMedia(audio:loopback) fails on some multi-device PCs
 * with NotReadableError — this path captures the mix reliably.
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

let child = null;
let meta = null;
let stdoutBuf = Buffer.alloc(0);
let headerDone = false;
/** @type {((ch: string, data: any) => void) | null} */
let emit = null;

function helperPath() {
  const candidates = [
    // packaged: extraResources → resources/assets/bin
    process.resourcesPath && path.join(process.resourcesPath, "assets", "bin", "wasapi-loopback.exe"),
    path.join(app.getAppPath(), "assets", "bin", "wasapi-loopback.exe"),
    path.join(__dirname, "..", "assets", "bin", "wasapi-loopback.exe"),
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

function setEmitter(fn) {
  emit = typeof fn === "function" ? fn : null;
}

function send(channel, data) {
  try {
    if (emit) emit(channel, data);
  } catch {}
}

function stopSystemAudio(reason) {
  headerDone = false;
  meta = null;
  stdoutBuf = Buffer.alloc(0);
  const c = child;
  child = null;
  if (c && !c.killed) {
    try {
      if (c.stdin && !c.stdin.destroyed) c.stdin.end();
    } catch {}
    try {
      c.kill();
    } catch {}
  }
  send("system-audio-stopped", { reason: reason || "stop" });
}

function parseHeader(line) {
  // HEARTH_PCM sampleRate=48000 channels=2 format=f32le bits=32
  const m = {};
  const parts = String(line || "").trim().split(/\s+/);
  if (!parts[0] || parts[0] !== "HEARTH_PCM") return null;
  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf("=");
    if (eq > 0) m[parts[i].slice(0, eq)] = parts[i].slice(eq + 1);
  }
  const sampleRate = parseInt(m.sampleRate, 10);
  const channels = parseInt(m.channels, 10) || 2;
  if (!sampleRate || sampleRate < 8000) return null;
  return {
    sampleRate,
    channels,
    format: m.format || "f32le",
    bits: parseInt(m.bits, 10) || 32,
  };
}

function onStdout(chunk) {
  if (!chunk || !chunk.length) return;
  stdoutBuf = Buffer.concat([stdoutBuf, chunk]);

  if (!headerDone) {
    const nl = stdoutBuf.indexOf(0x0a);
    if (nl < 0) {
      if (stdoutBuf.length > 512) {
        stopSystemAudio("bad-header");
      }
      return;
    }
    const line = stdoutBuf.slice(0, nl).toString("ascii");
    stdoutBuf = stdoutBuf.slice(nl + 1);
    meta = parseHeader(line);
    if (!meta) {
      stopSystemAudio("bad-header");
      return;
    }
    headerDone = true;
    send("system-audio-meta", meta);
  }

  // Emit ~20ms frames (or whatever we have in multiples of frame)
  const frameBytes = meta.channels * 4; // f32
  const framesPerChunk = Math.max(1, Math.round(meta.sampleRate * 0.02)); // 20ms
  const chunkBytes = framesPerChunk * frameBytes;

  while (stdoutBuf.length >= chunkBytes) {
    const slice = Buffer.from(stdoutBuf.subarray(0, chunkBytes));
    stdoutBuf = stdoutBuf.subarray(chunkBytes);
    // ArrayBuffer clones cleanly over IPC (Buffer sometimes arrives oddly)
    send(
      "system-audio-pcm",
      slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength)
    );
  }
}

function startSystemAudio() {
  if (process.platform !== "win32") {
    return { ok: false, error: "Windows only" };
  }
  if (child) {
    return { ok: true, already: true, meta };
  }
  const exe = helperPath();
  if (!exe) {
    return { ok: false, error: "wasapi-loopback.exe missing" };
  }

  headerDone = false;
  meta = null;
  stdoutBuf = Buffer.alloc(0);

  try {
    child = spawn(exe, [], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
  } catch (e) {
    child = null;
    return { ok: false, error: e.message || String(e) };
  }

  child.stdout.on("data", onStdout);
  child.stderr.on("data", (d) => {
    const s = d.toString();
    if (s && s.trim()) send("system-audio-log", s.trim());
  });
  child.on("error", (e) => {
    send("system-audio-error", { message: e.message || String(e) });
    stopSystemAudio("spawn-error");
  });
  child.on("exit", (code) => {
    if (child) {
      child = null;
      send("system-audio-stopped", { reason: "exit", code });
    }
  });

  return { ok: true, path: exe };
}

function isRunning() {
  return !!child;
}

module.exports = {
  startSystemAudio,
  stopSystemAudio,
  setEmitter,
  isRunning,
  helperPath,
};
