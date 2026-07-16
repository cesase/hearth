# Hearth — Web sitesi, indirme ve güncelleme

## Kısa özet

| Ne | Nerede |
|----|--------|
| Tanıtım sitesi | `website/` → **GitHub Pages** |
| Kurulum dosyası | **GitHub Releases** → `Hearth-Setup.exe` |
| Otomatik güncelleme | Uygulama → GitHub Release (`electron-updater`) |
| Kayıt / giriş | Uygulama içi (Supabase) |

Kullanıcı **tek Setup.exe** indirir → klasör seçer → masaüstü ikonu gelir → program açılır.

---

## 1) GitHub bilgilerini doldur (zorunlu)

**Bu proje için ayarlı hesap:**

| | |
|--|--|
| GitHub | `cesase` |
| Repo | https://github.com/cesase/hearth |
| Site | https://cesase.github.io/hearth/ |
| İndirme | https://github.com/cesase/hearth/releases/latest/download/Hearth-Setup.exe |

(`website/config.js` ve `package.json` buna göre dolu.)

---

## 2) Web sitesini yayınla (GitHub Pages)

1. Bu projeyi GitHub’a push et  
2. Repo → **Settings → Pages**  
3. Source: **Deploy from a branch**  
4. Branch: `main` (veya `master`), folder: **`/website`**  
   - GitHub “/website” sunmuyorsa klasörü `docs/` yapıp `docs` seç, veya root + sadece website dosyaları  
   - En kolayı: Pages için branch’te `website` içeriğini kullan; yeni arayüzde bazen **GitHub Actions** gerekir  

**Pratik yol (önerilen):**

- Option A: Pages → folder `/docs` — o zaman `website/*` dosyalarını `docs/` altına kopyala  
- Option B: Ayrı branch `gh-pages` sadece site dosyaları  

Site adresi:

```text
https://SENIN.github.io/hearth/
```

---

## 3) İlk kurulum paketini üret

Bilgisayarında (geliştirme klasöründe):

```bash
npm install
npm run setup
```

Çıktı:

```text
dist/Hearth-Setup.exe
```

(İsteğe portable: `npm run pack` → `dist/Hearth-Portable.exe`)

### GitHub Release

1. **Releases → Draft a new release**  
2. Tag: `v4.0.0` (package.json `version` ile aynı mantık: `v` + sürüm)  
3. Title: `Hearth 4.0.0`  
4. Assets olarak yükle:
   - `Hearth-Setup.exe` (**isim tam böyle olsun** — site linki buna bağlı)
   - Varsa `latest.yml`, `*.blockmap` (electron-builder ürettiyse — **otomatik güncelleme için gerekli**)
5. Publish release  

`latest.yml` yoksa: electron-builder’ı publish ile çalıştır veya `dist` klasöründe yml ara:

```bash
# GitHub token ile otomatik release (gelişmiş)
# set GH_TOKEN=ghp_...
# npm run publish:win
```

---

## 4) Senin güncelleme ritüelin

Her yeni sürümde:

1. Kodu test et: `npm start`  
2. **`package.json` → `"version"` artır**  
   - `4.0.0` → `4.0.1` (yama)  
   - `4.1.0` (özellik)  
3. `npm run setup`  
4. GitHub’da **yeni Release** (`v4.0.1`)  
5. `Hearth-Setup.exe` + `latest.yml` (+ blockmap) yükle  
6. Kullanıcılar uygulamayı açınca **“Güncelleme var”** görür  

### Kullanıcı tarafı

- Ayarlar → Güvenlik → **Güncellemeleri kontrol et**  
- veya açılıştan ~8 sn sonra otomatik kontrol (kurulu Setup sürümünde)  
- İndir → Yeniden başlat → yeni sürüm  

**Sohbet geçmişi / ayarlar silinmez** (`userData` klasörü).

---

## 5) Otomatik güncelleme ne zaman çalışır?

| Ortam | Güncelleme |
|--------|------------|
| `npm start` (geliştirme) | Yok (bilerek) |
| Kurulu **Hearth-Setup.exe** | Evet |
| Sadece Portable | Sınırlı / güvenilmez — sitede Setup öner |

`package.json` → `build.publish` içindeki `owner` / `repo` yanlışsa kontrol hata verir.

---

## 6) Site içeriği

`website/`:

| Dosya | İş |
|--------|-----|
| `index.html` | Logo, yazı, indir butonu, 3 adım |
| `styles.css` | Görünüm |
| `config.js` | GitHub owner/repo |
| `site.js` | Linkleri doldurur, son sürümü API’den yazar |
| `assets/logo.png` | Logo |

Kayıt web’de değil: **uygulamada** (mevcut bulut kayıt).

---

## 7) Kontrol listesi (ilk sefer)

- [ ] `website/config.js` owner/repo  
- [ ] `package.json` repository + publish owner/repo  
- [ ] Repo push  
- [ ] Pages açık, site açılıyor  
- [ ] `npm run setup`  
- [ ] Release `v4.0.0` + `Hearth-Setup.exe` (+ yml)  
- [ ] Siteden indir → kur → masaüstü ikonu → aç  
- [ ] Uygulamada kayıt  
- [ ] Version bump → ikinci release → eski kurulumda güncelleme testi  

---

## 8) Windows “Bilinmeyen yayıncı”

Kod imzası (Authenticode sertifikası) yoksa SmartScreen uyarısı normal.  
Kullanıcı “Yine de çalıştır” diyebilir. İleride ücretli kod imzalama ile düzelir.
