import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom'

import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Briefcase,
  Home,
  ShieldCheck,
  Clock,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react'

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
  getAdminMustahikDetail,
} from '@/lib/adminApi'

import {
  formatCurrency,
  formatDate,
  formatNIK,
  getJenisKelaminLabel,
  getStatusPernikahanLabel,
  getKondisiRumahLabel,
  getStatusRumahLabel,
} from '@/lib/utils'

import type {
  AdminMustahik,
  AdminJawaban,
} from '@/lib/adminApi'

// ============================================================
// HELPER
// ============================================================

function safeNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const numberValue =
    typeof value === 'number'
      ? value
      : Number(value)

  if (
    !Number.isFinite(
      numberValue
    )
  ) {
    return null
  }

  return numberValue
}

function safeJenisKelamin(
  value: unknown
): 'L' | 'P' | null {
  if (
    value === 'L' ||
    value === 'P'
  ) {
    return value
  }

  return null
}

function safeFormatDate(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '-'
  }

  try {
    const date =
      new Date(
        String(value)
      )

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '-'
    }

    return formatDate(
      date
    )
  } catch {
    return '-'
  }
}

// ============================================================
// AMBIL JAWABAN KUESIONER BERDASARKAN KODE KRITERIA
// ============================================================
//
// C1 = Penghasilan
// C2 = Jumlah Tanggungan
// C3 = Kondisi Rumah
// C4 = Status Pekerjaan
// C5 = Kepemilikan Aset
//
// Data kuesioner diprioritaskan karena merupakan data
// yang benar-benar dipilih oleh user saat mengisi kuesioner.
// ============================================================

function getJawabanKuesioner(
  jawaban: AdminJawaban[],
  kode: string
): string | null {
  const item =
    jawaban.find(
      (
        answer
      ) =>
        answer.kriteria?.kode ===
        kode
    )

  return (
    item?.subKriteria?.nama ||
    null
  )
}

// ============================================================
// PAGE
// ============================================================

export function DetailMustahikPage() {
  const {
    id,
  } = useParams<{
    id: string
  }>()

  const navigate =
    useNavigate()

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    mustahik,
    setMustahik,
  ] =
    useState<
      AdminMustahik | null
    >(null)

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState('')

  // ==========================================================
  // LOAD DETAIL MUSTAHIK
  // ==========================================================

  useEffect(() => {
    let mounted = true

    const load =
      async () => {
        if (!id) {
          if (mounted) {
            setError(
              'ID mustahik tidak ditemukan.'
            )

            setLoading(
              false
            )
          }

          return
        }

        try {
          if (mounted) {
            setLoading(
              true
            )

            setError('')
          }

          const result =
            await getAdminMustahikDetail(
              id
            )

          if (mounted) {
            setMustahik(
              result.mustahik
            )
          }
        } catch (
          requestError: any
        ) {
          console.error(
            'GET DETAIL MUSTAHIK ERROR:',
            requestError
          )

          if (mounted) {
            setError(
              requestError
                ?.response
                ?.data
                ?.message ||
                requestError
                  ?.message ||
                'Gagal mengambil detail mustahik dari database.'
            )
          }
        } finally {
          if (mounted) {
            setLoading(
              false
            )
          }
        }
      }

    load()

    return () => {
      mounted = false
    }
  }, [id])

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <PageHeader
          title="Detail Data Mustahik"
          description="Memuat data dari database..."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                '/admin/mustahik'
              )
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />

            Kembali
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="flex items-center justify-center py-20">

            <Loader2 className="w-6 h-6 animate-spin text-green-600" />

            <span className="ml-3 text-sm text-slate-500">
              Memuat data mustahik...
            </span>

          </CardContent>
        </Card>

      </div>
    )
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error ||
    !mustahik
  ) {
    return (
      <div className="space-y-6">

        <PageHeader
          title="Detail Data Mustahik"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                '/admin/mustahik'
              )
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />

            Kembali
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="py-16">

            <div className="flex flex-col items-center justify-center text-center">

              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="font-semibold text-slate-900">
                Data tidak ditemukan
              </h3>

              <p className="text-sm text-slate-500 mt-1 max-w-md">
                {
                  error ||
                  'Data mustahik tidak ditemukan di database.'
                }
              </p>

              <Button
                className="mt-5"
                onClick={() =>
                  navigate(
                    '/admin/mustahik'
                  )
                }
              >
                Kembali ke Data Mustahik
              </Button>

            </div>

          </CardContent>
        </Card>

      </div>
    )
  }

  // ==========================================================
  // DATA PENGAJUAN TERBARU
  // ==========================================================

  const pengajuan =
    Array.isArray(
      mustahik.pengajuan
    )
      ? mustahik.pengajuan[0]
      : undefined

  const status =
    pengajuan?.status ||
    'DRAFT'

  // ==========================================================
  // JAWABAN KUESIONER
  // ==========================================================

  const jawabanKuesioner =
    pengajuan?.jawaban ||
    []

  const penghasilanKuesioner =
    getJawabanKuesioner(
      jawabanKuesioner,
      'C1'
    )

  const tanggunganKuesioner =
    getJawabanKuesioner(
      jawabanKuesioner,
      'C2'
    )

  const kondisiRumahKuesioner =
    getJawabanKuesioner(
      jawabanKuesioner,
      'C3'
    )

  const pekerjaanKuesioner =
    getJawabanKuesioner(
      jawabanKuesioner,
      'C4'
    )

  const asetKuesioner =
    getJawabanKuesioner(
      jawabanKuesioner,
      'C5'
    )

  // ==========================================================
  // SAFE VALUES DARI DATA MUSTAHIK
  // ==========================================================

  const jenisKelamin =
    safeJenisKelamin(
      mustahik.jenisKelamin
    )

  const penghasilan =
    safeNumber(
      mustahik.penghasilan
    )

  const jumlahTanggungan =
    safeNumber(
      mustahik.jumlahTanggungan
    )

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        title="Detail Data Mustahik"
        description="Informasi lengkap mustahik dari database"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate(
              '/admin/mustahik'
            )
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />

          Kembali
        </Button>
      </PageHeader>

      {/* ======================================================
          HEADER USER
      ====================================================== */}

      <Card>
        <CardContent className="pt-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">

                {
                  (
                    mustahik.namaLengkap ||
                    'M'
                  )
                    .charAt(0)
                    .toUpperCase()
                }

              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-xl font-bold text-slate-900">
                    {
                      mustahik.namaLengkap ||
                      '-'
                    }
                  </h2>

                  <StatusBadge
                    status={
                      status as any
                    }
                  />

                </div>

                <p className="text-xs text-slate-400 font-mono mt-1">
                  NIK:{' '}

                  {
                    mustahik.nik
                      ? formatNIK(
                          mustahik.nik
                        )
                      : '-'
                  }
                </p>

                {
                  mustahik.user && (
                    <div className="mt-2 space-y-0.5">

                      <p className="text-xs text-slate-500">
                        Akun:{' '}

                        <span className="font-medium text-slate-700">
                          {
                            mustahik.user.name
                          }
                        </span>
                      </p>

                      <p className="text-xs text-slate-500">
                        Email:{' '}

                        <span className="font-medium text-slate-700">
                          {
                            mustahik.user.email
                          }
                        </span>
                      </p>

                    </div>
                  )
                }

              </div>

            </div>

            {
              pengajuan && (
                <Button
                  asChild
                  size="sm"
                >
                  <Link
                    to={`/admin/verifikasi/${pengajuan.id}`}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />

                    Verifikasi Pengajuan
                  </Link>
                </Button>
              )
            }

          </div>

        </CardContent>
      </Card>

      {/* ======================================================
          GRID DETAIL
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ====================================================
            IDENTITAS
        ==================================================== */}

        <Card>

          <CardHeader>

            <div className="flex items-center gap-2">

              <User className="w-4 h-4 text-green-600" />

              <CardTitle>
                Identitas Diri
              </CardTitle>

            </div>

          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            <div className="grid grid-cols-2 gap-4">

              <div>

                <p className="text-xs text-slate-400">
                  NIK
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.nik
                      ? formatNIK(
                          mustahik.nik
                        )
                      : '-'
                  }
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Nama Lengkap
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.namaLengkap ||
                    '-'
                  }
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Tempat Lahir
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.tempatLahir ||
                    '-'
                  }
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Tanggal Lahir
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    safeFormatDate(
                      mustahik.tanggalLahir
                    )
                  }
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Jenis Kelamin
                </p>

                <p className="font-medium text-slate-800 mt-0.5">

                  {
                    jenisKelamin
                      ? getJenisKelaminLabel(
                          jenisKelamin
                        )
                      : '-'
                  }

                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Status Pernikahan
                </p>

                <p className="font-medium text-slate-800 mt-0.5">

                  {
                    mustahik.statusPernikahan
                      ? getStatusPernikahanLabel(
                          mustahik.statusPernikahan
                        )
                      : '-'
                  }

                </p>

              </div>

              <div className="col-span-2">

                <div className="flex items-center gap-2">

                  <Phone className="w-3.5 h-3.5 text-green-600" />

                  <p className="text-xs text-slate-400">
                    Nomor HP
                  </p>

                </div>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.user?.phone ||
                    mustahik.noHp ||
                    '-'
                  }
                </p>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* ====================================================
            ALAMAT
        ==================================================== */}

        <Card>

          <CardHeader>

            <div className="flex items-center gap-2">

              <MapPin className="w-4 h-4 text-green-600" />

              <CardTitle>
                Alamat Tempat Tinggal
              </CardTitle>

            </div>

          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            <div>

              <p className="text-xs text-slate-400">
                Alamat Lengkap
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {
                  mustahik.alamat ||
                  '-'
                }
              </p>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <p className="text-xs text-slate-400">
                  Kelurahan
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.kelurahan ||
                    '-'
                  }
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Kecamatan
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.kecamatan ||
                    '-'
                  }
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Kota / Kabupaten
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.kota ||
                    '-'
                  }
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Provinsi
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    mustahik.provinsi ||
                    '-'
                  }
                </p>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* ====================================================
            KONDISI EKONOMI
        ==================================================== */}

        <Card>

          <CardHeader>

            <div className="flex items-center gap-2">

              <Briefcase className="w-4 h-4 text-green-600" />

              <CardTitle>
                Kondisi Ekonomi
              </CardTitle>

            </div>

          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            <div className="grid grid-cols-2 gap-4">

              {/* PEKERJAAN DARI C4 */}

              <div>

                <p className="text-xs text-slate-400">
                  Pekerjaan Utama
                </p>

                <p className="font-medium text-slate-800 mt-0.5">
                  {
                    pekerjaanKuesioner ||
                    mustahik.pekerjaan ||
                    '-'
                  }
                </p>

              </div>

              {/* PENGHASILAN DARI C1 */}

              <div>

                <p className="text-xs text-slate-400">
                  Penghasilan per Bulan
                </p>

                <p className="font-medium text-slate-800 mt-0.5">

                  {
                    penghasilanKuesioner ||
                    (
                      penghasilan !== null
                        ? formatCurrency(
                            penghasilan
                          )
                        : '-'
                    )
                  }

                </p>

              </div>

              {/* JUMLAH TANGGUNGAN DARI C2 */}

              <div>

                <p className="text-xs text-slate-400">
                  Jumlah Tanggungan
                </p>

                <p className="font-medium text-slate-800 mt-0.5">

                  {
                    tanggunganKuesioner ||
                    (
                      jumlahTanggungan !== null
                        ? `${jumlahTanggungan} Orang`
                        : '-'
                    )
                  }

                </p>

              </div>

              {/* KEPEMILIKAN ASET DARI C5 */}

              <div>

                <p className="text-xs text-slate-400">
                  Kepemilikan Aset
                </p>

                <p className="font-medium text-slate-800 mt-0.5 capitalize">

                  {
                    asetKuesioner ||
                    (
                      mustahik.kepemilikanAset
                        ? mustahik.kepemilikanAset.replace(
                            /_/g,
                            ' '
                          )
                        : '-'
                    )
                  }

                </p>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* ====================================================
            TEMPAT TINGGAL
        ==================================================== */}

        <Card>

          <CardHeader>

            <div className="flex items-center gap-2">

              <Home className="w-4 h-4 text-green-600" />

              <CardTitle>
                Kondisi Tempat Tinggal
              </CardTitle>

            </div>

          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            <div className="grid grid-cols-2 gap-4">

              {/* STATUS RUMAH */}

              <div>

                <p className="text-xs text-slate-400">
                  Status Kepemilikan
                </p>

                <p className="font-medium text-slate-800 mt-0.5">

                  {
                    mustahik.statusRumah
                      ? getStatusRumahLabel(
                          mustahik.statusRumah
                        )
                      : '-'
                  }

                </p>

              </div>

              {/* KONDISI RUMAH DARI C3 */}

              <div>

                <p className="text-xs text-slate-400">
                  Kondisi Fisik
                </p>

                <p className="font-medium text-slate-800 mt-0.5">

                  {
                    kondisiRumahKuesioner ||
                    (
                      mustahik.kondisiRumah
                        ? getKondisiRumahLabel(
                            mustahik.kondisiRumah
                          )
                        : '-'
                    )
                  }

                </p>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* ======================================================
          INFORMASI PENGAJUAN
      ====================================================== */}

      {
        pengajuan && (
          <Card>

            <CardHeader>

              <div className="flex items-center gap-2">

                <FileText className="w-4 h-4 text-green-600" />

                <CardTitle>
                  Informasi Pengajuan
                </CardTitle>

              </div>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

                <div>

                  <p className="text-xs text-slate-400">
                    ID Pengajuan
                  </p>

                  <p className="font-mono font-medium text-slate-800 mt-1 break-all">
                    {
                      pengajuan.id
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <div className="mt-1">

                    <StatusBadge
                      status={
                        status as any
                      }
                    />

                  </div>

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Tanggal Pengajuan
                  </p>

                  <p className="font-medium text-slate-800 mt-1">

                    {
                      safeFormatDate(
                        pengajuan.tanggalPengajuan
                      )
                    }

                  </p>

                </div>

              </div>

              {
                pengajuan.catatan && (
                  <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">

                    <p className="text-xs font-semibold text-amber-800">
                      Catatan Verifikasi
                    </p>

                    <p className="text-sm text-amber-700 mt-1">
                      {
                        pengajuan.catatan
                      }
                    </p>

                  </div>
                )
              }

            </CardContent>

          </Card>
        )
      }

      {/* ======================================================
          DATA AKUN
      ====================================================== */}

      {
        mustahik.user && (
          <Card>

            <CardHeader>

              <div className="flex items-center gap-2">

                <User className="w-4 h-4 text-green-600" />

                <CardTitle>
                  Akun Pengguna
                </CardTitle>

              </div>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

                <div>

                  <p className="text-xs text-slate-400">
                    Nama Akun
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {
                      mustahik.user.name
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <p className="font-medium text-slate-800 mt-1 break-all">
                    {
                      mustahik.user.email
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Nomor HP Akun
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {
                      mustahik.user.phone ||
                      '-'
                    }
                  </p>

                </div>

              </div>

            </CardContent>

          </Card>
        )
      }

      {/* ======================================================
          RIWAYAT VERIFIKASI
      ====================================================== */}

      {
        pengajuan &&
        Array.isArray(
          pengajuan.verifications
        ) &&
        pengajuan.verifications.length > 0 && (
          <Card>

            <CardHeader>

              <div className="flex items-center gap-2">

                <Clock className="w-4 h-4 text-green-600" />

                <CardTitle>
                  Riwayat Verifikasi
                </CardTitle>

              </div>

            </CardHeader>

            <CardContent className="space-y-3">

              {
                pengajuan.verifications.map(
                  (
                    verification: any
                  ) => (
                    <div
                      key={
                        verification.id
                      }
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                        <div>

                          <p className="font-semibold text-slate-800">
                            Status:{' '}

                            {
                              verification.status
                            }
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            Diverifikasi oleh:{' '}

                            {
                              verification
                                .admin
                                ?.name ||
                              '-'
                            }
                          </p>

                        </div>

                        <span className="text-xs text-slate-400">

                          {
                            safeFormatDate(
                              verification.createdAt
                            )
                          }

                        </span>

                      </div>

                      {
                        verification.catatan && (
                          <p className="text-sm text-slate-600 mt-3">
                            {
                              verification.catatan
                            }
                          </p>
                        )
                      }

                    </div>
                  )
                )
              }

            </CardContent>

          </Card>
        )
      }

    </div>
  )
}