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

import {
  fail,
  success,
} from '../utils/api-response'

// ============================================================
// TYPE JAWABAN KUESIONER
// ============================================================

type JawabanInput = {
  indikatorId: string
  nilai: number
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
// ├── ID1
// ├── ID2
// └── ID3
//
// C2
// ├── ID4
// ├── ID5
// └── ID6
//
// dan seterusnya.
// ============================================================

export async function getKuesioner(
  _req: Request,
  res: Response
) {
  try {
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
              deskripsi: true,
              tipe: true,
              urutan: true,
            },
          },
        },

        orderBy: {
          kode: 'asc',
        },
      })

    return success(
      res,
      'Kuesioner berhasil diambil',
      {
        kriteria,
      }
    )
  } catch (error) {
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
// VALIDASI JAWABAN
// ============================================================
//
// Validasi:
//
// 1. Semua indikator aktif wajib dijawab.
// 2. Tidak boleh ada indikator duplikat.
// 3. indikatorId harus valid.
// 4. Nilai harus berupa angka.
// 5. Nilai harus berada pada rentang 1 sampai 5.
// ============================================================

async function validateAnswers(
  jawaban: JawabanInput[]
) {
  // ----------------------------------------------------------
  // Ambil seluruh indikator aktif
  // ----------------------------------------------------------

  const indikator =
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
        kriteriaId: true,
        urutan: true,
      },

      orderBy: {
        urutan: 'asc',
      },
    })

  // ----------------------------------------------------------
  // Pastikan indikator tersedia
  // ----------------------------------------------------------

  if (
    indikator.length === 0
  ) {
    throw new Error(
      'Data indikator kuesioner belum tersedia'
    )
  }

  // ----------------------------------------------------------
  // Ambil semua indikator yang seharusnya dijawab
  // ----------------------------------------------------------

  const indikatorIds =
    indikator.map(
      (item) =>
        item.id
    )

  // ----------------------------------------------------------
  // Ambil indikator yang dijawab user
  // ----------------------------------------------------------

  const answeredIndikatorIds =
    jawaban.map(
      (item) =>
        item.indikatorId
    )

  // ----------------------------------------------------------
  // Semua indikator wajib dijawab
  // ----------------------------------------------------------

  const missingIndikator =
    indikatorIds.filter(
      (id) =>
        !answeredIndikatorIds.includes(
          id
        )
    )

  if (
    missingIndikator.length > 0
  ) {
    const missingCodes =
      indikator
        .filter(
          (item) =>
            missingIndikator.includes(
              item.id
            )
        )
        .map(
          (item) =>
            item.kode
        )

    throw new Error(
      `Semua pertanyaan wajib dijawab. Jawaban belum ditemukan untuk: ${missingCodes.join(
        ', '
      )}`
    )
  }

  // ----------------------------------------------------------
  // Tidak boleh ada indikator duplikat
  // ----------------------------------------------------------

  const uniqueIndikator =
    new Set(
      answeredIndikatorIds
    )

  if (
    uniqueIndikator.size !==
    answeredIndikatorIds.length
  ) {
    throw new Error(
      'Terdapat jawaban indikator yang duplikat'
    )
  }

  // ----------------------------------------------------------
  // Jumlah jawaban harus sama dengan indikator aktif
  // ----------------------------------------------------------

  if (
    jawaban.length !==
    indikator.length
  ) {
    throw new Error(
      `Jumlah jawaban tidak sesuai. Kuesioner harus berisi ${indikator.length} jawaban.`
    )
  }

  // ----------------------------------------------------------
  // Pastikan setiap indikatorId valid
  // ----------------------------------------------------------

  const invalidIndikatorIds =
    answeredIndikatorIds.filter(
      (id) =>
        !indikatorIds.includes(
          id
        )
    )

  if (
    invalidIndikatorIds.length > 0
  ) {
    throw new Error(
      'Terdapat indikator yang tidak valid'
    )
  }

  // ----------------------------------------------------------
  // Validasi nilai
  //
  // Saat ini menggunakan skala 1-5.
  // ----------------------------------------------------------

  for (
    const item of jawaban
  ) {
    const nilai =
      Number(item.nilai)

    if (
      !Number.isFinite(
        nilai
      )
    ) {
      throw new Error(
        'Nilai jawaban harus berupa angka'
      )
    }

    if (
      nilai < 1 ||
      nilai > 5
    ) {
      throw new Error(
        'Nilai jawaban harus berada pada rentang 1 sampai 5'
      )
    }
  }

  return {
    indikator,
  }
}

// ============================================================
// SIMPAN JAWABAN
// ============================================================
//
// Kuesioner hanya dapat dikirim SATU KALI.
//
// Setelah berhasil:
// DRAFT
//   ↓
// MENUNGGU_VERIFIKASI
//
// Setelah status bukan DRAFT,
// user tidak dapat mengirim ulang.
// ============================================================

async function saveAnswers(
  req: Request,
  res: Response,
  message: string
) {
  try {
    const {
      pengajuanId,
      jawaban,
      statusRumah,
    } =
      req.body as {
        pengajuanId?: string

        jawaban?: JawabanInput[]

        statusRumah?:
          | 'milik_sendiri'
          | 'sewa'
          | 'menumpang'
      }

    // ========================================================
    // VALIDASI INPUT
    // ========================================================

    if (
      !pengajuanId
    ) {
      return fail(
        res,
        'pengajuanId wajib diisi',
        422
      )
    }

    if (
      !Array.isArray(
        jawaban
      ) ||
      jawaban.length === 0
    ) {
      return fail(
        res,
        'Jawaban kuesioner wajib diisi',
        422
      )
    }

    // ========================================================
    // VALIDASI STATUS RUMAH
    // ========================================================

    const validStatusRumah = [
      'milik_sendiri',
      'sewa',
      'menumpang',
    ] as const

    if (
      !statusRumah ||
      !validStatusRumah.includes(
        statusRumah
      )
    ) {
      return fail(
        res,
        'Status rumah wajib dipilih',
        422
      )
    }

    // ========================================================
    // AMBIL PENGAJUAN
    // ========================================================

    const pengajuan =
      await prisma.pengajuan.findUnique({
        where: {
          id: pengajuanId,
        },

        include: {
          jawaban: {
            select: {
              id: true,
            },
          },
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
    // CEK AUTH
    // ========================================================

    if (
      !req.auth
    ) {
      return fail(
        res,
        'Token autentikasi diperlukan',
        401
      )
    }

    // ========================================================
    // CEK KEPEMILIKAN PENGAJUAN
    // ========================================================

    if (
      pengajuan.userId !==
      req.auth.userId
    ) {
      return fail(
        res,
        'Anda tidak memiliki akses ke pengajuan ini',
        403
      )
    }

    // ========================================================
    // CEK STATUS
    //
    // Kuesioner hanya dapat dikirim ketika DRAFT.
    // ========================================================

    if (
      pengajuan.status !==
      PengajuanStatus.DRAFT
    ) {
      return fail(
        res,
        'Kuesioner sudah pernah dikirim dan tidak dapat diisi atau dikirim ulang.',
        409
      )
    }

    // ========================================================
    // CEK JAWABAN YANG SUDAH ADA
    // ========================================================

    if (
      pengajuan.jawaban.length > 0
    ) {
      return fail(
        res,
        'Kuesioner untuk pengajuan ini sudah pernah diisi.',
        409
      )
    }

    // ========================================================
    // VALIDASI SELURUH JAWABAN
    // ========================================================

    try {
      await validateAnswers(
        jawaban
      )
    } catch (
      validationError
    ) {
      return fail(
        res,
        validationError instanceof
          Error
          ? validationError.message
          : 'Jawaban kuesioner tidak valid',
        422
      )
    }

    // ========================================================
    // SIMPAN DALAM SATU TRANSACTION
    // ========================================================

    await prisma.$transaction(
      async (
        tx
      ) => {

        // ----------------------------------------------------
        // Simpan 15 jawaban indikator
        // ----------------------------------------------------

        await tx.jawabanKuesioner.createMany({
          data:
            jawaban.map(
              (item) => ({
                pengajuanId,

                indikatorId:
                  item.indikatorId,

                nilai:
                  Number(
                    item.nilai
                  ),
              })
            ),
        })

        // ----------------------------------------------------
        // Simpan status rumah.
        //
        // Status rumah bukan bagian dari
        // perhitungan TOPSIS baru.
        // ----------------------------------------------------

        await tx.mustahik.update({
          where: {
            id:
              pengajuan.mustahikId,
          },

          data: {
            statusRumah,
          },
        })

        // ----------------------------------------------------
        // Ubah status pengajuan
        //
        // DRAFT
        //   ↓
        // MENUNGGU_VERIFIKASI
        // ----------------------------------------------------

        await tx.pengajuan.update({
          where: {
            id: pengajuanId,
          },

          data: {
            status:
              PengajuanStatus.MENUNGGU_VERIFIKASI,

            catatan:
              null,
          },
        })
      }
    )

    // ========================================================
    // RESPONSE
    // ========================================================

    return success(
      res,
      message,
      {
        pengajuanId,

        status:
          PengajuanStatus.MENUNGGU_VERIFIKASI,

        locked: true,
      }
    )
  } catch (error) {
    console.error(
      'SAVE KUESIONER ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menyimpan jawaban kuesioner',
      500
    )
  }
}

// ============================================================
// CREATE JAWABAN
// ============================================================
//
// POST /kuesioner/jawaban
//
// Hanya untuk pengiriman pertama.
// ============================================================

export const createJawaban = (
  req: Request,
  res: Response
) =>
  saveAnswers(
    req,
    res,
    'Jawaban kuesioner berhasil dikirim'
  )

// ============================================================
// UPDATE JAWABAN
// ============================================================
//
// Endpoint dipertahankan agar route lama tidak rusak.
//
// Namun karena saveAnswers hanya menerima
// pengajuan dengan status DRAFT, setelah submit
// endpoint ini otomatis tidak dapat digunakan
// untuk mengubah jawaban.
// ============================================================

export const updateJawaban = (
  req: Request,
  res: Response
) =>
  saveAnswers(
    req,
    res,
    'Jawaban kuesioner berhasil diperbarui'
  )