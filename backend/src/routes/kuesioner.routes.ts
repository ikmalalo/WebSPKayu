import { Router } from 'express'

import {
  getKuesioner,
  createJawaban,
  updateJawaban,
} from '../controllers/kuesioner.controller'

import {
  authenticate,
} from '../middleware/auth.middleware'

// ============================================================
// ROUTER
// ============================================================

export const kuesionerRouter =
  Router()

// ============================================================
// GET KUESIONER
// ============================================================
//
// GET /api/kuesioner
//
// Mengambil:
// - 5 kriteria aktif
// - 15 indikator aktif ID1 sampai ID15
//
// ============================================================

kuesionerRouter.get(
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
//
// ============================================================

kuesionerRouter.post(
  '/jawaban',
  authenticate,
  createJawaban
)

// ============================================================
// UPDATE JAWABAN KUESIONER
// ============================================================
//
// PUT /api/kuesioner/jawaban
//
// Endpoint ini digunakan untuk memperbarui
// jawaban kuesioner selama pengajuan masih
// berstatus DRAFT.
//
// ============================================================

kuesionerRouter.put(
  '/jawaban',
  authenticate,
  updateJawaban
)

// ============================================================
// DEFAULT EXPORT
// ============================================================
//
// Tetap disediakan agar kompatibel apabila
// ada file lain yang menggunakan default import.
//
// ============================================================

export default kuesionerRouter