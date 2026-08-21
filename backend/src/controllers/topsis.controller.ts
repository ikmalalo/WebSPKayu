import type {
  Request,
  Response,
} from 'express'

import {
  PengajuanStatus,
  KriteriaTipe,
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
// TYPES
// ============================================================

type NilaiKriteria = {
  kriteriaId: string
  kode: string
  nilai: number
  bobot: number
  tipe: KriteriaTipe
}

type MatriksNilai = {
  pengajuanId: string
  nilai: Record<string, number>
}

type HasilPerhitungan = {
  pengajuanId: string
  nilaiPreferensi: number
  ranking: number
  status: PengajuanStatus
  details: Array<{
    kriteriaId: string
    nilaiAwal: number
    nilaiNormalisasi: number
    nilaiTerbobot: number
  }>
}

// ============================================================
// HELPER
// ============================================================

function decimal(
  value: number
): Prisma.Decimal {
  return new Prisma.Decimal(
    value.toFixed(8)
  )
}

function round(
  value: number,
  digits = 6
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0
  }

  const factor =
    Math.pow(10, digits)

  return (
    Math.round(
      (value + Number.EPSILON) *
      factor
    ) / factor
  )
}

// ============================================================
// PEMBENTUKAN NILAI KRITERIA C1 - C5
// ============================================================
//
// Struktur:
//
// C1 = rata-rata ID1, ID2, ID3
// C2 = rata-rata ID4, ID5, ID6*
// C3 = rata-rata ID7, ID8, ID9
// C4 = rata-rata ID10, ID11, ID12
// C5 = rata-rata ID13, ID14, ID15
//
// Untuk indikator NEGATIF:
//
// nilai dibalik dengan:
//
// 6 - nilai
//
// Contoh:
// nilai 5 -> 1
// nilai 4 -> 2
// nilai 3 -> 3
// nilai 2 -> 4
// nilai 1 -> 5
//
// Dengan demikian seluruh nilai kriteria
// berada pada orientasi yang sama:
// semakin besar semakin baik.
// ============================================================

function hitungNilaiKriteria(
  kriteria: Array<{
    id: string
    kode: string
    bobot: Prisma.Decimal
    tipe: KriteriaTipe
    indikator: Array<{
      id: string
      tipe: 'POSITIF' | 'NEGATIF'
    }>
  }>,
  jawabanMap: Map<
    string,
    number
  >
): NilaiKriteria[] {
  return kriteria.map(
    (item) => {
      const nilaiIndikator =
        item.indikator.map(
          (indikator) => {
            const nilai =
              jawabanMap.get(
                indikator.id
              ) ?? 0

            // ----------------------------------------------
            // Indikator negatif
            // ----------------------------------------------

            if (
              indikator.tipe ===
              'NEGATIF'
            ) {
              return 6 - nilai
            }

            return nilai
          }
        )

      // ----------------------------------------------
      // Nilai C1 - C5
      // ----------------------------------------------

      const total =
        nilaiIndikator.reduce(
          (
            sum,
            nilai
          ) =>
            sum + nilai,
          0
        )

      const nilai =
        nilaiIndikator.length > 0
          ? total /
            nilaiIndikator.length
          : 0

      return {
        kriteriaId:
          item.id,

        kode:
          item.kode,

        nilai:
          round(
            nilai,
            6
          ),

        bobot:
          Number(
            item.bobot
          ),

        tipe:
          item.tipe,
      }
    }
  )
}

// ============================================================
// GET PENGAJUAN YANG SIAP DIPROSES TOPSIS
// ============================================================
//
// Endpoint ini mengambil pengajuan:
//
// LOLOS_VERIFIKASI
// atau
// DIPROSES_TOPSIS
//
// agar admin dapat melihat kandidat
// sebelum dan sesudah perhitungan.
// ============================================================

export async function getTopsisCandidates(
  _req: Request,
  res: Response
) {
  try {
    const pengajuan =
      await prisma.pengajuan.findMany({
        where: {
          status: {
            in: [
              PengajuanStatus.LOLOS_VERIFIKASI,
              PengajuanStatus.DIPROSES_TOPSIS,
            ],
          },
        },

        include: {
          mustahik: {
            select: {
              id: true,
              namaLengkap: true,
              nik: true,
              alamat: true,
              noHp: true,
            },
          },

          jawaban: {
            include: {
              indikator: {
                select: {
                  id: true,
                  kode: true,
                  nama: true,
                  tipe: true,
                  urutan: true,
                },
              },
            },

            orderBy: {
              indikator: {
                urutan: 'asc',
              },
            },
          },

          topsisResults: {
            orderBy: {
              createdAt: 'desc',
            },

            take: 1,

            select: {
              id: true,
              nilaiPreferensi: true,
              ranking: true,
              status: true,
              tanggalProses: true,
            },
          },
        },

        orderBy: {
          tanggalPengajuan: 'asc',
        },
      })

    const candidates =
      pengajuan.map(
        (item) => ({
          id: item.id,

          status:
            item.status,

          tanggalPengajuan:
            item.tanggalPengajuan,

          mustahik:
            item.mustahik,

          jumlahJawaban:
            item.jawaban.length,

          jawaban:
            item.jawaban.map(
              (jawaban) => ({
                indikatorId:
                  jawaban.indikatorId,

                kode:
                  jawaban.indikator
                    ?.kode ??
                  null,

                nama:
                  jawaban.indikator
                    ?.nama ??
                  null,

                nilai:
                  Number(
                    jawaban.nilai
                  ),
              })
            ),

          hasilTopsis:
            item
              .topsisResults[0]
              ? {
                  nilaiPreferensi:
                    Number(
                      item
                        .topsisResults[0]
                        .nilaiPreferensi
                    ),

                  ranking:
                    item
                      .topsisResults[0]
                      .ranking,

                  status:
                    item
                      .topsisResults[0]
                      .status,

                  tanggalProses:
                    item
                      .topsisResults[0]
                      .tanggalProses,
                }
              : null,
        })
      )

    return success(
      res,
      'Data kandidat TOPSIS berhasil diambil',
      {
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
      'Gagal mengambil kandidat TOPSIS',
      500
    )
  }
}

// ============================================================
// HITUNG TOPSIS
// ============================================================
//
// Alur:
//
// 1. Ambil semua pengajuan LOLOS_VERIFIKASI
// 2. Validasi 15 jawaban
// 3. Bentuk nilai C1-C5
// 4. Buat matriks keputusan
// 5. Normalisasi
// 6. Pembobotan
// 7. Solusi ideal positif
// 8. Solusi ideal negatif
// 9. Jarak D+ dan D-
// 10. Nilai preferensi V
// 11. Ranking
// 12. Tentukan layak/tidak layak
// ============================================================

export async function hitungTopsis(
  _req: Request,
  res: Response
) {
  try {
    // ========================================================
    // AMBIL KRITERIA
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

            select: {
              id: true,
              kode: true,
              tipe: true,
              urutan: true,
            },
          },
        },

        orderBy: {
          kode: 'asc',
        },
      })

    if (
      kriteria.length !== 5
    ) {
      return fail(
        res,
        'Data TOPSIS harus memiliki tepat 5 kriteria aktif',
        422
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
      totalIndikator !== 15
    ) {
      return fail(
        res,
        'Data TOPSIS harus memiliki tepat 15 indikator aktif',
        422
      )
    }

    // ========================================================
    // VALIDASI BOBOT
    // ========================================================

    const totalBobot =
      kriteria.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.bobot
          ),
        0
      )

    if (
      Math.abs(
        totalBobot - 1
      ) > 0.0001
    ) {
      return fail(
        res,
        `Total bobot kriteria harus 1. Saat ini: ${totalBobot}`,
        422
      )
    }

    // ========================================================
    // AMBIL KANDIDAT
    // ========================================================

    const pengajuan =
      await prisma.pengajuan.findMany({
        where: {
          status:
            PengajuanStatus.LOLOS_VERIFIKASI,
        },

        include: {
          jawaban: {
            select: {
              indikatorId: true,
              nilai: true,
            },
          },

          mustahik: {
            select: {
              namaLengkap: true,
              nik: true,
            },
          },
        },

        orderBy: {
          tanggalPengajuan: 'asc',
        },
      })

    if (
      pengajuan.length === 0
    ) {
      return fail(
        res,
        'Tidak ada pengajuan yang siap diproses TOPSIS',
        404
      )
    }

    // ========================================================
    // VALIDASI 15 JAWABAN SETIAP KANDIDAT
    // ========================================================

    const validIndikatorIds =
      new Set(
        kriteria.flatMap(
          (item) =>
            item.indikator.map(
              (
                indikator
              ) =>
                indikator.id
            )
        )
      )

    for (
      const item of pengajuan
    ) {
      const jawabanValid =
        item.jawaban.filter(
          (
            jawaban
          ) =>
            jawaban.indikatorId &&
            validIndikatorIds.has(
              jawaban.indikatorId
            )
        )

      if (
        jawabanValid.length !==
        totalIndikator
      ) {
        return fail(
          res,
          `Pengajuan ${item.mustahik.namaLengkap} belum memiliki ${totalIndikator} jawaban indikator`,
          422
        )
      }

      const indikatorSet =
        new Set(
          jawabanValid.map(
            (
              jawaban
            ) =>
              jawaban.indikatorId
          )
        )

      if (
        indikatorSet.size !==
        totalIndikator
      ) {
        return fail(
          res,
          `Jawaban indikator pengajuan ${item.mustahik.namaLengkap} tidak lengkap atau duplikat`,
          422
        )
      }
    }

    // ========================================================
    // BENTUK NILAI C1 - C5
    // ========================================================

    const matriksAwal:
      MatriksNilai[] =
      pengajuan.map(
        (
          item
        ) => {
          const jawabanMap =
            new Map<
              string,
              number
            >()

          item.jawaban.forEach(
            (
              jawaban
            ) => {
              if (
                jawaban.indikatorId
              ) {
                jawabanMap.set(
                  jawaban.indikatorId,
                  Number(
                    jawaban.nilai
                  )
                )
              }
            }
          )

          const nilaiKriteria =
            hitungNilaiKriteria(
              kriteria,
              jawabanMap
            )

          const nilai:
            Record<
              string,
              number
            > =
            {}

          nilaiKriteria.forEach(
            (
              itemNilai
            ) => {
              nilai[
                itemNilai.kriteriaId
              ] =
                itemNilai.nilai
            }
          )

          return {
            pengajuanId:
              item.id,

            nilai,
          }
        }
      )

    // ========================================================
    // PEMBAGI NORMALISASI
    //
    // akar(sum(x^2))
    // ========================================================

    const pembagi:
      Record<
        string,
        number
      > =
      {}

    for (
      const criterion of
        kriteria
    ) {
      const jumlahKuadrat =
        matriksAwal.reduce(
          (
            total,
            item
          ) => {
            const nilai =
              item.nilai[
                criterion.id
              ] ?? 0

            return (
              total +
              Math.pow(
                nilai,
                2
              )
            )
          },
          0
        )

      pembagi[
        criterion.id
      ] =
        Math.sqrt(
          jumlahKuadrat
        )
    }

    // ========================================================
    // NORMALISASI + PEMBOBOTAN
    // ========================================================

    const matriksTerbobot:
      Record<
        string,
        Record<
          string,
          number
        >
      > =
      {}

    const detailPerhitungan:
      Record<
        string,
        Array<{
          kriteriaId: string
          nilaiAwal: number
          nilaiNormalisasi: number
          nilaiTerbobot: number
        }>
      > =
      {}

    for (
      const item of
        matriksAwal
    ) {
      matriksTerbobot[
        item.pengajuanId
      ] =
        {}

      detailPerhitungan[
        item.pengajuanId
      ] =
        []

      for (
        const criterion of
          kriteria
      ) {
        const nilaiAwal =
          item.nilai[
            criterion.id
          ] ?? 0

        const pembagiKriteria =
          pembagi[
            criterion.id
          ]

        const nilaiNormalisasi =
          pembagiKriteria > 0
            ? nilaiAwal /
              pembagiKriteria
            : 0

        const nilaiTerbobot =
          nilaiNormalisasi *
          Number(
            criterion.bobot
          )

        matriksTerbobot[
          item.pengajuanId
        ][
          criterion.id
        ] =
          nilaiTerbobot

        detailPerhitungan[
          item.pengajuanId
        ].push({
          kriteriaId:
            criterion.id,

          nilaiAwal:
            round(
              nilaiAwal,
              6
            ),

          nilaiNormalisasi:
            round(
              nilaiNormalisasi,
              8
            ),

          nilaiTerbobot:
            round(
              nilaiTerbobot,
              8
            ),
        })
      }
    }

    // ========================================================
    // SOLUSI IDEAL
    // ========================================================

    const idealPositif:
      Record<
        string,
        number
      > =
      {}

    const idealNegatif:
      Record<
        string,
        number
      > =
      {}

    for (
      const criterion of
        kriteria
    ) {
      const nilai =
        pengajuan.map(
          (
            item
          ) =>
            matriksTerbobot[
              item.id
            ][
              criterion.id
            ] ?? 0
        )

      if (
        criterion.tipe ===
        KriteriaTipe.BENEFIT
      ) {
        idealPositif[
          criterion.id
        ] =
          Math.max(
            ...nilai
          )

        idealNegatif[
          criterion.id
        ] =
          Math.min(
            ...nilai
          )
      } else {
        idealPositif[
          criterion.id
        ] =
          Math.min(
            ...nilai
          )

        idealNegatif[
          criterion.id
        ] =
          Math.max(
            ...nilai
          )
      }
    }

    // ========================================================
    // HITUNG NILAI PREFERENSI
    //
    // V = D- / (D+ + D-)
    // ========================================================

    const hasilSementara =
      pengajuan.map(
        (
          item
        ) => {
          let jumlahPositif = 0
          let jumlahNegatif = 0

          for (
            const criterion of
              kriteria
          ) {
            const nilai =
              matriksTerbobot[
                item.id
              ][
                criterion.id
              ] ?? 0

            jumlahPositif +=
              Math.pow(
                nilai -
                  idealPositif[
                    criterion.id
                  ],
                2
              )

            jumlahNegatif +=
              Math.pow(
                nilai -
                  idealNegatif[
                    criterion.id
                  ],
                2
              )
          }

          const jarakPositif =
            Math.sqrt(
              jumlahPositif
            )

          const jarakNegatif =
            Math.sqrt(
              jumlahNegatif
            )

          const totalJarak =
            jarakPositif +
            jarakNegatif

          const nilaiPreferensi =
            totalJarak > 0
              ? jarakNegatif /
                totalJarak
              : 0

          return {
            pengajuanId:
              item.id,

            nilaiPreferensi:
              round(
                nilaiPreferensi,
                6
              ),

            details:
              detailPerhitungan[
                item.id
              ],
          }
        }
      )

    // ========================================================
    // RANKING
    // ========================================================

    hasilSementara.sort(
      (
        a,
        b
      ) =>
        b.nilaiPreferensi -
        a.nilaiPreferensi
    )

    // ========================================================
    // MENENTUKAN KELAYAKAN
    // ========================================================
    //
    // Sementara:
    //
    // Ranking 1 sampai 50% kandidat = LAYAK_DIDANAI
    // Sisanya = TIDAK_DIDANAI
    //
    // Jika Excel client memiliki batas kelayakan
    // berbeda, bagian ini harus disesuaikan.
    // ========================================================

    const jumlahLayak =
      Math.max(
        1,
        Math.ceil(
          hasilSementara.length *
          0.5
        )
      )

    const hasil:
      HasilPerhitungan[] =
      hasilSementara.map(
        (
          item,
          index
        ) => ({
          pengajuanId:
            item.pengajuanId,

          nilaiPreferensi:
            item.nilaiPreferensi,

          ranking:
            index + 1,

          status:
            index <
            jumlahLayak
              ? PengajuanStatus.LAYAK_DIDANAI
              : PengajuanStatus.TIDAK_DIDANAI,

          details:
            item.details,
        })
      )

    // ========================================================
    // SIMPAN HASIL
    // ========================================================

    await prisma.$transaction(
      async (
        tx
      ) => {

        // ----------------------------------------------------
        // Hapus hasil TOPSIS lama untuk kandidat
        // ----------------------------------------------------

        await tx.topsisResult.deleteMany({
          where: {
            pengajuanId: {
              in:
                hasil.map(
                  (
                    item
                  ) =>
                    item.pengajuanId
                ),
            },
          },
        })

        // ----------------------------------------------------
        // Simpan hasil baru
        // ----------------------------------------------------

        for (
          const item of
          hasil
        ) {
          const topsisResult =
            await tx.topsisResult.create({
              data: {
                pengajuanId:
                  item.pengajuanId,

                nilaiPreferensi:
                  decimal(
                    item.nilaiPreferensi
                  ),

                ranking:
                  item.ranking,

                status:
                  item.status,

                tanggalProses:
                  new Date(),

                details: {
                  create:
                    item.details.map(
                      (
                        detail
                      ) => ({
                        kriteriaId:
                          detail.kriteriaId,

                        nilaiAwal:
                          decimal(
                            detail.nilaiAwal
                          ),

                        nilaiNormalisasi:
                          decimal(
                            detail.nilaiNormalisasi
                          ),

                        nilaiTerbobot:
                          decimal(
                            detail.nilaiTerbobot
                          ),
                      })
                    ),
                },
              },
            })

          await tx.pengajuan.update({
            where: {
              id:
                item.pengajuanId,
            },

            data: {
              status:
                item.status,
            },
          })

          console.log(
            `TOPSIS BERHASIL: ${item.pengajuanId} | Ranking ${item.ranking} | Preferensi ${item.nilaiPreferensi} | Result ${topsisResult.id}`
          )
        }
      }
    )

    return success(
      res,
      'Perhitungan TOPSIS berhasil dilakukan',
      {
        totalKandidat:
          hasil.length,

        totalLayak:
          hasil.filter(
            (
              item
            ) =>
              item.status ===
              PengajuanStatus.LAYAK_DIDANAI
          ).length,

        totalTidakLayak:
          hasil.filter(
            (
              item
            ) =>
              item.status ===
              PengajuanStatus.TIDAK_DIDANAI
          ).length,

        hasil:
          hasil.map(
            (
              item
            ) => ({
              pengajuanId:
                item.pengajuanId,

              nilaiPreferensi:
                item.nilaiPreferensi,

              ranking:
                item.ranking,

              status:
                item.status,
            })
          ),
      }
    )
  } catch (error) {
    console.error(
      'HITUNG TOPSIS ERROR:',
      error
    )

    return fail(
      res,
      'Gagal melakukan perhitungan TOPSIS',
      500
    )
  }
}

// ============================================================
// GET HASIL TOPSIS
// ============================================================

export async function getTopsisResults(
  _req: Request,
  res: Response
) {
  try {
    const results =
      await prisma.topsisResult.findMany({
        include: {
          pengajuan: {
            include: {
              mustahik: {
                select: {
                  id: true,
                  namaLengkap: true,
                  nik: true,
                  alamat: true,
                  noHp: true,
                },
              },
            },
          },

          details: {
            include: {
              kriteria: {
                select: {
                  id: true,
                  kode: true,
                  nama: true,
                  bobot: true,
                  tipe: true,
                },
              },
            },

            orderBy: {
              kriteria: {
                kode: 'asc',
              },
            },
          },
        },

        orderBy: {
          ranking: 'asc',
        },
      })

    return success(
      res,
      'Hasil TOPSIS berhasil diambil',
      {
        results:
          results.map(
            (
              item
            ) => ({
              id:
                item.id,

              pengajuanId:
                item.pengajuanId,

              nilaiPreferensi:
                Number(
                  item.nilaiPreferensi
                ),

              ranking:
                item.ranking,

              status:
                item.status,

              tanggalProses:
                item.tanggalProses,

              mustahik:
                item.pengajuan
                  .mustahik,

              details:
                item.details.map(
                  (
                    detail
                  ) => ({
                    kriteriaId:
                      detail.kriteriaId,

                    kode:
                      detail.kriteria.kode,

                    nama:
                      detail.kriteria.nama,

                    bobot:
                      Number(
                        detail
                          .kriteria
                          .bobot
                      ),

                    tipe:
                      detail
                        .kriteria
                        .tipe,

                    nilaiAwal:
                      Number(
                        detail
                          .nilaiAwal
                      ),

                    nilaiNormalisasi:
                      Number(
                        detail
                          .nilaiNormalisasi
                      ),

                    nilaiTerbobot:
                      Number(
                        detail
                          .nilaiTerbobot
                      ),
                  })
                ),
            })
          ),
      }
    )
  } catch (error) {
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