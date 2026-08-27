import type {
  Request,
  Response,
} from 'express'

import {
  PengajuanStatus,
} from '@prisma/client'

import {
  prisma,
} from '../config/prisma'


// ============================================================
// RESPONSE HELPER
// ============================================================

function success(
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200
) {
  return res.status(
    statusCode
  ).json({
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
  return res.status(
    statusCode
  ).json({
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
// HELPER
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

  const result =
    String(value).trim()

  return result || null
}


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

  const result =
    Number(value)

  if (
    Number.isNaN(result)
  ) {
    return null
  }

  return result
}


function integerOrNull(
  value: unknown
): number | null {
  const result =
    numberOrNull(value)

  if (
    result === null
  ) {
    return null
  }

  return Math.trunc(
    result
  )
}


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
// INCLUDE PENGAJUAN
// ============================================================

const pengajuanInclude = {
  mustahik: true,

  jawaban: {
    include: {
      indikator: {
        include: {
          kriteria: true,
        },
      },
    },

    orderBy: {
      createdAt:
        'asc' as const,
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
      createdAt:
        'desc' as const,
    },
  },

  topsisResults: {
    include: {
      details: {
        include: {
          indikator: {
            include: {
              kriteria: true,
            },
          },
        },
      },
    },

    orderBy: {
      tanggalProses:
        'desc' as const,
    },
  },
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
// CREATE MUSTAHIK DATA
// ============================================================

function createMustahikData(
  raw: Record<
    string,
    unknown
  >,
  user: {
    name: string
    phone: string | null
  }
) {
  return {
    nik:
      String(
        raw.nik || ''
      ).trim(),

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
      user.phone ||
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

    penghasilan:
      numberOrNull(
        raw.penghasilan
      ),

    jumlahTanggungan:
      integerOrNull(
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
// CREATE PENGAJUAN
// POST /api/pengajuan
// ============================================================

export async function createPengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (
      !userId
    ) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const user =
      await getCurrentUser(
        userId
      )

    if (
      !user
    ) {
      return fail(
        res,
        'Data user tidak ditemukan',
        404
      )
    }

    const raw =
      (
        req.body?.mustahik ||
        req.body ||
        {}
      ) as Record<
        string,
        unknown
      >

    const nik =
      String(
        raw.nik || ''
      ).trim()

    if (
      !nik
    ) {
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

    const existingPengajuan =
      await prisma.pengajuan.findFirst({
        where: {
          userId,
        },

        orderBy: {
          createdAt:
            'desc',
        },
      })

    if (
      existingPengajuan
    ) {
      return fail(
        res,
        'Anda sudah memiliki pengajuan',
        409
      )
    }

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

    const pengajuan =
      await prisma.$transaction(
        async (
          tx
        ) => {
          const mustahik =
            await tx.mustahik.create({
              data: {
                ...mustahikData,

                user: {
                  connect: {
                    id: userId,
                  },
                },
              },
            })

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
                mustahikId:
                  mustahik.id,

                status:
                  PengajuanStatus.DRAFT,
              },
            },
          })

          return created
        }
      )

    return success(
      res,
      'Pengajuan berhasil dibuat',
      {
        pengajuan,
      },
      201
    )
  } catch (
    error: any
  ) {
    console.error(
      'CREATE PENGAJUAN ERROR:',
      error
    )

    if (
      error?.code ===
      'P2002'
    ) {
      return fail(
        res,
        'Data sudah digunakan',
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
// GET /api/pengajuan/me
// ============================================================

export async function getMyPengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (
      !userId
    ) {
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
  } catch (
    error
  ) {
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
// GET /api/pengajuan/:id
// ============================================================

export async function getPengajuanById(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (
      !userId
    ) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    if (
      !id
    ) {
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
  } catch (
    error
  ) {
    console.error(
      'GET DETAIL PENGAJUAN ERROR:',
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
// UPDATE MUSTAHIK DATA
// ============================================================

export async function updateMustahikData(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (
      !userId
    ) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const pengajuan =
      await prisma.pengajuan.findFirst({
        where: {
          userId,
        },

        orderBy: {
          createdAt:
            'desc',
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

    const lockedStatuses: PengajuanStatus[] = [
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
        'Data tidak dapat diubah karena pengajuan sudah diproses',
        409
      )
    }

    const raw =
      (
        req.body?.mustahik ||
        req.body ||
        {}
      ) as Record<
        string,
        unknown
      >

    const nik =
      String(
        raw.nik || ''
      ).trim()

    if (
      !nik
    ) {
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

    const duplicateNik =
      await prisma.mustahik.findFirst({
        where: {
          nik,

          NOT: {
            id:
              pengajuan.mustahikId,
          },
        },
      })

    if (
      duplicateNik
    ) {
      return fail(
        res,
        'NIK sudah digunakan oleh user lain',
        409
      )
    }

    const updateData = {
      nik,

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

      statusPernikahan:
        stringOrNull(
          raw.statusPernikahan
        ),

      pekerjaan:
        stringOrNull(
          raw.pekerjaan
        ),

      penghasilan:
        numberOrNull(
          raw.penghasilan
        ),

      jumlahTanggungan:
        integerOrNull(
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

    const updated =
      await prisma.$transaction(
        async (
          tx
        ) => {
          await tx.mustahik.update({
            where: {
              id:
                pengajuan.mustahikId,
            },

            data:
              updateData,
          })

          const updatedPengajuan =
            await tx.pengajuan.findUnique({
              where: {
                id:
                  pengajuan.id,
              },

              include:
                pengajuanInclude,
            })

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
  } catch (
    error: any
  ) {
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
        'NIK sudah digunakan',
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
// DELETE PENGAJUAN
// ============================================================

export async function deletePengajuan(
  req: Request,
  res: Response
) {
  try {
    const userId =
      getUserId(req)

    if (
      !userId
    ) {
      return fail(
        res,
        'User belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    if (
      !id
    ) {
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
        'Anda tidak memiliki akses',
        403
      )
    }

    if (
      pengajuan.status !==
      PengajuanStatus.DRAFT
    ) {
      return fail(
        res,
        'Pengajuan yang sudah diproses tidak dapat dihapus',
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
          },
        })
      }
    )

    return success(
      res,
      'Pengajuan berhasil dibatalkan'
    )
  } catch (
    error
  ) {
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