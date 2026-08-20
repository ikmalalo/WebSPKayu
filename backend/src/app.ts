import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { pengajuanRouter } from './routes/pengajuan.routes';
import { kuesionerRouter } from './routes/kuesioner.routes';
import { adminRouter } from './routes/admin.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

export const app = express();

const allowedOrigins = env.corsOrigin
  .split(',')
  .map((item) => item.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    message: 'API berjalan',
    data: {},
  })
);

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/pengajuan', pengajuanRouter);
app.use('/api/kuesioner', kuesionerRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);