import type { Request, Response } from 'express';
import { PengajuanStatus, VerifikasiStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { fail, success } from '../utils/api-response';

export async function listMustahik(req: Request, res: Response) {
  const q = String(req.query.q || '').trim();
  const mustahik = await prisma.mustahik.findMany({ where: q ? { OR: [{ namaLengkap: { contains: q } }, { nik: { contains: q } }] } : {}, include: { user: { select: { id: true, name: true, email: true, phone: true } }, pengajuan: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } });
  return success(res, 'Data mustahik berhasil diambil', { mustahik });
}
export async function getMustahik(req: Request, res: Response) {
  const mustahik = await prisma.mustahik.findUnique({ where: { id: req.params.id }, include: { user: { select: { id: true, name: true, email: true, phone: true } }, pengajuan: { include: { jawaban: { include: { kriteria: true, subKriteria: true } }, verifications: true, topsisResults: true } } } });
  return mustahik ? success(res, 'Detail mustahik berhasil diambil', { mustahik }) : fail(res, 'Mustahik tidak ditemukan', 404);
}
export async function updateMustahik(req: Request, res: Response) {
  const current = await prisma.mustahik.findUnique({ where: { id: req.params.id } });
  if (!current) return fail(res, 'Mustahik tidak ditemukan', 404);
  const allowed = ['namaLengkap','tempatLahir','tanggalLahir','jenisKelamin','alamat','kelurahan','kecamatan','kota','provinsi','noHp','statusPernikahan','pekerjaan','penghasilan','jumlahTanggungan','statusRumah','kondisiRumah','kepemilikanAset'];
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key];
  if (data.tanggalLahir) data.tanggalLahir = new Date(String(data.tanggalLahir));
  if (data.penghasilan !== undefined) data.penghasilan = Number(data.penghasilan);
  if (data.jumlahTanggungan !== undefined) data.jumlahTanggungan = Number(data.jumlahTanggungan);
  const mustahik = await prisma.mustahik.update({ where: { id: current.id }, data });
  return success(res, 'Data mustahik berhasil diperbarui', { mustahik });
}
export async function deleteMustahik(req: Request, res: Response) {
  const current = await prisma.mustahik.findUnique({ where: { id: req.params.id } });
  if (!current) return fail(res, 'Mustahik tidak ditemukan', 404);
  await prisma.mustahik.delete({ where: { id: current.id } });
  return success(res, 'Mustahik berhasil dihapus');
}
export async function listVerifikasi(req: Request, res: Response) {
  const status = req.query.status ? String(req.query.status) as PengajuanStatus : undefined;
  const pengajuan = await prisma.pengajuan.findMany({ where: status ? { status } : { status: { in: [PengajuanStatus.MENUNGGU_VERIFIKASI, PengajuanStatus.SEDANG_DIVERIFIKASI, PengajuanStatus.PERLU_PERBAIKAN] } }, include: { mustahik: true, user: { select: { id: true, name: true, email: true } }, verifications: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'asc' } });
  return success(res, 'Daftar verifikasi berhasil diambil', { pengajuan });
}
export async function getVerifikasi(req: Request, res: Response) {
  const pengajuan = await prisma.pengajuan.findUnique({ where: { id: req.params.id }, include: { mustahik: true, user: { select: { id: true, name: true, email: true } }, jawaban: { include: { kriteria: true, subKriteria: true } }, verifications: { include: { admin: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } } } });
  if (!pengajuan) return fail(res, 'Pengajuan tidak ditemukan', 404);
  if (pengajuan.status === PengajuanStatus.MENUNGGU_VERIFIKASI) await prisma.pengajuan.update({ where: { id: pengajuan.id }, data: { status: PengajuanStatus.SEDANG_DIVERIFIKASI } });
  return success(res, 'Detail verifikasi berhasil diambil', { pengajuan });
}
export async function submitVerifikasi(req: Request, res: Response) {
  const status = String(req.body.status || '').toUpperCase() as VerifikasiStatus;
  if (!Object.values(VerifikasiStatus).includes(status)) return fail(res, 'Status verifikasi tidak valid', 422);
  const pengajuan = await prisma.pengajuan.findUnique({ where: { id: req.params.id } });
  if (!pengajuan) return fail(res, 'Pengajuan tidak ditemukan', 404);
  const nextStatus = status === VerifikasiStatus.LOLOS ? PengajuanStatus.DIPROSES_TOPSIS : status === VerifikasiStatus.PERLU_PERBAIKAN ? PengajuanStatus.PERLU_PERBAIKAN : PengajuanStatus.DITOLAK;
  const verifikasi = await prisma.$transaction(async (tx) => {
    const record = await tx.verifikasi.create({ data: { pengajuanId: pengajuan.id, adminId: req.auth!.userId, status, catatan: req.body.catatan ? String(req.body.catatan) : null } });
    await tx.pengajuan.update({ where: { id: pengajuan.id }, data: { status: nextStatus, tanggalVerifikasi: new Date(), catatan: req.body.catatan ? String(req.body.catatan) : null } });
    return record;
  });
  return success(res, 'Verifikasi berhasil disimpan', { verifikasi, pengajuanStatus: nextStatus });
}
