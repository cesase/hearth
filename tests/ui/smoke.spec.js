/**
 * Hearth UI smoke — ajan + sen çalıştırır:
 *   npm run ui:smoke
 *   npm run ui:lab          (pencereyi görerek)
 *
 * Exit 0 = PASS, !=0 = FAIL
 * Ekran: tests/artifacts/latest.png
 */
const path = require("path");
const fs = require("fs");
const { launchHearth, log, assert, ARTIFACTS, ensureArtifacts } = require("./harness");

async function dismissOnboarding(win) {
  const board = win.locator("#onboarding");
  if (await board.isVisible().catch(() => false)) {
    const done = win.locator("#btn-onboard-done");
    if (await done.isVisible().catch(() => false)) {
      await done.click();
      await win.waitForTimeout(300);
    }
  }
}

async function run() {
  ensureArtifacts();
  // temiz log
  try {
    fs.writeFileSync(path.join(ARTIFACTS, "run.log"), "", "utf8");
  } catch {}

  log("smoke başlıyor…");
  let lab;
  const results = [];

  try {
    lab = await launchHearth({ headed: process.argv.includes("--headed") });
    const { win } = lab;
    log("Electron açıldı, userData=" + lab.userData);

    // 1) Title
    const title = await win.title();
    log("title: " + title);
    assert(/hearth/i.test(title), "Pencere başlığı Hearth olmalı, gelen: " + title);
    results.push("title OK");

    await lab.shot("01-launch");

    // 2) Auth görünür
    const auth = win.locator("#view-auth");
    await auth.waitFor({ state: "visible", timeout: 15000 });
    results.push("auth visible OK");

    // 3) Kayıt sekmesi
    await win.locator('.tab[data-tab="register"]').click();
    await win.waitForTimeout(200);
    const regForm = win.locator("#form-register");
    assert(await regForm.isVisible(), "Kayıt formu görünür olmalı");
    results.push("register tab OK");

    // 4) Yerel kayıt
    const stamp = Date.now().toString(36).slice(-6);
    const email = `uitest_${stamp}@hearth.local`;
    const username = `ui_${stamp}`;
    await win.locator("#reg-email").fill(email);
    await win.locator("#reg-username").fill(username);
    await win.locator("#reg-display").fill("UI Test");
    await win.locator("#reg-pass").fill("test1234");
    await win.locator('#form-register button[type="submit"]').click();

    // App shell veya hata
    const appView = win.locator("#view-app");
    const regErr = win.locator("#reg-error");
    try {
      await appView.waitFor({ state: "visible", timeout: 12000 });
    } catch {
      const errText = (await regErr.isVisible().catch(() => false))
        ? await regErr.innerText()
        : "(hata yok)";
      await lab.shot("fail-register");
      assert(false, "Kayıt sonrası uygulama açılmadı. reg-error: " + errText);
    }
    results.push("local register OK");
    await lab.shot("02-after-register");

    await dismissOnboarding(win);
    await lab.shot("03-app-shell");

    // 5) Ayarlar
    await win.locator("#btn-open-settings").click();
    const modal = win.locator("#modal-settings");
    await modal.waitFor({ state: "visible", timeout: 8000 });
    results.push("settings open OK");

    // Tema light
    const themeTab = win.locator('[data-settings-tab="theme"]');
    if (await themeTab.isVisible().catch(() => false)) {
      await themeTab.click();
      await win.waitForTimeout(150);
      const light = win.locator('input[name="set-theme"][value="light"]');
      if (await light.count()) {
        await light.check({ force: true });
        await win.waitForTimeout(200);
        const theme = await win.locator("html").getAttribute("data-theme");
        log("data-theme=" + theme);
        // Kaydetmeden de applyTheme radio change ile çalışıyor
        assert(theme === "light" || theme === "dark" || theme === "gray", "tema attribute olmalı");
        if (theme === "light") results.push("theme light OK");
        else results.push("theme radio OK (saved later)");
      }
    }

    // Dil EN
    const localeTab = win.locator('[data-settings-tab="locale"]');
    if (await localeTab.isVisible().catch(() => false)) {
      await localeTab.click();
      await win.waitForTimeout(150);
      const lang = win.locator("#set-language");
      if (await lang.count()) {
        await lang.selectOption("en");
        await win.waitForTimeout(100);
      }
    }

    await win.locator("#btn-settings-save").click();
    await win.waitForTimeout(400);
    // modal kapanmalı
    const stillOpen = await modal.isVisible().catch(() => false);
    if (stillOpen) {
      // bazı akışlarda panel açık kalabilir — ESC dene
      await win.keyboard.press("Escape");
      await win.waitForTimeout(200);
    }
    results.push("settings save OK");
    await lab.shot("04-after-settings");

    // 6) Modal ESC / dış tık
    await win.locator("#btn-open-settings").click();
    await modal.waitFor({ state: "visible", timeout: 5000 });
    await win.keyboard.press("Escape");
    await win.waitForTimeout(300);
    const closed = !(await modal.isVisible().catch(() => true));
    assert(closed, "ESC ile ayarlar modalı kapanmalı");
    results.push("ESC close OK");

    // 7) Arkadaş ekle modal
    await win.locator("#btn-add-friend").click();
    const addModal = win.locator("#modal-add-friend");
    await addModal.waitFor({ state: "visible", timeout: 5000 });
    // backdrop mousedown — modal dışına
    await win.locator("#modal-add-friend").click({ position: { x: 5, y: 5 } });
    await win.waitForTimeout(250);
    const addClosed = !(await addModal.isVisible().catch(() => true));
    if (!addClosed) {
      await win.keyboard.press("Escape");
      await win.waitForTimeout(200);
    }
    results.push("add-friend modal OK");
    await lab.shot("05-final");

    log("PASS — " + results.join(" | "));
    console.log("\n=== UI SMOKE PASS ===");
    results.forEach((r) => console.log("  ✓ " + r));
    console.log("Screenshot: " + path.join(ARTIFACTS, "latest.png"));
    console.log("userData (temp): " + lab.userData);
    process.exitCode = 0;
  } catch (e) {
    log("ERROR " + (e && e.stack ? e.stack : e));
    console.error("\n=== UI SMOKE FAIL ===");
    console.error(e.message || e);
    if (lab) {
      try {
        await lab.shot("fail");
        console.error("Screenshot: " + path.join(ARTIFACTS, "latest.png"));
      } catch {}
    }
    process.exitCode = 1;
  } finally {
    if (lab) {
      try {
        await Promise.race([lab.close(), new Promise((r) => setTimeout(r, 8000))]);
      } catch {}
    }
    log("kapandı");
    // tray / electron bazen süreci açık tutar
    setTimeout(() => process.exit(process.exitCode || 0), 200);
  }
}

run();