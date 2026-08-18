import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
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
} from '@/lib/utils'

import {
  usePengajuan,
} from '@/context/PengajuanContext'

import {
  useAuth,
} from '@/context/AuthContext'

import type {
  StatusPengajuan,
} from '@/types'

import api from '@/lib/api'


// ============================================================
// TYPES
// ============================================================

interface TopsisDetail {
  id: string

  nilaiAwal:
    | number
    | string

  nilaiNormalisasi:
    | number
    | string

  nilaiTerbobot:
    | number
    | string
}

interface TopsisResult {
  id: string

  pengajuanId: string

  nilaiPreferensi:
    | number
    | string

  ranking: number

  status:
    | 'LAYAK_DIDANAI'
    | 'TIDAK_DIDANAI'

  tanggalProses:
    | string
    | null

  details?: TopsisDetail[]
}

interface PengajuanDatabase {
  id: string

  userId: string

  mustahikId: string

  status: StatusPengajuan

  catatan:
    | string
    | null

  tanggalPengajuan:
    | string
    | null

  tanggalVerifikasi:
    | string
    | null

  createdAt?:
    | string
    | null

  updatedAt?:
    | string
    | null

  mustahik?: {
    id: string
    namaLengkap: string
    nik: string
  }

  jawaban?: unknown[]

  topsisResults?:
    TopsisResult[]

  verifications?: Array<{
    id: string

    status:
      | 'LOLOS'
      | 'PERLU_PERBAIKAN'
      | 'DITOLAK'

    catatan:
      | string
      | null

    createdAt:
      | string
      | null
  }>
}


// ============================================================
// HELPER DATE
// ============================================================

function safeFormatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return '-'
  }

  try {
    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '-'
    }

    return formatDate(value)
  } catch {
    return '-'
  }
}


// ============================================================
// STATUS HELPERS
// ============================================================

function isFinalStatus(
  status: StatusPengajuan
) {
  return (
    status ===
      'LAYAK_DIDANAI' ||
    status ===
      'TIDAK_DIDANAI'
  )
}


function isVerificationFinished(
  status: StatusPengajuan
) {
  return [
    'LOLOS_VERIFIKASI',
    'PERLU_PERBAIKAN',
    'DITOLAK',
    'DIPROSES_TOPSIS',
    'LAYAK_DIDANAI',
    'TIDAK_DIDANAI',
  ].includes(status)
}


function isTopsisStarted(
  status: StatusPengajuan
) {
  return [
    'DIPROSES_TOPSIS',
    'LAYAK_DIDANAI',
    'TIDAK_DIDANAI',
  ].includes(status)
}


// ============================================================
// PAGE
// ============================================================

export function PantauHasilPage() {

  // ==========================================================
  // SEMUA HOOK HARUS BERADA DI ATAS
  // ==========================================================

  const {
    currentUser,
  } = useAuth()

  const {
    pengajuan:
      contextPengajuan,

    setPengajuan,
  } = usePengajuan()


  const [
    detail,
    setDetail,
  ] =
    useState<PengajuanDatabase | null>(
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
    useState<string | null>(
      null
    )


  // ==========================================================
  // LOAD DATA DARI DATABASE
  // ==========================================================

  useEffect(() => {

    let mounted = true


    const load =
      async () => {

        // ----------------------------------------------------
        // Pastikan user sudah login
        // ----------------------------------------------------

        if (
          !currentUser
        ) {

          if (mounted) {
            setLoading(false)
          }

          return
        }


        try {

          if (mounted) {
            setLoading(true)
            setError(null)
          }


          // --------------------------------------------------
          // Ambil seluruh pengajuan user
          // --------------------------------------------------

          const listResponse =
            await api.get(
              '/pengajuan/me'
            )


          const list =
            Array.isArray(
              listResponse
                ?.data
                ?.data
                ?.pengajuan
            )
              ? listResponse
                  .data
                  .data
                  .pengajuan
              : []


          // --------------------------------------------------
          // Cari pengajuan yang aktif di Context
          // --------------------------------------------------

          let selected:
            | any
            | null =
            null


          if (
            contextPengajuan?.id
          ) {

            selected =
              list.find(
                (
                  item: any
                ) =>
                  item.id ===
                  contextPengajuan.id
              ) ||
              null
          }


          // --------------------------------------------------
          // Kalau Context tidak punya pengajuan,
          // gunakan pengajuan terbaru.
          // --------------------------------------------------

          if (
            !selected &&
            list.length > 0
          ) {

            const sorted =
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
                    dateB -
                    dateA
                  )
                }
              )


            selected =
              sorted[0]
          }


          // --------------------------------------------------
          // Tidak ada pengajuan
          // --------------------------------------------------

          if (
            !selected?.id
          ) {

            if (mounted) {
              setDetail(null)
              setLoading(false)
            }

            return
          }


          // --------------------------------------------------
          // Ambil DETAIL terbaru dari database
          // --------------------------------------------------

          const detailResponse =
            await api.get(
              `/pengajuan/${selected.id}`
            )


          const latest =
            detailResponse
              ?.data
              ?.data
              ?.pengajuan


          if (!latest) {
            throw new Error(
              'Data pengajuan tidak ditemukan.'
            )
          }


          // --------------------------------------------------
          // Pastikan pengajuan milik user login
          // --------------------------------------------------

          if (
            latest.userId !==
            currentUser.id
          ) {

            throw new Error(
              'Anda tidak memiliki akses ke pengajuan ini.'
            )
          }


          if (!mounted) {
            return
          }


          // --------------------------------------------------
          // Simpan data terbaru
          // --------------------------------------------------

          setDetail(
            latest
          )


          // --------------------------------------------------
          // Sinkronkan Context
          // --------------------------------------------------

          setPengajuan({
            id:
              latest.id,

            userId:
              latest.userId,

            mustahikId:
              latest.mustahikId,

            namaLengkap:
              latest
                ?.mustahik
                ?.namaLengkap ||
              selected
                ?.mustahik
                ?.namaLengkap ||
              selected
                ?.namaLengkap ||
              '',

            nik:
              latest
                ?.mustahik
                ?.nik ||
              selected
                ?.mustahik
                ?.nik ||
              selected
                ?.nik ||
              '',

            status:
              latest.status,

            tanggalPengajuan:
              latest.tanggalPengajuan ||
              selected.tanggalPengajuan ||
              '',

            tanggalVerifikasi:
              latest.tanggalVerifikasi ||
              undefined,

            catatan:
              latest.catatan ||
              undefined,
          })

        } catch (
          err: any
        ) {

          console.error(
            'GET PANTAU HASIL ERROR:',
            err
          )


          if (!mounted) {
            return
          }


          setError(
            err?.response
              ?.data
              ?.message ||
            err?.message ||
            'Gagal mengambil data pengajuan.'
          )

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

  }, [
    currentUser?.id,
    contextPengajuan?.id,
    setPengajuan,
  ])


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="space-y-6">

        <PageHeader
          title="Pantau Hasil Pengajuan"
          description="Lihat status dan hasil akhir pengajuan Anda"
        />

        <Card>

          <CardContent className="py-16">

            <div className="
              flex
              flex-col
              items-center
              justify-center
            ">

              <Loader2
                className="
                  w-8
                  h-8
                  animate-spin
                  text-green-600
                "
              />

              <p className="
                text-sm
                text-slate-500
                mt-3
              ">
                Memuat data pengajuan...
              </p>

            </div>

          </CardContent>

        </Card>

      </div>
    )
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div className="space-y-6">

        <PageHeader
          title="Pantau Hasil Pengajuan"
          description="Lihat status dan hasil akhir pengajuan Anda"
        />

        <Card>

          <CardContent
            className="
              py-16
              text-center
            "
          >

            <div className="
              w-16
              h-16
              bg-red-50
              rounded-2xl
              flex
              items-center
              justify-center
              mx-auto
              mb-4
            ">

              <AlertCircle
                className="
                  w-8
                  h-8
                  text-red-500
                "
              />

            </div>


            <h3 className="
              text-lg
              font-semibold
              text-slate-900
            ">
              Gagal Memuat Data
            </h3>


            <p className="
              text-sm
              text-red-500
              mt-2
            ">
              {error}
            </p>


            <Button
              className="mt-6"
              onClick={() =>
                window.location.reload()
              }
            >
              Muat Ulang
            </Button>

          </CardContent>

        </Card>

      </div>
    )
  }


  // ==========================================================
  // BELUM ADA PENGAJUAN
  // ==========================================================

  if (!detail) {

    return (
      <div className="space-y-6">

        <PageHeader
          title="Pantau Hasil Pengajuan"
          description="Lihat status dan hasil akhir pengajuan Anda"
        />

        <Card>

          <CardContent
            className="
              py-16
              text-center
            "
          >

            <div className="
              w-16
              h-16
              bg-slate-100
              rounded-2xl
              flex
              items-center
              justify-center
              mx-auto
              mb-4
            ">

              <Clock
                className="
                  w-8
                  h-8
                  text-slate-400
                "
              />

            </div>


            <h3 className="
              text-lg
              font-semibold
              text-slate-900
            ">
              Belum Ada Pengajuan
            </h3>


            <p className="
              text-sm
              text-slate-500
              mt-2
              max-w-sm
              mx-auto
            ">
              Anda belum melakukan
              pengajuan bantuan.
              Silakan buat pengajuan
              terlebih dahulu.
            </p>


            <Button
              asChild
              className="mt-6"
            >
              <Link
                to="/pengajuan/form"
              >
                Mulai Pengajuan
              </Link>
            </Button>

          </CardContent>

        </Card>

      </div>
    )
  }


  // ==========================================================
  // DATA PENGAJUAN
  // ==========================================================

  const status =
    detail.status


  const topsisResults =
    Array.isArray(
      detail.topsisResults
    )
      ? detail.topsisResults
      : []


  // Backend sudah mengurutkan
  // tanggalProses DESC.
  //
  // Jadi index 0 = hasil TOPSIS terbaru.

  const topsis =
    topsisResults[0] ||
    null


  // ==========================================================
  // STATUS
  // ==========================================================

  const finalStatus =
    isFinalStatus(
      status
    )


  const topsisStage =
    isTopsisStarted(
      status
    )


  const verificationFinished =
    isVerificationFinished(
      status
    )


  const isLayak =
    status ===
    'LAYAK_DIDANAI'


  const isTidakLayak =
    status ===
    'TIDAK_DIDANAI'


  const isDitolak =
    status ===
    'DITOLAK'


  const isPerluPerbaikan =
    status ===
    'PERLU_PERBAIKAN'


  // ==========================================================
  // NILAI TOPSIS
  // ==========================================================

  const nilaiPreferensi =
    topsis
      ? Number(
          topsis.nilaiPreferensi
        )
      : null


  const nilaiPreferensiValid =
    nilaiPreferensi !== null &&
    Number.isFinite(
      nilaiPreferensi
    )


  // ==========================================================
  // TIMELINE
  // ==========================================================
  //
  // PENTING:
  //
  // Ini BUKAN useMemo.
  //
  // Semua Hook sudah selesai
  // sebelum conditional return.
  //
  // Jadi tidak akan terjadi:
  //
  // Render 1 = 4 hooks
  // Render 2 = 5 hooks
  //
  // ==========================================================

  const timeline = [
    {
      label:
        'Pengajuan Dibuat',

      date:
        detail.tanggalPengajuan,

      completed:
        true,

      current:
        status ===
        'DRAFT',

      type:
        'normal',
    },

    {
      label:
        'Menunggu Verifikasi',

      date:
        detail.tanggalPengajuan,

      completed:
        status !==
        'DRAFT',

      current:
        status ===
          'MENUNGGU_VERIFIKASI' ||
        status ===
          'SEDANG_DIVERIFIKASI',

      type:
        'normal',
    },

    {
      label:
        'Verifikasi Selesai',

      date:
        detail.tanggalVerifikasi,

      completed:
        verificationFinished,

      current:
        isPerluPerbaikan ||
        isDitolak,

      type:
        isPerluPerbaikan
          ? 'warning'
          : isDitolak
          ? 'danger'
          : 'normal',
    },

    {
      label:
        'Proses TOPSIS',

      date:
        topsis
          ?.tanggalProses ||
        null,

      completed:
        finalStatus,

      current:
        status ===
        'DIPROSES_TOPSIS',

      type:
        'topsis',
    },

    {
      label:
        'Hasil Akhir',

      date:
        finalStatus
          ? topsis
              ?.tanggalProses ||
            null
          : null,

      completed:
        finalStatus,

      current:
        false,

      type:
        isLayak
          ? 'success'
          : isTidakLayak
          ? 'danger'
          : 'normal',
    },
  ]


  // ==========================================================
  // STATUS CARD
  // ==========================================================

  let statusIcon = (
    <Clock
      className="
        w-8
        h-8
        text-slate-400
      "
    />
  )


  let statusIconClass =
    'bg-slate-100'


  let statusTitle =
    'Pengajuan Anda Sedang Diproses'


  let statusDescription =
    'Pengajuan Anda sedang dalam tahap proses. Silakan pantau secara berkala.'


  // ----------------------------------------------------------
  // LAYAK DIDANAI
  // ----------------------------------------------------------

  if (isLayak) {

    statusIcon = (
      <CheckCircle
        className="
          w-8
          h-8
          text-green-600
        "
      />
    )

    statusIconClass =
      'bg-green-100'

    statusTitle =
      'Selamat! Anda Dinyatakan Layak'

    statusDescription =
      'Pengajuan Anda telah melalui proses verifikasi dan perhitungan TOPSIS. Anda dinyatakan layak untuk mendapatkan bantuan.'
  }


  // ----------------------------------------------------------
  // TIDAK DIDANAI
  // ----------------------------------------------------------

  if (isTidakLayak) {

    statusIcon = (
      <XCircle
        className="
          w-8
          h-8
          text-red-500
        "
      />
    )

    statusIconClass =
      'bg-red-100'

    statusTitle =
      'Pengajuan Tidak Layak Didanai'

    statusDescription =
      'Pengajuan Anda telah selesai diproses menggunakan metode TOPSIS dan hasil akhirnya belum memenuhi batas kelayakan pendanaan.'
  }


  // ----------------------------------------------------------
  // DITOLAK
  // ----------------------------------------------------------

  if (isDitolak) {

    statusIcon = (
      <XCircle
        className="
          w-8
          h-8
          text-red-500
        "
      />
    )

    statusIconClass =
      'bg-red-100'

    statusTitle =
      'Pengajuan Ditolak'

    statusDescription =
      detail.catatan ||
      'Pengajuan Anda tidak lolos proses verifikasi oleh admin.'
  }


  // ----------------------------------------------------------
  // PERLU PERBAIKAN
  // ----------------------------------------------------------

  if (
    isPerluPerbaikan
  ) {

    statusIcon = (
      <AlertCircle
        className="
          w-8
          h-8
          text-orange-500
        "
      />
    )

    statusIconClass =
      'bg-orange-100'

    statusTitle =
      'Pengajuan Memerlukan Perbaikan'

    statusDescription =
      detail.catatan ||
      'Pengajuan Anda memerlukan perbaikan berdasarkan hasil verifikasi admin.'
  }


  // ----------------------------------------------------------
  // DIPROSES TOPSIS
  // ----------------------------------------------------------

  if (
    status ===
    'DIPROSES_TOPSIS'
  ) {

    statusIcon = (
      <Clock
        className="
          w-8
          h-8
          text-purple-500
        "
      />
    )

    statusIconClass =
      'bg-purple-100'

    statusTitle =
      'Pengajuan Anda Sedang Diproses'

    statusDescription =
      'Pengajuan telah lolos verifikasi dan sedang menunggu proses perhitungan TOPSIS oleh admin.'
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <PageHeader
        title="Pantau Hasil Pengajuan"
        description="Lihat status dan hasil akhir pengajuan Anda"
      />


      {/* ======================================================
          STATUS PENGAJUAN
      ======================================================= */}

      <Card
        className={
          isLayak
            ? 'border-green-300'
            : isTidakLayak ||
              isDitolak
            ? 'border-red-200'
            : ''
        }
      >

        <CardContent
          className="pt-6"
        >

          <div className="
            flex
            items-start
            gap-4
          ">

            <div
              className={`
                p-3
                rounded-2xl
                ${statusIconClass}
              `}
            >
              {statusIcon}
            </div>


            <div className="flex-1">

              <StatusBadge
                status={
                  status
                }
                className="mb-2"
              />


              <h2 className="
                text-lg
                font-bold
                text-slate-900
              ">
                {statusTitle}
              </h2>


              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {statusDescription}
              </p>

            </div>

          </div>

        </CardContent>

      </Card>


      {/* ======================================================
          HASIL TOPSIS
      ======================================================= */}

      {topsisStage && (

        <Card>

          <CardHeader>

            <div className="
              flex
              items-center
              gap-2
            ">

              <Trophy
                className="
                  w-5
                  h-5
                  text-amber-500
                "
              />

              <CardTitle>
                Hasil Penilaian TOPSIS
              </CardTitle>

            </div>

          </CardHeader>


          <CardContent>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            ">

              {/* ============================================
                  RANKING
              ============================================= */}

              <div className="
                text-center
                p-4
                bg-amber-50
                rounded-xl
                border
                border-amber-200
              ">

                <div className="
                  text-3xl
                  font-bold
                  text-amber-600
                ">

                  {topsis
                    ? `#${topsis.ranking}`
                    : '-'}

                </div>


                <p className="
                  text-xs
                  text-amber-700
                  mt-1
                  font-medium
                ">
                  Ranking
                </p>

              </div>


              {/* ============================================
                  NILAI PREFERENSI
              ============================================= */}

              <div className="
                text-center
                p-4
                bg-green-50
                rounded-xl
                border
                border-green-200
              ">

                <div className="
                  text-3xl
                  font-bold
                  text-green-600
                ">

                  {nilaiPreferensiValid
                    ? nilaiPreferensi!.toFixed(
                        3
                      )
                    : '-'}

                </div>


                <p className="
                  text-xs
                  text-green-700
                  mt-1
                  font-medium
                ">
                  Nilai Preferensi
                </p>

              </div>


              {/* ============================================
                  STATUS TOPSIS
              ============================================= */}

              <div className="
                text-center
                p-4
                bg-slate-50
                rounded-xl
                border
                border-slate-200
              ">

                <div
                  className={`
                    text-lg
                    font-bold
                    ${
                      isLayak
                        ? 'text-green-600'
                        : isTidakLayak
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }
                  `}
                >

                  {isLayak
                    ? 'LAYAK'
                    : isTidakLayak
                    ? 'TIDAK LAYAK'
                    : 'ANTREAN'}

                </div>


                <p className="
                  text-xs
                  text-slate-500
                  mt-1
                  font-medium
                ">

                  {topsis
                    ? 'Status Kelayakan'
                    : 'Menunggu proses TOPSIS oleh admin'}

                </p>

              </div>

            </div>


            {/* ==============================================
                TANGGAL PROSES TOPSIS
            =============================================== */}

            {topsis?.tanggalProses && (

              <p className="
                text-xs
                text-slate-400
                mt-3
                text-center
              ">
                Proses TOPSIS dilakukan pada{' '}
                {safeFormatDate(
                  topsis.tanggalProses
                )}
              </p>

            )}


            {/* ==============================================
                BELUM ADA HASIL TOPSIS
            =============================================== */}

            {!topsis &&
              status ===
                'DIPROSES_TOPSIS' && (

              <p className="
                text-xs
                text-purple-500
                mt-3
                text-center
              ">
                Pengajuan telah lolos
                verifikasi dan sedang
                menunggu perhitungan TOPSIS
                oleh admin.
              </p>

            )}

          </CardContent>

        </Card>

      )}


      {/* ======================================================
          RIWAYAT STATUS
      ======================================================= */}

      <Card>

        <CardHeader>

          <CardTitle>
            Riwayat Status
          </CardTitle>

        </CardHeader>


        <CardContent>

          <div className="space-y-0">

            {timeline.map(
              (
                item,
                index
              ) => {

                const isLast =
                  index ===
                  timeline.length -
                    1


                const dotClass =
                  item.current
                    ? `
                      border-purple-500
                      bg-purple-500
                    `
                    : item.completed
                    ? item.type ===
                      'danger'
                      ? `
                        border-red-500
                        bg-red-500
                      `
                      : item.type ===
                        'warning'
                      ? `
                        border-orange-500
                        bg-orange-500
                      `
                      : `
                        border-green-500
                        bg-green-500
                      `
                    : `
                      border-slate-300
                      bg-white
                    `


                const lineClass =
                  item.completed
                    ? 'bg-green-400'
                    : 'bg-slate-200'


                return (
                  <div
                    key={
                      item.label
                    }
                    className="
                      flex
                      gap-4
                    "
                  >

                    {/* ====================================
                        DOT
                    ===================================== */}

                    <div className="
                      flex
                      flex-col
                      items-center
                    ">

                      <div
                        className={`
                          w-4
                          h-4
                          rounded-full
                          border-2
                          mt-1
                          ${dotClass}
                        `}
                      />


                      {!isLast && (

                        <div
                          className={`
                            w-0.5
                            h-8
                            ${lineClass}
                          `}
                        />

                      )}

                    </div>


                    {/* ====================================
                        TEXT
                    ===================================== */}

                    <div className="pb-6">

                      <p
                        className={`
                          text-sm
                          font-medium
                          ${
                            item.completed ||
                            item.current
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }
                        `}
                      >

                        {item.label}


                        {item.current && (

                          <span className="
                            ml-2
                            text-xs
                            text-purple-500
                          ">
                            • Sedang diproses
                          </span>

                        )}

                      </p>


                      <p className="
                        text-xs
                        text-slate-400
                        mt-0.5
                      ">

                        {item.date
                          ? safeFormatDate(
                              item.date
                            )
                          : item.current
                          ? 'Sedang diproses'
                          : '-'}

                      </p>

                    </div>

                  </div>
                )
              }
            )}

          </div>

        </CardContent>

      </Card>


      {/* ======================================================
          DETAIL LENGKAP
      ======================================================= */}

      <Button
        asChild
        variant="outline"
        className="w-full"
      >

        <Link
          to="/pantau-hasil/detail"
        >

          Lihat Detail Lengkap

          <ChevronRight
            className="
              w-4
              h-4
              ml-2
            "
          />

        </Link>

      </Button>

    </div>
  )
}