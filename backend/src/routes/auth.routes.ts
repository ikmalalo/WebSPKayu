import { Router } from 'express'
import { login, me, register } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authLimiter } from '../middleware/rate-limiter.middleware'
import { asyncHandler } from '../utils/async-handler'

export const authRouter = Router()

authRouter.post('/register', authLimiter, asyncHandler(register))
authRouter.post('/login', authLimiter, asyncHandler(login))
authRouter.get('/me', authenticate, asyncHandler(me))

