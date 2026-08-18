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
  tipe: 'BENEFIT' | 'COST'
  deskripsi?: string | null
  subKriteria: SubKriteriaApi[]
}

interface ExistingAnswer {
  kriteriaId: string
  subKriteriaId: string
}

export function KuesionerPage() {
  const navigate =
    useNavigate()

  const {
    pengajuan,
    setPengajuan,
  } = usePengajuan()

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
    Record<string, string>
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
  ] = useState<string | null>(
    null
  )

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  }

  /*
   * ==========================================================
   * LOAD KUESIONER
   * ==========================================================
   */

  useEffect(() => {
    const load =
      async () => {
        if (!token) {
          setLoading(false)
          return
        }

        try {
          setError(null)

          /*
           * Ambil kriteria dari database.
           */
          const kriteriaResponse =
            await axios.get(
              `${API_URL}/kuesioner`,
              {
                headers:
                  authHeaders,
              }
            )

          const kriteriaData =
            kriteriaResponse.data
              ?.data?.kriteria ||
            []

          setKriteria(
            kriteriaData
          )

          /*
           * Kalau context belum punya
           * pengajuan, cari dari backend.
           */
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
              response.data
                ?.data?.pengajuan ||
              []

            if (
              list.length > 0
            ) {
              const p =
                list[0]

              currentPengajuan =
                {
                  id: p.id,
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
                    undefined,
                  catatan:
                    p.catatan ||
                    undefined,
                }

              setPengajuan(
                currentPengajuan
              )
            }
          }

          /*
           * Ambil pengajuan lengkap
           * termasuk jawaban sebelumnya.
           */
          if (
            currentPengajuan?.id
          ) {
            const detailResponse =
              await axios.get(
                `${API_URL}/pengajuan/${currentPengajuan.id}`,
                {
                  headers:
                    authHeaders,
                }
              )

            const detail =
              detailResponse.data
                ?.data?.pengajuan

            const existingAnswers:
              ExistingAnswer[] =
              detail?.jawaban ||
              []

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

            setAnswers(
              answerMap
            )
          }
        } catch (err: any) {
          console.error(
            'Gagal memuat kuesioner:',
            err
          )

          setError(
            err.response
              ?.data?.message ||
              'Gagal memuat kuesioner.'
          )
        } finally {
          setLoading(false)
        }
      }

    load()
  }, [token])

  /*
   * ==========================================================
   * SELECT ANSWER
   * ==========================================================
   */

  const handleSelect =
    (
      kriteriaId: string,
      subKriteriaId: string
    ) => {
      setAnswers(
        (prev) => ({
          ...prev,
          [kriteriaId]:
            subKriteriaId,
        })
      )
    }

  const answered =
    Object.keys(
      answers
    ).length

  const totalQuestions =
    kriteria.length

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answered /
            totalQuestions) *
            100
        )
      : 0

  /*
   * ==========================================================
   * SUBMIT JAWABAN
   * ==========================================================
   */

  const handleSubmit =
    async () => {
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

      setSubmitting(true)
      setError(null)

      try {
        const jawaban =
          kriteria.map(
            (item) => ({
              kriteriaId:
                item.id,
              subKriteriaId:
                answers[
                  item.id
                ],
            })
          )

        /*
         * Simpan jawaban ke database.
         *
         * Backend akan:
         * 1. Validasi kriteria
         * 2. Mengambil nilai subkriteria
         * 3. Menyimpan JawabanKuesioner
         * 4. Mengubah status pengajuan
         *    menjadi MENUNGGU_VERIFIKASI
         */
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

        /*
         * Ambil ulang pengajuan
         * agar context memiliki status
         * terbaru.
         */
        const detailResponse =
          await axios.get(
            `${API_URL}/pengajuan/${pengajuan.id}`,
            {
              headers:
                authHeaders,
            }
          )

        const detail =
          detailResponse.data
            ?.data?.pengajuan

        if (detail) {
          setPengajuan({
            ...pengajuan,
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
        }

        /*
         * Setelah selesai → pantau hasil.
         */
        navigate(
          '/pantau-hasil',
          {
            replace: true,
          }
        )
      } catch (err: any) {
        console.error(
          'Gagal menyimpan jawaban:',
          err
        )

        setError(
          err.response
            ?.data?.message ||
            'Gagal menyimpan jawaban kuesioner.'
        )
      } finally {
        setSubmitting(false)
      }
    }

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
          Memuat kuesioner...
        </span>
      </div>
    )
  }

  /*
   * ==========================================================
   * BELUM ADA PENGAJUAN
   * ==========================================================
   */

  if (!pengajuan) {
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

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuesioner Penilaian"
        description="Jawab seluruh pertanyaan sesuai kondisi Anda saat ini"
      />

      {/* PROGRESS */}
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
                width: `${progress}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <HelpCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />

          <p className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* INFO */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-900">
        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />

        <p className="text-xs text-blue-700 dark:text-blue-300">
          Jawaban kuesioner akan menjadi
          nilai kriteria SPK TOPSIS.
          Tidak perlu mengisi data ekonomi
          atau kondisi rumah di halaman
          pengajuan.
        </p>
      </div>

      {/* QUESTIONS */}
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
                key={item.id}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 flex items-center justify-center text-sm font-bold shrink-0">
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
                              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                              isSelected
                                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-green-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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

      {/* SUBMIT */}
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
              Menyimpan Jawaban...
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
    </div>
  )
}