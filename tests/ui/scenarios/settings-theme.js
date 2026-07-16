const { launchHearth, log, assert, ARTIFACTS } = require("../harness");
const path = require("path");

(async () => {
  const lab = await launchHearth({ headed: process.argv.includes("--headed") });
  try {
    const { win } = lab;
    await win.locator("#view-auth").waitFor({ state: "visible", timeout: 15000 });
    await win.locator('.tab[data-tab="register"]').click();
    const stamp = Date.now().toString(36).slice(-6);
    await win.locator("#reg-email").fill(`theme_${stamp}@hearth.local`);
    await win.locator("#reg-username").fill(`th_${stamp}`);
    await win.locator("#reg-pass").fill("test1234");
    await win.locator('#form-register button[type="submit"]').click();
    await win.locator("#view-app").waitFor({ state: "visible", timeout: 12000 });
    const onb = win.locator("#btn-onboard-done");
    if (await onb.isVisible().catch(() => false)) await onb.click();

    await win.locator("#btn-open-settings").click();
    await win.locator("#modal-settings").waitFor({ state: "visible" });
    await win.locator('[data-settings-tab="theme"]').click();
    await win.locator('input[name="set-theme"][value="light"]').check({ force: true });
    await win.waitForTimeout(300);
    const theme = await win.locator("html").getAttribute("data-theme");
    assert(theme === "light", "data-theme light olmalı, gelen: " + theme);
    await lab.shot("scenario-theme-light");
    log("settings-theme PASS theme=" + theme);
    console.log("PASS settings-theme →", path.join(ARTIFACTS, "latest.png"));
  } catch (e) {
    await lab.shot("fail-theme").catch(() => {});
    console.error("FAIL", e.message);
    process.exitCode = 1;
  } finally {
    await lab.close();
  }
})();
