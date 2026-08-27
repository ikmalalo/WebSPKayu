import {
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
  success,
  fail,
} from '../utils/response'

// ============================================================
// HELPER
// ============================================================

function getUserId(
  req: Request
): string | null {
  const user = (
    req as Request & {
      user?: {
        id?: string
      }
    }
  ).user

  return (
    user?.id ||
    null
  )
}


// ============================================================
// GET KUESIONER
// ============================================================
//
// Mengambil 5 kriteria dan 15 indikator aktif.
//
// Struktur:
//
// C1
//   ├── ID1
//   ├── ID2
//   └── ID3
//
// C2
//   ├── ID4
//   ├── ID5
//   └── ID6
//
// dan seterusnya.
// ============================================================

export async function getKuesioner(
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


    // ========================================================
    // AMBIL KRITERIA + INDIKATOR
    // ========================================================

    const kriteria =
      await prisma.kriteria.findMany({
        where: {
          aktif: true,
        },

        include: {
          indikator: {
            where: {
              aktif: true,
            },

            orderBy: {
              urutan: 'asc',
            },
          },
        },

        orderBy: {
          urutan: 'asc',
        },
      })


    // ========================================================
    // VALIDASI
    // ========================================================

    if (
      kriteria.length === 0
    ) {
      return fail(
        res,
        'Data kriteria belum tersedia',
        404
      )
    }


    const totalIndikator =
      kriteria.reduce(
        (
          total,
          item
        ) =>
          total +
          item.indikator.length,
        0
      )


    if (
      totalIndikator === 0
    ) {
      return fail(
        res,
        'Data indikator belum tersedia',
        404
      )
    }


    // ========================================================
    // RESPONSE
    // ========================================================

    return success(
      res,
      'Data kuesioner berhasil diambil',
      {
        kriteria,
      }
    )

  } catch (
    error
  ) {
    console.error(
      'GET KUESIONER ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil data kuesioner',
      500
    )
  }
}


// ============================================================
// SUBMIT JAWABAN KUESIONER
// ============================================================
//
// Request:
//
// {
//   pengajuanId: "...",
//   statusRumah: "...",
//   jawaban: [
//     {
//       indikatorId: "...",
//       nilai: 4
//     }
//   ]
// }
//
// Semua 15 indikator wajib dijawab.
// ============================================================

export async function submitJawabanKuesioner(
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


    // ========================================================
    // REQUEST BODY
    // ========================================================

    const {
      pengajuanId,
      jawaban,
      statusRumah,
    } =
      req.body


    // ========================================================
    // VALIDASI PENGAJUAN ID
    // ========================================================

    if (
      !pengajuanId ||
      typeof pengajuanId !==
        'string'
    ) {
      return fail(
        res,
        'ID pengajuan wajib diisi',
        422
      )
    }


    // ========================================================
    // VALIDASI STATUS RUMAH
    // ========================================================

    const allowedStatusRumah = [
      'milik_sendiri',
      'sewa',
      'menumpang',
    ]


    if (
      !statusRumah ||
      typeof statusRumah !==
        'string'
    ) {
      return fail(
        res,
        'Status rumah wajib dipilih',
        422
      )
    }


    if (
      !allowedStatusRumah.includes(
        statusRumah
      )
    ) {
      return fail(
        res,
        'Status rumah tidak valid',
        422
      )
    }


    // ========================================================
    // VALIDASI JAWABAN
    // ========================================================

    if (
      !Array.isArray(
        jawaban
      )
    ) {
      return fail(
        res,
        'Data jawaban tidak valid',
        422
      )
    }


    if (
      jawaban.length === 0
    ) {
      return fail(
        res,
        'Jawaban kuesioner wajib diisi',
        422
      )
    }


    // ========================================================
    // AMBIL PENGAJUAN
    // ========================================================

    const pengajuan =
      await prisma.pengajuan.findUnique({
        where: {
          id:
            pengajuanId,
        },

        include: {
          mustahik: true,

          jawaban: true,
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


    // ========================================================
    // CEK STATUS
    // ========================================================

    if (
      pengajuan.status !==
      PengajuanStatus.DRAFT
    ) {
      return fail(
        res,
        'Kuesioner sudah dikirim dan tidak dapat diubah kembali',
        409
      )
    }


    // ========================================================
    // CEK JAWABAN LAMA
    // ========================================================

    if (
      pengajuan.jawaban.length > 0
    ) {
      return fail(
        res,
        'Kuesioner sudah pernah dikirim',
        409
      )
    }


    // ========================================================
    // AMBIL SEMUA INDIKATOR AKTIF
    // ========================================================

    const indikatorAktif =
      await prisma.indikator.findMany({
        where: {
          aktif: true,

          kriteria: {
            aktif: true,
          },
        },

        select: {
          id: true,
          kode: true,
        },

        orderBy: {
          urutan: 'asc',
        },
      })


    if (
      indikatorAktif.length === 0
    ) {
      return fail(
        res,
        'Data indikator belum tersedia',
        500
      )
    }


    // ========================================================
    // VALIDASI JUMLAH JAWABAN
    // ========================================================

    if (
      jawaban.length !==
      indikatorAktif.length
    ) {
      return fail(
        res,
        `Semua ${indikatorAktif.length} indikator wajib dijawab`,
        422
      )
    }


    // ========================================================
    // VALIDASI FORMAT JAWABAN
    // ========================================================

    const indikatorIds =
      new Set(
        indikatorAktif.map(
          (
            indikator
          ) =>
            indikator.id
        )
      )


    const submittedIds =
      new Set<string>()


    for (
      const item of
        jawaban
    ) {

      const indikatorId =
        item?.indikatorId

      const nilai =
        Number(
          item?.nilai
        )


      // ------------------------------------------------------
      // VALIDASI ID
      // ------------------------------------------------------

      if (
        !indikatorId ||
        typeof indikatorId !==
          'string'
      ) {
        return fail(
          res,
          'ID indikator tidak valid',
          422
        )
      }


      if (
        !indikatorIds.has(
          indikatorId
        )
      ) {
        return fail(
          res,
          'Terdapat indikator yang tidak valid',
          422
        )
      }


      // ------------------------------------------------------
      // CEK DUPLIKAT
      // ------------------------------------------------------

      if (
        submittedIds.has(
          indikatorId
        )
      ) {
        return fail(
          res,
          'Terdapat jawaban indikator yang duplikat',
          422
        )
      }


      submittedIds.add(
        indikatorId
      )


      // ------------------------------------------------------
      // VALIDASI NILAI
      // ------------------------------------------------------

      if (
        !Number.isFinite(
          nilai
        )
      ) {
        return fail(
          res,
          'Nilai jawaban tidak valid',
          422
        )
      }


      if (
        nilai < 1 ||
        nilai > 5
      ) {
        return fail(
          res,
          'Nilai jawaban harus antara 1 sampai 5',
          422
        )
      }
    }


    // ========================================================
    // PASTIKAN SEMUA INDIKATOR ADA
    // ========================================================

    if (
      submittedIds.size !==
      indikatorAktif.length
    ) {
      return fail(
        res,
        'Masih ada indikator yang belum dijawab',
        422
      )
    }


    // ========================================================
    // SIMPAN TRANSAKSI
    // ========================================================

    const updatedPengajuan =
      await prisma.$transaction(
        async (
          tx
        ) => {

          // --------------------------------------------------
          // UPDATE STATUS RUMAH
          // --------------------------------------------------

          await tx.mustahik.update({
            where: {
              id:
                pengajuan.mustahikId,
            },

            data: {
              statusRumah,
            },
          })


          // --------------------------------------------------
          // SIMPAN JAWABAN
          // --------------------------------------------------

          await tx.jawabanKuesioner.createMany({
            data:
              jawaban.map(
                (
                  item: {
                    indikatorId: string
                    nilai: number
                  }
                ) => ({
                  pengajuanId,

                  indikatorId:
                    item.indikatorId,

                  nilai:
                    new Prisma.Decimal(
                      item.nilai
                    ),
                })
              ),
          })


          // --------------------------------------------------
          // UPDATE STATUS PENGAJUAN
          // --------------------------------------------------

          const updated =
            await tx.pengajuan.update({
              where: {
                id:
                  pengajuanId,
              },

              data: {
                status:
                  PengajuanStatus.MENUNGGU_VERIFIKASI,
              },

              include: {
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
                    createdAt: 'asc',
                  },
                },
              },
            })


          // --------------------------------------------------
          // AUDIT LOG
          // --------------------------------------------------

          await tx.auditLog.create({
            data: {
              userId,

              action:
                'SUBMIT_KUESIONER',

              entity:
                'Pengajuan',

              entityId:
                pengajuanId,

              metadata: {
                totalJawaban:
                  jawaban.length,

                statusRumah,

                statusSebelum:
                  PengajuanStatus.DRAFT,

                statusSesudah:
                  PengajuanStatus.MENUNGGU_VERIFIKASI,
              },
            },
          })


          return updated
        }
      )


    // ========================================================
    // RESPONSE
    // ========================================================

    return success(
      res,
      'Jawaban kuesioner berhasil dikirim',
      {
        pengajuan:
          updatedPengajuan,
      }
    )

  } catch (
    error: any
  ) {

    console.error(
      'SUBMIT JAWABAN KUESIONER ERROR:',
      error
    )


    // ========================================================
    // PRISMA ERROR
    // ========================================================

    if (
      error?.code ===
      'P2002'
    ) {
      return fail(
        res,
        'Jawaban kuesioner sudah pernah disimpan',
        409
      )
    }


    if (
      error?.code ===
      'P2003'
    ) {
      return fail(
        res,
        'Relasi data jawaban tidak valid',
        422
      )
    }


    return fail(
      res,
      'Gagal menyimpan jawaban kuesioner',
      500
    )
  }
}