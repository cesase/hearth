/**
 * Display-media singleton (Toju rule).
 * Callback EXACTLY once. Prefer WASAPI loopback when audio is wanted.
 */
const { session, desktopCapturer } = require("electron");

let displayMediaHandlerConfigured = false;
let pendingScreenSourceId = null;

function shouldRegisterDisplayMediaHandler(platform, alreadyConfigured) {
  if (alreadyConfigured) return false;
  return platform === "win32" || platform === "linux";
}

function setPendingScreenSourceId(id) {
  pendingScreenSourceId = id || null;
}

/**
 * @param {{ log?: (msg: string, err?: any) => void, isTrustedWebContents?: (wc: Electron.WebContents) => boolean }} [opts]
 */
function setupDisplayMedia(opts = {}) {
  const log = opts.log || (() => {});
  const isTrustedWebContents = opts.isTrustedWebContents || (() => false);
  const ses = session.defaultSession;

  ses.setPermissionCheckHandler((wc, permission) => {
    return isTrustedWebContents(wc) && (permission === "media" || permission === "display-capture");
  });

  ses.setPermissionRequestHandler((wc, permission, callback) => {
    if (isTrustedWebContents(wc) && (permission === "media" || permission === "display-capture")) {
      callback(true);
      return;
    }
    callback(false);
  });

  if (!shouldRegisterDisplayMediaHandler(process.platform, displayMediaHandlerConfigured)) {
    return { alreadyConfigured: displayMediaHandlerConfigured };
  }

  try {
    ses.setDisplayMediaRequestHandler(async (request, callback) => {
      let done = false;
      const respond = (payload) => {
        if (done) return;
        done = true;
        try {
          callback(payload);
        } catch (e) {
          log("displayMedia callback", e);
        }
      };

      try {
        // Ekran yakalama yalnızca kaynak seçici üzerinden verilen tek kullanımlık
        // source id ile başlayabilir. Renderer'ın sessizce ilk ekranı seçmesini engeller.
        if (!pendingScreenSourceId) {
          respond({});
          return;
        }
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 0, height: 0 },
        });
        const source = sources.find((s) => s.id === pendingScreenSourceId);
        pendingScreenSourceId = null;
        if (!source) {
          respond({});
          return;
        }

        // Windows WASAPI loopback = varsayılan SES ÇIKIŞ cihazı mix'i
        // (hoparlör/kulaklıkta çalan video/oyun/müzik). Tüm ekran veya pencere
        // fark etmez — loopback çıkış aygıtına bağlıdır.
        // İstemci audio:false isterse track'leri renderer kapatır.
        const wantLoopback = request.audioRequested !== false;
        if (wantLoopback) {
          respond({ video: source, audio: "loopback" });
        } else {
          respond({ video: source });
        }
      } catch (err) {
        log("displayMedia handler", err);
        respond({});
      }
    });
    displayMediaHandlerConfigured = true;
  } catch (e) {
    log("displayMedia setup failed", e);
  }

  return { alreadyConfigured: displayMediaHandlerConfigured };
}

module.exports = {
  setupDisplayMedia,
  setPendingScreenSourceId,
  shouldRegisterDisplayMediaHandler,
  isDisplayMediaConfigured: () => displayMediaHandlerConfigured,
};
