/**
 * Integration test: main/system-audio.js produces PCM meta + chunks.
 * Run: npx electron scripts/test-system-audio.js
 */
const { app, BrowserWindow } = require("electron");
const path = require("path");
const systemAudio = require("../main/system-audio");

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: false } });
  await win.loadURL("about:blank");

  let meta = null;
  let pcmBytes = 0;
  let chunks = 0;
  let stopped = null;

  systemAudio.setEmitter((ch, data) => {
    if (ch === "system-audio-meta") meta = data;
    if (ch === "system-audio-pcm") {
      chunks++;
      pcmBytes += data.byteLength || data.length || 0;
    }
    if (ch === "system-audio-stopped") stopped = data;
    if (ch === "system-audio-log") console.log("log", data);
    if (ch === "system-audio-error") console.log("err", data);
  });

  // Play a wav so loopback has signal
  const { spawn } = require("child_process");
  const wav =
    process.env.WINDIR + "\\Media\\Alarm01.wav";
  let player = null;
  try {
    player = spawn(
      "powershell",
      ["-NoProfile", "-Command", `(New-Object Media.SoundPlayer '${wav}').PlaySync()`],
      { windowsHide: true }
    );
  } catch {}

  const start = systemAudio.startSystemAudio();
  console.log("start", start);

  await new Promise((r) => setTimeout(r, 2500));
  systemAudio.stopSystemAudio("test");
  await new Promise((r) => setTimeout(r, 300));
  try {
    if (player) player.kill();
  } catch {}

  const result = {
    start,
    helper: systemAudio.helperPath(),
    meta,
    chunks,
    pcmBytes,
    seconds: meta ? pcmBytes / (meta.sampleRate * meta.channels * 4) : 0,
    stopped,
  };
  console.log("=== SYSTEM AUDIO TEST ===");
  console.log(JSON.stringify(result, null, 2));
  app.exit(chunks > 10 && meta ? 0 : 2);
});
