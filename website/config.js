/**
 * GitHub repo bilgisi — kendi kullanıcı adın ve repo adınla değiştir.
 * Site indirme linkleri ve sürüm sorgusu buna göre çalışır.
 *
 * Örnek:
 *   owner: "faruk",
 *   repo: "hearth",
 *   → https://faruk.github.io/hearth/
 *   → https://github.com/faruk/hearth/releases/latest/download/Hearth-Setup.exe
 */
window.HEARTH_SITE = {
  owner: "cesase",
  repo: "hearth",
  /** Setup dosya adı (GitHub Release asset ile aynı olmalı) */
  setupFile: "Hearth-Setup.exe",
};
