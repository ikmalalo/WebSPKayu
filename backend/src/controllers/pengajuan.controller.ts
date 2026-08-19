import type { Request, Response } from 'express'
import {
  PengajuanStatus,
} from '@prisma/client'

import { prisma } from '../config/prisma'

// ============================================================
// RESPONSE HELPER
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

function fail(
  res: Response,
  message: string,
  statusCode = 500,
  data: unknown = null
) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  })
}

// ============================================================
// AUTH HELPER
// ============================================================

function getUserId(
  req: Request
): string | null {
  const request =
    req as Request & {
      auth?: {
        userId?: string
      }
    }

  return (
    request.auth?.userId ||
    null
  )
}

// ============================================================
// DATE HELPER
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

// ============================================================
// STRING HELPER
// ============================================================

function stringOrNull(
  value: unknown
): string | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null
  }

  const valueString =
    String(value).trim()

  if (
    !valueString
  ) {
    return null
  }

  return valueString
}

// ============================================================
// NUMBER HELPER
// ============================================================

function numberOrNull(
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

// ============================================================
// PENGAJUAN INCLUDE
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
// MUSTAHIK DATA
// ============================================================
//
// PENTING:
//
// Nama dan nomor HP TIDAK diambil dari body.
//
// Nama:
//     User.name
//
// Nomor HP:
//     User.phone
//
// Karena data tersebut berasal dari REGISTER.
// ============================================================

function createMustahikData(
  raw: Record<string, unknown>,
  user: {
    name: string
    phone: string | null
  }
) {
  return {
    /*
     * IDENTITAS
     */

    nik:
      String(
        raw.nik || ''
      ).trim(),

    /*
     * 🔒 OTOMATIS DARI USER
     */
    namaLengkap:
      user.name,

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

    /*
     * KONTAK
     *
     * 🔒 OTOMATIS DARI USER
     */
    noHp:
      user.phone,

    statusPernikahan:
      stringOrNull(
        raw.statusPernikahan
      ),

    /*
     * ALAMAT
     */

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

    /*
     * ========================================================
     * DATA EKONOMI / KONDISI RUMAH
     * ========================================================
     *
     * Data ini BUKAN berasal dari form pengajuan utama.
     *
     * Untuk alur aplikasi:
     *
     * Pengajuan
     *      ↓
     * Kuesioner
     *      ↓
     * JawabanKuesioner
     *      ↓
     * TOPSIS
     *
     * Jadi nilai TOPSIS harus berasal dari kuesioner.
     *
     * Field berikut hanya dipertahankan agar kompatibel
     * dengan schema Mustahik yang sudah ada.
     *
     * Jangan digunakan sebagai nilai TOPSIS secara langsung.
     */

    penghasilan:
      numberOrNull(
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
// GET CURRENT USER
// ============================================================

async function getCurrentUser(
  userId: string
) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  })
}

// ============================================================
// CREATE PENGAJUAN
// ============================================================
//
// POST /api/pengajuan
//
// Flow:
//
// REGISTER
//     ↓
// USER
//     ↓
// DATA PRIBADI
//     ↓
// PENGAJUAN DRAFT
//     ↓
// KUESIONER
//     ↓
// MENUNGGU_VERIFIKASI
//
// Satu user hanya boleh memiliki satu pengajuan.
// ============================================================

export async function createPengajuan(
  req: Request,
  res: Response
) {
  try {
    // ========================================================
    // AUTH
    // ========================================================

    const userId =
      getUserId(req)

    if (!userId) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    // ========================================================
    // AMBIL USER
    // ========================================================

    const user =
      await getCurrentUser(
        userId
      )

    if (!user) {
      return fail(
        res,
        'Data user tidak ditemukan',
        404
      )
    }

    // ========================================================
    // BODY
    // ========================================================

    const raw =
      (
        req.body?.mustahik ||
        req.body ||
        {}
      ) as Record<
        string,
        unknown
      >

    // ========================================================
    // VALIDASI NIK
    // ========================================================

    const nik =
      String(
        raw.nik || ''
      ).trim()

    if (!nik) {
      return fail(
        res,
        'NIK wajib diisi',
        422
      )
    }

    if (
      !/^\d{16}$/.test(
        nik
      )
    ) {
      return fail(
        res,
        'NIK harus terdiri dari 16 digit',
        422
      )
    }

    // ========================================================
    // VALIDASI USER NAME
    // ========================================================

    if (
      !user.name ||
      !user.name.trim()
    ) {
      return fail(
        res,
        'Nama user belum tersedia. Silakan periksa data akun.',
        422
      )
    }

    // ========================================================
    // VALIDASI NOMOR HP
    // ========================================================

    if (
      !user.phone ||
      !user.phone.trim()
    ) {
      return fail(
        res,
        'Nomor HP belum tersedia pada akun. Silakan perbarui profil.',
        422
      )
    }

    // ========================================================
    // 🔒 SATU USER = SATU PENGAJUAN
    // ========================================================

    const existingPengajuan =
      await prisma.pengajuan.findFirst({
        where: {
          userId,
        },

        orderBy: {
          createdAt: 'desc',
        },
      })

    if (
      existingPengajuan
    ) {
      return fail(
        res,
        'Anda sudah memiliki pengajuan. Satu user hanya dapat melakukan satu pengajuan.',
        409
      )
    }

    // ========================================================
    // CEK NIK
    // ========================================================

    const existingNik =
      await prisma.mustahik.findUnique({
        where: {
          nik,
        },
      })

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
    // DATA MUSTAHIK
    // ========================================================

    const mustahikData =
      createMustahikData(
        raw,
        {
          name:
            user.name,
          phone:
            user.phone,
        }
      )

    // ========================================================
    // TRANSACTION
    // ========================================================

    const pengajuan =
      await prisma.$transaction(
        async (
          tx
        ) => {

          // ==================================================
          // CREATE MUSTAHIK
          // ==================================================

          const mustahik =
            await tx.mustahik.create({
              data: {
                ...mustahikData,

                user: {
                  connect: {
                    id:
                      userId,
                  },
                },
              },
            })

          // ==================================================
          // CREATE PENGAJUAN
          // ==================================================

          const created =
            await tx.pengajuan.create({
              data: {
                userId,

                mustahikId:
                  mustahik.id,

                status:
                  PengajuanStatus.DRAFT,
              },

              include:
                pengajuanInclude,
            })

          // ==================================================
          // AUDIT LOG
          // ==================================================

          await tx.auditLog.create({
            data: {
              userId,

              action:
                'CREATE_PENGAJUAN',

              entity:
                'Pengajuan',

              entityId:
                created.id,

              metadata: {
                status:
                  PengajuanStatus.DRAFT,

                mustahikId:
                  mustahik.id,
              },
            },
          })

          return created
        }
      )

    // ========================================================
    // RESPONSE
    // ========================================================

    return success(
      res,
      'Pengajuan berhasil dibuat',
      {
        pengajuan,
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
      return fail(
        res,
        'Data sudah digunakan. Periksa NIK atau pengajuan Anda.',
        409
      )
    }

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
//
// GET /api/pengajuan/me
//
// Mengambil semua pengajuan user.
//
// Saat ini sistem hanya mengizinkan satu,
// tetapi response tetap berupa array supaya kompatibel
// dengan frontend yang sekarang.
// ============================================================

export async function getMyPengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const pengajuan =
      await prisma.pengajuan.findMany({
        where: {
          userId,
        },

        include:
          pengajuanInclude,

        orderBy: {
          createdAt:
            'desc',
        },
      })

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

    return fail(
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
// User hanya dapat melihat pengajuannya sendiri.
// ============================================================

export async function getPengajuanById(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    if (!id) {
      return fail(
        res,
        'ID pengajuan wajib diisi',
        422
      )
    }

    const pengajuan =
      await prisma.pengajuan.findUnique({
        where: {
          id,
        },

        include:
          pengajuanInclude,
      })

    if (
      !pengajuan
    ) {
      return fail(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    // ========================================================
    // CEK KEPEMILIKAN
    // ========================================================

    if (
      pengajuan.userId !==
      userId
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
//
// Nama function mengikuti controller terbaru kamu:
//
// updateMustahikData
//
// Route yang dipakai project kamu:
// PATCH /api/pengajuan/mustahik
//
// atau jika route menggunakan :id,
// fungsi ini juga mengambil req.params.id.
// ============================================================
//
// PENTING:
//
// Yang boleh diubah user:
// - NIK
// - tempat lahir
// - tanggal lahir
// - jenis kelamin
// - status pernikahan
// - alamat
// - kelurahan
// - kecamatan
// - kota
// - provinsi
//
// Yang TIDAK boleh diubah:
// - namaLengkap
// - noHp
// - userId
// - status
// - tanggal verifikasi
// - hasil TOPSIS
// ============================================================

export async function updateMustahikData(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    // ========================================================
    // AMBIL USER
    // ========================================================

    const user =
      await getCurrentUser(
        userId
      )

    if (!user) {
      return fail(
        res,
        'Data user tidak ditemukan',
        404
      )
    }

    // ========================================================
    // CARI PENGAJUAN USER
    // ========================================================

    const pengajuan =
      await prisma.pengajuan.findFirst({
        where: {
          userId,
        },

        orderBy: {
          createdAt: 'desc',
        },
      })

    if (
      !pengajuan
    ) {
      return fail(
        res,
        'Pengajuan belum ditemukan',
        404
      )
    }

    // ========================================================
    // STATUS YANG TIDAK BOLEH DIUBAH LAGI
    // ========================================================
    //
    // Setelah kuesioner dikirim,
    // data pribadi juga sebaiknya tidak diubah
    // sembarangan karena sudah masuk proses verifikasi.
    //
    // ========================================================

    const lockedStatuses = [
      PengajuanStatus.MENUNGGU_VERIFIKASI,

      PengajuanStatus.SEDANG_DIVERIFIKASI,

      PengajuanStatus.LOLOS_VERIFIKASI,

      PengajuanStatus.DIPROSES_TOPSIS,

      PengajuanStatus.LAYAK_DIDANAI,

      PengajuanStatus.TIDAK_DIDANAI,

      PengajuanStatus.DITOLAK,
    ]

    if (
      lockedStatuses.includes(
        pengajuan.status
      )
    ) {
      return fail(
        res,
        'Data tidak dapat diubah karena pengajuan sudah diproses.',
        409
      )
    }

    // ========================================================
    // BODY
    // ========================================================

    const raw =
      (
        req.body?.mustahik ||
        req.body ||
        {}
      ) as Record<
        string,
        unknown
      >

    // ========================================================
    // VALIDASI NIK
    // ========================================================

    const nik =
      String(
        raw.nik || ''
      ).trim()

    if (!nik) {
      return fail(
        res,
        'NIK wajib diisi',
        422
      )
    }

    if (
      !/^\d{16}$/.test(
        nik
      )
    ) {
      return fail(
        res,
        'NIK harus terdiri dari 16 digit',
        422
      )
    }

    // ========================================================
    // CEK NIK USER LAIN
    // ========================================================

    const existingNik =
      await prisma.mustahik.findUnique({
        where: {
          nik,
        },
      })

    if (
      existingNik &&
      existingNik.id !==
        pengajuan.mustahikId
    ) {
      return fail(
        res,
        'NIK sudah digunakan oleh user lain',
        409
      )
    }

    // ========================================================
    // DATA YANG BOLEH DIUPDATE
    // ========================================================
    //
    // Jangan menggunakan spread req.body secara langsung.
    // Supaya user tidak bisa mengirim:
    //
    // {
    //   status: "LOLOS_VERIFIKASI"
    // }
    //
    // atau:
    //
    // {
    //   namaLengkap: "Nama Palsu"
    // }
    //
    // ========================================================

    const updateData = {
      nik,

      /*
       * 🔒 Nama selalu dari User.
       */
      namaLengkap:
        user.name,

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

      /*
       * 🔒 Nomor HP selalu dari User.
       */
      noHp:
        user.phone,

      statusPernikahan:
        stringOrNull(
          raw.statusPernikahan
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
    }

    // ========================================================
    // UPDATE
    // ========================================================

    const updated =
      await prisma.$transaction(
        async (
          tx
        ) => {

          // --------------------------------------------------
          // Update Mustahik
          // --------------------------------------------------

          await tx.mustahik.update({
            where: {
              id:
                pengajuan.mustahikId,
            },

            data:
              updateData,
          })

          // --------------------------------------------------
          // Ambil pengajuan terbaru
          // --------------------------------------------------

          const updatedPengajuan =
            await tx.pengajuan.findUnique({
              where: {
                id:
                  pengajuan.id,
              },

              include:
                pengajuanInclude,
            })

          // --------------------------------------------------
          // Audit Log
          // --------------------------------------------------

          await tx.auditLog.create({
            data: {
              userId,

              action:
                'UPDATE_MUSTAHIK_DATA',

              entity:
                'Mustahik',

              entityId:
                pengajuan.mustahikId,

              metadata: {
                pengajuanId:
                  pengajuan.id,

                status:
                  pengajuan.status,
              },
            },
          })

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
      'UPDATE MUSTAHIK ERROR:',
      error
    )

    if (
      error?.code ===
      'P2002'
    ) {
      return fail(
        res,
        'NIK sudah digunakan oleh user lain',
        409
      )
    }

    return fail(
      res,
      'Gagal memperbarui data mustahik',
      500
    )
  }
}

// ============================================================
// DELETE / CANCEL PENGAJUAN
// ============================================================
//
// Hanya DRAFT yang boleh dibatalkan.
//
// Setelah kuesioner dikirim,
// pengajuan tidak boleh dihapus.
// ============================================================

export async function deletePengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    if (!id) {
      return fail(
        res,
        'ID pengajuan wajib diisi',
        422
      )
    }

    const pengajuan =
      await prisma.pengajuan.findUnique({
        where: {
          id,
        },
      })

    if (
      !pengajuan
    ) {
      return fail(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    if (
      pengajuan.userId !==
      userId
    ) {
      return fail(
        res,
        'Anda tidak memiliki akses ke pengajuan ini',
        403
      )
    }

    // ========================================================
    // HANYA DRAFT
    // ========================================================

    if (
      pengajuan.status !==
      PengajuanStatus.DRAFT
    ) {
      return fail(
        res,
        'Pengajuan yang sudah diproses tidak dapat dihapus.',
        409
      )
    }

    await prisma.$transaction(
      async (
        tx
      ) => {

        await tx.pengajuan.delete({
          where: {
            id,
          },
        })

        await tx.auditLog.create({
          data: {
            userId,

            action:
              'DELETE_PENGAJUAN',

            entity:
              'Pengajuan',

            entityId:
              id,

            metadata: {
              status:
                PengajuanStatus.DRAFT,
            },
          },
        })
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

    return fail(
      res,
      'Gagal membatalkan pengajuan',
      500
    )
  }
}