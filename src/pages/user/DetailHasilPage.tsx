import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  Clock,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Button,
} from '@/components/ui/button'

import {
  StatusBadge,
} from '@/components/shared/StatusBadge'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  mockPengajuan,
  mockTopsisResults,
  mockKriteria,
  mockDataMustahik,
} from '@/data/mockData'

import {
  formatDate,
  formatCurrency,
} from '@/lib/utils'

import {
  useAuth,
} from '@/context/AuthContext'

import {
  usePengajuan,
} from '@/context/PengajuanContext'

export function DetailHasilPage() {
  const {
    currentUser,
  } = useAuth()

  const {
    pengajuan:
      contextPengajuan,
  } = usePengajuan()

  /*
   * Cari pengajuan milik user.
   */
  const userPengajuan =
    contextPengajuan &&
    currentUser &&
    contextPengajuan.userId ===
      currentUser.id
      ? contextPengajuan
      : currentUser
        ? mockPengajuan.find(
            (p) =>
              p.userId ===
              currentUser.id
          )
        : null

  /*
   * Kalau belum ada pengajuan,
   * jangan mencoba mengakses
   * userPengajuan.mustahikId.
   */
  if (!userPengajuan) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detail Hasil Pengajuan"
        >
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link to="/pantau-hasil">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-4" />

            <h3 className="text-lg font-semibold text-slate-900">
              Belum Ada Pengajuan
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Anda belum memiliki data
              pengajuan yang dapat ditampilkan.
            </p>

            <Button
              asChild
              className="mt-5"
            >
              <Link to="/pengajuan/form">
                Mulai Pengajuan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /*
   * Cari data mustahik.
   */
  const userMustahik =
    mockDataMustahik.find(
      (m) =>
        m.id ===
        userPengajuan.mustahikId
    ) || null

  /*
   * Kalau data mustahik belum ada,
   * tetap tampilkan halaman dengan
   * data dasar pengajuan.
   */
  const mustahikData =
    userMustahik || {
      id:
        userPengajuan.mustahikId,
      userId:
        userPengajuan.userId,
      nik:
        userPengajuan.nik,
      namaLengkap:
        userPengajuan.namaLengkap,
      tempatLahir: '-',
      tanggalLahir: '',
      jenisKelamin: 'L' as const,
      alamat: '-',
      kelurahan: '-',
      kecamatan: '-',
      kota: '-',
      provinsi: '-',
      noHp: '',
      statusPernikahan:
        'belum_menikah' as const,
      pekerjaan: '-',
      penghasilan: 0,
      jumlahTanggungan: 0,
      statusRumah:
        'menumpang' as const,
      kondisiRumah:
        'sedang' as const,
      kepemilikanAset:
        'tidak_ada' as const,
    }

  /*
   * Cari hasil TOPSIS berdasarkan
   * mustahik/pengajuan.
   */
  const userTopsis =
    mockTopsisResults.find(
      (result) =>
        result.mustahikId ===
        userPengajuan.mustahikId
    ) || null

  const getScoreVector = (
    m: typeof mustahikData
  ) => {
    // C1: Penghasilan
    let c1 = 5

    if (m.penghasilan < 500000) {
      c1 = 1
    } else if (
      m.penghasilan <=
      1000000
    ) {
      c1 = 2
    } else if (
      m.penghasilan <=
      1500000
    ) {
      c1 = 3
    } else if (
      m.penghasilan <=
      2000000
    ) {
      c1 = 4
    } else {
      c1 = 5
    }

    // C2: Tanggungan
    let c2 = 1

    if (
      m.jumlahTanggungan ===
      1
    ) {
      c2 = 1
    } else if (
      m.jumlahTanggungan ===
      2
    ) {
      c2 = 2
    } else if (
      m.jumlahTanggungan ===
      3
    ) {
      c2 = 3
    } else if (
      m.jumlahTanggungan ===
      4
    ) {
      c2 = 4
    } else if (
      m.jumlahTanggungan >=
      5
    ) {
      c2 = 5
    }

    // C3: Kondisi Rumah
    let c3 = 3

    if (
      m.kondisiRumah ===
      'baik'
    ) {
      c3 = 2
    } else if (
      m.kondisiRumah ===
      'sedang'
    ) {
      c3 = 3
    } else if (
      m.kondisiRumah ===
      'buruk'
    ) {
      c3 = 4
    }

    // C4: Pekerjaan
    let c4 = 5

    const pekerjaan =
      String(
        m.pekerjaan || ''
      ).toLowerCase()

    if (
      pekerjaan.includes(
        'pns'
      ) ||
      pekerjaan.includes(
        'bumn'
      ) ||
      pekerjaan.includes(
        'pemerintah'
      )
    ) {
      c4 = 1
    } else if (
      pekerjaan.includes(
        'swasta'
      ) ||
      pekerjaan.includes(
        'karyawan'
      )
    ) {
      c4 = 2
    } else if (
      pekerjaan.includes(
        'wiraswasta'
      ) ||
      pekerjaan.includes(
        'dagang'
      ) ||
      pekerjaan.includes(
        'toko'
      )
    ) {
      c4 = 3
    } else if (
      pekerjaan.includes(
        'buruh'
      ) ||
      pekerjaan.includes(
        'harian'
      ) ||
      pekerjaan.includes(
        'tani'
      ) ||
      pekerjaan.includes(
        'bangunan'
      )
    ) {
      c4 = 4
    }

    // C5: Aset
    const c5 =
      m.kepemilikanAset ===
      'ada'
        ? 2
        : 5

    return [
      c1,
      c2,
      c3,
      c4,
      c5,
    ]
  }

  const scores =
    getScoreVector(
      mustahikData
    )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Hasil Pengajuan"
      >
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link to="/pantau-hasil">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
      </PageHeader>

      {/* HEADER */}
      <Card className="border-green-300 bg-gradient-to-r from-green-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-2xl">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <StatusBadge
                status={
                  userPengajuan.status
                }
              />

              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {
                  mustahikData.namaLengkap
                }
              </h2>

              <p className="text-sm text-slate-500">
                Pengajuan #
                {userPengajuan.id.toUpperCase()}
              </p>
            </div>

            <div className="ml-auto text-right">
              <p className="text-4xl font-bold text-green-600">
                #
                {userTopsis?.ranking ??
                  '-'}
              </p>

              <p className="text-xs text-slate-500">
                Ranking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOPSIS */}
      <Card>
        <CardHeader>
          <CardTitle>
            Nilai TOPSIS
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-green-50 rounded-xl text-center border border-green-200">
              <p className="text-3xl font-bold text-green-600">
                {userTopsis
                  ? userTopsis.nilaiPreferensi.toFixed(
                      4
                    )
                  : '-'}
              </p>

              <p className="text-xs text-green-700 mt-1">
                Nilai Preferensi (Ci)
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
              <div className="flex items-center justify-center gap-2">
                {userTopsis?.status ===
                'LAYAK_DIDANAI' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />

                    <p className="text-lg font-bold text-green-600">
                      LAYAK
                    </p>
                  </>
                ) : userTopsis?.status ===
                  'TIDAK_DIDANAI' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-red-500" />

                    <p className="text-lg font-bold text-red-500">
                      TIDAK LAYAK
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />

                    <p className="text-lg font-bold text-amber-500">
                      ANTREAN
                    </p>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Status Kelayakan
              </p>
            </div>
          </div>

          {/* KRITERIA */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Skor per Kriteria:
            </p>

            {mockKriteria.map(
              (k, i) => (
                <div
                  key={k.id}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {k.nama}
                      </span>

                      <span className="text-xs font-bold text-slate-600 ml-2">
                        {
                          scores[i]
                        }
                        /5
                      </span>
                    </div>

                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${
                            (scores[i] /
                              5) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      k.tipe ===
                      'benefit'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {k.tipe}
                  </span>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* RINGKASAN */}
      <Card>
        <CardHeader>
          <CardTitle>
            Ringkasan Data Pengajuan
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              {
                label:
                  'Nama Lengkap',
                value:
                  mustahikData.namaLengkap,
              },
              {
                label:
                  'Penghasilan',
                value:
                  formatCurrency(
                    mustahikData.penghasilan
                  ),
              },
              {
                label:
                  'Jumlah Tanggungan',
                value: `${mustahikData.jumlahTanggungan} orang`,
              },
              {
                label:
                  'Pekerjaan',
                value:
                  mustahikData.pekerjaan,
              },
              {
                label:
                  'Kondisi Rumah',
                value:
                  mustahikData.kondisiRumah.replace(
                    '_',
                    ' '
                  ),
              },
              {
                label:
                  'Status Rumah',
                value:
                  mustahikData.statusRumah.replace(
                    '_',
                    ' '
                  ),
              },
              {
                label:
                  'Tanggal Pengajuan',
                value:
                  formatDate(
                    userPengajuan.tanggalPengajuan
                  ),
              },
              {
                label:
                  'Tanggal Verifikasi',
                value:
                  userPengajuan.tanggalVerifikasi
                    ? formatDate(
                        userPengajuan.tanggalVerifikasi
                      )
                    : '-',
              },
            ].map(
              ({
                label,
                value,
              }) => (
                <div
                  key={label}
                >
                  <p className="text-xs text-slate-400">
                    {label}
                  </p>

                  <p className="font-medium text-slate-800 mt-0.5 capitalize">
                    {value}
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}