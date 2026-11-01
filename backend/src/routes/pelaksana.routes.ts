import { Router } from 'express'
import { Role } from '@prisma/client'
import {
  authenticate,
  authorize,
} from '../middleware/auth.middleware'
import {
  asyncHandler,
} from '../utils/async-handler'
import {
  getTugasPelaksana,
  getDetailTugasPelaksana,
  updateStatusTugas,
  submitHasilSurveiPelaksana,
} from '../controllers/pelaksana.controller'

export const pelaksanaRouter = Router()

// SEMUA RUTE PELAKSANA WAJIB LOGIN DAN MEMILIKI ROLE PELAKSANA
pelaksanaRouter.use(authenticate)
pelaksanaRouter.use(authorize(Role.PELAKSANA))

// GET DAFTAR TUGAS SURVEI PELAKSANA YANG LOGIN
pelaksanaRouter.get(
  '/tugas',
  asyncHandler(getTugasPelaksana)
)

// GET DETAIL TUGAS SURVEI TERTENTU
pelaksanaRouter.get(
  '/tugas/:id',
  asyncHandler(getDetailTugasPelaksana)
)

// UPDATE STATUS PROGRES TUGAS (SEDANG_SURVEI, SELESAI)
pelaksanaRouter.patch(
  '/tugas/:id/status',
  asyncHandler(updateStatusTugas)
)

// INPUT / UPDATE HASIL SURVEI LAPANGAN (DRAF / SELESAI)
pelaksanaRouter.post(
  '/tugas/:id/survei',
  asyncHandler(submitHasilSurveiPelaksana)
)

