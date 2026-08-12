# SPK Mustahik - Sistem Pendukung Keputusan Kelayakan Mustahik

## 1. DESKRIPSI PROJECT

Project ini adalah website Sistem Pendukung Keputusan (SPK) untuk membantu proses penentuan kelayakan calon mustahik menggunakan metode TOPSIS.

Sistem memiliki dua role utama:

1. USER / CALON MUSTAHIK
2. ADMIN / PENGELOLA SISTEM

Sistem digunakan untuk mengelola data calon mustahik, proses pengajuan, kuesioner/verifikasi, perhitungan TOPSIS, dan hasil keputusan kelayakan.

---

# 2. TUJUAN SISTEM

Sistem bertujuan untuk:

- Mempermudah calon mustahik melakukan pengajuan.
- Mempermudah admin mengelola data mustahik.
- Mempermudah proses verifikasi calon mustahik.
- Membantu proses penilaian menggunakan metode TOPSIS.
- Menghasilkan ranking berdasarkan nilai TOPSIS.
- Menentukan hasil kelayakan calon mustahik.
- Memberikan informasi hasil pengajuan kepada user.

---

# 3. ROLE SISTEM

## 3.1 USER / CALON MUSTAHIK

User dapat:

- Register
- Login
- Mengisi data diri
- Mengajukan diri sebagai calon mustahik
- Mengisi kuesioner
- Melihat status verifikasi
- Melihat hasil pengajuan
- Melihat hasil penilaian TOPSIS
- Melihat status kelayakan
- Mengelola profil
- Logout

---

## 3.2 ADMIN

Admin dapat:

- Login
- Melihat dashboard
- Melihat data mustahik
- Mencari mustahik
- Melihat detail pengajuan
- Melakukan verifikasi
- Mengelola data mustahik
- Mengelola kriteria TOPSIS
- Mengelola bobot kriteria
- Mengelola subkriteria
- Menjalankan proses TOPSIS
- Melihat hasil ranking
- Melihat laporan
- Mengelola akun
- Logout

---

# 4. ALUR USER

Flow utama user:

START
↓
REGISTER / LOGIN
↓
LOGIN BERHASIL?
├── TIDAK → Kembali ke LOGIN
└── YA
    ↓
DASHBOARD USER
    ↓
    ├── DAFTAR / PENGAJUAN MUSTAHIK
    │
    ├── VERIFIKASI / KUESIONER
    │
    ├── PANTAU HASIL PENGAJUAN
    │
    └── PROFIL

---

# 5. ALUR PENGAJUAN USER

User login
↓
Dashboard
↓
Pengajuan Mustahik
↓
Mengisi data diri
↓
Mengisi kuesioner
↓
Submit
↓
Status = MENUNGGU VERIFIKASI
↓
Admin melakukan verifikasi
↓
Status diperbarui

---

# 6. ALUR ADMIN

START
↓
ADMIN LOGIN
↓
LOGIN BERHASIL?
├── TIDAK → Kembali ke LOGIN
└── YA
    ↓
ADMIN DASHBOARD
    ↓
    ├── HOME
    ├── PENCARIAN
    ├── VERIFIKASI
    ├── PENGELOLAAN DATA
    ├── KRITERIA TOPSIS
    ├── PROSES TOPSIS
    ├── HASIL RANKING
    ├── LAPORAN
    └── PENGATURAN

---

# 7. ALUR VERIFIKASI

Admin membuka data pengajuan
↓
Melihat data calon mustahik
↓
Melihat jawaban kuesioner
↓
Melakukan validasi
↓
Data valid?
├── TIDAK
│   ↓
│   Status = PERLU PERBAIKAN / DITOLAK
│
└── YA
    ↓
    Status = LOLOS VERIFIKASI
    ↓
    Masuk proses TOPSIS

---

# 8. METODE TOPSIS

TOPSIS digunakan untuk melakukan penilaian dan ranking calon mustahik.

Tahapan TOPSIS:

1. Menentukan alternatif.
2. Menentukan kriteria.
3. Menentukan bobot kriteria.
4. Membentuk matriks keputusan.
5. Melakukan normalisasi.
6. Melakukan normalisasi terbobot.
7. Menentukan solusi ideal positif.
8. Menentukan solusi ideal negatif.
9. Menghitung jarak setiap alternatif terhadap solusi ideal.
10. Menghitung nilai preferensi.
11. Melakukan ranking.
12. Menentukan hasil kelayakan.

Catatan:

Kriteria, bobot, tipe benefit/cost, dan nilai subkriteria harus dibuat dinamis.

Jangan hardcode nilai TOPSIS ke dalam frontend.

---

# 9. KRITERIA TOPSIS

Kriteria dan bobot belum dianggap final sampai diberikan oleh pemilik project.

Contoh sementara:

| Kriteria | Tipe | Bobot |
|---|---|---:|
| Penghasilan | Cost | 30% |
| Jumlah Tanggungan | Benefit | 25% |
| Kondisi Rumah | Benefit | 20% |
| Status Pekerjaan | Benefit | 15% |
| Kepemilikan Aset | Cost | 10% |

CATATAN:

Data di atas hanya contoh untuk development.

Jangan menganggap data ini sebagai data final.

Jika pemilik project memberikan kriteria/bobot baru, gunakan data terbaru.

---

# 10. HASIL TOPSIS

Sistem menghasilkan:

- Nilai preferensi
- Ranking
- Status kelayakan

Contoh:

| Ranking | Nama | Nilai | Status |
|---:|---|---:|---|
| 1 | Ahmad | 0.821 | Layak |
| 2 | Budi | 0.743 | Layak |
| 3 | Citra | 0.521 | Tidak Layak |

Nilai di atas hanya contoh.

---

# 11. STATUS PENGAJUAN

Gunakan status:

- DRAFT
- MENUNGGU_VERIFIKASI
- SEDANG_DIVERIFIKASI
- PERLU_PERBAIKAN
- LOLOS_VERIFIKASI
- DITOLAK
- DIPROSES_TOPSIS
- LAYAK_DIDANAI
- TIDAK_DIDANAI

---

# 12. TECH STACK

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Router
- Axios
- Recharts

## Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT
- bcrypt

## Database

- PostgreSQL
- Prisma ORM

---

# 13. DESIGN DIRECTION

Desain harus:

- Modern
- Clean
- Profesional
- Responsive
- Mudah digunakan
- Tidak terlalu ramai
- Cocok untuk sistem pelayanan sosial/zakat

Gunakan nuansa warna hijau sebagai warna utama.

Gunakan:

- White / off-white background
- Green primary color
- Soft gray secondary color
- Rounded card
- Soft shadow
- Modern typography
- Lucide icons
- Clear badges
- Clean table
- Clean form

Hindari:

- Gradient berlebihan
- Glassmorphism berlebihan
- Animasi berlebihan
- Warna terlalu banyak
- UI yang terlalu ramai

---

# 14. USER INTERFACE

## User Layout

Sidebar:

- Dashboard
- Pengajuan
- Kuesioner
- Pantau Hasil
- Profil
- Logout

Dashboard:

- Greeting
- Status Pengajuan
- Progress Pengajuan
- Status Verifikasi
- Nilai TOPSIS
- Hasil Keputusan

---

# 15. ADMIN INTERFACE

Sidebar:

- Dashboard
- Data Mustahik
- Verifikasi
- Kriteria
- Subkriteria
- Proses TOPSIS
- Hasil Ranking
- Laporan
- Pengaturan
- Logout

Dashboard admin menampilkan:

- Total Mustahik
- Pengajuan Baru
- Menunggu Verifikasi
- Sudah Diverifikasi
- Layak Didanai
- Tidak Didanai

Gunakan chart sederhana jika memang diperlukan.

---

# 16. DATABASE ENTITY

Minimal entity:

- User
- Mustahik
- Pengajuan
- Kriteria
- SubKriteria
- JawabanKuesioner
- Verifikasi
- TopsisResult
- TopsisDetail
- AuditLog

Relasi harus dirancang sebelum implementasi backend.

---

# 17. BACKEND ARCHITECTURE

Backend menggunakan struktur sederhana:

controllers
services
routes
middleware
validators
utils
types

TOPSIS dipisahkan sebagai service tersendiri.

Contoh:

backend/src/services/topsis/

- topsis.service.ts
- normalization.service.ts
- weighting.service.ts
- ideal-solution.service.ts
- distance.service.ts
- ranking.service.ts

---

# 18. API

Authentication:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

User:

GET /api/user/profile
PUT /api/user/profile

Pengajuan:

POST /api/pengajuan
GET /api/pengajuan/me
GET /api/pengajuan/:id

Kuesioner:

GET /api/kuesioner
POST /api/kuesioner/jawaban
PUT /api/kuesioner/jawaban

Admin:

GET /api/admin/mustahik
GET /api/admin/mustahik/:id
PUT /api/admin/mustahik/:id
DELETE /api/admin/mustahik/:id

Verifikasi:

GET /api/admin/verifikasi
GET /api/admin/verifikasi/:id
POST /api/admin/verifikasi/:id

Kriteria:

GET /api/admin/kriteria
POST /api/admin/kriteria
PUT /api/admin/kriteria/:id
DELETE /api/admin/kriteria/:id

TOPSIS:

POST /api/admin/topsis/process
GET /api/admin/topsis/results
GET /api/admin/topsis/results/:id

---

# 19. DEVELOPMENT RULE

Project harus dikerjakan secara bertahap.

JANGAN langsung membuat seluruh frontend, backend, database, dan TOPSIS sekaligus.

Development phases:

PHASE 1:
Frontend UI/UX

PHASE 2:
Frontend functionality

PHASE 3:
Backend API

PHASE 4:
Database

PHASE 5:
TOPSIS engine

PHASE 6:
Frontend + Backend integration

PHASE 7:
Testing

PHASE 8:
Deployment

Setiap phase harus selesai dan diuji sebelum melanjutkan ke phase berikutnya.

---

# 20. CURRENT DEVELOPMENT PHASE

Saat pertama kali membaca README ini, fokus hanya pada:

PHASE 1 - FRONTEND UI/UX

Jangan membuat backend terlebih dahulu.

Jangan membuat database terlebih dahulu.

Jangan membuat API terlebih dahulu.

Jangan membuat perhitungan TOPSIS terlebih dahulu.

Buat seluruh halaman frontend berdasarkan requirement dan flow yang tersedia.

Gunakan mock/static data hanya untuk kebutuhan visual frontend.

Setelah frontend selesai, tunggu instruksi berikutnya sebelum mengerjakan backend.

---

# 21. FRONTEND PAGES

Buat halaman:

AUTH:

- Login
- Register

USER:

- Dashboard
- Pengajuan
- Form Data Mustahik
- Kuesioner
- Pantau Hasil
- Detail Hasil
- Profil

ADMIN:

- Login
- Dashboard
- Data Mustahik
- Detail Mustahik
- Verifikasi
- Kriteria
- Subkriteria
- Proses TOPSIS
- Hasil Ranking
- Laporan
- Pengaturan

---

# 22. FRONTEND REQUIREMENT

Untuk PHASE 1:

- Gunakan React + TypeScript.
- Gunakan Tailwind.
- Gunakan shadcn/ui.
- Gunakan Lucide icons.
- Gunakan reusable components.
- Buat responsive desktop/tablet/mobile.
- Buat sidebar reusable.
- Buat navbar/topbar reusable.
- Buat card reusable.
- Buat table reusable.
- Buat modal/dialog reusable.
- Buat badge/status reusable.
- Buat form component reusable.

Gunakan mock data.

Jangan membuat API call.

Jangan membuat database.

Jangan membuat backend.

---

# 23. FRONTEND QUALITY

Prioritaskan:

1. Visual hierarchy
2. Consistency
3. Responsive design
4. Accessibility
5. Reusable components
6. Clean code
7. User experience

Jangan hanya membuat halaman kosong.

Setiap halaman harus terlihat seperti aplikasi yang benar-benar siap digunakan.

---

# 24. IMPORTANT RULE FOR AI AGENT

Jika ada requirement yang belum jelas:

JANGAN mengarang requirement penting.

Tandai sebagai TODO atau tanyakan sebelum implementasi.

Jangan mengubah flow bisnis utama tanpa alasan.

Jangan menambahkan fitur besar yang tidak diminta.

Jangan mengganti tech stack tanpa alasan.

Jangan membuat keputusan metodologi TOPSIS yang belum diberikan oleh pemilik project.

Selalu prioritaskan isi README ini sebagai sumber utama requirement project.