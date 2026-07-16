/**
 * Hearth UI laboratuvarı — Playwright + Electron
 * Gerçek pencereyi açar; tıklar, yazar, screenshot alır.
 */
const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.resolve(__dirname, "..", "..");
const ARTIFACTS = path.join(ROOT, "tests", "artifacts");

function ensureArtifacts() {
  if (!fs.existsSync(ARTIFACTS)) fs.mkdirSync(ARTIFACTS, { recursive: true });
}

function electronBinary() {
  // Node context: require('electron') → exe yolu string
  const p = require("electron");
  if (typeof p === "string" && fs.existsSync(p)) return p;
  const win = path.join(ROOT, "node_modules", "electron", "dist", "electron.exe");
  if (fs.existsSync(win)) return win;
  throw new Error("electron.exe bulunamadı — npm install çalıştır");
}

/**
 * @param {{ headed?: boolean }} opts
 */
async function launchHearth(opts = {}) {
  const { _electron: electron } = require("playwright");
  ensureArtifacts();

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const userData = path.join(os.tmpdir(), `hearth-ui-test-${stamp}`);
  fs.mkdirSync(userData, { recursive: true });

  const headed = !!(opts.headed || process.argv.includes("--headed"));

  const electronApp = await electron.launch({
    executablePath: electronBinary(),
    args: [ROOT],
    cwd: ROOT,
    timeout: 90000,
    env: {
      ...process.env,
      HEARTH_USER_DATA: userData,
      HEARTH_UI_TEST: "1",
      // electron-updater / telemetry gürültüsü
      ELECTRON_DISABLE_SECURITY_WARNINGS: "true",
    },
  });

  const win = await electronApp.firstWindow({ timeout: 60000 });
  await win.waitForLoadState("domcontentloaded").catch(() => {});
  // renderer init
  await win.waitForTimeout(800);

  return {
    electronApp,
    win,
    userData,
    artifactsDir: ARTIFACTS,
    headed,
    async shot(name = "latest") {
      ensureArtifacts();
      const file = path.join(ARTIFACTS, name.endsWith(".png") ? name : `${name}.png`);
      await win.screenshot({ path: file, fullPage: true }).catch(async () => {
        await win.screenshot({ path: file });
      });
      // her zaman latest.png kopya
      const latest = path.join(ARTIFACTS, "latest.png");
      try {
        fs.copyFileSync(file, latest);
      } catch {}
      return file;
    },
    async close() {
      try {
        await electronApp.close();
      } catch {
        try {
          await electronApp.evaluate(({ app }) => app.quit());
        } catch {}
      }
    },
  };
}

function log(msg) {
  const line = `[ui-lab] ${msg}`;
  console.log(line);
  try {
    ensureArtifacts();
    fs.appendFileSync(path.join(ARTIFACTS, "run.log"), line + "\n", "utf8");
  } catch {}
}

function assert(cond, msg) {
  if (!cond) {
    const err = new Error("FAIL: " + msg);
    err.isAssert = true;
    throw err;
  }
}

module.exports = {
  ROOT,
  ARTIFACTS,
  launchHearth,
  log,
  assert,
  ensureArtifacts,
};
