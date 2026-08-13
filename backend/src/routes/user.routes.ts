import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
export const userRouter = Router();
userRouter.use(authenticate);
userRouter.get('/profile', asyncHandler(getProfile));
userRouter.put('/profile', asyncHandler(updateProfile));
