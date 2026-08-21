import express from 'express'
import cors from 'cors'

import {
  env,
} from './config/env'

import {
  authRouter,
} from './routes/auth.routes'

import {
  userRouter,
} from './routes/user.routes'

import {
  pengajuanRouter,
} from './routes/pengajuan.routes'

import {
  kuesionerRouter,
} from './routes/kuesioner.routes'

import {
  adminRouter,
} from './routes/admin.routes'

import {
  errorHandler,
  notFound,
} from './middleware/error.middleware'

// ============================================================
// APP
// ============================================================

export const app =
  express()

// ============================================================
// CORS
// ============================================================

const allowedOrigins =
  env.corsOrigin
    .split(',')
    .map(
      (item) =>
        item.trim()
    )
    .filter(
      Boolean
    )

app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      // Mengizinkan request tanpa Origin,
      // misalnya health check Railway atau Postman.
      if (
        !origin ||
        allowedOrigins.includes(
          origin
        )
      ) {
        callback(
          null,
          true
        )

        return
      }

      console.error(
        'CORS blocked origin:',
        origin
      )

      callback(
        new Error(
          'Not allowed by CORS'
        )
      )
    },
  })
)

// ============================================================
// BODY PARSER
// ============================================================

app.use(
  express.json({
    limit: '1mb',
  })
)

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',
  (
    _req,
    res
  ) =>
    res.json({
      success: true,
      message: 'API berjalan',
      data: {},
    })
)

// ============================================================
// ROUTES
// ============================================================

app.use(
  '/api/auth',
  authRouter
)

app.use(
  '/api/user',
  userRouter
)

app.use(
  '/api/pengajuan',
  pengajuanRouter
)

app.use(
  '/api/kuesioner',
  kuesionerRouter
)

app.use(
  '/api/admin',
  adminRouter
)

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  notFound
)

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  errorHandler
)