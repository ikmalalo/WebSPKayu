import type {
  Request,
  Response,
} from 'express'

import {
  prisma,
} from '../config/prisma'

import {
  fail,
  success,
} from '../utils/api-response'

const VERIFIKASI_STATUS = [
  'LOLOS',
  'PERLU_PERBAIKAN',
  'DITOLAK',
] as const

const PENGAJUAN_STATUS = [
  'DRAFT',
  'MENUNGGU_VERIFIKASI',
  'SEDANG_DIVERIFIKASI',
  'PERLU_PERBAIKAN',
  'LOLOS_VERIFIKASI',
  'DITOLAK',
  'DIPROSES_TOPSIS',
  'LAYAK_DIDANAI',
  'TIDAK_DIDANAI',
] as const

type PengajuanStatus =
  typeof PENGAJUAN_STATUS[number]

type VerifikasiStatus =
  typeof VERIFIKASI_STATUS[number]

// ============================================================
// DASHBOARD ADMIN
// ============================================================

export async function getDashboard(
  _req: Request,
  res: Response
) {
  try {
    const [
      totalMustahik,
      pengajuanBaru,
      menungguVerifikasi,
      sudahDiverifikasi,
      layakDidanai,
      tidakDidanai,
      pengajuanPerBulan,
      pengajuanTerbaru,
    ] = await Promise.all([
      // Total mustahik
      prisma.mustahik.count(),

      // Pengajuan baru
      prisma.pengajuan.count({
        where: {
          status: {
            in: [
              'DRAFT',
              'MENUNGGU_VERIFIKASI',
            ],
          },
        },
      }),

      // Menunggu verifikasi
      prisma.pengajuan.count({
        where: {
          status: {
            in: [
              'MENUNGGU_VERIFIKASI',
              'SEDANG_DIVERIFIKASI',
            ],
          },
        },
      }),

      // Sudah diverifikasi
      prisma.pengajuan.count({
        where: {
          status: {
            in: [
              'LOLOS_VERIFIKASI',
              'PERLU_PERBAIKAN',
              'DITOLAK',
              'DIPROSES_TOPSIS',
              'LAYAK_DIDANAI',
              'TIDAK_DIDANAI',
            ],
          },
        },
      }),

      // Layak didanai
      prisma.pengajuan.count({
        where: {
          status:
            'LAYAK_DIDANAI',
        },
      }),

      // Tidak didanai
      prisma.pengajuan.count({
        where: {
          status:
            'TIDAK_DIDANAI',
        },
      }),

      // Data untuk grafik
      prisma.pengajuan.findMany({
        select: {
          tanggalPengajuan: true,
          status: true,
        },
        orderBy: {
          tanggalPengajuan:
            'asc',
        },
      }),

      // 6 pengajuan terbaru
      prisma.pengajuan.findMany({
        take: 6,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          mustahik: {
            select: {
              id: true,
              namaLengkap: true,
              nik: true,
            },
          },
        },
      }),
    ])

    const namaBulan = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ]

    const chartMap = new Map<
      string,
      {
        pengajuan: number
        lolos: number
        ditolak: number
      }
    >()

    namaBulan.forEach(
      (bulan) => {
        chartMap.set(
          bulan,
          {
            pengajuan: 0,
            lolos: 0,
            ditolak: 0,
          }
        )
      }
    )

    for (
      const item of
        pengajuanPerBulan
    ) {
      const tanggal =
        new Date(
          item.tanggalPengajuan
        )

      if (
        Number.isNaN(
          tanggal.getTime()
        )
      ) {
        continue
      }

      const bulan =
        namaBulan[
          tanggal.getMonth()
        ]

      const current =
        chartMap.get(
          bulan
        )

      if (!current) {
        continue
      }

      current.pengajuan++

      if (
        item.status ===
        'LOLOS_VERIFIKASI'
      ) {
        current.lolos++
      }

      if (
        item.status ===
        'DITOLAK'
      ) {
        current.ditolak++
      }
    }

    const chart =
      namaBulan.map(
        (bulan) => {
          const item =
            chartMap.get(
              bulan
            )

          return {
            bulan,

            pengajuan:
              item?.pengajuan ??
              0,

            lolos:
              item?.lolos ??
              0,

            ditolak:
              item?.ditolak ??
              0,
          }
        }
      )

    const statusDistribution = [
      {
        name:
          'Layak Didanai',
        value:
          layakDidanai,
      },
      {
        name:
          'Tidak Didanai',
        value:
          tidakDidanai,
      },
      {
        name:
          'Menunggu Proses',
        value:
          menungguVerifikasi,
      },
    ]

    return success(
      res,
      'Dashboard admin berhasil diambil',
      {
        totalMustahik,
        pengajuanBaru,
        menungguVerifikasi,
        sudahDiverifikasi,
        layakDidanai,
        tidakDidanai,
        chart,
        statusDistribution,
        pengajuanTerbaru,
      }
    )
  } catch (error) {
    console.error(
      'GET ADMIN DASHBOARD ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil data dashboard admin',
      500
    )
  }
}

// ============================================================
// DATA MUSTAHIK
// ============================================================

export async function listMustahik(
  req: Request,
  res: Response
) {
  try {
    const q =
      String(
        req.query.q ?? ''
      ).trim()

    const mustahik =
      await prisma.mustahik.findMany({
        where:
          q.length > 0
            ? {
                OR: [
                  {
                    namaLengkap: {
                      contains: q,
                    },
                  },
                  {
                    nik: {
                      contains: q,
                    },
                  },
                ],
              }
            : {},

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          pengajuan: {
            orderBy: {
              createdAt: 'desc',
            },

            take: 1,
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      })

    return success(
      res,
      'Data mustahik berhasil diambil',
      {
        mustahik,
      }
    )
  } catch (error) {
    console.error(
      'LIST MUSTAHIK ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil data mustahik',
      500
    )
  }
}

// ============================================================
// DETAIL MUSTAHIK
// ============================================================

export async function getMustahik(
  req: Request,
  res: Response
) {
  try {
    const mustahik =
      await prisma.mustahik.findUnique({
        where: {
          id: req.params.id,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          pengajuan: {
            orderBy: {
              createdAt: 'desc',
            },

            include: {
              jawaban: {
                include: {
                  kriteria: true,
                  subKriteria: true,
                },
              },

              verifications: {
                orderBy: {
                  createdAt:
                    'desc',
                },
              },

              topsisResults: true,
            },
          },
        },
      })

    if (!mustahik) {
      return fail(
        res,
        'Mustahik tidak ditemukan',
        404
      )
    }

    return success(
      res,
      'Detail mustahik berhasil diambil',
      {
        mustahik,
      }
    )
  } catch (error) {
    console.error(
      'GET MUSTAHIK ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil detail mustahik',
      500
    )
  }
}

// ============================================================
// UPDATE MUSTAHIK
// ============================================================

export async function updateMustahik(
  req: Request,
  res: Response
) {
  try {
    const current =
      await prisma.mustahik.findUnique({
        where: {
          id: req.params.id,
        },
      })

    if (!current) {
      return fail(
        res,
        'Mustahik tidak ditemukan',
        404
      )
    }

    const allowed = [
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

    const data: Record<
      string,
      unknown
    > = {}

    for (
      const key of allowed
    ) {
      if (
        req.body?.[key] !==
        undefined
      ) {
        data[key] =
          req.body[key]
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
        Number(
          data.penghasilan
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

    const mustahik =
      await prisma.mustahik.update({
        where: {
          id: current.id,
        },
        data,
      })

    return success(
      res,
      'Data mustahik berhasil diperbarui',
      {
        mustahik,
      }
    )
  } catch (error) {
    console.error(
      'UPDATE MUSTAHIK ERROR:',
      error
    )

    return fail(
      res,
      'Gagal memperbarui data mustahik',
      500
    )
  }
}

// ============================================================
// DELETE MUSTAHIK
// ============================================================

export async function deleteMustahik(
  req: Request,
  res: Response
) {
  try {
    const current =
      await prisma.mustahik.findUnique({
        where: {
          id: req.params.id,
        },
      })

    if (!current) {
      return fail(
        res,
        'Mustahik tidak ditemukan',
        404
      )
    }

    await prisma.mustahik.delete({
      where: {
        id: current.id,
      },
    })

    return success(
      res,
      'Mustahik berhasil dihapus'
    )
  } catch (error) {
    console.error(
      'DELETE MUSTAHIK ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menghapus mustahik',
      500
    )
  }
}

// ============================================================
// LIST VERIFIKASI
// ============================================================

export async function listVerifikasi(
  req: Request,
  res: Response
) {
  try {
    const requestedStatus =
      req.query.status
        ? String(
            req.query.status
          )
        : null

    let where = {}

    if (
      requestedStatus &&
      PENGAJUAN_STATUS.includes(
        requestedStatus as PengajuanStatus
      )
    ) {
      where = {
        status:
          requestedStatus,
      }
    } else {
      where = {
        status: {
          in: [
            'MENUNGGU_VERIFIKASI',
            'SEDANG_DIVERIFIKASI',
            'PERLU_PERBAIKAN',
            'LOLOS_VERIFIKASI',
            'DITOLAK',
          ],
        },
      }
    }

    const pengajuan =
      await prisma.pengajuan.findMany({
        where,

        include: {
          mustahik: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          verifications: {
            orderBy: {
              createdAt:
                'desc',
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      })

    return success(
      res,
      'Daftar verifikasi berhasil diambil',
      {
        pengajuan,
      }
    )
  } catch (error) {
    console.error(
      'LIST VERIFIKASI ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil data verifikasi',
      500
    )
  }
}

// ============================================================
// DETAIL VERIFIKASI
// ============================================================

export async function getVerifikasi(
  req: Request,
  res: Response
) {
  try {
    const pengajuan =
      await prisma.pengajuan.findUnique({
        where: {
          id: req.params.id,
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
              kriteria: true,
              subKriteria: true,
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
                'desc',
            },
          },
        },
      })

    if (!pengajuan) {
      return fail(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    if (
      pengajuan.status ===
      'MENUNGGU_VERIFIKASI'
    ) {
      await prisma.pengajuan.update({
        where: {
          id: pengajuan.id,
        },

        data: {
          status:
            'SEDANG_DIVERIFIKASI',
        },
      })
    }

    return success(
      res,
      'Detail verifikasi berhasil diambil',
      {
        pengajuan,
      }
    )
  } catch (error) {
    console.error(
      'GET VERIFIKASI ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil detail verifikasi',
      500
    )
  }
}

// ============================================================
// SUBMIT VERIFIKASI
// ============================================================

export async function submitVerifikasi(
  req: Request,
  res: Response
) {
  try {
    const status =
      String(
        req.body?.status ?? ''
      ).toUpperCase()

    if (
      !VERIFIKASI_STATUS.includes(
        status as VerifikasiStatus
      )
    ) {
      return fail(
        res,
        'Status verifikasi tidak valid',
        422
      )
    }

    const pengajuan =
      await prisma.pengajuan.findUnique({
        where: {
          id: req.params.id,
        },
      })

    if (!pengajuan) {
      return fail(
        res,
        'Pengajuan tidak ditemukan',
        404
      )
    }

    let nextStatus:
      | 'DIPROSES_TOPSIS'
      | 'PERLU_PERBAIKAN'
      | 'DITOLAK'

    if (
      status === 'LOLOS'
    ) {
      nextStatus =
        'DIPROSES_TOPSIS'
    } else if (
      status ===
      'PERLU_PERBAIKAN'
    ) {
      nextStatus =
        'PERLU_PERBAIKAN'
    } else {
      nextStatus =
        'DITOLAK'
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const verifikasi =
            await tx.verifikasi.create({
              data: {
                pengajuanId:
                  pengajuan.id,

                adminId:
                  req.auth!
                    .userId,

                status:
                  status as any,

                catatan:
                  req.body
                    ?.catatan
                    ? String(
                        req.body
                          .catatan
                      )
                    : null,
              },
            })

          const updated =
            await tx.pengajuan.update({
              where: {
                id: pengajuan.id,
              },

              data: {
                status:
                  nextStatus,

                tanggalVerifikasi:
                  new Date(),

                catatan:
                  req.body
                    ?.catatan
                    ? String(
                        req.body
                          .catatan
                      )
                    : null,
              },
            })

          return {
            verifikasi,
            pengajuan:
              updated,
          }
        }
      )

    return success(
      res,
      'Verifikasi berhasil disimpan',
      {
        verifikasi:
          result.verifikasi,

        pengajuanStatus:
          result.pengajuan
            .status,
      }
    )
  } catch (error) {
    console.error(
      'SUBMIT VERIFIKASI ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menyimpan verifikasi',
      500
    )
  }
}