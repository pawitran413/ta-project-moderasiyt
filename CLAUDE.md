# CLAUDE.md

Konteks untuk AI agent yang bekerja di repo ini. Project ini adalah **Web App (frontend + web backend)** dari sistem moderasi otomatis komentar spam judi online YouTube (skripsi Teknik Elektro Unsoed). Repo ini **tidak mencakup** ML backend (FastAPI/Python) — yang ada di sini hanya konsumen-nya via REST.

> Catatan: ada `AGENTS.md` di root yang berisi peringatan bahwa Next.js versi project ini (16.2.6) mungkin punya breaking changes dari training data. Baca dulu kalau menyentuh fitur Next.js yang belum familiar (App Router baru, `proxy.ts`, dll).

## Stack & Versi

- **Next.js 16.2.6** (App Router, `src/app`), React 19.2.4
- **TypeScript** (strict mode), path alias `@/*` → `src/*`
- **Tailwind CSS v4** (lewat `@tailwindcss/postcss`)
- **NextAuth v4** (`next-auth@4.24.14`) — strategi session: JWT
- **Mongoose 9.6.2** → MongoDB, nama database: `ta-moderasi`
- **Zod v4** untuk validasi input server action
- **bcryptjs** untuk hashing password, **jsonwebtoken** (tersedia tapi token verifikasi email pakai `crypto` manual, bukan JWT — lihat `src/lib/token.ts`)
- **nodemailer** untuk email verifikasi

Tidak ada testing framework, tidak ada CI config, tidak ada Docker file di repo ini.

## Cara Menjalankan

```bash
npm install
npm run dev      # dev server, localhost:3000
npm run build
npm run start
npm run lint      # eslint
```

Tidak ada script `test`.

## Environment Variables

Daftar env var resmi (terbaru, sudah diselaraskan dengan pemakaian di kode):

```
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

- Ada **dua varian URL ML backend**: `BACKEND_ML_URL` (server-side, dipakai di `actions/`) dan `NEXT_PUBLIC_BACKEND_ML_URL` (ter-expose ke browser — kalau ada kode client yang butuh memanggil ML backend langsung tanpa lewat server action, pakai varian `NEXT_PUBLIC_*` ini, jangan `BACKEND_ML_URL`)
- `NEXT_PUBLIC_APP_URL` ter-expose ke browser, beda dari `NEXTAUTH_URL` (server-side, dipakai NextAuth internal) — kalau butuh base URL app di client component, pakai `NEXT_PUBLIC_APP_URL`
- `EMAIL_SMTP_SERVICE_NAME` kemungkinan untuk preset service nodemailer (mis. `"gmail"`) sebagai alternatif/pelengkap konfigurasi host/port manual — cek `lib/mailer.ts` untuk cara persisnya dipakai sebelum berasumsi
- `INTERNAL_API_KEY` dikirim sebagai header `X-API-Key` ke endpoint `/moderate` (lihat `moderateActions.ts`)

File `.env.example` versi sebelumnya di root **sudah usang** dibanding daftar di atas (tidak menyertakan `BACKEND_ML_URL`, `INTERNAL_API_KEY`, varian `NEXT_PUBLIC_*`, dan `EMAIL_SMTP_SERVICE_NAME`). Pakai daftar di atas sebagai acuan, atau perbarui `.env.example` agar sinkron.

## Struktur Direktori

```
src/
├── app/
│   ├── (auth)/              # route group: login, register, error, verify-email/[token]
│   ├── (main)/               # route group dengan Navbar, butuh auth: dashboard, history
│   ├── api/auth/[...nextauth]/route.ts   # satu-satunya API route — handler NextAuth
│   ├── layout.tsx             # root layout, bungkus SessionProviderWrapper
│   └── page.tsx               # landing page publik ("Comet SmartMod")
├── actions/                   # SEMUA logika bisnis ada di sini (server actions, "use server")
│   ├── authActions.ts         # registerUser, verifyEmail
│   ├── scanActions.ts         # scanVideo — panggil ML backend, simpan ke MongoDB
│   └── moderateActions.ts     # hideComment — panggil ML backend untuk eksekusi YouTube API
├── components/                 # UI components, sebagian besar presentasional
├── hooks/                      # state management client-side (wrap server actions)
├── lib/                        # auth.ts (NextAuth config), mongodb.ts, mailer.ts, token.ts
├── models/                     # Mongoose schema: User, ModerationHistory
├── utils/downloadToCsv.ts
└── proxy.ts                    # route protection (lihat catatan di bawah)
```

**Tidak ada folder `services/` atau `api-client/`** — semua panggilan ke ML backend langsung pakai `fetch()` inline di dalam file `actions/`.

## Arsitektur & Alur Data

Ini adalah **Web Backend** dalam arsitektur 4-komponen yang dijelaskan di laporan (Bab 3, Gambar 3.2): Frontend + Web Backend keduanya ada di repo Next.js ini (satu kesatuan, bukan dua service terpisah); Machine Learning Backend dan Database adalah service eksternal yang diakses lewat env var.

```
Browser → Next.js (Server Actions) → FastAPI (BACKEND_ML_URL) → MongoDB (Mongoose)
                                    ↘ YouTube Data API (lewat FastAPI, bukan langsung)
```

Next.js app ini **tidak pernah memanggil YouTube Data API secara langsung** untuk scraping/hide comment — itu semua didelegasikan ke ML backend. Next.js hanya memanggil YouTube API langsung untuk **fetch channel ID** saat OAuth Google sign-in (lihat `lib/auth.ts` → `fetchYoutubeChannelId`).

### Flow 1 — Scan video (`scanActions.ts` → `scanVideo`)

1. Cek session (NextAuth)
2. `POST {BACKEND_ML_URL}/predict` dengan `{ video_url }`
3. Response ML berisi `hasil_analisis_ml[]` (per komentar: prediksi SVM utama + NB pembanding)
4. Setiap komentar non-kosong di-`insertMany` ke `ModerationHistory` dengan `status_tindakan: "Menunggu Review"`. Duplikat (unique index `user_id + komentar_id`) sengaja diabaikan (error code 11000 di-catch, tidak dilempar)

### Flow 2 — Hide/sembunyikan komentar (`moderateActions.ts` → `hideComment`)

1. Cek session **dan** `youtubeChannelId` harus sudah tertaut — kalau belum, return error (trigger modal "tautkan channel" di UI)
2. `POST {BACKEND_ML_URL}/moderate` dengan header `X-API-Key: INTERNAL_API_KEY`, body `{ comment_ids, moderation_status: "heldForReview", ban_author: false }`
3. Response: `{ results: [{comment_id, status}], success, failed }`
4. Yang `status === "success"` di-`updateMany` ke MongoDB, set `status_tindakan.tindakan_diambil = "Disembunyikan"`

Nilai `"Disembunyikan"` ini sekarang **resmi** dan sudah konsisten antara kode dan schema Mongoose (enum: `["Menunggu Review", "Disembunyikan"]`). Catatan untuk laporan TA: Bab 3 proposal masih menyebut nilai status sebagai "Dihapus" — itu bagian narasi laporan yang perlu disesuaikan ke "Disembunyikan" saat menulis Bab 4, bukan sebaliknya. Istilah ini juga lebih akurat secara teknis: endpoint `/moderate` memakai `moderationStatus: "heldForReview"` pada YouTube Data API, yang menyembunyikan komentar dari publik (bukan menghapus permanen).

### Auth & Channel Linking

- Dua provider: `credentials` (email/password, wajib verifikasi email dulu) dan `google` (auto-verified)
- Login Google **otomatis** fetch & simpan `youtubeChannelId` lewat scope `youtube.readonly`
- User bisa register lewat credentials dulu, baru **link channel YouTube belakangan** lewat tombol "Konfirmasi dengan google" di `Modal.tsx` → trigger `signIn("google", { callbackUrl: "/dashboard?linked=1" })`
- Channel ID di-enforce unique secara global (satu channel YouTube = satu akun) — kalau channel sudah dipakai akun lain, signIn Google di-redirect ke `/error?error=ChannelAlreadyLinked` (lihat daftar pesan di `app/(auth)/error/page.tsx`)
- Google sign-in juga menolak kalau email Google belum terverifikasi di sisi Google (`GoogleEmailNotVerified`), terpisah dari status `emailVerified` internal aplikasi
- Sebelum bisa hide comment, pemilik channel harus **manual** menambahkan akun bot `@CommetSmartMod` sebagai moderator di YouTube Studio (lihat teks di `Modal.tsx`) — langkah ini di luar kendali aplikasi, hanya instruksi UI

### Route Protection

Proteksi route **bukan** di file `middleware.ts` konvensional, tapi di `src/proxy.ts` (export `proxy` + `config.matcher`). Kalau Next.js versi ini memang mengganti nama file middleware menjadi `proxy.ts`, jangan terkejut; kalau ragu cek dulu changelog Next.js 16 sebelum mengasumsikan ini typo developer.

- `/dashboard`, `/history` → wajib login
- `/login`, `/register` → redirect ke `/dashboard` kalau sudah login

## Model Data (MongoDB)

**`User`** (`models/User.ts`) — field penting: `provider` (`credentials`|`google`), `youtubeChannelId` (unique+sparse), token verifikasi email & reset password (hash + expiry, bukan token mentah). _(Field `botVerified` sudah dihapus dari schema dan sudah dikonfirmasi tidak ada sisa referensinya lagi di `lib/auth.ts` — pembersihan ini tuntas dan konsisten. Status "channel terhubung/belum" di UI, lihat `ChannelStatus.tsx`, kini murni berdasarkan `youtubeChannelId` terisi atau tidak, bukan field bot terpisah.)_

**`ModerationHistory`** (`models/ModerationHistory.ts`) — sesuai skema di laporan Bab 3 (Gambar 3.3), tapi field top-level pakai nama tunggal (`data_komentar`, bukan array) — satu dokumen = satu komentar, bukan satu dokumen per video. Unique index gabungan `(user_id, data_komentar.komentar_id)` mencegah duplikat. Enum `status_tindakan.tindakan_diambil`: `"Menunggu Review"` (default, hasil scan awal) → `"Disembunyikan"` (setelah eksekusi hide berhasil).

## Konvensi Kode

- Tab indentation (bukan spasi) — ikuti gaya file yang sudah ada
- Komentar dan pesan error/UI **berbahasa Indonesia**; nama variabel/fungsi campur (sebagian Indonesia: `hasilPrediksi`, `ownerCurrentVideo`; sebagian Inggris: `handleSubmit`, `scanVideo`) — ikuti pola yang sudah ada di file yang disentuh, jangan unifikasi sepihak tanpa diminta
- Server actions selalu diawali `"use server"`, return shape konsisten: `{ success: boolean, message?: string, data?: T }`
- Hooks selalu diawali `"use client"`, pola nama `useXxx`, return object (bukan array/tuple)
- Tidak ada layer "service" terpisah dari actions — kalau menambah endpoint ML baru, ikuti pola: tambah fungsi di `actions/`, pakai langsung dari hook terkait

## Yang Belum Ada / Di Luar Scope Repo Ini

- Tidak ada rate limiting di server actions
- Tidak ada test (unit/integration/e2e)
- Reset password: model `User` punya field `passwordResetTokenHash`/`passwordResetExpires`, tapi **tidak ada action atau halaman UI untuk reset password** di repo ini — fitur baru sebagian terbangun di level schema
- ML backend (FastAPI, training model SVM/NB) ada di repo terpisah — tidak termasuk di sini
