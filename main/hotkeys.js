/**
 * Global hotkeys for mic / deafen — work while games have focus.
 * - Keyboard: Electron globalShortcut + uiohook backup
 * - Any mouse button (1–5): uiohook-napi only
 *
 * Accel format examples:
 *   CommandOrControl+Shift+M
 *   F8
 *   Mouse1 | Mouse2 | Mouse3 | Mouse4 | Mouse5
 *   Ctrl+Mouse4
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

let onMic = null;
let onDeaf = null;
let micAccel = "";
let deafAccel = "";
let uioStarted = false;
let lastFireAt = 0;
let lastFireCh = "";

function parseAccel(accel) {
  const raw = String(accel || "").trim();
  if (!raw) return null;
  const parts = raw.split("+").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
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
  return /^Mouse[1-5]$/i.test(key || "");
}

/** uiohook button: 1=L 2=R 3=M 4=back 5=forward */
function mouseButtonFromKey(key) {
  const m = String(key || "").match(/^Mouse([1-5])$/i);
  return m ? Number(m[1]) : null;
}

function keyToUiohookCode(key) {
  if (!UiohookKey || !key) return null;
  const k = String(key);
  if (/^F([1-9]|1[0-9]|2[0-4])$/i.test(k)) {
    const name = "F" + k.slice(1);
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
    Esc: "Escape",
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
    Up: "Up",
    Down: "Down",
    Left: "Left",
    Right: "Right",
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
  if (!!e.ctrlKey !== parsed.mods.ctrl) return false;
  if (!!e.altKey !== parsed.mods.alt) return false;
  if (!!e.shiftKey !== parsed.mods.shift) return false;
  if (!!e.metaKey !== parsed.mods.meta) return false;
  return true;
}

function fireOnce(ch, fn) {
  const now = Date.now();
  if (ch === lastFireCh && now - lastFireAt < 150) return;
  lastFireAt = now;
  lastFireCh = ch;
  if (typeof fn === "function") fn();
}

function ensureUiohook() {
  if (!uIOhook || uioStarted) return;
  uIOhook.on("keydown", (e) => {
    const micP = parseAccel(micAccel);
    const deafP = parseAccel(deafAccel);
    if (micP && !isMouseKey(micP.key) && matchKeyboardEvent(e, micP)) fireOnce("mic", onMic);
    else if (deafP && !isMouseKey(deafP.key) && matchKeyboardEvent(e, deafP)) fireOnce("deaf", onDeaf);
  });
  uIOhook.on("mousedown", (e) => {
    const micP = parseAccel(micAccel);
    const deafP = parseAccel(deafAccel);
    if (micP && isMouseKey(micP.key) && matchMouseEvent(e, micP)) fireOnce("mic", onMic);
    else if (deafP && isMouseKey(deafP.key) && matchMouseEvent(e, deafP)) fireOnce("deaf", onDeaf);
  });
  try {
    uIOhook.start();
    uioStarted = true;
    console.log("[hotkeys] uiohook global listener started");
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

  // Keyboard via Electron (works unfocused for most apps)
  if (micP && !micIsMouse) {
    try {
      const ok = globalShortcut.register(micAccel, () => fireOnce("mic", onMic));
      if (!ok) console.warn("[hotkeys] mic register failed:", micAccel);
    } catch (e) {
      console.warn("[hotkeys] mic", micAccel, e.message);
    }
  }
  if (deafP && !deafIsMouse && deafAccel !== micAccel) {
    try {
      const ok = globalShortcut.register(deafAccel, () => fireOnce("deaf", onDeaf));
      if (!ok) console.warn("[hotkeys] deaf register failed:", deafAccel);
    } catch (e) {
      console.warn("[hotkeys] deaf", deafAccel, e.message);
    }
  }

  // Always start uiohook when available: mouse buttons + game keyboard backup
  if (uIOhook) {
    ensureUiohook();
  } else if (micIsMouse || deafIsMouse) {
    console.warn("[hotkeys] Mouse buttons need uiohook-napi");
  }
}

function unregisterAll() {
  try {
    globalShortcut.unregisterAll();
  } catch {}
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
