import { Router } from 'express';
import { createJawaban, getKuesioner, updateJawaban } from '../controllers/kuesioner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
export const kuesionerRouter = Router();
kuesionerRouter.use(authenticate);
kuesionerRouter.get('/', asyncHandler(getKuesioner));
kuesionerRouter.post('/jawaban', asyncHandler(createJawaban));
kuesionerRouter.put('/jawaban', asyncHandler(updateJawaban));
