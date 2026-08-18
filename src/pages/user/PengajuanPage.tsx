import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  'http://localhost:5000/api'


// ============================================================
// HELPER DATE
// ============================================================
//
// Supaya halaman tidak blank apabila backend mengirim:
// - null
// - undefined
// - string kosong
// - tanggal invalid
//
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
// ADAPT PENGAJUAN
// ============================================================
//
// Backend mengembalikan:
// {
//   id,
//   userId,
//   mustahik,
//   status,
//   verifications: [...]
// }
//
// Backend sudah kita atur:
// createdAt DESC
//
// Jadi:
// verifications[0]
// = verifikasi TERBARU
//
// ============================================================

function adaptPengajuan(
  p: any
): Pengajuan {

  // ----------------------------------------------------------
  // Ambil verifikasi terbaru
  // ----------------------------------------------------------

  const verifications =
    Array.isArray(
      p?.verifications
    )
      ? p.verifications
      : []

  const latestVerification =
    verifications.length > 0
      ? verifications[0]
      : undefined


  // ----------------------------------------------------------
  // Tanggal pengajuan
  // ----------------------------------------------------------
  //
  // Prioritas:
  // 1. tanggalPengajuan
  // 2. createdAt
  //
  // ----------------------------------------------------------

  const tanggalPengajuan =
    safeDate(
      p?.tanggalPengajuan ||
      p?.createdAt
    )


  // ----------------------------------------------------------
  // Tanggal verifikasi
  // ----------------------------------------------------------

  const tanggalVerifikasi =
    safeDate(
      latestVerification?.createdAt ||
      p?.tanggalVerifikasi
    )


  // ----------------------------------------------------------
  // Catatan
  // ----------------------------------------------------------
  //
  // Prioritas:
  //
  // 1. catatan verifikasi terbaru
  // 2. catatan pengajuan
  //
  // Ini yang memperbaiki masalah:
  //
  // Admin:
  // DITOLAK
  // "Catatan lama"
  //
  // kemudian:
  //
  // LOLOS
  // "Catatan baru"
  //
  // User akan melihat:
  // "Catatan baru"
  //
  // ----------------------------------------------------------

  const catatan =
    latestVerification?.catatan ??
    p?.catatan ??
    undefined


  // ----------------------------------------------------------
  // Return
  // ----------------------------------------------------------

  return {
    id:
      p?.id ?? '',

    userId:
      p?.userId ?? '',

    mustahikId:
      p?.mustahikId ?? '',

    namaLengkap:
      p?.mustahik?.namaLengkap ??
      p?.namaLengkap ??
      '',

    nik:
      p?.mustahik?.nik ??
      p?.nik ??
      '',

    status:
      p?.status ?? 'DRAFT',

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
//
// Semua data dibuat aman agar frontend tidak crash ketika
// ada field null dari database.
// ============================================================

function adaptMustahik(
  data: any
): DataMustahik {

  return {
    id:
      data?.id ?? '',

    userId:
      data?.userId ?? '',

    nik:
      data?.nik ?? '',

    namaLengkap:
      data?.namaLengkap ?? '',

    tempatLahir:
      data?.tempatLahir ?? '',

    tanggalLahir:
      safeDate(
        data?.tanggalLahir
      ),

    jenisKelamin:
      data?.jenisKelamin ??
      'L',

    alamat:
      data?.alamat ?? '',

    kelurahan:
      data?.kelurahan ?? '',

    kecamatan:
      data?.kecamatan ?? '',

    kota:
      data?.kota ?? '',

    provinsi:
      data?.provinsi ?? '',

    noHp:
      data?.noHp ?? '',

    statusPernikahan:
      data?.statusPernikahan ??
      'belum_menikah',

    pekerjaan:
      data?.pekerjaan ?? '',

    penghasilan:
      Number(
        data?.penghasilan ?? 0
      ),

    jumlahTanggungan:
      Number(
        data?.jumlahTanggungan ?? 0
      ),

    statusRumah:
      data?.statusRumah ??
      'milik_sendiri',

    kondisiRumah:
      data?.kondisiRumah ??
      'baik',

    kepemilikanAset:
      data?.kepemilikanAset ??
      'tidak_ada',
  }
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
  } = useAuth()


  // ==========================================================
  // CONTEXT
  // ==========================================================

  const {
    pengajuan:
      contextPengajuan,

    setPengajuan,
  } = usePengajuan()


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    pengajuan,
    setPengajuanLocal,
  ] =
    useState<Pengajuan | null>(
      contextPengajuan
    )

  const [
    mustahik,
    setMustahik,
  ] =
    useState<DataMustahik | null>(
      null
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
  // AUTH HEADER
  // ==========================================================

  const authHeaders = {
    Authorization:
      `Bearer ${token}`,
  }


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {

    let mounted = true

    const load = async () => {

      // ------------------------------------------------------
      // Belum login
      // ------------------------------------------------------

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


        // ====================================================
        // REQUEST
        // ====================================================
        //
        // Kita ambil:
        //
        // 1. Pengajuan user
        // 2. Profile user
        //
        // ====================================================

        const [
          pengajuanRes,
          profileRes,
        ] =
          await Promise.all([

            axios.get(
              `${API_URL}/pengajuan/me`,
              {
                headers:
                  authHeaders,
              }
            ),

            axios.get(
              `${API_URL}/user/profile`,
              {
                headers:
                  authHeaders,
              }
            ),
          ])


        // ====================================================
        // PENGAJUAN
        // ====================================================

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


        // ----------------------------------------------------
        // Ambil pengajuan terbaru
        // ----------------------------------------------------
        //
        // Backend seharusnya sudah order:
        // createdAt DESC
        //
        // Tetapi kita tetap sort di frontend
        // sebagai pengaman.
        //
        // ----------------------------------------------------

        const sortedList =
          [...list].sort(
            (
              a: any,
              b: any
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
                dateB - dateA
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

            // ================================================
            // ADAPT PENGAJUAN
            // ================================================

            const adapted =
              adaptPengajuan(
                sortedList[0]
              )


            setPengajuanLocal(
              adapted
            )

            setPengajuan(
              adapted
            )

          } else {

            setPengajuanLocal(
              null
            )

            setPengajuan(
              null
            )
          }
        }


        // ====================================================
        // PROFILE / MUSTAHIK
        // ====================================================

        const mustahikData =
          profileRes
            ?.data
            ?.data
            ?.user
            ?.mustahik


        if (
          mounted
        ) {

          if (
            mustahikData
          ) {

            setMustahik(
              adaptMustahik(
                mustahikData
              )
            )

          } else {

            setMustahik(
              null
            )
          }
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
          setLoading(false)
        }
      }
    }


    load()


    // --------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------

    return () => {
      mounted = false
    }

  }, [
    token,
  ])


  // ==========================================================
  // EXISTING DATA
  // ==========================================================
  //
  // Pengajuan dan mustahik tidak harus diperlakukan
  // sebagai satu kondisi yang menyebabkan blank page.
  //
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

      {/* ======================================================
          HEADER
          ====================================================== */}

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


      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">

          {error}

        </div>

      )}


      {/* ======================================================
          EXISTING PENGAJUAN
          ====================================================== */}

      {hasExisting ? (

        <div className="space-y-4">


          {/* ==================================================
              PENGAJUAN CARD
              ================================================== */}

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


              {/* ==============================================
                  INFO PENGAJUAN
                  ============================================== */}

              <div className="grid grid-cols-2 gap-4 text-sm">


                {/* ID */}

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


                {/* TANGGAL PENGAJUAN */}

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


                {/* TANGGAL VERIFIKASI */}

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


              {/* =================================================
                  CATATAN ADMIN
                  ================================================= */}

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


              {/* =================================================
                  ACTION
                  ================================================= */}

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


          {/* ==================================================
              DATA SUMMARY
              ================================================== */}

          {mustahik && (

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

                      {mustahik.namaLengkap ||
                        '-'}

                    </p>

                  </div>


                  {/* NIK */}

                  <div>

                    <p className="text-xs text-slate-400">
                      NIK
                    </p>

                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                      {mustahik.nik
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

                      {mustahik.tempatLahir ||
                        '-'}

                    </p>

                  </div>


                  {/* PEKERJAAN */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Pekerjaan
                    </p>

                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs capitalize">

                      {mustahik.pekerjaan ||
                        '-'}

                    </p>

                  </div>


                  {/* ALAMAT */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Alamat
                    </p>

                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs capitalize">

                      {[
                        mustahik.alamat,
                        mustahik.kota,
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

                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs capitalize">

                      {mustahik.statusRumah
                        ? mustahik.statusRumah.replace(
                            /_/g,
                            ' '
                          )
                        : '-'}

                    </p>

                  </div>


                  {/* JUMLAH TANGGUNGAN */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Jumlah Tanggungan
                    </p>

                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                      {Number.isFinite(
                        mustahik.jumlahTanggungan
                      )
                        ? `${mustahik.jumlahTanggungan} Orang`
                        : '-'}

                    </p>

                  </div>


                  {/* PENGHASILAN */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Penghasilan
                    </p>

                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs">

                      {Number.isFinite(
                        mustahik.penghasilan
                      )
                        ? `Rp ${mustahik.penghasilan.toLocaleString(
                            'id-ID'
                          )}`
                        : '-'}

                    </p>

                  </div>

                </div>

              </CardContent>

            </Card>

          )}

        </div>

      ) : (

        /* ====================================================
           EMPTY STATE
           ==================================================== */

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