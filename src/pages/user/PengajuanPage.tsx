import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  FileText,
  Plus,
  Clock,
  ChevronRight,
  Info,
  Loader2,
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
  formatDate,
  formatNIK,
} from '@/lib/utils'

import {
  usePengajuan,
} from '@/context/PengajuanContext'

import {
  useAuth,
} from '@/context/AuthContext'

import axios from 'axios'

import type {
  Pengajuan,
  DataMustahik,
  StatusPengajuan,
} from '@/types'


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'


// ============================================================
// TYPES
// ============================================================

interface JawabanApi {
  id?: string

  nilai?: number | string

  kriteria?: {
    id?: string
    kode?: string
    nama?: string
  }

  subKriteria?: {
    id?: string
    nama?: string
    nilai?: number | string
  }
}


interface PengajuanApi {
  id: string
  userId: string
  mustahikId: string

  status?: string

  catatan?: string | null

  tanggalPengajuan?: string | null

  tanggalVerifikasi?: string | null

  createdAt?: string | null

  updatedAt?: string | null

  mustahik?: any

  jawaban?: JawabanApi[]

  verifications?: Array<{
    id?: string
    status?: string
    catatan?: string | null
    createdAt?: string | null
  }>
}


// ============================================================
// STATUS VALID
// ============================================================

const VALID_STATUSES: StatusPengajuan[] = [
  'DRAFT',
  'MENUNGGU_VERIFIKASI',
  'SEDANG_DIVERIFIKASI',
  'PERLU_PERBAIKAN',
  'LOLOS_VERIFIKASI',
  'DITOLAK',
  'DIPROSES_TOPSIS',
  'LAYAK_DIDANAI',
  'TIDAK_DIDANAI',
]


// ============================================================
// NORMALIZE STATUS
// ============================================================

function toStatusPengajuan(
  value: unknown
): StatusPengajuan {
  const status =
    String(
      value ||
      'DRAFT'
    ).toUpperCase()

  if (
    VALID_STATUSES.includes(
      status as StatusPengajuan
    )
  ) {
    return status as StatusPengajuan
  }

  return 'DRAFT'
}


// ============================================================
// HELPER DATE
// ============================================================

function safeDate(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return ''
  }

  const date =
    new Date(
      String(value)
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  return date
    .toISOString()
    .split('T')[0]
}


// ============================================================
// HELPER TEXT
// ============================================================

function normalizeText(
  value: unknown
): string {
  return String(
    value ??
    ''
  )
    .trim()
    .toLowerCase()
}


// ============================================================
// FORMAT STATUS RUMAH
// ============================================================

function formatStatusRumah(
  value?: string | null
): string {
  if (!value) {
    return '-'
  }

  const map: Record<
    string,
    string
  > = {
    milik_sendiri:
      'Milik Sendiri',

    sewa:
      'Sewa / Kontrak',

    menumpang:
      'Menumpang',

    dinas:
      'Rumah Dinas',
  }

  return (
    map[value] ||
    value
      .replace(
        /_/g,
        ' '
      )
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      )
  )
}


// ============================================================
// ADAPT PENGAJUAN
// ============================================================

function adaptPengajuan(
  p: PengajuanApi
): Pengajuan {
  const verifications =
    Array.isArray(
      p.verifications
    )
      ? p.verifications
      : []

  const latestVerification =
    verifications[0]

  const tanggalPengajuan =
    safeDate(
      p.tanggalPengajuan ||
      p.createdAt
    )

  const tanggalVerifikasi =
    safeDate(
      latestVerification?.createdAt ||
      p.tanggalVerifikasi
    )

  const catatan =
    latestVerification?.catatan ??
    p.catatan ??
    undefined

  return {
    id:
      p.id ||
      '',

    userId:
      p.userId ||
      '',

    mustahikId:
      p.mustahikId ||
      '',

    namaLengkap:
      p.mustahik
        ?.namaLengkap ||
      '',

    nik:
      p.mustahik
        ?.nik ||
      '',

    status:
      toStatusPengajuan(
        p.status
      ),

    tanggalPengajuan,

    tanggalVerifikasi:
      tanggalVerifikasi ||
      undefined,

    catatan,
  }
}


// ============================================================
// ADAPT DATA MUSTAHIK
// ============================================================

function adaptMustahik(
  data: any
): DataMustahik {
  const jenisKelamin =
    data?.jenisKelamin === 'P'
      ? 'P'
      : 'L'

  const statusPernikahan =
    [
      'belum_menikah',
      'menikah',
      'cerai_hidup',
      'cerai_mati',
    ].includes(
      data?.statusPernikahan
    )
      ? data.statusPernikahan
      : 'belum_menikah'

  const statusRumah =
    [
      'milik_sendiri',
      'sewa',
      'menumpang',
      'dinas',
    ].includes(
      data?.statusRumah
    )
      ? data.statusRumah
      : 'milik_sendiri'

  const kondisiRumah =
    [
      'baik',
      'sedang',
      'buruk',
    ].includes(
      data?.kondisiRumah
    )
      ? data.kondisiRumah
      : 'baik'

  const kepemilikanAset =
    data?.kepemilikanAset ===
    'tidak_ada'
      ? 'tidak_ada'
      : 'ada'

  return {
    id:
      String(
        data?.id ||
        ''
      ),

    userId:
      String(
        data?.userId ||
        ''
      ),

    nik:
      String(
        data?.nik ||
        ''
      ),

    namaLengkap:
      String(
        data?.namaLengkap ||
        ''
      ),

    tempatLahir:
      String(
        data?.tempatLahir ||
        ''
      ),

    tanggalLahir:
      safeDate(
        data?.tanggalLahir
      ),

    jenisKelamin,

    alamat:
      String(
        data?.alamat ||
        ''
      ),

    kelurahan:
      String(
        data?.kelurahan ||
        ''
      ),

    kecamatan:
      String(
        data?.kecamatan ||
        ''
      ),

    kota:
      String(
        data?.kota ||
        ''
      ),

    provinsi:
      String(
        data?.provinsi ||
        ''
      ),

    noHp:
      String(
        data?.noHp ||
        ''
      ),

    statusPernikahan,

    pekerjaan:
      String(
        data?.pekerjaan ||
        ''
      ),

    penghasilan:
      Number(
        data?.penghasilan ||
        0
      ),

    jumlahTanggungan:
      Number(
        data?.jumlahTanggungan ||
        0
      ),

    statusRumah,

    kondisiRumah,

    kepemilikanAset,
  }
}


// ============================================================
// AMBIL JAWABAN BERDASARKAN KODE
// ============================================================

function getAnswerByKode(
  jawaban: JawabanApi[],
  kode: string
): JawabanApi | undefined {
  return jawaban.find(
    (
      item
    ) =>
      normalizeText(
        item.kriteria?.kode
      ) ===
      normalizeText(
        kode
      )
  )
}


// ============================================================
// DISPLAY PENGHASILAN
// ============================================================

function getPenghasilanDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {
  if (
    mustahik &&
    mustahik.penghasilan >
    0
  ) {
    return `Rp ${mustahik.penghasilan.toLocaleString(
      'id-ID'
    )}`
  }

  return (
    getAnswerByKode(
      jawaban,
      'C1'
    )
      ?.subKriteria
      ?.nama ||
    '-'
  )
}


// ============================================================
// DISPLAY TANGGUNGAN
// ============================================================

function getTanggunganDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {
  if (
    mustahik &&
    mustahik.jumlahTanggungan >
    0
  ) {
    return `${mustahik.jumlahTanggungan} Orang`
  }

  return (
    getAnswerByKode(
      jawaban,
      'C2'
    )
      ?.subKriteria
      ?.nama ||
    '-'
  )
}


// ============================================================
// DISPLAY KONDISI RUMAH
// ============================================================

function getKondisiRumahDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {
  if (
    mustahik?.kondisiRumah
  ) {
    return mustahik
      .kondisiRumah
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      )
  }

  return (
    getAnswerByKode(
      jawaban,
      'C3'
    )
      ?.subKriteria
      ?.nama ||
    '-'
  )
}


// ============================================================
// DISPLAY PEKERJAAN
// ============================================================

function getPekerjaanDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {
  if (
    mustahik?.pekerjaan
  ) {
    return mustahik.pekerjaan
  }

  return (
    getAnswerByKode(
      jawaban,
      'C4'
    )
      ?.subKriteria
      ?.nama ||
    '-'
  )
}


// ============================================================
// DISPLAY ASET
// ============================================================

function getAsetDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {
  if (
    mustahik?.kepemilikanAset
  ) {
    return mustahik
      .kepemilikanAset ===
      'tidak_ada'
      ? 'Tidak memiliki aset'
      : 'Memiliki aset'
  }

  return (
    getAnswerByKode(
      jawaban,
      'C5'
    )
      ?.subKriteria
      ?.nama ||
    '-'
  )
}


// ============================================================
// PAGE
// ============================================================

export function PengajuanPage() {
  const {
    token,
  } =
    useAuth()

  const {
    pengajuan:
      contextPengajuan,
    setPengajuan,
  } =
    usePengajuan()

  const [
    pengajuan,
    setPengajuanLocal,
  ] =
    useState<
      Pengajuan | null
    >(
      contextPengajuan
    )

  const [
    mustahik,
    setMustahik,
  ] =
    useState<
      DataMustahik | null
    >(
      null
    )

  const [
    jawaban,
    setJawaban,
  ] =
    useState<
      JawabanApi[]
    >(
      []
    )

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
  // LOAD
  // ==========================================================

  useEffect(
    () => {
      let mounted = true

      const load =
        async () => {
          if (!token) {
            if (mounted) {
              setLoading(false)
            }

            return
          }

          try {
            if (mounted) {
              setLoading(true)
              setError('')
            }

            const headers = {
              Authorization:
                `Bearer ${token}`,
            }

            const [
              pengajuanRes,
              profileRes,
            ] =
              await Promise.all([
                axios.get(
                  `${API_URL}/pengajuan/me`,
                  {
                    headers,
                  }
                ),

                axios.get(
                  `${API_URL}/user/profile`,
                  {
                    headers,
                  }
                ),
              ])

            const list =
              Array.isArray(
                pengajuanRes
                  ?.data
                  ?.data
                  ?.pengajuan
              )
                ? pengajuanRes
                    .data
                    .data
                    .pengajuan
                : []

            const sortedList =
              [...list].sort(
                (
                  a: PengajuanApi,
                  b: PengajuanApi
                ) => {
                  const dateA =
                    new Date(
                      a.createdAt ||
                      a.tanggalPengajuan ||
                      0
                    ).getTime()

                  const dateB =
                    new Date(
                      b.createdAt ||
                      b.tanggalPengajuan ||
                      0
                    ).getTime()

                  return (
                    dateB -
                    dateA
                  )
                }
              )

            if (
              sortedList.length >
              0
            ) {
              const latest =
                sortedList[0] as PengajuanApi

              const adapted =
                adaptPengajuan(
                  latest
                )

              if (mounted) {
                setPengajuanLocal(
                  adapted
                )

                setPengajuan(
                  adapted
                )

                setJawaban(
                  Array.isArray(
                    latest.jawaban
                  )
                    ? latest.jawaban
                    : []
                )

                if (
                  latest.mustahik
                ) {
                  setMustahik(
                    adaptMustahik(
                      latest.mustahik
                    )
                  )
                }
              }
            } else {
              if (mounted) {
                setPengajuanLocal(null)
                setPengajuan(null)
                setJawaban([])
              }
            }

            const profileMustahik =
              profileRes
                ?.data
                ?.data
                ?.user
                ?.mustahik

            if (
              mounted &&
              profileMustahik
            ) {
              setMustahik(
                (
                  current
                ) =>
                  current ||
                  adaptMustahik(
                    profileMustahik
                  )
              )
            }

          } catch (
            e: any
          ) {
            console.error(
              'Gagal memuat pengajuan:',
              e
            )

            if (mounted) {
              setError(
                e?.response
                  ?.data
                  ?.message ||
                e?.message ||
                'Gagal memuat data pengajuan'
              )
            }
          } finally {
            if (mounted) {
              setLoading(false)
            }
          }
        }

      load()

      return () => {
        mounted = false
      }
    },
    [
      token,
      setPengajuan,
    ]
  )


  const hasExisting =
    Boolean(
      pengajuan
    )


  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />

        <span className="ml-2 text-sm text-slate-500">
          Memuat data pengajuan...
        </span>
      </div>
    )
  }


  return (
    <div className="space-y-6">

      <PageHeader
        title="Pengajuan Mustahik"
        description="Kelola pengajuan Anda sebagai calon penerima bantuan"
      >
        {!hasExisting && (
          <Button asChild>
            <Link to="/pengajuan/form">
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengajuan
            </Link>
          </Button>
        )}
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasExisting && pengajuan ? (
        <div className="space-y-4">

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">

                <div>
                  <CardTitle>
                    {pengajuan.namaLengkap ||
                      mustahik?.namaLengkap ||
                      '-'}
                  </CardTitle>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    NIK:{' '}

                    {formatNIK(
                      pengajuan.nik ||
                      mustahik?.nik ||
                      ''
                    )}
                  </p>
                </div>

                <StatusBadge
                  status={
                    pengajuan.status
                  }
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4 text-sm">

                <div>
                  <p className="text-xs text-slate-500">
                    ID Pengajuan
                  </p>

                  <p className="mt-0.5 font-mono text-xs font-semibold text-slate-900">
                    #
                    {pengajuan.id
                      .toUpperCase()
                      .substring(
                        0,
                        8
                      )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Tanggal Pengajuan
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-slate-900">
                    {pengajuan.tanggalPengajuan
                      ? formatDate(
                          pengajuan.tanggalPengajuan
                        )
                      : '-'}
                  </p>
                </div>

                {pengajuan.tanggalVerifikasi && (
                  <div>
                    <p className="text-xs text-slate-500">
                      Tanggal Verifikasi
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-slate-900">
                      {formatDate(
                        pengajuan.tanggalVerifikasi
                      )}
                    </p>
                  </div>
                )}

              </div>

              {pengajuan.catatan && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-xs font-semibold text-amber-800">
                        Catatan Admin:
                      </p>

                      <p className="mt-0.5 text-sm text-amber-700">
                        {pengajuan.catatan}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link to="/pantau-hasil">
                  <Clock className="mr-2 h-4 w-4" />
                  Pantau Hasil
                </Link>
              </Button>

            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">

                <CardTitle>
                  Data Diri Mustahik
                </CardTitle>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link
                    to="/pengajuan/form"
                    className="flex items-center gap-1 text-xs text-green-600"
                  >
                    Edit Data

                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>

              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">

                <div>
                  <p className="text-xs text-slate-400">
                    Nama Lengkap
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {mustahik?.namaLengkap ||
                      '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    NIK
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {mustahik?.nik
                      ? formatNIK(
                          mustahik.nik
                        )
                      : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Tempat Lahir
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {mustahik?.tempatLahir ||
                      '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Status Pekerjaan
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {getPekerjaanDisplay(
                      mustahik,
                      jawaban
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Alamat
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {[
                      mustahik?.alamat,
                      mustahik?.kota,
                    ]
                      .filter(Boolean)
                      .join(', ') ||
                      '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Status Rumah
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {formatStatusRumah(
                      mustahik?.statusRumah
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Kondisi Rumah
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {getKondisiRumahDisplay(
                      mustahik,
                      jawaban
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Jumlah Tanggungan
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {getTanggunganDisplay(
                      mustahik,
                      jawaban
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Penghasilan
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {getPenghasilanDisplay(
                      mustahik,
                      jawaban
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Kepemilikan Aset
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-800">
                    {getAsetDisplay(
                      mustahik,
                      jawaban
                    )}
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <FileText className="h-8 w-8 text-green-600" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Belum Ada Pengajuan
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Anda belum memiliki pengajuan.
              Klik tombol di bawah untuk memulai proses
              pengajuan mustahik.
            </p>

            <Button
              asChild
              className="mt-6"
            >
              <Link to="/pengajuan/form">
                <Plus className="mr-2 h-4 w-4" />
                Mulai Pengajuan
              </Link>
            </Button>

          </CardContent>
        </Card>
      )}

    </div>
  )
}