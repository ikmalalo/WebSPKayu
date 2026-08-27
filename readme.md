# SPK Mustahik Zakat Produktif

## 1. DESKRIPSI PROJECT

Project ini adalah aplikasi Sistem Pendukung Keputusan (SPK) untuk membantu proses seleksi dan penentuan kelayakan calon mustahik penerima zakat produktif menggunakan metode TOPSIS.

Sistem digunakan untuk:

- Pendaftaran akun calon mustahik
- Pengajuan data calon mustahik
- Pengisian kuesioner/asesmen
- Verifikasi data oleh admin
- Pengelolaan data mustahik
- Proses perhitungan TOPSIS
- Penentuan ranking dan kelayakan
- Pemantauan status pengajuan oleh user

Project memiliki dua role utama:

1. USER / CALON MUSTAHIK
2. ADMIN

---

# 2. TUJUAN SISTEM

Sistem bertujuan untuk:

- Mempermudah calon mustahik melakukan pengajuan
- Mempermudah proses pengumpulan data calon mustahik
- Mempermudah proses asesmen dan kuesioner
- Mempermudah admin melakukan verifikasi data
- Membantu proses pengambilan keputusan menggunakan metode TOPSIS
- Menghasilkan ranking calon mustahik
- Menentukan status layak atau tidak layak didanai
- Memungkinkan user memantau status pengajuannya

---

# 3. ROLE SISTEM

## 3.1 USER / CALON MUSTAHIK

User dapat:

- Register
- Login
- Melihat dashboard
- Mengisi data pengajuan
- Mengisi data pribadi
- Mengisi kuesioner/asesmen
- Melihat status pengajuan
- Melihat hasil verifikasi
- Melihat hasil penilaian
- Melihat hasil kelayakan
- Mengelola profil
- Logout

---

## 3.2 ADMIN

Admin dapat:

- Login
- Melihat dashboard admin
- Melihat daftar calon mustahik
- Mencari data mustahik
- Melihat detail pengajuan
- Melihat jawaban kuesioner user
- Melakukan verifikasi data
- Mengubah status pengajuan
- Mengelola data mustahik
- Mengelola kriteria
- Mengelola subkriteria
- Menjalankan proses TOPSIS
- Melihat hasil ranking
- Melihat laporan
- Mengelola pengaturan akun
- Logout

---

# 4. ALUR UTAMA USER

START
↓
REGISTER / LOGIN
↓
LOGIN BERHASIL?

Jika TIDAK:
↓
Kembali ke LOGIN

Jika YA:
↓
DASHBOARD USER
↓
PENGAJUAN
↓
ISI DATA CALON MUSTAHIK
↓
ISI KUESIONER / ASESMEN
↓
KIRIM PENGAJUAN
↓
STATUS = MENUNGGU VERIFIKASI
↓
ADMIN MELAKUKAN VERIFIKASI
↓
STATUS DIPERBARUI
↓
USER MEMANTAU HASIL PENGAJUAN

---

# 5. ALUR ADMIN

START
↓
ADMIN LOGIN
↓
LOGIN BERHASIL?

Jika TIDAK:
↓
Kembali ke LOGIN

Jika YA:
↓
ADMIN DASHBOARD
↓
ADMIN DAPAT MEMILIH:

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

---

# 6. ALUR PENGAJUAN USER

User login
↓
Membuka menu Pengajuan
↓
Mengisi data calon mustahik
↓
Data pengajuan tersimpan
↓
User membuka menu Kuesioner
↓
Mengisi seluruh asesmen/kuesioner
↓
Mengirim kuesioner
↓
Pengajuan masuk ke proses verifikasi
↓
Status = MENUNGGU VERIFIKASI

---

# 7. ALUR VERIFIKASI ADMIN

Admin login
↓
Membuka menu Verifikasi
↓
Melihat daftar calon mustahik
↓
Memilih salah satu calon mustahik
↓
Melihat data pengajuan
↓
Melihat jawaban kuesioner/asesmen
↓
Melakukan validasi data
↓
DATA VALID?

Jika TIDAK:
↓
Status = PERLU PERBAIKAN atau DITOLAK

Jika YA:
↓
Status = LOLOS VERIFIKASI
↓
Data dapat masuk ke proses TOPSIS

---

# 8. KUESIONER / FORM ASESMEN

Kuesioner mengikuti konsep Form Asesmen Seleksi Mustahik Zakat Produktif yang diberikan oleh client.

Form asesmen digunakan sebagai input penilaian untuk Sistem Pendukung Keputusan menggunakan metode TOPSIS.

Struktur asesmen menggunakan lima dimensi Maqashid Syariah.

Contoh struktur:

- C1 Hifzh ad-Din
- C2 Hifzh an-Nafs
- C3 Hifzh al-Aql
- C4 Hifzh an-Nasl
- C5 Hifzh al-Mal

Setiap dimensi dapat memiliki beberapa indikator penilaian.

Contoh:

C1 Hifzh ad-Din

- ID1 Integritas dan kepatuhan muamalah
- ID2 Komitmen pembinaan spiritual
- ID3 Komitmen amanah terhadap program

User memberikan jawaban berdasarkan kondisi yang dialami saat ini.

---

# 9. SKALA PENILAIAN KUESIONER

Saat ini kuesioner menggunakan skala nilai 1 sampai 5.

Interpretasi sementara:

1 = Kondisi sangat buruk / sangat tidak sesuai
2 = Kurang
3 = Cukup
4 = Baik
5 = Sangat baik

CATATAN PENTING:

Interpretasi detail setiap angka masih dapat berubah apabila client memberikan aturan penilaian yang lebih spesifik.

Jangan mengubah pertanyaan, indikator, bobot, atau interpretasi nilai tanpa instruksi terbaru dari client.

Jika ada revisi dari client mengenai Form Asesmen TOPSIS, gunakan requirement terbaru dari client.

---

# 10. DATA IDENTITAS CALON MUSTAHIK

Data identitas dapat mencakup:

- Nama lengkap
- NIK
- Tempat lahir
- Tanggal lahir
- Nomor HP
- Alamat
- Status pernikahan
- Jumlah tanggungan
- Pendidikan terakhir
- Pekerjaan utama
- Pekerjaan sampingan
- Jenis usaha
- Lama usaha

Field harus mengikuti struktur backend dan database yang sudah tersedia.

Jangan mengubah nama field database tanpa mempertimbangkan backend yang sudah ada.

---

# 11. STATUS PENGAJUAN

Status pengajuan yang digunakan:

- DRAFT
- MENUNGGU_VERIFIKASI
- SEDANG_DIVERIFIKASI
- PERLU_PERBAIKAN
- LOLOS_VERIFIKASI
- DITOLAK
- DIPROSES_TOPSIS
- LAYAK_DIDANAI
- TIDAK_DIDANAI

Gunakan status yang konsisten antara:

- Frontend
- Backend
- Database
- Dashboard user
- Dashboard admin
- Halaman verifikasi
- Hasil pengajuan

---

# 12. METODE TOPSIS

TOPSIS digunakan untuk membantu proses penilaian dan pemeringkatan calon mustahik.

Tahapan utama:

1. Menentukan alternatif
2. Menentukan kriteria
3. Menentukan bobot kriteria
4. Membentuk matriks keputusan
5. Melakukan normalisasi
6. Melakukan normalisasi terbobot
7. Menentukan solusi ideal positif
8. Menentukan solusi ideal negatif
9. Menghitung jarak alternatif
10. Menghitung nilai preferensi
11. Membuat ranking
12. Menentukan hasil kelayakan

Hasil sistem dapat berupa:

- Nilai TOPSIS
- Ranking
- Status Layak Didanai
- Status Tidak Didanai

CATATAN:

Jangan membuat atau mengubah rumus, bobot, tipe benefit/cost, atau aturan kelayakan tanpa requirement yang jelas dari client.

---

# 13. TECH STACK

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Router

## Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT
- bcrypt

## Database

- MySQL
- Prisma ORM

## Local Development

- Laragon
- MySQL lokal

---

# 14. STRUKTUR SISTEM

Project memiliki frontend dan backend yang terpisah.

Contoh struktur:

webspkayu/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   ├── services/
    │   ├── utils/
    │   └── server.ts
    │
    ├── prisma/
    └── package.json

Jangan mengubah struktur project secara besar-besaran tanpa alasan.

Gunakan struktur yang sudah ada sebagai acuan utama.

---

# 15. AUTHENTICATION

Sistem menggunakan authentication untuk user dan admin.

Setiap role memiliki akses yang berbeda.

USER:

- Hanya dapat mengakses halaman user
- Tidak dapat mengakses halaman admin

ADMIN:

- Dapat mengakses halaman admin sesuai hak akses

Pastikan:

- Login user tidak tercampur dengan admin
- Redirect setelah login sesuai role
- Protected route bekerja
- Session/token tersimpan dengan benar
- Halaman admin tidak meminta login ulang jika session masih valid
- User tidak dapat masuk ke halaman admin tanpa role yang sesuai

Jangan menghapus sistem authentication yang sudah ada kecuali memang diperlukan untuk memperbaiki bug.

---

# 16. LAYOUT DAN SIDEBAR

Sistem memiliki layout User dan Admin.

Namun desain sidebar harus tetap konsisten.

Sidebar Admin menggunakan desain visual yang sama atau mengikuti gaya sidebar User yang sudah lebih baik.

Perbedaan utama sidebar hanya pada:

- Menu
- Icon
- Role
- Hak akses

Jangan membuat dua desain sidebar yang sangat berbeda tanpa alasan.

Prioritaskan consistency UI.

---

# 17. USER INTERFACE

Desain aplikasi harus:

- Modern
- Clean
- Profesional
- Responsive
- Mudah digunakan
- Tidak terlalu ramai
- Cocok untuk sistem zakat dan pelayanan sosial

Gunakan:

- Nuansa hijau sebagai warna utama
- Background putih atau off-white
- Soft gray sebagai warna pendukung
- Rounded card
- Soft shadow
- Typography yang jelas
- Lucide icons
- Badge status
- Table yang clean
- Form yang mudah digunakan

Hindari:

- Gradient berlebihan
- Glassmorphism berlebihan
- Animasi berlebihan
- Terlalu banyak warna
- UI yang tidak konsisten

---

# 18. FRONTEND RULE

Saat melakukan perubahan frontend:

- Jangan mengubah desain halaman lain tanpa diminta
- Jangan menghapus fitur yang sudah berfungsi
- Jangan membuat halaman baru jika tidak diperlukan
- Gunakan reusable component jika memungkinkan
- Perbaiki bug tanpa merusak flow yang sudah ada
- Pastikan responsive
- Gunakan TypeScript dengan benar
- Jangan menggunakan `any` jika tipe yang jelas dapat dibuat
- Periksa error build setelah melakukan perubahan

---

# 19. BACKEND RULE

Saat melakukan perubahan backend:

- Jangan mengubah endpoint tanpa alasan
- Jangan mengubah response API tanpa mengecek frontend
- Jangan mengubah database schema tanpa mengecek relasi
- Jangan membuat data dummy jika database seharusnya digunakan
- Pastikan authentication tetap berjalan
- Pastikan authorization berdasarkan role
- Gunakan error handling yang jelas

Setiap perubahan backend harus mempertimbangkan dampaknya terhadap frontend.

---

# 20. DATABASE RULE

Database menggunakan MySQL dengan Prisma ORM.

Entity utama dapat mencakup:

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

Jangan mengubah schema Prisma sembarangan.

Sebelum mengubah schema:

1. Periksa schema yang sudah ada
2. Periksa relasi
3. Periksa backend yang menggunakan model tersebut
4. Periksa frontend yang menggunakan response API

---

# 21. CURRENT PROJECT STATE

Project saat ini sudah memiliki:

- Frontend
- Backend
- Database
- Authentication
- User role
- Admin role
- Pengajuan
- Kuesioner
- Halaman admin
- Verifikasi
- Deploy frontend/backend

Project bukan lagi tahap membuat UI dari nol.

Fokus utama saat ini adalah:

- Memperbaiki bug
- Menyambungkan flow yang belum sempurna
- Memastikan authentication berjalan benar
- Memastikan route sesuai role
- Memastikan frontend dan backend terhubung
- Menyesuaikan requirement terbaru dari client
- Melanjutkan fitur yang belum selesai

---

# 22. CURRENT FLOW YANG HARUS DIPERTAHANKAN

USER:

Register / Login
↓
Dashboard
↓
Pengajuan
↓
Isi Data
↓
Kuesioner / Asesmen
↓
Kirim
↓
Menunggu Verifikasi
↓
Admin Verifikasi
↓
Proses TOPSIS
↓
Hasil Kelayakan
↓
User Pantau Hasil

ADMIN:

Login
↓
Dashboard
↓
Melihat Data Mustahik
↓
Melihat Detail Pengajuan
↓
Melihat Jawaban Kuesioner
↓
Verifikasi
↓
Data Lolos Verifikasi
↓
Proses TOPSIS
↓
Ranking
↓
Layak / Tidak Layak

---

# 23. ATURAN PENTING UNTUK AI AGENT

Sebelum mengubah kode:

1. Pahami struktur project yang sudah ada.
2. Cari file yang berhubungan dengan fitur yang akan diperbaiki.
3. Jangan langsung mengganti banyak file tanpa memahami dependensinya.
4. Pertahankan fitur yang sudah berfungsi.
5. Jika memperbaiki bug, fokus pada akar masalah.
6. Jangan membuat ulang seluruh project.
7. Jangan mengganti tech stack.
8. Jangan membuat backend baru jika backend sudah tersedia.
9. Jangan membuat authentication baru jika sistem auth sudah ada.
10. Jangan menghapus route atau context tanpa mengecek penggunaannya.

Jika ada error TypeScript:

- Cari sumber tipe/interface yang benar.
- Jangan memperbaiki dengan `any` secara sembarangan.
- Pastikan import/export sesuai.
- Jalankan build setelah perbaikan.

Jika ada bug frontend dan backend:

- Periksa request API.
- Periksa response API.
- Periksa authentication/token.
- Periksa role.
- Periksa protected route.
- Periksa state/context.
- Jangan hanya memperbaiki tampilan jika masalah berasal dari backend.

---

# 24. PRIORITAS SAAT INI

Prioritas pengerjaan:

1. Memastikan authentication user dan admin berjalan benar
2. Memastikan routing berdasarkan role berjalan benar
3. Memastikan halaman admin tidak salah redirect ke login
4. Menyamakan desain sidebar admin dengan desain sidebar user
5. Memastikan pengajuan tersimpan dan terbaca
6. Memastikan kuesioner terhubung dengan data pengajuan
7. Memastikan admin dapat melihat data pengajuan dan jawaban kuesioner
8. Memastikan flow verifikasi berjalan
9. Melanjutkan integrasi TOPSIS sesuai requirement client

---

# 25. SOURCE OF TRUTH

Urutan prioritas requirement:

1. Instruksi terbaru dari client
2. Flowchart terbaru dari client
3. Form Asesmen TOPSIS dari client
4. README ini
5. Struktur project dan implementasi yang sudah berjalan

Jika requirement terbaru dari client berbeda dengan README ini, ikuti requirement terbaru dari client dan perbarui README jika diperlukan.

JANGAN mengarang requirement penting yang belum diberikan oleh client.

Jika ada bagian yang belum jelas, tandai sebagai TODO atau tanyakan terlebih dahulu.