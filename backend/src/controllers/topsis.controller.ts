import type { Request, Response } from 'express'
import {
  PengajuanStatus,
} from '@prisma/client'

import { prisma } from '../config/prisma'
import {
  fail,
  success,
} from '../utils/api-response'

import {
  calculateTopsis,
} from '../services/topsis/topsis.service'

export async function processTopsis(
  req: Request,
  res: Response
) {
  try {
    const threshold =
      Number(
        req.body.layakThreshold
      )

    if (
      !Number.isFinite(
        threshold
      ) ||
      threshold < 0 ||
      threshold > 1
    ) {
      return fail(
        res,
        'layakThreshold harus berupa angka antara 0 sampai 1.',
        422
      )
    }

    // ==========================================================
    // 1. AMBIL KRITERIA AKTIF
    // ==========================================================

    const criteria =
      await prisma.kriteria.findMany({
        where: {
          aktif: true,
        },

        orderBy: {
          kode: 'asc',
        },

        include: {
          subKriteria: true,
        },
      })

    if (
      criteria.length === 0
    ) {
      return fail(
        res,
        'Belum ada kriteria aktif.',
        422
      )
    }

    // ==========================================================
    // 2. AMBIL SEMUA PENGAJUAN YANG SUDAH SIAP DINILAI
    //
    // Kita TIDAK lagi hanya mengambil:
    // DIPROSES_TOPSIS
    //
    // Karena setelah hasil TOPSIS sebelumnya tersimpan,
    // status pengajuan berubah menjadi:
    //
    // LAYAK_DIDANAI
    // atau
    // TIDAK_DIDANAI
    //
    // Kalau hanya menggunakan DIPROSES_TOPSIS,
    // peserta yang sudah pernah dihitung akan hilang
    // dari matriks TOPSIS berikutnya.
    // ==========================================================

    const eligibleStatuses = [
      PengajuanStatus.LOLOS_VERIFIKASI,
      PengajuanStatus.DIPROSES_TOPSIS,
      PengajuanStatus.LAYAK_DIDANAI,
      PengajuanStatus.TIDAK_DIDANAI,
    ]

    const pengajuan =
      await prisma.pengajuan.findMany({
        where: {
          status: {
            in: eligibleStatuses,
          },
        },

        include: {
          mustahik: true,

          jawaban: {
            include: {
              kriteria: true,
              subKriteria: true,
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      })

    // ==========================================================
    // 3. FILTER PENGAJUAN DENGAN KUESIONER LENGKAP
    // ==========================================================

    const ready =
      pengajuan.filter(
        (item) =>
          criteria.every(
            (criterion) =>
              item.jawaban.some(
                (answer) =>
                  answer.kriteriaId ===
                  criterion.id
              )
          )
      )

    if (
      ready.length < 2
    ) {
      return fail(
        res,
        'Minimal dua pengajuan dengan jawaban kuesioner lengkap diperlukan untuk menghitung TOPSIS.',
        422
      )
    }

    // ==========================================================
    // 4. BUAT MATRIKS X
    // ==========================================================

    const alternatives =
      ready.map(
        (item) => ({
          pengajuanId:
            item.id,

          values:
            criteria.map(
              (criterion) => {
                const answer =
                  item.jawaban.find(
                    (itemAnswer) =>
                      itemAnswer.kriteriaId ===
                      criterion.id
                  )

                return Number(
                  answer?.nilai ?? 0
                )
              }
            ),
        })
      )

    // Pastikan tidak ada nilai 0 yang tidak disengaja.
    const invalidAlternative =
      alternatives.find(
        (alternative) =>
          alternative.values.length !==
            criteria.length ||
          alternative.values.some(
            (value) =>
              !Number.isFinite(
                value
              )
          )
      )

    if (
      invalidAlternative
    ) {
      return fail(
        res,
        'Terdapat data kuesioner yang tidak valid.',
        422
      )
    }

    // ==========================================================
    // 5. HITUNG TOPSIS
    // ==========================================================

    const results =
      calculateTopsis(
        alternatives,

        criteria.map(
          (criterion) =>
            Number(
              criterion.bobot
            )
        ),

        criteria.map(
          (criterion) =>
            criterion.tipe
        )
      )

    // ==========================================================
    // 6. SIMPAN HASIL
    //
    // Karena kita ingin satu ranking yang konsisten,
    // hasil TOPSIS lama untuk peserta yang sedang dihitung
    // dihapus terlebih dahulu.
    // ==========================================================

    const persisted =
      await prisma.$transaction(
        async (tx) => {
          const pengajuanIds =
            ready.map(
              (item) =>
                item.id
            )

          // Hapus detail TOPSIS melalui parent result.
          await tx.topsisResult.deleteMany(
            {
              where: {
                pengajuanId: {
                  in: pengajuanIds,
                },
              },
            }
          )

          const output: any[] =
            []

          for (
            const result of results
          ) {
            const status =
              result.preference >=
              threshold
                ? PengajuanStatus.LAYAK_DIDANAI
                : PengajuanStatus.TIDAK_DIDANAI

            const item =
              await tx.topsisResult.create(
                {
                  data: {
                    pengajuanId:
                      result.pengajuanId,

                    nilaiPreferensi:
                      result.preference,

                    ranking:
                      result.ranking,

                    status,

                    details: {
                      create:
                        criteria.map(
                          (
                            criterion,
                            index
                          ) => ({
                            kriteriaId:
                              criterion.id,

                            nilaiAwal:
                              result
                                .values[
                                index
                              ],

                            nilaiNormalisasi:
                              result
                                .normalized[
                                index
                              ],

                            nilaiTerbobot:
                              result
                                .weighted[
                                index
                              ],
                          })
                        ),
                    },
                  },

                  include: {
                    pengajuan: {
                      include: {
                        mustahik: true,
                      },
                    },

                    details: {
                      include: {
                        kriteria: true,
                      },
                    },
                  },
                }
              )

            await tx.pengajuan.update(
              {
                where: {
                  id:
                    result.pengajuanId,
                },

                data: {
                  status,
                },
              }
            )

            output.push(
              item
            )
          }

          return output
        }
      )

    // ==========================================================
    // 7. RESPONSE
    // ==========================================================

    return success(
      res,
      'Proses TOPSIS berhasil.',
      {
        threshold,

        jumlahAlternatif:
          ready.length,

        results:
          persisted,
      },
      201
    )
  } catch (error) {
    console.error(
      'PROCESS TOPSIS ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menjalankan proses TOPSIS.',
      500
    )
  }
}

// ============================================================
// GET SEMUA HASIL TOPSIS TERBARU
// ============================================================

export async function getTopsisResults(
  _req: Request,
  res: Response
) {
  try {
    const results =
      await prisma.topsisResult.findMany(
        {
          include: {
            pengajuan: {
              include: {
                mustahik: true,
              },
            },

            details: {
              include: {
                kriteria: true,
              },
            },
          },

          orderBy: [
            {
              tanggalProses:
                'desc',
            },

            {
              ranking: 'asc',
            },
          ],
        }
      )

    return success(
      res,
      'Hasil TOPSIS berhasil diambil.',
      {
        results,
      }
    )
  } catch (error) {
    console.error(
      'GET TOPSIS RESULTS ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil hasil TOPSIS.',
      500
    )
  }
}

// ============================================================
// GET DETAIL TOPSIS
// ============================================================

export async function getTopsisResult(
  req: Request,
  res: Response
) {
  try {
    const result =
      await prisma.topsisResult.findUnique(
        {
          where: {
            id: req.params.id,
          },

          include: {
            pengajuan: {
              include: {
                mustahik: true,
              },
            },

            details: {
              include: {
                kriteria: true,
              },
            },
          },
        }
      )

    if (!result) {
      return fail(
        res,
        'Hasil TOPSIS tidak ditemukan.',
        404
      )
    }

    return success(
      res,
      'Detail hasil TOPSIS berhasil diambil.',
      {
        result,
      }
    )
  } catch (error) {
    console.error(
      'GET TOPSIS RESULT ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil detail hasil TOPSIS.',
      500
    )
  }
}