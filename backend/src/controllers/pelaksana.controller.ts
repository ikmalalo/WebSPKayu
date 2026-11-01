import type { Request, Response } from 'express'
import { StatusPenugasan, PengajuanStatus, Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'

function success(res: Response, message: string, data: unknown = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

function fail(res: Response, message: string, statusCode = 500, data: unknown = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  })
}

function getPelaksanaId(req: Request): string | null {
  const request = req as Request & {
    auth?: {
      userId?: string
      role?: string
    }
  }
  return request.auth?.userId || null
}

// ============================================================
// GET TUGAS SURVEI PELAKSANA (HANYA MILIK AKUN YANG LOGIN)
// ============================================================

export async function getTugasPelaksana(req: Request, res: Response) {
  try {
    const pelaksanaId = getPelaksanaId(req)
    if (!pelaksanaId) {
      return fail(res, 'Pelaksana belum terautentikasi', 401)
    }

    const statusQuery = req.query.status ? String(req.query.status).toUpperCase() : undefined
    const search = req.query.search ? String(req.query.search).trim() : ''

    // FILTER KETAT DI LEVEL BACKEND: HANYA TUGAS MILIK AKUN YANG LOGIN
    const where: any = {
      pelaksanaId,
    }

    if (statusQuery && Object.values(StatusPenugasan).includes(statusQuery as StatusPenugasan)) {
      where.status = statusQuery as StatusPenugasan
    }

    if (search) {
      where.mustahik = {
        OR: [
          { namaLengkap: { contains: search } },
          { nik: { contains: search } },
          { alamat: { contains: search } },
          { kelurahan: { contains: search } },
          { kecamatan: { contains: search } },
        ],
      }
    }

    const daftarTugas = await prisma.penugasanSurvei.findMany({
      where,
      include: {
        mustahik: {
          select: {
            id: true,
            nik: true,
            namaLengkap: true,
            tempatLahir: true,
            tanggalLahir: true,
            jenisKelamin: true,
            noHp: true,
            alamat: true,
            kelurahan: true,
            kecamatan: true,
            kota: true,
            provinsi: true,
            statusPernikahan: true,
            pekerjaan: true,
            penghasilan: true,
            jumlahTanggungan: true,
            statusRumah: true,
            kondisiRumah: true,
            kepemilikanAset: true,
            pengajuan: {
              select: {
                id: true,
                status: true,
                _count: {
                  select: { jawaban: true },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Hitung statistik khusus untuk pelaksana ini
    const allMyTasks = await prisma.penugasanSurvei.findMany({
      where: { pelaksanaId },
      select: { status: true },
    })

    const stats = {
      total: allMyTasks.length,
      ditugaskan: allMyTasks.filter((t) => t.status === StatusPenugasan.DITUGASKAN).length,
      sedangSurvei: allMyTasks.filter((t) => t.status === StatusPenugasan.SEDANG_SURVEI).length,
      selesai: allMyTasks.filter((t) => t.status === StatusPenugasan.SELESAI).length,
      dibatalkan: allMyTasks.filter((t) => t.status === StatusPenugasan.DIBATALKAN).length,
    }

    return success(res, 'Daftar tugas survei berhasil diambil', {
      tugas: daftarTugas,
      stats,
      total: daftarTugas.length,
    })
  } catch (error) {
    console.error('GET TUGAS PELAKSANA ERROR:', error)
    return fail(res, 'Gagal mengambil daftar tugas survei', 500)
  }
}

// ============================================================
// GET DETAIL TUGAS PELAKSANA (CEK OTORISASI KETAT)
// ============================================================

export async function getDetailTugasPelaksana(req: Request, res: Response) {
  try {
    const pelaksanaId = getPelaksanaId(req)
    if (!pelaksanaId) {
      return fail(res, 'Pelaksana belum terautentikasi', 401)
    }

    const { id } = req.params

    const penugasan = await prisma.penugasanSurvei.findUnique({
      where: { id },
      include: {
        mustahik: {
          include: {
            pengajuan: {
              include: {
                jawaban: {
                  include: {
                    indikator: {
                      include: {
                        kriteria: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!penugasan) {
      return fail(res, 'Data penugasan survei tidak ditemukan', 404)
    }

    // CEK OTORISASI KETAT: Pelaksana hanya boleh melihat tugas miliknya sendiri!
    if (penugasan.pelaksanaId !== pelaksanaId) {
      return fail(res, 'Anda tidak memiliki hak akses untuk melihat tugas ini', 403)
    }

    return success(res, 'Detail tugas survei berhasil diambil', { penugasan })
  } catch (error) {
    console.error('GET DETAIL TUGAS ERROR:', error)
    return fail(res, 'Gagal mengambil detail tugas survei', 500)
  }
}

// ============================================================
// UPDATE STATUS TUGAS OLEH PELAKSANA (PROGRES SURVEI)
// ============================================================

export async function updateStatusTugas(req: Request, res: Response) {
  try {
    const pelaksanaId = getPelaksanaId(req)
    if (!pelaksanaId) {
      return fail(res, 'Pelaksana belum terautentikasi', 401)
    }

    const { id } = req.params
    const { status, catatan } = req.body || {}

    const penugasan = await prisma.penugasanSurvei.findUnique({
      where: { id },
    })

    if (!penugasan) {
      return fail(res, 'Data penugasan survei tidak ditemukan', 404)
    }

    // CEK OTORISASI KETAT: Pelaksana tidak boleh mengubah status tugas pelaksana lain!
    if (penugasan.pelaksanaId !== pelaksanaId) {
      return fail(res, 'Anda tidak memiliki hak akses untuk mengubah tugas ini', 403)
    }

    const targetStatus = String(status || '').toUpperCase()
    // Pelaksana hanya diizinkan mengubah status menjadi SEDANG_SURVEI atau SELESAI
    const allowedStatuses: StatusPenugasan[] = [StatusPenugasan.SEDANG_SURVEI, StatusPenugasan.SELESAI]
    if (!allowedStatuses.includes(targetStatus as StatusPenugasan)) {
      return fail(res, 'Status tidak valid. Pelaksana hanya dapat mengubah ke SEDANG_SURVEI atau SELESAI', 422)
    }

    const dataToUpdate: any = {
      status: targetStatus as StatusPenugasan,
    }

    if (catatan !== undefined) {
      dataToUpdate.catatan = catatan ? String(catatan).trim() : null
    }

    if (targetStatus === StatusPenugasan.SEDANG_SURVEI && !penugasan.tanggalMulai) {
      dataToUpdate.tanggalMulai = new Date()
    }

    if (targetStatus === StatusPenugasan.SELESAI && !penugasan.tanggalSelesai) {
      dataToUpdate.tanggalSelesai = new Date()
    }

    const updated = await prisma.penugasanSurvei.update({
      where: { id },
      data: dataToUpdate,
      include: {
        mustahik: {
          select: {
            id: true,
            nik: true,
            namaLengkap: true,
          },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: pelaksanaId,
        action: 'PELAKSANA_UPDATE_STATUS_TUGAS',
        entity: 'PenugasanSurvei',
        entityId: updated.id,
        metadata: {
          previousStatus: penugasan.status,
          newStatus: updated.status,
        },
      },
    })

    return success(res, 'Status tugas survei berhasil diperbarui', { penugasan: updated })
  } catch (error) {
    console.error('UPDATE STATUS TUGAS ERROR:', error)
    return fail(res, 'Gagal memperbarui status tugas survei', 500)
  }
}

// ============================================================
// SUBMIT / UPDATE HASIL SURVEI OLEH PELAKSANA
// ============================================================
export async function submitHasilSurveiPelaksana(req: Request, res: Response) {
  try {
    const pelaksanaId = getPelaksanaId(req)
    if (!pelaksanaId) {
      return fail(res, 'Pelaksana belum terautentikasi', 401)
    }

    const { id } = req.params // penugasanId
    const { jawaban, statusRumah, statusPenugasan, catatan } = req.body || {}

    // 1. Verifikasi penugasan milik pelaksana yang login
    const penugasan = await prisma.penugasanSurvei.findUnique({
      where: { id },
      include: {
        mustahik: {
          include: {
            pengajuan: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!penugasan) {
      return fail(res, 'Data penugasan survei tidak ditemukan', 404)
    }

    if (penugasan.pelaksanaId !== pelaksanaId) {
      return fail(res, 'Anda tidak memiliki hak akses untuk menginput survei pada tugas ini', 403)
    }

    if (penugasan.status === StatusPenugasan.DIBATALKAN) {
      return fail(res, 'Tugas survei ini sudah dibatalkan dan tidak dapat diisi', 422)
    }

    // 2. Pastikan atau buat record Pengajuan untuk mustahik
    let currentPengajuan = penugasan.mustahik.pengajuan?.[0]
    if (!currentPengajuan) {
      currentPengajuan = await prisma.pengajuan.create({
        data: {
          mustahikId: penugasan.mustahikId,
          status: PengajuanStatus.DRAFT,
          catatan: 'Dibuat otomatis untuk survei lapangan',
        },
      })
    }

    // 3. Validasi daftar jawaban jika disertakan
    if (!Array.isArray(jawaban) || jawaban.length === 0) {
      return fail(res, 'Daftar jawaban indikator survei wajib diisi', 422)
    }

    // Ambil indikator aktif
    const indikatorAktif = await prisma.indikator.findMany({
      where: { aktif: true, kriteria: { aktif: true } },
      select: { id: true, kode: true },
      orderBy: { urutan: 'asc' },
    })

    const isFinalizing = statusPenugasan === StatusPenugasan.SELESAI

    // Jika difinalisasi, semua indikator wajib lengkap
    if (isFinalizing && jawaban.length !== indikatorAktif.length) {
      return fail(res, `Semua ${indikatorAktif.length} indikator kriteria survei wajib diisi untuk menyelesaikan survei`, 422)
    }

    // Validasi nilai jawaban (skala 1 - 5)
    for (const item of jawaban) {
      const val = Number(item.nilai)
      if (isNaN(val) || val < 1 || val > 5) {
        return fail(res, `Nilai jawaban untuk indikator ${item.indikatorId} harus antara 1 sampai 5`, 422)
      }
    }

    // 4. Jalankan transaksi database: Simpan/update jawaban & update status
    const result = await prisma.$transaction(async (tx) => {
      // Simpan status rumah mustahik jika ada
      if (statusRumah) {
        await tx.mustahik.update({
          where: { id: penugasan.mustahikId },
          data: { statusRumah },
        })
      }

      // Upsert tiap jawaban kuesioner
      for (const item of jawaban) {
        const existingJawaban = await tx.jawabanKuesioner.findFirst({
          where: {
            pengajuanId: currentPengajuan.id,
            indikatorId: item.indikatorId,
          },
        })

        if (existingJawaban) {
          await tx.jawabanKuesioner.update({
            where: { id: existingJawaban.id },
            data: { nilai: new Prisma.Decimal(item.nilai) },
          })
        } else {
          await tx.jawabanKuesioner.create({
            data: {
              pengajuanId: currentPengajuan.id,
              indikatorId: item.indikatorId,
              nilai: new Prisma.Decimal(item.nilai),
            },
          })
        }
      }

      // Update status penugasan
      const nextPenugasanStatus = isFinalizing ? StatusPenugasan.SELESAI : StatusPenugasan.SEDANG_SURVEI
      const penugasanUpdateData: any = {
        status: nextPenugasanStatus,
      }
      if (catatan !== undefined) {
        penugasanUpdateData.catatan = catatan ? String(catatan).trim() : null
      }
      if (!penugasan.tanggalMulai) {
        penugasanUpdateData.tanggalMulai = new Date()
      }
      if (isFinalizing && !penugasan.tanggalSelesai) {
        penugasanUpdateData.tanggalSelesai = new Date()
      }

      const updatedPenugasan = await tx.penugasanSurvei.update({
        where: { id },
        data: penugasanUpdateData,
      })

      // Jika selesai, update status pengajuan agar siap masuk verifikasi/TOPSIS
      const nextPengajuanStatus = isFinalizing ? PengajuanStatus.LOLOS_VERIFIKASI : PengajuanStatus.SEDANG_DIVERIFIKASI
      await tx.pengajuan.update({
        where: { id: currentPengajuan.id },
        data: { status: nextPengajuanStatus },
      })

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: pelaksanaId,
          action: isFinalizing ? 'PELAKSANA_SELESAIKAN_SURVEI' : 'PELAKSANA_SIMPAN_DRAF_SURVEI',
          entity: 'PenugasanSurvei',
          entityId: id,
          metadata: {
            pengajuanId: currentPengajuan.id,
            totalJawaban: jawaban.length,
            statusPenugasan: updatedPenugasan.status,
            statusPengajuan: nextPengajuanStatus,
          },
        },
      })

      return updatedPenugasan
    })

    return success(res, isFinalizing ? 'Survei lapangan berhasil diselesaikan' : 'Progres survei berhasil disimpan', {
      penugasan: result,
      pengajuanId: currentPengajuan.id,
    })
  } catch (error) {
    console.error('SUBMIT HASIL SURVEI PELAKSANA ERROR:', error)
    return fail(res, 'Gagal menyimpan hasil survei lapangan', 500)
  }
}
