import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { Role } from '@prisma/client'

import { prisma } from '../config/prisma'
import { env } from '../config/env'
import { fail, success } from '../utils/api-response'
import { isEmail } from '../validators/common'

// ============================================================
// USER SELECT
// ============================================================

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

// ============================================================
// JWT
// ============================================================

const tokenFor = (id: string, role: Role) => {
  return jwt.sign(
    {
      userId: id,
      role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    }
  )
}

// ============================================================
// REGISTER
// ============================================================
//
// Registrasi USER publik dinonaktifkan.
// Akun ADMIN dan PELAKSANA dibuat melalui pengelolaan akun
// oleh admin, bukan melalui halaman register publik.
// ============================================================

export async function register(
  _req: Request,
  res: Response
) {
  return fail(
    res,
    'Registrasi akun publik dinonaktifkan. Silakan hubungi admin untuk mendapatkan akun.',
    403
  )
}

// ============================================================
// LOGIN
// ============================================================
//
// Role yang diperbolehkan masuk:
// - ADMIN
// - PELAKSANA
//
// USER lama tidak dihapus dari database, tetapi tidak dapat
// menggunakan login sistem baru.
// ============================================================

export async function login(
  req: Request,
  res: Response
) {
  try {
    const email = String(
      req.body?.email ?? ''
    )
      .trim()
      .toLowerCase()

    const password = String(
      req.body?.password ?? ''
    )

    if (!email || !password) {
      return fail(
        res,
        'Email dan password wajib diisi',
        422
      )
    }

    if (!isEmail(email)) {
      return fail(
        res,
        'Format email tidak valid',
        422
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    // Jangan membedakan email tidak ditemukan dan password salah.
    if (!user) {
      return fail(
        res,
        'Email atau password salah',
        401
      )
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!passwordMatch) {
      return fail(
        res,
        'Email atau password salah',
        401
      )
    }

    // Hanya ADMIN dan PELAKSANA yang boleh login.
    if (
      user.role !== Role.ADMIN &&
      user.role !== Role.PELAKSANA
    ) {
      return fail(
        res,
        'Akun ini tidak memiliki akses ke sistem. Silakan hubungi admin.',
        403
      )
    }

    const token = tokenFor(
      user.id,
      user.role
    )

    const safeUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: userSelect,
    })

    if (!safeUser) {
      return fail(
        res,
        'Data akun tidak ditemukan',
        404
      )
    }

    return success(
      res,
      'Login berhasil',
      {
        token,
        user: safeUser,
      }
    )
  } catch (error) {
    console.error(
      'LOGIN ERROR:',
      error
    )

    return fail(
      res,
      'Terjadi kesalahan pada server saat login',
      500
    )
  }
}

// ============================================================
// ME
// ============================================================
//
// Mengambil data akun dari token yang sedang login.
// ============================================================

export async function me(
  req: Request,
  res: Response
) {
  try {
    const authReq = req as Request & { auth?: { userId?: string } }
    const user = await prisma.user.findUnique({
      where: {
        id: authReq.auth?.userId,
      },
      select: userSelect,
    })

    if (!user) {
      return fail(
        res,
        'User tidak ditemukan',
        404
      )
    }

    // Validasi ulang role dari database.
    if (
      user.role !== Role.ADMIN &&
      user.role !== Role.PELAKSANA
    ) {
      return fail(
        res,
        'Akun ini tidak memiliki akses ke sistem',
        403
      )
    }

    return success(
      res,
      'Data user berhasil diambil',
      {
        user,
      }
    )
  } catch (error) {
    console.error(
      'ME ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil data user',
      500
    )
  }
}