# Email Reminder Setup Guide

## Overview
Email reminders use Supabase Edge Functions + Resend.
When triggered, it checks who has a reminder set for today's date and sends them an email.

---

## Step 1 — Daftar Resend (gratis)

1. Buka https://resend.com dan daftar
2. Setelah login, klik **API Keys** di sidebar kiri
3. Klik **Create API Key** → beri nama "smart-money-manager" → Create
4. Copy API key-nya (mulai dengan `re_...`) — **simpan, hanya muncul sekali!**

---

## Step 2 — Verifikasi domain di Resend (opsional tapi recommended)

Kalau kamu punya domain sendiri (misal: smartmoneyapp.id):
1. Di Resend → **Domains** → Add Domain
2. Ikuti instruksi tambah DNS records
3. Setelah verified, kamu bisa kirim dari `reminder@smartmoneyapp.id`

Kalau belum punya domain, pakai domain bawaan Resend dulu:
- Ganti `from` di `index.ts` dengan: `onboarding@resend.dev`
- Tapi email hanya bisa dikirim ke email kamu sendiri (untuk testing)

---

## Step 3 — Install Supabase CLI

Di terminal:
```bash
npm install -g supabase
```

Login:
```bash
supabase login
```

---

## Step 4 — Link project ke Supabase

```bash
cd smart-money-manager
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```

Cari PROJECT_REF di: Supabase Dashboard → Settings → General → Reference ID

---

## Step 5 — Set secrets di Supabase

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

Atau lewat dashboard:
1. Supabase → **Edge Functions** → **Manage secrets**
2. Add:
   - `RESEND_API_KEY` = your Resend API key

---

## Step 6 — Deploy Edge Function

```bash
supabase functions deploy send-reminders
```

Setelah deploy, kamu bisa test manual:
```bash
supabase functions invoke send-reminders
```

---

## Step 7 — Set up Cron Job (kirim otomatis tiap hari)

Di Supabase Dashboard:
1. Buka **Database** → **Extensions**
2. Enable extension **pg_cron** (kalau belum aktif)
3. Buka **SQL Editor** dan jalankan:

```sql
-- Kirim reminder setiap hari jam 08:00 WIB (01:00 UTC)
select cron.schedule(
  'daily-reminders',
  '0 1 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

Ganti:
- `YOUR_PROJECT_REF` = project ref kamu (dari Settings → General)
- `YOUR_ANON_KEY` = anon key kamu (dari Settings → API)

### Jadwal cron (pilih sesuai keinginan):
| Waktu WIB | Cron expression |
|-----------|----------------|
| Jam 6 pagi  | `0 23 * * *` (prev day UTC) |
| Jam 7 pagi  | `0 0 * * *` |
| Jam 8 pagi  | `0 1 * * *` |
| Jam 9 pagi  | `0 2 * * *` |
| Jam 10 pagi | `0 3 * * *` |

---

## Step 8 — Update email sender di index.ts

Buka `supabase/functions/send-reminders/index.ts` dan ganti:
```
from: 'Smart Money Manager <reminder@yourdomain.com>',
```
dengan domain kamu yang sudah diverifikasi di Resend, atau untuk testing:
```
from: 'Smart Money Manager <onboarding@resend.dev>',
```

Lalu deploy ulang:
```bash
supabase functions deploy send-reminders
```

---

## Testing

1. Buat reminder di app dengan tanggal = hari ini
2. Invoke function manual:
```bash
supabase functions invoke send-reminders
```
3. Cek email kamu

---

## Troubleshooting

**Email tidak masuk?**
- Cek spam/junk folder
- Pastikan `remind_email` di reminder sudah benar
- Cek logs: Supabase → Edge Functions → send-reminders → Logs

**Error "Unauthorized"?**
- Pastikan RESEND_API_KEY sudah diset di Supabase secrets
- Redeploy function setelah set secrets

**Cron tidak jalan?**
- Pastikan pg_cron extension aktif
- Cek: `select * from cron.job;` di SQL Editor
