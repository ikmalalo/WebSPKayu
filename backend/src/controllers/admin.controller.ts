import type {
  Request,
  Response,
} from 'express'

import { prisma } from '../config/prisma'

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const [
      totalMustahik,
      pengajuanBaru,
      menungguVerifikasi,
      sudahDiverifikasi,
      layakDidanai,
      tidakDidanai,
      pengajuanPerBulan,
    ] = await Promise.all([
      // ==========================================
      // TOTAL MUSTAHIK
      // ==========================================
      prisma.mustahik.count(),

      // ==========================================
      // PENGAJUAN BARU
      // DRAFT + MENUNGGU VERIFIKASI
      // ==========================================
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

      // ==========================================
      // MENUNGGU VERIFIKASI
      // ==========================================
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

      // ==========================================
      // SUDAH DIVERIFIKASI
      // ==========================================
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

      // ==========================================
      // LAYAK DIDANAI
      // ==========================================
      prisma.pengajuan.count({
        where: {
          status: 'LAYAK_DIDANAI',
        },
      }),

      // ==========================================
      // TIDAK DIDANAI
      // ==========================================
      prisma.pengajuan.count({
        where: {
          status: 'TIDAK_DIDANAI',
        },
      }),

      // ==========================================
      // DATA UNTUK CHART
      // ==========================================
      prisma.pengajuan.findMany({
        select: {
          tanggalPengajuan: true,
          status: true,
        },
        orderBy: {
          tanggalPengajuan: 'asc',
        },
      }),
    ])

    // ==========================================
    // NAMA BULAN
    // ==========================================
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

    // ==========================================
    // INITIAL CHART DATA
    // ==========================================
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

    // ==========================================
    // PROSES DATA PENGAJUAN UNTUK CHART
    // ==========================================
    for (
      const pengajuan of pengajuanPerBulan
    ) {
      const tanggal =
        new Date(
          pengajuan.tanggalPengajuan
        )

      // Hindari error tanggal invalid
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

      // Semua pengajuan
      current.pengajuan += 1

      // Pengajuan lolos
      if (
        pengajuan.status ===
        'LOLOS_VERIFIKASI'
      ) {
        current.lolos += 1
      }

      // Pengajuan ditolak
      if (
        pengajuan.status ===
        'DITOLAK'
      ) {
        current.ditolak += 1
      }
    }

    // ==========================================
    // BENTUK DATA CHART
    // ==========================================
    const chart =
      namaBulan.map(
        (bulan) => {
          const current =
            chartMap.get(
              bulan
            )

          return {
            bulan,

            pengajuan:
              current?.pengajuan ??
              0,

            lolos:
              current?.lolos ??
              0,

            ditolak:
              current?.ditolak ??
              0,
          }
        }
      )

    // ==========================================
    // DISTRIBUSI STATUS
    // ==========================================
    const statusDistribution = [
      {
        name: 'Layak Didanai',
        value: layakDidanai,
      },

      {
        name: 'Tidak Didanai',
        value: tidakDidanai,
      },

      {
        name: 'Menunggu Proses',
        value:
          menungguVerifikasi,
      },
    ]

    // ==========================================
    // RESPONSE
    // ==========================================
    return res.status(200).json({
      success: true,

      data: {
        totalMustahik,

        pengajuanBaru,

        menungguVerifikasi,

        sudahDiverifikasi,

        layakDidanai,

        tidakDidanai,

        chart,

        statusDistribution,
      },
    })
  } catch (error) {
    console.error(
      'GET ADMIN DASHBOARD ERROR:',
      error
    )

    return res.status(500).json({
      success: false,

      message:
        'Gagal mengambil data dashboard admin.',
    })
  }
}