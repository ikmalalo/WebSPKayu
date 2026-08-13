import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { fail, success } from '../utils/api-response';
import { isEmail, requireFields } from '../validators/common';

const userSelect = { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true } as const;
const tokenFor = (id: string, role: Role) => jwt.sign({ userId: id, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] });

export async function register(req: Request, res: Response) {
  const missing = requireFields(req.body, ['name', 'email', 'password']);
  if (missing.length || !isEmail(req.body.email) || String(req.body.password).length < 8) {
    return fail(res, 'Data register tidak valid', 422, [{ fields: missing, rules: 'email valid dan password minimal 8 karakter' }]);
  }
  const email = String(req.body.email).trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return fail(res, 'Email sudah digunakan', 409);
  const user = await prisma.user.create({
    data: { name: String(req.body.name).trim(), email, passwordHash: await bcrypt.hash(String(req.body.password), 12), role: Role.USER },
    select: userSelect,
  });
  await prisma.auditLog.create({ data: { userId: user.id, action: 'REGISTER', entity: 'User', entityId: user.id } });
  return success(res, 'Register berhasil', { user }, 201);
}

export async function login(req: Request, res: Response) {
  const missing = requireFields(req.body, ['email', 'password']);
  if (missing.length || !isEmail(req.body.email)) return fail(res, 'Email dan password wajib diisi', 422);
  const user = await prisma.user.findUnique({ where: { email: String(req.body.email).trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(String(req.body.password), user.passwordHash))) return fail(res, 'Email atau password salah', 401);
  return success(res, 'Login berhasil', { token: tokenFor(user.id, user.role), user: await prisma.user.findUnique({ where: { id: user.id }, select: userSelect }) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: userSelect });
  if (!user) return fail(res, 'User tidak ditemukan', 404);
  return success(res, 'Data user berhasil diambil', { user });
}
