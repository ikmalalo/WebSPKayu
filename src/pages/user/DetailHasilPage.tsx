import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  Clock,
  Loader2,
  HelpCircle,
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
  useAuth,
} from '@/context/AuthContext'

import {
  usePengajuan,
} from '@/context/PengajuanContext'

import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

interface AnswerDetail {
  id: string
  kriteriaId: string
  subKriteriaId: string
  nilai: number | string
  kriteria?: {
    id: string
    kode: string
    nama: string
    tipe: 'BENEFIT' | 'COST'
  }
  subKriteria?: {
    id: string
    nama: string
    nilai: number | string
    keterangan?: string | null
  }
}

interface TopsisDetail {
  id: string
  nilaiAwal: number | string
  nilaiNormalisasi:
    | number
    | string
  nilaiTerbobot:
    | number
    | string
}

interface TopsisResultDetail {
  id: string
  nilaiPreferensi:
    | number
    | string
  ranking: number
  status:
    | 'LAYAK_DIDANAI'
    | 'TIDAK_DIDANAI'
  tanggalProses: string
  details?: TopsisDetail[]
}

export function DetailHasilPage() {
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
  ] = useState<any>(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  /*
   * ==========================================================
   * LOAD DETAIL PENGAJUAN
   * ==========================================================
   */

  useEffect(() => {
    const load =
      async () => {
        if (
          !contextPengajuan?.id ||
          !currentUser ||
          !localStorage.getItem(
            'spk_token'
          )
        ) {
          setLoading(false)
          return
        }

        try {
          const response =
            await axios.get(
              `${API_URL}/pengajuan/${contextPengajuan.id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    'spk_token'
                  )}`,
                },
              }
            )

          const result =
            response.data
              ?.data?.pengajuan

          if (
            !result ||
            result.userId !==
              currentUser.id
          ) {
            setError(
              'Data pengajuan tidak ditemukan.'
            )
            return
          }

          setDetail(
            result
          )

          /*
           * Sinkronkan status ke context.
           */
          setPengajuan({
            ...contextPengajuan,
            status:
              result.status,
            tanggalVerifikasi:
              result.tanggalVerifikasi
                ? new Date(
                    result.tanggalVerifikasi
                  )
                    .toISOString()
                    .split(
                      'T'
                    )[0]
                : undefined,
            catatan:
              result.catatan ||
              undefined,
          })
        } catch (err: any) {
          console.error(
            'Gagal mengambil detail pengajuan:',
            err
          )

          setError(
            err.response
              ?.data?.message ||
            'Gagal mengambil detail pengajuan.'
          )
        } finally {
          setLoading(false)
        }
      }

    load()
  }, [
    contextPengajuan?.id,
    currentUser?.id,
  ])

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />

        <span className="ml-2 text-sm text-slate-500">
          Memuat hasil pengajuan...
        </span>
      </div>
    )
  }

  /*
   * ==========================================================
   * ERROR / NO DATA
   * ==========================================================
   */

  if (
    error ||
    !detail
  ) {
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
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-4" />

            <h3 className="text-lg font-semibold text-slate-900">
              {error ||
                'Belum Ada Pengajuan'}
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Silakan lakukan pengajuan
              terlebih dahulu.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  /*
   * ==========================================================
   * DATA
   * ==========================================================
   */

  const mustahik =
    detail.mustahik

  const answers:
    AnswerDetail[] =
    detail.jawaban || []

  const topsisResults:
    TopsisResultDetail[] =
    detail.topsisResults || []

  /*
   * Backend mengurutkan TOPSIS
   * berdasarkan tanggal proses terbaru.
   */
  const topsis =
    topsisResults[0] ||
    null

  /*
   * Helper mencari jawaban
   * berdasarkan nama/kode kriteria.
   */
  const getAnswer =
    (
      keyword: string
    ) => {
      return answers.find(
        (answer) =>
          answer.kriteria
            ?.kode ===
            keyword ||
          answer.kriteria
            ?.nama
            ?.toLowerCase() ===
            keyword.toLowerCase()
      )
    }

  const c1 =
    getAnswer('C1')

  const c2 =
    getAnswer('C2')

  const c3 =
    getAnswer('C3')

  const c4 =
    getAnswer('C4')

  const c5 =
    getAnswer('C5')

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Hasil Pengajuan"
        description="Hasil kuesioner dan penilaian SPK TOPSIS"
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
                  detail.status
                }
              />

              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {
                  mustahik?.namaLengkap
                }
              </h2>

              <p className="text-sm text-slate-500">
                Pengajuan #
                {String(
                  detail.id
                ).toUpperCase()}
              </p>
            </div>

            <div className="ml-auto text-right">
              <p className="text-4xl font-bold text-green-600">
                #
                {topsis?.ranking ??
                  '-'}
              </p>

              <p className="text-xs text-slate-500">
                Ranking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          TOPSIS
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Nilai TOPSIS
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CI */}
            <div className="p-6 bg-green-50 rounded-xl text-center border border-green-200">
              <p className="text-4xl font-bold text-green-600">
                {topsis
                  ? Number(
                      topsis.nilaiPreferensi
                    ).toFixed(
                      4
                    )
                  : '-'}
              </p>

              <p className="text-sm text-green-700 mt-2">
                Nilai Preferensi (Ci)
              </p>
            </div>

            {/* STATUS */}
            <div className="p-6 bg-slate-50 rounded-xl text-center border border-slate-200">
              <div className="flex items-center justify-center gap-2">
                {topsis?.status ===
                'LAYAK_DIDANAI' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />

                    <p className="text-xl font-bold text-green-600">
                      LAYAK
                    </p>
                  </>
                ) : topsis?.status ===
                  'TIDAK_DIDANAI' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-red-500" />

                    <p className="text-xl font-bold text-red-500">
                      TIDAK LAYAK
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-6 h-6 text-amber-500" />

                    <p className="text-xl font-bold text-amber-500">
                      ANTREAN
                    </p>
                  </>
                )}
              </div>

              <p className="text-sm text-slate-500 mt-2">
                {topsis
                  ? 'Status Kelayakan'
                  : 'Menunggu proses TOPSIS oleh admin'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          HASIL KUESIONER
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Hasil Kuesioner
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {[
              {
                code: 'C1',
                title:
                  'Penghasilan',
                answer: c1,
              },
              {
                code: 'C2',
                title:
                  'Jumlah Tanggungan',
                answer: c2,
              },
              {
                code: 'C3',
                title:
                  'Kondisi Rumah',
                answer: c3,
              },
              {
                code: 'C4',
                title:
                  'Status Pekerjaan',
                answer: c4,
              },
              {
                code: 'C5',
                title:
                  'Kepemilikan Aset',
                answer: c5,
              },
            ].map(
              ({
                code,
                title,
                answer,
              }) => (
                <div
                  key={code}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                    {code}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {title}
                    </p>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {answer
                        ?.subKriteria
                        ?.keterangan ||
                        answer
                          ?.subKriteria
                          ?.nama ||
                        'Belum dijawab'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {answer
                        ? Number(
                            answer.nilai
                          )
                        : '-'}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Nilai
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          RINGKASAN DATA PENGAJUAN
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Ringkasan Data Pengajuan
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">
                Nama Lengkap
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {mustahik
                  ?.namaLengkap ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                NIK
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {mustahik?.nik ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Penghasilan
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {c1
                  ? `${
                      c1.subKriteria
                        ?.keterangan ||
                      '-'
                    } (Nilai ${
                      Number(
                        c1.nilai
                      )
                    })`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Jumlah Tanggungan
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {c2
                  ? `${
                      c2.subKriteria
                        ?.keterangan ||
                      '-'
                    } (Nilai ${
                      Number(
                        c2.nilai
                      )
                    })`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Kondisi Rumah
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {c3
                  ? `${
                      c3.subKriteria
                        ?.keterangan ||
                      '-'
                    } (Nilai ${
                      Number(
                        c3.nilai
                      )
                    })`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Status Pekerjaan
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {c4
                  ? `${
                      c4.subKriteria
                        ?.keterangan ||
                      '-'
                    } (Nilai ${
                      Number(
                        c4.nilai
                      )
                    })`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Kepemilikan Aset
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {c5
                  ? `${
                      c5.subKriteria
                        ?.keterangan ||
                      '-'
                    } (Nilai ${
                      Number(
                        c5.nilai
                      )
                    })`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Tanggal Pengajuan
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {detail.createdAt
                  ? formatDate(
                      detail.createdAt
                    )
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Tanggal Verifikasi
              </p>

              <p className="font-medium text-slate-800 mt-0.5">
                {detail.tanggalVerifikasi
                  ? formatDate(
                      detail.tanggalVerifikasi
                    )
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}