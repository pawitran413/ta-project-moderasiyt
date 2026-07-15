# Comet SmartMod

Sistem moderasi otomatis komentar spam judi online di YouTube — Web App (frontend + web backend) yang dibangun untuk skripsi Teknik Elektro, Universitas Jenderal Soedirman.

**Live demo:** [ta-project-moderasiyt.vercel.app](https://ta-project-moderasiyt.vercel.app/)

Aplikasi ini memungkinkan pemilik channel YouTube untuk memindai komentar pada video mereka, mengklasifikasikannya sebagai _Spam_ (judi online) atau _Normal_ menggunakan model machine learning (SVM, dengan Naive Bayes sebagai pembanding), lalu menyembunyikan komentar yang terdeteksi spam langsung melalui YouTube Data API.

## Arsitektur

Sistem terdiri dari 4 komponen. Repo ini mencakup **Frontend** dan **Web Backend** (satu kesatuan aplikasi Next.js); klasifikasi ML dan eksekusi ke YouTube API didelegasikan ke backend ML terpisah.

```
Browser → Next.js (Server Actions) → FastAPI (ML Backend) → MongoDB
                                    ↘ YouTube Data API (lewat FastAPI)
```

- Next.js tidak pernah memanggil YouTube Data API secara langsung untuk scraping atau menyembunyikan komentar — semua didelegasikan ke ML backend.
- Satu-satunya pemanggilan YouTube API langsung dari Next.js adalah untuk mengambil channel ID saat proses sign-in dengan Google.

## Fitur Utama

- **Autentikasi** — login via email/password (dengan verifikasi email) atau Google OAuth (auto-verified, sekaligus menautkan channel YouTube)
- **Pemindaian komentar** — analisis komentar pada sebuah video YouTube dan klasifikasi otomatis Spam/Normal
- **Moderasi** — sembunyikan komentar terdeteksi spam langsung dari dashboard
- **Riwayat moderasi** — pantau status setiap komentar yang pernah dipindai

## Tech Stack

| Kategori    | Teknologi                                              |
| ----------- | ------------------------------------------------------ |
| Framework   | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling     | Tailwind CSS v4                                        |
| Autentikasi | NextAuth v4 (strategi JWT), Google OAuth               |
| Database    | MongoDB via Mongoose                                   |
| Validasi    | Zod                                                    |
| Email       | Nodemailer                                             |
| Deployment  | Vercel                                                 |

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 20+
- Instance MongoDB (lokal atau Atlas)
- ML Backend (FastAPI) yang sudah berjalan — lihat repo terpisah
- Google OAuth Client ID/Secret (untuk fitur sign-in Google & penautan channel)

### Instalasi

```bash
npm install
```

### Konfigurasi Environment

Salin `.env.example` menjadi `.env.local`, lalu isi seluruh variabel berikut:

```env
MONGODB_URL=

NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_BACKEND_ML_URL=
BACKEND_ML_URL=
NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

EMAIL_SMTP_SECURE=
EMAIL_SMTP_PASS=
EMAIL_SMTP_USER=
EMAIL_SMTP_PORT=
EMAIL_SMTP_HOST=
EMAIL_SMTP_SERVICE_NAME=

INTERNAL_API_KEY=
```

Catatan:

- `BACKEND_ML_URL` dipakai di server actions; `NEXT_PUBLIC_BACKEND_ML_URL` di-expose ke browser untuk kode client yang memanggil ML backend langsung.
- `NEXTAUTH_URL` dipakai internal oleh NextAuth; `NEXT_PUBLIC_APP_URL` untuk kebutuhan base URL di client component.
- `INTERNAL_API_KEY` dikirim sebagai header `X-API-Key` saat memanggil endpoint `/moderate` di ML backend.

### Menjalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Script Lain

```bash
npm run build   # build production
npm run start   # jalankan build production
npm run lint    # linting dengan ESLint
```

> Belum tersedia test suite atau CI/CD pipeline pada repo ini.

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/      # login, register, error, verify-email
│   ├── (main)/      # dashboard, history (butuh autentikasi)
│   ├── api/auth/    # handler NextAuth
│   └── page.tsx     # landing page
├── actions/         # server actions — seluruh logika bisnis
├── components/      # UI components
├── hooks/           # state management client-side
├── lib/             # konfigurasi auth, koneksi database, mailer
├── models/          # Mongoose schema
└── proxy.ts         # proteksi route
```

## Deployment

Aplikasi berjalan di [Vercel](https://ta-project-moderasiyt.vercel.app/). Untuk deploy instance sendiri:

1. Push repo ke GitHub/GitLab/Bitbucket
2. Import project di [Vercel](https://vercel.com/new)
3. Atur seluruh environment variable pada bagian [Konfigurasi Environment](#konfigurasi-environment) di dashboard Vercel
4. Deploy

Pelajari lebih lanjut soal deployment Next.js di [dokumentasi resmi](https://nextjs.org/docs/app/building-your-application/deploying).

## Lisensi

Proyek ini dibuat untuk keperluan tugas akhir (skripsi) Teknik Elektro, Universitas Jenderal Soedirman.
