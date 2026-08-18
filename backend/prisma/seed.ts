import {
  PrismaClient,
  KriteriaTipe,
  Role,
} from '@prisma/client'

import bcrypt from 'bcryptjs'

const prisma =
  new PrismaClient()

type SeedCriterion = {
  kode: string
  nama: string
  bobot: number
  tipe: KriteriaTipe
  values: Array<
    [string, number]
  >
}

const criteria: SeedCriterion[] = [
  {
    kode: 'C1',
    nama: 'Penghasilan',
    bobot: 0.30,
    tipe: KriteriaTipe.COST,
    values: [
      ['< Rp 500.000', 1],
      [
        'Rp 500.001 - Rp 1.000.000',
        2,
      ],
      [
        'Rp 1.000.001 - Rp 1.500.000',
        3,
      ],
      [
        'Rp 1.500.001 - Rp 2.000.000',
        4,
      ],
      ['> Rp 2.000.000', 5],
    ],
  },

  {
    kode: 'C2',
    nama: 'Jumlah Tanggungan',
    bobot: 0.25,
    tipe: KriteriaTipe.BENEFIT,
    values: [
      ['1 orang', 1],
      ['2 orang', 2],
      ['3 orang', 3],
      ['4 orang', 4],
      ['≥ 5 orang', 5],
    ],
  },

  {
    kode: 'C3',
    nama: 'Kondisi Rumah',
    bobot: 0.20,
    tipe: KriteriaTipe.BENEFIT,
    values: [
      ['Sangat Baik', 1],
      ['Baik', 2],
      ['Cukup', 3],
      ['Buruk', 4],
      ['Sangat Buruk', 5],
    ],
  },

  {
    kode: 'C4',
    nama: 'Status Pekerjaan',
    bobot: 0.15,
    tipe: KriteriaTipe.BENEFIT,
    values: [
      ['PNS / BUMN', 1],
      ['Karyawan Swasta', 2],
      ['Wiraswasta', 3],
      ['Buruh / Harian', 4],
      ['Tidak Bekerja', 5],
    ],
  },

  {
    kode: 'C5',
    nama: 'Kepemilikan Aset',
    bobot: 0.10,
    tipe: KriteriaTipe.COST,
    values: [
      ['Memiliki banyak aset', 1],
      [
        'Memiliki beberapa aset',
        2,
      ],
      [
        'Memiliki sedikit aset',
        3,
      ],
      [
        'Hampir tidak memiliki aset',
        4,
      ],
      [
        'Tidak memiliki aset',
        5,
      ],
    ],
  },
]

async function seedKriteria() {
  console.log(
    'Memasukkan data kriteria...'
  )

  for (const item of criteria) {
    const kriteria =
      await prisma.kriteria.upsert({
        where: {
          kode: item.kode,
        },

        update: {
          nama: item.nama,
          bobot: item.bobot,
          tipe: item.tipe,
        },

        create: {
          kode: item.kode,
          nama: item.nama,
          bobot: item.bobot,
          tipe: item.tipe,
        },
      })

    for (const [
      nama,
      nilai,
    ] of item.values) {
      await prisma.subKriteria.upsert({
        where: {
          kriteriaId_nama: {
            kriteriaId:
              kriteria.id,
            nama,
          },
        },

        update: {
          nilai,
        },

        create: {
          kriteriaId:
            kriteria.id,
          nama,
          nilai,
        },
      })
    }
  }

  console.log(
    'Data kriteria berhasil.'
  )
}

async function seedAdmin() {
  console.log(
    'Membuat akun admin...'
  )

  const email =
    'ayu@spkmustahik.id'

  const password =
    'ayuadmin123'

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    )

  const admin =
    await prisma.user.upsert({
      where: {
        email,
      },

      update: {
        name: 'Ayu',
        passwordHash,
        role: Role.ADMIN,
      },

      create: {
        name: 'Ayu',
        email,
        passwordHash,
        role: Role.ADMIN,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

  console.log(
    'Admin berhasil dibuat:'
  )

  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  })
}

async function main() {
  await seedKriteria()

  await seedAdmin()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(
      'SEED ERROR:',
      error
    )

    await prisma.$disconnect()

    process.exit(1)
  })