/**
 * Global hotkeys — keyboard via Electron globalShortcut (works when unfocused),
 * mouse 4/5 via uiohook-napi (fullscreen games often block only keyboard hooks
 * partially; mouse XButtons need low-level hook).
 */
const { globalShortcut } = require("electron");

let uIOhook = null;
let UiohookKey = null;
try {
  const mod = require("uiohook-napi");
  uIOhook = mod.uIOhook;
  UiohookKey = mod.UiohookKey;
} catch (e) {
  console.warn("[hotkeys] uiohook-napi unavailable:", e.message);
}

/** @type {null | (() => void)} */
let onMic = null;
/** @type {null | (() => void)} */
let onDeaf = null;
let micAccel = "";
let deafAccel = "";
let uioStarted = false;

function parseAccel(accel) {
  const raw = String(accel || "").trim();
  if (!raw) return null;
  const parts = raw.split("+").map((p) => p.trim());
  const key = parts[parts.length - 1];
  const mods = {
    ctrl: parts.some((p) => /^(CommandOrControl|Control|Ctrl)$/i.test(p)),
    alt: parts.some((p) => /^Alt$/i.test(p)),
    shift: parts.some((p) => /^Shift$/i.test(p)),
    meta: parts.some((p) => /^(Meta|Super|Command)$/i.test(p)),
  };
  return { key, mods, raw };
}

function isMouseKey(key) {
  return /^Mouse[45]$/i.test(key || "");
}

function mouseButtonFromKey(key) {
  // uiohook: 1=L, 2=R, 3=M, 4=Mouse4/back, 5=Mouse5/forward
  if (/^Mouse4$/i.test(key)) return 4;
  if (/^Mouse5$/i.test(key)) return 5;
  return null;
}

/** Map accelerator key name → uiohook keycode if available */
function keyToUiohookCode(key) {
  if (!UiohookKey || !key) return null;
  const k = String(key);
  if (/^F\d+$/i.test(k)) {
    const n = Number(k.slice(1));
    const name = "F" + n;
    return UiohookKey[name] != null ? UiohookKey[name] : null;
  }
  if (k.length === 1) {
    const up = k.toUpperCase();
    if (UiohookKey[up] != null) return UiohookKey[up];
  }
  const map = {
    Space: "Space",
    Enter: "Enter",
    Tab: "Tab",
    Escape: "Escape",
    Backspace: "Backspace",
    Delete: "Delete",
    Insert: "Insert",
    Home: "Home",
    End: "End",
    PageUp: "PageUp",
    PageDown: "PageDown",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
  };
  const name = map[k] || k;
  return UiohookKey[name] != null ? UiohookKey[name] : null;
}

function matchKeyboardEvent(e, parsed) {
  if (!parsed || isMouseKey(parsed.key)) return false;
  if (!!e.ctrlKey !== parsed.mods.ctrl) return false;
  if (!!e.altKey !== parsed.mods.alt) return false;
  if (!!e.shiftKey !== parsed.mods.shift) return false;
  if (!!e.metaKey !== parsed.mods.meta) return false;
  const code = keyToUiohookCode(parsed.key);
  if (code == null) return false;
  return e.keycode === code;
}

function matchMouseEvent(e, parsed) {
  if (!parsed || !isMouseKey(parsed.key)) return false;
  const btn = mouseButtonFromKey(parsed.key);
  if (btn == null || e.button !== btn) return false;
  // uiohook mousedown may not always set ctrlKey — check both
  if (!!e.ctrlKey !== parsed.mods.ctrl) return false;
  if (!!e.altKey !== parsed.mods.alt) return false;
  if (!!e.shiftKey !== parsed.mods.shift) return false;
  if (!!e.metaKey !== parsed.mods.meta) return false;
  return true;
}

/** Debounce double-fire (Electron globalShortcut + uiohook aynı anda) */
let lastFireAt = 0;
let lastFireCh = "";
function fireOnce(ch, fn) {
  const now = Date.now();
  if (ch === lastFireCh && now - lastFireAt < 120) return;
  lastFireAt = now;
  lastFireCh = ch;
  if (typeof fn === "function") fn();
}

function ensureUiohook() {
  if (!uIOhook || uioStarted) return;
  // Klavye yedek: exclusive fullscreen oyunlarda Electron kısayolu yetmezse
  uIOhook.on("keydown", (e) => {
    const micP = parseAccel(micAccel);
    const deafP = parseAccel(deafAccel);
    if (micP && !isMouseKey(micP.key) && matchKeyboardEvent(e, micP)) {
      fireOnce("mic", onMic);
    } else if (deafP && !isMouseKey(deafP.key) && matchKeyboardEvent(e, deafP)) {
      fireOnce("deaf", onDeaf);
    }
  });
  uIOhook.on("mousedown", (e) => {
    const micP = parseAccel(micAccel);
    const deafP = parseAccel(deafAccel);
    if (micP && isMouseKey(micP.key) && matchMouseEvent(e, micP)) {
      fireOnce("mic", onMic);
    } else if (deafP && isMouseKey(deafP.key) && matchMouseEvent(e, deafP)) {
      fireOnce("deaf", onDeaf);
    }
  });
  try {
    uIOhook.start();
    uioStarted = true;
    console.log("[hotkeys] uiohook started (global keyboard backup + mouse)");
  } catch (e) {
    console.warn("[hotkeys] uiohook start failed", e.message);
  }
}

function stopUiohook() {
  if (!uIOhook || !uioStarted) return;
  try {
    uIOhook.stop();
  } catch {}
  uioStarted = false;
}

/**
 * @param {{ mic?: string, deaf?: string, onMic: () => void, onDeaf: () => void }} opts
 */
function registerShortcuts(opts) {
  onMic = opts.onMic || null;
  onDeaf = opts.onDeaf || null;
  micAccel = opts.mic || "CommandOrControl+Shift+M";
  deafAccel = opts.deaf || "CommandOrControl+Shift+D";

  try {
    globalShortcut.unregisterAll();
  } catch {}

  const micP = parseAccel(micAccel);
  const deafP = parseAccel(deafAccel);
  const micIsMouse = !!(micP && isMouseKey(micP.key));
  const deafIsMouse = !!(deafP && isMouseKey(deafP.key));

  // Klavye: Electron globalShortcut (odak başka pencerede / çoğu oyunda çalışır)
  if (micP && !micIsMouse) {
    try {
      const ok = globalShortcut.register(micAccel, () => {
        if (typeof onMic === "function") onMic();
      });
      if (!ok) console.warn("[hotkeys] mic register failed:", micAccel);
    } catch (e) {
      console.warn("[hotkeys] mic", micAccel, e.message);
    }
  }
  if (deafP && !deafIsMouse && deafAccel !== micAccel) {
    try {
      const ok = globalShortcut.register(deafAccel, () => {
        if (typeof onDeaf === "function") onDeaf();
      });
      if (!ok) console.warn("[hotkeys] deaf register failed:", deafAccel);
    } catch (e) {
      console.warn("[hotkeys] deaf", deafAccel, e.message);
    }
  }

  // Mouse 4/5: globalShortcut desteklemez → uiohook
  // Ayrıca klavye için de uiohook yedek (exclusive fullscreen oyunlar Electron kısayolunu yutarsa)
  if (uIOhook) {
    ensureUiohook();
  } else if (micIsMouse || deafIsMouse) {
    console.warn("[hotkeys] Mouse4/5 requires uiohook-napi — package missing");
  }
}

function unregisterAll() {
  try {
    globalShortcut.unregisterAll();
  } catch {}
  // keep uiohook running but clear handlers by zeroing accel? better stop if no need
  micAccel = "";
  deafAccel = "";
  onMic = null;
  onDeaf = null;
}

function dispose() {
  unregisterAll();
  stopUiohook();
}

module.exports = {
  registerShortcuts,
  unregisterAll,
  dispose,
  isMouseAccel: (a) => {
    const p = parseAccel(a);
    return !!(p && isMouseKey(p.key));
  },
};
