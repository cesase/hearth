(() => {
  const api = window.api;
  if (!api) {
    document.body.innerHTML =
      "<p style='color:#fff;padding:24px'>Bu uygulama masaüstünden açılmalı (IkiliSohbet.exe veya BASLAT.vbs).</p>";
    return;
  }

  // openrelay.metered.ca kapandı — yalnızca STUN (TURN ileride cloud/signal.json)
  const ICE = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Google'ın GIF platformu Tenor (tarayıcı açılmaz, uygulama içi).
  // Ücretsiz key: https://developers.google.com/tenor — yoksa Giphy yedek
  const TENOR_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ"; // yaygın demo; kendi key'in daha iyi
  const GIPHY_KEY = "dc6zaTOxFJmzC";

  const EMOJIS = [
    "😀","😂","🤣","😊","😍","😘","😎","🤔","😅","😢","😭","😡","👍","👎","👏","🙏",
    "🔥","✨","🎉","💯","❤️","💔","👀","🤝","💪","🫡","😴","🤗","😏","🙌","✅","❌",
    "⭐","🌟","🍕","☕","🎮","🎧","📸","🚀","🌈","🍀","🐶","🐱","👻","💀","🤖","👑",
  ];

  const $ = (id) => document.getElementById(id);

  /** Responsive shell: wide | normal | compact */
  function updateShellLayout() {
    const w = window.innerWidth || document.documentElement.clientWidth || 1200;
    let layout = "wide";
    if (w < 800) layout = "compact";
    else if (w < 1100) layout = "normal";
    if (document.body.dataset.layout !== layout) {
      document.body.dataset.layout = layout;
    }
  }
  updateShellLayout();
  window.addEventListener("resize", updateShellLayout);
  if (typeof ResizeObserver !== "undefined") {
    try {
      new ResizeObserver(() => updateShellLayout()).observe(document.documentElement);
    } catch {}
  }

  const el = {
    viewAuth: $("view-auth"),
    viewApp: $("view-app"),
    chatEmpty: $("chat-empty"),
    formLogin: $("form-login"),
    formRegister: $("form-register"),
    loginEmail: $("login-email"),
    loginPass: $("login-pass"),
    loginError: $("login-error"),
    regEmail: $("reg-email"),
    regUsername: $("reg-username"),
    regDisplay: $("reg-display"),
    regPass: $("reg-pass"),
    regError: $("reg-error"),
    netStatus: $("net-status"),
    friendList: $("friend-list"),
    btnAddFriend: $("btn-add-friend"),
    myAvatarImg: $("my-avatar-img"),
    myAvatarFb: $("my-avatar-fallback"),
    btnMyAvatar: $("btn-my-avatar"),
    myDisplay: $("my-display"),
    myUsername: $("my-username"),
    btnOpenSettings: $("btn-open-settings"),
    peerAvatar: $("peer-avatar"),
    peerTitle: $("peer-title"),
    peerSub: $("peer-sub"),
    stageActions: $("stage-actions"),
    btnCall: $("btn-call"),
    btnHangup: $("btn-hangup"),
    btnHangupBar: $("btn-hangup-bar"),
    incomingBar: $("incoming-bar"),
    incomingText: $("incoming-text"),
    btnAccept: $("btn-accept"),
    btnReject: $("btn-reject"),
    mediaDock: $("media-dock"),
    remoteVideo: $("remote-video"),
    localVideo: $("local-video"),
    remotePh: $("remote-ph"),
    localPh: $("local-ph"),
    remoteTag: $("remote-tag"),
    callTimer: $("call-timer"),
    chatLog: $("chat-log"),
    chatForm: $("chat-form"),
    chatInput: $("chat-input"),
    btnSend: $("btn-send"),
    btnEmoji: $("btn-emoji"),
    btnGif: $("btn-gif"),
    btnFile: $("btn-file"),
    emojiPanel: $("emoji-panel"),
    gifPanel: $("gif-panel"),
    gifSearch: $("gif-search"),
    gifResults: $("gif-results"),
    btnMic: $("btn-mic"),
    btnDeafen: $("btn-deafen"),
    btnNoise: $("btn-noise"),
    micVol: $("mic-vol"),
    micVolVal: $("mic-vol-val"),
    outVol: $("out-vol"),
    outVolVal: $("out-vol-val"),
    screenAudioVol: $("screen-audio-vol"),
    screenAudioVolVal: $("screen-audio-vol-val"),
    screenQuality: $("screen-quality"),
    screenFps: $("screen-fps"),
    screenCursor: $("screen-cursor"),
    screenSystemAudio: $("screen-system-audio"),
    btnScreen: $("btn-screen"),
    mediaHeight: $("media-height"), // legacy (Boyut kaldırıldı; splitter kullan)
    mediaSplitter: $("media-splitter"),
    mediaLayout: $("media-layout"),
    mediaVideos: $("media-videos"),
    btnFullscreenMedia: $("btn-fullscreen-media"),
    btnGroupFromSelection: $("btn-group-from-selection"),
    btnNewGroup: $("btn-new-group"),
    groupsPane: $("app-controls"),
    groupList: $("group-list"),
    groupEmpty: $("group-empty"),
    chatSearch: $("chat-search"),
    chatSearchWrap: $("chat-search-wrap"),
    chatSearchCount: $("chat-search-count"),
    callMembersLabel: $("call-members-label"),
    inCallControls: $("in-call-controls"),
    msgContextMenu: $("msg-context-menu"),
    onboarding: $("onboarding"),
    btnOnboardDone: $("btn-onboard-done"),
    myStatusDot: $("my-status-dot"),
    modalProfile: $("modal-profile"),
    profileAvatar: $("profile-avatar"),
    profileDisplay: $("profile-display"),
    profileUsername: $("profile-username"),
    profileStatusLine: $("profile-status-line"),
    profileAbout: $("profile-about"),
    profileSocials: $("profile-socials"),
    btnProfileEdit: $("btn-profile-edit"),
    modalMediaOffer: $("modal-media-offer"),
    mediaOfferTitle: $("media-offer-title"),
    mediaOfferDetail: $("media-offer-detail"),
    btnMediaAccept: $("btn-media-accept"),
    btnMediaReject: $("btn-media-reject"),
    transferBar: $("transfer-bar"),
    transferLabel: $("transfer-label"),
    transferPct: $("transfer-pct"),
    transferFill: $("transfer-fill"),
    transferDetail: $("transfer-detail"),
    btnCancelTransfer: $("btn-cancel-transfer"),
    pinsBar: $("pins-bar"),
    pinsList: $("pins-list"),
    chatShell: $("chat-shell"),
    stage: document.querySelector(".stage"),
    myStatusSelect: $("my-status-select"),
    myStatusText: $("my-status-text"),
    setAbout: $("set-about"),
    setSocialTwitter: $("set-social-twitter"),
    setSocialYoutube: $("set-social-youtube"),
    setSocialInstagram: $("set-social-instagram"),
    setSocialWeb: $("set-social-web"),
    fsMedia: $("fs-media"),
    fsLayout: $("fs-layout"),
    fsVideos: $("fs-videos"),
    fsRemote: $("fs-remote-video"),
    fsLocal: $("fs-local-video"),
    btnFsExit: $("btn-fs-exit"),
    remoteScreenAudio: $("remote-screen-audio"),
    modalAdd: $("modal-add-friend"),
    addFriendUser: $("add-friend-user"),
    addFriendError: $("add-friend-error"),
    btnAddFriendGo: $("btn-add-friend-go"),
    modalSettings: $("modal-settings"),
    setDisplay: $("set-display"),
    setUsername: $("set-username"),
    setEmail: $("set-email"),
    setHotkey: $("set-hotkey"),
    btnClearHotkey: $("btn-clear-hotkey"),
    setDeafenHotkey: $("set-deafen-hotkey"),
    btnClearDeafen: $("btn-clear-deafen"),
    setMicVol: $("set-mic-vol"),
    setMicVolVal: $("set-mic-vol-val"),
    setSoundIncoming: $("set-sound-incoming"),
    setSoundOutgoing: $("set-sound-outgoing"),
    setSoundNotify: $("set-sound-notify"),
    setSoundRingEnabled: $("set-sound-ring-enabled"),
    setSoundNotifyEnabled: $("set-sound-notify-enabled"),
    setSoundVol: $("set-sound-vol"),
    setSoundVolVal: $("set-sound-vol-val"),
    btnPreviewIncoming: $("btn-preview-incoming"),
    btnPreviewOutgoing: $("btn-preview-outgoing"),
    btnPreviewNotify: $("btn-preview-notify"),
    btnChangeAvatar: $("btn-change-avatar"),
    btnFrameAvatar: $("btn-frame-avatar"),
    btnSettingsSave: $("btn-settings-save"),
    btnLogout: $("btn-logout"),
    btnCheckUpdates: $("btn-check-updates"),
    appVersionLabel: $("app-version-label"),
    updateStatusLabel: $("update-status-label"),
    btnLogoUpdate: $("btn-logo-update"),
    updateBadge: $("update-badge"),
    modalScreen: $("modal-screen"),
    screenList: $("screen-list"),
    modalAvatar: $("modal-avatar"),
    avatarEditImg: $("avatar-edit-img"),
    avatarFramePreview: $("avatar-frame-preview"),
    avX: $("av-x"),
    avY: $("av-y"),
    avS: $("av-s"),
    avXVal: $("av-x-val"),
    avYVal: $("av-y-val"),
    avSVal: $("av-s-val"),
    btnAvatarSave: $("btn-avatar-save"),
    remoteAudio: $("remote-audio"),
  };

  /** @type {any} */
  let me = null;
  /** @type {any} */
  let settings = {};
  /** @type {any[]} */
  let friends = [];
  /** @type {string | null} */
  let activeFriend = null;
  /** @type {string | null} group id when viewing group chat */
  let activeGroupId = null;
  /** @type {any[]} */
  let groups = [];
  /** @type {Set<string>} multi-select for group create */
  const selectedFriends = new Set();
  let friendsOnlineCollapsed = false;
  let friendsOfflineCollapsed = false;

  /** @type {any} */
  let peer = null;
  /** @type {Map<string, any>} username -> dataConn */
  const conns = new Map();
  /** @type {Map<string, string>} username -> online|offline|busy */
  const presence = new Map();
  /** @type {Map<string, string|null>} username -> avatar data url from peer */
  const remoteAvatars = new Map();

  /** @type {any} */
  let mediaCall = null;
  /** @type {Map<string, any>} multi-party calls username -> MediaConnection */
  const mediaCalls = new Map();
  let callRingTimer = null;
  let ctxTargetMessage = null;
  /** @type {any} */
  let screenCall = null;
  /** @type {Map<string, any>} */
  const screenCalls = new Map();
  /** @type {Map<string, HTMLAudioElement>} grup/çoklu ses */
  const peerVoiceEls = new Map();
  /** @type {any} */
  let incomingCall = null;
  /** @type {string | null} */
  let callWith = null;

  /** @type {MediaStream | null} */
  let rawMicStream = null;
  /** @type {MediaStream | null} */
  let processedMicStream = null;
  /** @type {AudioContext | null} */
  let audioCtx = null;
  /** @type {GainNode | null} */
  let micGain = null;
  /** @type {MediaStream | null} */
  let screenStream = null;

  let micOn = true;
  let deafened = false;
  let inCall = false;
  let presenceTimer = null;
  let callTimerIv = null;
  let callStartedAt = 0;
  let capturingHotkey = false;
  let capturingWhich = "mic"; // mic | deafen
  let chatExpanded = false;
  let preDeafenOutput = 100;
  let friendRequests = [];
  let updateAvailableInfo = null;
  let prefs = { theme: "dark", language: "tr", timeFormat: "24", fontScale: 100 };
  /** @type {any} signal server cfg from main */
  let signalCfg = null;
  let stopPresenceWs = null;

  // incoming file state
  let recvFile = null;
  let sendFileBusy = false;
  let activeTransferId = null;
  let transferCancelled = false;
  let noiseOn = true;
  let replyTo = null;
  /** @type {Map<string, number>} */
  const unread = new Map();
  /** @type {Map<string, any>} */
  const profileCache = new Map();

  const SOUND_OPTIONS = [
    { file: "ring_incoming.mp3", label: "iPhone zil (gelen)" },
    { file: "ring_outgoing.mp3", label: "Beep (giden)" },
    { file: "notify.mp3", label: "Bildirim" },
    { file: "fart_1.mp3", label: "Eğlence 1" },
    { file: "fart_2.mp3", label: "Eğlence 2" },
    { file: "fart_3.mp3", label: "Eğlence 3" },
  ];

  const snd = {
    incoming: null,
    outgoing: null,
    notify: null,
    preview: null,
  };

  function soundPath(file) {
    // Silinen kopya ses adlarını güncel dosyalara yönlendir
    const aliases = {
      "IPhone_ringtone.mp3": "ring_incoming.mp3",
      "notificaion.mp3": "notify.mp3",
      "beep.mp3": "ring_outgoing.mp3",
    };
    let f = file || "notify.mp3";
    f = String(f).replace(/^sounds\//, "");
    if (aliases[f]) f = aliases[f];
    return "sounds/" + f;
  }

  function soundMasterVol() {
    const v = Number(settings.soundMasterVolume ?? 100);
    return Math.max(0, Math.min(1, v / 100));
  }

  function rebuildSounds() {
    stopRings();
    try {
      if (snd.preview) {
        snd.preview.pause();
        snd.preview = null;
      }
    } catch {}
    const inc = settings.soundIncoming || "fart_3.mp3";
    const out = settings.soundOutgoing || "ring_outgoing.mp3";
    const ntf = settings.soundNotify || "notify.mp3";
    snd.incoming = new Audio(soundPath(inc));
    snd.incoming.loop = true;
    snd.incoming.volume = soundMasterVol();
    snd.outgoing = new Audio(soundPath(out));
    snd.outgoing.loop = true;
    snd.outgoing.volume = soundMasterVol();
    snd.notify = new Audio(soundPath(ntf));
    snd.notify.loop = false;
    snd.notify.volume = soundMasterVol();
  }

  function ensureSounds() {
    if (!snd.incoming || !snd.outgoing || !snd.notify) rebuildSounds();
    const vol = soundMasterVol();
    if (snd.incoming) snd.incoming.volume = vol;
    if (snd.outgoing) snd.outgoing.volume = vol;
    if (snd.notify) snd.notify.volume = vol;
  }

  function stopRings() {
    try {
      if (snd.incoming) {
        snd.incoming.pause();
        snd.incoming.currentTime = 0;
      }
      if (snd.outgoing) {
        snd.outgoing.pause();
        snd.outgoing.currentTime = 0;
      }
    } catch {}
  }

  function playIncomingRing() {
    if (settings.soundRingEnabled === false) return;
    ensureSounds();
    stopRings();
    snd.incoming.play().catch(() => {});
  }

  function playOutgoingRing() {
    if (settings.soundRingEnabled === false) return;
    ensureSounds();
    stopRings();
    snd.outgoing.play().catch(() => {});
  }

  async function playNotifyIfAllowed() {
    try {
      if (settings.soundNotifyEnabled === false) return;
      if (settings.desktopNotify === false) return;
      // Anlık durum: select / me.status — dnd/idle/invisible'da ses yok
      const st = (el.myStatusSelect && el.myStatusSelect.value) || (me && me.status) || "online";
      if (st !== "online") return;
      const focused = await api.isWindowFocused();
      if (focused) return;
      ensureSounds();
      if (!snd.notify) return;
      snd.notify.currentTime = 0;
      snd.notify.muted = false;
      snd.notify.volume = soundMasterVol();
      await snd.notify.play();
    } catch (e) {
      console.warn("notify", e);
    }
  }

  const I18N = window.HEARTH_I18N || { tr: {}, en: {} };

  function t(key) {
    const lang = prefs.language || "tr";
    return (I18N[lang] && I18N[lang][key]) || (I18N.tr && I18N.tr[key]) || key;
  }

  function applyTheme(theme) {
    const th = theme || prefs.theme || "dark";
    prefs.theme = th;
    document.documentElement.setAttribute("data-theme", th);
    // Electron pencere arka planı
    document.body.style.background = getComputedStyle(document.documentElement).getPropertyValue("--bg-0") || "";
  }

  function applyFontScale(scale) {
    const s = Math.max(85, Math.min(140, Number(scale) || 100));
    prefs.fontScale = s;
    document.documentElement.style.setProperty("--font-scale", String(s / 100));
  }

  /** id → i18n key for static chrome */
  const UI_TEXT_MAP = {
    "btn-call": "call",
    "btn-hangup": "hangup",
    "btn-send": "send",
    "btn-logout": "logout",
    "btn-settings-save": "save",
    "btn-add-friend-go": "sendRequest",
    "btn-file-offer-accept": "accept",
    "btn-file-offer-reject": "reject",
    "btn-check-updates": "checkUpdates",
    "btn-onboard-done": "onboardingDone",
    "btn-set-change-avatar": "changePhoto",
    "btn-set-frame-avatar": "adjustPhoto",
    "peer-title": "pickChat",
    "peer-sub": "pickChatHint",
    "remote-ph": "noScreen",
    "local-ph": "you",
    "remote-tag": "friend",
  };
  const UI_PLACEHOLDER_MAP = {
    "chat-input": "messagePh",
    "chat-search": "searchChat",
    "gif-search": "gifSearch",
    "my-status-text": "statusText",
    "add-friend-user": "usernamePh",
    "reg-username": "usernamePh",
    "reg-display": "optionalPh",
    "login-email": "email",
    "reg-email": "email",
    "login-pass": "password",
    "reg-pass": "password",
  };

  function applyLanguage(lang) {
    prefs.language = lang === "en" ? "en" : "tr";
    document.documentElement.lang = prefs.language;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const k = node.getAttribute("data-i18n");
      if (!k) return;
      const val = t(k);
      if (!val || val === k) return;
      // label with nested input: only update first text node or data-i18n-label span
      const span = node.querySelector("[data-i18n-label]");
      if (span) {
        span.textContent = val;
        return;
      }
      if (node.children.length && node.querySelector("input,select,textarea,button")) {
        // keep structure; set title
        node.setAttribute("data-i18n-applied", val);
        return;
      }
      node.textContent = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const k = node.getAttribute("data-i18n-placeholder");
      if (k && t(k)) node.placeholder = t(k);
    });
    // label > span[data-i18n] already handled; also nested labels with first child text
    for (const [id, key] of Object.entries(UI_TEXT_MAP)) {
      const n = $(id);
      if (n && t(key)) {
        if (n.tagName === "BUTTON" || n.tagName === "SPAN" || n.tagName === "P" || n.tagName === "H2" || n.tagName === "H3" || n.tagName === "SMALL") {
          // preserve structure for icon buttons with children
          if (n.querySelector(".ctrl-label")) continue;
          if (!n.querySelector("img,input,select")) n.textContent = t(key);
        }
      }
    }
    for (const [id, key] of Object.entries(UI_PLACEHOLDER_MAP)) {
      const n = $(id);
      if (n && t(key)) n.placeholder = t(key);
    }
    // tabs auth
    document.querySelectorAll(".tab[data-tab='login']").forEach((b) => (b.textContent = t("login")));
    document.querySelectorAll(".tab[data-tab='register']").forEach((b) => (b.textContent = t("register")));
    const fl = $("form-login")?.querySelector("button[type=submit]");
    if (fl) fl.textContent = t("loginBtn");
    const fr = $("form-register")?.querySelector("button[type=submit]");
    if (fr) fr.textContent = t("registerBtn");
    // layout select options
    if (el.mediaLayout) {
      const opts = el.mediaLayout.options;
      if (opts[0]) opts[0].textContent = t("layoutBoth");
      if (opts[1]) opts[1].textContent = t("layoutRemote");
      if (opts[2]) opts[2].textContent = t("layoutLocal");
    }
    document.querySelectorAll(".groups-pane-header h3").forEach((h) => (h.textContent = t("groups")));
    document.querySelectorAll("[data-close]").forEach((b) => {
      if (b.classList.contains("btn") && !b.querySelector("img")) {
        const k = b.getAttribute("data-close");
        if (b.textContent.trim().match(/Kapat|Close|İptal|Cancel/i)) {
          b.textContent = /avatar|add-friend|screen/i.test(k || "") ? t("cancel") : t("close");
        }
      }
    });
    // time format options
    const tf = $("set-time-format");
    if (tf && tf.options.length >= 2) {
      tf.options[0].textContent = t("time24");
      tf.options[1].textContent = t("time12");
    }
    // Ctrl labels Mic/Deaf/Noise/Share/End
    document.querySelectorAll("#btn-mic .ctrl-label").forEach((n) => (n.textContent = t("mic")));
    document.querySelectorAll("#btn-deafen .ctrl-label").forEach((n) => (n.textContent = t("deaf")));
    document.querySelectorAll("#btn-noise .ctrl-label").forEach((n) => (n.textContent = t("noise")));
    document.querySelectorAll("#btn-screen .ctrl-label").forEach((n) => (n.textContent = t("share")));
    document.querySelectorAll("#btn-hangup-bar .ctrl-label").forEach((n) => (n.textContent = t("end")));
    // Chat empty state
    const emptyP = el.chatEmpty && el.chatEmpty.querySelector("p");
    const emptyS = el.chatEmpty && el.chatEmpty.querySelector("small");
    if (emptyP) emptyP.textContent = t("emptyChat");
    if (emptyS) emptyS.textContent = t("emptyChatHint");
    const ge = $("group-empty");
    if (ge) {
      const gp = ge.querySelector("p");
      const gs = ge.querySelector("small");
      if (gp) gp.textContent = t("noGroups");
      if (gs) gs.textContent = t("groupEmptyHint");
    }
    if (el.btnCall) el.btnCall.textContent = "📞 " + t("call");
    if (el.btnHangup) el.btnHangup.textContent = t("hangup");
    syncStatusSummary();
    renderFriends();
    renderFriendRequests();
    renderGroups();
    setScreenBtnUi();
  }

  function formatMsgTime(ts) {
    const d = new Date(ts || Date.now());
    if (prefs.timeFormat === "12") {
      return d.toLocaleString(prefs.language === "en" ? "en-US" : "tr-TR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "2-digit",
      });
    }
    return d.toLocaleString(prefs.language === "en" ? "en-GB" : "tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      day: "2-digit",
      month: "2-digit",
    });
  }

  function syncStatusSummary() {
    const st = (el.myStatusSelect && el.myStatusSelect.value) || (me && me.status) || "online";
    const map = {
      online: t("statusOnline"),
      idle: t("statusIdle"),
      dnd: t("statusDnd"),
      invisible: t("statusInvisible"),
    };
    const lab = $("status-summary-label");
    const dot = $("status-summary-dot");
    if (lab) lab.textContent = map[st] || st;
    if (dot) dot.className = "status-dot " + st;
    document.querySelectorAll('input[name="my-status"]').forEach((r) => {
      r.checked = r.value === st;
    });
  }

  function attachPeerVoice(username, stream) {
    if (!username || !stream) return;
    const tracks = stream.getAudioTracks();
    if (!tracks.length) return;
    let a = peerVoiceEls.get(username);
    if (!a) {
      a = new Audio();
      a.autoplay = true;
      peerVoiceEls.set(username, a);
    }
    a.srcObject = new MediaStream(tracks);
    a.muted = !!deafened;
    a.volume = Math.min(1, Math.max(0, (settings.outputVolume ?? 100) / 100));
    a.play().catch(() => {});
  }

  function clearPeerVoices() {
    for (const a of peerVoiceEls.values()) {
      try {
        a.pause();
        a.srcObject = null;
      } catch {}
    }
    peerVoiceEls.clear();
  }

  function setPeerVoicesMuted(m) {
    for (const a of peerVoiceEls.values()) {
      a.muted = !!m;
    }
  }

  function setUpdateBadge(info) {
    updateAvailableInfo = info || null;
    const badge = $("update-badge");
    const btn = $("btn-logo-update");
    if (badge) {
      badge.hidden = !info;
      badge.title = info ? t("updateReady") + " v" + (info.version || "") : "";
    }
    if (btn) btn.title = info ? t("updateReady") : "Hearth";
  }

  function fillSoundSelect(selectEl, selected) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    for (const opt of SOUND_OPTIONS) {
      const o = document.createElement("option");
      o.value = opt.file;
      o.textContent = opt.label;
      if (opt.file === selected) o.selected = true;
      selectEl.appendChild(o);
    }
    // seçili dosya listede yoksa yine de ekle
    if (selected && ![...selectEl.options].some((x) => x.value === selected)) {
      const o = document.createElement("option");
      o.value = selected;
      o.textContent = selected;
      o.selected = true;
      selectEl.appendChild(o);
    }
  }

  function previewSound(file, loop) {
    try {
      if (snd.preview) {
        snd.preview.pause();
        snd.preview = null;
      }
      stopRings();
      snd.preview = new Audio(soundPath(file));
      snd.preview.loop = !!loop;
      snd.preview.volume = soundMasterVol();
      snd.preview.play().catch(() => {});
      // 3 sn sonra otomatik dur (loop olsa bile önizleme)
      setTimeout(() => {
        try {
          if (snd.preview) {
            snd.preview.pause();
            snd.preview = null;
          }
        } catch {}
      }, loop ? 3500 : 4000);
    } catch {}
  }

  function isMediaFileName(name) {
    return /\.(png|jpe?g|gif|webp|bmp|mp4|webm|mov)$/i.test(name || "");
  }

  function mediaKind(name) {
    if (/\.(mp4|webm|mov)$/i.test(name || "")) return "video";
    if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(name || "")) return "image";
    return "file";
  }

  let mediaOfferResolve = null;
  function askMediaOffer(meta) {
    return askFileOffer(meta);
  }
  function askFileOffer(meta) {
    return new Promise((resolve) => {
      mediaOfferResolve = resolve;
      const text = $("file-offer-text");
      if (text) {
        text.textContent = `${meta.from || "Arkadaş"}: ${meta.name} (${fmtSize(meta.size || 0)}) — kabul edilsin mi?`;
      }
      const modal = $("modal-file-offer") || el.modalMediaOffer;
      if (modal) modal.hidden = false;
      // Eski modal yoksa confirm
      if (!modal) {
        const ok = confirm(`${meta.from}: ${meta.name} (${fmtSize(meta.size || 0)}) alınsın mı?`);
        mediaOfferResolve = null;
        resolve(ok);
      }
    });
  }
  function closeMediaOffer(ok) {
    const modal = $("modal-file-offer") || el.modalMediaOffer;
    if (modal) modal.hidden = true;
    if (mediaOfferResolve) {
      mediaOfferResolve(!!ok);
      mediaOfferResolve = null;
    }
  }

  function statusLabel(st) {
    return (
      {
        online: "🟢 " + t("statusOnline"),
        idle: "🌙 " + t("statusIdle"),
        dnd: "⛔ " + t("statusDnd"),
        invisible: "⚫ " + t("statusInvisible"),
      }[st] || "🟢 " + t("statusOnline")
    );
  }

  function updateMyStatusDot() {
    if (!el.myStatusDot) return;
    const st = (me && me.status) || "online";
    el.myStatusDot.className = "status-dot " + st;
    el.myStatusDot.title = statusLabel(st);
  }

  // ---------- utils ----------
  async function peerIdOf(username) {
    const raw = "ikili::user::" + String(username).trim().toLowerCase();
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return ("u" + hex).slice(0, 16);
  }

  function fmtTime(ts) {
    try {
      return new Date(ts).toLocaleString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function fmtSize(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + " MB";
    return (n / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  function accelToLabel(accel) {
    if (!accel) return "";
    return accel
      .replace(/CommandOrControl/g, "Ctrl")
      .replace(/Control/g, "Ctrl")
      .replace(/\+/g, " + ");
  }

  function eventToAccel(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push("CommandOrControl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    const k = e.key;
    if (["Control", "Shift", "Alt", "Meta"].includes(k)) return null;
    let key = k.length === 1 ? k.toUpperCase() : k;
    if (key === " ") key = "Space";
    parts.push(key);
    if (parts.length < 2 && !/^F\d+$/i.test(key)) return null; // en az modifier veya F tuşu
    if (/^F\d+$/i.test(key) && parts.length === 1) return key;
    return parts.join("+");
  }

  // ---------- UI shells ----------
  function showAuth() {
    el.viewAuth.hidden = false;
    el.viewApp.hidden = true;
  }

  function showApp() {
    el.viewAuth.hidden = true;
    el.viewApp.hidden = false;
    updateShellLayout();
  }

  function updateChatEmpty() {
    if (!el.chatEmpty || !el.chatLog) return;
    const hasMsgs = el.chatLog.children.length > 0;
    el.chatEmpty.hidden = hasMsgs || !activeFriend;
  }

  function applyAvatarFrame(imgEl, frame, { editor = false } = {}) {
    if (!imgEl) return;
    const f = frame || settings.avatarFrame || { x: 50, y: 50, scale: 1 };
    const x = Number(f.x ?? 50);
    const y = Number(f.y ?? 50);
    const s = Math.max(1, Math.min(3, Number(f.scale ?? 1)));
    imgEl.draggable = false;
    imgEl.style.userSelect = "none";
    imgEl.style.pointerEvents = "none";
    imgEl.style.position = "absolute";
    imgEl.style.maxWidth = "none";
    imgEl.style.objectFit = "cover";
    // Sürükleme: translate yüzde kaydırma + scale
    const dx = ((x - 50) / 50) * 40; // -40% .. +40%
    const dy = ((y - 50) / 50) * 40;
    imgEl.style.left = "50%";
    imgEl.style.top = "50%";
    imgEl.style.width = `${100 * s}%`;
    imgEl.style.height = `${100 * s}%`;
    imgEl.style.transform = `translate(calc(-50% + ${dx}%), calc(-50% + ${dy}%))`;
    imgEl.style.objectPosition = "center center";
  }

  function setMyAvatar(url) {
    if (url) {
      el.myAvatarImg.src = url;
      el.myAvatarImg.hidden = false;
      el.myAvatarFb.hidden = true;
      applyAvatarFrame(el.myAvatarImg, settings.avatarFrame);
    } else {
      el.myAvatarImg.hidden = true;
      el.myAvatarFb.hidden = false;
      el.myAvatarFb.textContent = (me?.displayName || me?.username || "?")[0].toUpperCase();
    }
  }

  function showTransfer(label, pct, detail) {
    el.transferBar.hidden = false;
    el.transferLabel.textContent = label;
    const p = Math.max(0, Math.min(100, Math.round(pct)));
    el.transferPct.textContent = p + "%";
    el.transferFill.style.width = p + "%";
    el.transferDetail.textContent = detail || "";
  }

  function hideTransfer() {
    el.transferBar.hidden = true;
    el.transferFill.style.width = "0%";
  }

  let mediaHeightPx = 220;

  function setMediaHeight(h, { animate = false } = {}) {
    const stage = el.stage || $("app-stage");
    const stageH = stage ? stage.getBoundingClientRect().height : 700;
    // Toolbar + kontroller ~140px; sohbete en az ~120px bırak
    const maxV = Math.max(140, Math.min(560, Math.floor(stageH - 220)));
    const v = Math.max(100, Math.min(maxV, Number(h) || 220));
    mediaHeightPx = v;
    document.documentElement.style.setProperty("--media-h", v + "px");
    if (el.mediaDock) {
      el.mediaDock.style.setProperty("--media-h", v + "px");
      el.mediaDock.style.flex = "0 0 auto";
      el.mediaDock.style.maxHeight = "none";
    }
    const vids = el.mediaVideos || $("media-videos");
    if (vids) {
      vids.style.transition = animate ? "height 0.12s ease" : "none";
      // !important: CSS kuralları ezmesin
      vids.style.setProperty("height", v + "px", "important");
      vids.style.setProperty("min-height", v + "px", "important");
      vids.style.setProperty("max-height", v + "px", "important");
    }
    if (el.mediaHeight) el.mediaHeight.value = String(v);
    return v;
  }

  function syncMediaSplitterVisibility() {
    const split = el.mediaSplitter || $("media-splitter");
    if (!split) return;
    const show = !!(el.mediaDock && !el.mediaDock.hidden);
    if (show) {
      split.removeAttribute("hidden");
      split.hidden = false;
      split.style.display = "block";
    } else {
      split.hidden = true;
      split.setAttribute("hidden", "");
      split.style.display = "none";
    }
  }

  function setMediaDockVisible(visible) {
    if (el.mediaDock) el.mediaDock.hidden = !visible;
    syncMediaSplitterVisibility();
    if (visible) setMediaHeight(mediaHeightPx || settings.mediaDockHeight || 220);
  }

  /** Discord-tarzı: medya paneli yüksekliğini sürükleyerek ayarla (mouse + touch) */
  function wireMediaSplitter() {
    const split = el.mediaSplitter || $("media-splitter");
    if (!split || split._wired) return;
    split._wired = true;
    el.mediaSplitter = split;

    let dragging = false;
    let startY = 0;
    let startH = 220;

    const onMove = (clientY) => {
      if (!dragging) return;
      setMediaHeight(startH + (clientY - startY), { animate: false });
    };

    const onMouseMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      onMove(e.clientY);
    };

    const onTouchMove = (e) => {
      if (!dragging || !e.touches || !e.touches[0]) return;
      e.preventDefault();
      onMove(e.touches[0].clientY);
    };

    const endDrag = async () => {
      if (!dragging) return;
      dragging = false;
      split.classList.remove("dragging");
      document.body.classList.remove("resizing-media");
      window.removeEventListener("mousemove", onMouseMove, true);
      window.removeEventListener("mouseup", endDrag, true);
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", endDrag, true);
      window.removeEventListener("touchcancel", endDrag, true);
      settings.mediaDockHeight = mediaHeightPx;
      if (me) {
        try {
          await api.saveSettings(me.id, { mediaDockHeight: mediaHeightPx });
        } catch {}
      }
    };

    const startDrag = (clientY) => {
      if (!el.mediaDock || el.mediaDock.hidden) return false;
      dragging = true;
      startY = clientY;
      const vids = el.mediaVideos || $("media-videos");
      startH = vids
        ? Math.round(vids.getBoundingClientRect().height) || mediaHeightPx
        : mediaHeightPx || settings.mediaDockHeight || 220;
      split.classList.add("dragging");
      document.body.classList.add("resizing-media");
      window.addEventListener("mousemove", onMouseMove, true);
      window.addEventListener("mouseup", endDrag, true);
      window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
      window.addEventListener("touchend", endDrag, true);
      window.addEventListener("touchcancel", endDrag, true);
      return true;
    };

    // mousedown — en güvenilir masaüstü yolu
    split.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      startDrag(e.clientY);
    });
    split.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        e.preventDefault();
        startDrag(e.touches[0].clientY);
      },
      { passive: false }
    );
    // Klavye
    split.addEventListener("keydown", async (e) => {
      if (el.mediaDock?.hidden) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = mediaHeightPx + (e.key === "ArrowUp" ? -16 : 16);
        setMediaHeight(next, { animate: true });
        settings.mediaDockHeight = mediaHeightPx;
        if (me) {
          try {
            await api.saveSettings(me.id, { mediaDockHeight: mediaHeightPx });
          } catch {}
        }
      }
    });
  }

  function setChatExpanded(on) {
    chatExpanded = !!on;
    if (el.stage) el.stage.classList.toggle("chat-expanded", chatExpanded);
    el.mediaDock.classList.toggle("chat-expanded", chatExpanded);
    if (el.btnToggleChat) {
      el.btnToggleChat.textContent = chatExpanded ? "💬 Sohbeti küçült" : "💬 Sohbeti genişlet";
    }
  }

  function setPeerHeader(friend) {
    if (!friend) {
      el.peerTitle.textContent = t("pickChat");
      el.peerSub.textContent = t("pickChatHint");
      el.stageActions.hidden = true;
      el.peerAvatar.textContent = "?";
      el.peerAvatar.innerHTML = "?";
      return;
    }
    el.peerTitle.textContent = friend.displayName || friend.username;
    const st = presence.get(friend.username) || "offline";
    el.peerSub.textContent =
      st === "online"
        ? t("online")
        : st === "busy"
          ? t("busy")
          : t("offline");
    el.stageActions.hidden = false;
    el.remoteTag.textContent = friend.displayName || friend.username;
    const av = remoteAvatars.get(friend.username);
    if (av) {
      el.peerAvatar.innerHTML = "";
      const img = document.createElement("img");
      img.src = av;
      img.alt = "";
      el.peerAvatar.appendChild(img);
    } else {
      el.peerAvatar.textContent = (friend.displayName || friend.username)[0].toUpperCase();
    }
    updateCallButtons();
  }

  function chatKey() {
    if (activeGroupId) return activeGroupId;
    return activeFriend;
  }

  function updateCallButtons() {
    const key = chatKey();
    if (!key) {
      el.stageActions.hidden = true;
      if (el.chatSearchWrap) el.chatSearchWrap.hidden = true;
      return;
    }
    el.stageActions.hidden = false;
    if (el.chatSearchWrap) el.chatSearchWrap.hidden = false;
    // Çevrimdışı da aranabilir; buton hep aktif (görüşme dışındayken)
    el.btnCall.disabled = inCall;
    el.btnCall.hidden = inCall;
    el.btnHangup.hidden = !inCall;
    if (el.btnHangupBar) el.btnHangupBar.hidden = !inCall;
    el.btnFile.disabled = false;
    // Zil sırasında ekran paylaşımı yok (Fable 5 §2.6)
    if (el.btnScreen) el.btnScreen.disabled = !inCall || !!outboundRing;
    setScreenBtnUi();
    el.chatInput.disabled = false;
    el.btnSend.disabled = false;
  }

  function friendStatusLabel(f, st) {
    const remoteSt = f.remoteStatus || "";
    if (st === "busy") return t("busy");
    if (st === "online") {
      if (remoteSt === "dnd") return t("statusDnd");
      if (remoteSt === "idle") return t("statusIdle");
      if (remoteSt === "invisible") return t("statusInvisible");
      return t("online");
    }
    return t("offline");
  }

  /** Dot class from presence + remote status */
  function friendDotClass(f, st) {
    if (st === "busy") return "busy";
    if (st === "offline") return "off";
    const rs = f.remoteStatus || "online";
    if (rs === "dnd") return "dnd";
    if (rs === "idle") return "idle";
    if (rs === "invisible") return "off";
    return "on";
  }

  /** Sağ grup paneli: varsayılan gizli; grup oluşunca / grup aramasında açılır */
  function setGroupsPaneVisible(show) {
    const pane = el.groupsPane || $("app-controls");
    if (!pane) return;
    pane.hidden = !show;
    pane.classList.toggle("groups-pane-visible", !!show);
    document.body.classList.toggle("has-groups-pane", !!show);
  }

  function syncGroupsPaneVisibility() {
    // Varsayılan gizli; ilk grup oluşunca veya aktif grup aramasında görünür
    const show = !!(groups && groups.length > 0) || !!activeGroupId;
    setGroupsPaneVisible(show);
  }

  function updateGroupSelectionUi() {
    const n = selectedFriends.size;
    if (el.btnGroupFromSelection) {
      // 2+ seçim (kendin + arkadaşlar): grup çağrısı butonu
      el.btnGroupFromSelection.hidden = n < 2;
      el.btnGroupFromSelection.title = n
        ? `${n} ${t("members")} — ${t("groups")}`
        : "";
    }
  }

  function makeFriendRow(f) {
    const st = presence.get(f.username) || "offline";
    const row = document.createElement("div");
    row.className =
      "friend-item" +
      (activeFriend === f.username && !activeGroupId ? " active" : "") +
      (selectedFriends.has(f.username) ? " selected" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "friend-check";
    check.checked = selectedFriends.has(f.username);
    check.title = "Grup seçimi";
    check.addEventListener("click", (e) => e.stopPropagation());
    check.addEventListener("change", () => {
      if (check.checked) selectedFriends.add(f.username);
      else selectedFriends.delete(f.username);
      updateGroupSelectionUi();
      row.classList.toggle("selected", check.checked);
    });

    const av = document.createElement("div");
    av.className = "avatar";
    const remote = remoteAvatars.get(f.username);
    if (remote) {
      const img = document.createElement("img");
      img.src = remote;
      av.appendChild(img);
    } else av.textContent = (f.displayName || f.username)[0].toUpperCase();

    const meta = document.createElement("div");
    meta.className = "meta";
    const dotCls = friendDotClass(f, st);
    meta.innerHTML = `<div class="name"></div><div class="sub"><span class="dot ${dotCls}"></span><span></span></div>`;
    meta.querySelector(".name").textContent = f.displayName || f.username;
    meta.querySelector(".sub span:last-child").textContent =
      (f.statusText ? f.statusText + " · " : "") + friendStatusLabel(f, st);

    // Checkbox sağda (modern soluk tik)
    row.appendChild(av);
    row.appendChild(meta);
    const uc = unread.get(f.username) || 0;
    if (uc > 0) {
      const badge = document.createElement("span");
      badge.className = "badge-unread";
      badge.textContent = uc > 99 ? "99+" : String(uc);
      row.appendChild(badge);
    }
    row.appendChild(check);
    row.addEventListener("click", (e) => {
      if (e.target === check || e.target.closest?.(".friend-check")) return;
      openFriend(f.username);
    });
    return row;
  }

  function renderFriendRequests() {
    const box = $("friend-requests-box");
    const list = $("friend-requests-list");
    if (!box || !list) return;
    list.innerHTML = "";
    if (!friendRequests.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    for (const req of friendRequests) {
      const row = document.createElement("div");
      row.className = "friend-request-row";
      row.innerHTML = `<strong></strong><div class="req-actions"></div>`;
      row.querySelector("strong").textContent = req.displayName || req.username;
      const acc = document.createElement("button");
      acc.type = "button";
      acc.className = "btn success sm";
      acc.textContent = t("accept");
      acc.addEventListener("click", async () => {
        try {
          if (cloudMode && window.HearthCloud?.respondFriendRequest) {
            await window.HearthCloud.respondFriendRequest(req.username, true);
          }
          await refreshFriendsAndRequests();
          renderMessage({ type: "system", text: t("requestAccepted") + " @" + req.username });
        } catch (e) {
          alert(e.message || String(e));
        }
      });
      const rej = document.createElement("button");
      rej.type = "button";
      rej.className = "btn soft sm";
      rej.textContent = t("reject");
      rej.addEventListener("click", async () => {
        try {
          if (cloudMode && window.HearthCloud?.respondFriendRequest) {
            await window.HearthCloud.respondFriendRequest(req.username, false);
          }
          await refreshFriendsAndRequests();
        } catch (e) {
          alert(e.message || String(e));
        }
      });
      row.querySelector(".req-actions").appendChild(acc);
      row.querySelector(".req-actions").appendChild(rej);
      list.appendChild(row);
    }
  }

  async function refreshFriendsAndRequests() {
    if (cloudMode && window.HearthCloud?.isEnabled()) {
      friends = await window.HearthCloud.listFriends();
      try {
        await api; // keep local mirror soft
      } catch {}
      if (window.HearthCloud.listIncomingFriendRequests) {
        friendRequests = await window.HearthCloud.listIncomingFriendRequests();
      }
    } else {
      friends = await api.listFriends(me.id);
      friendRequests = [];
    }
    renderFriends();
    renderFriendRequests();
  }

  function renderFriends() {
    el.friendList.innerHTML = "";
    if (!friends.length) {
      const d = document.createElement("div");
      d.className = "empty-friends";
      d.innerHTML =
        "<div class='empty-icon'>👥</div><p style='margin:8px 0 4px;font-weight:700;color:var(--text)'></p><small></small>";
      d.querySelector("p").textContent = t("noFriends");
      d.querySelector("small").textContent = t("addFriendHintEmpty");
      el.friendList.appendChild(d);
      updateGroupSelectionUi();
      return;
    }
    const online = [];
    const offline = [];
    for (const f of friends) {
      const st = presence.get(f.username) || "offline";
      if (st === "online" || st === "busy") online.push(f);
      else offline.push(f);
    }
    const sortFn = (a, b) =>
      (a.displayName || a.username).localeCompare(b.displayName || b.username, prefs.language === "en" ? "en" : "tr");
    online.sort(sortFn);
    offline.sort(sortFn);

    const section = (title, list, collapsed, toggle) => {
      const sec = document.createElement("div");
      sec.className = "friend-section" + (collapsed ? " collapsed" : "");
      const head = document.createElement("button");
      head.type = "button";
      head.className = "friend-section-title";
      head.innerHTML = `<span class="chev">${collapsed ? "▶" : "▼"}</span><span></span><span class="section-count"></span>`;
      head.querySelectorAll("span")[1].textContent = title;
      head.querySelector(".section-count").textContent = String(list.length);
      head.addEventListener("click", toggle);
      const body = document.createElement("div");
      body.className = "friend-section-body";
      list.forEach((f) => body.appendChild(makeFriendRow(f)));
      sec.appendChild(head);
      sec.appendChild(body);
      return sec;
    };

    el.friendList.appendChild(
      section(t("online"), online, friendsOnlineCollapsed, () => {
        friendsOnlineCollapsed = !friendsOnlineCollapsed;
        if (me) api.saveSettings(me.id, { friendsOnlineCollapsed });
        renderFriends();
      })
    );
    el.friendList.appendChild(
      section(t("offline"), offline, friendsOfflineCollapsed, () => {
        friendsOfflineCollapsed = !friendsOfflineCollapsed;
        if (me) api.saveSettings(me.id, { friendsOfflineCollapsed });
        renderFriends();
      })
    );
    updateGroupSelectionUi();
  }

  function renderGroups() {
    if (!el.groupList) return;
    el.groupList.innerHTML = "";
    syncGroupsPaneVisibility();
    if (!groups.length) {
      if (el.groupEmpty) {
        el.groupEmpty.hidden = false;
        const p = el.groupEmpty.querySelector("p");
        const s = el.groupEmpty.querySelector("small");
        if (p) p.textContent = t("noGroups");
        if (s) s.textContent = t("groupEmptyHint");
      }
      return;
    }
    if (el.groupEmpty) el.groupEmpty.hidden = true;
    for (const g of groups) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "group-item" + (activeGroupId === g.id ? " active" : "");
      const onlineN = (g.members || []).filter((m) => {
        const st = presence.get(m);
        return st === "online" || st === "busy";
      }).length;
      btn.innerHTML = `<strong></strong><small></small>`;
      btn.querySelector("strong").textContent = g.name;
      btn.querySelector("small").textContent = `${g.members.length} ${t("members")} · ${onlineN} ${t("online").toLowerCase()}`;
      const actions = document.createElement("div");
      actions.className = "group-item-actions";
      const callBtn = document.createElement("button");
      callBtn.type = "button";
      callBtn.className = "btn soft sm";
      callBtn.textContent = "📞 " + t("call");
      callBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openGroup(g.id).then(() => startGroupCall(g));
      });
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn danger sm btn-del-group";
      delBtn.textContent = "🗑️";
      delBtn.title = t("deleteGroup");
      delBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm(`"${g.name}" ${t("confirmDeleteGroup")}`)) return;
        try {
          await api.deleteGroup(me.id, g.id);
          groups = await api.listGroups(me.id);
          if (activeGroupId === g.id) {
            activeGroupId = null;
            setPeerHeader(null);
          }
          renderGroups();
        } catch (err) {
          alert(err.message || String(err));
        }
      });
      actions.appendChild(callBtn);
      actions.appendChild(delBtn);
      btn.appendChild(actions);
      btn.addEventListener("click", () => openGroup(g.id));
      el.groupList.appendChild(btn);
    }
  }

  function scrollChatToBottom(force) {
    const box = el.chatLog;
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    if (force || nearBottom) box.scrollTop = box.scrollHeight;
  }

  /** http(s) URL'leri tıklanabilir yap; tıklanınca onay kutusu */
  const URL_RE = /((?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)\]])/gi;

  function normalizeHref(raw) {
    let u = String(raw || "").trim();
    if (!u) return "";
    if (/^www\./i.test(u)) u = "https://" + u;
    if (!/^https?:\/\//i.test(u)) return "";
    try {
      const parsed = new URL(u);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch {
      return "";
    }
  }

  async function confirmAndOpenLink(url) {
    const href = normalizeHref(url);
    if (!href) return;
    const msg = `${t("openLinkConfirm")}\n\n${href}`;
    const ok = window.confirm(msg);
    if (!ok) return;
    try {
      if (api.openExternal) {
        const res = await api.openExternal(href);
        if (res && res.ok === false) throw new Error(res.error || "open failed");
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.warn("open link", e);
      alert(e.message || String(e));
    }
  }

  function fillTextWithLinks(elNode, text) {
    const raw = String(text || "");
    elNode.textContent = "";
    if (!raw) return;
    let last = 0;
    const re = new RegExp(URL_RE.source, "gi");
    let match;
    while ((match = re.exec(raw)) !== null) {
      if (match.index > last) {
        elNode.appendChild(document.createTextNode(raw.slice(last, match.index)));
      }
      const rawUrl = match[0];
      const href = normalizeHref(rawUrl);
      if (href) {
        const a = document.createElement("a");
        a.className = "chat-link";
        a.href = href;
        a.textContent = rawUrl;
        a.rel = "noopener noreferrer";
        a.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          confirmAndOpenLink(href);
        });
        elNode.appendChild(a);
      } else {
        elNode.appendChild(document.createTextNode(rawUrl));
      }
      last = match.index + rawUrl.length;
    }
    if (last < raw.length) {
      elNode.appendChild(document.createTextNode(raw.slice(last)));
    }
  }

  function appendMsgBodyContent(container, m) {
    if (m.kind === "gif" && m.url) {
      const img = document.createElement("img");
      img.className = "gif";
      img.src = m.url;
      img.alt = "gif";
      container.appendChild(img);
    } else if (m.kind === "image" || m.kind === "video" || (m.kind === "file" && isMediaFileName(m.name))) {
      const kind = m.kind === "video" || mediaKind(m.name) === "video" ? "video" : "image";
      if (m.previewUrl) {
        if (kind === "video") {
          const v = document.createElement("video");
          v.className = "preview";
          v.src = m.previewUrl;
          v.controls = true;
          container.appendChild(v);
        } else {
          const img = document.createElement("img");
          img.className = "preview";
          img.src = m.previewUrl;
          img.alt = m.name || "media";
          container.appendChild(img);
        }
      } else {
        container.appendChild(document.createTextNode(`📎 ${m.name || "media"}`));
      }
    } else if (m.kind === "file") {
      container.appendChild(document.createTextNode(`📎 ${m.name} (${fmtSize(m.size || 0)})`));
    } else {
      const body = document.createElement("div");
      body.className = "msg-line";
      fillTextWithLinks(body, m.text || "");
      container.appendChild(body);
    }
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = formatMsgTime(m.ts);
    container.appendChild(time);
  }

  function renderMessage(m, { scroll = true, grouped = false } = {}) {
    // Aynı kişiden art arda: önceki balona satır ekle
    if (
      grouped &&
      m.type !== "system" &&
      m.kind !== "missed-call" &&
      !m.deleted &&
      (m.kind === "text" || !m.kind || m.type === "chat")
    ) {
      const last = el.chatLog.lastElementChild;
      if (last && last.classList.contains("stack-host") && last.dataset.from === (m.from || "")) {
        const line = document.createElement("div");
        line.className = "msg-line";
        line.dataset.mid = m.id || "";
        fillTextWithLinks(line, m.text || "");
        const time = document.createElement("span");
        time.className = "time";
        time.textContent = formatMsgTime(m.ts);
        line.appendChild(time);
        last.appendChild(line);
        if (scroll) scrollChatToBottom(true);
        updateChatEmpty();
        return;
      }
    }

    const div = document.createElement("div");
    div.dataset.mid = m.id || "";
    if (m.kind === "missed-call" || m.type === "missed-call") {
      div.className = "msg missed-call";
      div.textContent = m.text || "📞 Cevapsız çağrı";
      el.chatLog.appendChild(div);
      if (scroll) scrollChatToBottom(true);
      updateChatEmpty();
      return;
    }
    if (m.type === "system") {
      div.className = "msg system";
      div.textContent = m.text;
    } else if (m.deleted || m.kind === "deleted") {
      div.className = "msg deleted" + (m.from === me.username ? " mine" : "");
      div.textContent = t("msgDeleted");
    } else {
      const mine = m.from === me.username;
      div.className =
        "msg stack-host" +
        (mine ? " mine" : "") +
        (m.kind === "file" ? " file" : "");
      div.dataset.from = m.from || "";
      if (m.replyTo && m.replyTo.text) {
        const ref = document.createElement("div");
        ref.className = "reply-ref";
        ref.textContent = `↩ ${m.replyTo.from || ""}: ${(m.replyTo.text || "").slice(0, 80)}`;
        div.appendChild(ref);
      }
      {
        const head = document.createElement("div");
        head.className = "msg-head";
        const av = document.createElement("div");
        av.className = "avatar sm";
        const letter = (mine ? me.displayName || me.username : m.displayName || m.from || "?")[0].toUpperCase();
        if (mine && el.myAvatarImg && !el.myAvatarImg.hidden && el.myAvatarImg.src) {
          const im = document.createElement("img");
          im.src = el.myAvatarImg.src;
          applyAvatarFrame(im, settings.avatarFrame);
          av.appendChild(im);
        } else if (!mine && remoteAvatars.get(m.from)) {
          const im = document.createElement("img");
          im.src = remoteAvatars.get(m.from);
          av.appendChild(im);
        } else {
          av.textContent = letter;
        }
        av.title = t("openProfile");
        av.addEventListener("click", () => openProfile(mine ? me.username : m.from, mine));
        const who = document.createElement("span");
        who.className = "who";
        who.textContent = mine ? me.displayName || me.username : m.displayName || m.from;
        who.style.cursor = "pointer";
        who.addEventListener("click", () => openProfile(mine ? me.username : m.from, mine));
        head.appendChild(av);
        head.appendChild(who);
        div.appendChild(head);
      }

      appendMsgBodyContent(div, m);

      if (m.reactions && Object.keys(m.reactions).length) {
        const rx = document.createElement("div");
        rx.className = "reactions";
        for (const [emoji, users] of Object.entries(m.reactions)) {
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = `${emoji} ${users.length}`;
          b.addEventListener("click", () => reactToMessage(m.id, emoji));
          rx.appendChild(b);
        }
        div.appendChild(rx);
      }

      // Sağ tık menüsü
      div.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showMsgContext(e.clientX, e.clientY, m);
      });
    }
    el.chatLog.appendChild(div);
    if (scroll) scrollChatToBottom(m.from === me.username);
    updateChatEmpty();
  }

  function hideMsgContext() {
    if (el.msgContextMenu) el.msgContextMenu.hidden = true;
    ctxTargetMessage = null;
  }

  function showMsgContext(x, y, m) {
    if (!el.msgContextMenu) return;
    ctxTargetMessage = m;
    const menu = el.msgContextMenu;
    menu.hidden = false;
    const mine = m.from === me.username;
    const editBtn = menu.querySelector('[data-act="edit"]');
    const delBtn = menu.querySelector('[data-act="delete"]');
    if (editBtn) editBtn.hidden = !mine || m.kind === "file" || m.kind === "gif" || m.kind === "image" || m.kind === "video";
    if (delBtn) delBtn.hidden = !mine;
    const pad = 8;
    const mw = menu.offsetWidth || 160;
    const mh = menu.offsetHeight || 200;
    menu.style.left = Math.min(x, window.innerWidth - mw - pad) + "px";
    menu.style.top = Math.min(y, window.innerHeight - mh - pad) + "px";
  }

  function shouldGroupMessages(prev, curr) {
    if (!prev || !curr) return false;
    if (prev.type === "system" || curr.type === "system") return false;
    if (prev.kind === "missed-call" || curr.kind === "missed-call") return false;
    if (prev.deleted || curr.deleted) return false;
    if (prev.from !== curr.from) return false;
    if ((curr.ts || 0) - (prev.ts || 0) > 5 * 60 * 1000) return false;
    return true;
  }

  async function openProfile(username, isSelf) {
    const un = String(username || "").toLowerCase();
    const self = !!(isSelf || un === me.username);
    let data = self ? me : profileCache.get(un);
    if (!data) {
      const f = friends.find((x) => x.username === un);
      data = {
        username: un,
        displayName: f?.displayName || un,
        about: f?.about || "",
        socials: f?.socials || {},
        status: f?.remoteStatus || "online",
        statusText: f?.statusText || "",
      };
    }
    const avUrl = self ? await api.getAvatar(me.id) : remoteAvatars.get(un);
    el.profileAvatar.innerHTML = "";
    if (avUrl) {
      const im = document.createElement("img");
      im.src = avUrl;
      if (self) applyAvatarFrame(im, settings.avatarFrame);
      el.profileAvatar.appendChild(im);
    } else {
      el.profileAvatar.textContent = (data.displayName || data.username || "?")[0].toUpperCase();
    }
    el.profileDisplay.textContent = data.displayName || data.username;
    el.profileUsername.textContent = "@" + (data.username || un);
    el.profileStatusLine.textContent =
      statusLabel(data.status || "online") + (data.statusText ? " · " + data.statusText : "");

    const ro = $("profile-view-readonly");
    const ed = $("profile-view-edit");
    const saveBtn = $("btn-profile-save");
    if (self) {
      if (ro) ro.hidden = true;
      if (ed) ed.hidden = false;
      if (saveBtn) saveBtn.hidden = false;
      if (el.btnProfileEdit) el.btnProfileEdit.hidden = true;
      const d = $("profile-edit-display");
      const a = $("profile-edit-about");
      if (d) d.value = me.displayName || "";
      if (a) a.value = me.about || "";
      if ($("profile-edit-twitter")) $("profile-edit-twitter").value = me.socials?.twitter || "";
      if ($("profile-edit-youtube")) $("profile-edit-youtube").value = me.socials?.youtube || "";
      if ($("profile-edit-instagram")) $("profile-edit-instagram").value = me.socials?.instagram || "";
      if ($("profile-edit-web")) $("profile-edit-web").value = me.socials?.website || "";
    } else {
      if (ro) ro.hidden = false;
      if (ed) ed.hidden = true;
      if (saveBtn) saveBtn.hidden = true;
      if (el.btnProfileEdit) el.btnProfileEdit.hidden = true;
      el.profileAbout.textContent = data.about || t("noBio");
      el.profileSocials.innerHTML = "";
      const socials = data.socials || {};
      for (const [k, v] of Object.entries(socials)) {
        if (!v) continue;
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.className = "chat-link";
        a.textContent = k + ": " + v;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          confirmAndOpenLink(v.startsWith("http") ? v : "https://" + v);
        });
        li.appendChild(a);
        el.profileSocials.appendChild(li);
      }
      if (!el.profileSocials.children.length) {
        el.profileSocials.innerHTML = `<li>${t("noLinks")}</li>`;
      }
    }
    el.modalProfile.hidden = false;
  }

  async function editMessage(m) {
    const key = chatKey();
    if (!key) return;
    const next = prompt(t("msgEditPrompt"), m.text || "");
    if (next == null) return;
    const text = next.trim();
    if (!text) return;
    await api.updateChat(me.id, key, m.id, { text });
    for (const u of recipientsForChat()) {
      sendTo(u, { type: "chat-edit", id: m.id, text, ts: Date.now(), groupId: activeGroupId });
    }
    await reloadChat();
  }

  async function deleteMessage(m) {
    const key = chatKey();
    if (!key) return;
    if (!confirm(t("msgDeleteConfirm"))) return;
    await api.deleteChat(me.id, key, m.id);
    for (const u of recipientsForChat()) {
      sendTo(u, { type: "chat-delete", id: m.id, groupId: activeGroupId });
    }
    await reloadChat();
  }

  async function reactToMessage(messageId, emoji) {
    const key = chatKey();
    if (!key || !messageId) return;
    for (const u of recipientsForChat()) {
      sendTo(u, { type: "chat-react", id: messageId, emoji, from: me.username, groupId: activeGroupId });
    }
    const history = await api.getChat(me.id, key, 500);
    const msg = history.find((x) => x.id === messageId);
    if (!msg) return;
    const reactions = { ...(msg.reactions || {}) };
    const arr = new Set(reactions[emoji] || []);
    if (arr.has(me.username)) arr.delete(me.username);
    else arr.add(me.username);
    reactions[emoji] = [...arr];
    if (!reactions[emoji].length) delete reactions[emoji];
    await api.updateChat(me.id, key, messageId, { reactions });
    await reloadChat();
  }

  async function pinMessage(m) {
    const key = chatKey();
    if (!key) return;
    let pins = await api.getPins(me.id, key);
    if (pins.some((p) => p.id === m.id)) {
      pins = pins.filter((p) => p.id !== m.id);
      await api.setPins(me.id, key, pins);
      renderPins(pins);
      renderMessage({ type: "system", text: t("pinRemoved") });
      return;
    }
    pins.unshift({
      id: m.id,
      text: (m.text || m.name || "").slice(0, 120),
      from: m.from,
      ts: m.ts,
    });
    await api.setPins(me.id, key, pins.slice(0, 20));
    renderPins(pins);
  }

  function renderPins(pins) {
    if (!el.pinsBar) return;
    if (!pins || !pins.length) {
      el.pinsBar.hidden = true;
      el.pinsList.innerHTML = "";
      return;
    }
    el.pinsBar.hidden = false;
    el.pinsList.innerHTML = "";
    for (const p of pins.slice(0, 8)) {
      const d = document.createElement("div");
      d.className = "pin-item";
      d.textContent = `${p.from}: ${p.text}`;
      const unpin = document.createElement("button");
      unpin.type = "button";
      unpin.textContent = "✕";
      unpin.title = "Sabitlemeyi kaldır";
      unpin.style.marginLeft = "8px";
      unpin.addEventListener("click", async (e) => {
        e.stopPropagation();
        const key = chatKey();
        if (!key) return;
        const next = (await api.getPins(me.id, key)).filter((x) => x.id !== p.id);
        await api.setPins(me.id, key, next);
        renderPins(next);
      });
      d.appendChild(unpin);
      el.pinsList.appendChild(d);
    }
  }

  async function reloadChat() {
    const key = chatKey();
    if (!key) {
      if (el.chatLog) el.chatLog.innerHTML = "";
      updateChatEmpty();
      return;
    }
    el.chatLog.innerHTML = "";
    const history = await api.getChat(me.id, key, 500);
    let prev = null;
    for (const m of history) {
      renderMessage(m, { scroll: false, grouped: shouldGroupMessages(prev, m) });
      prev = m;
    }
    scrollChatToBottom(true);
    const pins = await api.getPins(me.id, key);
    renderPins(pins);
    updateChatEmpty();
    if (el.chatSearch) el.chatSearch.value = "";
    if (el.chatSearchCount) el.chatSearchCount.textContent = "";
  }

  async function persistAndShow(targetKey, message, { show = true } = {}) {
    await api.appendChat(me.id, targetKey, message);
    const visible = chatKey() === targetKey;
    if (show && visible) {
      const history = await api.getChat(me.id, targetKey, 3);
      const prev = history.length >= 2 ? history[history.length - 2] : null;
      renderMessage(message, { grouped: shouldGroupMessages(prev, message) });
      updateChatEmpty();
    }
  }

  async function openGroup(groupId) {
    const g = groups.find((x) => x.id === groupId) || (await api.getGroup(me.id, groupId));
    if (!g) return;
    activeGroupId = g.id;
    activeFriend = null;
    unread.set(g.id, 0);
    el.peerTitle.textContent = g.name;
    el.peerSub.textContent = g.members.map((m) => "@" + m).join(", ");
    el.peerAvatar.textContent = "👥";
    el.remoteTag.textContent = g.name;
    el.stageActions.hidden = false;
    setGroupsPaneVisible(true);
    updateCallButtons();
    renderFriends();
    renderGroups();
    await reloadChat();
  }

  // ---------- audio / mic ----------
  async function ensureMicGraph(forceRebuild = false) {
    if (processedMicStream && !forceRebuild) return processedMicStream;
    if (rawMicStream) {
      rawMicStream.getTracks().forEach((t) => t.stop());
      rawMicStream = null;
    }
    if (audioCtx) {
      try {
        await audioCtx.close();
      } catch {}
      audioCtx = null;
    }
    processedMicStream = null;
    micGain = null;

    // Chromium açık kaynak gürültü engelleme (RNNoise tabanlı) + AEC
    rawMicStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: !!noiseOn,
        autoGainControl: true,
        channelCount: 1,
      },
      video: false,
    });
    audioCtx = new AudioContext();
    // Auto-accept / mesh: kullanıcı jesti yok → context suspended kalabiliyor (sessiz mic)
    if (audioCtx.state === "suspended") {
      try {
        await audioCtx.resume();
      } catch {}
    }
    const src = audioCtx.createMediaStreamSource(rawMicStream);
    micGain = audioCtx.createGain();
    const dest = audioCtx.createMediaStreamDestination();
    src.connect(micGain);
    micGain.connect(dest);
    applyMicVolume(settings.micVolume ?? 100);
    processedMicStream = dest.stream;
    applyMicEnabled();
    return processedMicStream;
  }

  function applyMicEnabled() {
    const on = micOn && !deafened;
    if (processedMicStream) {
      processedMicStream.getAudioTracks().forEach((t) => {
        t.enabled = on;
      });
    }
    if (rawMicStream) {
      rawMicStream.getAudioTracks().forEach((t) => {
        t.enabled = on;
      });
    }
  }

  function applyMicVolume(pct) {
    const v = Math.max(0, Math.min(200, Number(pct) || 100));
    if (el.micVol) el.micVol.value = String(v);
    if (el.micVolVal) el.micVolVal.textContent = v + "%";
    if (micGain) micGain.gain.value = v / 100;
  }

  function applyVoiceVolume(pct) {
    const v = Math.max(0, Math.min(200, Number(pct) || 100));
    if (el.outVol) el.outVol.value = String(v);
    if (el.outVolVal) el.outVolVal.textContent = v + "%";
    const vol = deafened ? 0 : Math.min(1, v / 100);
    if (el.remoteAudio) el.remoteAudio.volume = vol;
    for (const a of peerVoiceEls.values()) {
      a.volume = vol;
      a.muted = !!deafened;
    }
  }

  function applyScreenAudioVolume(pct) {
    const v = Math.max(0, Math.min(200, Number(pct) || 100));
    if (el.screenAudioVol) el.screenAudioVol.value = String(v);
    if (el.screenAudioVolVal) el.screenAudioVolVal.textContent = v + "%";
    if (el.remoteScreenAudio) {
      el.remoteScreenAudio.volume = deafened ? 0 : Math.min(1, v / 100);
    }
  }

  // geriye uyum
  function applyOutputVolume(pct) {
    applyVoiceVolume(pct);
  }

  function setCtrlButton(btn, ico, label, className, title) {
    if (!btn) return;
    btn.className = className;
    btn.title = title || "";
    btn.innerHTML = `<span class="ctrl-ico">${ico}</span><span class="ctrl-label">${label}</span>`;
  }

  function setMicUi() {
    setCtrlButton(
      el.btnMic,
      "🎤",
      "Mic",
      "icon-ctrl " + (micOn && !deafened ? "active-mic" : "muted-mic"),
      micOn && !deafened ? "Mikrofon açık" : "Mikrofon kapalı"
    );
  }

  function setDeafenUi() {
    setCtrlButton(
      el.btnDeafen,
      deafened ? "🔇" : "🔊",
      "Deaf",
      "icon-ctrl" + (deafened ? " deafened" : ""),
      deafened ? "Deafen açık" : "Deafen kapalı"
    );
  }

  function setNoiseUi() {
    setCtrlButton(
      el.btnNoise,
      "🧹",
      "Noise",
      "icon-ctrl" + (noiseOn ? " active-mic" : ""),
      noiseOn ? "Gürültü engelleme açık" : "Gürültü engelleme kapalı"
    );
  }

  function setScreenBtnUi() {
    setCtrlButton(
      el.btnScreen,
      "🖥️",
      "Share",
      "icon-ctrl" + (screenStream ? " active-mic" : ""),
      screenStream ? t("screenShareStop") : t("screenShareStart")
    );
  }

  function toggleMic() {
    if (deafened) {
      // Deafen açıkken mic zaten kapalı; kullanıcı açmaya çalışırsa uyar
      renderMessage({ type: "system", text: t("deafenBlocksMic") });
      return;
    }
    micOn = !micOn;
    applyMicEnabled();
    setMicUi();
  }

  let preDeafenMicOn = true;
  let preDeafenScreenVol = 100;

  function toggleDeafen() {
    if (!deafened) {
      preDeafenOutput = Number(el.outVol.value) || settings.outputVolume || 100;
      preDeafenScreenVol = Number(el.screenAudioVol?.value) || settings.screenAudioVolume || 100;
      preDeafenMicOn = micOn;
      deafened = true;
      micOn = false;
      applyMicEnabled();
      setMicUi();
      // Hem çağrı hem ekran sesi kapansın
      if (el.remoteAudio) {
        el.remoteAudio.volume = 0;
        el.remoteAudio.muted = true;
      }
      if (el.remoteScreenAudio) {
        el.remoteScreenAudio.volume = 0;
        el.remoteScreenAudio.muted = true;
      }
      setPeerVoicesMuted(true);
    } else {
      deafened = false;
      if (el.remoteAudio) el.remoteAudio.muted = false;
      if (el.remoteScreenAudio) el.remoteScreenAudio.muted = false;
      setPeerVoicesMuted(false);
      applyVoiceVolume(preDeafenOutput || settings.outputVolume || 100);
      applyScreenAudioVolume(preDeafenScreenVol || settings.screenAudioVolume || 100);
      micOn = preDeafenMicOn;
      applyMicEnabled();
      setMicUi();
    }
    setDeafenUi();
  }

  async function toggleNoise() {
    noiseOn = !noiseOn;
    setNoiseUi();
    settings.noiseSuppression = noiseOn;
    if (me) await api.saveSettings(me.id, { noiseSuppression: noiseOn });
    // Yeniden bağla (görüşmedeyse stream yenilenir)
    try {
      const old = processedMicStream;
      await ensureMicGraph(true);
      const track = processedMicStream && processedMicStream.getAudioTracks()[0];
      if (inCall && track) {
        const allCalls = new Set([
          ...(mediaCall ? [mediaCall] : []),
          ...mediaCalls.values(),
        ]);
        for (const c of allCalls) {
          try {
            const pc = c.peerConnection || c._pc || c.pc;
            if (!pc) continue;
            const sender = pc.getSenders().find((s) => s.track && s.track.kind === "audio");
            if (sender) await sender.replaceTrack(track).catch(() => {});
          } catch {}
        }
      }
      if (old) {
        /* eski graph kapandı */
      }
      renderMessage({
        type: "system",
        text: noiseOn ? "Gürültü engelleme açıldı (WebRTC/RNNoise)." : "Gürültü engelleme kapatıldı.",
      });
    } catch (e) {
      console.warn(e);
    }
  }

  function cancelTransfer(reason) {
    transferCancelled = true;
    if (activeTransferId && activeFriend) {
      sendTo(activeFriend, { type: "file-abort", id: activeTransferId, reason: reason || "cancelled" });
    }
    if (recvFile) {
      sendTo(recvFile.from, { type: "file-abort", id: recvFile.id, reason: reason || "cancelled" });
      recvFile = null;
    }
    activeTransferId = null;
    sendFileBusy = false;
    hideTransfer();
  }

  // ---------- peer / presence ----------
  function sendTo(username, obj) {
    const c = conns.get(username);
    if (c && c.open) {
      try {
        c.send(obj);
        return true;
      } catch (e) {
        console.warn(e);
      }
    }
    return false;
  }

  function setPresence(username, state) {
    presence.set(username, state);
    renderFriends();
    if (activeFriend === username) {
      setPeerHeader(friends.find((f) => f.username === username));
      updateCallButtons();
    }
  }

  function wireConn(username, conn) {
    if (conns.get(username) === conn && conn._ikBound) return;
    const prev = conns.get(username);
    if (prev && prev !== conn) {
      try {
        prev.close();
      } catch {}
    }
    conns.set(username, conn);
    conn._ikBound = true;

    const onOpen = async () => {
      setPresence(username, inCall && callWith === username ? "busy" : "online");
      const avatar = await api.getAvatar(me.id);
      sendTo(username, {
        type: "hello",
        username: me.username,
        displayName: me.displayName,
        avatar,
        status: me.status || "online",
        statusText: me.statusText || "",
        about: me.about || "",
        socials: me.socials || {},
      });
    };
    if (conn.open) onOpen();
    else conn.on("open", onOpen);

    conn.on("data", (raw) => onData(username, raw));
    conn.on("close", () => {
      if (conns.get(username) === conn) {
        conns.delete(username);
        setPresence(username, "offline");
      }
    });
    conn.on("error", () => {});
  }

  async function onData(username, raw) {
    // binary file chunk
    if (raw instanceof ArrayBuffer || ArrayBuffer.isView(raw)) {
      await onFileBinary(username, raw);
      return;
    }
    let msg = raw;
    if (typeof raw === "string") {
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
    }
    if (!msg || !msg.type) return;

    if (msg.type === "hello") {
      const patch = {};
      if (msg.displayName) patch.displayName = msg.displayName;
      if (msg.status) patch.remoteStatus = msg.status;
      if (msg.statusText != null) patch.statusText = msg.statusText;
      if (msg.about != null) patch.about = msg.about;
      if (msg.socials) patch.socials = msg.socials;
      profileCache.set(username, {
        username,
        displayName: msg.displayName || username,
        about: msg.about || "",
        socials: msg.socials || {},
        status: msg.status || "online",
        statusText: msg.statusText || "",
      });
      if (Object.keys(patch).length) {
        await api.updateFriend(me.id, username, patch);
        friends = await api.listFriends(me.id);
        renderFriends();
      }
      if (msg.avatar) {
        remoteAvatars.set(username, msg.avatar);
        renderFriends();
        if (activeFriend === username) setPeerHeader(friends.find((f) => f.username === username));
      }
      return;
    }

    if (msg.type === "missed-call") {
      const key = msg.groupId || username;
      const fromU = msg.from || username;
      const cooldownKey = `missed:${key}:in:${fromU}`;
      if (!callEventAllowed(cooldownKey, 45000)) return;
      const m = {
        id: crypto.randomUUID(),
        type: "missed-call",
        kind: "missed-call",
        text: `📞 Cevapsız çağrı ← @${fromU}`,
        from: fromU,
        ts: msg.ts || Date.now(),
      };
      await persistAndShow(key, m, { show: chatKey() === key });
      if (chatKey() !== key) {
        unread.set(key, (unread.get(key) || 0) + 1);
        renderFriends();
        renderGroups();
      }
      return;
    }

    if (msg.type === "chat" || msg.type === "gif") {
      const key = msg.groupId || username;
      const m = {
        id: msg.id || crypto.randomUUID(),
        type: "chat",
        kind: msg.type === "gif" ? "gif" : "text",
        text: msg.text || "",
        url: msg.url || null,
        from: username,
        displayName: msg.displayName || username,
        ts: msg.ts || Date.now(),
        replyTo: msg.replyTo || null,
        groupId: msg.groupId || null,
      };
      await persistAndShow(key, m, { show: chatKey() === key });
      if (chatKey() !== key) {
        unread.set(key, (unread.get(key) || 0) + 1);
        renderFriends();
        renderGroups();
        if (settings.desktopNotify !== false) {
          try {
            new Notification(msg.displayName || username, {
              body: (msg.text || "GIF/medya").slice(0, 120),
              silent: true,
            });
          } catch {}
        }
        await playNotifyIfAllowed();
      }
      return;
    }

    if (msg.type === "chat-edit" && msg.id) {
      const key = msg.groupId || username;
      await api.updateChat(me.id, key, msg.id, { text: msg.text });
      if (chatKey() === key) await reloadChat();
      return;
    }
    if (msg.type === "chat-delete" && msg.id) {
      const key = msg.groupId || username;
      await api.deleteChat(me.id, key, msg.id);
      if (chatKey() === key) await reloadChat();
      return;
    }
    if (msg.type === "chat-react" && msg.id) {
      const key = msg.groupId || username;
      const history = await api.getChat(me.id, key, 500);
      const found = history.find((x) => x.id === msg.id);
      if (found) {
        const reactions = { ...(found.reactions || {}) };
        const arr = new Set(reactions[msg.emoji] || []);
        if (arr.has(msg.from)) arr.delete(msg.from);
        else arr.add(msg.from);
        reactions[msg.emoji] = [...arr];
        if (!reactions[msg.emoji].length) delete reactions[msg.emoji];
        await api.updateChat(me.id, key, msg.id, { reactions });
        if (chatKey() === key) await reloadChat();
      }
      return;
    }
    if (msg.type === "presence") {
      // durum bilgisi
      await api.updateFriend(me.id, username, {
        remoteStatus: msg.status,
        statusText: msg.statusText || "",
      });
      friends = await api.listFriends(me.id);
      renderFriends();
      return;
    }

    if (msg.type === "group-call-invite") {
      // bilgi — asıl ses peer.call ile gelir
      if (msg.groupId) {
        // grup listesinde yoksa yerel kayıt yok; yine de arama gelecek
      }
      return;
    }

    if (msg.type === "file-start") {
      const kind = msg.mediaKind || mediaKind(msg.name);
      // Her dosya için alıcı onayı
      const ok = await askFileOffer({
        kind,
        name: msg.name,
        size: msg.size,
        from: username,
      });
      if (!ok) {
        sendTo(username, { type: "file-abort", id: msg.id });
        if (activeFriend === username) {
          renderMessage({ type: "system", text: `${t("fileDeclined")}: ${msg.name}` });
        }
        return;
      }
      const savePath = await api.saveFileStart(msg.name, true);
      if (!savePath) {
        sendTo(username, { type: "file-abort", id: msg.id });
        return;
      }
      recvFile = {
        id: msg.id,
        name: msg.name,
        size: msg.size,
        mime: msg.mime,
        mediaKind: kind,
        savePath,
        offset: 0,
        from: username,
      };
      showTransfer(`Alınıyor: ${msg.name}`, 0, `0 / ${fmtSize(msg.size)}`);
      if (activeFriend === username) {
        renderMessage({
          type: "system",
          text: `Dosya alınıyor: ${msg.name} (${fmtSize(msg.size)})…`,
        });
      }
      sendTo(username, { type: "file-ready", id: msg.id });
      return;
    }

    if (msg.type === "file-chunk" && recvFile && recvFile.id === msg.id && msg.b64) {
      try {
        await api.saveFileChunk(recvFile.savePath, msg.b64, msg.offset || recvFile.offset);
        const len = msg.len || 0;
        recvFile.offset = (msg.offset || 0) + len;
        const pct = recvFile.size ? (recvFile.offset / recvFile.size) * 100 : 0;
        showTransfer(
          `Alınıyor: ${recvFile.name}`,
          pct,
          `${fmtSize(recvFile.offset)} / ${fmtSize(recvFile.size)}`
        );
        sendTo(username, { type: "file-ack", id: recvFile.id, offset: recvFile.offset });
      } catch (e) {
        console.error(e);
        sendTo(username, { type: "file-abort", id: msg.id });
        hideTransfer();
        recvFile = null;
      }
      return;
    }

    if (msg.type === "file-end" && recvFile && recvFile.id === msg.id) {
      let previewUrl = null;
      const kind = recvFile.mediaKind || mediaKind(recvFile.name);
      if (kind === "image" || kind === "video") {
        try {
          const prev = await api.filePreview(recvFile.savePath);
          if (prev && prev.dataUrl) previewUrl = prev.dataUrl;
        } catch {}
      }
      const done = {
        id: crypto.randomUUID(),
        type: "chat",
        kind: kind === "image" || kind === "video" ? kind : "file",
        name: recvFile.name,
        size: recvFile.size,
        localPath: recvFile.savePath,
        previewUrl,
        from: username,
        displayName: username,
        ts: Date.now(),
      };
      showTransfer(`Tamamlandı: ${recvFile.name}`, 100, fmtSize(recvFile.size));
      setTimeout(hideTransfer, 2500);
      await persistAndShow(username, done);
      recvFile = null;
      return;
    }

    if (msg.type === "file-abort") {
      if (recvFile && recvFile.id === msg.id) recvFile = null;
      if (activeTransferId === msg.id) {
        transferCancelled = true;
        activeTransferId = null;
      }
      hideTransfer();
      if (activeFriend === username) {
        renderMessage({ type: "system", text: t("fileTransferAbort") });
      }
      window.dispatchEvent(new CustomEvent("file-abort", { detail: msg }));
      return;
    }

    if (msg.type === "file-ready" || msg.type === "file-ack") {
      window.dispatchEvent(new CustomEvent(msg.type, { detail: msg }));
      return;
    }

    if (msg.type === "screen-stop") {
      el.remoteVideo.srcObject = null;
      el.remotePh.hidden = false;
    }
  }

  async function tryConnect(username) {
    if (!peer || peer.destroyed) return;
    const c = conns.get(username);
    if (c && c.open) return;
    try {
      const pid = await peerIdOf(username);
      const conn = peer.connect(pid, { reliable: true });
      wireConn(username, conn);
    } catch {}
  }

  function startPresenceLoop() {
    clearInterval(presenceTimer);
    presenceTimer = setInterval(() => {
      for (const f of friends) tryConnect(f.username);
    }, 4000);
  }

  function buildPeerOptions(myPid) {
    const base = { debug: 0, config: ICE };
    const s = signalCfg;
    if (s && s.enabled !== false && s.host) {
      return {
        ...base,
        host: s.host,
        port: Number(s.port) || 9000,
        path: s.peerPath || "/peerjs",
        secure: !!s.secure,
        // key not required for self-hosted peer
      };
    }
    // Public PeerJS cloud (fallback)
    return base;
  }

  function startSignalPresence() {
    if (stopPresenceWs) {
      try {
        stopPresenceWs();
      } catch {}
      stopPresenceWs = null;
    }
    const s = signalCfg;
    if (!s || s.enabled === false || !s.host || !window.HearthPresence) return;
    const proto = s.secure ? "wss" : "ws";
    const port = Number(s.port) || 9000;
    const ppath = s.presencePath || "/presence";
    const url = `${proto}://${s.host}:${port}${ppath}`;
    stopPresenceWs = window.HearthPresence.connect({
      url,
      username: me.username,
      displayName: me.displayName,
      status: me.status || "online",
      statusText: me.statusText || "",
      onRoster: (roster) => {
        for (const [un, meta] of roster) {
          if (un === me.username) continue;
          if (meta.status === "invisible" || meta.status === "offline") {
            presence.set(un, "offline");
          } else {
            presence.set(un, "online");
          }
          const f = friends.find((x) => x.username === un);
          if (f) {
            f.remoteStatus = meta.status || "online";
            f.statusText = meta.statusText || "";
          }
        }
        // roster'da olmayan online'ları offline yapma — Peer bağlantısı da var
        renderFriends();
      },
      onStatus: (msg) => {
        if (!msg.username || msg.username === me.username) return;
        const st = msg.status === "invisible" || msg.status === "offline" ? "offline" : "online";
        presence.set(msg.username, st);
        const f = friends.find((x) => x.username === msg.username);
        if (f) {
          f.remoteStatus = msg.status || "online";
          f.statusText = msg.statusText || "";
        }
        renderFriends();
        if (activeFriend === msg.username) setPeerHeader(f);
      },
    });
  }

  async function startPeerNetwork() {
    if (peer) {
      try {
        peer.destroy();
      } catch {}
      peer = null;
    }
    conns.clear();
    const myPid = await peerIdOf(me.username);
    el.netStatus.textContent = t("netConnecting");

    const peerOpts = buildPeerOptions(myPid);
    const usingOwn = !!(signalCfg && signalCfg.enabled !== false && signalCfg.host);
    peer = new Peer(myPid, peerOpts);

    peer.on("open", async (id) => {
      el.netStatus.textContent = usingOwn
        ? cloudMode
          ? t("netSignalCloud")
          : t("netSignal")
        : cloudMode
          ? t("netP2pCloud")
          : t("netOnline");
      for (const f of friends) tryConnect(f.username);
      startPresenceLoop();
      startSignalPresence();
      if (cloudMode && window.HearthCloud?.isEnabled()) {
        try {
          await window.HearthCloud.updateProfile({ peerId: id });
        } catch (e) {
          console.warn(e);
        }
      }
    });

    peer.on("connection", (conn) => {
      // Arkadaş listesinde olmasa bile kabul et; hello ile kullanıcı adını öğrenip ekleriz
      let bound = false;
      // Geçici hello handler — tryBind sonrası kaldırılır (çifte onData engeli)
      const tempDataHandler = (raw) => {
        let msg = raw;
        if (typeof raw === "string") {
          try {
            msg = JSON.parse(raw);
          } catch {
            return;
          }
        }
        if (msg && msg.type === "hello" && msg.username) {
          tryBind(msg.username).then(() => onData(String(msg.username).toLowerCase(), msg));
        }
      };
      const removeTemp = () => {
        try {
          if (typeof conn.off === "function") conn.off("data", tempDataHandler);
          else if (typeof conn.removeListener === "function") conn.removeListener("data", tempDataHandler);
        } catch {}
      };
      const tryBind = async (username) => {
        if (bound || !username) return;
        bound = true;
        removeTemp();
        const un = String(username).toLowerCase();
        if (!friends.some((f) => f.username === un) && un !== me.username) {
          try {
            await api.addFriend(me.id, un);
            friends = await api.listFriends(me.id);
            renderFriends();
          } catch {
            /* zaten var */
          }
        }
        wireConn(un, conn);
      };

      // Önce bilinen peer id ile eşleştir
      (async () => {
        for (const f of friends) {
          const pid = await peerIdOf(f.username);
          if (pid === conn.peer) {
            await tryBind(f.username);
            return;
          }
        }
      })();

      conn.on("data", tempDataHandler);

      conn.on("open", async () => {
        const avatar = await api.getAvatar(me.id);
        try {
          conn.send({
            type: "hello",
            username: me.username,
            displayName: me.displayName,
            avatar,
          });
        } catch {}
      });
    });

    peer.on("call", async (call) => {
      let fromUser = (call.metadata && call.metadata.from) || null;
      if (!fromUser) {
        for (const f of friends) {
          const pid = await peerIdOf(f.username);
          if (pid === call.peer) {
            fromUser = f.username;
            break;
          }
        }
      }
      if (!fromUser) {
        call.close();
        return;
      }

      const kind = (call.metadata && call.metadata.kind) || "audio";
      const groupId = call.metadata && call.metadata.groupId;

      if (kind === "screen" || kind === "screen-audio") {
        // Tek stream yolu — onMediaStream ÇAĞIRMA (çifte srcObject ezmesi, Fable 5 §1.4)
        call.answer();
        const expectAudio = !!(call.metadata && call.metadata.hasAudio);
        let gotAudio = false;
        let audioWaitTimer = null;
        const attachScreenAudio = (track) => {
          if (!el.remoteScreenAudio || !track) return;
          const cur = el.remoteScreenAudio.srcObject;
          const existing =
            cur && typeof cur.getAudioTracks === "function" ? cur.getAudioTracks() : [];
          if (existing.some((x) => x.id === track.id)) return;
          el.remoteScreenAudio.srcObject = new MediaStream([
            ...existing.filter((x) => x.readyState === "live"),
            track,
          ]);
          el.remoteScreenAudio.muted = !!deafened;
          el.remoteScreenAudio.volume = deafened
            ? 0
            : Math.min(1, (settings.screenAudioVolume ?? 100) / 100);
          el.remoteScreenAudio.play().catch(() => {});
          gotAudio = true;
          if (audioWaitTimer) {
            clearTimeout(audioWaitTimer);
            audioWaitTimer = null;
          }
        };
        call.on("stream", (stream) => {
          const vtracks = stream.getVideoTracks();
          if (vtracks.length) {
            el.remoteVideo.srcObject = new MediaStream(vtracks);
            el.remotePh.hidden = true;
            setMediaDockVisible(true);
            if (el.fsRemote && el.fsMedia && !el.fsMedia.hidden) {
              el.fsRemote.srcObject = el.remoteVideo.srcObject;
            }
          }
          stream.getAudioTracks().forEach(attachScreenAudio);
          try {
            stream.onaddtrack = (ev) => {
              if (ev.track && ev.track.kind === "audio") attachScreenAudio(ev.track);
            };
          } catch {}
          try {
            const pc = call.peerConnection || call._pc || call.pc;
            if (pc) {
              pc.ontrack = (ev) => {
                if (ev.track && ev.track.kind === "audio") attachScreenAudio(ev.track);
              };
            }
          } catch {}
          if (expectAudio && !gotAudio) {
            audioWaitTimer = setTimeout(() => {
              if (!gotAudio) {
                renderMessage({
                  type: "system",
                  text: t("screenAudioMissing") || "Ekran sesi alınamadı.",
                });
              }
            }, 3000);
          }
        });
        call.on("close", () => {
          if (audioWaitTimer) clearTimeout(audioWaitTimer);
          if (kind === "screen") {
            releaseMediaElement(el.remoteVideo);
            el.remotePh.hidden = false;
            if (el.remotePh) el.remotePh.textContent = t("noScreen") || "Ekran yok";
            releaseMediaElement(el.remoteScreenAudio);
          }
        });
        return;
      }

      // Aynı grup mesh: görüşmedeyken ek peer'ı otomatik kabul
      if (inCall && groupId && activeGroupId === groupId) {
        try {
          const stream = await ensureMicGraph();
          call.answer(stream);
          mediaCalls.set(fromUser, call);
          call.on("stream", (s) => onMediaStream(s, { isScreen: false, fromUser }));
          call.on("close", () => {
            mediaCalls.delete(fromUser);
            peerVoiceEls.delete(fromUser);
          });
        } catch {
          call.close();
        }
        return;
      }

      if (inCall || incomingCall) {
        // Meşgul: ikinci gelen çağrıyı reddet (üzerine yazma)
        try {
          call.close();
        } catch {}
        return;
      }
      incomingCall = call;
      callWith = fromUser;
      if (groupId) activeGroupId = groupId;
      el.incomingBar.hidden = false;
      el.incomingText.textContent = groupId
        ? `${fromUser} ${t("groupIncoming")}`
        : `${fromUser} ${t("incomingCall")}`;
      playIncomingRing();
      api.notifyIncoming();
      if (!groupId && activeFriend !== fromUser) openFriend(fromUser);

      // 30 sn cevap yok → cevapsız
      clearTimeout(incomingRingTimer);
      incomingRingTimer = setTimeout(() => {
        if (incomingCall === call) {
          const fu = fromUser;
          const gid = groupId;
          rejectCall();
          appendMissedCall(gid || fu, fu, "in");
        }
      }, 30000);
      call.on("close", () => {
        if (incomingCall === call) {
          clearTimeout(incomingRingTimer);
          incomingRingTimer = null;
          stopRings();
          el.incomingBar.hidden = true;
          incomingCall = null;
          callWith = null;
        }
      });
    });

    peer.on("disconnected", () => {
      el.netStatus.textContent = t("netReconnecting");
      try {
        peer.reconnect();
      } catch {}
    });

    peer.on("error", (err) => {
      if (err.type === "peer-unavailable") return;
      if (err.type === "unavailable-id") {
        el.netStatus.textContent = t("netIdBusy");
      }
    });
  }

  // ---------- chat open ----------
  async function openFriend(username) {
    activeFriend = username;
    activeGroupId = null;
    unread.set(username, 0);
    const f = friends.find((x) => x.username === username);
    setPeerHeader(f);
    renderFriends();
    renderGroups();
    await reloadChat();
    updateCallButtons();
    tryConnect(username);
  }

  function recipientsForChat() {
    if (activeGroupId) {
      const g = groups.find((x) => x.id === activeGroupId);
      return g ? g.members.filter((m) => m !== me.username) : [];
    }
    return activeFriend ? [activeFriend] : [];
  }

  async function sendChatText(text) {
    const key = chatKey();
    if (!key || !text) return;
    const m = {
      id: crypto.randomUUID(),
      type: "chat",
      kind: "text",
      text,
      from: me.username,
      displayName: me.displayName,
      ts: Date.now(),
      replyTo: replyTo,
      groupId: activeGroupId || null,
    };
    await persistAndShow(key, m);
    let any = false;
    for (const u of recipientsForChat()) {
      if (
        sendTo(u, {
          type: "chat",
          id: m.id,
          text,
          displayName: me.displayName,
          ts: m.ts,
          replyTo,
          groupId: activeGroupId || null,
        })
      )
        any = true;
    }
    if (!any && recipientsForChat().length) {
      renderMessage({ type: "system", text: t("msgSavedOffline") });
    }
    replyTo = null;
    el.chatInput.placeholder = "Mesaj yaz…";
  }

  async function sendGif(url) {
    if (!url) return;
    const key = chatKey();
    if (!key) return;
    const m = {
      id: crypto.randomUUID(),
      type: "chat",
      kind: "gif",
      url,
      text: "",
      from: me.username,
      displayName: me.displayName,
      ts: Date.now(),
      groupId: activeGroupId || null,
    };
    await persistAndShow(key, m);
    for (const u of recipientsForChat()) {
      sendTo(u, {
        type: "gif",
        url,
        displayName: me.displayName,
        ts: m.ts,
        id: m.id,
        groupId: activeGroupId || null,
      });
    }
  }

  // ---------- file P2P (base64 JSON chunks — güvenilir) ----------
  function waitEvent(name, predicate, timeoutMs) {
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        window.removeEventListener(name, onEv);
        resolve(null);
      }, timeoutMs);
      function onEv(ev) {
        if (predicate(ev.detail)) {
          clearTimeout(t);
          window.removeEventListener(name, onEv);
          resolve(ev.detail);
        }
      }
      window.addEventListener(name, onEv);
    });
  }

  async function sendFile(preselected) {
    if (!activeFriend) {
      renderMessage({ type: "system", text: t("selectChatFirst") });
      return;
    }
    // Önceki transfer kilitli kaldıysa serbest bırak (decline sonrası)
    if (sendFileBusy) {
      sendFileBusy = false;
      transferCancelled = false;
      activeTransferId = null;
      hideTransfer();
    }
    const conn = conns.get(activeFriend);
    if (!conn || !conn.open) {
      renderMessage({ type: "system", text: t("fileNeedOnline") });
      return;
    }
    const file = preselected || (await api.pickFile());
    if (!file) return;

    sendFileBusy = true;
    transferCancelled = false;
    const id = crypto.randomUUID();
    activeTransferId = id;
    const chunkSize = 48 * 1024;
    const WINDOW = 16;

    // Decline anında beklemeden çık
    const onAbortEv = (ev) => {
      const m = ev.detail;
      if (m && m.id === id) {
        transferCancelled = true;
        window.dispatchEvent(new CustomEvent("file-ready", { detail: { id, aborted: true } }));
      }
    };
    window.addEventListener("file-abort", onAbortEv);

    try {
      const mKind = mediaKind(file.name);
      sendTo(activeFriend, {
        type: "file-start",
        id,
        name: file.name,
        size: file.size,
        mime: "application/octet-stream",
        mediaKind: mKind,
      });
      showTransfer(`${t("fileSending")}: ${file.name}`, 0, `0 / ${fmtSize(file.size)}`);
      renderMessage({
        type: "system",
        text: `${t("fileSending")}: ${file.name} (${fmtSize(file.size)})…`,
      });

      const ready = await waitEvent("file-ready", (m) => m && m.id === id, 120000);
      if (!ready || ready.aborted || transferCancelled) {
        renderMessage({
          type: "system",
          text: transferCancelled || ready?.aborted ? t("fileRejected") : t("fileNotReady"),
        });
        hideTransfer();
        return;
      }

      let offset = 0;
      let acked = 0;
      const onAck = (ev) => {
        const m = ev.detail;
        if (!m || m.id !== id) return;
        acked = Math.max(acked, m.offset || 0);
      };
      window.addEventListener("file-ack", onAck);

      while (offset < file.size) {
        if (transferCancelled) throw new Error("İptal edildi");
        // Kaydırmalı pencere: ACK geride kaldıysa bekle (upload'u boğmadan doldur)
        while (offset - acked >= WINDOW * chunkSize) {
          if (transferCancelled) throw new Error("İptal edildi");
          await new Promise((r) => setTimeout(r, 4));
        }
        const length = Math.min(chunkSize, file.size - offset);
        const chunk = await api.readFileChunk(file.path, offset, length);
        if (!chunk || !chunk.b64) throw new Error("Dosya okunamadı");

        const start = offset;
        const ok = sendTo(activeFriend, {
          type: "file-chunk",
          id,
          offset: start,
          len: chunk.len,
          b64: chunk.b64,
        });
        if (!ok) throw new Error("Bağlantı koptu");

        offset += chunk.len;
        showTransfer(
          `Gönderiliyor: ${file.name}`,
          (offset / file.size) * 100,
          `${fmtSize(offset)} / ${fmtSize(file.size)}`
        );
        // event loop
        if (offset % (chunkSize * 4) === 0) await new Promise((r) => setTimeout(r, 0));
      }

      const deadline = Date.now() + 30000;
      while (acked < file.size && Date.now() < deadline && !transferCancelled) {
        await new Promise((r) => setTimeout(r, 20));
      }
      window.removeEventListener("file-ack", onAck);

      if (transferCancelled) throw new Error("İptal edildi");
      sendTo(activeFriend, { type: "file-end", id });
      showTransfer(`✓ ${file.name}`, 100, fmtSize(file.size));

      let previewUrl = null;
      if (mKind === "image" || mKind === "video") {
        try {
          const prev = await api.filePreview(file.path);
          if (prev && prev.dataUrl) previewUrl = prev.dataUrl;
        } catch {}
      }
      await persistAndShow(activeFriend, {
        id: crypto.randomUUID(),
        type: "chat",
        kind: mKind === "image" || mKind === "video" ? mKind : "file",
        name: file.name,
        size: file.size,
        localPath: file.path,
        previewUrl,
        from: me.username,
        displayName: me.displayName,
        ts: Date.now(),
      });
      setTimeout(hideTransfer, 1500);
    } catch (e) {
      console.error(e);
      try {
        sendTo(activeFriend, { type: "file-abort", id });
      } catch {}
      hideTransfer();
      renderMessage({ type: "system", text: "Dosya: " + (e.message || e) });
    } finally {
      window.removeEventListener("file-abort", onAbortEv);
      sendFileBusy = false;
      activeTransferId = null;
      transferCancelled = false;
    }
  }

  // ---------- calls / screen ----------
  /** @type {Map<string, number>} same chat/friend rate-limit for missed / end msgs */
  const callEventCooldown = new Map();
  function callEventAllowed(key, ms = 45000) {
    const now = Date.now();
    const prev = callEventCooldown.get(key) || 0;
    if (now - prev < ms) return false;
    callEventCooldown.set(key, now);
    return true;
  }

  function startCallTimer() {
    callStartedAt = Date.now();
    clearInterval(callTimerIv);
    if (el.callTimer) el.callTimer.textContent = "00:00";
    callTimerIv = setInterval(() => {
      const s = Math.floor((Date.now() - callStartedAt) / 1000);
      if (el.callTimer) {
        el.callTimer.textContent =
          String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
      }
    }, 500);
  }

  function stopCallTimer() {
    clearInterval(callTimerIv);
    callTimerIv = null;
    if (el.callTimer) el.callTimer.textContent = "00:00";
  }

  function showRingingTimer() {
    stopCallTimer();
    if (el.callTimer) el.callTimer.textContent = "…";
  }

  /** Toju invariant: stop tracks + null srcObject so Chromium releases buffers */
  function releaseMediaElement(elMedia) {
    if (!elMedia) return;
    try {
      const s = elMedia.srcObject;
      if (s && typeof s.getTracks === "function") {
        s.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      }
    } catch {}
    try {
      elMedia.pause?.();
    } catch {}
    elMedia.srcObject = null;
  }

  function endCallUi() {
    inCall = false;
    callWith = null;
    setMediaDockVisible(false);
    releaseMediaElement(el.remoteVideo);
    releaseMediaElement(el.localVideo);
    releaseMediaElement(el.remoteAudio);
    releaseMediaElement(el.remoteScreenAudio);
    clearPeerVoices();
    el.remotePh.hidden = false;
    el.localPh.hidden = false;
    if (el.remotePh) el.remotePh.textContent = t("noScreen") || "Ekran yok";
    if (el.localPh) el.localPh.textContent = t("you") || "Sen";
    stopCallTimer();
    setScreenBtnUi();
    exitFullscreenMedia();
    updateCallButtons();
    renderFriends();
  }

  function applyMediaLayout(mode) {
    const m = mode || el.mediaLayout?.value || "both";
    if (el.mediaVideos) {
      el.mediaVideos.classList.remove("layout-remote", "layout-local", "layout-both");
      if (m === "remote") el.mediaVideos.classList.add("layout-remote");
      else if (m === "local") el.mediaVideos.classList.add("layout-local");
    }
    if (el.fsVideos) {
      el.fsVideos.classList.remove("layout-remote", "layout-local");
      if (m === "remote") el.fsVideos.classList.add("layout-remote");
      else if (m === "local") el.fsVideos.classList.add("layout-local");
    }
    if (el.mediaLayout) el.mediaLayout.value = m;
    if (el.fsLayout) el.fsLayout.value = m;
  }

  function enterFullscreenMedia() {
    if (!el.fsMedia) return;
    el.fsMedia.hidden = false;
    // Aynı stream'leri tam ekran videolara bağla
    el.fsRemote.srcObject = el.remoteVideo.srcObject;
    el.fsLocal.srcObject = el.localVideo.srcObject;
    applyMediaLayout(el.mediaLayout?.value || "both");
    const req =
      el.fsMedia.requestFullscreen ||
      el.fsMedia.webkitRequestFullscreen ||
      el.fsMedia.msRequestFullscreen;
    if (req) {
      try {
        req.call(el.fsMedia);
      } catch {}
    }
  }

  function exitFullscreenMedia() {
    if (!el.fsMedia) return;
    el.fsMedia.hidden = true;
    el.fsRemote.srcObject = null;
    el.fsLocal.srcObject = null;
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen();
      } catch {}
    }
  }

  function hangup() {
    // Giden zil sırasında kapat → cevapsız
    if (outboundRing && !outboundRing.answered && !outboundRing.finished) {
      finishOutboundAsMissed("cancel");
      return;
    }
    const was = inCall || mediaCall || mediaCalls.size;
    inCall = false;
    stopRings();
    clearTimeout(callRingTimer);
    clearTimeout(incomingRingTimer);
    incomingRingTimer = null;
    outboundRing = null;
    el.mediaDock?.classList.remove("outgoing-ring-ui");
    // screen-stop: mediaCalls clear ÖNCE tüm katılımcılara
    if (was) {
      const notify = new Set();
      if (callWith) notify.add(callWith);
      for (const u of mediaCalls.keys()) notify.add(u);
      for (const u of notify) sendTo(u, { type: "screen-stop" });
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      screenStream = null;
    }
    if (screenCall) {
      try {
        screenCall.close();
      } catch {}
      screenCall = null;
    }
    for (const [, c] of screenCalls) {
      try {
        c.close();
      } catch {}
    }
    screenCalls.clear();
    for (const [, c] of mediaCalls) {
      try {
        c.close();
      } catch {}
    }
    mediaCalls.clear();
    clearPeerVoices();
    if (mediaCall) {
      const c = mediaCall;
      mediaCall = null;
      try {
        c.close();
      } catch {}
    }
    if (incomingCall) {
      try {
        incomingCall.close();
      } catch {}
      incomingCall = null;
    }
    el.incomingBar.hidden = true;
    const friend = callWith;
    endCallUi();
    if (was && friend) setPresence(friend, conns.get(friend)?.open ? "online" : "offline");
    if (was) {
      const endKey = "end:" + (friend || activeFriend || activeGroupId || "x");
      if (callEventAllowed(endKey, 8000)) {
        renderMessage({ type: "system", text: t("callEnded") || "Görüşme sona erdi." });
      }
    }
  }

  function onMediaStream(stream, { isScreen = false, fromUser = null } = {}) {
    const audio = stream.getAudioTracks();
    const video = stream.getVideoTracks();
    if (audio.length) {
      if (isScreen && el.remoteScreenAudio) {
        el.remoteScreenAudio.srcObject = new MediaStream(audio);
        el.remoteScreenAudio.play().catch(() => {});
        applyScreenAudioVolume(settings.screenAudioVolume ?? 100);
      } else if (fromUser) {
        // Her peer ayrı ses — grupta üst üste binmesin
        attachPeerVoice(fromUser, stream);
        applyVoiceVolume(settings.outputVolume ?? 100);
      } else {
        el.remoteAudio.srcObject = new MediaStream(audio);
        el.remoteAudio.play().catch(() => {});
        applyVoiceVolume(settings.outputVolume ?? 100);
      }
    }
    if (video.length) {
      el.remoteVideo.srcObject = new MediaStream(video);
      el.remotePh.hidden = true;
      setMediaDockVisible(true);
      if (el.fsRemote && !el.fsMedia.hidden) el.fsRemote.srcObject = el.remoteVideo.srcObject;
    }
  }

  function bindMediaCall(call, friendUsername) {
    mediaCall = call;
    mediaCalls.set(friendUsername, call);
    inCall = true;
    callWith = friendUsername;
    setPresence(friendUsername, "busy");
    setMediaDockVisible(true);
    updateCallButtons();
    call.on("stream", (stream) => {
      stopRings();
      // Timer yalnızca medya aktıktan sonra (aranıyor süresini sayma)
      if (!callTimerIv) startCallTimer();
      onMediaStream(stream, { isScreen: false, fromUser: friendUsername });
    });
    call.on("close", () => {
      mediaCalls.delete(friendUsername);
      peerVoiceEls.get(friendUsername)?.pause();
      peerVoiceEls.delete(friendUsername);
      if (!mediaCalls.size && mediaCall === call) hangup();
      else if (mediaCall === call) mediaCall = null;
    });
    call.on("error", () => {
      mediaCalls.delete(friendUsername);
      if (!mediaCalls.size) hangup();
    });
  }

  async function appendMissedCall(targetKey, withUser, direction) {
    const cooldownKey = `missed:${targetKey}:${direction}:${withUser}`;
    if (!callEventAllowed(cooldownKey, 45000)) return false;
    const text =
      direction === "out"
        ? `📞 Cevapsız çağrı → @${withUser}`
        : `📞 Cevapsız çağrı ← @${withUser}`;
    const m = {
      id: crypto.randomUUID(),
      type: "missed-call",
      kind: "missed-call",
      text,
      // Gelen cevapsız: from = arayan; giden: from = ben
      from: direction === "in" ? withUser : me.username,
      ts: Date.now(),
    };
    await persistAndShow(targetKey, m);
    return true;
  }

  /** Giden arama: 30 sn zil UI (offline olsa bile), sonra cevapsız */
  let outboundRing = null; // { target, groupId, answered }
  /** Gelen arama 30 sn timeout */
  let incomingRingTimer = null;

  function showOutgoingRingUI(label) {
    inCall = true;
    setMediaDockVisible(true);
    el.mediaDock.classList.add("outgoing-ring-ui");
    if (el.remotePh) {
      el.remotePh.hidden = false;
      el.remotePh.textContent = label || "Aranıyor…";
    }
    if (el.localPh) el.localPh.hidden = false;
    showRingingTimer();
    updateCallButtons();
    playOutgoingRing();
  }

  async function finishOutboundAsMissed(reason) {
    if (!outboundRing || outboundRing.finished) return;
    outboundRing.finished = true;
    const { target, groupId } = outboundRing;
    const key = groupId || target;
    clearTimeout(callRingTimer);
    stopRings();
    outboundRing = null;
    // hangup UI without double-missed
    inCall = false;
    el.mediaDock.classList.remove("outgoing-ring-ui");
    endCallUi();
    const added = await appendMissedCall(key, target, "out");
    sendTo(target, {
      type: "missed-call",
      from: me.username,
      displayName: me.displayName,
      groupId: groupId || null,
      ts: Date.now(),
    });
    if (chatKey() === key && added) {
      const reasonText =
        reason === "cancel"
          ? "Arama iptal edildi."
          : reason === "offline" || reason === "no-data"
            ? "Karşı taraf P2P’ye bağlı değil (signal/peer). Tek cevapsız kaydı."
            : reason === "error" || reason === "fail"
              ? "Arama kurulamadı (bağlantı hatası)."
              : reason === "busy"
                ? "Karşı taraf meşgul görünüyor."
                : "Cevap yok — cevapsız çağrı.";
      renderMessage({ type: "system", text: reasonText });
    }
  }

  async function startCall() {
    if (activeGroupId) {
      const g = groups.find((x) => x.id === activeGroupId);
      if (g) return startGroupCall(g);
    }
    if (!activeFriend || inCall) return;
    if (!peer || peer.destroyed) {
      renderMessage({ type: "system", text: t("netConnecting") });
      return;
    }
    const target = activeFriend;
    const st = presence.get(target) || "offline";
    // Data channel yokken bile MediaConnection (peer.call) dene —
    // şehirler arası public PeerJS için şart (chat conn gecikebilir)
    try {
      await tryConnect(target);
    } catch {}

    outboundRing = { target, groupId: null, answered: false, finished: false };
    let ringLabel = `@${target} ${t("calling")}`;
    if (st === "busy") ringLabel = `@${target} — ${t("busy")}`;
    if (st === "offline") ringLabel = `@${target} — ${t("offline")}`;
    showOutgoingRingUI(ringLabel);

    clearTimeout(callRingTimer);
    callRingTimer = setTimeout(() => {
      if (outboundRing && !outboundRing.answered && !outboundRing.finished) {
        finishOutboundAsMissed(st === "offline" ? "offline" : "timeout");
      }
    }, 30000);

    try {
      const stream = await ensureMicGraph();
      const pid = await peerIdOf(target);
      const call = peer.call(pid, stream, { metadata: { kind: "audio", from: me.username } });
      if (!call) {
        await finishOutboundAsMissed("fail");
        return;
      }
      mediaCall = call;
      callWith = target;
      call.on("stream", (stream) => {
        if (outboundRing) outboundRing.answered = true;
        clearTimeout(callRingTimer);
        stopRings();
        el.mediaDock.classList.remove("outgoing-ring-ui");
        bindMediaCall(call, target);
        if (!callTimerIv) startCallTimer();
        onMediaStream(stream, { isScreen: false });
      });
      call.on("close", () => {
        if (outboundRing && !outboundRing.answered && !outboundRing.finished) {
          finishOutboundAsMissed("close");
        } else if (mediaCall === call || inCall) hangup();
      });
      call.on("error", () => {
        if (outboundRing && !outboundRing.answered) finishOutboundAsMissed("error");
      });
    } catch (e) {
      stopRings();
      outboundRing = null;
      endCallUi();
      renderMessage({ type: "system", text: t("micNeeded") });
    }
  }

  async function startGroupCall(g) {
    if (!g || inCall) return;
    activeGroupId = g.id;
    activeFriend = null;
    try {
      const stream = await ensureMicGraph();
      playOutgoingRing();
      inCall = true;
      callWith = null;
      setMediaDockVisible(true);
      showRingingTimer();
      updateCallButtons();
      if (el.callMembersLabel) el.callMembersLabel.textContent = g.members.join(", ");

      // Mesh: her çevrimiçi üyeyi ara + data ile gruba davet
      for (const member of g.members) {
        if (member === me.username) continue;
        sendTo(member, {
          type: "group-call-invite",
          groupId: g.id,
          members: g.members,
          from: me.username,
          displayName: me.displayName,
        });
        const st = presence.get(member) || "offline";
        if (st === "offline" || !conns.get(member)?.open) {
          await appendMissedCall(g.id, member, "out");
          continue;
        }
        try {
          const pid = await peerIdOf(member);
          const call = peer.call(pid, stream, {
            metadata: { kind: "audio", from: me.username, groupId: g.id },
          });
          if (call) {
            mediaCalls.set(member, call);
            call.on("stream", (s) => {
              stopRings();
              if (!callTimerIv) startCallTimer();
              onMediaStream(s, { isScreen: false, fromUser: member });
            });
            call.on("close", () => {
              mediaCalls.delete(member);
              peerVoiceEls.get(member)?.pause();
              peerVoiceEls.delete(member);
              if (!mediaCalls.size && !mediaCall) hangup();
            });
          }
        } catch (e) {
          console.warn("group call", member, e);
        }
      }
      if (!mediaCalls.size) {
        stopRings();
        hangup();
        renderMessage({ type: "system", text: t("groupEmpty") });
      } else {
        renderMessage({
          type: "system",
          text: `${t("groupCalling")} (${mediaCalls.size})…`,
        });
      }
    } catch {
      stopRings();
      renderMessage({ type: "system", text: t("micNeeded") });
    }
  }

  /** Mesh: gruptaki diğer üyelere de ses aç */
  async function meshJoinGroupCall(groupId, exceptUser) {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    try {
      const stream = await ensureMicGraph();
      for (const member of g.members) {
        if (member === me.username || member === exceptUser) continue;
        if (mediaCalls.has(member)) continue;
        const st = presence.get(member) || "offline";
        if (st === "offline") continue;
        try {
          const pid = await peerIdOf(member);
          const call = peer.call(pid, stream, {
            metadata: { kind: "audio", from: me.username, groupId },
          });
          if (call) {
            mediaCalls.set(member, call);
            call.on("stream", (s) => onMediaStream(s, { isScreen: false, fromUser: member }));
            call.on("close", () => {
              mediaCalls.delete(member);
              peerVoiceEls.delete(member);
            });
          }
        } catch {}
      }
    } catch {}
  }

  async function createGroupFromSelection() {
    const members = [...selectedFriends];
    // En az 2 kişi seçili olmalı (grup = çoklu)
    if (members.length < 2) {
      alert(t("groupNeedTwo") || "Select at least 2 friends for a group call.");
      return;
    }
    try {
      const names = members
        .map((u) => friends.find((f) => f.username === u)?.displayName || u)
        .join(", ");
      const g = await api.createGroup(me.id, names.slice(0, 40), members);
      groups = await api.listGroups(me.id);
      selectedFriends.clear();
      renderFriends();
      renderGroups();
      setGroupsPaneVisible(true);
      await openGroup(g.id);
      renderMessage({ type: "system", text: t("groupCreatedCalling") });
      await startGroupCall(g);
      syncGroupsPaneVisibility();
    } catch (e) {
      alert(e.message || String(e));
    }
  }

  async function acceptCall() {
    if (!incomingCall) return;
    try {
      clearTimeout(incomingRingTimer);
      incomingRingTimer = null;
      stopRings();
      const stream = await ensureMicGraph();
      const friend = callWith;
      const groupId = incomingCall.metadata && incomingCall.metadata.groupId;
      incomingCall.answer(stream);
      bindMediaCall(incomingCall, friend);
      incomingCall = null;
      el.incomingBar.hidden = true;
      if (groupId) {
        activeGroupId = groupId;
        await meshJoinGroupCall(groupId, friend);
      }
      renderMessage({ type: "system", text: t("callOpened") });
    } catch {
      rejectCall();
    }
  }

  function rejectCall() {
    clearTimeout(incomingRingTimer);
    incomingRingTimer = null;
    stopRings();
    if (incomingCall) {
      try {
        incomingCall.close();
      } catch {}
      incomingCall = null;
    }
    el.incomingBar.hidden = true;
    callWith = null;
  }

  function qualityConstraints(q, fps) {
    const f = Number(fps) || 30;
    if (q === "720p") {
      return {
        width: { ideal: 1280, max: 1280 },
        height: { ideal: 720, max: 720 },
        frameRate: { ideal: f, max: f },
      };
    }
    if (q === "lossless") {
      return {
        width: { ideal: 1920, max: 2560 },
        height: { ideal: 1080, max: 1440 },
        frameRate: { ideal: f, max: f },
      };
    }
    return {
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      frameRate: { ideal: f, max: f },
    };
  }

  function maxBitrateForQuality(q) {
    if (q === "720p") return 2_500_000;
    if (q === "lossless") return 8_000_000;
    return 4_500_000;
  }

  async function optimizeScreenSender(call, quality, fps) {
    try {
      const pc = call.peerConnection || call._pc || call.pc;
      if (!pc) return;
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (!sender) return;
      const params = sender.getParameters();
      if (!params.encodings || !params.encodings.length) {
        params.encodings = [{}];
      }
      params.encodings[0].maxBitrate = maxBitrateForQuality(quality);
      params.encodings[0].maxFramerate = Number(fps) || 30;
      // oyun: hareket önceliği
      if (sender.track) {
        try {
          sender.track.contentHint = "motion";
        } catch {}
      }
      await sender.setParameters(params);
    } catch (e) {
      console.warn("bitrate ayarı:", e);
    }
  }

  async function startScreenShare() {
    const targets = [];
    if (callWith) targets.push(callWith);
    for (const u of mediaCalls.keys()) {
      if (!targets.includes(u)) targets.push(u);
    }
    if (!inCall || !targets.length) return;
    if (screenStream) {
      stopScreen();
      return;
    }
    const sources = await api.pickScreenSources();
    el.screenList.innerHTML = "";
    sources.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "screen-item";
      b.innerHTML = `<img alt=""/><span></span>`;
      b.querySelector("img").src = s.thumbnail;
      b.querySelector("span").textContent = s.name;
      b.addEventListener("click", async () => {
        el.modalScreen.hidden = true;
        try {
          await api.setScreenSource(s.id);
          const q = el.screenQuality.value;
          const fps = Number(el.screenFps.value) || 30;
          const showCursor = !!(el.screenCursor && el.screenCursor.checked);
          const video = qualityConstraints(q, fps);

          const wantSysAudio = !!(el.screenSystemAudio && el.screenSystemAudio.checked);
          // Electron: audio:true → main handler WASAPI loopback
          try {
            screenStream = await navigator.mediaDevices.getDisplayMedia({
              video: {
                width: video.width,
                height: video.height,
                frameRate: video.frameRate,
              },
              audio: !!wantSysAudio,
            });
          } catch (err1) {
            if (wantSysAudio) {
              console.warn("Sesli ekran başarısız, sadece video:", err1);
              screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                  width: video.width,
                  height: video.height,
                  frameRate: video.frameRate,
                },
                audio: false,
              });
              renderMessage({ type: "system", text: t("screenNoAudio") });
            } else {
              throw err1;
            }
          }

          if (!wantSysAudio) {
            screenStream.getAudioTracks().forEach((t) => {
              try {
                t.stop();
                screenStream.removeTrack(t);
              } catch {}
            });
          }

          const track = screenStream.getVideoTracks()[0];
          try {
            track.contentHint = "motion";
            await track.applyConstraints({
              ...video,
              frameRate: { ideal: fps, max: fps },
            });
          } catch {}
          screenStream.getAudioTracks().forEach((t) => {
            try {
              t.enabled = true;
              t.contentHint = "music";
            } catch {}
          });

          // PeerJS renegotiation yok: track'ler EN BAŞTA stream'de olmalı; tek kind:screen call
          const audioTracks = screenStream.getAudioTracks().filter((t) => t.readyState === "live");
          const fullStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioTracks,
          ]);

          for (const target of targets) {
            try {
              const pid = await peerIdOf(target);
              const sc = peer.call(pid, fullStream, {
                metadata: {
                  kind: "screen",
                  from: me.username,
                  hasAudio: audioTracks.length > 0,
                },
              });
              if (sc) {
                if (!screenCall) screenCall = sc;
                screenCalls.set(target, sc);
                setTimeout(() => optimizeScreenSender(sc, q, fps), 400);
              }
            } catch (e) {
              console.warn("screen to", target, e);
            }
          }

          el.localVideo.srcObject = new MediaStream(screenStream.getVideoTracks());
          el.localPh.hidden = true;
          if (el.fsLocal && !el.fsMedia.hidden) el.fsLocal.srcObject = el.localVideo.srcObject;
          setScreenBtnUi();
          track.onended = () => stopScreen();
          const hasAudio = audioTracks.length > 0;
          renderMessage({
            type: "system",
            text: hasAudio
              ? t("screenSharingAudio")
              : wantSysAudio
                ? t("screenAudioMissing")
                : t("screenSharing"),
          });
        } catch (err) {
          renderMessage({
            type: "system",
            text: t("screenFailed") + ": " + (err.message || err),
          });
          console.error(err);
        }
      });
      el.screenList.appendChild(b);
    });
    el.modalScreen.hidden = false;
  }

  function stopScreen() {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      screenStream = null;
    }
    if (screenCall) {
      try {
        screenCall.close();
      } catch {}
      screenCall = null;
    }
    for (const [, c] of screenCalls) {
      try {
        c.close();
      } catch {}
    }
    screenCalls.clear();
    el.localVideo.srcObject = null;
    el.localPh.hidden = false;
    setScreenBtnUi();
    const notify = new Set();
    if (callWith) notify.add(callWith);
    for (const u of mediaCalls.keys()) notify.add(u);
    for (const u of notify) sendTo(u, { type: "screen-stop" });
  }

  // ---------- emoji / gif ----------
  function buildEmojiPanel() {
    el.emojiPanel.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "emoji-grid";
    for (const e of EMOJIS) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = e;
      b.addEventListener("click", () => {
        el.chatInput.value += e;
        el.chatInput.focus();
      });
      grid.appendChild(b);
    }
    el.emojiPanel.appendChild(grid);
  }

  function paintGifResults(items) {
    el.gifResults.innerHTML = "";
    for (const it of items) {
      if (!it.thumb) continue;
      const b = document.createElement("button");
      b.type = "button";
      // XSS yok: attribute injection engeli (Fable 5 §5.1)
      const img = document.createElement("img");
      img.alt = "gif";
      img.src = it.thumb;
      b.appendChild(img);
      b.addEventListener("click", () => {
        sendGif(it.full || it.thumb);
        el.gifPanel.hidden = true;
      });
      el.gifResults.appendChild(b);
    }
    if (!el.gifResults.children.length) {
      const p = document.createElement("p");
      p.className = "hint tiny";
      p.textContent = "Sonuç yok.";
      el.gifResults.appendChild(p);
    }
  }

  async function searchGifs(q) {
    el.gifResults.innerHTML = "<p class='hint tiny'>Aranıyor…</p>";
    const query = (q || "reaction").trim() || "reaction";

    // 1) Tenor = Google'ın resmi GIF API'si (uygulama içi, tarayıcı yok)
    try {
      const url =
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}` +
        `&key=${TENOR_KEY}&client_key=ikili_sohbet&limit=24&media_filter=gif,tinygif`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = (data.results || []).map((r) => ({
          thumb: r.media_formats?.tinygif?.url || r.media_formats?.nanogif?.url || r.media_formats?.gif?.url,
          full: r.media_formats?.gif?.url || r.media_formats?.mediumgif?.url,
        }));
        if (items.length) {
          paintGifResults(items);
          return;
        }
      }
    } catch (e) {
      console.warn("Tenor:", e);
    }

    // 2) Giphy yedek
    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=pg-13`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const items = (data.data || []).map((g) => ({
        thumb: g.images?.fixed_height_small?.url || g.images?.preview_gif?.url,
        full: g.images?.original?.url,
      }));
      paintGifResults(items);
    } catch {
      el.gifResults.innerHTML =
        "<p class='hint tiny'>GIF servisi yanıt vermiyor. İnterneti kontrol et; gerekirse ücretsiz Tenor/Giphy API key al.</p>";
    }
  }

  // ---------- boot session ----------
  let cloudMode = false;
  let stopCloudPresence = null;

  function setCloudBadge() {
    const b = $("cloud-mode-badge");
    if (!b) return;
    b.textContent = cloudMode
      ? "Bulut modu (Supabase) · ses/ekran hâlâ P2P"
      : "Yerel mod · bulut: CLOUD.md";
  }

  async function loadFriendsUnified() {
    if (cloudMode && window.HearthCloud?.isEnabled()) {
      try {
        const cloudFriends = await window.HearthCloud.listFriends();
        // Yerel sohbet geçmişi için de local friends kaydı tut
        for (const f of cloudFriends) {
          try {
            await api.addFriend(me.id, f.username, f.displayName);
          } catch {
            /* zaten var */
          }
        }
        friends = cloudFriends;
        // Presence haritasını uygula
        const onlineMap = window.HearthCloud.getOnlineMap();
        for (const f of friends) {
          const meta = onlineMap.get(f.username);
          if (meta && meta.online && f.remoteStatus !== "invisible") {
            presence.set(f.username, meta.status === "dnd" || meta.status === "idle" ? "online" : "online");
          }
        }
        return;
      } catch (e) {
        console.warn("cloud friends", e);
      }
    }
    friends = await api.listFriends(me.id);
  }

  async function enterApp(user) {
    me = user;
    // Yerel ayarlar: cloud uuid veya local id
    settings = await api.getSettings(me.id);
    prefs = {
      theme: settings.theme || "dark",
      language: settings.language || "tr",
      timeFormat: settings.timeFormat || "24",
      fontScale: settings.fontScale || 100,
    };
    applyTheme(prefs.theme);
    applyFontScale(prefs.fontScale);
    applyLanguage(prefs.language);
    await loadFriendsUnified();
    if (cloudMode && window.HearthCloud?.listIncomingFriendRequests) {
      try {
        friendRequests = await window.HearthCloud.listIncomingFriendRequests();
      } catch {
        friendRequests = [];
      }
    }
    el.myDisplay.textContent = me.displayName || me.username;
    el.myUsername.textContent = "@" + me.username;
    try {
      setMyAvatar(await api.getAvatar(me.id));
    } catch {
      setMyAvatar(null);
    }
    noiseOn = settings.noiseSuppression !== false;
    friendsOnlineCollapsed = !!settings.friendsOnlineCollapsed;
    friendsOfflineCollapsed = !!settings.friendsOfflineCollapsed;
    applyMicVolume(settings.micVolume ?? 100);
    applyVoiceVolume(settings.outputVolume ?? 100);
    applyScreenAudioVolume(settings.screenAudioVolume ?? 100);
    if (el.screenQuality) el.screenQuality.value = settings.screenQuality || "1080p";
    if (el.screenFps) el.screenFps.value = String(settings.screenFps || 30);
    if (el.screenCursor) el.screenCursor.checked = !!settings.showCursor;
    if (el.screenSystemAudio) el.screenSystemAudio.checked = settings.captureSystemAudio !== false;
    setMediaHeight(settings.mediaDockHeight || 220);
    setChatExpanded(!!settings.chatExpanded);
    if (el.setHotkey) {
      el.setHotkey.value = accelToLabel(settings.micHotkey || "CommandOrControl+Shift+M");
      el.setHotkey.dataset.accel = settings.micHotkey || "CommandOrControl+Shift+M";
    }
    if (el.setDeafenHotkey) {
      el.setDeafenHotkey.value = accelToLabel(settings.deafenHotkey || "CommandOrControl+Shift+D");
      el.setDeafenHotkey.dataset.accel = settings.deafenHotkey || "CommandOrControl+Shift+D";
    }
    if (el.myStatusSelect) el.myStatusSelect.value = me.status || "online";
    if (el.myStatusText) el.myStatusText.value = me.statusText || "";
    syncStatusSummary();
    setMicUi();
    setDeafenUi();
    setNoiseUi();
    setScreenBtnUi();
    updateMyStatusDot();
    rebuildSounds();
    try {
      groups = await api.listGroups(me.id);
    } catch {
      groups = [];
    }
    showApp();
    renderFriends();
    renderFriendRequests();
    renderGroups();
    buildEmojiPanel();
    if (window.Notification && Notification.permission === "default") {
      try {
        Notification.requestPermission();
      } catch {}
    }
    await startPeerNetwork();

    // Bulut presence (P2P medyadan bağımsız)
    if (cloudMode && window.HearthCloud?.isEnabled()) {
      try {
        if (stopCloudPresence) await stopCloudPresence();
        stopCloudPresence = await window.HearthCloud.startPresence({
          username: me.username,
          status: me.status || "online",
          statusText: me.statusText || "",
          onChange: (map) => {
            for (const f of friends) {
              const meta = map.get(f.username);
              if (meta && meta.online) {
                if (meta.status === "invisible") presence.set(f.username, "offline");
                else presence.set(f.username, "online");
                f.remoteStatus = meta.status || "online";
                f.statusText = meta.statusText || "";
              } else if (meta && !meta.online) {
                presence.set(f.username, "offline");
              }
            }
            // presence map'te olup friend listesinde olmayanlar
            for (const [uname, meta] of map.entries()) {
              if (!friends.find((x) => x.username === uname)) continue;
              if (meta && meta.online && meta.status !== "invisible") {
                presence.set(uname, "online");
              }
            }
            renderFriends();
            if (activeFriend) {
              const f = friends.find((x) => x.username === activeFriend);
              if (f) setPeerHeader(f);
            }
          },
        });
      } catch (e) {
        console.warn("cloud presence", e);
      }
    }

    if (!settings.onboardingDone && el.onboarding) {
      el.onboarding.hidden = false;
    }
  }

  // ---------- events: auth ----------
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const which = tab.dataset.tab;
      el.formLogin.hidden = which !== "login";
      el.formRegister.hidden = which !== "register";
    });
  });

  el.formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    el.loginError.hidden = true;
    try {
      let user;
      if (cloudMode && window.HearthCloud?.isEnabled()) {
        user = await window.HearthCloud.login({
          email: el.loginEmail.value.trim(),
          password: el.loginPass.value,
        });
      } else {
        user = await api.login({
          email: el.loginEmail.value.trim(),
          password: el.loginPass.value,
        });
      }
      await enterApp(user);
    } catch (err) {
      el.loginError.hidden = false;
      el.loginError.textContent = err.message || String(err);
    }
  });

  el.formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    el.regError.hidden = true;
    try {
      const payload = {
        email: el.regEmail.value.trim(),
        username: el.regUsername.value.trim(),
        displayName: el.regDisplay.value.trim() || el.regUsername.value.trim(),
        password: el.regPass.value,
      };
      if (cloudMode && window.HearthCloud?.isEnabled()) {
        const res = await window.HearthCloud.register(payload);
        if (res.needsConfirm) {
          el.regError.hidden = false;
          el.regError.textContent =
            "Kayıt alındı. E-posta onayı açıksa gelen kutunu kontrol et, sonra giriş yap.";
          return;
        }
        await enterApp(res.user);
      } else {
        const user = await api.register(payload);
        await enterApp(user);
      }
    } catch (err) {
      el.regError.hidden = false;
      el.regError.textContent = err.message || String(err);
    }
  });

  // ---------- friends / chat ----------
  el.btnAddFriend.addEventListener("click", () => {
    el.addFriendError.hidden = true;
    el.addFriendUser.value = "";
    el.modalAdd.hidden = false;
  });

  el.btnAddFriendGo.addEventListener("click", async () => {
    el.addFriendError.hidden = true;
    try {
      const uname = el.addFriendUser.value.trim();
      if (!uname) throw new Error("Kullanıcı adı gir");
      if (cloudMode && window.HearthCloud?.isEnabled()) {
        const res = await window.HearthCloud.addFriendByUsername(uname);
        if (res?.pending) {
          el.modalAdd.hidden = true;
          renderMessage({ type: "system", text: t("requestSent") + " @" + uname });
          await refreshFriendsAndRequests();
          return;
        }
        if (res?.autoAccepted || res?.username) {
          await api.addFriend(me.id, uname, res.displayName).catch(() => {});
        }
      } else {
        await api.addFriend(me.id, uname);
      }
      await loadFriendsUnified();
      renderFriends();
      el.modalAdd.hidden = true;
      tryConnect(uname.toLowerCase());
    } catch (err) {
      el.addFriendError.hidden = false;
      el.addFriendError.textContent = err.message || String(err);
    }
  });

  el.chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = el.chatInput.value.trim();
    if (!text) return;
    el.chatInput.value = "";
    await sendChatText(text);
  });

  el.btnEmoji.addEventListener("click", () => {
    el.gifPanel.hidden = true;
    el.emojiPanel.hidden = !el.emojiPanel.hidden;
  });

  el.btnGif.addEventListener("click", () => {
    el.emojiPanel.hidden = true;
    el.gifPanel.hidden = !el.gifPanel.hidden;
    if (!el.gifPanel.hidden) searchGifs(el.gifSearch.value || "reaction");
  });

  let gifTimer = null;
  el.gifSearch.addEventListener("input", () => {
    clearTimeout(gifTimer);
    gifTimer = setTimeout(() => searchGifs(el.gifSearch.value), 400);
  });

  el.btnFile.addEventListener("click", () => sendFile());

  // ---------- call controls ----------
  el.btnCall.addEventListener("click", () => startCall());
  el.btnHangup.addEventListener("click", () => hangup());
  if (el.btnHangupBar) el.btnHangupBar.addEventListener("click", () => hangup());
  el.btnAccept.addEventListener("click", () => acceptCall());
  el.btnReject.addEventListener("click", () => rejectCall());
  el.btnMic.addEventListener("click", () => toggleMic());
  el.btnDeafen.addEventListener("click", () => toggleDeafen());
  if (el.btnNoise) el.btnNoise.addEventListener("click", () => toggleNoise());
  el.btnScreen.addEventListener("click", () => startScreenShare());
  if (el.btnCancelTransfer) {
    el.btnCancelTransfer.addEventListener("click", () => cancelTransfer("user"));
  }
  if (el.btnGroupFromSelection) {
    el.btnGroupFromSelection.addEventListener("click", () => createGroupFromSelection());
  }
  if (el.btnNewGroup) {
    el.btnNewGroup.addEventListener("click", () => createGroupFromSelection());
  }
  if (el.btnOnboardDone) {
    el.btnOnboardDone.addEventListener("click", async () => {
      if (el.onboarding) el.onboarding.hidden = true;
      if (me) {
        settings = await api.saveSettings(me.id, { onboardingDone: true });
      }
    });
  }
  document.addEventListener("click", () => hideMsgContext());
  if (el.msgContextMenu) {
    el.msgContextMenu.addEventListener("click", (e) => e.stopPropagation());
    el.msgContextMenu.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const act = btn.getAttribute("data-act");
        const m = ctxTargetMessage;
        hideMsgContext();
        if (!m) return;
        if (act === "reply") {
          replyTo = { id: m.id, text: m.text || m.name || "…", from: m.from };
          el.chatInput.placeholder = `Yanıt: ${replyTo.text.slice(0, 40)}…`;
          el.chatInput.focus();
        } else if (act === "react-thumb") await reactToMessage(m.id, "👍");
        else if (act === "react-heart") await reactToMessage(m.id, "❤️");
        else if (act === "pin") await pinMessage(m);
        else if (act === "edit") await editMessage(m);
        else if (act === "delete") await deleteMessage(m);
      });
    });
  }
  if (el.chatSearch) {
    el.chatSearch.addEventListener("input", () => {
      const q = el.chatSearch.value.trim().toLowerCase();
      let hits = 0;
      el.chatLog.querySelectorAll(".msg").forEach((node) => {
        node.classList.remove("search-hit");
        if (!q) return;
        const t = (node.textContent || "").toLowerCase();
        if (t.includes(q) && !node.classList.contains("system")) {
          node.classList.add("search-hit");
          hits++;
        }
      });
      if (el.chatSearchCount) {
        el.chatSearchCount.textContent = q ? `${hits} sonuç` : "";
      }
      const first = el.chatLog.querySelector(".msg.search-hit");
      if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }
  if (el.btnFullscreenMedia) {
    el.btnFullscreenMedia.addEventListener("click", () => enterFullscreenMedia());
  }
  if (el.btnFsExit) el.btnFsExit.addEventListener("click", () => exitFullscreenMedia());
  if (el.mediaLayout) {
    el.mediaLayout.addEventListener("change", () => applyMediaLayout(el.mediaLayout.value));
  }
  if (el.fsLayout) {
    el.fsLayout.addEventListener("change", () => applyMediaLayout(el.fsLayout.value));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.fsMedia && !el.fsMedia.hidden) {
      exitFullscreenMedia();
    }
  });

  async function broadcastPresence() {
    if (!me) return;
    for (const f of friends) {
      sendTo(f.username, {
        type: "presence",
        status: me.status || "online",
        statusText: me.statusText || "",
      });
    }
  }

  async function applyMyStatus(status) {
    if (el.myStatusSelect) el.myStatusSelect.value = status;
    if (cloudMode && window.HearthCloud?.isEnabled()) {
      me = await window.HearthCloud.updateProfile({ status });
      await window.HearthCloud.trackPresenceUpdate({
        status,
        statusText: me.statusText || "",
      });
    } else {
      me = await api.updateProfile(me.id, { status });
    }
    if (window.HearthPresence) {
      try {
        window.HearthPresence.updateStatus({
          status,
          statusText: me.statusText || "",
        });
      } catch {}
    }
    updateMyStatusDot();
    syncStatusSummary();
    await broadcastPresence();
  }

  if (el.myStatusSelect) {
    el.myStatusSelect.addEventListener("change", async () => {
      await applyMyStatus(el.myStatusSelect.value);
    });
  }
  document.querySelectorAll('input[name="my-status"]').forEach((radio) => {
    radio.addEventListener("change", async () => {
      if (!radio.checked) return;
      await applyMyStatus(radio.value);
      const det = $("status-details");
      if (det) det.open = false;
    });
  });
  if (el.myStatusText) {
    let statusTextTimer;
    el.myStatusText.addEventListener("input", () => {
      clearTimeout(statusTextTimer);
      statusTextTimer = setTimeout(async () => {
        const statusText = el.myStatusText.value.trim();
        if (cloudMode && window.HearthCloud?.isEnabled()) {
          me = await window.HearthCloud.updateProfile({ statusText });
          await window.HearthCloud.trackPresenceUpdate({
            status: me.status || "online",
            statusText,
          });
        } else {
          me = await api.updateProfile(me.id, { statusText });
        }
        if (window.HearthPresence) {
          try {
            window.HearthPresence.updateStatus({
              status: me.status || "online",
              statusText,
            });
          } catch {}
        }
        updateMyStatusDot();
        syncStatusSummary();
        await broadcastPresence();
      }, 400);
    });
  }

  // Logo üzerinde güncelleme rozeti
  if (el.btnLogoUpdate) {
    el.btnLogoUpdate.addEventListener("click", async () => {
      if (!updateAvailableInfo) return;
      try {
        if (api.checkForUpdates) await api.checkForUpdates({ silent: false });
      } catch (e) {
        alert(e.message || String(e));
      }
    });
  }
  if (api.onUpdateStatus) {
    api.onUpdateStatus((s) => {
      if (s?.state === "available" || s?.state === "ready") {
        setUpdateBadge({ version: s.version || "" });
      }
      if (el.updateStatusLabel && s?.message) el.updateStatusLabel.textContent = s.message;
    });
  }

  // Sürükle-bırak dosya
  if (el.chatShell) {
    el.chatShell.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      el.chatShell.classList.add("drag-over");
    });
    el.chatShell.addEventListener("dragleave", (e) => {
      if (!el.chatShell.contains(e.relatedTarget)) el.chatShell.classList.remove("drag-over");
    });
    el.chatShell.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.chatShell.classList.remove("drag-over");
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      if (!activeFriend && !activeGroupId) {
        renderMessage({ type: "system", text: t("selectChatFirst") });
        return;
      }
      let p = "";
      try {
        if (api.pathForFile) p = api.pathForFile(f) || "";
      } catch {}
      if (!p) p = f.path || "";
      if (!p) {
        renderMessage({ type: "system", text: t("pathFailed") });
        return;
      }
      await sendFile({ path: p, name: f.name, size: f.size });
    });
  }

  // Dosya teklifi butonları
  const btnFileAcc = $("btn-file-offer-accept");
  const btnFileRej = $("btn-file-offer-reject");
  if (btnFileAcc) btnFileAcc.addEventListener("click", () => closeMediaOffer(true));
  if (btnFileRej) btnFileRej.addEventListener("click", () => closeMediaOffer(false));

  wireMediaSplitter();

  // Ekran paneli sağ tık — izleme modları
  function showVidCtx(x, y) {
    let menu = $("vid-ctx-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.id = "vid-ctx-menu";
      menu.className = "vid-ctx-menu";
      menu.hidden = true;
      document.body.appendChild(menu);
    }
    menu.innerHTML = "";
    const opts = [
      ["both", "Yan yana"],
      ["remote", "Sadece paylaşılan"],
      ["local", "Sadece önizleme"],
      ["fullscreen", "Tam ekran"],
    ];
    for (const [val, label] of opts) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => {
        menu.hidden = true;
        if (val === "fullscreen") {
          el.btnFullscreenMedia?.click();
        } else if (el.mediaLayout) {
          el.mediaLayout.value = val;
          el.mediaLayout.dispatchEvent(new Event("change"));
        }
      });
      menu.appendChild(b);
    }
    menu.hidden = false;
    menu.style.left = Math.min(x, window.innerWidth - 200) + "px";
    menu.style.top = Math.min(y, window.innerHeight - 160) + "px";
  }
  if (el.mediaVideos) {
    el.mediaVideos.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showVidCtx(e.clientX, e.clientY);
    });
  }
  document.addEventListener("click", () => {
    const m = $("vid-ctx-menu");
    if (m) m.hidden = true;
  });

  el.micVol.addEventListener("input", async () => {
    if (deafened) return;
    applyMicVolume(el.micVol.value);
    settings.micVolume = Number(el.micVol.value);
    await api.saveSettings(me.id, { micVolume: settings.micVolume });
  });

  el.outVol.addEventListener("input", async () => {
    if (deafened) {
      preDeafenOutput = Number(el.outVol.value);
      return;
    }
    applyVoiceVolume(el.outVol.value);
    settings.outputVolume = Number(el.outVol.value);
    await api.saveSettings(me.id, { outputVolume: settings.outputVolume });
  });

  if (el.screenAudioVol) {
    el.screenAudioVol.addEventListener("input", async () => {
      if (deafened) {
        preDeafenScreenVol = Number(el.screenAudioVol.value);
        return;
      }
      applyScreenAudioVolume(el.screenAudioVol.value);
      settings.screenAudioVolume = Number(el.screenAudioVol.value);
      await api.saveSettings(me.id, { screenAudioVolume: settings.screenAudioVolume });
    });
  }

  el.screenQuality.addEventListener("change", async () => {
    await api.saveSettings(me.id, { screenQuality: el.screenQuality.value });
  });
  el.screenFps.addEventListener("change", async () => {
    await api.saveSettings(me.id, { screenFps: Number(el.screenFps.value) });
  });
  if (el.screenCursor) {
    el.screenCursor.addEventListener("change", async () => {
      await api.saveSettings(me.id, { showCursor: el.screenCursor.checked });
    });
  }

  // ---------- settings (sekmeli) ----------
  function switchSettingsTab(tab) {
    document.querySelectorAll(".settings-nav-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-settings-tab") === tab);
    });
    document.querySelectorAll("[data-settings-panel]").forEach((p) => {
      const on = p.getAttribute("data-settings-panel") === tab;
      p.hidden = !on;
      p.classList.toggle("active", on);
    });
  }

  document.querySelectorAll(".settings-nav-btn").forEach((b) => {
    b.addEventListener("click", () => switchSettingsTab(b.getAttribute("data-settings-tab")));
  });

  el.btnOpenSettings.addEventListener("click", async () => {
    if (el.setUsername) el.setUsername.value = me.username;
    if (el.setEmail) el.setEmail.value = me.email || "";
    const setDn = $("set-display-name");
    const setAb = $("set-about");
    if (setDn) setDn.value = me.displayName || "";
    if (setAb) setAb.value = me.about || "";
    const prev = $("set-profile-avatar-preview");
    if (prev) {
      prev.innerHTML = "";
      try {
        const url = await api.getAvatar(me.id);
        if (url) {
          const im = document.createElement("img");
          im.src = url;
          applyAvatarFrame(im, settings.avatarFrame);
          prev.appendChild(im);
        } else prev.textContent = (me.displayName || me.username || "?")[0].toUpperCase();
      } catch {
        prev.textContent = "?";
      }
    }
    el.setHotkey.value = accelToLabel(settings.micHotkey);
    el.setHotkey.dataset.accel = settings.micHotkey || "";
    if (el.setDeafenHotkey) {
      el.setDeafenHotkey.value = accelToLabel(settings.deafenHotkey);
      el.setDeafenHotkey.dataset.accel = settings.deafenHotkey || "";
    }
    if (el.setMicVol) {
      el.setMicVol.value = String(settings.micVolume ?? 100);
      if (el.setMicVolVal) el.setMicVolVal.textContent = (settings.micVolume ?? 100) + "%";
    }
    fillSoundSelect(el.setSoundIncoming, settings.soundIncoming || "fart_3.mp3");
    fillSoundSelect(el.setSoundOutgoing, settings.soundOutgoing || "ring_outgoing.mp3");
    fillSoundSelect(el.setSoundNotify, settings.soundNotify || "notify.mp3");
    if (el.setSoundRingEnabled) el.setSoundRingEnabled.checked = settings.soundRingEnabled !== false;
    if (el.setSoundNotifyEnabled) el.setSoundNotifyEnabled.checked = settings.soundNotifyEnabled !== false;
    // Bildirimler sekmesi kopya kutular
    const nr = $("set-sound-ring-enabled-notify");
    const nn = $("set-sound-notify-enabled-notify");
    if (nr) nr.checked = settings.soundRingEnabled !== false;
    if (nn) nn.checked = settings.soundNotifyEnabled !== false;
    if (el.setSoundVol) {
      el.setSoundVol.value = String(settings.soundMasterVolume ?? 100);
      if (el.setSoundVolVal) el.setSoundVolVal.textContent = (settings.soundMasterVolume ?? 100) + "%";
    }
    const dn = $("set-desktop-notify");
    if (dn) dn.checked = settings.desktopNotify !== false;
    document.querySelectorAll('input[name="set-theme"]').forEach((r) => {
      r.checked = r.value === (prefs.theme || "dark");
    });
    const setLang = $("set-language");
    const setTf = $("set-time-format");
    const setFs = $("set-font-scale");
    const setFsVal = $("set-font-scale-val");
    if (setLang) setLang.value = prefs.language || "tr";
    if (setTf) setTf.value = prefs.timeFormat || "24";
    if (setFs) {
      setFs.value = String(prefs.fontScale || 100);
      if (setFsVal) setFsVal.textContent = (prefs.fontScale || 100) + "%";
    }
    if (el.appVersionLabel && api.appVersion) {
      api.appVersion().then((v) => {
        if (el.appVersionLabel) el.appVersionLabel.textContent = "Sürüm: v" + v;
      }).catch(() => {});
    }
    if (el.updateStatusLabel && api.getUpdateStatus) {
      api.getUpdateStatus().then((s) => {
        if (el.updateStatusLabel && s?.message) el.updateStatusLabel.textContent = s.message;
      }).catch(() => {});
    }
    switchSettingsTab("profile");
    el.modalSettings.hidden = false;
  });

  const btnSetChangeAv = $("btn-set-change-avatar");
  const btnSetFrameAv = $("btn-set-frame-avatar");
  if (btnSetChangeAv) {
    btnSetChangeAv.addEventListener("click", async () => {
      try {
        const url = await api.pickAvatar(me.id);
        if (url) {
          setMyAvatar(url);
          openAvatarFrameEditor(url);
        }
      } catch (e) {
        alert(e.message || String(e));
      }
    });
  }
  if (btnSetFrameAv) {
    btnSetFrameAv.addEventListener("click", () => openAvatarFrameEditor());
  }
  const setFs = $("set-font-scale");
  if (setFs) {
    setFs.addEventListener("input", () => {
      const v = setFs.value;
      const lab = $("set-font-scale-val");
      if (lab) lab.textContent = v + "%";
      applyFontScale(v);
    });
  }
  document.querySelectorAll('input[name="set-theme"]').forEach((r) => {
    r.addEventListener("change", () => {
      if (r.checked) applyTheme(r.value);
    });
  });

  if (el.btnCheckUpdates && api.checkForUpdates) {
    el.btnCheckUpdates.addEventListener("click", async () => {
      if (el.updateStatusLabel) el.updateStatusLabel.textContent = "Kontrol ediliyor…";
      try {
        const s = await api.checkForUpdates({ silent: false });
        if (el.updateStatusLabel && s?.message) el.updateStatusLabel.textContent = s.message;
      } catch (err) {
        if (el.updateStatusLabel) el.updateStatusLabel.textContent = err.message || String(err);
      }
    });
  }
  if (api.onUpdateStatus) {
    api.onUpdateStatus((s) => {
      if (el.updateStatusLabel && s?.message) el.updateStatusLabel.textContent = s.message;
    });
  }

  if (el.setSoundVol) {
    el.setSoundVol.addEventListener("input", () => {
      if (el.setSoundVolVal) el.setSoundVolVal.textContent = el.setSoundVol.value + "%";
    });
  }
  if (el.btnPreviewIncoming) {
    el.btnPreviewIncoming.addEventListener("click", () => {
      previewSound(el.setSoundIncoming?.value || "fart_3.mp3", true);
    });
  }
  if (el.btnPreviewOutgoing) {
    el.btnPreviewOutgoing.addEventListener("click", () => {
      previewSound(el.setSoundOutgoing?.value || "ring_outgoing.mp3", true);
    });
  }
  if (el.btnPreviewNotify) {
    el.btnPreviewNotify.addEventListener("click", () => {
      previewSound(el.setSoundNotify?.value || "notify.mp3", false);
    });
  }

  el.btnMyAvatar.addEventListener("click", () => openProfile(me.username, true));
  // Tüm rail-me tıklanınca profil (sadece ayarlar dişlisi hariç)
  document.querySelector(".rail-me")?.addEventListener("click", (e) => {
    if (e.target.closest("#btn-open-settings")) return;
    if (e.target.closest("#btn-my-avatar") || e.target.closest(".me-meta")) {
      openProfile(me.username, true);
    }
  });

  if (el.btnMediaAccept) el.btnMediaAccept.addEventListener("click", () => closeMediaOffer(true));
  if (el.btnMediaReject) el.btnMediaReject.addEventListener("click", () => closeMediaOffer(false));

  const btnProfileSave = $("btn-profile-save");
  if (btnProfileSave) {
    btnProfileSave.addEventListener("click", async () => {
      const displayName = ($("profile-edit-display")?.value || "").trim() || me.username;
      me = await api.updateProfile(me.id, {
        displayName,
        about: ($("profile-edit-about")?.value || "").trim(),
        socials: {
          twitter: ($("profile-edit-twitter")?.value || "").trim(),
          youtube: ($("profile-edit-youtube")?.value || "").trim(),
          instagram: ($("profile-edit-instagram")?.value || "").trim(),
          website: ($("profile-edit-web")?.value || "").trim(),
        },
      });
      el.myDisplay.textContent = me.displayName;
      el.profileDisplay.textContent = me.displayName;
      el.modalProfile.hidden = true;
    });
  }

  el.btnChangeAvatar?.addEventListener("click", async () => {
    const url = await api.pickAvatar(me.id);
    if (url) {
      setMyAvatar(url);
      // profil modalındaki avatarı yenile
      if (!el.modalProfile.hidden) openProfile(me.username, true);
    }
  });

  // Avatar: sadece scale + mouse sürükle
  let avatarDrag = null;
  function refreshAvatarEditorPreview() {
    const x = Number(el.avX?.value || 50);
    const y = Number(el.avY?.value || 50);
    const s = Number(el.avS?.value || 100) / 100;
    if (el.avSVal) el.avSVal.textContent = Math.round(s * 100) + "%";
    applyAvatarFrame(el.avatarEditImg, { x, y, scale: s }, { editor: true });
  }

  async function openAvatarFrameEditor(preferredUrl) {
    const url = preferredUrl || (await api.getAvatar(me.id));
    if (!url) {
      await api.showMessage({
        title: "Profil",
        message: "Önce bir profil resmi veya GIF seç.",
      });
      return;
    }
    el.avatarEditImg.src = url;
    const f = settings.avatarFrame || { x: 50, y: 50, scale: 1 };
    if (el.avX) el.avX.value = String(f.x ?? 50);
    if (el.avY) el.avY.value = String(f.y ?? 50);
    if (el.avS) el.avS.value = String(Math.round((f.scale || 1) * 100));
    refreshAvatarEditorPreview();
    el.modalAvatar.hidden = false;
  }

  if (el.avatarFramePreview && el.avatarEditImg) {
    const onMove = (e) => {
      if (!avatarDrag) return;
      e.preventDefault();
      const dx = e.clientX - avatarDrag.x0;
      const dy = e.clientY - avatarDrag.y0;
      // daha hassas sürükleme
      const nx = Math.max(0, Math.min(100, avatarDrag.ox - dx * 0.45));
      const ny = Math.max(0, Math.min(100, avatarDrag.oy - dy * 0.45));
      if (el.avX) el.avX.value = String(Math.round(nx));
      if (el.avY) el.avY.value = String(Math.round(ny));
      refreshAvatarEditorPreview();
    };
    const endDrag = () => {
      if (!avatarDrag) return;
      avatarDrag = null;
      el.avatarFramePreview.classList.remove("dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
    el.avatarFramePreview.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      avatarDrag = {
        x0: e.clientX,
        y0: e.clientY,
        ox: Number(el.avX?.value || 50),
        oy: Number(el.avY?.value || 50),
      };
      el.avatarFramePreview.classList.add("dragging");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
    });
  }

  if (el.btnFrameAvatar) {
    el.btnFrameAvatar.addEventListener("click", () => openAvatarFrameEditor());
  }
  ["avX", "avY", "avS"].forEach((k) => {
    if (el[k]) el[k].addEventListener("input", refreshAvatarEditorPreview);
  });

  if (el.btnAvatarSave) {
    el.btnAvatarSave.addEventListener("click", async () => {
      const frame = {
        x: Number(el.avX.value),
        y: Number(el.avY.value),
        scale: Number(el.avS.value) / 100,
      };
      settings = await api.saveSettings(me.id, { avatarFrame: frame });
      applyAvatarFrame(el.myAvatarImg, frame);
      // Statik görseller için kırpılmış kare de üret (GIF ise sadece konum)
      try {
        const src = el.avatarEditImg.src || "";
        if (src && !src.includes("image/gif")) {
          const dataUrl = await cropAvatarToDataUrl(el.avatarEditImg, frame, 256);
          if (dataUrl) {
            const next = await api.saveAvatarDataUrl(me.id, dataUrl);
            if (next) setMyAvatar(next);
          }
        }
      } catch (e) {
        console.warn(e);
      }
      el.modalAvatar.hidden = true;
    });
  }

  function cropAvatarToDataUrl(img, frame, size) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih) return resolve(null);
      // object-fit: cover + object-position yaklaşık simülasyonu
      const scaleFit = Math.max(size / iw, size / ih) * (frame.scale || 1);
      const dw = iw * scaleFit;
      const dh = ih * scaleFit;
      const ox = ((frame.x ?? 50) / 100) * (size - dw);
      const oy = ((frame.y ?? 50) / 100) * (size - dh);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, ox, oy, dw, dh);
      resolve(canvas.toDataURL("image/png"));
    });
  }

  el.setMicVol.addEventListener("input", () => {
    el.setMicVolVal.textContent = el.setMicVol.value + "%";
  });

  el.setHotkey.addEventListener("click", () => {
    capturingHotkey = true;
    capturingWhich = "mic";
    el.setHotkey.value = "Tuşlara bas…";
  });

  if (el.setDeafenHotkey) {
    el.setDeafenHotkey.addEventListener("click", () => {
      capturingHotkey = true;
      capturingWhich = "deafen";
      el.setDeafenHotkey.value = "Tuşlara bas…";
    });
  }

  el.btnClearHotkey.addEventListener("click", () => {
    el.setHotkey.dataset.accel = "";
    el.setHotkey.value = "";
    capturingHotkey = false;
  });

  if (el.btnClearDeafen) {
    el.btnClearDeafen.addEventListener("click", () => {
      el.setDeafenHotkey.dataset.accel = "";
      el.setDeafenHotkey.value = "";
      capturingHotkey = false;
    });
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (!capturingHotkey) return;
      e.preventDefault();
      e.stopPropagation();
      const accel = eventToAccel(e);
      if (!accel) return;
      if (capturingWhich === "deafen" && el.setDeafenHotkey) {
        el.setDeafenHotkey.dataset.accel = accel;
        el.setDeafenHotkey.value = accelToLabel(accel);
      } else {
        el.setHotkey.dataset.accel = accel;
        el.setHotkey.value = accelToLabel(accel);
      }
      capturingHotkey = false;
    },
    true
  );

  el.btnSettingsSave.addEventListener("click", async () => {
    const micHotkey = el.setHotkey?.dataset?.accel || settings.micHotkey || "CommandOrControl+Shift+M";
    const deafenHotkey =
      (el.setDeafenHotkey && el.setDeafenHotkey.dataset.accel) ||
      settings.deafenHotkey ||
      "CommandOrControl+Shift+D";
    const micVolume = el.setMicVol ? Number(el.setMicVol.value) : settings.micVolume ?? 100;
    const soundIncoming = el.setSoundIncoming?.value || "fart_3.mp3";
    const soundOutgoing = el.setSoundOutgoing?.value || "ring_outgoing.mp3";
    const soundNotify = el.setSoundNotify?.value || "notify.mp3";
    // Ses + Bildirim sekmelerindeki checkbox'ları senkron oku
    const ringNotifyEl = $("set-sound-ring-enabled-notify");
    const ntfNotifyEl = $("set-sound-notify-enabled-notify");
    // Öncelik: ses sekmesi; bildirim sekmesi de güncellendiyse onu kullan (open'da ikisi de aynı set edilir)
    let ringSave = el.setSoundRingEnabled ? el.setSoundRingEnabled.checked : true;
    let ntfSave = el.setSoundNotifyEnabled ? el.setSoundNotifyEnabled.checked : true;
    if (ringNotifyEl) ringSave = ringNotifyEl.checked;
    if (ntfNotifyEl) ntfSave = ntfNotifyEl.checked;
    if (el.setSoundRingEnabled) el.setSoundRingEnabled.checked = ringSave;
    if (el.setSoundNotifyEnabled) el.setSoundNotifyEnabled.checked = ntfSave;
    const soundMasterVolume = el.setSoundVol ? Number(el.setSoundVol.value) : 100;
    const desktopNotify = $("set-desktop-notify") ? $("set-desktop-notify").checked : true;
    const theme =
      document.querySelector('input[name="set-theme"]:checked')?.value || prefs.theme || "dark";
    const language = $("set-language")?.value || prefs.language || "tr";
    const timeFormat = $("set-time-format")?.value || prefs.timeFormat || "24";
    const fontScale = Number($("set-font-scale")?.value || prefs.fontScale || 100);
    const displayName = ($("set-display-name")?.value || "").trim();
    const about = ($("set-about")?.value || "").trim();

    settings = await api.saveSettings(me.id, {
      micHotkey,
      deafenHotkey,
      micVolume,
      soundIncoming,
      soundOutgoing,
      soundNotify,
      soundRingEnabled: ringSave,
      soundNotifyEnabled: ntfSave,
      soundMasterVolume,
      desktopNotify,
      theme,
      language,
      timeFormat,
      fontScale,
    });
    prefs = { theme, language, timeFormat, fontScale };
    applyTheme(theme);
    applyLanguage(language);
    applyFontScale(fontScale);
    applyMicVolume(micVolume);
    rebuildSounds();

    if (displayName || about !== undefined) {
      try {
        const patch = {};
        if (displayName) patch.displayName = displayName;
        patch.about = about;
        if (cloudMode && window.HearthCloud?.isEnabled()) {
          me = await window.HearthCloud.updateProfile(patch);
        } else {
          me = await api.updateProfile(me.id, patch);
        }
        el.myDisplay.textContent = me.displayName || me.username;
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      if (snd.preview) {
        snd.preview.pause();
        snd.preview = null;
      }
    } catch {}
    el.modalSettings.hidden = true;
  });

  el.btnLogout.addEventListener("click", async () => {
    hangup();
    clearInterval(presenceTimer);
    if (stopPresenceWs) {
      try {
        stopPresenceWs();
      } catch {}
      stopPresenceWs = null;
    }
    if (window.HearthPresence) {
      try {
        window.HearthPresence.disconnect();
      } catch {}
    }
    if (stopCloudPresence) {
      try {
        await stopCloudPresence();
      } catch {}
      stopCloudPresence = null;
    }
    if (peer) {
      try {
        peer.destroy();
      } catch {}
      peer = null;
    }
    if (cloudMode && window.HearthCloud?.isEnabled()) {
      try {
        await window.HearthCloud.logout();
      } catch {}
    }
    try {
      await api.logout();
    } catch {}
    me = null;
    friends = [];
    activeFriend = null;
    showAuth();
    setCloudBadge();
  });

  document.querySelectorAll("[data-close]").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-close");
      const m = document.getElementById(id);
      if (m) m.hidden = true;
    });
  });

  /** Modal: dışarı tık + ESC ile kapat */
  function closeTopModal() {
    const open = [...document.querySelectorAll(".modal:not([hidden])")];
    if (!open.length) return false;
    const m = open[open.length - 1];
    m.hidden = true;
    // file offer açıkken ESC = reddet
    if (m.id === "modal-file-offer" && mediaOfferResolve) closeMediaOffer(false);
    return true;
  }
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("mousedown", (e) => {
      // Sadece backdrop (modal'ın kendisi), kart değil
      if (e.target === modal) {
        if (modal.id === "modal-file-offer") closeMediaOffer(false);
        else modal.hidden = true;
      }
    });
  });
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        if (closeTopModal()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    true
  );

  api.onMicHotkey(() => toggleMic());
  if (api.onDeafenHotkey) api.onDeafenHotkey(() => toggleDeafen());

  // prevent chat layout jump: keep composer fixed via CSS; also resize observer
  window.addEventListener("resize", () => scrollChatToBottom(false));

  // ---------- init ----------
  (async () => {
    try {
      const cfg = (await api.cloudConfig?.()) || { enabled: false };
      // Own signal server (PeerJS host + presence WS). Defaults come from main.
      if (cfg.signal && cfg.signal.enabled !== false) {
        signalCfg = cfg.signal;
      } else if (cfg.signal && cfg.signal.enabled === false) {
        signalCfg = { enabled: false };
      } else {
        signalCfg = null;
      }
      if (cfg.enabled && cfg.supabaseUrl && cfg.supabaseAnonKey && window.HearthCloud) {
        const res = await window.HearthCloud.init(cfg);
        cloudMode = !!(res && res.ok && window.HearthCloud.isEnabled());
      } else {
        cloudMode = false;
      }
    } catch (e) {
      console.warn("cloud init", e);
      cloudMode = false;
    }
    setCloudBadge();

    if (cloudMode && window.HearthCloud) {
      try {
        const cu = await window.HearthCloud.currentUser();
        if (cu) {
          await enterApp(cu);
          return;
        }
      } catch (e) {
        console.warn(e);
      }
      showAuth();
      return;
    }

    const session = await api.session();
    if (session) await enterApp(session);
    else showAuth();
  })();
})();
