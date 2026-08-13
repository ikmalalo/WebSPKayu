import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { fail, success } from '../utils/api-response';

const select = { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true } as const;
export async function getProfile(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { ...select, mustahik: true } });
  return user ? success(res, 'Profil berhasil diambil', { user }) : fail(res, 'User tidak ditemukan', 404);
}
export async function updateProfile(req: Request, res: Response) {
  const allowed: Record<string, unknown> = {};
  for (const field of ['name', 'phone']) if (req.body[field] !== undefined) allowed[field] = String(req.body[field]).trim();
  if (!Object.keys(allowed).length) return fail(res, 'Tidak ada data profil yang dapat diperbarui', 422);
  const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: allowed, select });
  return success(res, 'Profil berhasil diperbarui', { user });
}
