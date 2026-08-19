import type {
  Request,
  Response,
} from 'express'

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

// ============================================================
// GET KANDIDAT TOPSIS
// ============================================================
//
// Endpoint:
//
// GET /api/admin/topsis/candidates
//
// Fungsi:
//
// Mengambil calon alternatif TOPSIS berdasarkan data:
//
// Pengajuan
//     +
// JawabanKuesioner
//
// Jadi halaman Proses TOPSIS tidak bergantung kepada
// TopsisResult.
//
// Ini penting karena sebelum tombol "Hitung TOPSIS"
// ditekan, TopsisResult memang belum ada.
//
// ============================================================

export async function getTopsisCandidates(
  _req: Request,
  res: Response
) {
  try {
    // ========================================================
    // 1. AMBIL KRITERIA AKTIF
    // ========================================================

    const criteria =
      await prisma.kriteria.findMany({
        where: {
          aktif: true,
        },

        orderBy: {
          kode: 'asc',
        },

        select: {
          id: true,
          kode: true,
          nama: true,
          bobot: true,
          tipe: true,
          deskripsi: true,
          aktif: true,
        },
      })

    if (
      criteria.length === 0
    ) {
      return success(
        res,
        'Belum ada kriteria aktif.',
        {
          criteria: [],
          candidates: [],
        }
      )
    }

    // ========================================================
    // 2. AMBIL PENGAJUAN YANG MASUK ALUR TOPSIS
    // ========================================================
    //
    // LOLOS_VERIFIKASI
    //     -> baru masuk proses TOPSIS
    //
    // DIPROSES_TOPSIS
    //     -> sedang menunggu / siap dihitung
    //
    // LAYAK_DIDANAI
    // TIDAK_DIDANAI
    //     -> sudah pernah dihitung
    //
    // Status final tetap dimasukkan agar seluruh alternatif
    // tetap konsisten jika admin melakukan perhitungan ulang.
    //
    // ========================================================

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
          mustahik: {
            select: {
              id: true,
              namaLengkap: true,
              nik: true,
            },
          },

          jawaban: {
            include: {
              kriteria: {
                select: {
                  id: true,
                  kode: true,
                  nama: true,
                },
              },

              subKriteria: {
                select: {
                  id: true,
                  nama: true,
                  nilai: true,
                  keterangan: true,
                },
              },
            },

            orderBy: {
              createdAt: 'asc',
            },
          },
        },

        orderBy: {
          createdAt: 'asc',
        },
      })

    // ========================================================
    // 3. HANYA AMBIL YANG KUESIONERNYA LENGKAP
    // ========================================================

    const candidates =
      pengajuan
        .filter(
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
        .map(
          (item) => ({
            pengajuanId:
              item.id,

            status:
              item.status,

            mustahik: {
              id:
                item.mustahik.id,

              namaLengkap:
                item.mustahik.namaLengkap,

              nik:
                item.mustahik.nik,
            },

            jawaban:
              criteria.map(
                (criterion) => {
                  const answer =
                    item.jawaban.find(
                      (itemAnswer) =>
                        itemAnswer.kriteriaId ===
                        criterion.id
                    )

                  return {
                    kriteriaId:
                      criterion.id,

                    kode:
                      criterion.kode,

                    nama:
                      criterion.nama,

                    nilai:
                      Number(
                        answer?.nilai ??
                        0
                      ),
                  }
                }
              ),
          })
        )

    // ========================================================
    // 4. RESPONSE
    // ========================================================

    return success(
      res,
      'Kandidat TOPSIS berhasil diambil.',
      {
        criteria,
        candidates,
      }
    )
  } catch (error) {
    console.error(
      'GET TOPSIS CANDIDATES ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil kandidat TOPSIS.',
      500
    )
  }
}

// ============================================================
// PROCESS TOPSIS
// ============================================================

export async function processTopsis(
  req: Request,
  res: Response
) {
  try {
    // ========================================================
    // 1. THRESHOLD
    // ========================================================

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

    // ========================================================
    // 2. AMBIL KRITERIA AKTIF
    // ========================================================

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

    // ========================================================
    // 3. AMBIL SEMUA ALTERNATIF TOPSIS
    // ========================================================
    //
    // Jangan hanya DIPROSES_TOPSIS.
    //
    // Karena hasil TOPSIS sebelumnya mengubah status menjadi:
    //
    // LAYAK_DIDANAI
    // atau
    // TIDAK_DIDANAI
    //
    // Jika admin menghitung ulang, mereka tetap harus masuk
    // ke matriks yang sama.
    //
    // ========================================================

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

    // ========================================================
    // 4. FILTER KUESIONER LENGKAP
    // ========================================================

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

    // ========================================================
    // 5. MATRKS X
    // ========================================================

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

    // ========================================================
    // 6. VALIDASI NILAI
    // ========================================================

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

    // ========================================================
    // 7. HITUNG TOPSIS
    // ========================================================

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

    // ========================================================
    // 8. SIMPAN HASIL
    // ========================================================

    const persisted =
      await prisma.$transaction(
        async (tx) => {
          const pengajuanIds =
            ready.map(
              (item) =>
                item.id
            )

          // --------------------------------------------------
          // Hapus hasil lama
          // --------------------------------------------------

          await tx.topsisResult.deleteMany(
            {
              where: {
                pengajuanId: {
                  in:
                    pengajuanIds,
                },
              },
            }
          )

          const output: any[] =
            []

          // --------------------------------------------------
          // Simpan hasil baru
          // --------------------------------------------------

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
                        mustahik:
                          true,
                      },
                    },

                    details: {
                      include: {
                        kriteria:
                          true,
                      },
                    },
                  },
                }
              )

            // ------------------------------------------------
            // Update status pengajuan
            // ------------------------------------------------

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

    // ========================================================
    // 9. RESPONSE
    // ========================================================

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
// GET SEMUA HASIL TOPSIS
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
              ranking:
                'asc',
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
            id:
              req.params.id,
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
      'Gagal mengambil detail TOPSIS.',
      500
    )
  }
}