/**
 * Tek senaryo çalıştır:
 *   node tests/ui/run-scenario.js settings-theme
 *   node tests/ui/run-scenario.js auth-local --headed
 */
const path = require("path");
const fs = require("fs");

const name = process.argv[2];
if (!name) {
  console.error("Kullanım: node tests/ui/run-scenario.js <senaryo-adı> [--headed]");
  console.error("Örnekler: auth-local | settings-theme | modal-esc");
  process.exit(1);
}

const file = path.join(__dirname, "scenarios", name.endsWith(".js") ? name : name + ".js");
if (!fs.existsSync(file)) {
  console.error("Senaryo yok:", file);
  process.exit(1);
}

require(file);
