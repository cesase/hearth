/**
 * Hearth 4.5 — Değişiklikler, Nedenler ve Kavramlar
 * Dark technical briefing (16:9)
 */
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Hearth";
pres.title = "Hearth 4.5 — Değişiklikler ve Kavramlar";
pres.subject = "Faz 2 signal sunucusu brifingi";

const C = {
  bg: "0F1117",
  card: "171A21",
  ink: "F2F0EA",
  muted: "A8A49B",
  dim: "6B6760",
  faint: "2A2E38",
  line: "2A2E38",
  purple: "8B7CFF",
  amber: "E8A838",
  green: "6BCB8B",
  red: "E07070",
  blue: "6BA3E8",
};

const FONT = "Arial";
const TOTAL = 16;

function header(slide, section) {
  slide.addText("HEARTH", {
    x: 0.5, y: 0.28, w: 2, h: 0.32,
    fontFace: FONT, fontSize: 12, color: C.ink, bold: true, margin: 0, charSpacing: 2,
  });
  slide.addText(section, {
    x: 4.5, y: 0.28, w: 5, h: 0.32,
    fontFace: FONT, fontSize: 11, color: C.muted, align: "right", margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.62, w: 9, h: 0.015,
    fill: { color: C.line }, line: { type: "none" },
  });
}

function footer(slide, n) {
  slide.addText("4.5.0 · Faz 2 signal", {
    x: 0.5, y: 5.28, w: 4, h: 0.25,
    fontFace: FONT, fontSize: 10, color: C.dim, margin: 0,
  });
  slide.addText(`${String(n).padStart(2, "0")} / ${TOTAL}`, {
    x: 8.2, y: 5.28, w: 1.3, h: 0.25,
    fontFace: FONT, fontSize: 10, color: C.dim, align: "right", margin: 0,
  });
}

function card(slide, x, y, w, h) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: C.card },
    line: { color: C.faint, width: 1 },
    rectRadius: 0.08,
  });
}

function title(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 0.78, w: 9, h: 0.45,
    fontFace: FONT, fontSize: 22, color: C.ink, bold: true, margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1 — Kapak
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.purple }, line: { type: "none" },
  });
  s.addText("HEARTH  4.5.0", {
    x: 0.7, y: 1.4, w: 8, h: 0.35,
    fontFace: FONT, fontSize: 14, color: C.purple, bold: true, charSpacing: 3, margin: 0,
  });
  s.addText("Ne değişti, neden değişti\nve terimler ne işe yarar?", {
    x: 0.7, y: 1.95, w: 8.5, h: 1.5,
    fontFace: FONT, fontSize: 32, color: C.ink, bold: true, margin: 0,
  });
  s.addText("Teknik brifing · Kendi signal sunucusu (Faz 2) · Toju kalıpları bağlamı", {
    x: 0.7, y: 3.7, w: 8.5, h: 0.4,
    fontFace: FONT, fontSize: 14, color: C.muted, margin: 0,
  });
  s.addText("Discord alternatifi P2P masaüstü uygulaması", {
    x: 0.7, y: 4.9, w: 8, h: 0.3,
    fontFace: FONT, fontSize: 12, color: C.dim, margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 2 — Hearth nedir?
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "BAĞLAM");
  title(s, "Hearth nedir?");
  footer(s, 2);

  const items = [
    { t: "Ürün", d: "Arkadaşlarla ses, ekran paylaşımı, dosya ve sohbet — masaüstü (Electron)." },
    { t: "Medya modeli", d: "P2P (cihazlar arası). Ses/görüntü sunucudan geçmez." },
    { t: "İsteğe bağlı bulut", d: "Supabase: hesap, arkadaş isteği. Medya taşımaz." },
    { t: "Olmayan şey", d: "Tam Discord kopyası değil; sunucu/oda/plugin pazarı yok." },
  ];
  items.forEach((it, i) => {
    const y = 1.4 + i * 0.9;
    card(s, 0.5, y, 9, 0.8);
    s.addText(it.t, {
      x: 0.7, y: y + 0.12, w: 2.2, h: 0.55,
      fontFace: FONT, fontSize: 14, color: C.amber, bold: true, valign: "middle", margin: 0,
    });
    s.addText(it.d, {
      x: 3.0, y: y + 0.12, w: 6.2, h: 0.55,
      fontFace: FONT, fontSize: 14, color: C.ink, valign: "middle", margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3 — Önceki sorun
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "PROBLEM");
  title(s, "Önceki durum: ne eksikti?");
  footer(s, 3);

  card(s, 0.5, 1.4, 4.35, 3.4);
  s.addText("BAĞIMLILIK", {
    x: 0.75, y: 1.6, w: 3.9, h: 0.35,
    fontFace: FONT, fontSize: 12, color: C.red, bold: true, margin: 0,
  });
  s.addText("Public PeerJS\n(0.peerjs.com)", {
    x: 0.75, y: 2.1, w: 3.9, h: 0.9,
    fontFace: FONT, fontSize: 20, color: C.ink, bold: true, margin: 0,
  });
  s.addText("WebRTC bağlantı sinyali üçüncü parti bulutta. Kontrol, gizlilik ve LAN senaryosu sınırlı.", {
    x: 0.75, y: 3.2, w: 3.9, h: 1.3,
    fontFace: FONT, fontSize: 13, color: C.muted, margin: 0,
  });

  card(s, 5.15, 1.4, 4.35, 3.4);
  s.addText("SONUÇ", {
    x: 5.4, y: 1.6, w: 3.9, h: 0.35,
    fontFace: FONT, fontSize: 12, color: C.amber, bold: true, margin: 0,
  });
  const probs = [
    "Sinyal “bizim evimizde” değil",
    "Presence (kim online) dağınık",
    "Toju tarzı kendi sunucu yok",
    "LAN/VPS ile tek host zor",
  ];
  probs.forEach((p, i) => {
    s.addText("▸  " + p, {
      x: 5.4, y: 2.15 + i * 0.5, w: 3.9, h: 0.4,
      fontFace: FONT, fontSize: 14, color: C.ink, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 — Faz 2 hedefi
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "HEDEF");
  title(s, "Faz 2: kendi signal sunucusu");
  footer(s, 4);

  const goals = [
    { n: "01", t: "Kendi host", d: "PeerJS sinyali 127.0.0.1, LAN IP veya VPS’te." },
    { n: "02", t: "Presence", d: "Kim online, durum ve status text — WebSocket ile." },
    { n: "03", t: "Medya hâlâ P2P", d: "Ses / ekran / dosya sunucudan geçmez." },
    { n: "04", t: "Geri dönüş", d: "signal.enabled:false → public PeerJS fallback." },
  ];
  goals.forEach((g, i) => {
    const x = 0.5 + (i % 2) * 4.7;
    const y = 1.4 + Math.floor(i / 2) * 1.7;
    card(s, x, y, 4.45, 1.5);
    s.addText(g.n, {
      x: x + 0.25, y: y + 0.25, w: 1, h: 0.35,
      fontFace: FONT, fontSize: 16, color: C.purple, bold: true, margin: 0,
    });
    s.addText(g.t, {
      x: x + 0.25, y: y + 0.6, w: 3.9, h: 0.3,
      fontFace: FONT, fontSize: 16, color: C.ink, bold: true, margin: 0,
    });
    s.addText(g.d, {
      x: x + 0.25, y: y + 0.95, w: 3.9, h: 0.4,
      fontFace: FONT, fontSize: 12, color: C.muted, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 5 — Mimari diyagram
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "MİMARİ");
  title(s, "Sinyal sunucuda · medya P2P");
  footer(s, 5);

  // Boxes
  const boxes = [
    { x: 0.5, label: "Hearth istemci", sub: "Electron + UI\nPeerJS client", c: C.purple },
    { x: 3.55, label: "signal-server", sub: "/peerjs  ·  /presence\n/health", c: C.amber },
    { x: 6.6, label: "Arkadaş cihazı", sub: "Diğer Hearth\nistemcisi", c: C.green },
  ];
  boxes.forEach((b) => {
    card(s, b.x, 1.55, 2.85, 1.55);
    s.addShape(pres.shapes.RECTANGLE, {
      x: b.x, y: 1.55, w: 2.85, h: 0.08, fill: { color: b.c }, line: { type: "none" },
    });
    s.addText(b.label, {
      x: b.x + 0.15, y: 1.8, w: 2.55, h: 0.35,
      fontFace: FONT, fontSize: 14, color: C.ink, bold: true, margin: 0, align: "center",
    });
    s.addText(b.sub, {
      x: b.x + 0.15, y: 2.25, w: 2.55, h: 0.65,
      fontFace: FONT, fontSize: 12, color: C.muted, margin: 0, align: "center",
    });
  });

  s.addText("◄── signaling (SDP / ICE / presence) ──►", {
    x: 0.5, y: 3.3, w: 9, h: 0.3,
    fontFace: FONT, fontSize: 12, color: C.amber, align: "center", margin: 0,
  });

  card(s, 1.5, 3.8, 7, 1.1);
  s.addText("WebRTC medya + data channel (ses, ekran, dosya, sohbet)", {
    x: 1.7, y: 3.95, w: 6.6, h: 0.35,
    fontFace: FONT, fontSize: 14, color: C.ink, bold: true, align: "center", margin: 0,
  });
  s.addText("Doğrudan cihazlar arası · signal-server bu trafiği taşımaz", {
    x: 1.7, y: 4.4, w: 6.6, h: 0.3,
    fontFace: FONT, fontSize: 12, color: C.green, align: "center", margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 6 — Değişen dosyalar
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "DEĞİŞİKLİKLER");
  title(s, "Neler eklendi / değişti?");
  footer(s, 6);

  const rows = [
    ["signal-server/", "Kendi PeerJS + presence sunucusu"],
    ["presence-client.js", "İstemci: roster ve durum WS"],
    ["main.js", "Config + isteğe bağlı embed signal"],
    ["app.js", "Peer host, presence, status push"],
    ["cloud/*example*.json", "signal bloğu dokümantasyonu"],
    ["scripts/patch-deps.js", "electron-builder + peer uyumu"],
    ["docs / CHANGELOG", "Mimari ve sürüm notları"],
  ];
  // header row
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.35, w: 9, h: 0.38, fill: { color: C.card }, line: { type: "none" },
  });
  s.addText("Dosya / alan", {
    x: 0.65, y: 1.4, w: 3.2, h: 0.3,
    fontFace: FONT, fontSize: 11, color: C.dim, bold: true, margin: 0,
  });
  s.addText("Ne işe yarıyor / neden", {
    x: 4.0, y: 1.4, w: 5.3, h: 0.3,
    fontFace: FONT, fontSize: 11, color: C.dim, bold: true, margin: 0,
  });
  rows.forEach((r, i) => {
    const y = 1.78 + i * 0.42;
    if (i % 2 === 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y, w: 9, h: 0.42, fill: { color: "14171E" }, line: { type: "none" },
      });
    }
    s.addText(r[0], {
      x: 0.65, y: y + 0.05, w: 3.2, h: 0.32,
      fontFace: FONT, fontSize: 12, color: C.purple, margin: 0,
    });
    s.addText(r[1], {
      x: 4.0, y: y + 0.05, w: 5.3, h: 0.32,
      fontFace: FONT, fontSize: 12, color: C.ink, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 7 — signal-server endpoint’leri
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "SIGNAL-SERVER");
  title(s, "Üç kapı: peerjs · presence · health");
  footer(s, 7);

  const eps = [
    { path: "/peerjs", role: "PeerJS sinyali", why: "WebRTC bağlantısı için offer/answer/ICE mesajları. Ses ve video buradan akmaz.", c: C.purple },
    { path: "/presence", role: "Durum WebSocket", why: "identify, roster, status_update. Kim çevrimiçi, idle/dnd, status text.", c: C.amber },
    { path: "/health", role: "Sağlık kontrolü", why: "Sunucu ayakta mı? Online sayısı. Ops / smoke için.", c: C.green },
  ];
  eps.forEach((e, i) => {
    const y = 1.4 + i * 1.15;
    card(s, 0.5, y, 9, 1.05);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: y + 0.28, w: 2.1, h: 0.5,
      fill: { color: C.bg }, line: { color: e.c, width: 1.5 }, rectRadius: 0.06,
    });
    s.addText(e.path, {
      x: 0.7, y: y + 0.28, w: 2.1, h: 0.5,
      fontFace: FONT, fontSize: 13, color: e.c, bold: true, align: "center", valign: "middle", margin: 0,
    });
    s.addText(e.role, {
      x: 3.1, y: y + 0.18, w: 6.1, h: 0.3,
      fontFace: FONT, fontSize: 15, color: C.ink, bold: true, margin: 0,
    });
    s.addText(e.why, {
      x: 3.1, y: y + 0.52, w: 6.1, h: 0.4,
      fontFace: FONT, fontSize: 12, color: C.muted, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 8 — Embed vs ayrı sunucu
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "ÇALIŞTIRMA");
  title(s, "Embed mi, ayrı sunucu mu?");
  footer(s, 8);

  card(s, 0.5, 1.4, 4.35, 3.4);
  s.addText("EMBED (varsayılan)", {
    x: 0.75, y: 1.6, w: 3.9, h: 0.35,
    fontFace: FONT, fontSize: 13, color: C.purple, bold: true, margin: 0,
  });
  s.addText("npm start", {
    x: 0.75, y: 2.1, w: 3.9, h: 0.4,
    fontFace: FONT, fontSize: 20, color: C.ink, bold: true, margin: 0,
  });
  s.addText("Electron açılırken main.js 127.0.0.1:9000’de signal’i süreç içi başlatır.\n\nAynı bilgisayarda / tek kullanıcı test için yeterli.\n\nsignal.embed: true", {
    x: 0.75, y: 2.65, w: 3.9, h: 1.9,
    fontFace: FONT, fontSize: 13, color: C.muted, margin: 0,
  });

  card(s, 5.15, 1.4, 4.35, 3.4);
  s.addText("AYRI SUNUCU (LAN / VPS)", {
    x: 5.4, y: 1.6, w: 3.9, h: 0.35,
    fontFace: FONT, fontSize: 13, color: C.amber, bold: true, margin: 0,
  });
  s.addText("npm run signal", {
    x: 5.4, y: 2.1, w: 3.9, h: 0.4,
    fontFace: FONT, fontSize: 20, color: C.ink, bold: true, margin: 0,
  });
  s.addText("Tüm arkadaşlar aynı host IP/domain’i kullanır.\n\nembed: false, host: LAN IP veya domain.\n\nFarklı PC’lerde “online görünmeme”nin çözümü.", {
    x: 5.4, y: 2.65, w: 3.9, h: 1.9,
    fontFace: FONT, fontSize: 13, color: C.muted, margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 9 — İstemci tarafı
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "İSTEMCİ");
  title(s, "app.js ve presence-client ne yapıyor?");
  footer(s, 9);

  const parts = [
    { t: "signalCfg", d: "cloud-config’ten okunur. host/port/path. Peer nereye bağlansın?" },
    { t: "buildPeerOptions", d: "Kendi host varsa PeerJS’i oraya yönlendirir; yoksa public fallback." },
    { t: "startSignalPresence", d: "HearthPresence.connect — roster ve status_update dinler." },
    { t: "updateStatus", d: "Durum / status text değişince hem P2P hello hem presence WS." },
  ];
  parts.forEach((p, i) => {
    const y = 1.35 + i * 0.9;
    card(s, 0.5, y, 9, 0.8);
    s.addText(p.t, {
      x: 0.7, y: y + 0.2, w: 3.0, h: 0.4,
      fontFace: FONT, fontSize: 14, color: C.amber, bold: true, margin: 0, valign: "middle",
    });
    s.addText(p.d, {
      x: 3.8, y: y + 0.15, w: 5.4, h: 0.5,
      fontFace: FONT, fontSize: 13, color: C.ink, margin: 0, valign: "middle",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 10 — Bug fix’ler
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "DÜZELTMELER");
  title(s, "Kritik bug’lar ve nedenleri");
  footer(s, 10);

  const bugs = [
    { bug: "signalCfg hiç atanmıyordu", why: "Boot’ta cloud-config okunuyordu ama signal bloğu değişkene yazılmıyordu → her zaman public PeerJS.", fix: "Init’te cfg.signal → signalCfg" },
    { bug: "Presence WS 400", why: "PeerJS tüm WebSocket upgrade’leri ele alıp /presence’i reddediyordu.", fix: "Upgrade: önce /presence, sonra PeerJS" },
    { bug: "Kurulum build kırılıyordu", why: "peer paketinde hatalı \"binary\" string alanı electron-builder’ı çökertiyordu.", fix: "scripts/patch-deps.js + postinstall" },
  ];
  bugs.forEach((b, i) => {
    const y = 1.35 + i * 1.2;
    card(s, 0.5, y, 9, 1.1);
    s.addText((i + 1) + ".  " + b.bug, {
      x: 0.7, y: y + 0.12, w: 8.5, h: 0.28,
      fontFace: FONT, fontSize: 14, color: C.red, bold: true, margin: 0,
    });
    s.addText("Neden: " + b.why, {
      x: 0.7, y: y + 0.42, w: 8.5, h: 0.28,
      fontFace: FONT, fontSize: 12, color: C.muted, margin: 0,
    });
    s.addText("Çözüm: " + b.fix, {
      x: 0.7, y: y + 0.7, w: 8.5, h: 0.28,
      fontFace: FONT, fontSize: 12, color: C.green, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 11 — Config sözlüğü
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "CONFIG");
  title(s, "signal bloğu alanları");
  footer(s, 11);

  const fields = [
    ["enabled", "false ise public PeerJS; true ise kendi host"],
    ["host", "Sunucu adresi (127.0.0.1, LAN IP, domain)"],
    ["port", "Varsayılan 9000"],
    ["secure", "true → wss/https (TLS arkasında)"],
    ["peerPath", "PeerJS yolu, genelde /peerjs"],
    ["presencePath", "Presence WS yolu, genelde /presence"],
    ["embed", "true → Electron içinde başlat (yalnızca local host)"],
  ];
  fields.forEach((f, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = 0.5 + col * 4.7;
    const y = 1.4 + row * 0.9;
    card(s, x, y, 4.45, 0.8);
    s.addText(f[0], {
      x: x + 0.2, y: y + 0.12, w: 4.0, h: 0.25,
      fontFace: FONT, fontSize: 13, color: C.purple, bold: true, margin: 0,
    });
    s.addText(f[1], {
      x: x + 0.2, y: y + 0.4, w: 4.0, h: 0.3,
      fontFace: FONT, fontSize: 12, color: C.muted, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 12 — Terimler 1
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "SÖZLÜK 1");
  title(s, "Bağlantı ve medya terimleri");
  footer(s, 12);

  const terms = [
    { t: "WebRTC", d: "Tarayıcı/Electron’da gerçek zamanlı ses, görüntü ve veri protokol ailesi." },
    { t: "P2P", d: "Peer-to-peer: medya sunucu üzerinden değil, cihazlar arasında akar." },
    { t: "Signaling", d: "Bağlantıyı kurmak için küçük kontrol mesajları. Medya taşımaz." },
    { t: "SDP", d: "Session Description: “hangi codec, ne göndereceğim?” teklifi." },
    { t: "ICE", d: "Ağ yollarını dener (NAT traversal). “Hangi IP/port ile buluşalım?”" },
    { t: "PeerJS", d: "WebRTC’yi basitleştiren kütüphane; ID ve Media/DataConnection." },
  ];
  terms.forEach((tm, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7;
    const y = 1.35 + row * 1.2;
    card(s, x, y, 4.45, 1.05);
    s.addText(tm.t, {
      x: x + 0.2, y: y + 0.15, w: 4.0, h: 0.3,
      fontFace: FONT, fontSize: 15, color: C.amber, bold: true, margin: 0,
    });
    s.addText(tm.d, {
      x: x + 0.2, y: y + 0.5, w: 4.0, h: 0.45,
      fontFace: FONT, fontSize: 12, color: C.ink, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 13 — Terimler 2
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "SÖZLÜK 2");
  title(s, "Sunucu, durum ve paketleme");
  footer(s, 13);

  const terms = [
    { t: "ExpressPeerServer", d: "Node/Express üzerinde PeerJS sunucu parçası (/peerjs)." },
    { t: "Presence / roster", d: "Kim online listesi; durum (online, idle, dnd, invisible)." },
    { t: "statusText", d: "Kullanıcının kısa durum yazısı (“Toplantıda” vb.)." },
    { t: "WebSocket", d: "İki yönlü anlık kanal; presence için kullanıyoruz." },
    { t: "Embed", d: "Signal sürecinin Electron main içinde ayağa kalkması." },
    { t: "Supabase", d: "Opsiyonel auth/arkadaş bulutu; medya ve signal değil." },
    { t: "electron-builder", d: "Hearth-Setup.exe ve auto-update artefaktları üretir." },
    { t: "UI smoke", d: "Playwright ile arayüz tıklama testi (npm run ui:smoke)." },
  ];
  terms.forEach((tm, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7;
    const y = 1.3 + row * 0.92;
    card(s, x, y, 4.45, 0.85);
    s.addText(tm.t, {
      x: x + 0.18, y: y + 0.1, w: 4.1, h: 0.25,
      fontFace: FONT, fontSize: 13, color: C.purple, bold: true, margin: 0,
    });
    s.addText(tm.d, {
      x: x + 0.18, y: y + 0.4, w: 4.1, h: 0.35,
      fontFace: FONT, fontSize: 11, color: C.muted, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 14 — Toju
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "TOJU");
  title(s, "Ne alındı, ne alınmadı?");
  footer(s, 14);

  card(s, 0.5, 1.4, 4.35, 3.4);
  s.addText("ALINDI (kalıplar)", {
    x: 0.75, y: 1.6, w: 3.9, h: 0.35,
    fontFace: FONT, fontSize: 13, color: C.green, bold: true, margin: 0,
  });
  [
    "Kendi signal sunucusu",
    "Medya sunucuya girmez kuralı",
    "Display-media singleton",
    "İkon / asset path disiplini",
    "Stream cleanup (hangup)",
    "UI lab / e2e düşüncesi",
  ].forEach((t, i) => {
    s.addText("▸  " + t, {
      x: 0.75, y: 2.15 + i * 0.4, w: 3.9, h: 0.35,
      fontFace: FONT, fontSize: 13, color: C.ink, margin: 0,
    });
  });

  card(s, 5.15, 1.4, 4.35, 3.4);
  s.addText("ALINMADI", {
    x: 5.4, y: 1.6, w: 3.9, h: 0.35,
    fontFace: FONT, fontSize: 13, color: C.red, bold: true, margin: 0,
  });
  [
    "Angular 21 monorepo",
    "Oda / sunucu / plugin CQRS",
    "TypeORM backend ürünü",
    "Capacitor mobil",
    "Toju’yu Hearth yerine koymak",
  ].forEach((t, i) => {
    s.addText("▸  " + t, {
      x: 5.4, y: 2.15 + i * 0.4, w: 3.9, h: 0.35,
      fontFace: FONT, fontSize: 13, color: C.ink, margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 15 — Nasıl kullanılır
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "KULLANIM");
  title(s, "Günlük komutlar");
  footer(s, 15);

  const cmds = [
    { cmd: "npm start", d: "Uygulama + gömülü signal (local)" },
    { cmd: "npm run signal", d: "Ayrı signal sunucusu (LAN/VPS host)" },
    { cmd: "npm run ui:smoke", d: "Arayüz otomasyon testi" },
    { cmd: "npm run setup", d: "Hearth-Setup.exe üret" },
  ];
  cmds.forEach((c, i) => {
    const y = 1.4 + i * 0.85;
    card(s, 0.5, y, 9, 0.75);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: y + 0.15, w: 3.4, h: 0.45,
      fill: { color: C.bg }, line: { color: C.faint, width: 1 }, rectRadius: 0.05,
    });
    s.addText(c.cmd, {
      x: 0.8, y: y + 0.15, w: 3.2, h: 0.45,
      fontFace: FONT, fontSize: 13, color: C.green, bold: true, valign: "middle", margin: 0,
    });
    s.addText(c.d, {
      x: 4.4, y: y + 0.15, w: 4.8, h: 0.45,
      fontFace: FONT, fontSize: 14, color: C.ink, valign: "middle", margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 16 — Özet
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "ÖZET");
  title(s, "Tek cümleyle");
  footer(s, 16);

  card(s, 0.5, 1.45, 9, 1.5);
  s.addText("Hearth artık WebRTC sinyalini kendi sunucusunda (veya gömülü) yönetiyor; ses, ekran ve dosya hâlâ doğrudan arkadaşlar arasında.", {
    x: 0.8, y: 1.7, w: 8.4, h: 1.0,
    fontFace: FONT, fontSize: 18, color: C.ink, margin: 0,
  });

  const next = [
    { t: "Hazır", d: "4.5.0 build · smoke PASS" },
    { t: "Opsiyonel", d: "GitHub Release yayın" },
    { t: "Sonra", d: "Faz 3: app.js bölme" },
  ];
  next.forEach((n, i) => {
    const x = 0.5 + i * 3.15;
    card(s, x, 3.25, 3.0, 1.4);
    s.addText(n.t, {
      x: x + 0.2, y: 3.45, w: 2.6, h: 0.35,
      fontFace: FONT, fontSize: 13, color: C.amber, bold: true, margin: 0,
    });
    s.addText(n.d, {
      x: x + 0.2, y: 3.9, w: 2.6, h: 0.5,
      fontFace: FONT, fontSize: 14, color: C.ink, margin: 0,
    });
  });
}

pres.writeFile({ fileName: "C:/Users/Faruk/Desktop/discord alternatif/docs/Hearth-4.5-Degisiklikler-Sunum.pptx" })
  .then(() => console.log("OK: docs/Hearth-4.5-Degisiklikler-Sunum.pptx"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
