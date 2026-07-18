# Changelog

## 4.6.0

### Splitter + stabilite release

- **Medya ↔ sohbet splitter** yeniden yazıldı: `mousedown`/`mousemove` ile güvenilir sürükleme, `height !important`, sürüklerken transition kapalı
- Splitter görünür tutamak + daha geniş tıklama alanı; arama paneli açıkken görünür
- Port 9000 doluyken çökme yok; **tek örnek** (ikinci tıklama mevcut pencereyi öne getirir)
- Durum menüsü renk noktaları (yeşil / sarı / kırmızı / gri)
- Cevapsız çağrı spam koruması, arama timer’ı bağlantıdan sonra
- Multi-size ateş ikonu + paket `extraResources`

## 4.5.1

### Video güncellemesi (UI polish + stabilite)

- **Durum menüsü:** Çevrimiçi / Boşta / Rahatsız etme / Görünmez etiketleri + renkli nokta, daha temiz panel
- **Üst bar:** Stage header hizalama
- **“Boyut” slider kaldırıldı** → Discord tarzı **sürükle ayırıcı** (medya ↔ sohbet); yükseklik ayarlara kaydedilir
- **İkon:** Çok boyutlu `icon.ico` (16–256); `extraResources` ile paket; tray resize iyileştirmesi
- **Cevapsız çağrı spam:** 45 sn içinde aynı arkadaş için tek kayıt
- **“Görüşme sona erdi” spam:** kısa cooldown
- **Arama zamanlayıcısı:** yalnızca bağlantı kurulunca sayar (ring sırasında `…`)
- **Arama UX:** P2P yok / çevrimdışı / meşgul için net etiket + daha kısa timeout + tek açıklama mesajı

## 4.5.0

### Own signal server (phase 2)

- `signal-server/` — ExpressPeerServer (`/peerjs`) + presence WebSocket (`/presence`) + `/health`
- Electron can **embed** the signal process for `127.0.0.1` / localhost (`signal.embed`)
- Client: `buildPeerOptions` points PeerJS at own host; public PeerJS only if `signal.enabled: false`
- `public/infrastructure/presence-client.js` — roster + status_update (status + status text)
- Config: `cloud/signal.example.json`, `cloud/config.example.json` → `signal` block
- Scripts: `npm run signal` (standalone host for LAN/VPS)
- Packaged build includes `signal-server/**/*`

### Config (friends must share the same host)

```json
"signal": {
  "enabled": true,
  "host": "127.0.0.1",
  "port": 9000,
  "secure": false,
  "peerPath": "/peerjs",
  "presencePath": "/presence",
  "embed": true
}
```

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
