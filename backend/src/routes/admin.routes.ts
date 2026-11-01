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
  getAdminDashboard,

  // Mustahik
  getMustahik,
  getMustahikById,
  createMustahik,
  updateMustahik,
  deleteMustahik,

  // Verifikasi
  getVerifikasi,
  getVerifikasiById,
  createVerifikasi,

  // Pelaksana
  getPelaksana,
  createPelaksana,
  updatePelaksana,
  deletePelaksana,

  // Penugasan Survei
  getPenugasan,
  getPenugasanById,
  createPenugasan,
  updatePenugasan,
  batalPenugasan,
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
  processTopsis,
  getTopsisCandidates,
  getTopsisResults,
  getTopsisResultById,
  getTopsisConfig,
  updateTopsisConfig,
  updateStatusPendanaan,
} from '../controllers/topsis.controller'

// ============================================================
// ROUTER
// ============================================================

export const adminRouter = Router()

// ============================================================
// AUTHENTICATION
// ============================================================

adminRouter.use(
  authenticate
)

adminRouter.use(
  authorize(Role.ADMIN)
)

// ============================================================
// DASHBOARD
// ============================================================

adminRouter.get(
  '/dashboard',
  asyncHandler(
    getAdminDashboard
  )
)

// ============================================================
// DATA MUSTAHIK
// ============================================================

adminRouter.get(
  '/mustahik',
  asyncHandler(
    getMustahik
  )
)

// CREATE MUSTAHIK
adminRouter.post(
  '/mustahik',
  asyncHandler(
    createMustahik
  )
)

// ============================================================
// DETAIL MUSTAHIK
// ============================================================

adminRouter.get(
  '/mustahik/:id',
  asyncHandler(
    getMustahikById
  )
)

// ============================================================
// UPDATE MUSTAHIK
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

adminRouter.delete(
  '/mustahik/:id',
  asyncHandler(
    deleteMustahik
  )
)

// ============================================================
// MANAJEMEN PELAKSANA
// ============================================================

// GET SEMUA PELAKSANA
adminRouter.get(
  '/pelaksana',
  asyncHandler(
    getPelaksana
  )
)

// CREATE AKUN PELAKSANA
adminRouter.post(
  '/pelaksana',
  asyncHandler(
    createPelaksana
  )
)

// UPDATE AKUN PELAKSANA
adminRouter.put(
  '/pelaksana/:id',
  asyncHandler(
    updatePelaksana
  )
)

// DELETE AKUN PELAKSANA
adminRouter.delete(
  '/pelaksana/:id',
  asyncHandler(
    deletePelaksana
  )
)

// ============================================================
// MANAJEMEN PENUGASAN SURVEI
// ============================================================

// GET SEMUA PENUGASAN
adminRouter.get(
  '/penugasan',
  asyncHandler(
    getPenugasan
  )
)

// GET DETAIL PENUGASAN
adminRouter.get(
  '/penugasan/:id',
  asyncHandler(
    getPenugasanById
  )
)

// CREATE PENUGASAN
adminRouter.post(
  '/penugasan',
  asyncHandler(
    createPenugasan
  )
)

// UPDATE PENUGASAN
adminRouter.put(
  '/penugasan/:id',
  asyncHandler(
    updatePenugasan
  )
)

// BATALKAN PENUGASAN
adminRouter.patch(
  '/penugasan/:id/batal',
  asyncHandler(
    batalPenugasan
  )
)

// ============================================================
// VERIFIKASI LIST
// ============================================================

adminRouter.get(
  '/verifikasi',
  asyncHandler(
    getVerifikasi
  )
)

// ============================================================
// DETAIL VERIFIKASI
// ============================================================

adminRouter.get(
  '/verifikasi/:id',
  asyncHandler(
    getVerifikasiById
  )
)

// ============================================================
// SUBMIT VERIFIKASI
// ============================================================

adminRouter.post(
  '/verifikasi/:id',
  asyncHandler(
    createVerifikasi
  )
)

// ============================================================
// KRITERIA
// ============================================================

adminRouter.get(
  '/kriteria',
  asyncHandler(
    listKriteria
  )
)

adminRouter.post(
  '/kriteria',
  asyncHandler(
    createKriteria
  )
)

adminRouter.put(
  '/kriteria/:id',
  asyncHandler(
    updateKriteria
  )
)

adminRouter.delete(
  '/kriteria/:id',
  asyncHandler(
    deleteKriteria
  )
)

// ============================================================
// SUBKRITERIA
// ============================================================

adminRouter.get(
  '/subkriteria',
  asyncHandler(
    listSubKriteria
  )
)

adminRouter.post(
  '/subkriteria',
  asyncHandler(
    createSubKriteria
  )
)

adminRouter.put(
  '/subkriteria/:id',
  asyncHandler(
    updateSubKriteria
  )
)

adminRouter.delete(
  '/subkriteria/:id',
  asyncHandler(
    deleteSubKriteria
  )
)

// ============================================================
// TOPSIS - CANDIDATES
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

adminRouter.post(
  '/topsis/process',
  asyncHandler(
    processTopsis
  )
)

// ============================================================
// TOPSIS - RESULTS
// ============================================================

adminRouter.get(
  '/topsis/results',
  asyncHandler(
    getTopsisResults
  )
)

// ============================================================
// TOPSIS - CONFIG
// ============================================================

adminRouter.get(
  '/topsis/config',
  asyncHandler(
    getTopsisConfig
  )
)

adminRouter.put(
  '/topsis/config',
  asyncHandler(
    updateTopsisConfig
  )
)

// ============================================================
// TOPSIS - DETAIL RESULT
// ============================================================

adminRouter.get(
  '/topsis/results/:id',
  asyncHandler(
    getTopsisResultById
  )
)

// ============================================================
// TOPSIS - VALIDASI STATUS PENDANAAN OLEH ADMIN
// ============================================================

adminRouter.put(
  '/topsis/results/:id/status',
  asyncHandler(
    updateStatusPendanaan
  )
)