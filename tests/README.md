# Hearth UI laboratuvarı

Bu klasör, **gerçek Electron penceresini** Playwright ile açıp arayüzü robot gibi kullanır.

Böylece hem sen hem de asistan (Grok) şunu yapabilir:

- Uygulamayı aç
- Tıkla / yaz
- Ekran görüntüsü al (`tests/artifacts/latest.png`)
- Çalışıyor mu / bozuk mu gör

## Kurulum (bir kez)

```bash
npm install
```

(`playwright` devDependency olarak gelir.)

## Komutlar

| Komut | Ne yapar |
|--------|----------|
| `npm run ui:smoke` | Tam smoke (kayıt, ayar, ESC…) — ajanın varsayılanı |
| `npm run ui:lab` | Aynı smoke, pencereyi sen de görürsün (`--headed`) |
| `npm run ui:scenario -- auth-local` | Tek senaryo |
| `npm run ui:scenario -- settings-theme` | Tema light |
| `npm run ui:scenario -- modal-esc` | ESC ile kapat |

## Çıktılar

- `tests/artifacts/latest.png` — son ekran
- `tests/artifacts/run.log` — adım logu
- `tests/artifacts/01-….png` — ara adımlar

Exit code: **0 = PASS**, **1 = FAIL**.

## İzolasyon

Her koşu geçici klasör kullanır:

```text
%TEMP%\hearth-ui-test-...
```

Senin gerçek `%APPDATA%\hearth` hesabına **dokunmaz**.  
`HEARTH_UI_TEST=1` → bulut kapalı, güncelleme kapalı, hep **yerel mod**.

## Ne test edilir / edilmez

| Test edilir | Test edilmez (henüz) |
|-------------|----------------------|
| Açılış, kayıt UI | 2–3 kişi gerçek ses |
| Ayarlar, tema, dil | Sistem sesi “duyuluyor mu” |
| Modal ESC | NAT / TURN |
| Arkadaş modal | Canlı Supabase (UI lab’de kapalı) |

## Asistan nasıl kullanır?

Düzeltme sonrası:

1. `npm run ui:smoke`
2. `tests/artifacts/latest.png` oku
3. FAIL ise log + görüntüye göre düzelt, tekrar koş
