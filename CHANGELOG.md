# Changelog

## 4.4.0

### Toju-inspired architecture (phase 0–1)

- `ARCHITECTURE.md`, `LESSONS.md`, `docs/TOJU-ADAPT.md`
- `main/display-media.js` — **singleton** `setDisplayMediaRequestHandler` (Toju rule)
- `main/icon.js` — packaged vs dev asset path resolution
- Call hangup: stop tracks + null all media `srcObject` (memory invariant)
- UI smoke: settings tabs coverage

## 4.3.0

### Stabilite & QA
- Playwright UI laboratuvarı (`npm run ui:smoke`) — arayüz otomasyon + screenshot
- `HEARTH_UI_TEST` / `HEARTH_USER_DATA` ile izole test profili
- Production’da gereksiz console gürültüsü azaltıldı

### UI / Ayarlar
- Ayar sekmeleri: Profil → Tema → Dil → Erişilebilirlik → Ses → Tuş → Bildirimler → Güncellemeler → Hesap
- i18n genişletildi (boş arkadaş/grup listeleri, grup üye metinleri, ses etiketleri)
- Çağrı çubuğuna **End** (hangup) eklendi
- Light tema ve durum renkleri (önceki 4.1.x iyileştirmeleri korundu)

### Bilinen sınırlar
- 3+ kişilik ses / sistem sesi gerçek donanım + ağ testi ister (UI lab simüle etmez)
- Kod imzası yok → Windows SmartScreen uyarısı olabilir
