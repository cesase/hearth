/**
 * Toju-inspired asset path resolution.
 * Packaged: process.resourcesPath; dev: project assets/
 */
const path = require("path");
const fs = require("fs");
const { app, nativeImage } = require("electron");

function getAssetPath(...segments) {
  const packagedBase = process.resourcesPath
    ? path.join(process.resourcesPath)
    : null;
  const devBase = path.join(__dirname, "..", "assets");
  const candidates = [];
  if (app.isPackaged && packagedBase) {
    candidates.push(path.join(packagedBase, "assets", ...segments));
    candidates.push(path.join(packagedBase, ...segments));
  }
  candidates.push(path.join(devBase, ...segments));
  candidates.push(path.join(__dirname, "..", "assets", ...segments));
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

function appIconPath() {
  if (process.platform === "win32") {
    return getAssetPath("icon.ico") || getAssetPath("icon.png");
  }
  return getAssetPath("icon.png") || getAssetPath("icon.ico");
}

function appIcon() {
  const p = appIconPath();
  if (!p) return nativeImage.createEmpty();
  const img = nativeImage.createFromPath(p);
  return img.isEmpty() ? nativeImage.createEmpty() : img;
}

module.exports = { getAssetPath, appIconPath, appIcon };
