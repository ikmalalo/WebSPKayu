import type {
  Request,
  Response,
} from 'express'

import {
  PengajuanStatus,
  Prisma,
} from '@prisma/client'

import {
  prisma,
} from '../config/prisma'

import {
  fail,
  success,
} from '../utils/api-response'

// ============================================================
// INCLUDE PENGAJUAN
// ============================================================

const include = {
  mustahik: true,

  jawaban: {
    include: {
      kriteria: true,
      subKriteria: true,
    },
  },

  /*
   * PENTING:
   *
   * Verifikasi terbaru harus berada
   * di index [0].
   *
   * Karena frontend menggunakan:
   *
   * verifications[0]
   *
   * untuk mengambil catatan/status
   * verifikasi terbaru.
   */
  verifications: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },

  topsisResults: {
    orderBy: {
      tanggalProses:
        'desc' as const,
    },
  },
}

// ============================================================
// FIELD MUSTAHIK
// ============================================================

const mustahikFields = [
  'nik',
  'namaLengkap',
  'tempatLahir',
  'tanggalLahir',
  'jenisKelamin',
  'alamat',
  'kelurahan',
  'kecamatan',
  'kota',
  'provinsi',
  'noHp',
  'statusPernikahan',
  'pekerjaan',
  'penghasilan',
  'jumlahTanggungan',
  'statusRumah',
  'kondisiRumah',
  'kepemilikanAset',
]

// ============================================================
// CONVERT DATA MUSTAHIK
// ============================================================

function toMustahikData(
  raw: Record<string, unknown>
) {
  const data: Record<
    string,
    unknown
  > = {}

  for (
    const key of mustahikFields
  ) {
    if (
      raw[key] !== undefined &&
      raw[key] !== ''
    ) {
      data[key] =
        raw[key]
    }
  }

  if (
    data.tanggalLahir
  ) {
    data.tanggalLahir =
      new Date(
        String(
          data.tanggalLahir
        )
      )
  }

  if (
    data.penghasilan !==
    undefined
  ) {
    data.penghasilan =
      new Prisma.Decimal(
        String(
          data.penghasilan
        )
      )
  }

  if (
    data.jumlahTanggungan !==
    undefined
  ) {
    data.jumlahTanggungan =
      Number(
        data.jumlahTanggungan
      )
  }

  return data
}

// ============================================================
// CREATE PENGAJUAN
// ============================================================

export async function createPengajuan(
  req: Request,
  res: Response
) {
  try {
    const raw =
      (
        req.body.mustahik ||
        req.body
      ) as Record<
        string,
        unknown
      >

    if (
      !raw.nik ||
      !raw.namaLengkap
    ) {
      return fail(
        res,
        'NIK dan nama lengkap wajib diisi',
        422
      )
    }

    const userId =
      req.auth!.userId

    const data =
      toMustahikData(raw)

    // ========================================================
    // CEK NIK
    // ========================================================

    const existingNik =
      await prisma.mustahik.findUnique(
        {
          where: {
            nik: String(
              raw.nik
            ),
          },
        }
      )

    if (
      existingNik &&
      existingNik.userId !==
        userId
    ) {
      return fail(
        res,
        'NIK sudah digunakan oleh user lain',
        409
      )
    }

    // ========================================================
    // UPSERT MUSTAHIK
    // ========================================================

    const mustahik =
      await prisma.mustahik.upsert(
        {
          where: {
            userId,
          },

          create: {
            ...data,
            userId,
            nik: String(
              raw.nik
            ),
            namaLengkap:
              String(
                raw.namaLengkap
              ),
          } as any,

          update:
            data as any,
        }
      )

    // ========================================================
    // CREATE PENGAJUAN
    // ========================================================

    const pengajuan =
      await prisma.pengajuan.create(
        {
          data: {
            userId,
            mustahikId:
              mustahik.id,
            status:
              PengajuanStatus.DRAFT,
          },

          include,
        }
      )

    return success(
      res,
      'Pengajuan draft berhasil dibuat',
      {
        pengajuan,
      },
      201
    )
  } catch (error) {
    console.error(
      'CREATE PENGAJUAN ERROR:',
      error
    )

    return fail(
      res,
      'Gagal membuat pengajuan',
      500
    )
  }
}

// ============================================================
// GET MY PENGAJUAN
// ============================================================

export async function getMyPengajuan(
  req: Request,
  res: Response
) {
  try {
    const pengajuan =
      await prisma.pengajuan.findMany(
        {
          where: {
            userId:
              req.auth!.userId,
          },

          include,

          orderBy: {
            createdAt:
              'desc',
          },
        }
      )

    return success(
      res,
      'Daftar pengajuan berhasil diambil',
      {
        pengajuan,
      }
    )
  } catch (error) {
    console.error(
      'GET MY PENGAJUAN ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil daftar pengajuan',
      500
    )
  }
}

// ============================================================
// GET PENGAJUAN BY ID
// ============================================================

export async function getPengajuanById(
  req: Request,
  res: Response
) {
  try {
    const pengajuan =
      await prisma.pengajuan.findUnique(
        {
          where: {
            id: req.params.id,
          },

          include,
        }
      )

    if (!pengajuan) {
      return fail(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    // ========================================================
    // CEK HAK AKSES
    // ========================================================

    if (
      req.auth!.role !==
        'ADMIN' &&
      pengajuan.userId !==
        req.auth!.userId
    ) {
      return fail(
        res,
        'Anda tidak memiliki akses ke pengajuan ini',
        403
      )
    }

    return success(
      res,
      'Detail pengajuan berhasil diambil',
      {
        pengajuan,
      }
    )
  } catch (error) {
    console.error(
      'GET PENGAJUAN DETAIL ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil detail pengajuan',
      500
    )
  }
}

// ============================================================
// UPDATE DATA MUSTAHIK
// ============================================================

export async function updateMustahikData(
  req: Request,
  res: Response
) {
  try {
    const userId =
      req.auth!.userId

    const raw =
      (
        req.body.mustahik ||
        req.body
      ) as Record<
        string,
        unknown
      >

    const data =
      toMustahikData(raw)

    // ========================================================
    // UPDATE / CREATE MUSTAHIK
    // ========================================================

    const mustahik =
      await prisma.mustahik.upsert(
        {
          where: {
            userId,
          },

          create: {
            ...data,
            userId,
            nik: String(
              raw.nik || ''
            ),
            namaLengkap:
              String(
                raw.namaLengkap ||
                  ''
              ),
          } as any,

          update:
            data as any,
        }
      )

    return success(
      res,
      'Data mustahik berhasil diperbarui',
      {
        mustahik,
      }
    )
  } catch (error) {
    console.error(
      'UPDATE MUSTAHIK DATA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal memperbarui data mustahik',
      500
    )
  }
}