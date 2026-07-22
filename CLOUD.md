# Hearth — Bulut (hibrit P2P) kurulum

## Model (kısa)

| Ne | Nerede |
|----|--------|
| Ses, ekran, dosya | **P2P WebRTC** (cihazlar arası) |
| Hesap, @username, arkadaş, online | **Supabase** (bulut) |
| WebRTC bağlantı sinyali | Own `signal-server` (PeerJS `/peerjs` + presence WS); public PeerJS fallback |

**Hearth.exe yine herkesin bilgisayarında çalışır.**  
Sunucu = API + veritabanı; medya depolamaz.

---

## 1) Supabase projesi aç (ücretsiz)

1. https://supabase.com → New project  
2. Region: tercihen **Frankfurt (eu-central-1)**  
3. **Project Settings → API** (veya **API Keys**)  
   - **Project URL** → sadece `https://xxxx.supabase.co`  
     ❌ `...supabase.co/rest/v1/` **KULLANMA** (Data API adresi yanlış yer)  
   - **anon / publishable** key  
     ❌ `service_role` / `secret` **KULLANMA**

## 2) SQL şemayı yükle

1. Supabase → **SQL Editor** → New query  
2. `cloud/schema.sql` dosyasının **tamamını** yapıştır → Run  

### 4.9.0'dan güncelleme / RPC bulunamadı hatası

Kayıtta `public.is_username_available(candidate_username)` veya `schema cache`
hatası görülürse Supabase SQL Editor'da yalnızca
`cloud/migrations/4.9.1-username-availability.sql` dosyasını çalıştırmak yeterlidir.
Migration tekrar çalıştırılabilir ve sonunda PostgREST şema önbelleğini yeniler.

## 3) Realtime (önerilir)

**Database → Publications → supabase_realtime**  
Şunları ekle (varsa):

- `profiles`  
- `signals` (ileride signaling için)

## 4) Hearth’a anahtarları ver

```text
cloud/config.example.json  →  cloud/config.json
```

`config.json` örneği:

```json
{
  "enabled": true,
  "supabaseUrl": "https://abcdef.supabase.co",
  "supabaseAnonKey": "eyJ...."
}
```

Uygulama açılışta şu sırayla arar:

1. `cloud/config.json` (proje klasörü)  
2. `%APPDATA%/hearth/cloud-config.json` (kurulu exe)  
3. Ortam: `HEARTH_SUPABASE_URL` + `HEARTH_SUPABASE_ANON_KEY`

`enabled: false` veya dosya yoksa → **eski yerel mod** çalışır.

## 5) Auth ayarı

Supabase → **Authentication → Providers → Email** açık olsun.  
Geliştirmede “Confirm email” kapatılabilir (Email confirmations).

## 6) Ne satın al?

| Şimdi | Sonra (gerekirse) |
|-------|-------------------|
| Supabase Free (0 ₺) | Supabase Pro / VPS |
| İsteğe domain | coturn (TURN) VPS’te |
| GitHub (kod) | — |

**Alma:** büyük storage, pahalı oyun sunucusu, erken Twilio TURN.

## 7) Test

1. `npm start`  
2. Kayıt ol (bulut açıksa Supabase Auth)  
3. İkinci hesap / ikinci PC  
4. Arkadaş ekle (username)  
5. Sesli arama — hâlâ **P2P**  

---

## Güvenlik

- `service_role` key’i **asla** uygulamaya koyma  
- Sadece `anon` + RLS  
- `cloud/config.json` git’e ekleme (aşağıda `.gitignore`)
