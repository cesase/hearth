const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("api", {
  isDesktop: true,

  /** Sürükle-bırak File nesnesinden gerçek disk yolu (Electron) */
  pathForFile: (file) => {
    try {
      if (!file) return "";
      if (typeof webUtils?.getPathForFile === "function") {
        return webUtils.getPathForFile(file) || "";
      }
      return file.path || "";
    } catch {
      return file?.path || "";
    }
  },

  cloudConfig: () => ipcRenderer.invoke("cloud-config"),

  // auth (yerel)
  session: () => ipcRenderer.invoke("auth-session"),
  register: (data) => ipcRenderer.invoke("auth-register", data),
  login: (data) => ipcRenderer.invoke("auth-login", data),
  logout: () => ipcRenderer.invoke("auth-logout"),

  // settings / profile
  getSettings: (userId) => ipcRenderer.invoke("settings-get", userId),
  saveSettings: (userId, patch) => ipcRenderer.invoke("settings-save", { userId, patch }),
  updateProfile: (userId, patch) =>
    ipcRenderer.invoke("profile-update", { userId, ...(typeof patch === "string" ? { displayName: patch } : patch || {}) }),
  getAvatar: (userId) => ipcRenderer.invoke("avatar-get", userId),
  pickAvatar: (userId) => ipcRenderer.invoke("avatar-pick", userId),

  // friends / chat
  listFriends: (userId) => ipcRenderer.invoke("friends-list", userId),
  addFriend: (userId, username, displayName) =>
    ipcRenderer.invoke("friends-add", { userId, username, displayName }),
  removeFriend: (userId, username) => ipcRenderer.invoke("friends-remove", { userId, username }),
  updateFriend: (userId, username, patch) =>
    ipcRenderer.invoke("friends-update", { userId, username, patch }),
  getChat: (userId, friendUsername, limit) =>
    ipcRenderer.invoke("chat-get", { userId, friendUsername, limit }),
  appendChat: (userId, friendUsername, message) =>
    ipcRenderer.invoke("chat-append", { userId, friendUsername, message }),
  updateChat: (userId, friendUsername, messageId, patch) =>
    ipcRenderer.invoke("chat-update", { userId, friendUsername, messageId, patch }),
  deleteChat: (userId, friendUsername, messageId) =>
    ipcRenderer.invoke("chat-delete", { userId, friendUsername, messageId }),
  getPins: (userId, friendUsername) => ipcRenderer.invoke("pins-get", { userId, friendUsername }),
  setPins: (userId, friendUsername, pins) =>
    ipcRenderer.invoke("pins-set", { userId, friendUsername, pins }),
  listGroups: (userId) => ipcRenderer.invoke("groups-list", userId),
  createGroup: (userId, name, members) =>
    ipcRenderer.invoke("groups-create", { userId, name, members }),
  deleteGroup: (userId, groupId) => ipcRenderer.invoke("groups-delete", { userId, groupId }),
  getGroup: (userId, groupId) => ipcRenderer.invoke("groups-get", { userId, groupId }),

  // media / files
  pickScreenSources: () => ipcRenderer.invoke("pick-screen-sources"),
  setScreenSource: (id) => ipcRenderer.invoke("set-screen-source", id),
  systemAudioStart: () => ipcRenderer.invoke("system-audio-start"),
  systemAudioStop: () => ipcRenderer.invoke("system-audio-stop"),
  systemAudioStatus: () => ipcRenderer.invoke("system-audio-status"),
  onSystemAudioMeta: (cb) => {
    const h = (_e, data) => cb(data);
    ipcRenderer.on("system-audio-meta", h);
    return () => ipcRenderer.removeListener("system-audio-meta", h);
  },
  onSystemAudioPcm: (cb) => {
    const h = (_e, data) => cb(data);
    ipcRenderer.on("system-audio-pcm", h);
    return () => ipcRenderer.removeListener("system-audio-pcm", h);
  },
  onSystemAudioStopped: (cb) => {
    const h = (_e, data) => cb(data);
    ipcRenderer.on("system-audio-stopped", h);
    return () => ipcRenderer.removeListener("system-audio-stopped", h);
  },
  onSystemAudioError: (cb) => {
    const h = (_e, data) => cb(data);
    ipcRenderer.on("system-audio-error", h);
    return () => ipcRenderer.removeListener("system-audio-error", h);
  },
  pickFile: () => ipcRenderer.invoke("file-pick"),
  readFileChunk: (filePath, offset, length) =>
    ipcRenderer.invoke("file-read-chunk", { filePath, offset, length }),
  saveFileStart: (name, auto = true) => ipcRenderer.invoke("file-save-start", { name, auto }),
  saveFileChunk: (savePath, b64, offset) =>
    ipcRenderer.invoke("file-save-chunk", { savePath, b64, offset }),
  saveFileAuto: (name) => ipcRenderer.invoke("file-save-auto", { name }),
  saveAvatarDataUrl: (userId, dataUrl) =>
    ipcRenderer.invoke("avatar-save-dataurl", { userId, dataUrl }),
  openPath: (p) => ipcRenderer.invoke("open-path", p),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  filePreview: (filePath) => ipcRenderer.invoke("file-preview-dataurl", filePath),
  deletePath: (p) => ipcRenderer.invoke("delete-path", p),
  isWindowFocused: () => ipcRenderer.invoke("window-focused"),

  notifyIncoming: () => ipcRenderer.invoke("notify-incoming"),
  quitApp: () => ipcRenderer.invoke("quit-app"),
  showMessage: (opts) => ipcRenderer.invoke("show-message", opts),

  appVersion: () => ipcRenderer.invoke("app-version"),
  checkForUpdates: (opts) => ipcRenderer.invoke("update-check", opts || {}),
  getUpdateStatus: () => ipcRenderer.invoke("update-status"),
  onUpdateStatus: (cb) => {
    const h = (_e, data) => cb(data);
    ipcRenderer.on("update-status", h);
    return () => ipcRenderer.removeListener("update-status", h);
  },

  onMicHotkey: (cb) => {
    const h = () => cb();
    ipcRenderer.on("hotkey-mic", h);
    return () => ipcRenderer.removeListener("hotkey-mic", h);
  },
  onDeafenHotkey: (cb) => {
    const h = () => cb();
    ipcRenderer.on("hotkey-deafen", h);
    return () => ipcRenderer.removeListener("hotkey-deafen", h);
  },
});
