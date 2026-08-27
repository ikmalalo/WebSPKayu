import {
  PrismaClient,
  KriteriaTipe,
  IndikatorTipe,
  Role,
} from '@prisma/client'

import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type IndikatorSeed = {
  kode: string
  nama: string
  deskripsi: string
  tipe: IndikatorTipe
  urutan: number
}

type KriteriaSeed = {
  kode: string
  nama: string
  bobot: number
  tipe: KriteriaTipe
  deskripsi: string
  dimensi: string
  urutan: number
  indikator: IndikatorSeed[]
}

const DATA_ASESMEN: KriteriaSeed[] = [
  {
    kode: 'C1',
    nama: 'Hifzh ad-Din',
    bobot: 0.12,
    tipe: KriteriaTipe.BENEFIT,
    deskripsi:
      'Penilaian terhadap aspek agama, integritas, dan kepatuhan mustahik dalam menjalankan aktivitas muamalah.',
    dimensi: 'Maqashid Syariah',
    urutan: 1,

    indikator: [
      {
        kode: 'ID1',
        nama: 'Integritas dan kepatuhan muamalah',
        deskripsi:
          'Penilaian integritas, kejujuran, transparansi, dan kepatuhan aktivitas usaha terhadap prinsip syariah.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 1,
      },
      {
        kode: 'ID2',
        nama: 'Komitmen pembinaan spiritual',
        deskripsi:
          'Penilaian kesediaan dan komitmen mustahik dalam mengikuti kegiatan pembinaan spiritual.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 2,
      },
      {
        kode: 'ID3',
        nama: 'Komitmen amanah terhadap program',
        deskripsi:
          'Penilaian komitmen mustahik dalam menggunakan bantuan sesuai tujuan dan menaati ketentuan program.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 3,
      },
    ],
  },

  {
    kode: 'C2',
    nama: 'Hifzh an-Nafs',
    bobot: 0.25,
    tipe: KriteriaTipe.BENEFIT,
    deskripsi:
      'Penilaian terhadap kondisi kebutuhan dasar, kerentanan hidup, dan lingkungan mustahik.',
    dimensi: 'Maqashid Syariah',
    urutan: 2,

    indikator: [
      {
        kode: 'ID4',
        nama: 'Tingkat kerentanan kebutuhan dasar',
        deskripsi:
          'Penilaian tingkat kerentanan mustahik dalam memenuhi kebutuhan dasar sehari-hari.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 4,
      },
      {
        kode: 'ID5',
        nama: 'Kelayakan dan keamanan lingkungan usaha',
        deskripsi:
          'Penilaian kondisi keamanan, kelayakan, aksesibilitas, dan dukungan lingkungan terhadap usaha.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 5,
      },
      {
        kode: 'ID6',
        nama: 'Risiko tekanan kebutuhan atau utang',
        deskripsi:
          'Penilaian tingkat risiko tekanan kebutuhan mendesak dan kewajiban utang terhadap keberlangsungan usaha.',
        tipe: IndikatorTipe.NEGATIF,
        urutan: 6,
      },
    ],
  },

  {
    kode: 'C3',
    nama: "Hifzh al-'Aql",
    bobot: 0.15,
    tipe: KriteriaTipe.BENEFIT,
    deskripsi:
      'Penilaian terhadap kemampuan, pengetahuan, keterampilan, dan kesiapan mustahik dalam mengembangkan usaha.',
    dimensi: 'Maqashid Syariah',
    urutan: 3,

    indikator: [
      {
        kode: 'ID7',
        nama: 'Literasi dan pengetahuan usaha',
        deskripsi:
          'Penilaian pemahaman mustahik mengenai pengelolaan usaha dan keuangan.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 7,
      },
      {
        kode: 'ID8',
        nama: 'Keterampilan dan kesiapan belajar',
        deskripsi:
          'Penilaian keterampilan dasar, kemampuan beradaptasi, dan kesiapan mustahik untuk belajar.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 8,
      },
      {
        kode: 'ID9',
        nama: 'Komitmen mengikuti pendampingan',
        deskripsi:
          'Penilaian kesediaan dan komitmen mustahik dalam mengikuti kegiatan pendampingan.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 9,
      },
    ],
  },

  {
    kode: 'C4',
    nama: 'Hifzh an-Nasl',
    bobot: 0.18,
    tipe: KriteriaTipe.BENEFIT,
    deskripsi:
      'Penilaian terhadap kondisi keluarga, tanggungan, dukungan keluarga, dan dampak usaha terhadap kesejahteraan keluarga.',
    dimensi: 'Maqashid Syariah',
    urutan: 4,

    indikator: [
      {
        kode: 'ID10',
        nama: 'Beban tanggungan keluarga',
        deskripsi:
          'Penilaian tingkat beban tanggungan dan ketergantungan anggota keluarga terhadap mustahik.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 10,
      },
      {
        kode: 'ID11',
        nama: 'Dukungan keluarga terhadap usaha',
        deskripsi:
          'Penilaian tingkat dukungan keluarga terhadap aktivitas dan pengembangan usaha mustahik.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 11,
      },
      {
        kode: 'ID12',
        nama: 'Potensi usaha mendukung kesejahteraan keluarga',
        deskripsi:
          'Penilaian potensi usaha dalam meningkatkan pendapatan dan kesejahteraan keluarga.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 12,
      },
    ],
  },

  {
    kode: 'C5',
    nama: 'Hifzh al-Mal',
    bobot: 0.3,
    tipe: KriteriaTipe.BENEFIT,
    deskripsi:
      'Penilaian terhadap kondisi ekonomi, akses pasar, dan keberlanjutan usaha mustahik.',
    dimensi: 'Maqashid Syariah',
    urutan: 5,

    indikator: [
      {
        kode: 'ID13',
        nama: 'Kondisi dan potensi ekonomi usaha',
        deskripsi:
          'Penilaian kondisi usaha saat ini dan potensi pengembangan ekonomi usaha.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 13,
      },
      {
        kode: 'ID14',
        nama: 'Akses pasar dan jaringan usaha',
        deskripsi:
          'Penilaian akses mustahik terhadap pasar, pelanggan, pemasok, dan jaringan usaha.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 14,
      },
      {
        kode: 'ID15',
        nama: 'Potensi keberlanjutan dan kemandirian usaha',
        deskripsi:
          'Penilaian kemampuan usaha untuk bertahan, berkembang, dan mencapai kemandirian.',
        tipe: IndikatorTipe.POSITIF,
        urutan: 15,
      },
    ],
  },
]

async function main() {
  console.log('========================================')
  console.log('MEMULAI SEED DATA ASESMEN TOPSIS')
  console.log('========================================')

  console.log('Menghapus jawaban kuesioner lama...')
  await prisma.jawabanKuesioner.deleteMany()

  console.log('Menghapus indikator lama...')
  await prisma.indikator.deleteMany()

  console.log('Menghapus subkriteria lama...')
  await prisma.subKriteria.deleteMany()

  console.log('Menghapus detail TOPSIS lama...')
  await prisma.topsisDetail.deleteMany()

  console.log('Menghapus hasil TOPSIS lama...')
  await prisma.topsisResult.deleteMany()

  console.log('Menghapus kriteria lama...')
  await prisma.kriteria.deleteMany()

  console.log('========================================')
  console.log('MEMBUAT 5 KRITERIA DAN 15 INDIKATOR')
  console.log('========================================')

  for (const kriteria of DATA_ASESMEN) {
    await prisma.kriteria.create({
      data: {
        kode: kriteria.kode,
        nama: kriteria.nama,
        bobot: kriteria.bobot,
        tipe: kriteria.tipe,
        deskripsi: kriteria.deskripsi,
        aktif: true,
        dimensi: kriteria.dimensi,
        urutan: kriteria.urutan,

        indikator: {
          create: kriteria.indikator.map(
            (indikator) => ({
              kode: indikator.kode,
              nama: indikator.nama,
              deskripsi: indikator.deskripsi,
              tipe: indikator.tipe,
              urutan: indikator.urutan,
              aktif: true,
            })
          ),
        },
      },
    })
  }

  console.log('========================================')
  console.log('MEMBUAT AKUN ADMIN')
  console.log('========================================')

  const passwordHash = await bcrypt.hash(
    'ayuadmin123',
    12
  )

  const admin = await prisma.user.upsert({
    where: {
      email: 'ayu@spkmustahik.id',
    },

    update: {
      name: 'Ayu',
      passwordHash,
      role: Role.ADMIN,
    },

    create: {
      name: 'Ayu',
      email: 'ayu@spkmustahik.id',
      passwordHash,
      role: Role.ADMIN,
    },
  })

  console.log(
    `Admin berhasil dibuat/diperbarui: ${admin.email}`
  )

  console.log('========================================')
  console.log('VALIDASI DATA')
  console.log('========================================')

  const totalKriteria =
    await prisma.kriteria.count()

  const totalIndikator =
    await prisma.indikator.count()

  const totalBobot =
    await prisma.kriteria.aggregate({
      _sum: {
        bobot: true,
      },
    })

  console.log(
    `Total dimensi: ${DATA_ASESMEN.length}`
  )

  console.log(
    `Total kriteria: ${totalKriteria}`
  )

  console.log(
    `Total indikator: ${totalIndikator}`
  )

  console.log(
    `Total bobot: ${
      Number(totalBobot._sum.bobot ?? 0) *
      100
    }%`
  )

  console.log('')

  const daftarKriteria =
    await prisma.kriteria.findMany({
      include: {
        indikator: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },

      orderBy: {
        urutan: 'asc',
      },
    })

  for (const kriteria of daftarKriteria) {
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

    for (const indikator of kriteria.indikator) {
      console.log(
        `  ${indikator.kode} - ${indikator.nama} (${indikator.tipe})`
      )
    }

    console.log('')
  }

  console.log('========================================')
  console.log('SEED DATA ASESMEN BERHASIL')
  console.log('========================================')

  console.log(
    'Email admin: ayu@spkmustahik.id'
  )

  console.log(
    'Password admin: ayuadmin123'
  )
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