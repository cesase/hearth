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
 * @param {{ log?: (msg: string, err?: any) => void }} [opts]
 */
function setupDisplayMedia(opts = {}) {
  const log = opts.log || (() => {});
  const ses = session.defaultSession;

  ses.setPermissionRequestHandler((_wc, permission, callback) => {
    if (permission === "media" || permission === "display-capture") {
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
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 0, height: 0 },
        });
        let source = sources[0];
        if (pendingScreenSourceId) {
          source = sources.find((s) => s.id === pendingScreenSourceId) || source;
        }
        pendingScreenSourceId = null;
        if (!source) {
          respond({});
          return;
        }

        // Electron: audioRequested bazen undefined gelir — sistem sesi için loopback dene.
        // İstemci audio:false gönderdiyse track'i kendisi kapatır.
        const tryLoopback = request.audioRequested !== false;
        if (tryLoopback) {
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
