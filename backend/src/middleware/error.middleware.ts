import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';

export const notFound = (_req: unknown, res: any) =>
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan', errors: [] });

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Data unik sudah digunakan', errors: [] });
  }
  return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', errors: [] });
};
