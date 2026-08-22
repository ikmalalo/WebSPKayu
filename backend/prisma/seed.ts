import {
  PrismaClient,
  KriteriaTipe,
  IndikatorTipe,
  Role,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('========================================')
  console.log('MEMULAI SEED DATA TOPSIS...')
  console.log('========================================')

  /*
   * Hapus data lama berdasarkan urutan relasi.
   *
   * JawabanKuesioner bergantung pada:
   * - Indikator
   * - SubKriteria
   * - Kriteria
   *
   * Maka JawabanKuesioner harus dihapus terlebih dahulu.
   */

  console.log('Menghapus jawaban kuesioner lama...')
  await prisma.jawabanKuesioner.deleteMany()

  console.log('Menghapus indikator lama...')
  await prisma.indikator.deleteMany()

  console.log('Menghapus subkriteria lama...')
  await prisma.subKriteria.deleteMany()

  /*
   * TopsisDetail bergantung pada Kriteria.
   *
   * Hapus terlebih dahulu sebelum Kriteria.
   */

  console.log('Menghapus detail TOPSIS lama...')
  await prisma.topsisDetail.deleteMany()

  console.log('Menghapus hasil TOPSIS lama...')
  await prisma.topsisResult.deleteMany()

  console.log('Menghapus kriteria lama...')
  await prisma.kriteria.deleteMany()

  console.log('========================================')
  console.log('MEMBUAT DATA KRITERIA BARU...')
  console.log('========================================')

  /*
   * C1
   * Hifzh ad-Din
   * Bobot 12%
   */

  await prisma.kriteria.create({
    data: {
      kode: 'C1',
      nama: 'Hifzh ad-Din',
      bobot: 0.12,
      tipe: KriteriaTipe.BENEFIT,
      deskripsi: 'Kriteria Hifzh ad-Din',
      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID1',
            nama: 'Indikator ID1',
            deskripsi: 'Indikator ID1 pada Hifzh ad-Din',
            tipe: IndikatorTipe.POSITIF,
            urutan: 1,
            aktif: true,
          },
          {
            kode: 'ID2',
            nama: 'Indikator ID2',
            deskripsi: 'Indikator ID2 pada Hifzh ad-Din',
            tipe: IndikatorTipe.POSITIF,
            urutan: 2,
            aktif: true,
          },
          {
            kode: 'ID3',
            nama: 'Indikator ID3',
            deskripsi: 'Indikator ID3 pada Hifzh ad-Din',
            tipe: IndikatorTipe.POSITIF,
            urutan: 3,
            aktif: true,
          },
        ],
      },
    },
  })

  /*
   * C2
   * Hifzh an-Nafs
   * Bobot 25%
   */

  await prisma.kriteria.create({
    data: {
      kode: 'C2',
      nama: 'Hifzh an-Nafs',
      bobot: 0.25,
      tipe: KriteriaTipe.BENEFIT,
      deskripsi: 'Kriteria Hifzh an-Nafs',
      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID4',
            nama: 'Indikator ID4',
            deskripsi: 'Indikator ID4 pada Hifzh an-Nafs',
            tipe: IndikatorTipe.POSITIF,
            urutan: 4,
            aktif: true,
          },
          {
            kode: 'ID5',
            nama: 'Indikator ID5',
            deskripsi: 'Indikator ID5 pada Hifzh an-Nafs',
            tipe: IndikatorTipe.POSITIF,
            urutan: 5,
            aktif: true,
          },
          {
            kode: 'ID6',
            nama: 'Indikator ID6',
            deskripsi: 'Indikator ID6 pada Hifzh an-Nafs',
            tipe: IndikatorTipe.NEGATIF,
            urutan: 6,
            aktif: true,
          },
        ],
      },
    },
  })

  /*
   * C3
   * Hifzh al-'Aql
   * Bobot 15%
   */

  await prisma.kriteria.create({
    data: {
      kode: 'C3',
      nama: "Hifzh al-'Aql",
      bobot: 0.15,
      tipe: KriteriaTipe.BENEFIT,
      deskripsi: "Kriteria Hifzh al-'Aql",
      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID7',
            nama: 'Indikator ID7',
            deskripsi: "Indikator ID7 pada Hifzh al-'Aql",
            tipe: IndikatorTipe.POSITIF,
            urutan: 7,
            aktif: true,
          },
          {
            kode: 'ID8',
            nama: 'Indikator ID8',
            deskripsi: "Indikator ID8 pada Hifzh al-'Aql",
            tipe: IndikatorTipe.POSITIF,
            urutan: 8,
            aktif: true,
          },
          {
            kode: 'ID9',
            nama: 'Indikator ID9',
            deskripsi: "Indikator ID9 pada Hifzh al-'Aql",
            tipe: IndikatorTipe.POSITIF,
            urutan: 9,
            aktif: true,
          },
        ],
      },
    },
  })

  /*
   * C4
   * Hifzh an-Nasl
   * Bobot 18%
   */

  await prisma.kriteria.create({
    data: {
      kode: 'C4',
      nama: 'Hifzh an-Nasl',
      bobot: 0.18,
      tipe: KriteriaTipe.BENEFIT,
      deskripsi: 'Kriteria Hifzh an-Nasl',
      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID10',
            nama: 'Indikator ID10',
            deskripsi: 'Indikator ID10 pada Hifzh an-Nasl',
            tipe: IndikatorTipe.POSITIF,
            urutan: 10,
            aktif: true,
          },
          {
            kode: 'ID11',
            nama: 'Indikator ID11',
            deskripsi: 'Indikator ID11 pada Hifzh an-Nasl',
            tipe: IndikatorTipe.POSITIF,
            urutan: 11,
            aktif: true,
          },
          {
            kode: 'ID12',
            nama: 'Indikator ID12',
            deskripsi: 'Indikator ID12 pada Hifzh an-Nasl',
            tipe: IndikatorTipe.POSITIF,
            urutan: 12,
            aktif: true,
          },
        ],
      },
    },
  })

  /*
   * C5
   * Hifzh al-Mal
   * Bobot 30%
   */

  await prisma.kriteria.create({
    data: {
      kode: 'C5',
      nama: 'Hifzh al-Mal',
      bobot: 0.3,
      tipe: KriteriaTipe.BENEFIT,
      deskripsi: 'Kriteria Hifzh al-Mal',
      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID13',
            nama: 'Indikator ID13',
            deskripsi: 'Indikator ID13 pada Hifzh al-Mal',
            tipe: IndikatorTipe.POSITIF,
            urutan: 13,
            aktif: true,
          },
          {
            kode: 'ID14',
            nama: 'Indikator ID14',
            deskripsi: 'Indikator ID14 pada Hifzh al-Mal',
            tipe: IndikatorTipe.POSITIF,
            urutan: 14,
            aktif: true,
          },
          {
            kode: 'ID15',
            nama: 'Indikator ID15',
            deskripsi: 'Indikator ID15 pada Hifzh al-Mal',
            tipe: IndikatorTipe.POSITIF,
            urutan: 15,
            aktif: true,
          },
        ],
      },
    },
  })

  console.log('========================================')
  console.log('MEMBUAT AKUN ADMIN...')
  console.log('========================================')

  const adminPasswordHash = await bcrypt.hash(
    'ayuadmin123',
    12
  )

  const admin = await prisma.user.upsert({
    where: {
      email: 'ayu@spkmustakhi.id',
    },
    update: {
      name: 'Ayu',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      name: 'Ayu',
      email: 'ayu@spkmustakhi.id',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  })

  console.log(
    `Admin berhasil dibuat/diperbarui: ${admin.email}`
  )

  console.log('========================================')
  console.log('VALIDASI DATA...')
  console.log('========================================')

  const totalKriteria =
    await prisma.kriteria.count()

  const totalIndikator =
    await prisma.indikator.count()

  const bobot =
    await prisma.kriteria.aggregate({
      _sum: {
        bobot: true,
      },
    })

  console.log(
    `Total kriteria: ${totalKriteria}`
  )

  console.log(
    `Total indikator: ${totalIndikator}`
  )

  console.log(
    `Total bobot: ${
      Number(
        bobot._sum.bobot ?? 0
      ) * 100
    }%`
  )

  console.log('')

  const kriteriaList =
    await prisma.kriteria.findMany({
      include: {
        indikator: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },

      orderBy: {
        kode: 'asc',
      },
    })

  for (
    const kriteria of kriteriaList
  ) {
    console.log(
      `${kriteria.kode} - ${kriteria.nama}`
    )

    console.log(
      `Bobot: ${
        Number(kriteria.bobot) * 100
      }%`
    )

    console.log(
      `Jumlah indikator: ${
        kriteria.indikator.length
      }`
    )

    for (
      const indikator of
        kriteria.indikator
    ) {
      console.log(
        `  ${indikator.kode} - ${indikator.nama} (${indikator.tipe})`
      )
    }

    console.log('')
  }

  console.log('========================================')
  console.log('SEED TOPSIS DAN ADMIN BERHASIL')
  console.log('========================================')

  console.log('Email admin: ayu@spkmustakhi.id')
  console.log('Role admin: ADMIN')
}

main()
  .catch((error) => {
    console.error(
      'SEED ERROR:',
      error
    )

    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })