import type {
  Request,
  Response,
} from 'express'

import {
  PengajuanStatus,
  VerifikasiStatus,
  Role,
  StatusPenugasan,
} from '@prisma/client'

import bcrypt from 'bcryptjs'

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
// AUTH HELPER
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
// INCLUDE MUSTAHIK
// ============================================================

const mustahikInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  },

  pengajuan: {
    include: {
      jawaban: {
        include: {
          indikator: {
            include: {
              kriteria: true,
            },
          },
        },

        orderBy: {
          createdAt:
            'asc' as const,
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
            'desc' as const,
        },
      },

      topsisResults: {
        include: {
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
            'desc' as const,
        },
      },
    },

    orderBy: {
      createdAt:
        'desc' as const,
    },
  },

  penugasanSurvei: {
    include: {
      pelaksana: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

export async function getAdminDashboard(
  req: Request,
  res: Response
) {
  try {
    const [
      totalMustahik,
      pengajuanBaru,
      menungguVerifikasi,
      lolosVerifikasi,
      layakDidanai,
      tidakDidanai,
    ] =
      await Promise.all([
        prisma.mustahik.count(),

        prisma.pengajuan.count({
          where: {
            status:
              PengajuanStatus.DRAFT,
          },
        }),

        prisma.pengajuan.count({
          where: {
            status:
              PengajuanStatus.MENUNGGU_VERIFIKASI,
          },
        }),

        prisma.pengajuan.count({
          where: {
            status:
              PengajuanStatus.LOLOS_VERIFIKASI,
          },
        }),

        prisma.pengajuan.count({
          where: {
            status:
              PengajuanStatus.LAYAK_DIDANAI,
          },
        }),

        prisma.pengajuan.count({
          where: {
            status:
              PengajuanStatus.TIDAK_DIDANAI,
          },
        }),
      ])

    return success(
      res,
      'Dashboard admin berhasil diambil',
      {
        totalMustahik,
        pengajuanBaru,
        menungguVerifikasi,
        lolosVerifikasi,
        layakDidanai,
        tidakDidanai,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'ADMIN DASHBOARD ERROR:',
      error
    )

    return fail(
      res,
      'Gagal mengambil dashboard admin',
      500
    )
  }
}


// ============================================================
// CREATE MUSTAHIK (OLEH ADMIN)
// ============================================================

export async function createMustahik(
  req: Request,
  res: Response
) {
  try {
    const adminId = getAdminId(req)

    const body = (req.body || {}) as Record<string, unknown>

    const nik = String(body.nik || '').trim()
    const namaLengkap = String(body.namaLengkap || '').trim()

    if (!nik || !namaLengkap) {
      return fail(res, 'NIK dan nama lengkap wajib diisi', 422)
    }

    if (!/^\d{16}$/.test(nik)) {
      return fail(res, 'NIK harus terdiri dari 16 digit angka', 422)
    }

    if (namaLengkap.length < 3) {
      return fail(res, 'Nama lengkap minimal 3 karakter', 422)
    }

    const existingNik = await prisma.mustahik.findUnique({
      where: { nik },
    })

    if (existingNik) {
      return fail(res, 'NIK sudah terdaftar dalam sistem', 409)
    }

    const pelaksanaId = body.pelaksanaId ? String(body.pelaksanaId).trim() : null
    if (pelaksanaId) {
      const pelaksanaUser = await prisma.user.findUnique({
        where: { id: pelaksanaId },
      })
      if (!pelaksanaUser || pelaksanaUser.role !== Role.PELAKSANA) {
        return fail(res, 'Pelaksana yang dipilih tidak valid atau bukan role pelaksana', 422)
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdMustahik = await tx.mustahik.create({
        data: {
          nik,
          namaLengkap,
          tempatLahir: body.tempatLahir ? String(body.tempatLahir).trim() : null,
          tanggalLahir: body.tanggalLahir ? new Date(String(body.tanggalLahir)) : null,
          jenisKelamin: body.jenisKelamin ? String(body.jenisKelamin).trim() : null,
          alamat: body.alamat ? String(body.alamat).trim() : null,
          kelurahan: body.kelurahan ? String(body.kelurahan).trim() : null,
          kecamatan: body.kecamatan ? String(body.kecamatan).trim() : null,
          kota: body.kota ? String(body.kota).trim() : null,
          provinsi: body.provinsi ? String(body.provinsi).trim() : null,
          noHp: body.noHp ? String(body.noHp).trim() : null,
          statusPernikahan: body.statusPernikahan ? String(body.statusPernikahan).trim() : null,
          pekerjaan: body.pekerjaan ? String(body.pekerjaan).trim() : null,
          penghasilan:
            body.penghasilan !== undefined && body.penghasilan !== null && body.penghasilan !== ''
              ? Number(body.penghasilan)
              : null,
          jumlahTanggungan:
            body.jumlahTanggungan !== undefined && body.jumlahTanggungan !== null && body.jumlahTanggungan !== ''
              ? Number(body.jumlahTanggungan)
              : null,
          statusRumah: body.statusRumah ? String(body.statusRumah).trim() : null,
          kondisiRumah: body.kondisiRumah ? String(body.kondisiRumah).trim() : null,
          kepemilikanAset: body.kepemilikanAset ? String(body.kepemilikanAset).trim() : null,
        },
      })

      const createdPengajuan = await tx.pengajuan.create({
        data: {
          mustahikId: createdMustahik.id,
          status: PengajuanStatus.DRAFT,
          catatan: 'Didaftarkan oleh admin untuk survei lapangan',
        },
      })

      let penugasan = null
      if (pelaksanaId) {
        penugasan = await tx.penugasanSurvei.create({
          data: {
            mustahikId: createdMustahik.id,
            pelaksanaId,
            status: StatusPenugasan.DITUGASKAN,
            catatan: body.catatanPenugasan ? String(body.catatanPenugasan).trim() : null,
            tanggalDitugaskan: new Date(),
          },
          include: {
            pelaksana: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        })
      }

      if (adminId) {
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'CREATE_MUSTAHIK',
            entity: 'Mustahik',
            entityId: createdMustahik.id,
            metadata: {
              nik: createdMustahik.nik,
              namaLengkap: createdMustahik.namaLengkap,
              pengajuanId: createdPengajuan.id,
              pelaksanaId,
            },
          },
        })
      }

      return {
        mustahik: createdMustahik,
        pengajuan: createdPengajuan,
        penugasan,
      }
    })

    return success(res, 'Calon mustahik berhasil didaftarkan', result, 201)
  } catch (error: any) {
    console.error('CREATE MUSTAHIK ERROR:', error)
    if (error?.code === 'P2002') {
      return fail(res, 'NIK sudah terdaftar', 409)
    }
    return fail(res, 'Gagal mendaftarkan calon mustahik', 500)
  }
}


// ============================================================
// GET MUSTAHIK
// ============================================================

export async function getMustahik(
  req: Request,
  res: Response
) {
  try {
    const search =
      String(
        req.query.search ||
        ''
      ).trim()

    const mustahik =
      await prisma.mustahik.findMany({
        where:
          search
            ? {
                OR: [
                  {
                    namaLengkap: {
                      contains: search,
                    },
                  },

                  {
                    nik: {
                      contains: search,
                    },
                  },

                  {
                    user: {
                      email: {
                        contains: search,
                      },
                    },
                  },
                ],
              }
            : undefined,

        include:
          mustahikInclude,

        orderBy: {
          createdAt:
            'desc',
        },
      })

    return success(
      res,
      'Data mustahik berhasil diambil',
      {
        mustahik,
        total:
          mustahik.length,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'GET MUSTAHIK ERROR:',
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
// GET DETAIL MUSTAHIK
// ============================================================

export async function getMustahikById(
  req: Request,
  res: Response
) {
  try {
    const {
      id,
    } = req.params

    const mustahik =
      await prisma.mustahik.findUnique({
        where: {
          id,
        },

        include:
          mustahikInclude,
      })

    if (
      !mustahik
    ) {
      return fail(
        res,
        'Data mustahik tidak ditemukan',
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
  } catch (
    error
  ) {
    console.error(
      'GET DETAIL MUSTAHIK ERROR:',
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
    const adminId =
      getAdminId(req)

    const {
      id,
    } = req.params

    const existing =
      await prisma.mustahik.findUnique({
        where: {
          id,
        },
      })

    if (
      !existing
    ) {
      return fail(
        res,
        'Data mustahik tidak ditemukan',
        404
      )
    }

    const body =
      (
        req.body ||
        {}
      ) as Record<
        string,
        unknown
      >

    const updated =
      await prisma.mustahik.update({
        where: {
          id,
        },

        data: {
          nik:
            body.nik !== undefined
              ? String(body.nik).trim()
              : undefined,

          namaLengkap:
            body.namaLengkap !== undefined
              ? String(body.namaLengkap).trim()
              : undefined,

          tempatLahir:
            body.tempatLahir !== undefined
              ? String(body.tempatLahir)
              : undefined,

          tanggalLahir:
            body.tanggalLahir
              ? new Date(
                  String(
                    body.tanggalLahir
                  )
                )
              : undefined,

          jenisKelamin:
            body.jenisKelamin !== undefined
              ? String(body.jenisKelamin)
              : undefined,

          alamat:
            body.alamat !== undefined
              ? String(body.alamat)
              : undefined,

          kelurahan:
            body.kelurahan !== undefined
              ? String(body.kelurahan)
              : undefined,

          kecamatan:
            body.kecamatan !== undefined
              ? String(body.kecamatan)
              : undefined,

          kota:
            body.kota !== undefined
              ? String(body.kota)
              : undefined,

          provinsi:
            body.provinsi !== undefined
              ? String(body.provinsi)
              : undefined,

          noHp:
            body.noHp !== undefined
              ? String(body.noHp)
              : undefined,

          statusPernikahan:
            body.statusPernikahan !== undefined
              ? String(body.statusPernikahan)
              : undefined,

          pekerjaan:
            body.pekerjaan !== undefined
              ? String(body.pekerjaan)
              : undefined,

          penghasilan:
            body.penghasilan !== undefined &&
            body.penghasilan !== null &&
            body.penghasilan !== ''
              ? Number(
                  body.penghasilan
                )
              : undefined,

          jumlahTanggungan:
            body.jumlahTanggungan !== undefined &&
            body.jumlahTanggungan !== null &&
            body.jumlahTanggungan !== ''
              ? Number(
                  body.jumlahTanggungan
                )
              : undefined,

          statusRumah:
            body.statusRumah !== undefined
              ? String(body.statusRumah)
              : undefined,

          kondisiRumah:
            body.kondisiRumah !== undefined
              ? String(body.kondisiRumah)
              : undefined,

          kepemilikanAset:
            body.kepemilikanAset !== undefined
              ? String(body.kepemilikanAset)
              : undefined,
        },

        include:
          mustahikInclude,
      })

    if (
      adminId
    ) {
      await prisma.auditLog.create({
        data: {
          userId:
            adminId,

          action:
            'UPDATE_MUSTAHIK',

          entity:
            'Mustahik',

          entityId:
            id,
        },
      })
    }

    return success(
      res,
      'Data mustahik berhasil diperbarui',
      {
        mustahik:
          updated,
      }
    )
  } catch (
    error: any
  ) {
    console.error(
      'UPDATE MUSTAHIK ERROR:',
      error
    )

    if (
      error?.code ===
      'P2002'
    ) {
      return fail(
        res,
        'NIK sudah digunakan',
        409
      )
    }

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
    const adminId =
      getAdminId(req)

    const {
      id,
    } = req.params

    const mustahik =
      await prisma.mustahik.findUnique({
        where: {
          id,
        },
      })

    if (
      !mustahik
    ) {
      return fail(
        res,
        'Data mustahik tidak ditemukan',
        404
      )
    }

    await prisma.mustahik.delete({
      where: {
        id,
      },
    })

    if (
      adminId
    ) {
      await prisma.auditLog.create({
        data: {
          userId:
            adminId,

          action:
            'DELETE_MUSTAHIK',

          entity:
            'Mustahik',

          entityId:
            id,
        },
      })
    }

    return success(
      res,
      'Data mustahik berhasil dihapus'
    )
  } catch (
    error
  ) {
    console.error(
      'DELETE MUSTAHIK ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menghapus data mustahik',
      500
    )
  }
}


// ============================================================
// GET VERIFIKASI
// ============================================================

export async function getVerifikasi(
  req: Request,
  res: Response
) {
  try {
    const verifikasi =
      await prisma.pengajuan.findMany({
        where: {
          status: {
            in: [
              PengajuanStatus.MENUNGGU_VERIFIKASI,
              PengajuanStatus.SEDANG_DIVERIFIKASI,
              PengajuanStatus.PERLU_PERBAIKAN,
              PengajuanStatus.LOLOS_VERIFIKASI,
              PengajuanStatus.DITOLAK,
            ],
          },
        },

        include: {
          mustahik: true,

          jawaban: {
            include: {
              indikator: {
                include: {
                  kriteria: true,
                },
              },
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

        orderBy: {
          createdAt:
            'desc',
        },
      })

    return success(
      res,
      'Data verifikasi berhasil diambil',
      {
        verifikasi,
        total:
          verifikasi.length,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'GET VERIFIKASI ERROR:',
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
// GET DETAIL VERIFIKASI
// ============================================================

export async function getVerifikasiById(
  req: Request,
  res: Response
) {
  try {
    const {
      id,
    } = req.params

    const pengajuan =
      await prisma.pengajuan.findUnique({
        where: {
          id,
        },

        include: {
          mustahik: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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

          topsisResults: {
            include: {
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

    return success(
      res,
      'Detail verifikasi berhasil diambil',
      {
        pengajuan,
      }
    )
  } catch (
    error
  ) {
    console.error(
      'GET DETAIL VERIFIKASI ERROR:',
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
// CREATE VERIFIKASI
// ============================================================

export async function createVerifikasi(
  req: Request,
  res: Response
) {
  try {
    const adminId =
      getAdminId(req)

    if (
      !adminId
    ) {
      return fail(
        res,
        'Admin belum terautentikasi',
        401
      )
    }

    const {
      id,
    } = req.params

    const body =
      req.body ||
      {}

    const status =
      String(
        body.status ||
        ''
      ).toUpperCase()

    const catatan =
      body.catatan
        ? String(body.catatan)
        : null

    if (
      ![
        VerifikasiStatus.LOLOS,
        VerifikasiStatus.PERLU_PERBAIKAN,
        VerifikasiStatus.DITOLAK,
      ].includes(
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
          id,
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

    let pengajuanStatus:
      PengajuanStatus

    if (
      status ===
      VerifikasiStatus.LOLOS
    ) {
      pengajuanStatus =
        PengajuanStatus.LOLOS_VERIFIKASI
    } else if (
      status ===
      VerifikasiStatus.PERLU_PERBAIKAN
    ) {
      pengajuanStatus =
        PengajuanStatus.PERLU_PERBAIKAN
    } else {
      pengajuanStatus =
        PengajuanStatus.DITOLAK
    }

    const result =
      await prisma.$transaction(
        async (
          tx
        ) => {
          const verifikasi =
            await tx.verifikasi.create({
              data: {
                pengajuanId:
                  id,

                adminId,

                status:
                  status as VerifikasiStatus,

                catatan,
              },

              include: {
                admin: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            })

          await tx.pengajuan.update({
            where: {
              id,
            },

            data: {
              status:
                pengajuanStatus,

              catatan,

              tanggalVerifikasi:
                new Date(),
            },
          })

          await tx.auditLog.create({
            data: {
              userId:
                adminId,

              action:
                'CREATE_VERIFIKASI',

              entity:
                'Pengajuan',

              entityId:
                id,

              metadata: {
                status,
                pengajuanStatus,
              },
            },
          })

          return verifikasi
        }
      )

    return success(
      res,
      'Verifikasi berhasil disimpan',
      {
        verifikasi:
          result,
      },
      201
    )
  } catch (
    error
  ) {
    console.error(
      'CREATE VERIFIKASI ERROR:',
      error
    )

    return fail(
      res,
      'Gagal menyimpan verifikasi',
      500
    )
  }
}

// ============================================================
// MANAJEMEN AKUN PELAKSANA
// ============================================================

// GET SEMUA PELAKSANA
export async function getPelaksana(
  req: Request,
  res: Response
) {
  try {
    const pelaksana = await prisma.user.findMany({
      where: {
        role: Role.PELAKSANA,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        penugasanSurvei: {
          select: {
            id: true,
            status: true,
            mustahik: {
              select: {
                id: true,
                namaLengkap: true,
                nik: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return success(
      res,
      'Data pelaksana berhasil diambil',
      {
        pelaksana,
        total: pelaksana.length,
      }
    );
  } catch (error) {
    console.error('GET PELAKSANA ERROR:', error);

    return fail(
      res,
      'Gagal mengambil data pelaksana',
      500
    );
  }
}


// CREATE AKUN PELAKSANA
export async function createPelaksana(
  req: Request,
  res: Response
) {
  try {
    const adminId = getAdminId(req);

    const body = req.body || {};

    const name = String(body.name || '').trim();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const phone = body.phone
      ? String(body.phone).trim()
      : null;
    const password = String(body.password || '');

    if (!name || !email || !password) {
      return fail(
        res,
        'Nama, email, dan password wajib diisi',
        422
      );
    }

    if (password.length < 8) {
      return fail(
        res,
        'Password minimal 8 karakter',
        422
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return fail(
        res,
        'Email sudah terdaftar',
        409
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const pelaksana = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: Role.PELAKSANA,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (adminId) {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'CREATE_PELAKSANA',
          entity: 'User',
          entityId: pelaksana.id,
          metadata: {
            name: pelaksana.name,
            email: pelaksana.email,
            role: pelaksana.role,
          },
        },
      });
    }

    return success(
      res,
      'Akun pelaksana berhasil dibuat',
      {
        pelaksana,
      },
      201
    );
  } catch (error: any) {
    console.error('CREATE PELAKSANA ERROR:', error);

    if (error?.code === 'P2002') {
      return fail(
        res,
        'Email sudah digunakan',
        409
      );
    }

    return fail(
      res,
      'Gagal membuat akun pelaksana',
      500
    );
  }
}


// UPDATE AKUN PELAKSANA
export async function updatePelaksana(
  req: Request,
  res: Response
) {
  try {
    const adminId = getAdminId(req);
    const { id } = req.params;
    const body = req.body || {};

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return fail(
        res,
        'Akun pelaksana tidak ditemukan',
        404
      );
    }

    if (existingUser.role !== Role.PELAKSANA) {
      return fail(
        res,
        'Akun ini bukan akun pelaksana',
        400
      );
    }

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : undefined;

    const email =
      body.email !== undefined
        ? String(body.email).trim().toLowerCase()
        : undefined;

    const phone =
      body.phone !== undefined
        ? body.phone
          ? String(body.phone).trim()
          : null
        : undefined;

    if (name !== undefined && !name) {
      return fail(
        res,
        'Nama tidak boleh kosong',
        422
      );
    }

    if (email !== undefined && !email) {
      return fail(
        res,
        'Email tidak boleh kosong',
        422
      );
    }

    if (email && email !== existingUser.email) {
      const emailUsed = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (emailUsed) {
        return fail(
          res,
          'Email sudah digunakan akun lain',
          409
        );
      }
    }

    const data: {
      name?: string;
      email?: string;
      phone?: string | null;
      passwordHash?: string;
    } = {
      name,
      email,
      phone,
    };

    // Password hanya diubah jika admin mengisi password baru.
    if (body.password) {
      const password = String(body.password);

      if (password.length < 8) {
        return fail(
          res,
          'Password baru minimal 8 karakter',
          422
        );
      }

      data.passwordHash = await bcrypt.hash(
        password,
        12
      );
    }

    const pelaksana = await prisma.user.update({
      where: {
        id,
      },

      data,

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (adminId) {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'UPDATE_PELAKSANA',
          entity: 'User',
          entityId: id,
          metadata: {
            name: pelaksana.name,
            email: pelaksana.email,
          },
        },
      });
    }

    return success(
      res,
      'Akun pelaksana berhasil diperbarui',
      {
        pelaksana,
      }
    );
  } catch (error: any) {
    console.error('UPDATE PELAKSANA ERROR:', error);

    if (error?.code === 'P2002') {
      return fail(
        res,
        'Email sudah digunakan',
        409
      );
    }

    return fail(
      res,
      'Gagal memperbarui akun pelaksana',
      500
    );
  }
}


// DELETE AKUN PELAKSANA
export async function deletePelaksana(
  req: Request,
  res: Response
) {
  try {
    const adminId = getAdminId(req);
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        penugasanSurvei: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingUser) {
      return fail(
        res,
        'Akun pelaksana tidak ditemukan',
        404
      );
    }

    if (existingUser.role !== Role.PELAKSANA) {
      return fail(
        res,
        'Akun ini bukan akun pelaksana',
        400
      );
    }

    // Jangan hapus akun yang masih memiliki riwayat penugasan.
    // Ini menjaga relasi dan riwayat survei tetap aman.
    if (existingUser.penugasanSurvei.length > 0) {
      return fail(
        res,
        'Pelaksana masih memiliki riwayat penugasan. Pindahkan penugasan terlebih dahulu.',
        409,
        {
          jumlahPenugasan:
            existingUser.penugasanSurvei.length,
        }
      );
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    if (adminId) {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'DELETE_PELAKSANA',
          entity: 'User',
          entityId: id,
          metadata: {
            name: existingUser.name,
            email: existingUser.email,
          },
        },
      });
    }

    return success(
      res,
      'Akun pelaksana berhasil dihapus'
    );
  } catch (error: any) {
    console.error('DELETE PELAKSANA ERROR:', error);

    if (error?.code === 'P2003') {
      return fail(
        res,
        'Akun pelaksana masih terhubung dengan data lain',
        409
      );
    }

    return fail(
      res,
      'Gagal menghapus akun pelaksana',
      500
    );
  }
}

// ============================================================
// MANAJEMEN PENUGASAN SURVEI (ADMIN)
// ============================================================

// 1. GET ALL PENUGASAN
export async function getPenugasan(req: Request, res: Response) {
  try {
    const statusQuery = req.query.status ? String(req.query.status).toUpperCase() : undefined
    const pelaksanaIdQuery = req.query.pelaksanaId ? String(req.query.pelaksanaId) : undefined
    const search = req.query.search ? String(req.query.search).trim() : ''

    const where: any = {}

    if (statusQuery && Object.values(StatusPenugasan).includes(statusQuery as StatusPenugasan)) {
      where.status = statusQuery as StatusPenugasan
    }

    if (pelaksanaIdQuery) {
      where.pelaksanaId = pelaksanaIdQuery
    }

    if (search) {
      where.OR = [
        {
          mustahik: {
            namaLengkap: { contains: search },
          },
        },
        {
          mustahik: {
            nik: { contains: search },
          },
        },
        {
          pelaksana: {
            name: { contains: search },
          },
        },
      ]
    }

    const penugasan = await prisma.penugasanSurvei.findMany({
      where,
      include: {
        mustahik: {
          select: {
            id: true,
            nik: true,
            namaLengkap: true,
            noHp: true,
            alamat: true,
            kelurahan: true,
            kecamatan: true,
            kota: true,
            provinsi: true,
            pekerjaan: true,
            pengajuan: {
              select: {
                id: true,
                status: true,
                _count: {
                  select: { jawaban: true },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        pelaksana: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const stats = {
      total: penugasan.length,
      ditugaskan: penugasan.filter((p) => p.status === StatusPenugasan.DITUGASKAN).length,
      sedangSurvei: penugasan.filter((p) => p.status === StatusPenugasan.SEDANG_SURVEI).length,
      selesai: penugasan.filter((p) => p.status === StatusPenugasan.SELESAI).length,
      dibatalkan: penugasan.filter((p) => p.status === StatusPenugasan.DIBATALKAN).length,
    }

    return success(res, 'Daftar penugasan survei berhasil diambil', {
      penugasan,
      stats,
      total: penugasan.length,
    })
  } catch (error) {
    console.error('GET PENUGASAN ERROR:', error)
    return fail(res, 'Gagal mengambil data penugasan survei', 500)
  }
}

// 2. GET PENUGASAN BY ID
export async function getPenugasanById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const penugasan = await prisma.penugasanSurvei.findUnique({
      where: { id },
      include: {
        mustahik: {
          include: {
            pengajuan: {
              include: {
                jawaban: {
                  include: {
                    indikator: {
                      include: {
                        kriteria: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        pelaksana: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!penugasan) {
      return fail(res, 'Data penugasan survei tidak ditemukan', 404)
    }

    return success(res, 'Detail penugasan survei berhasil diambil', { penugasan })
  } catch (error) {
    console.error('GET PENUGASAN BY ID ERROR:', error)
    return fail(res, 'Gagal mengambil detail penugasan survei', 500)
  }
}

// 3. CREATE PENUGASAN
export async function createPenugasan(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req)
    const { mustahikId, pelaksanaId, catatan } = req.body || {}

    if (!mustahikId || !pelaksanaId) {
      return fail(res, 'Mustahik ID dan Pelaksana ID wajib diisi', 422)
    }

    const mustahik = await prisma.mustahik.findUnique({
      where: { id: String(mustahikId) },
      include: {
        pengajuan: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!mustahik) {
      return fail(res, 'Data calon mustahik tidak ditemukan', 404)
    }

    const pelaksana = await prisma.user.findUnique({
      where: { id: String(pelaksanaId) },
    })

    if (!pelaksana || pelaksana.role !== Role.PELAKSANA) {
      return fail(res, 'Akun pelaksana tidak valid atau bukan role pelaksana', 422)
    }

    const existingActive = await prisma.penugasanSurvei.findFirst({
      where: {
        mustahikId: String(mustahikId),
        status: {
          in: [StatusPenugasan.DITUGASKAN, StatusPenugasan.SEDANG_SURVEI],
        },
      },
      include: {
        pelaksana: {
          select: { name: true },
        },
      },
    })

    if (existingActive) {
      return fail(
        res,
        `Calon mustahik ini sudah memiliki penugasan aktif kepada pelaksana ${existingActive.pelaksana.name} dengan status ${existingActive.status}. Batalkan atau selesaikan penugasan lama terlebih dahulu.`,
        409
      )
    }

    // Pastikan calon mustahik memiliki minimal 1 pengajuan
    let pengajuanId = mustahik.pengajuan[0]?.id
    if (!pengajuanId) {
      const newPengajuan = await prisma.pengajuan.create({
        data: {
          mustahikId: mustahik.id,
          status: PengajuanStatus.DRAFT,
          catatan: 'Dibuat otomatis untuk penugasan survei',
        },
      })
      pengajuanId = newPengajuan.id
    }

    const penugasan = await prisma.penugasanSurvei.create({
      data: {
        mustahikId: String(mustahikId),
        pelaksanaId: String(pelaksanaId),
        catatan: catatan ? String(catatan).trim() : null,
        status: StatusPenugasan.DITUGASKAN,
        tanggalDitugaskan: new Date(),
      },
      include: {
        mustahik: {
          select: {
            id: true,
            nik: true,
            namaLengkap: true,
            noHp: true,
            alamat: true,
          },
        },
        pelaksana: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (adminId) {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'CREATE_PENUGASAN',
          entity: 'PenugasanSurvei',
          entityId: penugasan.id,
          metadata: {
            mustahikId: penugasan.mustahikId,
            pelaksanaId: penugasan.pelaksanaId,
            status: penugasan.status,
          },
        },
      })
    }

    return success(res, 'Penugasan survei berhasil dibuat', { penugasan }, 201)
  } catch (error) {
    console.error('CREATE PENUGASAN ERROR:', error)
    return fail(res, 'Gagal membuat penugasan survei', 500)
  }
}

// 4. UPDATE PENUGASAN
export async function updatePenugasan(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req)
    const { id } = req.params
    const { pelaksanaId, catatan, status } = req.body || {}

    const existing = await prisma.penugasanSurvei.findUnique({
      where: { id },
    })

    if (!existing) {
      return fail(res, 'Data penugasan survei tidak ditemukan', 404)
    }

    const dataToUpdate: any = {}

    if (pelaksanaId !== undefined) {
      const pelaksana = await prisma.user.findUnique({
        where: { id: String(pelaksanaId) },
      })
      if (!pelaksana || pelaksana.role !== Role.PELAKSANA) {
        return fail(res, 'Akun pelaksana tidak valid', 422)
      }
      dataToUpdate.pelaksanaId = String(pelaksanaId)
    }

    if (catatan !== undefined) {
      dataToUpdate.catatan = catatan ? String(catatan).trim() : null
    }

    if (status !== undefined) {
      const upperStatus = String(status).toUpperCase()
      if (!Object.values(StatusPenugasan).includes(upperStatus as StatusPenugasan)) {
        return fail(res, 'Status penugasan tidak valid', 422)
      }
      dataToUpdate.status = upperStatus as StatusPenugasan

      if (upperStatus === StatusPenugasan.SEDANG_SURVEI && !existing.tanggalMulai) {
        dataToUpdate.tanggalMulai = new Date()
      }
      if (upperStatus === StatusPenugasan.SELESAI && !existing.tanggalSelesai) {
        dataToUpdate.tanggalSelesai = new Date()
      }
    }

    const updated = await prisma.penugasanSurvei.update({
      where: { id },
      data: dataToUpdate,
      include: {
        mustahik: {
          select: {
            id: true,
            nik: true,
            namaLengkap: true,
          },
        },
        pelaksana: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (adminId) {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'UPDATE_PENUGASAN',
          entity: 'PenugasanSurvei',
          entityId: updated.id,
          metadata: {
            changes: dataToUpdate,
          },
        },
      })
    }

    return success(res, 'Penugasan survei berhasil diperbarui', { penugasan: updated })
  } catch (error) {
    console.error('UPDATE PENUGASAN ERROR:', error)
    return fail(res, 'Gagal memperbarui penugasan survei', 500)
  }
}

// 5. BATALKAN PENUGASAN
export async function batalPenugasan(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req)
    const { id } = req.params
    const { catatan } = req.body || {}

    const existing = await prisma.penugasanSurvei.findUnique({
      where: { id },
    })

    if (!existing) {
      return fail(res, 'Data penugasan survei tidak ditemukan', 404)
    }

    if (existing.status === StatusPenugasan.SELESAI) {
      return fail(res, 'Penugasan yang sudah selesai tidak dapat dibatalkan', 422)
    }

    const updated = await prisma.penugasanSurvei.update({
      where: { id },
      data: {
        status: StatusPenugasan.DIBATALKAN,
        catatan: catatan
          ? `${existing.catatan ? existing.catatan + ' | ' : ''}Alasan pembatalan: ${String(catatan).trim()}`
          : existing.catatan,
      },
      include: {
        mustahik: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        pelaksana: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (adminId) {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'CANCEL_PENUGASAN',
          entity: 'PenugasanSurvei',
          entityId: updated.id,
          metadata: {
            alasan: catatan || null,
          },
        },
      })
    }

    return success(res, 'Penugasan survei berhasil dibatalkan', { penugasan: updated })
  } catch (error) {
    console.error('BATAL PENUGASAN ERROR:', error)
    return fail(res, 'Gagal membatalkan penugasan survei', 500)
  }
}

// ============================================================
// ALIAS
// ============================================================

export const getAdminStats =
  getAdminDashboard

export const getAdminMustahik =
  getMustahik

export const getAdminMustahikById =
  getMustahikById

export const updateAdminMustahik =
  updateMustahik

export const deleteAdminMustahik =
  deleteMustahik

export const getVerifikasiList =
  getVerifikasi