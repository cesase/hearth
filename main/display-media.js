/**
 * Toju invariant: setDisplayMediaRequestHandler is a session-level singleton.
 * Register at most once per app run (window recreate / tray must not re-bind).
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
          callback({});
          return;
        }
        // Windows: her zaman WASAPI loopback dene (istemci track'i kapatabilir).
        // audioRequested false olsa bile loopback vermek capture başarı oranını artırır.
        try {
          callback({ video: source, audio: "loopback" });
        } catch (e1) {
          log("displayMedia loopback failed, video-only", e1);
          try {
            callback({ video: source });
          } catch (e2) {
            log("displayMedia video-only failed", e2);
            callback({});
          }
        }
      } catch (err) {
        log("displayMedia handler", err);
        callback({});
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
