const { launchHearth, log, assert, ARTIFACTS } = require("../harness");
const path = require("path");

(async () => {
  const lab = await launchHearth({ headed: process.argv.includes("--headed") });
  try {
    const { win } = lab;
    await win.locator("#view-auth").waitFor({ state: "visible", timeout: 15000 });
    await win.locator('.tab[data-tab="register"]').click();
    const stamp = Date.now().toString(36).slice(-6);
    await win.locator("#reg-email").fill(`scen_${stamp}@hearth.local`);
    await win.locator("#reg-username").fill(`sc_${stamp}`);
    await win.locator("#reg-pass").fill("test1234");
    await win.locator('#form-register button[type="submit"]').click();
    await win.locator("#view-app").waitFor({ state: "visible", timeout: 12000 });
    await lab.shot("scenario-auth-local");
    log("auth-local PASS");
    console.log("PASS auth-local →", path.join(ARTIFACTS, "latest.png"));
  } catch (e) {
    await lab.shot("fail-auth-local").catch(() => {});
    console.error("FAIL", e.message);
    process.exitCode = 1;
  } finally {
    await lab.close();
  }
})();
