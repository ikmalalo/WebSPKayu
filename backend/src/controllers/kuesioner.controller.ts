import type { Request, Response } from 'express';
import { PengajuanStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { fail, success } from '../utils/api-response';

export async function getKuesioner(_req: Request, res: Response) {
  const kriteria = await prisma.kriteria.findMany({ where: { aktif: true }, include: { subKriteria: { orderBy: { nilai: 'asc' } } }, orderBy: { kode: 'asc' } });
  return success(res, 'Kuesioner berhasil diambil', { kriteria });
}
async function saveAnswers(req: Request, res: Response, message: string) {
  const { pengajuanId, jawaban } = req.body as { pengajuanId?: string; jawaban?: Array<{ kriteriaId: string; subKriteriaId: string }> };
  if (!pengajuanId || !Array.isArray(jawaban) || !jawaban.length) return fail(res, 'pengajuanId dan jawaban wajib diisi', 422);
  const pengajuan = await prisma.pengajuan.findUnique({ where: { id: pengajuanId } });
  if (!pengajuan) return fail(res, 'Pengajuan tidak ditemukan', 404);
  if (pengajuan.userId !== req.auth!.userId) return fail(res, 'Anda tidak memiliki akses ke pengajuan ini', 403);
  const ids = jawaban.map((x) => x.subKriteriaId);
  const subs = await prisma.subKriteria.findMany({ where: { id: { in: ids } } });
  if (subs.length !== jawaban.length || jawaban.some((x) => !subs.some((s) => s.id === x.subKriteriaId && s.kriteriaId === x.kriteriaId))) return fail(res, 'Subkriteria tidak sesuai dengan kriteria', 422);
  await prisma.$transaction([
    ...jawaban.map((item) => {
      const sub = subs.find((s) => s.id === item.subKriteriaId)!;
      return prisma.jawabanKuesioner.upsert({ where: { pengajuanId_kriteriaId: { pengajuanId, kriteriaId: item.kriteriaId } }, create: { pengajuanId, kriteriaId: item.kriteriaId, subKriteriaId: item.subKriteriaId, nilai: sub.nilai }, update: { subKriteriaId: item.subKriteriaId, nilai: sub.nilai } });
    }),
    prisma.pengajuan.update({ where: { id: pengajuanId }, data: { status: PengajuanStatus.MENUNGGU_VERIFIKASI } }),
  ]);
  return success(res, message, { pengajuanId });
}
export const createJawaban = (req: Request, res: Response) => saveAnswers(req, res, 'Jawaban kuesioner berhasil disimpan');
export const updateJawaban = (req: Request, res: Response) => saveAnswers(req, res, 'Jawaban kuesioner berhasil diperbarui');
