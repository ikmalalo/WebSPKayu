import type { Request, Response } from 'express';
import { PengajuanStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { fail, success } from '../utils/api-response';

const include = { mustahik: true, jawaban: { include: { kriteria: true, subKriteria: true } }, verifications: true, topsisResults: { orderBy: { tanggalProses: 'desc' as const } } };
const mustahikFields = ['nik','namaLengkap','tempatLahir','tanggalLahir','jenisKelamin','alamat','kelurahan','kecamatan','kota','provinsi','noHp','statusPernikahan','pekerjaan','penghasilan','jumlahTanggungan','statusRumah','kondisiRumah','kepemilikanAset'];
function toMustahikData(raw: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const key of mustahikFields) if (raw[key] !== undefined && raw[key] !== '') data[key] = raw[key];
  if (data.tanggalLahir) data.tanggalLahir = new Date(String(data.tanggalLahir));
  if (data.penghasilan !== undefined) data.penghasilan = new Prisma.Decimal(String(data.penghasilan));
  if (data.jumlahTanggungan !== undefined) data.jumlahTanggungan = Number(data.jumlahTanggungan);
  return data;
}
export async function createPengajuan(req: Request, res: Response) {
  const raw = (req.body.mustahik || req.body) as Record<string, unknown>;
  if (!raw.nik || !raw.namaLengkap) return fail(res, 'NIK dan nama lengkap wajib diisi', 422);
  const userId = req.auth!.userId;
  const data = toMustahikData(raw);
  const existingNik = await prisma.mustahik.findUnique({ where: { nik: String(raw.nik) } });
  if (existingNik && existingNik.userId !== userId) return fail(res, 'NIK sudah digunakan oleh user lain', 409);
  const mustahik = await prisma.mustahik.upsert({ where: { userId }, create: { ...data, userId, nik: String(raw.nik), namaLengkap: String(raw.namaLengkap) } as any, update: data as any });
  const pengajuan = await prisma.pengajuan.create({ data: { userId, mustahikId: mustahik.id, status: PengajuanStatus.DRAFT }, include });
  return success(res, 'Pengajuan draft berhasil dibuat', { pengajuan }, 201);
}
export async function getMyPengajuan(req: Request, res: Response) {
  const pengajuan = await prisma.pengajuan.findMany({ where: { userId: req.auth!.userId }, include, orderBy: { createdAt: 'desc' } });
  return success(res, 'Daftar pengajuan berhasil diambil', { pengajuan });
}
export async function getPengajuanById(req: Request, res: Response) {
  const pengajuan = await prisma.pengajuan.findUnique({ where: { id: req.params.id }, include });
  if (!pengajuan) return fail(res, 'Pengajuan tidak ditemukan', 404);
  if (req.auth!.role !== 'ADMIN' && pengajuan.userId !== req.auth!.userId) return fail(res, 'Anda tidak memiliki akses ke pengajuan ini', 403);
  return success(res, 'Detail pengajuan berhasil diambil', { pengajuan });
}
export async function updateMustahikData(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const raw = (req.body.mustahik || req.body) as Record<string, unknown>;
  const data = toMustahikData(raw);
  const mustahik = await prisma.mustahik.upsert({
    where: { userId },
    create: { ...data, userId, nik: String(raw.nik || ''), namaLengkap: String(raw.namaLengkap || '') } as any,
    update: data as any,
  });
  return success(res, 'Data mustahik berhasil diperbarui', { mustahik });
}
