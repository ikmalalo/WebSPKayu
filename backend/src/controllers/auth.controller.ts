import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { prisma } from '../config/prisma'
import { env } from '../config/env'
import { fail, success } from '../utils/api-response'
import { isEmail, requireFields } from '../validators/common'

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

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

export async function register(req: Request, res: Response) {
  try {
    const name = String(req.body?.name ?? '').trim()
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const phone = String(req.body?.phone ?? '').trim()
    const password = String(req.body?.password ?? '')

    const missing = requireFields(req.body, [
      'name',
      'email',
      'password',
    ])

    if (missing.length > 0) {
      return fail(
        res,
        'Nama, email, dan password wajib diisi',
        422,
        [
          {
            fields: missing,
            rules: 'Semua field wajib diisi',
          },
        ]
      )
    }

    if (!isEmail(email)) {
      return fail(res, 'Format email tidak valid', 422)
    }

    if (password.length < 8) {
      return fail(
        res,
        'Password minimal 8 karakter',
        422
      )
    }

    if (name.length < 3) {
      return fail(
        res,
        'Nama minimal 3 karakter',
        422
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return fail(
        res,
        'Email sudah digunakan',
        409
      )
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    )

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: Role.USER,
      },
      select: userSelect,
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'User',
        entityId: user.id,
      },
    })

    return success(
      res,
      'Register berhasil',
      {
        user,
      },
      201
    )
  } catch (error) {
    console.error('REGISTER ERROR:', error)

    return fail(
      res,
      'Terjadi kesalahan pada server saat registrasi',
      500
    )
  }
}

export async function login(req: Request, res: Response) {
  try {
    const email = String(req.body?.email ?? '')
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

    return success(
      res,
      'Login berhasil',
      {
        token,
        user: safeUser,
      }
    )
  } catch (error) {
    console.error('LOGIN ERROR:', error)

    return fail(
      res,
      'Terjadi kesalahan pada server saat login',
      500
    )
  }
}

export async function me(
  req: Request,
  res: Response
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.auth!.userId,
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

    return success(
      res,
      'Data user berhasil diambil',
      {
        user,
      }
    )
  } catch (error) {
    console.error('ME ERROR:', error)

    return fail(
      res,
      'Gagal mengambil data user',
      500
    )
  }
}