import { Router } from 'express';
import { createPengajuan, getMyPengajuan, getPengajuanById } from '../controllers/pengajuan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
export const pengajuanRouter = Router();
pengajuanRouter.use(authenticate);
pengajuanRouter.post('/', asyncHandler(createPengajuan));
pengajuanRouter.get('/me', asyncHandler(getMyPengajuan));
pengajuanRouter.get('/:id', asyncHandler(getPengajuanById));
