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

### UI laboratuvarı (arayüzü robot ile dene)

```bash
npm run ui:smoke   # otomatik tıkla + screenshot
npm run ui:lab     # aynı, pencereyi sen de gör
```

Detay: `tests/README.md` · çıktı: `tests/artifacts/latest.png`

### Mimari (Toju kalıpları)

- `ARCHITECTURE.md` — katmanlar  
- `LESSONS.md` — bakım kuralları  
- `docs/TOJU-ADAPT.md` — Toju’dan ne alındı / alınmadı  

### GitHub (cesase)

- Repo: https://github.com/cesase/hearth  
- Site: https://cesase.github.io/hearth/  
- `website/config.js` ve `package.json` publish ayarları `cesase/hearth`

### Otomatik güncelleme

Kurulu uygulamada (Setup ile): açılışta ve **Ayarlar → Güncellemeleri kontrol et**.  
Yeni sürüm = `package.json` version artır + yeni GitHub Release + `Hearth-Setup.exe` (+ `latest.yml`).

## Kullanım notları

**[NASIL-KULLANILIR.txt](./NASIL-KULLANILIR.txt)**
