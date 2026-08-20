import {
  useState,
  useEffect,
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

  status: string

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
      p?.verifications
    )
      ? p.verifications
      : []

  const latestVerification =
    verifications.length >
    0
      ? verifications[0]
      : undefined

  const tanggalPengajuan =
    safeDate(
      p?.tanggalPengajuan ||
      p?.createdAt
    )

  const tanggalVerifikasi =
    safeDate(
      latestVerification?.createdAt ||
      p?.tanggalVerifikasi
    )

  const catatan =
    latestVerification?.catatan ??
    p?.catatan ??
    undefined

  return {
    id:
      p?.id ??
      '',

    userId:
      p?.userId ??
      '',

    mustahikId:
      p?.mustahikId ??
      '',

    namaLengkap:
      p?.mustahik?.namaLengkap ??
      '',

    nik:
      p?.mustahik?.nik ??
      '',

    status:
      p?.status ??
      'DRAFT',

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

  return {
    id:
      data?.id ??
      '',

    userId:
      data?.userId ??
      '',

    nik:
      data?.nik ??
      '',

    namaLengkap:
      data?.namaLengkap ??
      '',

    tempatLahir:
      data?.tempatLahir ??
      '',

    tanggalLahir:
      safeDate(
        data?.tanggalLahir
      ),

    jenisKelamin:
      data?.jenisKelamin ??
      '',

    alamat:
      data?.alamat ??
      '',

    kelurahan:
      data?.kelurahan ??
      '',

    kecamatan:
      data?.kecamatan ??
      '',

    kota:
      data?.kota ??
      '',

    provinsi:
      data?.provinsi ??
      '',

    noHp:
      data?.noHp ??
      '',

    statusPernikahan:
      data?.statusPernikahan ??
      '',

    pekerjaan:
      data?.pekerjaan ??
      '',

    penghasilan:
      data?.penghasilan !==
      null &&
      data?.penghasilan !==
      undefined &&
      data?.penghasilan !==
      ''
        ? Number(
            data.penghasilan
          )
        : 0,

    jumlahTanggungan:
      data?.jumlahTanggungan !==
      null &&
      data?.jumlahTanggungan !==
      undefined &&
      data?.jumlahTanggungan !==
      ''
        ? Number(
            data.jumlahTanggungan
          )
        : 0,

    statusRumah:
      data?.statusRumah ??
      '',

    kondisiRumah:
      data?.kondisiRumah ??
      '',

    kepemilikanAset:
      data?.kepemilikanAset ??
      '',
  }
}


// ============================================================
// AMBIL JAWABAN BERDASARKAN KODE KRITERIA
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
        item?.kriteria?.kode
      ) ===
      normalizeText(
        kode
      )
  )
}


// ============================================================
// FORMAT PENGHASILAN DARI KUESIONER
// ============================================================
//
// C1:
// < Rp 500.000
// Rp 500.001 - Rp 1.000.000
// Rp 1.000.001 - Rp 1.500.000
// Rp 1.500.001 - Rp 2.000.000
// > Rp 2.000.000
//
// ============================================================

function getPenghasilanDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {

  if (
    mustahik?.penghasilan &&
    mustahik.penghasilan > 0
  ) {
    return `Rp ${mustahik.penghasilan.toLocaleString(
      'id-ID'
    )}`
  }

  const answer =
    getAnswerByKode(
      jawaban,
      'C1'
    )

  const nama =
    answer?.subKriteria?.nama

  if (nama) {
    return nama
  }

  return '-'
}


// ============================================================
// FORMAT JUMLAH TANGGUNGAN
// ============================================================

function getTanggunganDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {

  if (
    mustahik?.jumlahTanggungan !==
    null &&
    mustahik?.jumlahTanggungan !==
    undefined &&
    mustahik.jumlahTanggungan >
    0
  ) {
    return `${mustahik.jumlahTanggungan} Orang`
  }

  const answer =
    getAnswerByKode(
      jawaban,
      'C2'
    )

  const nama =
    answer?.subKriteria?.nama

  if (nama) {
    return nama
  }

  return '-'
}


// ============================================================
// FORMAT KONDISI RUMAH
// ============================================================

function getKondisiRumahDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {

  if (
    mustahik?.kondisiRumah
  ) {
    return mustahik.kondisiRumah
  }

  const answer =
    getAnswerByKode(
      jawaban,
      'C3'
    )

  return (
    answer?.subKriteria?.nama ||
    '-'
  )
}


// ============================================================
// FORMAT PEKERJAAN
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

  const answer =
    getAnswerByKode(
      jawaban,
      'C4'
    )

  return (
    answer?.subKriteria?.nama ||
    '-'
  )
}


// ============================================================
// FORMAT KEPEMILIKAN ASET
// ============================================================

function getAsetDisplay(
  mustahik: DataMustahik | null,
  jawaban: JawabanApi[]
): string {

  if (
    mustahik?.kepemilikanAset
  ) {
    return mustahik.kepemilikanAset
  }

  const answer =
    getAnswerByKode(
      jawaban,
      'C5'
    )

  return (
    answer?.subKriteria?.nama ||
    '-'
  )
}


// ============================================================
// PAGE
// ============================================================

export function PengajuanPage() {

  // ==========================================================
  // AUTH
  // ==========================================================

  const {
    token,
  } =
    useAuth()


  // ==========================================================
  // CONTEXT
  // ==========================================================

  const {
    pengajuan:
      contextPengajuan,

    setPengajuan,
  } =
    usePengajuan()


  // ==========================================================
  // STATE
  // ==========================================================

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
    useState(
      true
    )


  const [
    error,
    setError,
  ] =
    useState(
      ''
    )


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(
    () => {

      let mounted =
        true


      const load =
        async () => {

          if (
            !token
          ) {

            if (
              mounted
            ) {
              setLoading(
                false
              )
            }

            return
          }


          try {

            if (
              mounted
            ) {
              setLoading(
                true
              )

              setError(
                ''
              )
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


            // ================================================
            // PENGAJUAN
            // ================================================

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
                      a?.createdAt ||
                      a?.tanggalPengajuan ||
                      0
                    ).getTime()

                  const dateB =
                    new Date(
                      b?.createdAt ||
                      b?.tanggalPengajuan ||
                      0
                    ).getTime()

                  return (
                    dateB -
                    dateA
                  )
                }
              )


            if (
              mounted
            ) {

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


                setPengajuanLocal(
                  adapted
                )


                setPengajuan(
                  adapted
                )


                // ============================================
                // JAWABAN KUESIONER
                // ============================================

                setJawaban(
                  Array.isArray(
                    latest?.jawaban
                  )
                    ? latest.jawaban
                    : []
                )


                // ============================================
                // MUSTAHIK DARI PENGAJUAN
                //
                // Ini lebih diprioritaskan karena sudah
                // satu relasi dengan pengajuan yang aktif.
                // ============================================

                if (
                  latest?.mustahik
                ) {

                  setMustahik(
                    adaptMustahik(
                      latest.mustahik
                    )
                  )
                }

              } else {

                setPengajuanLocal(
                  null
                )

                setPengajuan(
                  null
                )

                setJawaban(
                  []
                )
              }
            }


            // ================================================
            // PROFILE MUSTAHIK
            //
            // Dipakai jika data mustahik belum tersedia dari
            // endpoint pengajuan.
            // ================================================

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


            if (
              mounted
            ) {

              setError(
                e?.response
                  ?.data
                  ?.message ||
                e?.message ||
                'Gagal memuat data pengajuan'
              )
            }

          } finally {

            if (
              mounted
            ) {
              setLoading(
                false
              )
            }
          }
        }


      load()


      return () => {
        mounted =
          false
      }

    },
    [
      token,
    ]
  )


  // ==========================================================
  // EXISTING
  // ==========================================================

  const hasExisting =
    !!pengajuan


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading
  ) {

    return (
      <div className="flex items-center justify-center h-48">

        <Loader2
          className="w-6 h-6 animate-spin text-green-600"
        />

        <span className="ml-2 text-sm text-slate-500">
          Memuat data pengajuan...
        </span>

      </div>
    )
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="space-y-6">


      {/* HEADER */}

      <PageHeader
        title="Pengajuan Mustahik"
        description="Kelola pengajuan Anda sebagai calon penerima bantuan"
      >

        {!hasExisting && (

          <Button asChild>

            <Link
              to="/pengajuan/form"
            >

              <Plus className="w-4 h-4 mr-2" />

              Buat Pengajuan

            </Link>

          </Button>

        )}

      </PageHeader>


      {/* ERROR */}

      {error && (

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </div>

      )}


      {/* ADA PENGAJUAN */}

      {hasExisting ? (

        <div className="space-y-4">


          {/* PENGAJUAN */}

          <Card>

            <CardHeader>

              <div className="flex items-start justify-between gap-3">

                <div>

                  <CardTitle>

                    {pengajuan?.namaLengkap ||
                      mustahik?.namaLengkap ||
                      '-'}

                  </CardTitle>


                  <p className="text-xs text-slate-400 mt-1 font-mono">

                    NIK:{' '}

                    {formatNIK(
                      pengajuan?.nik ||
                      mustahik?.nik ||
                      ''
                    )}

                  </p>

                </div>


                <StatusBadge
                  status={
                    pengajuan?.status ||
                    'DRAFT'
                  }
                />

              </div>

            </CardHeader>


            <CardContent className="space-y-4">


              <div className="grid grid-cols-2 gap-4 text-sm">


                <div>

                  <p className="text-slate-500 text-xs">
                    ID Pengajuan
                  </p>


                  <p className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs mt-0.5">

                    #
                    {pengajuan?.id
                      ? pengajuan.id
                          .toUpperCase()
                          .substring(
                            0,
                            8
                          )
                      : '-'}

                  </p>

                </div>


                <div>

                  <p className="text-slate-500 text-xs">
                    Tanggal Pengajuan
                  </p>


                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">

                    {pengajuan?.tanggalPengajuan
                      ? formatDate(
                          pengajuan.tanggalPengajuan
                        )
                      : '-'}

                  </p>

                </div>


                {pengajuan?.tanggalVerifikasi && (

                  <div>

                    <p className="text-slate-500 text-xs">
                      Tanggal Verifikasi
                    </p>


                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">

                      {formatDate(
                        pengajuan.tanggalVerifikasi
                      )}

                    </p>

                  </div>

                )}

              </div>


              {/* CATATAN ADMIN */}

              {pengajuan?.catatan && (

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800">

                  <div className="flex gap-2">

                    <Info
                      className="w-4 h-4 text-amber-600 mt-0.5 shrink-0"
                    />


                    <div>

                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">

                        Catatan Admin:

                      </p>


                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">

                        {pengajuan.catatan}

                      </p>

                    </div>

                  </div>

                </div>

              )}


              {/* ACTION */}

              <div className="flex gap-2">

                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                >

                  <Link
                    to="/pantau-hasil"
                  >

                    <Clock className="w-4 h-4 mr-2" />

                    Pantau Hasil

                  </Link>

                </Button>

              </div>

            </CardContent>

          </Card>


          {/* DATA MUSTAHIK */}

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
                    className="text-xs text-green-600 flex items-center gap-1"
                  >

                    Edit Data

                    <ChevronRight
                      className="w-3 h-3"
                    />

                  </Link>

                </Button>

              </div>

            </CardHeader>


            <CardContent>

              <div className="grid grid-cols-2 gap-3 text-sm">


                {/* NAMA */}

                <div>

                  <p className="text-xs text-slate-400">
                    Nama Lengkap
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs capitalize">

                    {mustahik?.namaLengkap ||
                      '-'}

                  </p>

                </div>


                {/* NIK */}

                <div>

                  <p className="text-xs text-slate-400">
                    NIK
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                    {mustahik?.nik
                      ? formatNIK(
                          mustahik.nik
                        )
                      : '-'}

                  </p>

                </div>


                {/* TEMPAT LAHIR */}

                <div>

                  <p className="text-xs text-slate-400">
                    Tempat Lahir
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs capitalize">

                    {mustahik?.tempatLahir ||
                      '-'}

                  </p>

                </div>


                {/* PEKERJAAN DARI KUESIONER */}

                <div>

                  <p className="text-xs text-slate-400">
                    Status Pekerjaan
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                    {getPekerjaanDisplay(
                      mustahik,
                      jawaban
                    )}

                  </p>

                </div>


                {/* ALAMAT */}

                <div>

                  <p className="text-xs text-slate-400">
                    Alamat
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs capitalize">

                    {[
                      mustahik?.alamat,
                      mustahik?.kota,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(', ') ||
                      '-'}

                  </p>

                </div>


                {/* STATUS RUMAH */}

                <div>

                  <p className="text-xs text-slate-400">
                    Status Rumah
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                    {formatStatusRumah(
                      mustahik?.statusRumah
                    )}

                  </p>

                </div>


                {/* KONDISI RUMAH */}

                <div>

                  <p className="text-xs text-slate-400">
                    Kondisi Rumah
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                    {getKondisiRumahDisplay(
                      mustahik,
                      jawaban
                    )}

                  </p>

                </div>


                {/* JUMLAH TANGGUNGAN */}

                <div>

                  <p className="text-xs text-slate-400">
                    Jumlah Tanggungan
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                    {getTanggunganDisplay(
                      mustahik,
                      jawaban
                    )}

                  </p>

                </div>


                {/* PENGHASILAN */}

                <div>

                  <p className="text-xs text-slate-400">
                    Penghasilan
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                    {getPenghasilanDisplay(
                      mustahik,
                      jawaban
                    )}

                  </p>

                </div>


                {/* KEPEMILIKAN ASET */}

                <div>

                  <p className="text-xs text-slate-400">
                    Kepemilikan Aset
                  </p>


                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

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

            <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">

              <FileText
                className="w-8 h-8 text-green-600"
              />

            </div>


            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">

              Belum Ada Pengajuan

            </h3>


            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">

              Anda belum memiliki pengajuan.
              Klik tombol di bawah untuk
              memulai proses pengajuan mustahik.

            </p>


            <Button
              asChild
              className="mt-6"
            >

              <Link
                to="/pengajuan/form"
              >

                <Plus className="w-4 h-4 mr-2" />

                Mulai Pengajuan

              </Link>

            </Button>

          </CardContent>

        </Card>

      )}

    </div>
  )
}