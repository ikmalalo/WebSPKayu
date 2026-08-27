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
  updateMustahik,
  deleteMustahik,

  // Verifikasi
  getVerifikasi,
  getVerifikasiById,
  createVerifikasi,
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
  getTopsisResults,
  getTopsisResultById,
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
// TOPSIS - DETAIL RESULT
// ============================================================

adminRouter.get(
  '/topsis/results/:id',
  asyncHandler(
    getTopsisResultById
  )
)