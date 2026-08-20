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
  Home,
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
  subKriteria: SubKriteriaApi[]
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
// STATUS RUMAH
// ============================================================

const STATUS_RUMAH_OPTIONS = [
  {
    value: 'milik_sendiri',
    label: 'Milik Sendiri',
    description:
      'Rumah merupakan milik pribadi atau keluarga sendiri',
  },
  {
    value: 'sewa',
    label: 'Sewa / Kontrak',
    description:
      'Tinggal di rumah sewa atau kontrakan',
  },
  {
    value: 'menumpang',
    label: 'Menumpang',
    description:
      'Tinggal bersama keluarga atau pihak lain',
  },
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
    statusRumah,
    setStatusRumah,
  ] = useState<string>('')

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
                      : undefined,

                  catatan:
                    p.catatan ||
                    undefined,

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
                }

              setPengajuan(
                currentPengajuan
              )
            }
          }

          // --------------------------------------------------
          // Kalau tidak ada pengajuan
          // --------------------------------------------------

          if (
            !currentPengajuan
          ) {
            if (mounted) {
              setLoading(
                false
              )
            }

            return
          }

          // --------------------------------------------------
          // Ambil detail pengajuan
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

          if (
            !mounted
          ) {
            return
          }

          // --------------------------------------------------
          // Ambil status rumah dari Mustahik
          // --------------------------------------------------

          if (
            detail
              ?.mustahik
              ?.statusRumah
          ) {
            setStatusRumah(
              detail
                .mustahik
                .statusRumah
            )
          }

          // --------------------------------------------------
          // Ambil jawaban yang sudah tersimpan
          // --------------------------------------------------

          const existingAnswers:
            ExistingAnswer[] =
            detail
              ?.jawaban ||
            []

          if (
            existingAnswers.length >
            0
          ) {
            const mappedAnswers:
              Record<
                string,
                string
              > =
              {}

            existingAnswers.forEach(
              (
                answer
              ) => {
                mappedAnswers[
                  answer.kriteriaId
                ] =
                  answer.subKriteriaId
              }
            )

            setAnswers(
              mappedAnswers
            )
          }

          // --------------------------------------------------
          // Cek status lock
          // --------------------------------------------------

          if (
            detail &&
            LOCKED_STATUSES.includes(
              detail.status
            )
          ) {
            setSubmitted(
              true
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
                'Gagal memuat data kuesioner.'
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
  }, [
    token,
  ])

  // ==========================================================
  // LOCK
  // ==========================================================

  const isLocked =
    submitted ||
    (
      pengajuan &&
      LOCKED_STATUSES.includes(
        pengajuan.status
      )
    )

  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  const handleSelectAnswer =
    (
      kriteriaId: string,
      subKriteriaId: string
    ) => {
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
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async () => {
      if (
        !pengajuan
      ) {
        setError(
          'Pengajuan tidak ditemukan.'
        )

        return
      }

      if (
        isLocked
      ) {
        return
      }

      // ------------------------------------------------------
      // Validasi semua kriteria
      // ------------------------------------------------------

      const unanswered =
        kriteria.filter(
          (
            item
          ) =>
            !answers[
              item.id
            ]
        )

      if (
        unanswered.length >
        0
      ) {
        setError(
          `Masih ada ${unanswered.length} pertanyaan yang belum dijawab.`
        )

        return
      }

      // ------------------------------------------------------
      // Validasi status rumah
      // ------------------------------------------------------

      if (
        !statusRumah
      ) {
        setError(
          'Silakan pilih status rumah terlebih dahulu.'
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
        // Kirim kuesioner
        // ----------------------------------------------------

        await axios.post(
          `${API_URL}/kuesioner/jawaban`,
          {
            pengajuanId:
              pengajuan.id,

            jawaban,

            // PENTING:
            // Status rumah ikut dikirim ke backend
            statusRumah,
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
        // Refresh context
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
              ...(
                previous ||
                pengajuan
              ),

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
            replace:
              true,
          }
        )

      } catch (
        err: any
      ) {
        console.error(
          'GAGAL MENGIRIM KUESIONER:',
          err
        )

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
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />

              <div>
                <p className="font-medium text-green-800">
                  Kuesioner telah dikirim
                </p>

                <p className="text-sm text-green-700 mt-1">
                  Jawaban kuesioner tidak dapat diubah kembali
                  dan sedang menunggu proses selanjutnya.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          INFO
      ====================================================== */}

      {!isLocked && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />

              <div>
                <p className="font-medium text-blue-800">
                  Petunjuk Pengisian
                </p>

                <p className="text-sm text-blue-700 mt-1">
                  Pilih satu jawaban pada setiap kriteria sesuai
                  kondisi Anda saat ini. Pastikan seluruh pertanyaan
                  telah dijawab sebelum mengirim kuesioner.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          DATA PENGAJUAN
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Data Pengajuan
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">
                Nama Lengkap
              </p>

              <p className="font-medium text-slate-800 mt-1">
                {pengajuan.namaLengkap}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                NIK
              </p>

              <p className="font-medium text-slate-800 mt-1">
                {pengajuan.nik}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          STATUS RUMAH
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="w-5 h-5 text-green-600" />

            Status Tempat Tinggal

            <span className="text-red-500">
              *
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Pilih status rumah atau tempat tinggal Anda saat ini.
          </p>

          <div className="grid gap-3 md:grid-cols-3">

            {STATUS_RUMAH_OPTIONS.map(
              (
                option
              ) => {
                const selected =
                  statusRumah ===
                  option.value

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    disabled={
                      isLocked
                    }
                    onClick={() => {
                      if (
                        !isLocked
                      ) {
                        setStatusRumah(
                          option.value
                        )
                      }
                    }}
                    className={cn(
                      'rounded-lg border p-4 text-left transition-all',

                      selected
                        ? 'border-green-600 bg-green-50 ring-1 ring-green-600'
                        : 'border-slate-200 bg-white hover:border-green-400',

                      isLocked &&
                        'cursor-not-allowed opacity-80'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">

                      <div>
                        <p className="font-medium text-slate-800">
                          {option.label}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {option.description}
                        </p>
                      </div>

                      {selected && (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      )}
                    </div>
                  </button>
                )
              }
            )}

          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          KRITERIA KUESIONER
      ====================================================== */}

      <div className="space-y-5">

        {kriteria.map(
          (
            item,
            index
          ) => (
            <Card
              key={
                item.id
              }
            >
              <CardHeader>
                <CardTitle className="text-base leading-relaxed">

                  <span className="text-green-600 mr-2">
                    {index + 1}.
                  </span>

                  {item.nama}
                </CardTitle>

                {item.deskripsi && (
                  <p className="text-sm text-slate-500">
                    {item.deskripsi}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-3">

                  {item.subKriteria.map(
                    (
                      sub
                    ) => {
                      const selected =
                        answers[
                          item.id
                        ] ===
                        sub.id

                      return (
                        <button
                          key={
                            sub.id
                          }
                          type="button"
                          disabled={
                            isLocked
                          }
                          onClick={() =>
                            handleSelectAnswer(
                              item.id,
                              sub.id
                            )
                          }
                          className={cn(
                            'w-full rounded-lg border p-4 text-left transition-all',

                            selected
                              ? 'border-green-600 bg-green-50 ring-1 ring-green-600'
                              : 'border-slate-200 hover:border-green-400 hover:bg-slate-50',

                            isLocked &&
                              'cursor-not-allowed opacity-80'
                          )}
                        >
                          <div className="flex items-start gap-3">

                            <div
                              className={cn(
                                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',

                                selected
                                  ? 'border-green-600 bg-green-600'
                                  : 'border-slate-300'
                              )}
                            >
                              {selected && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>

                            <div>
                              <p className="font-medium text-slate-800">
                                {sub.nama}
                              </p>

                              {sub.keterangan && (
                                <p className="text-sm text-slate-500 mt-1">
                                  {sub.keterangan}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    }
                  )}

                </div>
              </CardContent>
            </Card>
          )
        )}

      </div>

      {/* ======================================================
          SUBMIT
      ====================================================== */}

      {!isLocked && (
        <div className="flex justify-end">

          <Button
            size="lg"
            disabled={
              submitting ||
              kriteria.length === 0
            }
            onClick={
              handleSubmit
            }
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Mengirim...
              </>
            ) : (
              <>
                Kirim Kuesioner

                <Send className="w-4 h-4" />
              </>
            )}
          </Button>

        </div>
      )}

      {/* ======================================================
          LOCKED ACTION
      ====================================================== */}

      {isLocked && (
        <div className="flex justify-end">

          <Button
            onClick={() =>
              navigate(
                '/pantau-hasil'
              )
            }
            className="gap-2"
          >
            Pantau Hasil

            <ArrowRight className="w-4 h-4" />
          </Button>

        </div>
      )}

      {/* ======================================================
          FOOTER LOCK INFO
      ====================================================== */}

      {isLocked && (
        <div className="flex items-center gap-2 text-sm text-slate-500">

          <Lock className="w-4 h-4" />

          Kuesioner sudah dikunci.
        </div>
      )}

    </div>
  )
}