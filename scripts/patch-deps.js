/**
 * electron-builder expects package.json "binary" to be a native-module object.
 * peer (peerjs-server) incorrectly sets "binary" to a CLI path string — strip it.
 * Safe: "bin" field already provides the peerjs CLI entry.
 */
const fs = require("fs");
const path = require("path");

function patchPeer() {
  const pkgPath = path.join(__dirname, "..", "node_modules", "peer", "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const raw = fs.readFileSync(pkgPath, "utf8");
  let j;
  try {
    j = JSON.parse(raw);
  } catch {
    return;
  }
  if (typeof j.binary === "string") {
    delete j.binary;
    fs.writeFileSync(pkgPath, JSON.stringify(j, null, "\t") + "\n", "utf8");
    console.log("[patch-deps] peer: removed invalid string \"binary\" field");
  }
}

patchPeer();
