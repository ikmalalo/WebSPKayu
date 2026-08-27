import {
  PrismaClient,
  KriteriaTipe,
  Role,
} from '@prisma/client'

import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type KriteriaSeed = {
  kode: string
  nama: string
  bobot: number
  tipe: KriteriaTipe
  skala: string[]
}

type DimensiSeed = {
  nama: string
  bobot: number
  kriteria: KriteriaSeed[]
}

const DATA_ASESMEN: DimensiSeed[] = [
  {
    nama: 'Hifzh ad-Din',
    bobot: 0.12,
    kriteria: [
      {
        kode: 'C1',
        nama: 'Integritas dan kepatuhan muamalah',
        bobot: 0.05,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Terdapat indikasi ketidakjujuran atau aktivitas usaha bertentangan dengan syariah.',
          'Integritas rendah; beberapa informasi atau transaksi tidak dapat dijelaskan.',
          'Cukup jujur; transaksi umumnya sesuai syariah tetapi dokumentasi masih terbatas.',
          'Jujur, transparan dan konsisten menjalankan transaksi halal.',
          'Sangat jujur, transparan, amanah dan menjadi contoh kepatuhan muamalah.',
        ],
      },
      {
        kode: 'C2',
        nama: 'Komitmen pembinaan spiritual',
        bobot: 0.03,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Menolak pembinaan spiritual.',
          'Bersedia hanya jika diwajibkan dan menunjukkan komitmen rendah.',
          'Bersedia mengikuti pembinaan secara cukup rutin.',
          'Aktif mengikuti pembinaan dan menerima arahan.',
          'Sangat aktif, konsisten dan berkomitmen mengimplementasikan pembinaan.',
        ],
      },
      {
        kode: 'C3',
        nama: 'Komitmen amanah terhadap program',
        bobot: 0.04,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Tidak bersedia menaati ketentuan program.',
          'Komitmen rendah dan terdapat keraguan penggunaan dana sesuai tujuan.',
          'Cukup berkomitmen menggunakan dana sesuai tujuan program.',
          'Berkomitmen kuat, siap melapor dan memenuhi ketentuan.',
          'Sangat amanah, transparan, disiplin dan siap dipantau secara berkala.',
        ],
      },
    ],
  },

  {
    nama: 'Hifzh an-Nafs',
    bobot: 0.25,
    kriteria: [
      {
        kode: 'C4',
        nama: 'Tingkat kerentanan kebutuhan dasar',
        bobot: 0.12,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Kebutuhan dasar relatif terpenuhi dan tidak menunjukkan kerentanan berarti.',
          'Ada keterbatasan ringan pada sebagian kebutuhan dasar.',
          'Beberapa kebutuhan dasar terbatas dan membutuhkan dukungan.',
          'Kerentanan tinggi; pendapatan sulit mencukupi sebagian besar kebutuhan dasar.',
          'Sangat rentan; kebutuhan dasar utama tidak terpenuhi secara memadai.',
        ],
      },
      {
        kode: 'C5',
        nama: 'Kelayakan dan keamanan lingkungan usaha',
        bobot: 0.07,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Lokasi tidak aman atau tidak layak dan sangat sulit diakses.',
          'Keamanan atau akses rendah; terdapat hambatan serius bagi usaha.',
          'Cukup aman dan cukup dapat diakses.',
          'Aman, layak, mudah diakses dan mendukung aktivitas usaha.',
          'Sangat aman, strategis, akses sangat baik dan lingkungan sangat mendukung usaha.',
        ],
      },
      {
        kode: 'C6',
        nama: 'Risiko tekanan kebutuhan/utang',
        bobot: 0.06,
        tipe: KriteriaTipe.COST,
        skala: [
          'Risiko sangat rendah; utang tidak ada atau terkendali dan kebutuhan rutin relatif stabil.',
          'Risiko rendah; kewajiban utang ringan.',
          'Risiko sedang; terdapat kewajiban yang cukup menekan arus kas.',
          'Risiko tinggi; utang atau kebutuhan mendesak sering mengganggu modal usaha.',
          'Risiko sangat tinggi; tekanan utang atau kebutuhan berpotensi besar mengalihkan dana produktif.',
        ],
      },
    ],
  },

  {
    nama: "Hifzh al-'Aql",
    bobot: 0.15,
    kriteria: [
      {
        kode: 'C7',
        nama: 'Literasi dan pengetahuan usaha',
        bobot: 0.05,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Tidak memahami dasar pengelolaan usaha dan keuangan.',
          'Pengetahuan usaha sangat terbatas; belum mampu menghitung laba atau biaya dengan baik.',
          'Memahami dasar usaha dan pencatatan sederhana.',
          'Memahami pengelolaan stok, biaya, laba dan pelanggan dengan baik.',
          'Memiliki literasi usaha atau keuangan kuat dan mampu menggunakan informasi untuk keputusan usaha.',
        ],
      },
      {
        kode: 'C8',
        nama: 'Keterampilan dan kesiapan belajar',
        bobot: 0.05,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Tidak menunjukkan keterampilan dasar dan tidak siap belajar.',
          'Keterampilan rendah serta kurang responsif terhadap arahan.',
          'Memiliki keterampilan dasar dan cukup siap belajar.',
          'Terampil, terbuka terhadap perubahan dan aktif belajar.',
          'Sangat terampil, adaptif, cepat belajar dan mampu menerapkan pengetahuan baru.',
        ],
      },
      {
        kode: 'C9',
        nama: 'Komitmen mengikuti pendampingan',
        bobot: 0.05,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Tidak bersedia mengikuti pendampingan.',
          'Bersedia tetapi kemungkinan kehadiran atau partisipasi rendah.',
          'Bersedia mengikuti sebagian besar kegiatan.',
          'Berkomitmen mengikuti kegiatan secara rutin dan aktif.',
          'Sangat berkomitmen, disiplin, aktif dan siap memenuhi seluruh agenda pendampingan.',
        ],
      },
    ],
  },

  {
    nama: 'Hifzh an-Nasl',
    bobot: 0.18,
    kriteria: [
      {
        kode: 'C10',
        nama: 'Beban tanggungan keluarga',
        bobot: 0.07,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Tidak memiliki tanggungan atau beban keluarga sangat rendah.',
          'Tanggungan rendah dan sebagian besar anggota keluarga produktif.',
          'Tanggungan sedang.',
          'Tanggungan tinggi dan mustahik menjadi sumber nafkah utama.',
          'Tanggungan sangat tinggi, termasuk anak, lansia, atau anggota keluarga tidak produktif yang bergantung pada mustahik.',
        ],
      },
      {
        kode: 'C11',
        nama: 'Dukungan keluarga terhadap usaha',
        bobot: 0.05,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Keluarga menolak atau menghambat usaha.',
          'Dukungan keluarga rendah.',
          'Keluarga cukup mendukung secara moral.',
          'Keluarga mendukung dan membantu operasional usaha bila diperlukan.',
          'Keluarga sangat mendukung dan terlibat positif dalam keberlanjutan usaha.',
        ],
      },
      {
        kode: 'C12',
        nama: 'Potensi usaha mendukung kesejahteraan keluarga',
        bobot: 0.06,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Usaha hampir tidak memberi kontribusi terhadap kebutuhan keluarga.',
          'Kontribusi usaha rendah dan belum stabil.',
          'Usaha memberi kontribusi sedang terhadap kebutuhan keluarga.',
          'Usaha berpotensi kuat meningkatkan pendapatan dan kesejahteraan keluarga.',
          'Usaha sangat potensial menjadi sumber nafkah utama yang stabil dan meningkatkan kualitas hidup keluarga.',
        ],
      },
    ],
  },

  {
    nama: 'Hifzh al-Mal',
    bobot: 0.3,
    kriteria: [
      {
        kode: 'C13',
        nama: 'Kondisi dan potensi ekonomi usaha',
        bobot: 0.12,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Usaha tidak berjalan atau tidak memiliki prospek yang layak.',
          'Usaha sangat lemah; omzet dan aktivitas tidak stabil.',
          'Usaha berjalan dengan potensi pengembangan sedang.',
          'Usaha berjalan baik dan memiliki peluang pertumbuhan nyata.',
          'Usaha sehat, prospektif dan sangat layak dikembangkan dengan tambahan modal.',
        ],
      },
      {
        kode: 'C14',
        nama: 'Akses pasar dan jaringan usaha',
        bobot: 0.08,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Tidak memiliki pasar atau pelanggan yang jelas dan akses sangat terbatas.',
          'Pasar terbatas, pelanggan tidak stabil dan belum memiliki jaringan pemasok.',
          'Memiliki pelanggan dan pemasok dasar tetapi jangkauan masih terbatas.',
          'Pasar cukup kuat, pelanggan relatif stabil dan memiliki jaringan pemasok.',
          'Akses pasar sangat baik, pelanggan kuat, jaringan pemasok atau mitra luas dan terdapat peluang ekspansi.',
        ],
      },
      {
        kode: 'C15',
        nama: 'Potensi keberlanjutan dan kemandirian usaha',
        bobot: 0.1,
        tipe: KriteriaTipe.BENEFIT,
        skala: [
          'Sangat kecil kemungkinan usaha bertahan setelah bantuan.',
          'Keberlanjutan rendah dan sangat bergantung pada bantuan.',
          'Cukup berpotensi bertahan dengan pendampingan intensif.',
          'Berpotensi kuat mandiri dan berkembang setelah intervensi.',
          'Sangat berpotensi berkelanjutan, mandiri, tumbuh, dan secara bertahap keluar dari ketergantungan bantuan.',
        ],
      },
    ],
  },
]

async function main() {
  console.log('========================================')
  console.log('MEMULAI SEED FORM ASESMEN TOPSIS')
  console.log('========================================')

  console.log('Menghapus jawaban lama...')
  await prisma.jawabanKuesioner.deleteMany()

  console.log('Menghapus detail TOPSIS lama...')
  await prisma.topsisDetail.deleteMany()

  console.log('Menghapus hasil TOPSIS lama...')
  await prisma.topsisResult.deleteMany()

  console.log('Menghapus subkriteria lama...')
  await prisma.subKriteria.deleteMany()

  console.log('Menghapus kriteria lama...')
  await prisma.kriteria.deleteMany()

  console.log('========================================')
  console.log('MEMBUAT 15 KRITERIA ASESMEN')
  console.log('========================================')

  for (
    const dimensi of DATA_ASESMEN
  ) {
    for (
      const [
        index,
        kriteria,
      ] of dimensi.kriteria.entries()
    ) {
      await prisma.kriteria.create({
        data: {
          kode: kriteria.kode,
          nama: kriteria.nama,
          bobot: kriteria.bobot,
          tipe: kriteria.tipe,
          deskripsi: `Kriteria ${kriteria.nama}`,
          aktif: true,
          dimensi: dimensi.nama,
          urutan: index + 1,

          subKriteria: {
            create:
              kriteria.skala.map(
                (
                  keterangan,
                  skor
                ) => ({
                  nama:
                    `Skor ${skor + 1}`,

                  nilai:
                    skor + 1,

                  keterangan,
                })
              ),
          },
        },
      })
    }
  }

  console.log('========================================')
  console.log('MEMBUAT AKUN ADMIN')
  console.log('========================================')

  const passwordHash =
    await bcrypt.hash(
      'ayuadmin123',
      12
    )

  const admin =
    await prisma.user.upsert({
      where: {
        email:
          'ayu@spkmustahik.id',
      },

      update: {
        name: 'Ayu',
        passwordHash,
        role: Role.ADMIN,
      },

      create: {
        name: 'Ayu',
        email:
          'ayu@spkmustahik.id',
        passwordHash,
        role: Role.ADMIN,
      },
    })

  console.log(
    `Admin berhasil dibuat: ${admin.email}`
  )

  console.log('========================================')
  console.log('VALIDASI DATA')
  console.log('========================================')

  const totalKriteria =
    await prisma.kriteria.count()

  const totalSubKriteria =
    await prisma.subKriteria.count()

  const bobot =
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
    `Total pilihan skor: ${totalSubKriteria}`
  )

  console.log(
    `Total bobot: ${
      Number(
        bobot._sum.bobot ?? 0
      ) * 100
    }%`
  )

  console.log('')

  const list =
    await prisma.kriteria.findMany({
      include: {
        subKriteria: {
          orderBy: {
            nilai: 'asc',
          },
        },
      },

      orderBy: [
        {
          kode: 'asc',
        },
      ],
    })

  for (
    const item of list
  ) {
    console.log(
      `${item.kode} - ${item.nama}`
    )

    console.log(
      `Bobot: ${
        Number(item.bobot) * 100
      }%`
    )

    console.log(
      `Tipe: ${item.tipe}`
    )

    console.log(
      `Jumlah skor: ${
        item.subKriteria.length
      }`
    )

    console.log('')
  }

  console.log('========================================')
  console.log('SEED BERHASIL')
  console.log('========================================')

  console.log(
    'Email admin: ayu@spkmustahik.id'
  )

  console.log(
    'Password admin: ayuadmin123'
  )
}

main()
  .catch(
    (error) => {
      console.error(
        'SEED ERROR:',
        error
      )

      process.exit(1)
    }
  )
  .finally(
    async () => {
      await prisma.$disconnect()
    }
  )