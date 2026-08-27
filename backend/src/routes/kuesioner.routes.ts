import {
  Router,
} from 'express'

import {
  getKuesioner,
  submitJawabanKuesioner,
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
// - 15 indikator aktif
// - Indikator ID1 sampai ID15
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
//   statusRumah: string,
//   jawaban: [
//     {
//       indikatorId: string,
//       nilai: number
//     }
//   ]
// }
//
// Semua indikator wajib dijawab.
//
// ============================================================

kuesionerRouter.post(
  '/jawaban',
  authenticate,
  submitJawabanKuesioner
)


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default kuesionerRouter