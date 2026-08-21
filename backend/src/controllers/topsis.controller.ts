import type {
  Request,
  Response,
} from 'express'

import {
  KriteriaTipe,
  PengajuanStatus,
  Prisma,
} from '@prisma/client'

import { prisma } from '../config/prisma'
import {
  fail,
  success,
} from '../utils/api-response'

// ============================================================
// TYPES
// ============================================================

type KriteriaData = {
  id: string
  kode: string
  nama: string
  bobot: Prisma.Decimal
  tipe: KriteriaTipe
  indikator: Array<{
    id: string
    kode: string
    nama: string
    tipe: 'POSITIF' | 'NEGATIF'
    urutan: number
  }>
}

type NilaiKriteria = {
  kriteriaId: string
  kode: string
  nilai: number
  bobot: number
  tipe: KriteriaTipe
}

type DetailPerhitungan = {
  kriteriaId: string
  nilaiAwal: number
  nilaiNormalisasi: number
  nilaiTerbobot: number
}

type HasilSementara = {
  pengajuanId: string
  nilaiPreferensi: number
  details: DetailPerhitungan[]
}

// ============================================================
// HELPER
// ============================================================

function toNumber(
  value: Prisma.Decimal | number
): number {
  return Number(value)
}

function round(
  value: number,
  digits = 8
): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  const factor = Math.pow(10, digits)

  return (
    Math.round(
      (value + Number.EPSILON) *
      factor
    ) / factor
  )
}

function toDecimal(
  value: number
): Prisma.Decimal {
  return new Prisma.Decimal(
    round(value, 8).toString()
  )
}

// ============================================================
// AMBIL NILAI INDIKATOR
// ============================================================

function getNilaiIndikator(
  nilai: number,
  tipe: 'POSITIF' | 'NEGATIF'
): number {
  // Nilai indikator kuesioner berada pada skala 1-5.
  //
  // Indikator negatif dibalik:
  //
  // 5 -> 1
  // 4 -> 2
  // 3 -> 3
  // 2 -> 4
  // 1 -> 5
  //
  // Dengan demikian nilai akhir seluruh indikator
  // memiliki arah yang sama: semakin besar semakin baik.

  if (tipe === 'NEGATIF') {
    return 6 - nilai
  }

  return nilai
}

// ============================================================
// BENTUK NILAI C1 - C5 DARI 15 INDIKATOR
// ============================================================
//
// C1 = rata-rata ID1, ID2, ID3
// C2 = rata-rata ID4, ID5, ID6
// C3 = rata-rata ID7, ID8, ID9
// C4 = rata-rata ID10, ID11, ID12
// C5 = rata-rata ID13, ID14, ID15
//
// Struktur seed:
//
// C1 -> ID1 - ID3
// C2 -> ID4 - ID6
// C3 -> ID7 - ID9
// C4 -> ID10 - ID12
// C5 -> ID13 - ID15
// ============================================================

function bentukNilaiKriteria(
  kriteria: KriteriaData[],
  jawabanMap: Map<string, number>
): NilaiKriteria[] {
  return kriteria.map((criterion) => {
    const nilaiIndikator =
      criterion.indikator.map(
        (indikator) => {
          const nilai =
            jawabanMap.get(
              indikator.id
            ) ?? 0

          return getNilaiIndikator(
            nilai,
            indikator.tipe
          )
        }
      )

    const total =
      nilaiIndikator.reduce(
        (sum, nilai) =>
          sum + nilai,
        0
      )

    const nilaiKriteria =
      nilaiIndikator.length > 0
        ? total /
          nilaiIndikator.length
        : 0

    return {
      kriteriaId:
        criterion.id,

      kode:
        criterion.kode,

      nilai:
        round(
          nilaiKriteria,
          8
        ),

      bobot:
        toNumber(
          criterion.bobot
        ),

      tipe:
        criterion.tipe,
    }
  })
}

// ============================================================
// GET TOPSIS CANDIDATES
// ============================================================
//
// GET /api/admin/topsis/candidates
//
// Mengambil:
//
// 1. Pengajuan LOLOS_VERIFIKASI
// 2. Pengajuan DIPROSES_TOPSIS
//
// DIPROSES_TOPSIS tetap ditampilkan agar
// kandidat tidak tiba-tiba hilang dari halaman proses.
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          mustahik: {
            select: {
              id: true,
              nik: true,
              namaLengkap: true,
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
          },

          topsisResults: {
            orderBy: {
              tanggalProses: 'desc',
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
      pengajuan.map((item) => ({
        id: item.id,

        userId:
          item.userId,

        mustahikId:
          item.mustahikId,

        status:
          item.status,

        tanggalPengajuan:
          item.tanggalPengajuan,

        user:
          item.user,

        mustahik:
          item.mustahik,

        jumlahJawaban:
          item.jawaban.filter(
            (jawaban) =>
              jawaban.indikatorId !== null
          ).length,

        jawaban:
          item.jawaban
            .filter(
              (jawaban) =>
                jawaban.indikator !== null
            )
            .sort(
              (a, b) =>
                (a.indikator?.urutan ?? 0) -
                (b.indikator?.urutan ?? 0)
            )
            .map((jawaban) => ({
              id:
                jawaban.id,

              indikatorId:
                jawaban.indikatorId,

              kode:
                jawaban.indikator?.kode ??
                null,

              nama:
                jawaban.indikator?.nama ??
                null,

              tipe:
                jawaban.indikator?.tipe ??
                null,

              nilai:
                toNumber(
                  jawaban.nilai
                ),
            })),

        hasilTopsis:
          item.topsisResults.length > 0
            ? {
                id:
                  item.topsisResults[0].id,

                nilaiPreferensi:
                  toNumber(
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
      }))

    return success(
      res,
      'Data kandidat TOPSIS berhasil diambil',
      {
        candidates,
        total:
          candidates.length,
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
// PROCESS TOPSIS
// ============================================================
//
// POST /api/admin/topsis/process
//
// Flow:
//
// LOLOS_VERIFIKASI
//        ↓
// DIPROSES_TOPSIS
//        ↓
// Hitung 15 indikator
//        ↓
// Bentuk C1 - C5
//        ↓
// Normalisasi
//        ↓
// Pembobotan
//        ↓
// Solusi Ideal
//        ↓
// Jarak D+ dan D-
//        ↓
// Nilai Preferensi
//        ↓
// Ranking
//        ↓
// LAYAK_DIDANAI / TIDAK_DIDANAI
// ============================================================

export async function processTopsis(
  _req: Request,
  res: Response
) {
  try {
    // ========================================================
    // AMBIL 5 KRITERIA
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
              nama: true,
              tipe: true,
              urutan: true,
            },
          },
        },

        orderBy: {
          kode: 'asc',
        },
      })

    if (kriteria.length !== 5) {
      return fail(
        res,
        `Data kriteria tidak valid. Sistem harus memiliki 5 kriteria aktif, ditemukan ${kriteria.length}.`,
        422
      )
    }

    const totalIndikator =
      kriteria.reduce(
        (total, item) =>
          total +
          item.indikator.length,
        0
      )

    if (totalIndikator !== 15) {
      return fail(
        res,
        `Data indikator tidak valid. Sistem harus memiliki 15 indikator aktif, ditemukan ${totalIndikator}.`,
        422
      )
    }

    // ========================================================
    // VALIDASI BOBOT
    // ========================================================

    const totalBobot =
      kriteria.reduce(
        (total, item) =>
          total +
          toNumber(
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
        `Total bobot kriteria harus 100% atau 1. Saat ini: ${round(totalBobot * 100, 2)}%.`,
        422
      )
    }

    // ========================================================
    // AMBIL PENGAJUAN YANG SIAP DIPROSES
    // ========================================================

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
            },
          },

          jawaban: {
            select: {
              indikatorId: true,
              nilai: true,
            },
          },
        },

        orderBy: {
          tanggalPengajuan: 'asc',
        },
      })

    if (pengajuan.length === 0) {
      return fail(
        res,
        'Tidak ada pengajuan yang siap diproses TOPSIS',
        404
      )
    }

    // ========================================================
    // VALIDASI 15 JAWABAN
    // ========================================================

    const indikatorAktifIds =
      new Set(
        kriteria.flatMap(
          (criterion) =>
            criterion.indikator.map(
              (indikator) =>
                indikator.id
            )
        )
      )

    for (const item of pengajuan) {
      const jawabanValid =
        item.jawaban.filter(
          (jawaban) =>
            jawaban.indikatorId !== null &&
            indikatorAktifIds.has(
              jawaban.indikatorId
            )
        )

      const indikatorTerjawab =
        new Set(
          jawabanValid
            .map(
              (jawaban) =>
                jawaban.indikatorId
            )
            .filter(
              (
                indikatorId
              ): indikatorId is string =>
                indikatorId !== null
            )
        )

      if (
        indikatorTerjawab.size !==
        totalIndikator
      ) {
        return fail(
          res,
          `Pengajuan atas nama ${item.mustahik.namaLengkap} belum memiliki 15 jawaban indikator yang lengkap.`,
          422
        )
      }
    }

    // ========================================================
    // UBAH STATUS MENJADI DIPROSES_TOPSIS
    // ========================================================

    await prisma.pengajuan.updateMany({
      where: {
        id: {
          in: pengajuan.map(
            (item) =>
              item.id
          ),
        },

        status:
          PengajuanStatus.LOLOS_VERIFIKASI,
      },

      data: {
        status:
          PengajuanStatus.DIPROSES_TOPSIS,
      },
    })

    // ========================================================
    // BENTUK MATRIKS KEPUTUSAN C1 - C5
    // ========================================================

    const matriksAwal =
      pengajuan.map((item) => {
        const jawabanMap =
          new Map<
            string,
            number
          >()

        item.jawaban.forEach(
          (jawaban) => {
            if (
              jawaban.indikatorId
            ) {
              jawabanMap.set(
                jawaban.indikatorId,
                toNumber(
                  jawaban.nilai
                )
              )
            }
          }
        )

        const nilaiKriteria =
          bentukNilaiKriteria(
            kriteria,
            jawabanMap
          )

        const nilai:
          Record<
            string,
            number
          > = {}

        nilaiKriteria.forEach(
          (criterion) => {
            nilai[
              criterion.kriteriaId
            ] =
              criterion.nilai
          }
        )

        return {
          pengajuanId:
            item.id,

          namaLengkap:
            item.mustahik
              .namaLengkap,

          nilai,
        }
      })

    // ========================================================
    // PEMBAGI NORMALISASI
    //
    // √ΣX²
    // ========================================================

    const pembagiNormalisasi:
      Record<
        string,
        number
      > = {}

    for (const criterion of kriteria) {
      const totalKuadrat =
        matriksAwal.reduce(
          (total, item) => {
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

      pembagiNormalisasi[
        criterion.id
      ] =
        Math.sqrt(
          totalKuadrat
        )
    }

    // ========================================================
    // NORMALISASI DAN PEMBOBOTAN
    // ========================================================

    const matriksTerbobot:
      Record<
        string,
        Record<
          string,
          number
        >
      > = {}

    const detailsMap:
      Record<
        string,
        DetailPerhitungan[]
      > = {}

    for (const item of matriksAwal) {
      matriksTerbobot[
        item.pengajuanId
      ] = {}

      detailsMap[
        item.pengajuanId
      ] = []

      for (const criterion of kriteria) {
        const nilaiAwal =
          item.nilai[
            criterion.id
          ] ?? 0

        const pembagi =
          pembagiNormalisasi[
            criterion.id
          ] ?? 0

        const nilaiNormalisasi =
          pembagi > 0
            ? nilaiAwal /
              pembagi
            : 0

        const nilaiTerbobot =
          nilaiNormalisasi *
          toNumber(
            criterion.bobot
          )

        matriksTerbobot[
          item.pengajuanId
        ][
          criterion.id
        ] =
          nilaiTerbobot

        detailsMap[
          item.pengajuanId
        ].push({
          kriteriaId:
            criterion.id,

          nilaiAwal:
            round(
              nilaiAwal,
              8
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
    // SOLUSI IDEAL POSITIF DAN NEGATIF
    // ========================================================

    const idealPositif:
      Record<
        string,
        number
      > = {}

    const idealNegatif:
      Record<
        string,
        number
      > = {}

    for (const criterion of kriteria) {
      const nilaiTerbobot =
        pengajuan.map(
          (item) =>
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
            ...nilaiTerbobot
          )

        idealNegatif[
          criterion.id
        ] =
          Math.min(
            ...nilaiTerbobot
          )
      } else {
        idealPositif[
          criterion.id
        ] =
          Math.min(
            ...nilaiTerbobot
          )

        idealNegatif[
          criterion.id
        ] =
          Math.max(
            ...nilaiTerbobot
          )
      }
    }

    // ========================================================
    // HITUNG JARAK DAN NILAI PREFERENSI
    //
    // D+ = √Σ(Yij - A+)²
    // D- = √Σ(Yij - A-)²
    //
    // V = D- / (D+ + D-)
    // ========================================================

    const hasilSementara:
      HasilSementara[] =
      pengajuan.map((item) => {
        let totalPositif = 0
        let totalNegatif = 0

        for (const criterion of kriteria) {
          const nilai =
            matriksTerbobot[
              item.id
            ][
              criterion.id
            ] ?? 0

          totalPositif +=
            Math.pow(
              nilai -
              idealPositif[
                criterion.id
              ],
              2
            )

          totalNegatif +=
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
            totalPositif
          )

        const jarakNegatif =
          Math.sqrt(
            totalNegatif
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
              8
            ),

          details:
            detailsMap[
              item.id
            ],
        }
      })

    // ========================================================
    // SORTING RANKING
    // ========================================================

    hasilSementara.sort(
      (a, b) =>
        b.nilaiPreferensi -
        a.nilaiPreferensi
    )

    // ========================================================
    // SIMPAN HASIL
    //
    // Penting:
    //
    // Jangan menggunakan aturan 50% layak.
    //
    // Status akhir sementara ditentukan berdasarkan
    // hasil ranking saja agar tidak mengarang aturan
    // kelayakan yang belum diberikan Excel client.
    //
    // Semua hasil yang diproses tetap disimpan sebagai
    // DIPROSES_TOPSIS pada pengajuan sampai aturan
    // kelayakan final diterapkan.
    // ========================================================

    const hasil =
      hasilSementara.map(
        (item, index) => ({
          pengajuanId:
            item.pengajuanId,

          nilaiPreferensi:
            item.nilaiPreferensi,

          ranking:
            index + 1,

          details:
            item.details,
        })
      )

    // ========================================================
    // TRANSACTION SIMPAN
    // ========================================================

    await prisma.$transaction(
      async (tx) => {
        const pengajuanIds =
          hasil.map(
            (item) =>
              item.pengajuanId
          )

        // Hapus hasil lama agar perhitungan ulang
        // tidak membuat data duplikat.

        await tx.topsisResult.deleteMany({
          where: {
            pengajuanId: {
              in:
                pengajuanIds,
            },
          },
        })

        // Simpan hasil baru.

        for (const item of hasil) {
          await tx.topsisResult.create({
            data: {
              pengajuanId:
                item.pengajuanId,

              nilaiPreferensi:
                toDecimal(
                  item.nilaiPreferensi
                ),

              ranking:
                item.ranking,

              status:
                PengajuanStatus.DIPROSES_TOPSIS,

              tanggalProses:
                new Date(),

              details: {
                create:
                  item.details.map(
                    (detail) => ({
                      kriteriaId:
                        detail.kriteriaId,

                      nilaiAwal:
                        toDecimal(
                          detail.nilaiAwal
                        ),

                      nilaiNormalisasi:
                        toDecimal(
                          detail.nilaiNormalisasi
                        ),

                      nilaiTerbobot:
                        toDecimal(
                          detail.nilaiTerbobot
                        ),
                    })
                  ),
              },
            },
          })
        }

        // Update status pengajuan.
        // Hasil akhir kelayakan belum dipaksakan.

        await tx.pengajuan.updateMany({
          where: {
            id: {
              in:
                pengajuanIds,
            },
          },

          data: {
            status:
              PengajuanStatus.DIPROSES_TOPSIS,
          },
        })
      }
    )

    return success(
      res,
      'Perhitungan TOPSIS berhasil dilakukan',
      {
        totalKandidat:
          hasil.length,

        hasil: hasil.map(
          (item) => ({
            pengajuanId:
              item.pengajuanId,

            nilaiPreferensi:
              item.nilaiPreferensi,

            ranking:
              item.ranking,

            status:
              PengajuanStatus.DIPROSES_TOPSIS,
          })
        ),
      }
    )
  } catch (error) {
    console.error(
      'PROCESS TOPSIS ERROR:',
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
// GET TOPSIS RESULTS
// ============================================================
//
// GET /api/admin/topsis/results
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
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },

              mustahik: {
                select: {
                  id: true,
                  nik: true,
                  namaLengkap: true,
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
            (item) => ({
              id:
                item.id,

              pengajuanId:
                item.pengajuanId,

              nilaiPreferensi:
                toNumber(
                  item.nilaiPreferensi
                ),

              ranking:
                item.ranking,

              status:
                item.status,

              tanggalProses:
                item.tanggalProses,

              createdAt:
                item.createdAt,

              updatedAt:
                item.updatedAt,

              pengajuan: {
                id:
                  item.pengajuan.id,

                status:
                  item.pengajuan.status,

                tanggalPengajuan:
                  item.pengajuan
                    .tanggalPengajuan,

                mustahik:
                  item.pengajuan
                    .mustahik,

                user:
                  item.pengajuan
                    .user,
              },

              mustahik:
                item.pengajuan
                  .mustahik,

              details:
                item.details
                  .sort(
                    (a, b) =>
                      a.kriteria.kode.localeCompare(
                        b.kriteria.kode
                      )
                  )
                  .map(
                    (detail) => ({
                      id:
                        detail.id,

                      kriteriaId:
                        detail.kriteriaId,

                      kode:
                        detail.kriteria.kode,

                      nama:
                        detail.kriteria.nama,

                      bobot:
                        toNumber(
                          detail
                            .kriteria
                            .bobot
                        ),

                      tipe:
                        detail
                          .kriteria
                          .tipe,

                      nilaiAwal:
                        toNumber(
                          detail
                            .nilaiAwal
                        ),

                      nilaiNormalisasi:
                        toNumber(
                          detail
                            .nilaiNormalisasi
                        ),

                      nilaiTerbobot:
                        toNumber(
                          detail
                            .nilaiTerbobot
                        ),
                    })
                  ),
            })
          ),

        total:
          results.length,
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

// ============================================================
// GET TOPSIS RESULT DETAIL
// ============================================================
//
// GET /api/admin/topsis/results/:id
// ============================================================

export async function getTopsisResult(
  req: Request,
  res: Response
) {
  try {
    const { id } =
      req.params

    if (!id) {
      return fail(
        res,
        'ID hasil TOPSIS wajib diisi',
        422
      )
    }

    const result =
      await prisma.topsisResult.findUnique({
        where: {
          id,
        },

        include: {
          pengajuan: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },

              mustahik: {
                select: {
                  id: true,
                  nik: true,
                  namaLengkap: true,
                  tempatLahir: true,
                  tanggalLahir: true,
                  jenisKelamin: true,
                  alamat: true,
                  kelurahan: true,
                  kecamatan: true,
                  kota: true,
                  provinsi: true,
                  noHp: true,
                  statusPernikahan: true,
                  pekerjaan: true,
                  penghasilan: true,
                  jumlahTanggungan: true,
                  statusRumah: true,
                  kondisiRumah: true,
                  kepemilikanAset: true,
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
          },
        },
      })

    if (!result) {
      return fail(
        res,
        'Hasil TOPSIS tidak ditemukan',
        404
      )
    }

    const jawaban =
      result.pengajuan.jawaban
        .filter(
          (item) =>
            item.indikator !== null
        )
        .sort(
          (a, b) =>
            (a.indikator?.urutan ?? 0) -
            (b.indikator?.urutan ?? 0)
        )
        .map((item) => ({
          id:
            item.id,

          indikatorId:
            item.indikatorId,

          kode:
            item.indikator?.kode ??
            null,

          nama:
            item.indikator?.nama ??
            null,

          tipe:
            item.indikator?.tipe ??
            null,

          nilai:
            toNumber(
              item.nilai
            ),
        }))

    return success(
      res,
      'Detail hasil TOPSIS berhasil diambil',
      {
        result: {
          id:
            result.id,

          pengajuanId:
            result.pengajuanId,

          nilaiPreferensi:
            toNumber(
              result.nilaiPreferensi
            ),

          ranking:
            result.ranking,

          status:
            result.status,

          tanggalProses:
            result.tanggalProses,

          createdAt:
            result.createdAt,

          updatedAt:
            result.updatedAt,

          pengajuan: {
            id:
              result.pengajuan.id,

            userId:
              result.pengajuan.userId,

            mustahikId:
              result.pengajuan.mustahikId,

            status:
              result.pengajuan.status,

            tanggalPengajuan:
              result.pengajuan
                .tanggalPengajuan,

            tanggalVerifikasi:
              result.pengajuan
                .tanggalVerifikasi,

            catatan:
              result.pengajuan.catatan,

            user:
              result.pengajuan.user,

            mustahik:
              {
                ...result.pengajuan
                  .mustahik,

                penghasilan:
                  result.pengajuan
                    .mustahik
                    .penghasilan
                    ? toNumber(
                        result.pengajuan
                          .mustahik
                          .penghasilan
                      )
                    : null,
              },

            jawaban,
          },

          mustahik:
            {
              ...result.pengajuan
                .mustahik,

              penghasilan:
                result.pengajuan
                  .mustahik
                  .penghasilan
                  ? toNumber(
                      result.pengajuan
                        .mustahik
                        .penghasilan
                    )
                  : null,
            },

          details:
            result.details
              .sort(
                (a, b) =>
                  a.kriteria.kode.localeCompare(
                    b.kriteria.kode
                  )
              )
              .map(
                (detail) => ({
                  id:
                    detail.id,

                  kriteriaId:
                    detail.kriteriaId,

                  kode:
                    detail.kriteria.kode,

                  nama:
                    detail.kriteria.nama,

                  bobot:
                    toNumber(
                      detail
                        .kriteria
                        .bobot
                    ),

                  tipe:
                    detail
                      .kriteria
                      .tipe,

                  nilaiAwal:
                    toNumber(
                      detail
                        .nilaiAwal
                    ),

                  nilaiNormalisasi:
                    toNumber(
                      detail
                        .nilaiNormalisasi
                    ),

                  nilaiTerbobot:
                    toNumber(
                      detail
                        .nilaiTerbobot
                    ),
                })
              ),
        },
      }
    )
  } catch (error) {
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