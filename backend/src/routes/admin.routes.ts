import {
  Router,
} from 'express'

import {
  requireAuth,
} from '../middleware/auth.middleware'

import {
  requireAdmin,
} from '../middleware/admin.middleware'

import {
  asyncHandler,
} from '../utils/async-handler'

// ============================================================
// ADMIN CONTROLLERS
// ============================================================

// Dashboard
import {
  getDashboard,
} from '../controllers/admin.controller'

// Mustahik
import {
  getAllMustahik,
  getMustahikById,
  updateMustahik,
  deleteMustahik,
} from '../controllers/mustahik.controller'

// Verifikasi
import {
  getVerifikasi,
  getVerifikasiById,
  createVerifikasi,
} from '../controllers/verifikasi.controller'

// Kriteria
import {
  getKriteria,
  createKriteria,
  updateKriteria,
  deleteKriteria,
} from '../controllers/kriteria.controller'

// Subkriteria
import {
  getSubKriteria,
  createSubKriteria,
  updateSubKriteria,
  deleteSubKriteria,
} from '../controllers/subkriteria.controller'

// TOPSIS
import {
  getTopsisCandidates,
  processTopsis,
  getTopsisResults,
  getTopsisResult,
} from '../controllers/topsis.controller'

const adminRouter =
  Router()

// ============================================================
// AUTHENTICATION + ADMIN AUTHORIZATION
// ============================================================
//
// Semua endpoint dalam file ini:
//
// 1. Harus login
// 2. Harus memiliki role ADMIN
//
// Jadi frontend tidak bisa mengakses endpoint admin hanya
// dengan mengetahui URL-nya.
// ============================================================

adminRouter.use(
  requireAuth
)

adminRouter.use(
  requireAdmin
)

// ============================================================
// DASHBOARD ADMIN
// ============================================================
//
// GET /api/admin/dashboard
//
// Data:
//
// - Total Mustahik
// - Pengajuan Baru
// - Menunggu Verifikasi
// - Sudah Diverifikasi
// - Layak Didanai
// - Tidak Didanai
// - Grafik pengajuan
// - Distribusi status
//
// ============================================================

adminRouter.get(
  '/dashboard',
  asyncHandler(
    getDashboard
  )
)

// ============================================================
// DATA MUSTAHIK
// ============================================================

// ------------------------------------------------------------
// GET SEMUA MUSTAHIK
// ------------------------------------------------------------
//
// GET /api/admin/mustahik
//
// Query yang didukung controller:
// ?search=...
// ?status=...
//
// ------------------------------------------------------------

adminRouter.get(
  '/mustahik',
  asyncHandler(
    getAllMustahik
  )
)

// ------------------------------------------------------------
// GET DETAIL MUSTAHIK
// ------------------------------------------------------------
//
// GET /api/admin/mustahik/:id
//
// ------------------------------------------------------------

adminRouter.get(
  '/mustahik/:id',
  asyncHandler(
    getMustahikById
  )
)

// ------------------------------------------------------------
// UPDATE MUSTAHIK
// ------------------------------------------------------------
//
// PUT /api/admin/mustahik/:id
//
// ------------------------------------------------------------

adminRouter.put(
  '/mustahik/:id',
  asyncHandler(
    updateMustahik
  )
)

// ------------------------------------------------------------
// DELETE MUSTAHIK
// ------------------------------------------------------------
//
// DELETE /api/admin/mustahik/:id
//
// ------------------------------------------------------------

adminRouter.delete(
  '/mustahik/:id',
  asyncHandler(
    deleteMustahik
  )
)

// ============================================================
// VERIFIKASI
// ============================================================

// ------------------------------------------------------------
// GET SEMUA DATA VERIFIKASI
// ------------------------------------------------------------
//
// GET /api/admin/verifikasi
//
// Query:
//
// ?status=semua
// ?status=perlu_verifikasi
// ?status=sudah_diverifikasi
//
// Controller bertanggung jawab melakukan filter.
//
// ------------------------------------------------------------

adminRouter.get(
  '/verifikasi',
  asyncHandler(
    getVerifikasi
  )
)

// ------------------------------------------------------------
// GET DETAIL VERIFIKASI
// ------------------------------------------------------------
//
// GET /api/admin/verifikasi/:id
//
// :id = ID PENGAJUAN
//
// ------------------------------------------------------------

adminRouter.get(
  '/verifikasi/:id',
  asyncHandler(
    getVerifikasiById
  )
)

// ------------------------------------------------------------
// POST KEPUTUSAN VERIFIKASI
// ------------------------------------------------------------
//
// POST /api/admin/verifikasi/:id
//
// Body:
//
// {
//   "status": "LOLOS",
//   "catatan": "..."
// }
//
// atau:
//
// {
//   "status": "PERLU_PERBAIKAN",
//   "catatan": "..."
// }
//
// atau:
//
// {
//   "status": "DITOLAK",
//   "catatan": "..."
// }
//
// ------------------------------------------------------------

adminRouter.post(
  '/verifikasi/:id',
  asyncHandler(
    createVerifikasi
  )
)

// ============================================================
// KRITERIA TOPSIS
// ============================================================

// ------------------------------------------------------------
// GET KRITERIA
// ------------------------------------------------------------
//
// GET /api/admin/kriteria
//
// ------------------------------------------------------------

adminRouter.get(
  '/kriteria',
  asyncHandler(
    getKriteria
  )
)

// ------------------------------------------------------------
// CREATE KRITERIA
// ------------------------------------------------------------
//
// POST /api/admin/kriteria
//
// ------------------------------------------------------------

adminRouter.post(
  '/kriteria',
  asyncHandler(
    createKriteria
  )
)

// ------------------------------------------------------------
// UPDATE KRITERIA
// ------------------------------------------------------------
//
// PUT /api/admin/kriteria/:id
//
// ------------------------------------------------------------

adminRouter.put(
  '/kriteria/:id',
  asyncHandler(
    updateKriteria
  )
)

// ------------------------------------------------------------
// DELETE KRITERIA
// ------------------------------------------------------------
//
// DELETE /api/admin/kriteria/:id
//
// ------------------------------------------------------------

adminRouter.delete(
  '/kriteria/:id',
  asyncHandler(
    deleteKriteria
  )
)

// ============================================================
// SUBKRITERIA TOPSIS
// ============================================================

// ------------------------------------------------------------
// GET SUBKRITERIA
// ------------------------------------------------------------
//
// GET /api/admin/subkriteria
//
// Optional:
//
// ?kriteriaId=...
//
// ------------------------------------------------------------

adminRouter.get(
  '/subkriteria',
  asyncHandler(
    getSubKriteria
  )
)

// ------------------------------------------------------------
// CREATE SUBKRITERIA
// ------------------------------------------------------------
//
// POST /api/admin/subkriteria
//
// ------------------------------------------------------------

adminRouter.post(
  '/subkriteria',
  asyncHandler(
    createSubKriteria
  )
)

// ------------------------------------------------------------
// UPDATE SUBKRITERIA
// ------------------------------------------------------------
//
// PUT /api/admin/subkriteria/:id
//
// ------------------------------------------------------------

adminRouter.put(
  '/subkriteria/:id',
  asyncHandler(
    updateSubKriteria
  )
)

// ------------------------------------------------------------
// DELETE SUBKRITERIA
// ------------------------------------------------------------
//
// DELETE /api/admin/subkriteria/:id
//
// ------------------------------------------------------------

adminRouter.delete(
  '/subkriteria/:id',
  asyncHandler(
    deleteSubKriteria
  )
)

// ============================================================
// TOPSIS
// ============================================================
//
// FLOW:
//
// LOLOS_VERIFIKASI
//        ↓
// DIPROSES_TOPSIS
//        ↓
// /topsis/candidates
//        ↓
// MATRKS X
//        ↓
// /topsis/process
//        ↓
// TopsisResult
//        ↓
// RANKING
//
// ============================================================

// ------------------------------------------------------------
// GET KANDIDAT TOPSIS
// ------------------------------------------------------------
//
// GET /api/admin/topsis/candidates
//
// INI PENTING.
//
// Endpoint ini membaca:
//
// Pengajuan
// +
// JawabanKuesioner
//
// bukan TopsisResult.
//
// Karena itu pengajuan Ikmal yang statusnya
// DIPROSES_TOPSIS tetap muncul sebelum admin menekan
// "Hitung TOPSIS".
//
// ------------------------------------------------------------

adminRouter.get(
  '/topsis/candidates',
  asyncHandler(
    getTopsisCandidates
  )
)

// ------------------------------------------------------------
// PROCESS TOPSIS
// ------------------------------------------------------------
//
// POST /api/admin/topsis/process
//
// Body:
//
// {
//   "layakThreshold": 0.6
// }
//
// Backend:
//
// 1. Mengambil kandidat
// 2. Membentuk matriks X
// 3. Normalisasi
// 4. Normalisasi terbobot
// 5. Solusi ideal
// 6. Jarak
// 7. Nilai preferensi
// 8. Ranking
// 9. Status kelayakan
// 10. Simpan TopsisResult
//
// ------------------------------------------------------------

adminRouter.post(
  '/topsis/process',
  asyncHandler(
    processTopsis
  )
)

// ------------------------------------------------------------
// GET HASIL TOPSIS
// ------------------------------------------------------------
//
// GET /api/admin/topsis/results
//
// Digunakan:
//
// - Hasil Ranking
// - Laporan
// - Detail hasil
//
// ------------------------------------------------------------

adminRouter.get(
  '/topsis/results',
  asyncHandler(
    getTopsisResults
  )
)

// ------------------------------------------------------------
// GET DETAIL HASIL TOPSIS
// ------------------------------------------------------------
//
// GET /api/admin/topsis/results/:id
//
// ------------------------------------------------------------

adminRouter.get(
  '/topsis/results/:id',
  asyncHandler(
    getTopsisResult
  )
)

// ============================================================
// EXPORT
// ============================================================

export default adminRouter