import {
  PrismaClient,
  KriteriaTipe,
  IndikatorTipe,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('========================================')
  console.log('MEMULAI SEED DATA TOPSIS...')
  console.log('========================================')

  /*
   * Hapus indikator lama terlebih dahulu.
   */
  console.log('Menghapus indikator lama...')

  await prisma.indikator.deleteMany()

  /*
   * Hapus subkriteria lama.
   *
   * SubKriteria lama tidak lagi digunakan sebagai
   * sumber utama perhitungan TOPSIS.
   */
  console.log('Menghapus subkriteria lama...')

  await prisma.subKriteria.deleteMany()

  /*
   * Hapus kriteria lama.
   *
   * Jika database masih memiliki data jawaban lama
   * yang terhubung ke kriteria lama dan proses ini
   * gagal karena foreign key, database perlu
   * dibersihkan/migrasi terlebih dahulu.
   */
  console.log('Menghapus kriteria lama...')

  await prisma.kriteria.deleteMany()

  console.log('Membuat data kriteria baru...')

  /*
   * ==========================================================
   * C1 - HIFZH AD-DIN
   * Bobot: 12%
   * Tipe TOPSIS: BENEFIT
   * ==========================================================
   */

  const c1 = await prisma.kriteria.create({
    data: {
      kode: 'C1',

      nama: 'Hifzh ad-Din',

      bobot: 0.12,

      tipe: KriteriaTipe.BENEFIT,

      deskripsi:
        'Kriteria Hifzh ad-Din berdasarkan indikator ID1, ID2, dan ID3.',

      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID1',

            nama: 'Indikator ID1',

            deskripsi:
              'Indikator ID1 pada kriteria Hifzh ad-Din.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 1,

            aktif: true,
          },

          {
            kode: 'ID2',

            nama: 'Indikator ID2',

            deskripsi:
              'Indikator ID2 pada kriteria Hifzh ad-Din.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 2,

            aktif: true,
          },

          {
            kode: 'ID3',

            nama: 'Indikator ID3',

            deskripsi:
              'Indikator ID3 pada kriteria Hifzh ad-Din.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 3,

            aktif: true,
          },
        ],
      },
    },

    include: {
      indikator: true,
    },
  })

  console.log(
    `Berhasil membuat ${c1.kode} - ${c1.nama}`
  )

  /*
   * ==========================================================
   * C2 - HIFZH AN-NAFS
   * Bobot: 25%
   * Tipe TOPSIS: BENEFIT
   *
   * ID6 merupakan indikator NEGATIF.
   * ==========================================================
   */

  const c2 = await prisma.kriteria.create({
    data: {
      kode: 'C2',

      nama: 'Hifzh an-Nafs',

      bobot: 0.25,

      tipe: KriteriaTipe.BENEFIT,

      deskripsi:
        'Kriteria Hifzh an-Nafs berdasarkan indikator ID4, ID5, dan ID6.',

      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID4',

            nama: 'Indikator ID4',

            deskripsi:
              'Indikator ID4 pada kriteria Hifzh an-Nafs.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 4,

            aktif: true,
          },

          {
            kode: 'ID5',

            nama: 'Indikator ID5',

            deskripsi:
              'Indikator ID5 pada kriteria Hifzh an-Nafs.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 5,

            aktif: true,
          },

          {
            kode: 'ID6',

            nama: 'Indikator ID6',

            deskripsi:
              'Indikator ID6 pada kriteria Hifzh an-Nafs.',

            tipe: IndikatorTipe.NEGATIF,

            urutan: 6,

            aktif: true,
          },
        ],
      },
    },

    include: {
      indikator: true,
    },
  })

  console.log(
    `Berhasil membuat ${c2.kode} - ${c2.nama}`
  )

  /*
   * ==========================================================
   * C3 - HIFZH AL-'AQL
   * Bobot: 15%
   * Tipe TOPSIS: BENEFIT
   * ==========================================================
   */

  const c3 = await prisma.kriteria.create({
    data: {
      kode: 'C3',

      nama: "Hifzh al-'Aql",

      bobot: 0.15,

      tipe: KriteriaTipe.BENEFIT,

      deskripsi:
        "Kriteria Hifzh al-'Aql berdasarkan indikator ID7, ID8, dan ID9.",

      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID7',

            nama: 'Indikator ID7',

            deskripsi:
              "Indikator ID7 pada kriteria Hifzh al-'Aql.",

            tipe: IndikatorTipe.POSITIF,

            urutan: 7,

            aktif: true,
          },

          {
            kode: 'ID8',

            nama: 'Indikator ID8',

            deskripsi:
              "Indikator ID8 pada kriteria Hifzh al-'Aql.",

            tipe: IndikatorTipe.POSITIF,

            urutan: 8,

            aktif: true,
          },

          {
            kode: 'ID9',

            nama: 'Indikator ID9',

            deskripsi:
              "Indikator ID9 pada kriteria Hifzh al-'Aql.",

            tipe: IndikatorTipe.POSITIF,

            urutan: 9,

            aktif: true,
          },
        ],
      },
    },

    include: {
      indikator: true,
    },
  })

  console.log(
    `Berhasil membuat ${c3.kode} - ${c3.nama}`
  )

  /*
   * ==========================================================
   * C4 - HIFZH AN-NASL
   * Bobot: 18%
   * Tipe TOPSIS: BENEFIT
   * ==========================================================
   */

  const c4 = await prisma.kriteria.create({
    data: {
      kode: 'C4',

      nama: 'Hifzh an-Nasl',

      bobot: 0.18,

      tipe: KriteriaTipe.BENEFIT,

      deskripsi:
        'Kriteria Hifzh an-Nasl berdasarkan indikator ID10, ID11, dan ID12.',

      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID10',

            nama: 'Indikator ID10',

            deskripsi:
              'Indikator ID10 pada kriteria Hifzh an-Nasl.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 10,

            aktif: true,
          },

          {
            kode: 'ID11',

            nama: 'Indikator ID11',

            deskripsi:
              'Indikator ID11 pada kriteria Hifzh an-Nasl.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 11,

            aktif: true,
          },

          {
            kode: 'ID12',

            nama: 'Indikator ID12',

            deskripsi:
              'Indikator ID12 pada kriteria Hifzh an-Nasl.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 12,

            aktif: true,
          },
        ],
      },
    },

    include: {
      indikator: true,
    },
  })

  console.log(
    `Berhasil membuat ${c4.kode} - ${c4.nama}`
  )

  /*
   * ==========================================================
   * C5 - HIFZH AL-MAL
   * Bobot: 30%
   * Tipe TOPSIS: BENEFIT
   * ==========================================================
   */

  const c5 = await prisma.kriteria.create({
    data: {
      kode: 'C5',

      nama: 'Hifzh al-Mal',

      bobot: 0.30,

      tipe: KriteriaTipe.BENEFIT,

      deskripsi:
        'Kriteria Hifzh al-Mal berdasarkan indikator ID13, ID14, dan ID15.',

      aktif: true,

      indikator: {
        create: [
          {
            kode: 'ID13',

            nama: 'Indikator ID13',

            deskripsi:
              'Indikator ID13 pada kriteria Hifzh al-Mal.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 13,

            aktif: true,
          },

          {
            kode: 'ID14',

            nama: 'Indikator ID14',

            deskripsi:
              'Indikator ID14 pada kriteria Hifzh al-Mal.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 14,

            aktif: true,
          },

          {
            kode: 'ID15',

            nama: 'Indikator ID15',

            deskripsi:
              'Indikator ID15 pada kriteria Hifzh al-Mal.',

            tipe: IndikatorTipe.POSITIF,

            urutan: 15,

            aktif: true,
          },
        ],
      },
    },

    include: {
      indikator: true,
    },
  })

  console.log(
    `Berhasil membuat ${c5.kode} - ${c5.nama}`
  )

  /*
   * ==========================================================
   * VALIDASI DATA
   * ==========================================================
   */

  const totalKriteria =
    await prisma.kriteria.count()

  const totalIndikator =
    await prisma.indikator.count()

  const resultBobot =
    await prisma.kriteria.aggregate({
      _sum: {
        bobot: true,
      },
    })

  const totalBobot =
    Number(
      resultBobot._sum.bobot ?? 0
    )

  console.log('')
  console.log('========================================')
  console.log('VALIDASI HASIL SEED')
  console.log('========================================')

  console.log(
    `Total Kriteria: ${totalKriteria}`
  )

  console.log(
    `Total Indikator: ${totalIndikator}`
  )

  console.log(
    `Total Bobot: ${totalBobot}`
  )

  console.log('')
  console.log('DATA KRITERIA:')

  const semuaKriteria =
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
    const kriteria of semuaKriteria
  ) {
    console.log('')

    console.log(
      `${kriteria.kode} - ${kriteria.nama}`
    )

    console.log(
      `Bobot: ${
        Number(kriteria.bobot) * 100
      }%`
    )

    console.log(
      `Tipe: ${kriteria.tipe}`
    )

    console.log(
      `Jumlah Indikator: ${
        kriteria.indikator.length
      }`
    )

    for (
      const indikator of
        kriteria.indikator
    ) {
      console.log(
        `  ${indikator.kode} - ${indikator.tipe}`
      )
    }
  }

  console.log('')
  console.log('========================================')
  console.log('SEED TOPSIS BERHASIL')
  console.log('========================================')
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