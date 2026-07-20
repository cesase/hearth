const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { app } = require("electron");

function root() {
  return app.getPath("userData");
}

function normalizeUserId(userId) {
  const id = String(userId || "").trim();
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
    throw new Error("Geçersiz kullanıcı kimliği.");
  }
  return id;
}

function normalizeUsername(username) {
  const value = String(username || "").trim().toLowerCase();
  if (!/^[a-z0-9._]{3,20}$/.test(value)) {
    throw new Error("Geçersiz kullanıcı adı.");
  }
  return value;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function usersPath() {
  return path.join(root(), "users.json");
}

function sessionPath() {
  return path.join(root(), "session.json");
}

function settingsPath(userId) {
  return path.join(root(), "profiles", normalizeUserId(userId), "settings.json");
}

function friendsPath(userId) {
  return path.join(root(), "profiles", normalizeUserId(userId), "friends.json");
}

function chatPath(userId, friendUsername) {
  const safe = String(friendUsername).toLowerCase().replace(/[^a-z0-9._-]/gi, "_");
  if (!safe || safe.length > 80) throw new Error("Geçersiz sohbet kimliği.");
  return path.join(root(), "profiles", normalizeUserId(userId), "chats", `${safe}.json`);
}

function avatarDir(userId) {
  return path.join(root(), "profiles", normalizeUserId(userId), "avatar");
}

function readJson(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {}
  return fallback;
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, file);
  } finally {
    try {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    } catch {}
  }
}

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 120000, 32, "sha256").toString("hex");
  return { salt: s, hash };
}

function verifyPassword(password, salt, hash) {
  const actual = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256");
  let expected;
  try {
    expected = Buffer.from(String(hash || ""), "hex");
  } catch {
    return false;
  }
  return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

function listUsers() {
  return readJson(usersPath(), { users: [] }).users || [];
}

function saveUsers(users) {
  writeJson(usersPath(), { users });
}

function findUserByEmail(email) {
  const e = String(email).trim().toLowerCase();
  return listUsers().find((u) => u.email === e) || null;
}

function findUserByUsername(username) {
  const n = String(username).trim().toLowerCase();
  return listUsers().find((u) => u.username === n) || null;
}

function registerUser({ email, password, username, displayName }) {
  const em = String(email || "").trim().toLowerCase();
  const un = String(username || "").trim().toLowerCase();
  const dn = String(displayName || username || "").trim();

  if (!em || !em.includes("@")) throw new Error("Geçerli bir e-posta gir.");
  if (!un || un.length < 3) throw new Error("Kullanıcı adı en az 3 karakter olmalı.");
  if (!/^[a-z0-9._]+$/.test(un)) throw new Error("Kullanıcı adı sadece harf, rakam, . ve _ içerebilir.");
  if (!password || password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");
  if (findUserByEmail(em)) throw new Error("Bu e-posta zaten kayıtlı.");
  if (findUserByUsername(un)) throw new Error("Bu kullanıcı adı alınmış (bu bilgisayarda).");

  const id = crypto.randomBytes(8).toString("hex");
  const { salt, hash } = hashPassword(password);
  const user = {
    id,
    email: em,
    username: un,
    displayName: dn || un,
    salt,
    hash,
    createdAt: Date.now(),
  };
  const users = listUsers();
  users.push(user);
  saveUsers(users);
  ensureDir(path.join(root(), "profiles", id, "chats"));
  writeJson(settingsPath(id), {
    micHotkey: "CommandOrControl+Shift+M",
    micVolume: 100,
    outputVolume: 100,
    screenQuality: "1080p",
    screenFps: 30,
  });
  writeJson(friendsPath(id), { friends: [] });
  return publicUser(user);
}

function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) throw new Error("E-posta veya şifre hatalı.");
  if (!verifyPassword(password, user.salt, user.hash)) throw new Error("E-posta veya şifre hatalı.");
  writeJson(sessionPath(), { userId: user.id, at: Date.now() });
  return publicUser(user);
}

function logout() {
  try {
    if (fs.existsSync(sessionPath())) fs.unlinkSync(sessionPath());
  } catch {}
}

function currentSession() {
  const s = readJson(sessionPath(), null);
  if (!s || !s.userId) return null;
  const user = listUsers().find((u) => u.id === s.userId);
  return user ? publicUser(user) : null;
}

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    createdAt: u.createdAt,
    about: u.about || "",
    socials: u.socials || { discord: "", twitter: "", youtube: "", instagram: "", website: "" },
    status: u.status || "online",
    statusText: u.statusText || "",
  };
}

function getSettings(userId) {
  return readJson(settingsPath(userId), {
    micHotkey: "CommandOrControl+Shift+M",
    deafenHotkey: "CommandOrControl+Shift+D",
    micVolume: 100,
    outputVolume: 100,
    screenAudioVolume: 100,
    screenQuality: "1080p",
    screenFps: 30,
    showCursor: false,
    captureSystemAudio: true,
    noiseSuppression: true,
    mediaDockHeight: 220,
    chatExpanded: false,
    avatarFrame: { x: 50, y: 50, scale: 1 },
    readReceipts: true,
    desktopNotify: true,
    // Ses ayarları (ileride genişletilebilir)
    soundIncoming: "fart_3.mp3",
    soundOutgoing: "ring_outgoing.mp3",
    soundNotify: "notify.mp3",
    soundMasterVolume: 100,
    soundRingEnabled: true,
    soundNotifyEnabled: true,
    onboardingDone: false,
    friendsOnlineCollapsed: false,
    friendsOfflineCollapsed: false,
    theme: "dark",
    language: "tr",
    timeFormat: "24",
    fontScale: 100,
  });
}

function groupsPath(userId) {
  return path.join(root(), "profiles", normalizeUserId(userId), "groups.json");
}

function getGroups(userId) {
  return readJson(groupsPath(userId), { groups: [] }).groups || [];
}

function saveGroups(userId, groups) {
  writeJson(groupsPath(userId), { groups });
  return groups;
}

function createGroup(userId, { name, members }) {
  const list = getGroups(userId);
  const mem = [...new Set((members || []).map((m) => normalizeUsername(m)))].slice(0, 12);
  if (mem.length < 1) throw new Error("Grup için en az 1 üye gerekir.");
  const id = "g_" + crypto.randomBytes(6).toString("hex");
  const group = {
    id,
    name: (name || mem.join(", ")).slice(0, 48),
    members: mem,
    createdAt: Date.now(),
  };
  list.unshift(group);
  saveGroups(userId, list);
  return group;
}

function upsertGroup(userId, { id, name, members, createdBy }) {
  const groupId = String(id || "").trim();
  if (!/^g_[a-f0-9]{12,64}$/i.test(groupId)) throw new Error("Geçersiz grup kimliği.");
  const mem = [...new Set((members || []).map((m) => normalizeUsername(m)))].slice(0, 12);
  if (!mem.length) throw new Error("Grup üyesi yok.");
  const list = getGroups(userId);
  const existing = list.findIndex((g) => g.id === groupId);
  const group = {
    id: groupId,
    name: String(name || mem.join(", ")).trim().slice(0, 48) || "Grup",
    members: mem,
    createdBy: createdBy ? normalizeUsername(createdBy) : undefined,
    createdAt: existing >= 0 ? list[existing].createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  if (existing >= 0) list[existing] = { ...list[existing], ...group };
  else list.unshift(group);
  saveGroups(userId, list);
  return group;
}

function deleteGroup(userId, groupId) {
  const list = getGroups(userId).filter((g) => g.id !== groupId);
  saveGroups(userId, list);
  return true;
}

function getGroup(userId, groupId) {
  return getGroups(userId).find((g) => g.id === groupId) || null;
}

function saveSettings(userId, patch) {
  const next = { ...getSettings(userId), ...patch };
  writeJson(settingsPath(userId), next);
  return next;
}

function getFriends(userId) {
  return readJson(friendsPath(userId), { friends: [] }).friends || [];
}

function addFriend(userId, friend) {
  const username = normalizeUsername(friend.username);
  const me = listUsers().find((u) => u.id === userId);
  if (me && me.username === username) throw new Error("Kendini ekleyemezsin.");
  const friends = getFriends(userId);
  if (friends.some((f) => f.username === username)) throw new Error("Zaten arkadaş listende.");
  const entry = {
    username,
    displayName: friend.displayName || username,
    addedAt: Date.now(),
    note: friend.note || "",
  };
  friends.push(entry);
  writeJson(friendsPath(userId), { friends });
  return entry;
}

function removeFriend(userId, username) {
  const un = String(username).toLowerCase();
  const friends = getFriends(userId).filter((f) => f.username !== un);
  writeJson(friendsPath(userId), { friends });
  return true;
}

function updateFriendMeta(userId, username, patch) {
  const un = String(username).toLowerCase();
  const friends = getFriends(userId);
  const i = friends.findIndex((f) => f.username === un);
  if (i < 0) return null;
  friends[i] = { ...friends[i], ...patch };
  writeJson(friendsPath(userId), { friends });
  return friends[i];
}

function getChat(userId, friendUsername, limit = 500) {
  const all = readJson(chatPath(userId, friendUsername), { messages: [] }).messages || [];
  if (all.length > limit) return all.slice(-limit);
  return all;
}

function appendChat(userId, friendUsername, message) {
  const file = chatPath(userId, friendUsername);
  const data = readJson(file, { messages: [] });
  data.messages = data.messages || [];
  data.messages.push(message);
  // max 5000 mesaj sakla
  if (data.messages.length > 5000) data.messages = data.messages.slice(-5000);
  writeJson(file, data);
  return message;
}

function setAvatar(userId, sourcePath) {
  const dir = avatarDir(userId);
  ensureDir(dir);
  const ext = path.extname(sourcePath).toLowerCase() || ".png";
  const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"];
  if (!allowed.includes(ext)) throw new Error("Desteklenen: png, jpg, gif, webp");
  const dest = path.join(dir, "avatar" + ext);
  // eski avatarları temizle
  for (const f of fs.readdirSync(dir)) {
    try {
      fs.unlinkSync(path.join(dir, f));
    } catch {}
  }
  fs.copyFileSync(sourcePath, dest);
  return dest;
}

function getAvatarPath(userId) {
  const dir = avatarDir(userId);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.startsWith("avatar."));
  if (!files.length) return null;
  return path.join(dir, files[0]);
}

function avatarDataUrl(userId) {
  const p = getAvatarPath(userId);
  if (!p || !fs.existsSync(p)) return null;
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "gif"
        ? "image/gif"
        : ext === "webp"
          ? "image/webp"
          : "image/png";
  const buf = fs.readFileSync(p);
  // büyük gif'lerde UI için sınırla (3MB)
  if (buf.length > 3 * 1024 * 1024) return null;
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function updateProfile(userId, patch) {
  const users = listUsers();
  const i = users.findIndex((u) => u.id === userId);
  if (i < 0) throw new Error("Kullanıcı yok.");
  if (patch.displayName != null) users[i].displayName = String(patch.displayName).trim().slice(0, 32);
  if (patch.about != null) users[i].about = String(patch.about).slice(0, 500);
  if (patch.socials != null) users[i].socials = { ...(users[i].socials || {}), ...patch.socials };
  if (patch.status != null) {
    const ok = ["online", "idle", "dnd", "invisible"];
    users[i].status = ok.includes(patch.status) ? patch.status : "online";
  }
  if (patch.statusText != null) users[i].statusText = String(patch.statusText).slice(0, 80);
  saveUsers(users);
  return publicUser(users[i]);
}

function updateChatMessage(userId, friendUsername, messageId, patch) {
  const file = chatPath(userId, friendUsername);
  const data = readJson(file, { messages: [] });
  const msgs = data.messages || [];
  const i = msgs.findIndex((m) => m.id === messageId);
  if (i < 0) return null;
  msgs[i] = { ...msgs[i], ...patch, editedAt: patch.text != null ? Date.now() : msgs[i].editedAt };
  data.messages = msgs;
  writeJson(file, data);
  return msgs[i];
}

function deleteChatMessage(userId, friendUsername, messageId) {
  return updateChatMessage(userId, friendUsername, messageId, {
    deleted: true,
    text: "",
    url: null,
    kind: "deleted",
  });
}

function getPins(userId, friendUsername) {
  const file = path.join(root(), "profiles", normalizeUserId(userId), "pins", `${String(friendUsername).toLowerCase().replace(/[^a-z0-9._-]/gi, "_")}.json`);
  return readJson(file, { pins: [] }).pins || [];
}

function setPins(userId, friendUsername, pins) {
  const file = path.join(root(), "profiles", normalizeUserId(userId), "pins", `${String(friendUsername).toLowerCase().replace(/[^a-z0-9._-]/gi, "_")}.json`);
  writeJson(file, { pins: pins.slice(0, 50) });
  return pins;
}

function downloadsDir() {
  const p = path.join(root(), "downloads");
  ensureDir(p);
  return p;
}

module.exports = {
  registerUser,
  loginUser,
  logout,
  currentSession,
  getSettings,
  saveSettings,
  getFriends,
  addFriend,
  removeFriend,
  updateFriendMeta,
  getChat,
  appendChat,
  updateChatMessage,
  deleteChatMessage,
  getPins,
  setPins,
  setAvatar,
  getAvatarPath,
  avatarDataUrl,
  updateProfile,
  downloadsDir,
  findUserByUsername,
  getGroups,
  createGroup,
  deleteGroup,
  getGroup,
  upsertGroup,
  saveGroups,
  normalizeUserId,
};
