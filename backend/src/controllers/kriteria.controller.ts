import type {
  Request,
  Response,
} from 'express'

import {
  KriteriaTipe,
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

type KriteriaInput = {
  kode: string
  nama: string
  bobot: number
  tipe: KriteriaTipe
  deskripsi: string | null
  aktif?: boolean
  dimensi: string
  urutan: number
}


// ============================================================
// PARSE KRITERIA
// ============================================================

function parseKriteria(
  body: Record<string, unknown>
): KriteriaInput {
  return {
    kode:
      String(
        body.kode || ''
      )
        .trim()
        .toUpperCase(),

    nama:
      String(
        body.nama || ''
      ).trim(),

    bobot:
      Number(
        body.bobot
      ),

    tipe:
      String(
        body.tipe || ''
      )
        .trim()
        .toUpperCase() as KriteriaTipe,

    deskripsi:
      body.deskripsi
        ? String(
            body.deskripsi
          ).trim()
        : null,

    aktif:
      body.aktif === undefined
        ? undefined
        : Boolean(
            body.aktif
          ),

    dimensi:
      String(
        body.dimensi || ''
      ).trim(),

    urutan:
      Number(
        body.urutan
      ),
  }
}


// ============================================================
// VALIDASI KRITERIA
// ============================================================

function validKriteria(
  data: KriteriaInput
): boolean {
  return Boolean(
    data.kode &&
    data.nama &&
    data.dimensi &&
    Number.isFinite(
      data.bobot
    ) &&
    data.bobot > 0 &&
    Number.isFinite(
      data.urutan
    ) &&
    data.urutan > 0 &&
    Number.isInteger(
      data.urutan
    ) &&
    Object.values(
      KriteriaTipe
    ).includes(
      data.tipe
    )
  )
}


// ============================================================
// LIST KRITERIA
// ============================================================

export async function listKriteria(
  _req: Request,
  res: Response
) {
  try {
    const kriteria =
      await prisma.kriteria.findMany({
        include: {
          indikator: {
            orderBy: {
              urutan: 'asc',
            },
          },

          subKriteria: {
            orderBy: {
              nilai: 'asc',
            },
          },
        },

        orderBy: [
          {
            urutan: 'asc',
          },
          {
            kode: 'asc',
          },
        ],
      })

    return success(
      res,
      'Kriteria berhasil diambil',
      {
        kriteria,
      }
    )
  } catch (error) {
    console.error(
      'LIST KRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil data kriteria',
      500
    )
  }
}


// ============================================================
// CREATE KRITERIA
// ============================================================

export async function createKriteria(
  req: Request,
  res: Response
) {
  try {
    const data =
      parseKriteria(
        req.body
      )

    if (
      !validKriteria(
        data
      )
    ) {
      return fail(
        res,
        'Data kriteria tidak valid',
        422
      )
    }

    const kriteria =
      await prisma.kriteria.create({
        data: {
          kode:
            data.kode,

          nama:
            data.nama,

          bobot:
            data.bobot,

          tipe:
            data.tipe,

          deskripsi:
            data.deskripsi,

          aktif:
            data.aktif ??
            true,

          dimensi:
            data.dimensi,

          urutan:
            data.urutan,
        },
      })

    return success(
      res,
      'Kriteria berhasil dibuat',
      {
        kriteria,
      },
      201
    )
  } catch (error) {
    console.error(
      'CREATE KRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal membuat kriteria',
      500
    )
  }
}


// ============================================================
// UPDATE KRITERIA
// ============================================================

export async function updateKriteria(
  req: Request,
  res: Response
) {
  try {
    const current =
      await prisma.kriteria.findUnique({
        where: {
          id:
            req.params.id,
        },
      })

    if (!current) {
      return fail(
        res,
        'Kriteria tidak ditemukan',
        404
      )
    }

    const data =
      parseKriteria({
        ...current,
        ...req.body,
      })

    data.aktif =
      req.body.aktif === undefined
        ? current.aktif
        : Boolean(
            req.body.aktif
          )

    if (
      !validKriteria(
        data
      )
    ) {
      return fail(
        res,
        'Data kriteria tidak valid',
        422
      )
    }

    const kriteria =
      await prisma.kriteria.update({
        where: {
          id:
            current.id,
        },

        data: {
          kode:
            data.kode,

          nama:
            data.nama,

          bobot:
            data.bobot,

          tipe:
            data.tipe,

          deskripsi:
            data.deskripsi,

          aktif:
            data.aktif,

          dimensi:
            data.dimensi,

          urutan:
            data.urutan,
        },
      })

    return success(
      res,
      'Kriteria berhasil diperbarui',
      {
        kriteria,
      }
    )
  } catch (error) {
    console.error(
      'UPDATE KRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal memperbarui kriteria',
      500
    )
  }
}


// ============================================================
// DELETE KRITERIA
// ============================================================

export async function deleteKriteria(
  req: Request,
  res: Response
) {
  try {
    const current =
      await prisma.kriteria.findUnique({
        where: {
          id:
            req.params.id,
        },
      })

    if (!current) {
      return fail(
        res,
        'Kriteria tidak ditemukan',
        404
      )
    }

    await prisma.kriteria.delete({
      where: {
        id:
          current.id,
      },
    })

    return success(
      res,
      'Kriteria berhasil dihapus'
    )
  } catch (error) {
    console.error(
      'DELETE KRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menghapus kriteria',
      500
    )
  }
}


// ============================================================
// LIST SUBKRITERIA
// ============================================================

export async function listSubKriteria(
  req: Request,
  res: Response
) {
  try {
    const where =
      req.query.kriteriaId
        ? {
            kriteriaId:
              String(
                req.query.kriteriaId
              ),
          }
        : {}

    const subKriteria =
      await prisma.subKriteria.findMany({
        where,

        include: {
          kriteria: true,
        },

        orderBy: [
          {
            kriteriaId: 'asc',
          },
          {
            nilai: 'asc',
          },
        ],
      })

    return success(
      res,
      'Subkriteria berhasil diambil',
      {
        subKriteria,
      }
    )
  } catch (error) {
    console.error(
      'LIST SUBKRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil subkriteria',
      500
    )
  }
}


// ============================================================
// CREATE SUBKRITERIA
// ============================================================

export async function createSubKriteria(
  req: Request,
  res: Response
) {
  try {
    const {
      kriteriaId,
      nama,
      nilai,
      keterangan,
    } = req.body

    if (
      !kriteriaId ||
      !nama ||
      !Number.isFinite(
        Number(
          nilai
        )
      )
    ) {
      return fail(
        res,
        'Data subkriteria tidak valid',
        422
      )
    }

    const subKriteria =
      await prisma.subKriteria.create({
        data: {
          kriteriaId:
            String(
              kriteriaId
            ),

          nama:
            String(
              nama
            ),

          nilai:
            Number(
              nilai
            ),

          keterangan:
            keterangan
              ? String(
                  keterangan
                )
              : null,
        },
      })

    return success(
      res,
      'Subkriteria berhasil dibuat',
      {
        subKriteria,
      },
      201
    )
  } catch (error) {
    console.error(
      'CREATE SUBKRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal membuat subkriteria',
      500
    )
  }
}


// ============================================================
// UPDATE SUBKRITERIA
// ============================================================

export async function updateSubKriteria(
  req: Request,
  res: Response
) {
  try {
    const current =
      await prisma.subKriteria.findUnique({
        where: {
          id:
            req.params.id,
        },
      })

    if (!current) {
      return fail(
        res,
        'Subkriteria tidak ditemukan',
        404
      )
    }

    const {
      nama,
      nilai,
      keterangan,
    } = req.body

    if (
      !nama ||
      !Number.isFinite(
        Number(
          nilai
        )
      )
    ) {
      return fail(
        res,
        'Data subkriteria tidak valid',
        422
      )
    }

    const subKriteria =
      await prisma.subKriteria.update({
        where: {
          id:
            current.id,
        },

        data: {
          nama:
            String(
              nama
            ),

          nilai:
            Number(
              nilai
            ),

          keterangan:
            keterangan
              ? String(
                  keterangan
                )
              : null,
        },
      })

    return success(
      res,
      'Subkriteria berhasil diperbarui',
      {
        subKriteria,
      }
    )
  } catch (error) {
    console.error(
      'UPDATE SUBKRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal memperbarui subkriteria',
      500
    )
  }
}


// ============================================================
// DELETE SUBKRITERIA
// ============================================================

export async function deleteSubKriteria(
  req: Request,
  res: Response
) {
  try {
    await prisma.subKriteria.delete({
      where: {
        id:
          req.params.id,
      },
    })

    return success(
      res,
      'Subkriteria berhasil dihapus'
    )
  } catch (error) {
    console.error(
      'DELETE SUBKRITERIA ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menghapus subkriteria',
      500
    )
  }
}