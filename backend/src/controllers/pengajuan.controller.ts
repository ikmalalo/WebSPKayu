import type { Request, Response } from 'express'
import {
  PengajuanStatus,
} from '@prisma/client'

import { prisma } from '../config/prisma'

// ============================================================
// HELPER RESPONSE
// ============================================================

function success(
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

function errorResponse(
  res: Response,
  message: string,
  statusCode = 500
) {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

// ============================================================
// HELPER AUTH
// ============================================================

function getUserId(
  req: Request
): string | null {
  const auth = (
    req as Request & {
      auth?: {
        userId?: string
      }
    }
  ).auth

  return auth?.userId || null
}

// ============================================================
// HELPER KONVERSI DATA MUSTAHIK
// ============================================================

function toDateOrNull(
  value: unknown
): Date | null {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null
  }

  const date =
    new Date(
      String(value)
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null
  }

  return date
}

function toNumberOrNull(
  value: unknown
): number | null {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null
  }

  const number =
    Number(value)

  if (
    Number.isNaN(number)
  ) {
    return null
  }

  return number
}

function stringOrNull(
  value: unknown
): string | null {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return null
  }

  return String(value).trim()
}

// ============================================================
// DATA MUSTAHIK DARI REQUEST
// ============================================================

function toMustahikData(
  raw: Record<string, unknown>
) {
  return {
    nik: String(
      raw.nik || ''
    ).trim(),

    namaLengkap:
      String(
        raw.namaLengkap || ''
      ).trim(),

    tempatLahir:
      stringOrNull(
        raw.tempatLahir
      ),

    tanggalLahir:
      toDateOrNull(
        raw.tanggalLahir
      ),

    jenisKelamin:
      stringOrNull(
        raw.jenisKelamin
      ),

    alamat:
      stringOrNull(
        raw.alamat
      ),

    kelurahan:
      stringOrNull(
        raw.kelurahan
      ),

    kecamatan:
      stringOrNull(
        raw.kecamatan
      ),

    kota:
      stringOrNull(
        raw.kota
      ),

    provinsi:
      stringOrNull(
        raw.provinsi
      ),

    noHp:
      stringOrNull(
        raw.noHp
      ),

    statusPernikahan:
      stringOrNull(
        raw.statusPernikahan
      ),

    pekerjaan:
      stringOrNull(
        raw.pekerjaan
      ),

    /*
     * Data ekonomi / kondisi tempat tinggal
     * tetap disimpan jika dikirim oleh frontend,
     * tetapi bukan bagian dari form kuesioner.
     *
     * Nilai TOPSIS nantinya berasal dari jawaban
     * kuesioner pada JawabanKuesioner.
     */

    penghasilan:
      toNumberOrNull(
        raw.penghasilan
      ),

    jumlahTanggungan:
      raw.jumlahTanggungan ===
        undefined ||
      raw.jumlahTanggungan ===
        null ||
      raw.jumlahTanggungan === ''
        ? null
        : Number(
            raw.jumlahTanggungan
          ),

    statusRumah:
      stringOrNull(
        raw.statusRumah
      ),

    kondisiRumah:
      stringOrNull(
        raw.kondisiRumah
      ),

    kepemilikanAset:
      stringOrNull(
        raw.kepemilikanAset
      ),
  }
}

// ============================================================
// INCLUDE PENGAJUAN
// ============================================================

const pengajuanInclude = {
  mustahik: true,

  jawaban: {
    include: {
      kriteria: true,
      subKriteria: true,
    },

    orderBy: {
      createdAt: 'asc' as const,
    },
  },

  verifications: {
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc' as const,
    },
  },

  topsisResults: {
    include: {
      details: {
        include: {
          kriteria: true,
        },
      },
    },

    orderBy: {
      tanggalProses: 'desc' as const,
    },
  },
}

// ============================================================
// CREATE PENGAJUAN
// ============================================================
//
// POST /api/pengajuan
//
// Flow:
//
// USER
// ↓
// Isi data mustahik
// ↓
// CREATE PENGAJUAN
// ↓
// DRAFT
// ↓
// Isi Kuesioner
// ↓
// MENUNGGU_VERIFIKASI
//
// SATU USER HANYA BOLEH MEMILIKI SATU PENGAJUAN.
// ============================================================

export async function createPengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return errorResponse(
        res,
        'User belum terautentikasi',
        401
      )
    }

    // --------------------------------------------------------
    // Ambil body
    // --------------------------------------------------------

    const raw =
      (
        req.body?.mustahik ||
        req.body
      ) as Record<
        string,
        unknown
      >

    // --------------------------------------------------------
    // Validasi data wajib
    // --------------------------------------------------------

    const nik =
      String(
        raw?.nik || ''
      ).trim()

    const namaLengkap =
      String(
        raw?.namaLengkap || ''
      ).trim()

    if (!nik) {
      return errorResponse(
        res,
        'NIK wajib diisi',
        422
      )
    }

    if (!namaLengkap) {
      return errorResponse(
        res,
        'Nama lengkap wajib diisi',
        422
      )
    }

    // --------------------------------------------------------
    // 🔒 SATU USER = SATU PENGAJUAN
    // --------------------------------------------------------

    const existingPengajuan =
      await prisma.pengajuan.findFirst(
        {
          where: {
            userId,
          },

          orderBy: {
            createdAt: 'desc',
          },
        }
      )

    if (
      existingPengajuan
    ) {
      return errorResponse(
        res,
        'Anda sudah memiliki pengajuan. Satu user hanya dapat melakukan satu pengajuan.',
        409
      )
    }

    // --------------------------------------------------------
    // Cek NIK
    // --------------------------------------------------------

    const existingNik =
      await prisma.mustahik.findUnique(
        {
          where: {
            nik,
          },
        }
      )

    if (
      existingNik &&
      existingNik.userId !==
        userId
    ) {
      return errorResponse(
        res,
        'NIK sudah digunakan oleh user lain',
        409
      )
    }

    // --------------------------------------------------------
    // Data mustahik
    // --------------------------------------------------------

    const mustahikData =
      toMustahikData(
        raw
      )

    // --------------------------------------------------------
    // Transaction
    // --------------------------------------------------------

    const result =
      await prisma.$transaction(
        async (
          tx
        ) => {

          // ==================================================
          // CREATE / UPDATE MUSTAHIK
          // ==================================================

          let mustahik

          const existingMustahik =
            await tx.mustahik.findUnique(
              {
                where: {
                  userId,
                },
              }
            )

          if (
            existingMustahik
          ) {
            mustahik =
              await tx.mustahik.update(
                {
                  where: {
                    id:
                      existingMustahik.id,
                  },

                  data:
                    mustahikData,
                }
              )
          } else {
            mustahik =
              await tx.mustahik.create(
                {
                  data: {
                    ...mustahikData,

                    user: {
                      connect: {
                        id:
                          userId,
                      },
                    },
                  },
                }
              )
          }

          // ==================================================
          // CREATE PENGAJUAN
          // ==================================================

          const pengajuan =
            await tx.pengajuan.create(
              {
                data: {
                  userId,

                  mustahikId:
                    mustahik.id,

                  status:
                    PengajuanStatus.DRAFT,
                },

                include:
                  pengajuanInclude,
              }
            )

          // ==================================================
          // AUDIT LOG
          // ==================================================

          await tx.auditLog.create(
            {
              data: {
                userId,

                action:
                  'CREATE_PENGAJUAN',

                entity:
                  'Pengajuan',

                entityId:
                  pengajuan.id,

                metadata: {
                  status:
                    PengajuanStatus.DRAFT,
                },
              },
            }
          )

          return pengajuan
        }
      )

    return success(
      res,
      'Pengajuan berhasil dibuat',
      {
        pengajuan:
          result,
      },
      201
    )
  } catch (error: any) {
    console.error(
      'CREATE PENGAJUAN ERROR:',
      error
    )

    // Prisma unique constraint
    if (
      error?.code ===
      'P2002'
    ) {
      return errorResponse(
        res,
        'Data sudah digunakan. Periksa NIK atau pengajuan Anda.',
        409
      )
    }

    return errorResponse(
      res,
      'Gagal membuat pengajuan',
      500
    )
  }
}

// ============================================================
// GET PENGAJUAN USER
// ============================================================
//
// GET /api/pengajuan/me
//
// Mengambil SEMUA pengajuan milik user.
// Saat ini sistem membatasi create menjadi satu,
// tetapi endpoint tetap mengembalikan array supaya frontend
// tetap kompatibel.
// ============================================================

export async function getMyPengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return errorResponse(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const pengajuan =
      await prisma.pengajuan.findMany(
        {
          where: {
            userId,
          },

          include:
            pengajuanInclude,

          orderBy: {
            createdAt:
              'desc',
          },
        }
      )

    return success(
      res,
      'Data pengajuan berhasil diambil',
      {
        pengajuan,
        total:
          pengajuan.length,
      }
    )
  } catch (error) {
    console.error(
      'GET MY PENGAJUAN ERROR:',
      error
    )

    return errorResponse(
      res,
      'Gagal mengambil data pengajuan',
      500
    )
  }
}

// ============================================================
// GET DETAIL PENGAJUAN
// ============================================================
//
// GET /api/pengajuan/:id
//
// USER hanya boleh melihat pengajuan miliknya.
// ADMIN dapat menggunakan endpoint admin sendiri.
// ============================================================

export async function getPengajuanById(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return errorResponse(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    if (!id) {
      return errorResponse(
        res,
        'ID pengajuan wajib diisi',
        422
      )
    }

    const pengajuan =
      await prisma.pengajuan.findUnique(
        {
          where: {
            id,
          },

          include:
            pengajuanInclude,
        }
      )

    if (
      !pengajuan
    ) {
      return errorResponse(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    // --------------------------------------------------------
    // User hanya bisa melihat miliknya sendiri
    // --------------------------------------------------------

    if (
      pengajuan.userId !==
      userId
    ) {
      return errorResponse(
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

    return errorResponse(
      res,
      'Gagal mengambil detail pengajuan',
      500
    )
  }
}

// ============================================================
// UPDATE DATA MUSTAHIK
// ============================================================
//
// PUT /api/pengajuan/:id
//
// Catatan:
//
// Fungsi ini hanya mengubah DATA MUSTAHIK.
// Tidak boleh mengubah status pengajuan dari sini.
//
// Ini penting supaya frontend tidak bisa sembarangan
// mengubah status menjadi MENUNGGU_VERIFIKASI.
//
// ============================================================

export async function updatePengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return errorResponse(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    if (!id) {
      return errorResponse(
        res,
        'ID pengajuan wajib diisi',
        422
      )
    }

    const pengajuan =
      await prisma.pengajuan.findUnique(
        {
          where: {
            id,
          },

          include: {
            mustahik: true,
          },
        }
      )

    if (
      !pengajuan
    ) {
      return errorResponse(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    if (
      pengajuan.userId !==
      userId
    ) {
      return errorResponse(
        res,
        'Anda tidak memiliki akses ke pengajuan ini',
        403
      )
    }

    // --------------------------------------------------------
    // Data yang boleh diedit
    // --------------------------------------------------------

    const raw =
      (
        req.body?.mustahik ||
        req.body
      ) as Record<
        string,
        unknown
      >

    const data =
      toMustahikData(
        raw
      )

    if (
      !data.nik
    ) {
      return errorResponse(
        res,
        'NIK wajib diisi',
        422
      )
    }

    if (
      !data.namaLengkap
    ) {
      return errorResponse(
        res,
        'Nama lengkap wajib diisi',
        422
      )
    }

    // --------------------------------------------------------
    // Cek NIK milik user lain
    // --------------------------------------------------------

    const existingNik =
      await prisma.mustahik.findUnique(
        {
          where: {
            nik:
              data.nik,
          },
        }
      )

    if (
      existingNik &&
      existingNik.id !==
        pengajuan.mustahikId
    ) {
      return errorResponse(
        res,
        'NIK sudah digunakan oleh user lain',
        409
      )
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------

    const updated =
      await prisma.$transaction(
        async (
          tx
        ) => {

          const mustahik =
            await tx.mustahik.update(
              {
                where: {
                  id:
                    pengajuan.mustahikId,
                },

                data,
              }
            )

          const updatedPengajuan =
            await tx.pengajuan.findUnique(
              {
                where: {
                  id,
                },

                include:
                  pengajuanInclude,
              }
            )

          await tx.auditLog.create(
            {
              data: {
                userId,

                action:
                  'UPDATE_MUSTAHIK',

                entity:
                  'Mustahik',

                entityId:
                  mustahik.id,

                metadata: {
                  pengajuanId:
                    id,
                },
              },
            }
          )

          return updatedPengajuan
        }
      )

    return success(
      res,
      'Data mustahik berhasil diperbarui',
      {
        pengajuan:
          updated,
      }
    )
  } catch (error: any) {
    console.error(
      'UPDATE PENGAJUAN ERROR:',
      error
    )

    if (
      error?.code ===
      'P2002'
    ) {
      return errorResponse(
        res,
        'NIK sudah digunakan oleh user lain',
        409
      )
    }

    return errorResponse(
      res,
      'Gagal memperbarui data pengajuan',
      500
    )
  }
}

// ============================================================
// DELETE / CANCEL PENGAJUAN
// ============================================================
//
// Sistem kamu menggunakan flow satu kali pengajuan.
// Karena itu saya TIDAK menghapus data pengajuan dari database
// secara sembarangan.
//
// Fungsi ini hanya mengizinkan pembatalan ketika masih DRAFT.
//
// Jika route delete memang tidak digunakan, fungsi ini aman
// untuk tidak dipasang di routes.
// ============================================================

export async function deletePengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return errorResponse(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    const pengajuan =
      await prisma.pengajuan.findUnique(
        {
          where: {
            id,
          },
        }
      )

    if (
      !pengajuan
    ) {
      return errorResponse(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    if (
      pengajuan.userId !==
      userId
    ) {
      return errorResponse(
        res,
        'Anda tidak memiliki akses ke pengajuan ini',
        403
      )
    }

    // --------------------------------------------------------
    // Hanya DRAFT yang boleh dibatalkan
    // --------------------------------------------------------

    if (
      pengajuan.status !==
      PengajuanStatus.DRAFT
    ) {
      return errorResponse(
        res,
        'Pengajuan yang sudah diproses tidak dapat dihapus',
        409
      )
    }

    await prisma.$transaction(
      async (
        tx
      ) => {

        await tx.pengajuan.delete(
          {
            where: {
              id,
            },
          }
        )

        await tx.auditLog.create(
          {
            data: {
              userId,

              action:
                'DELETE_PENGAJUAN',

              entity:
                'Pengajuan',

              entityId:
                id,
            },
          }
        )
      }
    )

    return success(
      res,
      'Pengajuan berhasil dibatalkan'
    )
  } catch (error) {
    console.error(
      'DELETE PENGAJUAN ERROR:',
      error
    )

    return errorResponse(
      res,
      'Gagal membatalkan pengajuan',
      500
    )
  }
}