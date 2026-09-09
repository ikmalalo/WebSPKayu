import rateLimit from 'express-rate-limit'

// Rate limiter umum untuk seluruh API (300 request per 15 menit per IP)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.',
  },
})

// Rate limiter ketat untuk Auth: Login & Register (10 percobaan per 15 menit per IP)
// Mencegah Brute Force dan Credential Stuffing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan autentikasi dari IP ini. Silakan coba lagi setelah 15 menit.',
  },
})
