import { Router } from 'express'

import {
  login,
  me,
  register,
} from '../controllers/auth.controller'

import {
  authenticate,
} from '../middleware/auth.middleware'

import {
  authLimiter,
} from '../middleware/rate-limiter.middleware'

import {
  asyncHandler,
} from '../utils/async-handler'

// ============================================================
// ROUTER
// ============================================================

export const authRouter = Router()

// ============================================================
// PUBLIC AUTH
// ============================================================

// Registrasi publik dinonaktifkan oleh controller.
authRouter.post(
  '/register',
  authLimiter,
  asyncHandler(register)
)

// Login ADMIN dan PELAKSANA.
authRouter.post(
  '/login',
  authLimiter,
  asyncHandler(login)
)

// ============================================================
// AUTHENTICATED USER
// ============================================================

// Mengambil profil akun yang sedang login.
authRouter.get(
  '/me',
  authenticate,
  asyncHandler(me)
)