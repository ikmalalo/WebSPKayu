import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send,
  Loader2,
  HelpCircle,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'

import {
  mockKriteria,
  mockSubKriteria,
  mockPengajuan,
} from '@/data/mockData'

import { cn } from '@/lib/utils'

import type {
  SubKriteria,
  Pengajuan,
  StatusPengajuan,
} from '@/types'

import {
  usePengajuan,
} from '@/context/PengajuanContext'

import {
  useAuth,
} from '@/context/AuthContext'

export function KuesionerPage() {
  const navigate = useNavigate()

  const {
    pengajuan,
    setPengajuan,
  } = usePengajuan()

  const {
    currentUser,
  } = useAuth()

  const [answers, setAnswers] =
    useState<Record<string, string>>({})

  const [loading, setLoading] =
    useState(false)

  const totalQuestions =
    mockKriteria.length

  const answered =
    Object.keys(answers).length

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answered /
            totalQuestions) *
            100
        )
      : 0

  const handleSelect = (
    kriteriaId: string,
    subKriteriaId: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [kriteriaId]:
        subKriteriaId,
    }))
  }

  const handleSubmit = () => {
    if (
      answered <
      totalQuestions
    ) {
      return
    }

    setLoading(true)

    setTimeout(() => {
      try {
        /*
         * Gunakan pengajuan yang sudah dibuat
         * dari FormDataMustahikPage.
         *
         * Hanya gunakan fallback kalau memang
         * belum ada pengajuan.
         */
        const current: Pengajuan =
          pengajuan || {
            id: `p_${Date.now()}`,
            userId:
              currentUser?.id ||
              '',
            mustahikId: '',
            namaLengkap:
              currentUser?.name ||
              '',
            nik: '',
            status:
              'DRAFT' as StatusPengajuan,
            tanggalPengajuan:
              new Date()
                .toISOString()
                .split('T')[0],
          }

        /*
         * Update status.
         */
        const updatedSubmission: Pengajuan =
          {
            ...current,
            status:
              'MENUNGGU_VERIFIKASI' as StatusPengajuan,
          }

        /*
         * Cari pengajuan di mock array
         * berdasarkan ID.
         */
        const idx =
          mockPengajuan.findIndex(
            (item) =>
              item.id ===
              updatedSubmission.id
          )

        if (idx > -1) {
          mockPengajuan[idx] =
            updatedSubmission
        } else {
          mockPengajuan.push(
            updatedSubmission
          )
        }

        /*
         * Simpan ke context.
         *
         * Context sekarang menggunakan:
         * spk_current_pengajuan
         *
         * sehingga TIDAK merusak:
         * spk_pengajuan
         */
        setPengajuan(
          updatedSubmission
        )

        /*
         * Pindah ke halaman pantau.
         */
        navigate(
          '/pantau-hasil',
          {
            replace: true,
          }
        )
      } catch (error) {
        console.error(
          'Gagal menyimpan hasil kuesioner:',
          error
        )
      } finally {
        setLoading(false)
      }
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuesioner Penilaian"
        description="Jawab seluruh pertanyaan berikut sesuai kondisi Anda yang sebenarnya"
      />

      {/* PROGRESS */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress Pengisian
          </span>

          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {answered}/{totalQuestions}
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
      </div>

      {/* INFO */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-900">
        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />

        <p className="text-xs text-blue-700 dark:text-blue-300">
          Pilih satu jawaban yang paling sesuai
          dengan kondisi Anda saat ini. Jawaban
          jujur akan membantu proses penilaian
          yang adil.
        </p>
      </div>

      {/* QUESTIONS */}
      <div className="space-y-4">
        {mockKriteria.map(
          (
            kriteria,
            idx
          ) => {
            const subItems =
              mockSubKriteria.filter(
                (sk) =>
                  sk.kriteriaId ===
                  kriteria.id
              )

            const selected =
              answers[
                kriteria.id
              ]

            return (
              <Card
                key={
                  kriteria.id
                }
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-slate-800 text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-green-200 dark:border-green-800">
                      {idx + 1}
                    </div>

                    <div>
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                        {kriteria.nama}

                        <span
                          className={cn(
                            'ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                            kriteria.tipe ===
                              'benefit'
                              ? 'bg-green-50 dark:bg-slate-800/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                              : 'bg-amber-50 dark:bg-slate-800/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          )}
                        >
                          {kriteria.tipe ===
                          'benefit'
                            ? 'Benefit'
                            : 'Cost'}
                        </span>
                      </CardTitle>

                      <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                        {
                          kriteria.deskripsi
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {subItems.map(
                      (
                        sk: SubKriteria
                      ) => (
                        <label
                          key={
                            sk.id
                          }
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                            selected ===
                              sk.id
                              ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-green-300 dark:hover:border-green-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          )}
                        >
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                              selected ===
                                sk.id
                                ? 'border-green-500 bg-green-500'
                                : 'border-slate-300 dark:border-slate-600'
                            )}
                          >
                            {selected ===
                              sk.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>

                          <input
                            type="radio"
                            name={
                              kriteria.id
                            }
                            value={
                              sk.id
                            }
                            className="sr-only"
                            onChange={() =>
                              handleSelect(
                                kriteria.id,
                                sk.id
                              )
                            }
                          />

                          <div className="flex items-center justify-between flex-1">
                            <span className="text-sm text-slate-700 dark:text-slate-200">
                              {
                                sk.keterangan
                              }
                            </span>

                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-2">
                              Nilai:{' '}
                              {
                                sk.nilai
                              }
                            </span>
                          </div>
                        </label>
                      )
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
            answered <
              totalQuestions ||
            loading
          }
          className="min-w-[160px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />

              {answered <
              totalQuestions
                ? `Isi ${
                    totalQuestions -
                    answered
                  } pertanyaan lagi`
                : 'Kirim Jawaban'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}