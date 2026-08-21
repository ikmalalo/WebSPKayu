import { Router } from 'express'

import {
  getKuesioner,
  createJawaban,
  updateJawaban,
} from '../controllers/kuesioner.controller'

import {
  authenticate,
} from '../middleware/auth.middleware'

const router = Router()

// ============================================================
// GET KUESIONER
// ============================================================
//
// GET /api/kuesioner
//
// Mengambil:
// - 5 kriteria
// - 15 indikator aktif ID1 sampai ID15
// ============================================================

router.get(
  '/',
  authenticate,
  getKuesioner
)

// ============================================================
// SUBMIT JAWABAN KUESIONER
// ============================================================
//
// POST /api/kuesioner/jawaban
//
// Body:
//
// {
//   pengajuanId: string,
//   jawaban: [
//     {
//       indikatorId: string,
//       nilai: number
//     }
//   ],
//   statusRumah: string
// }
// ============================================================

router.post(
  '/jawaban',
  authenticate,
  createJawaban
)

// ============================================================
// UPDATE JAWABAN
// ============================================================
//
// PUT /api/kuesioner/jawaban
//
// Endpoint tetap dipertahankan untuk kompatibilitas.
// Namun controller hanya mengizinkan pengajuan
// yang masih berstatus DRAFT.
// ============================================================

router.put(
  '/jawaban',
  authenticate,
  updateJawaban
)

export default router