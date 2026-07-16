# Hearth

Arkadaşlarla sesli sohbet, ekran paylaşımı ve dosya — P2P.  
Hesap / arkadaş listesi: isteğe bağlı **Supabase**.

## Kullanıcılar için

1. Web sitesinden **Windows için indir** (GitHub Pages — `website/`)  
2. `Hearth-Setup.exe` kur → masaüstü ikonu  
3. Uygulamada **Kayıt ol / Giriş**

Dağıtım ve güncelleme adımları: **[DAGITIM.md](./DAGITIM.md)**  
Bulut (Supabase) kurulum: **[CLOUD.md](./CLOUD.md)**

## Geliştirici

```bash
npm install
npm start          # geliştirme
npm run setup      # dist/Hearth-Setup.exe
npm run pack       # dist/Hearth-Portable.exe
```

### GitHub ayarı (site + auto-update)

`OWNER` / `REPO` değerlerini şuralarda kendi hesabınla değiştir:

- `website/config.js`
- `package.json` → `repository` ve `build.publish`

### Otomatik güncelleme

Kurulu uygulamada (Setup ile): açılışta ve **Ayarlar → Güncellemeleri kontrol et**.  
Yeni sürüm = `package.json` version artır + yeni GitHub Release + `Hearth-Setup.exe` (+ `latest.yml`).

## Kullanım notları

**[NASIL-KULLANILIR.txt](./NASIL-KULLANILIR.txt)**
