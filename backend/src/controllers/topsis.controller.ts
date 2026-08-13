import type { Request, Response } from 'express';
import { PengajuanStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { fail, success } from '../utils/api-response';
import { calculateTopsis } from '../services/topsis/topsis.service';

export async function processTopsis(req: Request, res: Response) {
  const threshold = Number(req.body.layakThreshold);
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) return fail(res, 'layakThreshold (0 sampai 1) wajib ditentukan oleh admin', 422);
  const criteria = await prisma.kriteria.findMany({ where: { aktif: true }, orderBy: { kode: 'asc' } });
  if (!criteria.length) return fail(res, 'Belum ada kriteria aktif', 422);
  const pengajuan = await prisma.pengajuan.findMany({ where: { status: PengajuanStatus.DIPROSES_TOPSIS }, include: { jawaban: true } });
  const ready = pengajuan.filter((item) => criteria.every((k) => item.jawaban.some((a) => a.kriteriaId === k.id)));
  if (ready.length < 2) return fail(res, 'Minimal dua pengajuan dengan jawaban kuesioner lengkap diperlukan', 422);
  const results = calculateTopsis(ready.map((item) => ({ pengajuanId: item.id, values: criteria.map((k) => Number(item.jawaban.find((a) => a.kriteriaId === k.id)!.nilai)) })), criteria.map((k) => Number(k.bobot)), criteria.map((k) => k.tipe));
  const persisted = await prisma.$transaction(async (tx) => {
    const output = [];
    for (const result of results) {
      const status = result.preference >= threshold ? PengajuanStatus.LAYAK_DIDANAI : PengajuanStatus.TIDAK_DIDANAI;
      const item = await tx.topsisResult.create({ data: { pengajuanId: result.pengajuanId, nilaiPreferensi: result.preference, ranking: result.ranking, status, details: { create: criteria.map((k, i) => ({ kriteriaId: k.id, nilaiAwal: result.values[i], nilaiNormalisasi: result.normalized[i], nilaiTerbobot: result.weighted[i] })) } }, include: { details: true } });
      await tx.pengajuan.update({ where: { id: result.pengajuanId }, data: { status } });
      output.push(item);
    }
    return output;
  });
  return success(res, 'Proses TOPSIS berhasil', { threshold, results: persisted }, 201);
}
export async function getTopsisResults(_req: Request, res: Response) { return success(res, 'Hasil TOPSIS berhasil diambil', { results: await prisma.topsisResult.findMany({ include: { pengajuan: { include: { mustahik: true } }, details: { include: { kriteria: true } } }, orderBy: [{ tanggalProses: 'desc' }, { ranking: 'asc' }] }) }); }
export async function getTopsisResult(req: Request, res: Response) { const result = await prisma.topsisResult.findUnique({ where: { id: req.params.id }, include: { pengajuan: { include: { mustahik: true } }, details: { include: { kriteria: true } } } }); return result ? success(res, 'Detail hasil TOPSIS berhasil diambil', { result }) : fail(res, 'Hasil TOPSIS tidak ditemukan', 404); }
