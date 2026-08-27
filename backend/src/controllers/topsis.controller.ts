import type {
  Request,
  Response,
} from 'express'

import {
  PengajuanStatus,
  IndikatorTipe,
  Prisma,
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
// HELPER
// ============================================================

function decimal(
  value: number
) {
  return new Prisma.Decimal(
    value
  )
}


function toNumber(
  value:
    | number
    | string
    | Prisma.Decimal
) {
  return Number(value)
}


// ============================================================
// GET ADMIN ID
// ============================================================

function getAdminId(
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
// TYPES
// ============================================================

type Alternative = {
  pengajuanId: string

  indikator: {
    indikatorId: string
    nilai: number
  }[]
}


type IndicatorMeta = {
  id: string
  kriteriaId: string
  kode: string
  nama: string
  tipe: IndikatorTipe
  bobot: number
}


// ============================================================
// PROCESS TOPSIS
// ============================================================
//
// TOPSIS dijalankan menggunakan 15 indikator.
//
// Bobot indikator:
//
// bobot kriteria
// -------------------------
// jumlah indikator aktif
//
// Contoh:
//
// C1 = 0.12
// indikator = 3
//
// setiap indikator = 0.04
// ============================================================

export async function processTopsis(
  req: Request,
  res: Response
) {
  try {
    const adminId =
      getAdminId(req)

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
              urutan:
                'asc',
            },
          },
        },

        orderBy: {
          urutan:
            'asc',
        },
      })

    if (
      kriteria.length === 0
    ) {
      return fail(
        res,
        'Data kriteria tidak ditemukan',
        422
      )
    }

    const indikatorMeta:
      IndicatorMeta[] = []

    for (
      const item of kriteria
    ) {
      const jumlahIndikator =
        item.indikator.length

      if (
        jumlahIndikator === 0
      ) {
        continue
      }

      const bobotKriteria =
        toNumber(
          item.bobot
        )

      const bobotIndikator =
        bobotKriteria /
        jumlahIndikator

      for (
        const indikator of
        item.indikator
      ) {
        indikatorMeta.push({
          id:
            indikator.id,

          kriteriaId:
            item.id,

          kode:
            indikator.kode,

          nama:
            indikator.nama,

          tipe:
            indikator.tipe,

          bobot:
            bobotIndikator,
        })
      }
    }

    if (
      indikatorMeta.length === 0
    ) {
      return fail(
        res,
        'Indikator aktif tidak ditemukan',
        422
      )
    }

    const pengajuan =
      await prisma.pengajuan.findMany({
        where: {
          status: {
            in: [
              PengajuanStatus.LOLOS_VERIFIKASI,
              PengajuanStatus.DIPROSES_TOPSIS,
              PengajuanStatus.LAYAK_DIDANAI,
              PengajuanStatus.TIDAK_DIDANAI,
            ],
          },
        },

        include: {
          mustahik: true,

          jawaban: {
            include: {
              indikator: true,
            },
          },
        },

        orderBy: {
          createdAt:
            'asc',
        },
      })

    if (
      pengajuan.length === 0
    ) {
      return fail(
        res,
        'Tidak ada pengajuan yang lolos verifikasi untuk diproses',
        422
      )
    }

    const alternatives:
      Alternative[] =
      pengajuan.map(
        (
          item
        ) => {
          const jawabanMap =
            new Map(
              item.jawaban.map(
                (
                  jawaban
                ) => [
                  jawaban.indikatorId,
                  toNumber(
                    jawaban.nilai
                  ),
                ]
              )
            )

          return {
            pengajuanId:
              item.id,

            indikator:
              indikatorMeta.map(
                (
                  indikator
                ) => ({
                  indikatorId:
                    indikator.id,

                  nilai:
                    jawabanMap.get(
                      indikator.id
                    ) ?? 0,
                })
              ),
          }
        }
      )

    const incomplete =
      alternatives.find(
        (
          alternative
        ) =>
          alternative.indikator.some(
            (
              item
            ) =>
              item.nilai === 0
          )
      )

    if (
      incomplete
    ) {
      return fail(
        res,
        'Masih terdapat pengajuan dengan jawaban kuesioner yang belum lengkap',
        422
      )
    }

    // ========================================================
    // X MATRIX
    // ========================================================

    const matrix =
      alternatives.map(
        (
          alternative
        ) =>
          alternative.indikator.map(
            (
              item
            ) =>
              item.nilai
          )
      )

    // ========================================================
    // PEMBAGI NORMALISASI
    // ========================================================

    const divisors =
      indikatorMeta.map(
        (
          _,
          columnIndex
        ) => {
          const total =
            matrix.reduce(
              (
                sum,
                row
              ) =>
                sum +
                Math.pow(
                  row[
                    columnIndex
                  ],
                  2
                ),

              0
            )

          return Math.sqrt(
            total
          )
        }
      )

    // ========================================================
    // NORMALISASI
    // ========================================================

    const normalizedMatrix =
      matrix.map(
        (
          row
        ) =>
          row.map(
            (
              value,
              columnIndex
            ) => {
              const divisor =
                divisors[
                  columnIndex
                ]

              if (
                divisor === 0
              ) {
                return 0
              }

              return (
                value /
                divisor
              )
            }
          )
      )

    // ========================================================
    // NORMALISASI TERBOBOT
    // ========================================================

    const weightedMatrix =
      normalizedMatrix.map(
        (
          row
        ) =>
          row.map(
            (
              value,
              columnIndex
            ) =>
              value *
              indikatorMeta[
                columnIndex
              ].bobot
          )
      )

    // ========================================================
    // SOLUSI IDEAL POSITIF DAN NEGATIF
    // ========================================================

    const idealPositive =
      indikatorMeta.map(
        (
          indikator,
          columnIndex
        ) => {
          const values =
            weightedMatrix.map(
              (
                row
              ) =>
                row[
                  columnIndex
                ]
            )

          if (
            indikator.tipe ===
            IndikatorTipe.NEGATIF
          ) {
            return Math.min(
              ...values
            )
          }

          return Math.max(
            ...values
          )
        }
      )

    const idealNegative =
      indikatorMeta.map(
        (
          indikator,
          columnIndex
        ) => {
          const values =
            weightedMatrix.map(
              (
                row
              ) =>
                row[
                  columnIndex
                ]
            )

          if (
            indikator.tipe ===
            IndikatorTipe.NEGATIF
          ) {
            return Math.max(
              ...values
            )
          }

          return Math.min(
            ...values
          )
        }
      )

    // ========================================================
    // JARAK IDEAL
    // ========================================================

    const distancePositive =
      weightedMatrix.map(
        (
          row
        ) =>
          Math.sqrt(
            row.reduce(
              (
                sum,
                value,
                columnIndex
              ) =>
                sum +
                Math.pow(
                  value -
                    idealPositive[
                      columnIndex
                    ],
                  2
                ),

              0
            )
          )
      )

    const distanceNegative =
      weightedMatrix.map(
        (
          row
        ) =>
          Math.sqrt(
            row.reduce(
              (
                sum,
                value,
                columnIndex
              ) =>
                sum +
                Math.pow(
                  value -
                    idealNegative[
                      columnIndex
                    ],
                  2
                ),

              0
            )
          )
      )

    // ========================================================
    // NILAI PREFERENSI
    // ========================================================

    const preferences =
      alternatives.map(
        (
          alternative,
          index
        ) => {
          const positive =
            distancePositive[
              index
            ]

          const negative =
            distanceNegative[
              index
            ]

          const denominator =
            positive +
            negative

          const nilaiPreferensi =
            denominator === 0
              ? 0.5
              : negative /
                denominator

          return {
            pengajuanId:
              alternative.pengajuanId,

            nilaiPreferensi,
            positive,
            negative,
            index,
          }
        }
      )

    // ========================================================
    // RANKING
    // ========================================================

    const ranked =
      [
        ...preferences,
      ]
        .sort(
          (
            a,
            b
          ) =>
            b.nilaiPreferensi -
            a.nilaiPreferensi
        )
        .map(
          (
            item,
            index
          ) => ({
            ...item,

            ranking:
              index + 1,
          })
        )

    // ========================================================
    // TENTUKAN KELAYAKAN
    // ========================================================
    //
    // Sementara menggunakan nilai preferensi >= 0.5.
    //
    // Jika client memberikan ketentuan kelayakan berbeda,
    // bagian ini bisa disesuaikan.
    // ========================================================

    await prisma.$transaction(
      async (
        tx
      ) => {
        const pengajuanIds =
          alternatives.map(
            (
              item
            ) =>
              item.pengajuanId
          )

        // Hapus hasil lama supaya tidak duplikat
        const oldResults =
          await tx.topsisResult.findMany({
            where: {
              pengajuanId: {
                in:
                  pengajuanIds,
              },
            },

            select: {
              id: true,
            },
          })

        const oldResultIds =
          oldResults.map(
            (
              item
            ) =>
              item.id
          )

        if (
          oldResultIds.length >
          0
        ) {
          await tx.topsisDetail.deleteMany({
            where: {
              topsisResultId: {
                in:
                  oldResultIds,
              },
            },
          })

          await tx.topsisResult.deleteMany({
            where: {
              id: {
                in:
                  oldResultIds,
              },
            },
          })
        }

        // Simpan hasil baru
        for (
          const result of ranked
        ) {
          const alternativeIndex =
            result.index

          const finalStatus =
            result.nilaiPreferensi >=
            0.5
              ? PengajuanStatus.LAYAK_DIDANAI
              : PengajuanStatus.TIDAK_DIDANAI

          const created =
            await tx.topsisResult.create({
              data: {
                pengajuanId:
                  result.pengajuanId,

                nilaiPreferensi:
                  decimal(
                    result.nilaiPreferensi
                  ),

                ranking:
                  result.ranking,

                status:
                  finalStatus,

                tanggalProses:
                  new Date(),

                details: {
                  create:
                    indikatorMeta.map(
                      (
                        indikator,
                        columnIndex
                      ) => ({
                        indikatorId:
                          indikator.id,

                        kriteriaId:
                          indikator.kriteriaId,

                        nilaiAwal:
                          decimal(
                            matrix[
                              alternativeIndex
                            ][
                              columnIndex
                            ]
                          ),

                        nilaiNormalisasi:
                          decimal(
                            normalizedMatrix[
                              alternativeIndex
                            ][
                              columnIndex
                            ]
                          ),

                        nilaiTerbobot:
                          decimal(
                            weightedMatrix[
                              alternativeIndex
                            ][
                              columnIndex
                            ]
                          ),
                      })
                    ),
                },
              },
            })

          await tx.pengajuan.update({
            where: {
              id:
                result.pengajuanId,
            },

            data: {
              status:
                finalStatus,
            },
          })

          await tx.auditLog.create({
            data: {
              userId:
                adminId,

              action:
                'PROCESS_TOPSIS',

              entity:
                'TopsisResult',

              entityId:
                created.id,

              metadata: {
                pengajuanId:
                  result.pengajuanId,

                ranking:
                  result.ranking,

                nilaiPreferensi:
                  result.nilaiPreferensi,

                status:
                  finalStatus,
              },
            },
          })
        }
      }
    )

    const results =
      await prisma.topsisResult.findMany({
        include: {
          pengajuan: {
            include: {
              mustahik: true,
            },
          },

          details: {
            include: {
              indikator: {
                include: {
                  kriteria: true,
                },
              },
            },

            orderBy: {
              indikator: {
                urutan:
                  'asc',
              },
            },
          },
        },

        orderBy: {
          ranking:
            'asc',
        },
      })

    return success(
      res,
      'Proses TOPSIS berhasil dilakukan',
      {
        results,
        total:
          results.length,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'PROCESS TOPSIS ERROR:',
      error
    )

    return fail(
      res,
      'Gagal memproses TOPSIS',
      500
    )
  }
}


// ============================================================
// GET TOPSIS RESULTS
// ============================================================

export async function getTopsisResults(
  req: Request,
  res: Response
) {
  try {
    const results =
      await prisma.topsisResult.findMany({
        include: {
          pengajuan: {
            include: {
              mustahik: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },

          details: {
            include: {
              indikator: {
                include: {
                  kriteria: true,
                },
              },
            },

            orderBy: {
              indikator: {
                urutan:
                  'asc',
              },
            },
          },
        },

        orderBy: [
          {
            tanggalProses:
              'desc',
          },

          {
            ranking:
              'asc',
          },
        ],
      })

    return success(
      res,
      'Hasil TOPSIS berhasil diambil',
      {
        results,
        total:
          results.length,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'GET TOPSIS RESULTS ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil hasil TOPSIS',
      500
    )
  }
}


// ============================================================
// GET TOPSIS RESULT BY ID
// ============================================================

export async function getTopsisResultById(
  req: Request,
  res: Response
) {
  try {
    const {
      id,
    } = req.params

    const result =
      await prisma.topsisResult.findUnique({
        where: {
          id,
        },

        include: {
          pengajuan: {
            include: {
              mustahik: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },

              jawaban: {
                include: {
                  indikator: {
                    include: {
                      kriteria: true,
                    },
                  },
                },

                orderBy: {
                  indikator: {
                    urutan:
                      'asc',
                  },
                },
              },
            },
          },

          details: {
            include: {
              indikator: {
                include: {
                  kriteria: true,
                },
              },
            },

            orderBy: {
              indikator: {
                urutan:
                  'asc',
              },
            },
          },
        },
      })

    if (
      !result
    ) {
      return fail(
        res,
        'Hasil TOPSIS tidak ditemukan',
        404
      )
    }

    return success(
      res,
      'Detail hasil TOPSIS berhasil diambil',
      {
        result,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'GET TOPSIS RESULT DETAIL ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil detail hasil TOPSIS',
      500
    )
  }
}


// ============================================================
// GET TOPSIS RESULT BY PENGAJUAN
// ============================================================

export async function getTopsisResultByPengajuanId(
  req: Request,
  res: Response
) {
  try {
    const {
      pengajuanId,
    } = req.params

    const result =
      await prisma.topsisResult.findFirst({
        where: {
          pengajuanId,
        },

        include: {
          pengajuan: {
            include: {
              mustahik: true,
            },
          },

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
            'desc',
        },
      })

    if (
      !result
    ) {
      return fail(
        res,
        'Hasil TOPSIS belum tersedia',
        404
      )
    }

    return success(
      res,
      'Hasil TOPSIS berhasil diambil',
      {
        result,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'GET TOPSIS BY PENGAJUAN ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil hasil TOPSIS',
      500
    )
  }
}


// ============================================================
// GET TOPSIS CANDIDATES
// ============================================================

export async function getTopsisCandidates(
  req: Request,
  res: Response
) {
  try {
    const kriteria = await prisma.kriteria.findMany({
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

    const pengajuan = await prisma.pengajuan.findMany({
      where: {
        status: {
          in: [
            PengajuanStatus.LOLOS_VERIFIKASI,
            PengajuanStatus.DIPROSES_TOPSIS,
            PengajuanStatus.LAYAK_DIDANAI,
            PengajuanStatus.TIDAK_DIDANAI,
          ],
        },
      },
      include: {
        mustahik: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        jawaban: {
          include: {
            indikator: {
              include: {
                kriteria: true,
              },
            },
          },
        },
        topsisResults: {
          orderBy: {
            tanggalProses: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const candidates = pengajuan.map((p) => ({
      id: p.id,
      userId: p.userId,
      mustahikId: p.mustahikId,
      status: p.status,
      tanggalPengajuan: p.tanggalPengajuan ? p.tanggalPengajuan.toISOString() : null,
      user: p.user,
      mustahik: p.mustahik,
      jumlahJawaban: p.jawaban.length,
      jawaban: p.jawaban.map((j) => ({
        id: j.id,
        indikatorId: j.indikatorId,
        kode: j.indikator?.kode || null,
        nama: j.indikator?.nama || null,
        tipe: j.indikator?.tipe || null,
        nilai: Number(j.nilai),
      })),
      hasilTopsis: p.topsisResults[0]
        ? {
            id: p.topsisResults[0].id,
            nilaiPreferensi: Number(p.topsisResults[0].nilaiPreferensi),
            ranking: p.topsisResults[0].ranking,
            status: p.topsisResults[0].status,
            tanggalProses: p.topsisResults[0].tanggalProses.toISOString(),
          }
        : null,
    }))

    return success(
      res,
      'Data kandidat TOPSIS berhasil diambil',
      {
        criteria: kriteria,
        candidates,
        total: candidates.length,
      }
    )
  } catch (error) {
    console.error('GET TOPSIS CANDIDATES ERROR:', error)
    return fail(res, 'Gagal mengambil kandidat TOPSIS', 500)
  }
}


// ============================================================
// ALIAS
// ============================================================

export const process =
  processTopsis

export const getResults =
  getTopsisResults

export const getResultById =
  getTopsisResultById