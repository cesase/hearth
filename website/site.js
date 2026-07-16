(function () {
  const cfg = window.HEARTH_SITE || { owner: "OWNER", repo: "REPO", setupFile: "Hearth-Setup.exe" };
  const base = "https://github.com/" + cfg.owner + "/" + cfg.repo;
  const latest = base + "/releases/latest/download/" + (cfg.setupFile || "Hearth-Setup.exe");

  const btn = document.getElementById("btn-download");
  const linkRel = document.getElementById("link-releases");
  const linkRepo = document.getElementById("link-repo");
  const verLine = document.getElementById("version-line");

  if (btn) btn.href = latest;
  if (linkRel) linkRel.href = base + "/releases";
  if (linkRepo) linkRepo.href = base;

  // OWNER/REPO henüz doldurulmadıysa tıklamada uyar
  if (btn && (cfg.owner === "OWNER" || cfg.repo === "REPO")) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      alert(
        "Önce website/config.js içinde GitHub kullanıcı adını (owner) ve repo adını yaz.\n\n" +
          "Sonra GitHub Release’e Hearth-Setup.exe yükle."
      );
    });
  }

  // Son sürüm etiketini GitHub API’den çek (opsiyonel, hata olursa sessiz)
  if (cfg.owner !== "OWNER" && cfg.repo !== "REPO" && verLine) {
    fetch("https://api.github.com/repos/" + cfg.owner + "/" + cfg.repo + "/releases/latest")
      .then(function (r) {
        if (!r.ok) throw new Error("no release");
        return r.json();
      })
      .then(function (data) {
        const tag = data.tag_name || data.name;
        if (tag) {
          verLine.textContent = "Son sürüm " + tag + " · Windows 10/11 · x64 · Ücretsiz";
        }
      })
      .catch(function () {
        /* ignore */
      });
  }
})();
