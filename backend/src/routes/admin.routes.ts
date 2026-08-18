import {
  Router,
} from 'express'

import {
  authorize,
  authenticate,
} from '../middleware/auth.middleware'

import {
  asyncHandler,
} from '../utils/async-handler'

import {
  getDashboard,
  listMustahik,
  getMustahik,
  updateMustahik,
  deleteMustahik,
  listVerifikasi,
  getVerifikasi,
  submitVerifikasi,
} from '../controllers/admin.controller'

import {
  createKriteria,
  createSubKriteria,
  deleteKriteria,
  deleteSubKriteria,
  listKriteria,
  listSubKriteria,
  updateKriteria,
  updateSubKriteria,
} from '../controllers/kriteria.controller'

import {
  getTopsisResult,
  getTopsisResults,
  processTopsis,
} from '../controllers/topsis.controller'

export const adminRouter =
  Router()

// Semua endpoint admin wajib ADMIN
adminRouter.use(
  authenticate,
  authorize('ADMIN')
)

// ============================================================
// DASHBOARD
// ============================================================

adminRouter.get(
  '/dashboard',
  asyncHandler(
    getDashboard
  )
)

// ============================================================
// MUSTAHIK
// ============================================================

adminRouter.get(
  '/mustahik',
  asyncHandler(
    listMustahik
  )
)

adminRouter.get(
  '/mustahik/:id',
  asyncHandler(
    getMustahik
  )
)

adminRouter.put(
  '/mustahik/:id',
  asyncHandler(
    updateMustahik
  )
)

adminRouter.delete(
  '/mustahik/:id',
  asyncHandler(
    deleteMustahik
  )
)

// ============================================================
// VERIFIKASI
// ============================================================

adminRouter.get(
  '/verifikasi',
  asyncHandler(
    listVerifikasi
  )
)

adminRouter.get(
  '/verifikasi/:id',
  asyncHandler(
    getVerifikasi
  )
)

adminRouter.post(
  '/verifikasi/:id',
  asyncHandler(
    submitVerifikasi
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
// TOPSIS
// ============================================================

adminRouter.post(
  '/topsis/process',
  asyncHandler(
    processTopsis
  )
)

adminRouter.get(
  '/topsis/results',
  asyncHandler(
    getTopsisResults
  )
)

adminRouter.get(
  '/topsis/results/:id',
  asyncHandler(
    getTopsisResult
  )
)