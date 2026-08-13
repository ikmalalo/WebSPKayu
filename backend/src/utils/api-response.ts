import type { Response } from 'express';

export const success = (res: Response, message: string, data: unknown = {}, status = 200) =>
  res.status(status).json({ success: true, message, data });

export const fail = (res: Response, message: string, status = 400, errors: unknown[] = []) =>
  res.status(status).json({ success: false, message, errors });
