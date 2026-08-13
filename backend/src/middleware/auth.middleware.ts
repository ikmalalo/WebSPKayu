import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { fail } from '../utils/api-response';

interface TokenPayload { userId: string; role: Role }

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return fail(res, 'Token autentikasi diperlukan', 401);
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as TokenPayload;
    if (!payload.userId || !payload.role) return fail(res, 'Token tidak valid', 401);
    req.auth = payload;
    next();
  } catch { return fail(res, 'Token tidak valid atau sudah kedaluwarsa', 401); }
}

export const authorize = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) return fail(res, 'Anda tidak memiliki akses ke resource ini', 403);
  next();
};
