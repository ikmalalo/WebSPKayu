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
// GET KUESIONER
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
          subKriteria: {
            orderBy: {
              nilai: 'asc',
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

async function validateAnswers(
  jawaban: Array<{
    kriteriaId: string
    subKriteriaId: string
  }>
) {
  // ----------------------------------------------------------
  // Ambil semua kriteria aktif
  // ----------------------------------------------------------

  const kriteria =
    await prisma.kriteria.findMany({
      where: {
        aktif: true,
      },

      select: {
        id: true,
      },
    })

  // ----------------------------------------------------------
  // Semua kriteria wajib dijawab
  // ----------------------------------------------------------

  const kriteriaIds =
    kriteria.map(
      (item) =>
        item.id
    )

  const answeredCriteria =
    jawaban.map(
      (item) =>
        item.kriteriaId
    )

  const missingCriteria =
    kriteriaIds.filter(
      (id) =>
        !answeredCriteria.includes(
          id
        )
    )

  if (
    missingCriteria.length >
    0
  ) {
    throw new Error(
      'Semua pertanyaan kuesioner wajib dijawab'
    )
  }

  // ----------------------------------------------------------
  // Tidak boleh ada duplikat kriteria
  // ----------------------------------------------------------

  const uniqueCriteria =
    new Set(
      answeredCriteria
    )

  if (
    uniqueCriteria.size !==
    answeredCriteria.length
  ) {
    throw new Error(
      'Terdapat jawaban kuesioner yang duplikat'
    )
  }

  // ----------------------------------------------------------
  // Ambil subkriteria
  // ----------------------------------------------------------

  const subKriteriaIds =
    jawaban.map(
      (item) =>
        item.subKriteriaId
    )

  const subs =
    await prisma.subKriteria.findMany(
      {
        where: {
          id: {
            in:
              subKriteriaIds,
          },
        },
      }
    )

  // ----------------------------------------------------------
  // Jumlah harus sama
  // ----------------------------------------------------------

  if (
    subs.length !==
    subKriteriaIds.length
  ) {
    throw new Error(
      'Terdapat subkriteria yang tidak valid'
    )
  }

  // ----------------------------------------------------------
  // Pastikan subkriteria memang milik kriteria
  // ----------------------------------------------------------

  for (
    const answer of jawaban
  ) {
    const sub =
      subs.find(
        (
          item
        ) =>
          item.id ===
          answer.subKriteriaId
      )

    if (
      !sub ||
      sub.kriteriaId !==
        answer.kriteriaId
    ) {
      throw new Error(
        'Subkriteria tidak sesuai dengan kriteria'
      )
    }
  }

  return {
    kriteria,
    subs,
  }
}

// ============================================================
// SIMPAN JAWABAN
// ============================================================
//
// PENTING:
//
// Fungsi ini hanya boleh dijalankan SATU KALI.
//
// Setelah pengajuan tidak lagi DRAFT,
// user tidak boleh mengirim kuesioner lagi.
//
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
    } =
      req.body as {
        pengajuanId?: string

        jawaban?: Array<{
          kriteriaId: string
          subKriteriaId: string
        }>
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
      jawaban.length ===
        0
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
      await prisma.pengajuan.findUnique(
        {
          where: {
            id:
              pengajuanId,
          },

          include: {
            jawaban: true,
          },
        }
      )

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
      req.auth!.userId
    ) {
      return fail(
        res,
        'Anda tidak memiliki akses ke pengajuan ini',
        403
      )
    }

    // ========================================================
    // 🔒 CEK PENGAJUAN SUDAH PERNAH DIKIRIM
    // ========================================================
    //
    // Status DRAFT = masih boleh mengisi.
    //
    // Selain DRAFT berarti proses sudah berjalan.
    //
    // Jadi user TIDAK BOLEH mengirim kuesioner lagi.
    //
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
    // 🔒 CEK DATABASE
    // ========================================================
    //
    // Walaupun status masih DRAFT karena kondisi tertentu,
    // jika jawaban sudah tersimpan lengkap, tetap jangan
    // mengizinkan submit ulang.
    //
    // ========================================================

    if (
      pengajuan.jawaban &&
      pengajuan.jawaban.length >
        0
    ) {
      return fail(
        res,
        'Kuesioner untuk pengajuan ini sudah pernah diisi.',
        409
      )
    }

    // ========================================================
    // VALIDASI JAWABAN
    // ========================================================

    let validated

    try {
      validated =
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

    const {
      subs,
    } = validated

    // ========================================================
    // SIMPAN DALAM SATU TRANSACTION
    // ========================================================

    await prisma.$transaction(
      async (
        tx
      ) => {

        // ----------------------------------------------------
        // Simpan semua jawaban
        // ----------------------------------------------------

        for (
          const item of jawaban
        ) {
          const sub =
            subs.find(
              (
                value
              ) =>
                value.id ===
                item.subKriteriaId
            )

          if (
            !sub
          ) {
            throw new Error(
              'Subkriteria tidak ditemukan'
            )
          }

          await tx.jawabanKuesioner.create(
            {
              data: {
                pengajuanId,
                kriteriaId:
                  item.kriteriaId,
                subKriteriaId:
                  item.subKriteriaId,
                nilai:
                  sub.nilai,
              },
            }
          )
        }

        // ----------------------------------------------------
        // Setelah semua jawaban tersimpan,
        // BARU ubah status.
        // ----------------------------------------------------

        await tx.pengajuan.update(
          {
            where: {
              id:
                pengajuanId,
            },

            data: {
              status:
                PengajuanStatus.MENUNGGU_VERIFIKASI,

              // Reset catatan lama ketika
              // pengajuan baru dikirim.
              catatan: null,
            },
          }
        )
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
// Endpoint:
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
// Endpoint ini sengaja tetap dipertahankan supaya route lama
// tidak rusak.
//
// Tetapi user TIDAK BOLEH menggunakannya untuk mengubah
// kuesioner setelah submit.
//
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