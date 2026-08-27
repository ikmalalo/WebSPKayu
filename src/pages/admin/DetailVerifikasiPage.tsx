import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  FileText,
  ClipboardCheck,
} from 'lucide-react'

import {
  getAdminVerifikasiDetail,
  submitAdminVerifikasi,
  type AdminVerificationDetail,
} from '@/lib/adminApi'

// ============================================================
// TYPES
// ============================================================

type VerificationStatus =
  | 'LOLOS'
  | 'PERLU_PERBAIKAN'
  | 'DITOLAK'

type AnswerItem = {
  id: string
  pengajuanId?: string
  indikatorId?: string | null
  kriteriaId?: string | null
  subKriteriaId?: string | null
  nilai: number | string

  indikator?: {
    id: string
    kode: string
    nama: string
    deskripsi?: string | null
    tipe?: string
    urutan?: number

    kriteria?: {
      id: string
      kode: string
      nama: string
      bobot?: number | string
      tipe?: string
    } | null
  } | null

  // Fallback struktur lama
  kriteria?: {
    id: string
    kode: string
    nama: string
    bobot?: number | string
    tipe?: string
  } | null

  // Fallback struktur lama
  subKriteria?: {
    id: string
    nama: string
    nilai?: number | string
    keterangan?: string | null
  } | null
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-'
  }

  return date.toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  )
}

function formatNumber(
  value:
    | number
    | string
    | null
    | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '-'
  }

  const number = Number(value)

  if (
    Number.isNaN(number)
  ) {
    return String(value)
  }

  return number.toLocaleString(
    'id-ID'
  )
}

// ============================================================
// PAGE
// ============================================================

export default function DetailVerifikasiPage() {
  const {
    id,
  } =
    useParams<{
      id: string
    }>()

  const navigate =
    useNavigate()

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    detail,
    setDetail,
  ] =
    useState<AdminVerificationDetail | null>(
      null
    )

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
    useState('')

  const [
    status,
    setStatus,
  ] =
    useState<VerificationStatus>(
      'LOLOS'
    )

  const [
    catatan,
    setCatatan,
  ] =
    useState('')

  // ==========================================================
  // LOAD DETAIL
  // ==========================================================

  const loadDetail =
    useCallback(
      async () => {
        if (!id) {
          setError(
            'ID pengajuan tidak ditemukan.'
          )

          setLoading(false)

          return
        }

        try {
          setLoading(true)
          setError('')

          const result =
            await getAdminVerifikasiDetail(
              id
            )

          setDetail(
            result
          )

          const latestVerification =
            result.verifications?.[0]

          if (
            latestVerification
          ) {
            const previousStatus =
              latestVerification.status

            if (
              previousStatus ===
              'LOLOS'
            ) {
              setStatus(
                'LOLOS'
              )
            } else if (
              previousStatus ===
              'PERLU_PERBAIKAN'
            ) {
              setStatus(
                'PERLU_PERBAIKAN'
              )
            } else if (
              previousStatus ===
              'DITOLAK'
            ) {
              setStatus(
                'DITOLAK'
              )
            }

            setCatatan(
              latestVerification.catatan ||
                ''
            )
          } else {
            setCatatan(
              result.catatan ||
                ''
            )
          }
        } catch (
          error
        ) {
          console.error(
            'GET DETAIL VERIFIKASI ERROR:',
            error
          )

          setError(
            error instanceof Error
              ? error.message
              : 'Gagal mengambil detail verifikasi.'
          )
        } finally {
          setLoading(false)
        }
      },
      [id]
    )

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  // ==========================================================
  // SUBMIT VERIFICATION
  // ==========================================================

  const handleSubmit =
    async () => {
      if (!id) {
        return
      }

      try {
        setSubmitting(true)
        setError('')

        await submitAdminVerifikasi(
          id,
          {
            status,
            catatan:
              catatan.trim() ||
              undefined,
          }
        )

        navigate(
          '/admin/verifikasi',
          {
            replace: true,
          }
        )
      } catch (
        error
      ) {
        console.error(
          'SUBMIT VERIFIKASI ERROR:',
          error
        )

        setError(
          error instanceof Error
            ? error.message
            : 'Gagal menyimpan verifikasi.'
        )
      } finally {
        setSubmitting(false)
      }
    }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <RefreshCw className="h-5 w-5 animate-spin text-green-600" />

            <span>
              Memuat detail verifikasi...
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // ERROR / NO DATA
  // ==========================================================

  if (
    error &&
    !detail
  ) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/admin/verifikasi'
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Kembali
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

              <div>
                <h2 className="font-semibold text-red-800">
                  Gagal memuat data
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    void loadDetail()
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <RefreshCw className="h-4 w-4" />

                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!detail) {
    return null
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const mustahik =
    detail.mustahik

  const pengajuan =
    detail.pengajuan

  const answers: AnswerItem[] =
    Array.isArray(
      pengajuan?.jawaban
    )
      ? (
          pengajuan.jawaban as AnswerItem[]
        )
      : []

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                '/admin/verifikasi'
              )
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Kembali ke Verifikasi
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Detail Verifikasi
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Periksa data mustahik sebelum menentukan hasil verifikasi.
          </p>
        </div>

        {/* ====================================================
            ERROR SUBMIT
        ==================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            DATA MUSTAHIK
        ==================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />

              <h2 className="font-semibold text-slate-900">
                Data Mustahik
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">

            <div>
              <p className="text-xs text-slate-500">
                Nama Lengkap
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.namaLengkap ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                NIK
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.nik ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Nomor HP
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.noHp ||
                  mustahik?.user?.phone ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Tempat Lahir
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.tempatLahir ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Tanggal Lahir
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatDate(
                  mustahik?.tanggalLahir
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Jenis Kelamin
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.jenisKelamin ||
                  '-'}
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs text-slate-500">
                Alamat
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.alamat ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Kelurahan
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.kelurahan ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Kecamatan
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.kecamatan ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Kota
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.kota ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Provinsi
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.provinsi ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Status Pernikahan
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.statusPernikahan ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Pekerjaan
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {mustahik?.pekerjaan ||
                  '-'}
              </p>
            </div>

          </div>
        </section>

        {/* ====================================================
            DATA PENGAJUAN
        ==================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />

              <h2 className="font-semibold text-slate-900">
                Data Pengajuan
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">

            <div>
              <p className="text-xs text-slate-500">
                ID Pengajuan
              </p>

              <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                {pengajuan?.id ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Tanggal Pengajuan
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formatDate(
                  pengajuan?.tanggalPengajuan
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Status Saat Ini
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {pengajuan?.status ||
                  '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Catatan Pengajuan
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {pengajuan?.catatan ||
                  '-'}
              </p>
            </div>

          </div>
        </section>

        {/* ====================================================
            JAWABAN KUESIONER
        ==================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />

              <div>
                <h2 className="font-semibold text-slate-900">
                  Hasil Kuesioner
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Data yang akan digunakan dalam proses TOPSIS.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">

            {answers.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Belum ada jawaban kuesioner.
              </div>
            ) : (
              <table className="w-full">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kriteria
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Indikator
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nilai
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {answers.map(
                    (
                      answer: AnswerItem
                    ) => {
                      const kriteria =
                        answer.indikator?.kriteria ||
                        answer.kriteria

                      const indikator =
                        answer.indikator

                      return (
                        <tr
                          key={
                            answer.id
                          }
                          className="border-b border-slate-100 last:border-b-0"
                        >

                          {/* KRITERIA */}

                          <td className="px-5 py-4">

                            <p className="font-medium text-slate-900">

                              {kriteria?.kode
                                ? `${kriteria.kode} - `
                                : ''}

                              {kriteria?.nama ||
                                '-'}

                            </p>

                          </td>

                          {/* INDIKATOR */}

                          <td className="px-5 py-4">

                            <p className="text-sm text-slate-700">

                              {indikator?.kode
                                ? `${indikator.kode} - `
                                : ''}

                              {indikator?.nama ||
                                answer.subKriteria?.nama ||
                                '-'}

                            </p>

                            {(indikator?.deskripsi ||
                              answer.subKriteria?.keterangan) && (
                              <p className="mt-1 text-xs text-slate-400">

                                {indikator?.deskripsi ||
                                  answer.subKriteria?.keterangan}

                              </p>
                            )}

                          </td>

                          {/* NILAI */}

                          <td className="px-5 py-4">

                            <span className="font-semibold text-slate-900">

                              {formatNumber(
                                answer.nilai
                              )}

                            </span>

                          </td>

                        </tr>
                      )
                    }
                  )}

                </tbody>

              </table>
            )}

          </div>
        </section>

        {/* ====================================================
            FORM VERIFIKASI
        ==================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <h2 className="font-semibold text-slate-900">
              Keputusan Verifikasi
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tentukan hasil verifikasi pengajuan ini.
            </p>

          </div>

          <div className="space-y-5 p-5">

            {/* STATUS */}

            <div>

              <label className="mb-3 block text-sm font-medium text-slate-700">
                Status Verifikasi
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                {/* LOLOS */}

                <button
                  type="button"
                  onClick={() =>
                    setStatus(
                      'LOLOS'
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    status === 'LOLOS'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-100'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <CheckCircle2 className="h-5 w-5 text-green-600" />

                    <div>

                      <p className="font-semibold text-slate-900">
                        Lolos
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Lanjut ke proses TOPSIS
                      </p>

                    </div>

                  </div>

                </button>

                {/* PERLU PERBAIKAN */}

                <button
                  type="button"
                  onClick={() =>
                    setStatus(
                      'PERLU_PERBAIKAN'
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    status === 'PERLU_PERBAIKAN'
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <AlertCircle className="h-5 w-5 text-orange-600" />

                    <div>

                      <p className="font-semibold text-slate-900">
                        Perlu Perbaikan
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        User perlu memperbaiki data
                      </p>

                    </div>

                  </div>

                </button>

                {/* DITOLAK */}

                <button
                  type="button"
                  onClick={() =>
                    setStatus(
                      'DITOLAK'
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    status === 'DITOLAK'
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-100'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <XCircle className="h-5 w-5 text-red-600" />

                    <div>

                      <p className="font-semibold text-slate-900">
                        Ditolak
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Pengajuan tidak dilanjutkan
                      </p>

                    </div>

                  </div>

                </button>

              </div>

            </div>

            {/* CATATAN */}

            <div>

              <label
                htmlFor="catatan"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Catatan Admin
              </label>

              <textarea
                id="catatan"
                value={
                  catatan
                }
                onChange={(
                  event
                ) => {
                  setCatatan(
                    event.target.value
                  )
                }}
                rows={5}
                placeholder="Masukkan catatan verifikasi..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </div>

            {/* ACTION */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/verifikasi'
                  )
                }
                disabled={
                  submitting
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleSubmit()
                }}
                disabled={
                  submitting
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />

                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />

                    Simpan Verifikasi
                  </>
                )}

              </button>

            </div>

          </div>
        </section>

      </div>
    </div>
  )
}