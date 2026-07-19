const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  desktopCapturer,
  globalShortcut,
  Menu,
  Tray,
  nativeImage,
  shell,
} = require("electron");
const path = require("path");
const fs = require("fs");
const net = require("net");

// UI laboratuvarı / smoke: ayrı userData (gerçek hesap bozulmaz)
// app.ready ÖNCESİ set edilmeli
if (process.env.HEARTH_USER_DATA) {
  try {
    const ud = path.resolve(process.env.HEARTH_USER_DATA);
    fs.mkdirSync(ud, { recursive: true });
    app.setPath("userData", ud);
  } catch (e) {
    console.warn("HEARTH_USER_DATA", e.message);
  }
}

// Tek örnek: ikinci tıklamada yeni süreç açılıp kapanmasın; mevcut pencereye odaklan
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

const storage = require("./storage");
const { appIconPath, appIcon } = require("./main/icon");
const {
  setupDisplayMedia,
  setPendingScreenSourceId,
} = require("./main/display-media");
const IS_UI_TEST = process.env.HEARTH_UI_TEST === "1" || process.env.HEARTH_UI_TEST === "true";

/** Production'da console gürültüsünü azalt (UI test / dev açık kalsın) */
function devLog(...args) {
  if (IS_UI_TEST || !app.isPackaged) console.log(...args);
}
function devWarn(...args) {
  if (IS_UI_TEST || !app.isPackaged) console.warn(...args);
}

/** @type {import('electron-updater').AppUpdater | null} */
let autoUpdater = null;
let updateCheckInFlight = false;
let lastUpdateStatus = { state: "idle", message: "" };

function setupAutoUpdater() {
  // UI test / geliştirme: güncelleme yok
  if (IS_UI_TEST || !app.isPackaged) {
    lastUpdateStatus = {
      state: "dev",
      message: IS_UI_TEST
        ? "UI test modunda güncelleme kapalı."
        : "Geliştirme modunda otomatik güncelleme yok.",
    };
    return;
  }
  try {
    const { autoUpdater: updater } = require("electron-updater");
    autoUpdater = updater;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("checking-for-update", () => {
      lastUpdateStatus = { state: "checking", message: "Güncelleme kontrol ediliyor…" };
      sendUpdateStatus();
    });
    autoUpdater.on("update-available", (info) => {
      lastUpdateStatus = {
        state: "available",
        message: `Yeni sürüm: ${info.version}`,
        version: info.version,
      };
      sendUpdateStatus();
      if (!win) return;
      dialog
        .showMessageBox(win, {
          type: "info",
          title: "Güncelleme var",
          message: `Hearth ${info.version} hazır.`,
          detail: "İndirmek ister misin? İndirme bitince yeniden başlatarak kurulur.",
          buttons: ["İndir", "Sonra"],
          defaultId: 0,
          cancelId: 1,
        })
        .then(({ response }) => {
          if (response === 0 && autoUpdater) {
            lastUpdateStatus = { state: "downloading", message: "Güncelleme indiriliyor…" };
            sendUpdateStatus();
            autoUpdater.downloadUpdate().catch((e) => {
              lastUpdateStatus = { state: "error", message: e.message || String(e) };
              sendUpdateStatus();
            });
          }
        });
    });
    autoUpdater.on("update-not-available", () => {
      lastUpdateStatus = {
        state: "none",
        message: `Güncelsin (v${app.getVersion()})`,
        version: app.getVersion(),
      };
      sendUpdateStatus();
    });
    autoUpdater.on("error", (err) => {
      lastUpdateStatus = {
        state: "error",
        message: err?.message || String(err),
      };
      sendUpdateStatus();
      console.warn("autoUpdater", err);
    });
    autoUpdater.on("download-progress", (p) => {
      lastUpdateStatus = {
        state: "downloading",
        message: `İndiriliyor… %${Math.round(p.percent || 0)}`,
        percent: p.percent,
      };
      sendUpdateStatus();
    });
    autoUpdater.on("update-downloaded", (info) => {
      lastUpdateStatus = {
        state: "ready",
        message: `v${info.version} indirildi — yeniden başlat`,
        version: info.version,
      };
      sendUpdateStatus();
      if (!win) return;
      dialog
        .showMessageBox(win, {
          type: "info",
          title: "Güncelleme hazır",
          message: `Hearth ${info.version} indirildi.`,
          detail: "Yeniden başlatınca yeni sürüm kurulur. Sohbet geçmişin silinmez.",
          buttons: ["Yeniden başlat", "Sonra"],
          defaultId: 0,
          cancelId: 1,
        })
        .then(({ response }) => {
          if (response === 0 && autoUpdater) {
            app.isQuitting = true;
            autoUpdater.quitAndInstall(false, true);
          }
        });
    });

    // Açılıştan kısa süre sonra sessiz kontrol
    setTimeout(() => {
      checkForAppUpdates({ silent: true }).catch(() => {});
    }, 8000);
  } catch (e) {
    console.warn("electron-updater yüklenemedi", e.message);
    lastUpdateStatus = { state: "error", message: e.message };
  }
}

function sendUpdateStatus() {
  if (win && !win.isDestroyed()) {
    win.webContents.send("update-status", lastUpdateStatus);
  }
}

async function checkForAppUpdates({ silent = false } = {}) {
  if (!app.isPackaged || !autoUpdater) {
    const msg = !app.isPackaged
      ? "Geliştirme modunda güncelleme kontrolü yok. Kurulu Setup.exe ile dene."
      : "Güncelleyici hazır değil. GitHub release yapılandırmasını kontrol et (DAGITIM.md).";
    lastUpdateStatus = { state: "dev", message: msg };
    sendUpdateStatus();
    if (!silent && win) {
      await dialog.showMessageBox(win, {
        type: "info",
        title: "Güncelleme",
        message: msg,
      });
    }
    return lastUpdateStatus;
  }
  if (updateCheckInFlight) return lastUpdateStatus;
  updateCheckInFlight = true;
  try {
    const result = await autoUpdater.checkForUpdates();
    if (!silent && lastUpdateStatus.state === "none" && win) {
      await dialog.showMessageBox(win, {
        type: "info",
        title: "Güncelleme",
        message: `Zaten güncelsin (v${app.getVersion()}).`,
      });
    }
    return { ...lastUpdateStatus, updateInfo: result?.updateInfo };
  } catch (e) {
    lastUpdateStatus = { state: "error", message: e.message || String(e) };
    sendUpdateStatus();
    if (!silent && win) {
      await dialog.showMessageBox(win, {
        type: "warning",
        title: "Güncelleme",
        message: "Kontrol başarısız",
        detail: e.message || String(e),
      });
    }
    return lastUpdateStatus;
  } finally {
    updateCheckInFlight = false;
  }
}

function normalizeSupabaseUrl(raw) {
  let url = String(raw || "").trim();
  // Data API adresini Project URL'e çevir (…/rest/v1/ → kök)
  url = url
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/auth\/v1\/?$/i, "")
    .replace(/\/+$/, "");
  return url;
}

function isPlaceholderKey(key) {
  const k = String(key || "").trim();
  if (!k) return true;
  if (/BURAYA|YOUR_|XXXX|SUPABASE_ANON|placeholder|CHANGE_ME/i.test(k)) return true;
  if (k.length < 20) return true;
  return false;
}

/**
 * Varsayılan: public PeerJS (şehirler arası arama çalışır).
 * LAN/VPS kendi signal için cloud/signal.json → enabled:true + ortak host.
 */
function defaultSignalConfig() {
  return {
    enabled: false,
    host: process.env.HEARTH_SIGNAL_HOST || "127.0.0.1",
    port: Number(process.env.HEARTH_SIGNAL_PORT || 9000),
    secure: process.env.HEARTH_SIGNAL_SECURE === "1",
    peerPath: "/peerjs",
    presencePath: "/presence",
    embed: false,
  };
}

function loadSignalFile() {
  const p = path.join(__dirname, "cloud", "signal.json");
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    }
  } catch (e) {
    devWarn("signal.json", e.message);
  }
  return null;
}

function loadCloudConfig() {
  // Smoke / UI lab: bulut + dış signal kapalı (izole temp profile)
  if (IS_UI_TEST) {
    return { enabled: false, reason: "ui-test", signal: { enabled: false } };
  }

  let cfg = { enabled: false, signal: defaultSignalConfig() };
  const fileSignal = loadSignalFile();
  if (fileSignal) cfg.signal = { ...cfg.signal, ...fileSignal };

  if (process.env.HEARTH_SUPABASE_URL && process.env.HEARTH_SUPABASE_ANON_KEY) {
    cfg.enabled = true;
    cfg.supabaseUrl = normalizeSupabaseUrl(process.env.HEARTH_SUPABASE_URL);
    cfg.supabaseAnonKey = process.env.HEARTH_SUPABASE_ANON_KEY;
  }

  const candidates = [path.join(__dirname, "cloud", "config.json")];
  try {
    if (app.isReady()) {
      candidates.push(path.join(app.getPath("userData"), "cloud-config.json"));
    }
  } catch {
    /* app henüz hazır değil */
  }
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      if (!j) continue;
      if (j.signal) cfg.signal = { ...cfg.signal, ...j.signal };
      if (j.supabaseUrl && j.supabaseAnonKey) {
        const originalUrl = String(j.supabaseUrl).trim();
        const url = normalizeSupabaseUrl(originalUrl);
        if (originalUrl !== url) {
          try {
            j.supabaseUrl = url;
            fs.writeFileSync(p, JSON.stringify(j, null, 2), "utf8");
            devLog("cloud config URL düzeltildi:", originalUrl, "→", url);
          } catch (writeErr) {
            devWarn("cloud config yazılamadı", writeErr.message);
          }
        }
        if (!isPlaceholderKey(j.supabaseAnonKey)) {
          cfg.enabled = j.enabled !== false;
          cfg.supabaseUrl = url;
          cfg.supabaseAnonKey = j.supabaseAnonKey;
          if (j.note) cfg.note = j.note;
        } else {
          devWarn("cloud config: anon/publishable key eksik veya örnek metin");
        }
      }
      break;
    } catch (e) {
      devWarn("cloud config", p, e.message);
    }
  }
  return cfg;
}

/** Port boş mu? (EADDRINUSE crash'ini önlemek için dinlemeden önce) */
function isPortFree(port, host = "0.0.0.0") {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.unref();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    try {
      tester.listen(Number(port) || 9000, host);
    } catch {
      resolve(false);
    }
  });
}

/** Yerel signal sunucusunu (PeerJS + presence) süreç içi başlat */
let signalStarted = false;
async function maybeEmbedSignalServer(cfg) {
  if (IS_UI_TEST || signalStarted) return;
  const s = cfg && cfg.signal;
  if (!s || s.enabled === false || s.embed === false) return;
  const host = String(s.host || "127.0.0.1");
  if (host !== "127.0.0.1" && host !== "localhost" && host !== "0.0.0.0") {
    // Uzak sunucu — embed yok
    return;
  }
  const port = Number(s.port || 9000);
  try {
    const free = await isPortFree(port, "0.0.0.0");
    if (!free) {
      // Başka Hearth/signal zaten dinliyor — gömülü sunucuyu atla, uygulama açılsın
      devWarn("signal port busy, skip embed", port);
      signalStarted = true;
      return;
    }
    process.env.PORT = String(port);
    process.env.HOST = "0.0.0.0";
    process.env.HEARTH_SIGNAL_SKIP_LISTEN = "0";
    require("./signal-server/index.js");
    signalStarted = true;
    devLog("hearth-signal embed port", process.env.PORT);
  } catch (e) {
    devWarn("signal embed", e && e.message ? e.message : e);
    signalStarted = true;
  }
}

/** @type {BrowserWindow | null} */
let win = null;
/** @type {Tray | null} */
let tray = null;
let currentUserId = null;

function createWindow() {
  const iconPath = appIconPath();
  const icon = appIcon();
  win = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 720,
    minHeight: 520,
    title: "Hearth",
    backgroundColor: "#1a1b1e",
    autoHideMenuBar: true,
    show: false,
    // Windows: mutlak .ico yolu (görev çubuğu + başlık çubuğu)
    icon: iconPath || (icon.isEmpty() ? undefined : icon),
    // Paketli uygulamada process adı / atlama listesi
    // (AppUserModelId app ready öncesi set edilir)
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "public", "index.html"));
  win.once("ready-to-show", () => win.show());

  win.on("close", (e) => {
    // UI lab / test: tepsiye indirme, tamamen çık
    if (IS_UI_TEST) {
      app.isQuitting = true;
      return;
    }
    if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });
  win.on("closed", () => {
    win = null;
  });
}

function createTray() {
  let img = appIcon();
  if (img.isEmpty()) {
    img = nativeImage.createFromBuffer(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhElEQVQ4T2NkYGD4z0ABYBzVMKoBBgYGBob/UPAfGIbRDEYGBoZ/UDAKRk0Y1QADAwPDfygYBaMm/P//n+E/lPwH04wMDAz/oWAgNIERbiAjIyPDPyj4D6YZGRkZ/kHBQGjCqAmjGqC7gZGRkeEfFPyH0ozQhP+MDAwM/6BgIDRh1IRRDTAwMDD8h4L/AACq0x0T0m3p9QAAAABJRU5ErkJggg==",
        "base64"
      )
    );
  } else {
    // Prefer native 16px from multi-size .ico when available
    try {
      const sz = img.getSize();
      if (sz.width > 16 || sz.height > 16) {
        img = img.resize({ width: 16, height: 16, quality: "best" });
      }
    } catch {
      img = img.resize({ width: 16, height: 16 });
    }
  }
  tray = new Tray(img);
  tray.setToolTip("Hearth");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Göster",
        click: () => {
          if (win) {
            win.show();
            win.focus();
          }
        },
      },
      {
        label: "Çıkış",
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ])
  );
  tray.on("double-click", () => {
    if (win) {
      win.show();
      win.focus();
    }
  });
}

function registerShortcutsForUser(userId) {
  try {
    globalShortcut.unregisterAll();
  } catch {}
  if (!userId) return;
  const s = storage.getSettings(userId);
  const mic = s.micHotkey || "CommandOrControl+Shift+M";
  const deaf = s.deafenHotkey || "CommandOrControl+Shift+D";
  try {
    globalShortcut.register(mic, () => {
      if (win) win.webContents.send("hotkey-mic");
    });
  } catch (e) {
    console.warn("Mic kısayol:", mic, e.message);
  }
  try {
    if (deaf && deaf !== mic) {
      globalShortcut.register(deaf, () => {
        if (win) win.webContents.send("hotkey-deafen");
      });
    }
  } catch (e) {
    console.warn("Deafen kısayol:", deaf, e.message);
  }
}

// Windows: görev çubuğu kimliği — app ready ÖNCESİ set edilmeli
if (process.platform === "win32") {
  try {
    app.setAppUserModelId("com.hearth.app");
  } catch {}
}

if (gotSingleInstanceLock) {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    } else {
      createWindow();
    }
  });
}

app.whenReady().then(async () => {
  if (!gotSingleInstanceLock) return;
  if (process.platform === "win32") {
    try {
      app.setAppUserModelId("com.hearth.app");
    } catch {}
  }
  createWindow();
  // Paketli exe'de de pencere ikonunu zorla
  try {
    const ip = appIconPath();
    if (win && ip && typeof win.setIcon === "function") win.setIcon(ip);
  } catch {}
  if (!IS_UI_TEST) createTray();
  setupDisplayMedia({ log: (m, e) => devWarn(m, e) });
  setupAutoUpdater();
  try {
    await maybeEmbedSignalServer(loadCloudConfig());
  } catch (e) {
    devWarn("signal start", e);
  }
  const session = storage.currentSession();
  if (session) {
    currentUserId = session.id;
    registerShortcutsForUser(session.id);
  }
});

app.on("will-quit", () => {
  try {
    globalShortcut.unregisterAll();
  } catch {}
});

// ---- Auth ----
ipcMain.handle("auth-session", () => storage.currentSession());
ipcMain.handle("auth-register", (_e, data) => {
  const user = storage.registerUser(data);
  storage.loginUser(data.email, data.password);
  currentUserId = user.id;
  registerShortcutsForUser(user.id);
  return user;
});
ipcMain.handle("auth-login", (_e, { email, password }) => {
  const user = storage.loginUser(email, password);
  currentUserId = user.id;
  registerShortcutsForUser(user.id);
  return user;
});
ipcMain.handle("auth-logout", () => {
  storage.logout();
  currentUserId = null;
  try {
    globalShortcut.unregisterAll();
  } catch {}
  return true;
});

// ---- Profile / settings ----
ipcMain.handle("cloud-config", () => loadCloudConfig());
ipcMain.handle("app-version", () => app.getVersion());
ipcMain.handle("update-check", (_e, opts) => checkForAppUpdates({ silent: !!(opts && opts.silent) }));
ipcMain.handle("update-status", () => lastUpdateStatus);

ipcMain.handle("settings-get", (_e, userId) => storage.getSettings(userId || currentUserId));
ipcMain.handle("settings-save", (_e, { userId, patch }) => {
  const id = userId || currentUserId;
  const next = storage.saveSettings(id, patch);
  registerShortcutsForUser(id);
  return next;
});
ipcMain.handle("profile-update", (_e, { userId, ...patch }) =>
  storage.updateProfile(userId || currentUserId, patch)
);
ipcMain.handle("chat-update", (_e, { userId, friendUsername, messageId, patch }) =>
  storage.updateChatMessage(userId || currentUserId, friendUsername, messageId, patch)
);
ipcMain.handle("chat-delete", (_e, { userId, friendUsername, messageId }) =>
  storage.deleteChatMessage(userId || currentUserId, friendUsername, messageId)
);
ipcMain.handle("pins-get", (_e, { userId, friendUsername }) =>
  storage.getPins(userId || currentUserId, friendUsername)
);
ipcMain.handle("pins-set", (_e, { userId, friendUsername, pins }) =>
  storage.setPins(userId || currentUserId, friendUsername, pins)
);

ipcMain.handle("groups-list", (_e, userId) => storage.getGroups(userId || currentUserId));
ipcMain.handle("groups-create", (_e, { userId, name, members }) =>
  storage.createGroup(userId || currentUserId, { name, members })
);
ipcMain.handle("groups-delete", (_e, { userId, groupId }) =>
  storage.deleteGroup(userId || currentUserId, groupId)
);
ipcMain.handle("groups-get", (_e, { userId, groupId }) =>
  storage.getGroup(userId || currentUserId, groupId)
);
ipcMain.handle("avatar-get", (_e, userId) => storage.avatarDataUrl(userId || currentUserId));
ipcMain.handle("avatar-pick", async (_e, userId) => {
  const id = userId || currentUserId;
  const res = await dialog.showOpenDialog(win, {
    title: "Profil resmi / GIF seç",
    filters: [{ name: "Görseller", extensions: ["png", "jpg", "jpeg", "gif", "webp"] }],
    properties: ["openFile"],
  });
  if (res.canceled || !res.filePaths[0]) return null;
  storage.setAvatar(id, res.filePaths[0]);
  return storage.avatarDataUrl(id);
});

// ---- Friends / chat ----
ipcMain.handle("friends-list", (_e, userId) => storage.getFriends(userId || currentUserId));
ipcMain.handle("friends-add", (_e, { userId, username, displayName }) =>
  storage.addFriend(userId || currentUserId, { username, displayName })
);
ipcMain.handle("friends-remove", (_e, { userId, username }) =>
  storage.removeFriend(userId || currentUserId, username)
);
ipcMain.handle("friends-update", (_e, { userId, username, patch }) =>
  storage.updateFriendMeta(userId || currentUserId, username, patch)
);
ipcMain.handle("chat-get", (_e, { userId, friendUsername, limit }) =>
  storage.getChat(userId || currentUserId, friendUsername, limit || 500)
);
ipcMain.handle("chat-append", (_e, { userId, friendUsername, message }) =>
  storage.appendChat(userId || currentUserId, friendUsername, message)
);

// ---- Screen / files ----
ipcMain.handle("pick-screen-sources", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 280, height: 160 },
  });
  return sources.map((s) => ({
    id: s.id,
    name: s.name,
    thumbnail: s.thumbnail.toDataURL(),
  }));
});
ipcMain.handle("set-screen-source", (_e, id) => {
  setPendingScreenSourceId(id || null);
  return true;
});

ipcMain.handle("file-pick", async () => {
  const res = await dialog.showOpenDialog(win, {
    title: "Gönderilecek dosya",
    properties: ["openFile"],
  });
  if (res.canceled || !res.filePaths[0]) return null;
  const p = res.filePaths[0];
  const st = fs.statSync(p);
  return { path: p, name: path.basename(p), size: st.size };
});

// Base64 chunk — Electron IPC + PeerJS ile güvenilir (Buffer bozulmaz)
ipcMain.handle("file-read-chunk", (_e, { filePath, offset, length }) => {
  const fd = fs.openSync(filePath, "r");
  try {
    const buf = Buffer.alloc(Math.max(0, length | 0));
    const read = fs.readSync(fd, buf, 0, buf.length, offset);
    return {
      b64: buf.subarray(0, read).toString("base64"),
      len: read,
    };
  } finally {
    fs.closeSync(fd);
  }
});

ipcMain.handle("file-save-start", async (_e, { name, auto }) => {
  let target;
  if (auto) {
    const safe = String(name || "dosya").replace(/[<>:"/\\|?*]/g, "_");
    target = path.join(storage.downloadsDir(), `${Date.now()}_${safe}`);
  } else {
    const defaultPath = path.join(storage.downloadsDir(), name || "indirilen_dosya");
    const res = await dialog.showSaveDialog(win, {
      title: "Dosyayı kaydet",
      defaultPath,
    });
    if (res.canceled || !res.filePath) return null;
    target = res.filePath;
  }
  fs.writeFileSync(target, Buffer.alloc(0));
  return target;
});

ipcMain.handle("file-save-chunk", (_e, { savePath, b64, offset }) => {
  if (!savePath || b64 == null) return false;
  const buf = Buffer.from(String(b64), "base64");
  const fd = fs.openSync(savePath, "r+");
  try {
    fs.writeSync(fd, buf, 0, buf.length, offset || 0);
  } finally {
    fs.closeSync(fd);
  }
  return { written: buf.length };
});

ipcMain.handle("file-save-auto", async (_e, { name }) => {
  const safe = String(name || "dosya").replace(/[<>:"/\\|?*]/g, "_");
  const p = path.join(storage.downloadsDir(), `${Date.now()}_${safe}`);
  fs.writeFileSync(p, Buffer.alloc(0));
  return p;
});

ipcMain.handle("avatar-save-dataurl", (_e, { userId, dataUrl }) => {
  const id = userId || currentUserId;
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    throw new Error("Geçersiz görsel");
  }
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) throw new Error("Geçersiz data URL");
  const mime = m[1];
  const ext =
    mime.includes("gif") ? ".gif" : mime.includes("webp") ? ".webp" : mime.includes("jpeg") || mime.includes("jpg") ? ".jpg" : ".png";
  const dir = path.join(app.getPath("userData"), "profiles", id, "avatar");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) {
    try {
      fs.unlinkSync(path.join(dir, f));
    } catch {}
  }
  const dest = path.join(dir, "avatar" + ext);
  fs.writeFileSync(dest, Buffer.from(m[2], "base64"));
  return storage.avatarDataUrl(id);
});

ipcMain.handle("open-path", (_e, p) => {
  if (p) shell.showItemInFolder(p);
});
ipcMain.handle("open-external", async (_e, url) => {
  const u = String(url || "").trim();
  if (!/^https?:\/\//i.test(u)) return { ok: false, error: "invalid-url" };
  try {
    await shell.openExternal(u);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
});

ipcMain.handle("file-preview-dataurl", (_e, filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null;
    const st = fs.statSync(filePath);
    if (st.size > 12 * 1024 * 1024) return { tooLarge: true, size: st.size };
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
    };
    const mime = map[ext];
    if (!mime) return { unsupported: true };
    const buf = fs.readFileSync(filePath);
    return { dataUrl: `data:${mime};base64,${buf.toString("base64")}`, mime, size: st.size };
  } catch {
    return null;
  }
});

ipcMain.handle("delete-path", (_e, p) => {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("window-focused", () => {
  return !!(win && win.isFocused() && win.isVisible() && !win.isMinimized());
});

ipcMain.handle("notify-incoming", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    win.flashFrame(true);
    setTimeout(() => win && win.flashFrame(false), 4000);
  }
});

ipcMain.handle("quit-app", () => {
  app.isQuitting = true;
  app.quit();
});

ipcMain.handle("show-message", async (_e, opts) => {
  if (!win) return;
  await dialog.showMessageBox(win, {
    type: opts.type || "info",
    title: opts.title || "İkili Sohbet",
    message: opts.message || "",
    detail: opts.detail || "",
    buttons: ["Tamam"],
  });
});
