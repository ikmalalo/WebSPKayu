import { Router } from 'express'

import {
  getKuesioner,
  createJawaban,
  updateJawaban,
} from '../controllers/kuesioner.controller'

import {
  auth,
} from '../middleware/auth.middleware'

const router = Router()

// GET /api/kuesioner
router.get(
  '/',
  auth,
  getKuesioner
)

// POST /api/kuesioner/jawaban
router.post(
  '/jawaban',
  auth,
  createJawaban
)

// PUT /api/kuesioner/jawaban
router.put(
  '/jawaban',
  auth,
  updateJawaban
)

export default router