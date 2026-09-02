# Prenura

Prenura adalah aplikasi web untuk membantu memantau kesehatan ibu hamil dan ibu postpartum, dengan penilaian risiko berbasis aturan medis dan AI (Google Gemini) untuk mendeteksi gejala yang memerlukan perhatian medis segera.

## Fitur Utama

- **Input data kesehatan** — tekanan darah, hemoglobin, berat badan, mood & energi.
- **Laporan gejala** — pelaporan gejala dengan pemisahan otomatis antara gejala umum dan gejala yang berpotensi berbahaya.
- **Penilaian risiko hybrid** — kombinasi rule-based scoring dan analisis AI (Gemini) untuk menentukan tingkat risiko (Rendah/Sedang/Tinggi/Sangat Tinggi).
- **Timeline monitoring** — riwayat kondisi kesehatan dari waktu ke waktu.
- **Chatbot edukasi** — asisten AI untuk edukasi kehamilan, postpartum, dan nutrisi berbasis pedoman WHO, Kemenkes RI, dan POGI.
- **Direktori fasilitas kesehatan** — informasi rumah sakit/faskes terdekat untuk kondisi darurat.
- **Notifikasi email** — pengiriman notifikasi via SendGrid.
- **Dashboard & admin panel** — manajemen data pengguna dan pemantauan.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + Radix UI (shadcn/ui)
- [Google Gemini API](https://ai.google.dev/) untuk risk assessment & chatbot
- [SendGrid](https://sendgrid.com/) untuk pengiriman email

## Persiapan

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd <folder-project>
npm install
```

### 2. Konfigurasi environment variables

Salin `.env.example` menjadi `.env.local`, lalu isi dengan kredensial kamu sendiri:

```bash
cp .env.example .env.local
```

| Variabel | Keterangan |
|---|---|
| `GEMINI_API_KEY` | API key dari [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `SENDGRID_API_KEY` | API key dari [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys) |
| `SENDGRID_FROM_EMAIL` | Alamat email pengirim yang sudah diverifikasi di SendGrid |

Lihat juga `GEMINI_SETUP.md` dan `SENDGRID_SETUP.md` untuk panduan setup lebih detail.

> ⚠️ **Jangan pernah commit file `.env.local`** ke repository. File ini sudah dikecualikan lewat `.gitignore`.

### 3. Jalankan secara lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Struktur Project

```
app/            # Routes (App Router): dashboard, auth, chatbot, emergency, admin, dll.
components/     # Komponen UI React (form, navbar, sidebar, timeline, dll.)
services/       # Logika penilaian risiko (rule-based, Gemini, hybrid)
lib/            # Helper (Gemini client, email, storage, utils)
public/         # Aset statis
```

## Catatan Keamanan

Proyek ini menangani data kesehatan pengguna. Sebelum melakukan deploy ke lingkungan publik:

- Pastikan seluruh API key sudah diganti dengan key milik kamu sendiri dan tidak pernah ter-commit ke git.
- Tinjau kembali kebijakan privasi dan penyimpanan data kesehatan sesuai regulasi yang berlaku di wilayah kamu.

## Lisensi

Belum ditentukan.