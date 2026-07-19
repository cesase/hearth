/**
 * Embed flame icon into Hearth.exe without winCodeSign (symlink admin issues).
 * Used as electron-builder afterPack hook.
 */
const path = require("path");
const fs = require("fs");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;
  const exe = path.join(context.appOutDir, "Hearth.exe");
  const ico = path.join(context.packager.projectDir, "assets", "icon.ico");
  if (!fs.existsSync(exe) || !fs.existsSync(ico)) {
    console.warn("[afterPack-icon] skip — missing exe or ico");
    return;
  }
  try {
    // Prefer @electron/rcedit if present, else rcedit package
    let rcedit;
    try {
      rcedit = require("@electron/rcedit");
    } catch {
      rcedit = require("rcedit");
    }
    const fn = rcedit.rcedit || rcedit;
    await fn(exe, { icon: ico });
    console.log("[afterPack-icon] set icon on", exe);
  } catch (e) {
    console.warn("[afterPack-icon] failed:", e && e.message ? e.message : e);
  }
};
