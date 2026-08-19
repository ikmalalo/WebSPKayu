import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  Send,
  Loader2,
  HelpCircle,
  CheckCircle,
  Lock,
  ArrowRight,
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
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  cn,
} from '@/lib/utils'

import {
  usePengajuan,
} from '@/context/PengajuanContext'

import {
  useAuth,
} from '@/context/AuthContext'

import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

interface SubKriteriaApi {
  id: string
  kriteriaId: string
  nama: string
  nilai: number | string
  keterangan?: string | null
}

interface KriteriaApi {
  id: string
  kode: string
  nama: string
  bobot: number | string
  tipe:
    | 'BENEFIT'
    | 'COST'
  deskripsi?: string | null
  subKriteria:
    SubKriteriaApi[]
}

interface ExistingAnswer {
  kriteriaId: string
  subKriteriaId: string
}

// ============================================================
// STATUS YANG SUDAH TIDAK BOLEH EDIT
// ============================================================

const LOCKED_STATUSES = [
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
// PAGE
// ============================================================

export function KuesionerPage() {
  const navigate =
    useNavigate()

  const {
    pengajuan,
    setPengajuan,
    refreshPengajuan,
  } =
    usePengajuan()

  const {
    token,
  } = useAuth()

  const [
    kriteria,
    setKriteria,
  ] = useState<
    KriteriaApi[]
  >([])

  const [
    answers,
    setAnswers,
  ] = useState<
    Record<
      string,
      string
    >
  >({})

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)

  const [
    submitted,
    setSubmitted,
  ] = useState(false)

  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  const authHeaders = {
    Authorization:
      `Bearer ${token}`,
  }

  // ==========================================================
  // LOAD KUESIONER + PENGAJUAN
  // ==========================================================

  useEffect(() => {
    let mounted = true

    const load =
      async () => {
        if (!token) {
          if (mounted) {
            setLoading(
              false
            )
          }

          return
        }

        try {
          setError(null)

          // --------------------------------------------------
          // Ambil kriteria
          // --------------------------------------------------

          const kriteriaResponse =
            await axios.get(
              `${API_URL}/kuesioner`,
              {
                headers:
                  authHeaders,
              }
            )

          const kriteriaData =
            kriteriaResponse
              .data
              ?.data
              ?.kriteria ||
            []

          if (!mounted) {
            return
          }

          setKriteria(
            kriteriaData
          )

          // --------------------------------------------------
          // Ambil pengajuan terbaru
          // --------------------------------------------------

          let currentPengajuan =
            pengajuan

          if (
            !currentPengajuan
          ) {
            const response =
              await axios.get(
                `${API_URL}/pengajuan/me`,
                {
                  headers:
                    authHeaders,
                }
              )

            const list =
              response
                .data
                ?.data
                ?.pengajuan ||
              []

            if (
              list.length >
              0
            ) {
              const sorted =
                [...list].sort(
                  (
                    a: any,
                    b: any
                  ) =>
                    new Date(
                      b.createdAt ||
                        b.tanggalPengajuan ||
                        0
                    ).getTime() -
                    new Date(
                      a.createdAt ||
                        a.tanggalPengajuan ||
                        0
                    ).getTime()
                )

              const p =
                sorted[0]

              currentPengajuan =
                {
                  id:
                    p.id,

                  userId:
                    p.userId,

                  mustahikId:
                    p.mustahikId,

                  namaLengkap:
                    p.mustahik
                      ?.namaLengkap ||
                    '',

                  nik:
                    p.mustahik
                      ?.nik ||
                    '',

                  status:
                    p.status,

                  tanggalPengajuan:
                    p.createdAt
                      ? new Date(
                          p.createdAt
                        )
                          .toISOString()
                          .split(
                            'T'
                          )[0]
                      : '',

                  tanggalVerifikasi:
                    p.tanggalVerifikasi
                      ? new Date(
                          p.tanggalVerifikasi
                        )
                          .toISOString()
                          .split(
                            'T'
                          )[0]
                      : undefined,

                  catatan:
                    p.catatan ||
                    undefined,
                }

              if (
                mounted
              ) {
                setPengajuan(
                  currentPengajuan
                )
              }
            }
          }

          // --------------------------------------------------
          // Tidak punya pengajuan
          // --------------------------------------------------

          if (
            !currentPengajuan?.id
          ) {
            return
          }

          // --------------------------------------------------
          // Ambil detail pengajuan
          // Termasuk jawaban yang sudah tersimpan.
          // --------------------------------------------------

          const detailResponse =
            await axios.get(
              `${API_URL}/pengajuan/${currentPengajuan.id}`,
              {
                headers:
                  authHeaders,
              }
            )

          const detail =
            detailResponse
              .data
              ?.data
              ?.pengajuan

          if (!detail) {
            return
          }

          // --------------------------------------------------
          // Ambil jawaban existing
          // --------------------------------------------------

          const existingAnswers:
            ExistingAnswer[] =
            Array.isArray(
              detail.jawaban
            )
              ? detail.jawaban
              : []

          const answerMap:
            Record<
              string,
              string
            > = {}

          existingAnswers.forEach(
            (
              answer
            ) => {
              answerMap[
                answer.kriteriaId
              ] =
                answer.subKriteriaId
            }
          )

          if (
            mounted
          ) {
            setAnswers(
              answerMap
            )

            // ------------------------------------------------
            // Kalau status sudah bukan DRAFT,
            // kuesioner dianggap sudah dikirim.
            // ------------------------------------------------

            const isLocked =
              LOCKED_STATUSES.includes(
                detail.status
              )

            setSubmitted(
              isLocked
            )

            setPengajuan(
              (
                previous
              ) => ({
                ...(previous ||
                  currentPengajuan!),

                id:
                  detail.id,

                status:
                  detail.status,

                tanggalVerifikasi:
                  detail.tanggalVerifikasi
                    ? new Date(
                        detail.tanggalVerifikasi
                      )
                        .toISOString()
                        .split(
                          'T'
                        )[0]
                    : undefined,

                catatan:
                  detail.catatan ||
                  undefined,
              })
            )
          }
        } catch (
          err: any
        ) {
          console.error(
            'GAGAL MEMUAT KUESIONER:',
            err
          )

          if (
            mounted
          ) {
            setError(
              err.response
                ?.data
                ?.message ||
                'Gagal memuat kuesioner.'
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
      mounted = false
    }
  }, [
    token,
  ])

  // ==========================================================
  // CEK LOCK
  // ==========================================================

  const isLocked =
    submitted ||
    LOCKED_STATUSES.includes(
      pengajuan?.status ||
        ''
    )

  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  const handleSelect =
    (
      kriteriaId: string,
      subKriteriaId: string
    ) => {

      // ------------------------------------------------------
      // 🔒 Kalau sudah dikirim,
      // tidak boleh mengubah jawaban.
      // ------------------------------------------------------

      if (
        isLocked
      ) {
        return
      }

      setAnswers(
        (
          previous
        ) => ({
          ...previous,

          [kriteriaId]:
            subKriteriaId,
        })
      )
    }

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const answered =
    Object.keys(
      answers
    ).length

  const totalQuestions =
    kriteria.length

  const progress =
    totalQuestions >
    0
      ? Math.round(
          (answered /
            totalQuestions) *
            100
        )
      : 0

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async () => {

      // ------------------------------------------------------
      // 🔒 Frontend guard
      // ------------------------------------------------------

      if (
        isLocked
      ) {
        setError(
          'Kuesioner sudah pernah dikirim dan tidak dapat dikirim ulang.'
        )

        return
      }

      if (
        !pengajuan?.id
      ) {
        setError(
          'Pengajuan belum tersedia. Silakan isi data pribadi terlebih dahulu.'
        )

        return
      }

      if (
        answered <
        totalQuestions
      ) {
        setError(
          'Semua pertanyaan wajib dijawab.'
        )

        return
      }

      setSubmitting(
        true
      )

      setError(null)

      try {

        const jawaban =
          kriteria.map(
            (
              item
            ) => ({
              kriteriaId:
                item.id,

              subKriteriaId:
                answers[
                  item.id
                ],
            })
          )

        // ----------------------------------------------------
        // POST PERTAMA
        // ----------------------------------------------------

        await axios.post(
          `${API_URL}/kuesioner/jawaban`,
          {
            pengajuanId:
              pengajuan.id,

            jawaban,
          },
          {
            headers:
              authHeaders,
          }
        )

        // ----------------------------------------------------
        // Tandai LOCK
        // ----------------------------------------------------

        setSubmitted(
          true
        )

        // ----------------------------------------------------
        // Refresh context dari database
        // ----------------------------------------------------

        await refreshPengajuan()

        // ----------------------------------------------------
        // Ambil detail terbaru
        // ----------------------------------------------------

        const detailResponse =
          await axios.get(
            `${API_URL}/pengajuan/${pengajuan.id}`,
            {
              headers:
                authHeaders,
            }
          )

        const detail =
          detailResponse
            .data
            ?.data
            ?.pengajuan

        if (
          detail
        ) {
          setPengajuan(
            (
              previous
            ) => ({
              ...(previous ||
                pengajuan),

              status:
                detail.status,

              tanggalVerifikasi:
                detail.tanggalVerifikasi
                  ? new Date(
                      detail.tanggalVerifikasi
                    )
                      .toISOString()
                      .split(
                        'T'
                      )[0]
                  : undefined,

              catatan:
                detail.catatan ||
                undefined,
            })
          )
        }

        // ----------------------------------------------------
        // Setelah submit → pantau hasil
        // ----------------------------------------------------

        navigate(
          '/pantau-hasil',
          {
            replace: true,
          }
        )
      } catch (
        err: any
      ) {
        console.error(
          'GAGAL MENGIRIM KUESIONER:',
          err
        )

        // ----------------------------------------------------
        // Kalau backend menjawab 409,
        // berarti kuesioner memang sudah pernah dikirim.
        // ----------------------------------------------------

        if (
          err.response
            ?.status ===
          409
        ) {
          setSubmitted(
            true
          )

          setError(
            err.response
              ?.data
              ?.message ||
              'Kuesioner sudah pernah dikirim dan tidak dapat dikirim ulang.'
          )

          await refreshPengajuan()

          return
        }

        setError(
          err.response
            ?.data
            ?.message ||
            'Gagal menyimpan jawaban kuesioner.'
        )
      } finally {
        setSubmitting(
          false
        )
      }
    }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading
  ) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />

        <span className="ml-2 text-sm text-slate-500">
          Memuat kuesioner...
        </span>
      </div>
    )
  }

  // ==========================================================
  // BELUM ADA PENGAJUAN
  // ==========================================================

  if (
    !pengajuan
  ) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Kuesioner Penilaian"
          description="Kuesioner penilaian mustahik"
        />

        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-slate-500">
              Silakan isi data pribadi
              terlebih dahulu sebelum
              mengisi kuesioner.
            </p>

            <Button
              className="mt-5"
              onClick={() =>
                navigate(
                  '/pengajuan/form'
                )
              }
            >
              Isi Data Pribadi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Kuesioner Penilaian"
        description={
          isLocked
            ? 'Kuesioner telah dikirim dan tidak dapat diubah kembali'
            : 'Jawab seluruh pertanyaan sesuai kondisi Anda saat ini'
        }
      />

      {/* ======================================================
          LOCKED INFO
      ====================================================== */}

      {isLocked && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-green-800">
                  Kuesioner sudah dikirim
                </p>

                <p className="text-sm text-green-700 mt-1">
                  Jawaban Anda sudah tersimpan
                  di database dan sedang diproses
                  sesuai alur pengajuan. Kuesioner
                  hanya dapat dikirim satu kali.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-green-300 text-green-700"
                  onClick={() =>
                    navigate(
                      '/pantau-hasil'
                    )
                  }
                >
                  Pantau Pengajuan

                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress Pengisian
            </span>

            <span className="text-sm font-bold text-green-600">
              {answered}/
              {totalQuestions}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{
                width:
                  `${progress}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className={cn(
            'flex items-start gap-2 p-3 rounded-lg border',
            isLocked
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-200'
          )}
        >
          <HelpCircle
            className={cn(
              'w-4 h-4 mt-0.5 shrink-0',
              isLocked
                ? 'text-amber-600'
                : 'text-red-600'
            )}
          />

          <p
            className={cn(
              'text-sm',
              isLocked
                ? 'text-amber-700'
                : 'text-red-700'
            )}
          >
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          INFO
      ====================================================== */}

      {!isLocked && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-900">
          <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />

          <p className="text-xs text-blue-700 dark:text-blue-300">
            Jawaban kuesioner akan menjadi
            nilai kriteria SPK TOPSIS.
            Pastikan seluruh jawaban sudah
            benar sebelum menekan tombol
            Kirim Kuesioner. Kuesioner hanya
            dapat dikirim satu kali.
          </p>
        </div>
      )}

      {/* ======================================================
          QUESTIONS
      ====================================================== */}

      <div className="space-y-4">

        {kriteria.map(
          (
            item,
            index
          ) => {

            const selected =
              answers[
                item.id
              ]

            return (
              <Card
                key={
                  item.id
                }
              >

                <CardHeader>
                  <div className="flex items-start gap-3">

                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        isLocked
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-green-100 text-green-700'
                      )}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <CardTitle className="text-base">
                        {item.kode} —{' '}
                        {item.nama}

                        <span
                          className={cn(
                            'ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border',

                            item.tipe ===
                              'BENEFIT'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          )}
                        >
                          {item.tipe ===
                          'BENEFIT'
                            ? 'Benefit'
                            : 'Cost'}
                        </span>
                      </CardTitle>

                      {item.deskripsi && (
                        <p className="text-xs text-slate-400 mt-1">
                          {
                            item.deskripsi
                          }
                        </p>
                      )}
                    </div>

                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">

                    {item.subKriteria.map(
                      (
                        sub
                      ) => {

                        const isSelected =
                          selected ===
                          sub.id

                        return (
                          <label
                            key={
                              sub.id
                            }
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border transition-all',

                              isLocked
                                ? 'cursor-default opacity-90'
                                : 'cursor-pointer hover:border-green-300 hover:bg-slate-50 dark:hover:bg-slate-800',

                              isSelected
                                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                : 'border-slate-200 dark:border-slate-800'
                            )}
                          >

                            <input
                              type="radio"
                              name={
                                item.id
                              }
                              value={
                                sub.id
                              }
                              checked={
                                isSelected
                              }
                              disabled={
                                isLocked
                              }
                              onChange={() =>
                                handleSelect(
                                  item.id,
                                  sub.id
                                )
                              }
                              className="sr-only"
                            />

                            <div
                              className={cn(
                                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',

                                isSelected
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-slate-300 dark:border-slate-600'
                              )}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>

                            <div className="flex items-center justify-between flex-1 gap-3">

                              <span className="text-sm text-slate-700 dark:text-slate-200">
                                {sub.keterangan ||
                                  sub.nama}
                              </span>

                              <span className="text-xs font-bold text-slate-400">
                                Nilai:{' '}
                                {Number(
                                  sub.nilai
                                )}
                              </span>

                            </div>

                          </label>
                        )
                      }
                    )}

                  </div>
                </CardContent>

              </Card>
            )
          }
        )}

      </div>

      {/* ======================================================
          SUBMIT
      ====================================================== */}

      {!isLocked && (
        <div className="flex justify-end">

          <Button
            onClick={
              handleSubmit
            }
            disabled={
              submitting ||
              answered <
                totalQuestions
            }
            className="min-w-[200px]"
          >

            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim Kuesioner...
              </>
            ) : answered <
              totalQuestions ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Lengkapi Kuesioner
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Kirim Kuesioner
              </>
            )}

          </Button>

        </div>
      )}

      {/* ======================================================
          LOCKED FOOTER
      ====================================================== */}

      {isLocked && (
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />

                <div>
                  <p className="text-sm font-semibold">
                    Jawaban sudah tersimpan
                  </p>

                  <p className="text-xs text-slate-500">
                    Tidak ada pengiriman ulang
                    untuk pengajuan ini.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    '/pantau-hasil'
                  )
                }
              >
                Pantau Hasil
              </Button>

            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}