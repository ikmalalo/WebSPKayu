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

import type {
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
// STATUS YANG TIDAK BOLEH EDIT
// ============================================================

const LOCKED_STATUSES: StatusPengajuan[] = [
  'MENUNGGU_VERIFIKASI',
  'SEDANG_DIVERIFIKASI',
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
  } =
    useAuth()


  const [
    kriteria,
    setKriteria,
  ] =
    useState<
      KriteriaApi[]
    >([])


  const [
    answers,
    setAnswers,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({})


  const [
    statusRumah,
    setStatusRumah,
  ] =
    useState('')


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false)


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)


  const [
    submitted,
    setSubmitted,
  ] =
    useState(false)


  // ==========================================================
  // LOAD DATA
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
            setLoading(true)
            setError(null)

            const headers = {
              Authorization:
                `Bearer ${token}`,
            }


            // --------------------------------------------------
            // LOAD KRITERIA
            // --------------------------------------------------

            const kriteriaResponse =
              await axios.get(
                `${API_URL}/kuesioner`,
                {
                  headers,
                }
              )

            const kriteriaData =
              kriteriaResponse
                .data
                ?.data
                ?.kriteria ||
              []

            if (
              mounted
            ) {
              setKriteria(
                kriteriaData
              )
            }


            // --------------------------------------------------
            // AMBIL PENGAJUAN
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
                    headers,
                  }
                )

              const list =
                response
                  .data
                  ?.data
                  ?.pengajuan ||
                []

              if (
                Array.isArray(list) &&
                list.length > 0
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
                      String(
                        p.id ||
                        ''
                      ),

                    userId:
                      String(
                        p.userId ||
                        ''
                      ),

                    mustahikId:
                      String(
                        p.mustahikId ||
                        ''
                      ),

                    namaLengkap:
                      String(
                        p.mustahik
                          ?.namaLengkap ||
                        ''
                      ),

                    nik:
                      String(
                        p.mustahik
                          ?.nik ||
                        ''
                      ),

                    status:
                      toStatusPengajuan(
                        p.status
                      ),

                    tanggalPengajuan:
                      p.createdAt
                        ? new Date(
                            p.createdAt
                          )
                            .toISOString()
                            .split('T')[0]
                        : '',

                    catatan:
                      p.catatan ||
                      undefined,

                    tanggalVerifikasi:
                      p.tanggalVerifikasi
                        ? new Date(
                            p.tanggalVerifikasi
                          )
                            .toISOString()
                            .split('T')[0]
                        : undefined,
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
            // BELUM ADA PENGAJUAN
            // --------------------------------------------------

            if (
              !currentPengajuan
            ) {
              return
            }


            // --------------------------------------------------
            // LOAD DETAIL PENGAJUAN
            // --------------------------------------------------

            const detailResponse =
              await axios.get(
                `${API_URL}/pengajuan/${currentPengajuan.id}`,
                {
                  headers,
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
            // STATUS RUMAH
            // --------------------------------------------------

            if (
              detail
                ?.mustahik
                ?.statusRumah
            ) {
              setStatusRumah(
                String(
                  detail
                    .mustahik
                    .statusRumah
                )
              )
            }


            // --------------------------------------------------
            // EXISTING ANSWERS
            // --------------------------------------------------

            const existingAnswers:
              ExistingAnswer[] =
              Array.isArray(
                detail?.jawaban
              )
                ? detail.jawaban
                : []

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
                  answer: ExistingAnswer
                ) => {
                  if (
                    answer.kriteriaId &&
                    answer.subKriteriaId
                  ) {
                    mappedAnswers[
                      answer.kriteriaId
                    ] =
                      answer.subKriteriaId
                  }
                }
              )

              setAnswers(
                mappedAnswers
              )
            }


            // --------------------------------------------------
            // LOCK
            // --------------------------------------------------

            const currentStatus =
              toStatusPengajuan(
                detail?.status ||
                currentPengajuan.status
              )

            if (
              LOCKED_STATUSES.includes(
                currentStatus
              )
            ) {
              setSubmitted(true)
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
    ]
  )


  // ==========================================================
  // LOCK
  // ==========================================================
  //
  // Boolean() PENTING supaya hasilnya benar-benar boolean.
  // Sebelumnya:
  //
  // submitted || (pengajuan && ...)
  //
  // menghasilkan boolean | null.
  //
  // ==========================================================

  const isLocked: boolean =
    Boolean(
      submitted ||
      (
        pengajuan &&
        LOCKED_STATUSES.includes(
          pengajuan.status
        )
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


      // --------------------------------------------------------
      // VALIDASI JAWABAN
      // --------------------------------------------------------

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


      // --------------------------------------------------------
      // VALIDASI STATUS RUMAH
      // --------------------------------------------------------

      if (
        !statusRumah
      ) {
        setError(
          'Silakan pilih status rumah terlebih dahulu.'
        )

        return
      }

      setSubmitting(true)
      setError(null)

      try {

        // ------------------------------------------------------
        // PENTING
        //
        // answers[item.id]! menggunakan tanda !
        //
        // Karena sebelumnya sudah divalidasi semua kriteria
        // wajib mempunyai jawaban.
        //
        // Ini memperbaiki:
        //
        // Type 'string | undefined'
        // is not assignable to type 'string'
        //
        // ------------------------------------------------------

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
                ]!,
            })
          )


        // ------------------------------------------------------
        // SUBMIT
        // ------------------------------------------------------

        await axios.post(
          `${API_URL}/kuesioner/jawaban`,
          {
            pengajuanId:
              pengajuan.id,

            jawaban,

            statusRumah,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )


        // ------------------------------------------------------
        // LOCK
        // ------------------------------------------------------

        setSubmitted(true)


        // ------------------------------------------------------
        // REFRESH CONTEXT
        // ------------------------------------------------------

        await refreshPengajuan()


        // ------------------------------------------------------
        // LOAD STATUS TERBARU
        // ------------------------------------------------------

        const detailResponse =
          await axios.get(
            `${API_URL}/pengajuan/${pengajuan.id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
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
                toStatusPengajuan(
                  detail.status
                ),

              tanggalVerifikasi:
                detail.tanggalVerifikasi
                  ? new Date(
                      detail.tanggalVerifikasi
                    )
                      .toISOString()
                      .split('T')[0]
                  : undefined,

              catatan:
                detail.catatan ||
                undefined,
            })
          )
        }


        // ------------------------------------------------------
        // REDIRECT
        // ------------------------------------------------------

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
          setSubmitted(true)

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
        setSubmitting(false)
      }
    }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading
  ) {
    return (
      <div className="flex h-48 items-center justify-center">

        <Loader2 className="h-6 w-6 animate-spin text-green-600" />

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
              Silakan isi data pribadi terlebih dahulu
              sebelum mengisi kuesioner.
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
          LOCK INFO
      ====================================================== */}

      {isLocked && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">

            <div className="flex gap-3">

              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

              <div>
                <p className="font-medium text-green-800">
                  Kuesioner telah dikirim
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Jawaban kuesioner tidak dapat diubah kembali
                  dan sedang menunggu proses selanjutnya.
                </p>
              </div>

            </div>

          </CardContent>
        </Card>
      )}


      {/* ERROR */}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">

            <p className="text-sm text-red-600">
              {error}
            </p>

          </CardContent>
        </Card>
      )}


      {/* INFO */}

      {!isLocked && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">

            <div className="flex gap-3">

              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <div>
                <p className="font-medium text-blue-800">
                  Petunjuk Pengisian
                </p>

                <p className="mt-1 text-sm text-blue-700">
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

              <p className="mt-1 font-medium text-slate-800">
                {pengajuan.namaLengkap}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                NIK
              </p>

              <p className="mt-1 font-medium text-slate-800">
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

            <Home className="h-5 w-5 text-green-600" />

            Status Tempat Tinggal

            <span className="text-red-500">
              *
            </span>

          </CardTitle>

        </CardHeader>

        <CardContent>

          <p className="mb-4 text-sm text-slate-500">
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

                        <p className="mt-1 text-xs text-slate-500">
                          {option.description}
                        </p>

                      </div>

                      {selected && (
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
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
          KRITERIA
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

                  <span className="mr-2 text-green-600">
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
                                  : 'border-slate-300 bg-white'
                              )}
                            >

                              {selected && (
                                <CheckCircle className="h-3.5 w-3.5 text-white" />
                              )}

                            </div>

                            <div>

                              <p className="font-medium text-slate-800">
                                {sub.nama}
                              </p>

                              {sub.keterangan && (
                                <p className="mt-1 text-sm text-slate-500">
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
        <Card>

          <CardContent className="p-5">

            <Button
              className="w-full"
              onClick={
                handleSubmit
              }
              disabled={
                submitting ||
                kriteria.length === 0
              }
            >

              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim Kuesioner...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim Kuesioner
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}

            </Button>

          </CardContent>

        </Card>
      )}


      {/* ======================================================
          LOCKED BUTTON
      ====================================================== */}

      {isLocked && (
        <Card>

          <CardContent className="p-5">

            <Button
              className="w-full"
              variant="outline"
              disabled
            >

              <Lock className="mr-2 h-4 w-4" />

              Kuesioner Terkunci

            </Button>

          </CardContent>

        </Card>
      )}

    </div>
  )
}