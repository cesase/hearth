const { launchHearth, log, assert, ARTIFACTS } = require("../harness");
const path = require("path");

(async () => {
  const lab = await launchHearth({ headed: process.argv.includes("--headed") });
  try {
    const { win } = lab;
    await win.locator("#view-auth").waitFor({ state: "visible", timeout: 15000 });
    await win.locator('.tab[data-tab="register"]').click();
    const stamp = Date.now().toString(36).slice(-6);
    await win.locator("#reg-email").fill(`esc_${stamp}@hearth.local`);
    await win.locator("#reg-username").fill(`esc_${stamp}`);
    await win.locator("#reg-pass").fill("test1234");
    await win.locator('#form-register button[type="submit"]').click();
    await win.locator("#view-app").waitFor({ state: "visible", timeout: 12000 });
    const onb = win.locator("#btn-onboard-done");
    if (await onb.isVisible().catch(() => false)) await onb.click();

    await win.locator("#btn-open-settings").click();
    const modal = win.locator("#modal-settings");
    await modal.waitFor({ state: "visible" });
    await win.keyboard.press("Escape");
    await win.waitForTimeout(300);
    assert(!(await modal.isVisible()), "ESC modalı kapatmalı");
    await lab.shot("scenario-modal-esc");
    log("modal-esc PASS");
    console.log("PASS modal-esc →", path.join(ARTIFACTS, "latest.png"));
  } catch (e) {
    await lab.shot("fail-esc").catch(() => {});
    console.error("FAIL", e.message);
    process.exitCode = 1;
  } finally {
    await lab.close();
  }
})();
