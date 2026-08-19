import { Router } from 'express'
import { Role } from '@prisma/client'

import {
  authenticate,
  authorize,
} from '../middleware/auth.middleware'

import {
  asyncHandler,
} from '../utils/async-handler'

// ============================================================
// ADMIN CONTROLLER
// ============================================================

import {
  getDashboard,

  // Mustahik
  listMustahik,
  getMustahik,
  updateMustahik,
  deleteMustahik,

  // Verifikasi
  listVerifikasi,
  getVerifikasi,
  submitVerifikasi,
} from '../controllers/admin.controller'

// ============================================================
// KRITERIA CONTROLLER
// ============================================================

import {
  listKriteria,
  createKriteria,
  updateKriteria,
  deleteKriteria,

  listSubKriteria,
  createSubKriteria,
  updateSubKriteria,
  deleteSubKriteria,
} from '../controllers/kriteria.controller'

// ============================================================
// TOPSIS CONTROLLER
// ============================================================

import {
  getTopsisCandidates,
  processTopsis,
  getTopsisResults,
  getTopsisResult,
} from '../controllers/topsis.controller'

// ============================================================
// ROUTER
// ============================================================

export const adminRouter =
  Router()

// ============================================================
// AUTHENTICATION
// ============================================================
//
// Semua route /api/admin/*:
//
// 1. Wajib login
// 2. Wajib mempunyai role ADMIN
//
// ============================================================

adminRouter.use(
  authenticate
)

adminRouter.use(
  authorize(
    Role.ADMIN
  )
)

// ============================================================
// DASHBOARD
// ============================================================
//
// GET /api/admin/dashboard
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
//
// GET
// /api/admin/mustahik
//
// Query:
//
// ?q=nama
// ?status=LAYAK_DIDANAI
//
// ============================================================

adminRouter.get(
  '/mustahik',
  asyncHandler(
    listMustahik
  )
)

// ============================================================
// DETAIL MUSTAHIK
// ============================================================
//
// GET
// /api/admin/mustahik/:id
//
// ============================================================

adminRouter.get(
  '/mustahik/:id',
  asyncHandler(
    getMustahik
  )
)

// ============================================================
// UPDATE MUSTAHIK
// ============================================================
//
// PUT
// /api/admin/mustahik/:id
//
// ============================================================

adminRouter.put(
  '/mustahik/:id',
  asyncHandler(
    updateMustahik
  )
)

// ============================================================
// DELETE MUSTAHIK
// ============================================================
//
// DELETE
// /api/admin/mustahik/:id
//
// ============================================================

adminRouter.delete(
  '/mustahik/:id',
  asyncHandler(
    deleteMustahik
  )
)

// ============================================================
// VERIFIKASI
// ============================================================
//
// GET
// /api/admin/verifikasi
//
// Query:
//
// ?status=semua
// ?status=perlu_verifikasi
// ?status=sudah_diverifikasi
//
// ============================================================

adminRouter.get(
  '/verifikasi',
  asyncHandler(
    listVerifikasi
  )
)

// ============================================================
// DETAIL VERIFIKASI
// ============================================================
//
// GET
// /api/admin/verifikasi/:id
//
// :id = ID PENGAJUAN
//
// ============================================================

adminRouter.get(
  '/verifikasi/:id',
  asyncHandler(
    getVerifikasi
  )
)

// ============================================================
// SUBMIT VERIFIKASI
// ============================================================
//
// POST
// /api/admin/verifikasi/:id
//
// Body:
//
// {
//   "status": "LOLOS",
//   "catatan": "Data sudah sesuai"
// }
//
// atau:
//
// {
//   "status": "PERLU_PERBAIKAN",
//   "catatan": "Mohon lengkapi data"
// }
//
// atau:
//
// {
//   "status": "DITOLAK",
//   "catatan": "Data tidak memenuhi syarat"
// }
//
// ============================================================

adminRouter.post(
  '/verifikasi/:id',
  asyncHandler(
    submitVerifikasi
  )
)

// ============================================================
// KRITERIA
// ============================================================
//
// GET
// /api/admin/kriteria
//
// ============================================================

adminRouter.get(
  '/kriteria',
  asyncHandler(
    listKriteria
  )
)

// ============================================================
// CREATE KRITERIA
// ============================================================
//
// POST
// /api/admin/kriteria
//
// ============================================================

adminRouter.post(
  '/kriteria',
  asyncHandler(
    createKriteria
  )
)

// ============================================================
// UPDATE KRITERIA
// ============================================================
//
// PUT
// /api/admin/kriteria/:id
//
// ============================================================

adminRouter.put(
  '/kriteria/:id',
  asyncHandler(
    updateKriteria
  )
)

// ============================================================
// DELETE KRITERIA
// ============================================================
//
// DELETE
// /api/admin/kriteria/:id
//
// ============================================================

adminRouter.delete(
  '/kriteria/:id',
  asyncHandler(
    deleteKriteria
  )
)

// ============================================================
// SUBKRITERIA
// ============================================================
//
// GET
// /api/admin/subkriteria
//
// Optional:
//
// ?kriteriaId=...
//
// ============================================================

adminRouter.get(
  '/subkriteria',
  asyncHandler(
    listSubKriteria
  )
)

// ============================================================
// CREATE SUBKRITERIA
// ============================================================
//
// POST
// /api/admin/subkriteria
//
// ============================================================

adminRouter.post(
  '/subkriteria',
  asyncHandler(
    createSubKriteria
  )
)

// ============================================================
// UPDATE SUBKRITERIA
// ============================================================
//
// PUT
// /api/admin/subkriteria/:id
//
// ============================================================

adminRouter.put(
  '/subkriteria/:id',
  asyncHandler(
    updateSubKriteria
  )
)

// ============================================================
// DELETE SUBKRITERIA
// ============================================================
//
// DELETE
// /api/admin/subkriteria/:id
//
// ============================================================

adminRouter.delete(
  '/subkriteria/:id',
  asyncHandler(
    deleteSubKriteria
  )
)

// ============================================================
// TOPSIS - CANDIDATES
// ============================================================
//
// GET
// /api/admin/topsis/candidates
//
// Ini mengambil pengajuan yang:
//
// LOLOS_VERIFIKASI
// DIPROSES_TOPSIS
// LAYAK_DIDANAI
// TIDAK_DIDANAI
//
// dengan jawaban kuesioner lengkap.
//
// ============================================================

adminRouter.get(
  '/topsis/candidates',
  asyncHandler(
    getTopsisCandidates
  )
)

// ============================================================
// TOPSIS - PROCESS
// ============================================================
//
// POST
// /api/admin/topsis/process
//
// Body:
//
// {
//   "layakThreshold": 0.6
// }
//
// ============================================================

adminRouter.post(
  '/topsis/process',
  asyncHandler(
    processTopsis
  )
)

// ============================================================
// TOPSIS - RESULTS
// ============================================================
//
// GET
// /api/admin/topsis/results
//
// ============================================================

adminRouter.get(
  '/topsis/results',
  asyncHandler(
    getTopsisResults
  )
)

// ============================================================
// TOPSIS - DETAIL RESULT
// ============================================================
//
// GET
// /api/admin/topsis/results/:id
//
// ============================================================

adminRouter.get(
  '/topsis/results/:id',
  asyncHandler(
    getTopsisResult
  )
)