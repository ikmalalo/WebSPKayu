import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
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
  Textarea,
} from '@/components/ui/textarea'

import {
  StatusBadge,
} from '@/components/shared/StatusBadge'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  FormField,
} from '@/components/shared/FormField'

import {
  getAdminVerifikasiDetail,
  submitAdminVerifikasi,
  type AdminVerificationDetail,
} from '@/lib/adminApi'

import {
  formatDate,
  formatCurrency,
  formatNIK,
} from '@/lib/utils'

export function DetailVerifikasiPage() {
  const {
    id,
  } = useParams()

  const navigate =
    useNavigate()

  const [
    data,
    setData,
  ] =
    useState<AdminVerificationDetail | null>(
      null
    )

  const [
    catatan,
    setCatatan,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    loadingAction,
    setLoadingAction,
  ] =
    useState<string | null>(
      null
    )

  const [
    error,
    setError,
  ] = useState('')

  useEffect(() => {
    if (!id) return

    const load =
      async () => {
        try {
          setLoading(true)

          const result =
            await getAdminVerifikasiDetail(
              id
            )

          setData(result)

          setCatatan(
            result.catatan ||
              result
                .verifications?.[0]
                ?.catatan ||
              ''
          )
        } catch (err: any) {
          console.error(err)

          setError(
            err.response
              ?.data?.message ||
            'Gagal mengambil detail verifikasi.'
          )
        } finally {
          setLoading(false)
        }
      }

    load()
  }, [id])

  const handleVerifikasi =
    async (
      action:
        | 'LOLOS'
        | 'PERLU_PERBAIKAN'
        | 'DITOLAK'
    ) => {
      if (!id) return

      try {
        setLoadingAction(
          action
        )

        await submitAdminVerifikasi(
          id,
          action,
          catatan
        )

        navigate(
          '/admin/verifikasi'
        )
      } catch (err: any) {
        console.error(err)

        setError(
          err.response
            ?.data?.message ||
          'Gagal menyimpan verifikasi.'
        )
      } finally {
        setLoadingAction(null)
      }
    }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  if (
    !data
  ) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detail Verifikasi">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                '/admin/verifikasi'
              )
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="py-12 text-center text-red-600">
            {error ||
              'Data tidak ditemukan.'}
          </CardContent>
        </Card>
      </div>
    )
  }

  const mustahik =
    data.mustahik

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Verifikasi: ${mustahik.namaLengkap}`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate(
              '/admin/verifikasi'
            )
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </PageHeader>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* DATA MUSTAHIK */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {mustahik.namaLengkap}
              </CardTitle>

              <p className="text-xs text-slate-400 font-mono mt-1">
                NIK:{' '}
                {formatNIK(
                  mustahik.nik
                )}
              </p>
            </div>

            <StatusBadge
              status={
                data.status as any
              }
            />
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">
              Pekerjaan
            </p>

            <p className="font-semibold">
              {mustahik.pekerjaan ||
                '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Penghasilan
            </p>

            <p className="font-semibold">
              {mustahik.penghasilan !==
              null
                ? formatCurrency(
                    Number(
                      mustahik.penghasilan
                    )
                  )
                : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Jumlah Tanggungan
            </p>

            <p className="font-semibold">
              {mustahik.jumlahTanggungan ??
                '-'}{' '}
              Orang
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Status Rumah
            </p>

            <p className="font-semibold capitalize">
              {mustahik.statusRumah
                ?.replace(
                  /_/g,
                  ' '
                ) ||
                '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* JAWABAN KUESIONER */}
      <Card>
        <CardHeader>
          <CardTitle>
            Validasi Jawaban Kuesioner
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {data.jawaban.length ===
          0 ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
              User belum mengisi
              jawaban kuesioner.
            </div>
          ) : (
            data.jawaban.map(
              (answer) => (
                <div
                  key={answer.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {answer.kriteria
                        ?.kode}{' '}
                      -{' '}
                      {answer.kriteria
                        ?.nama}
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {answer
                        .subKriteria
                        ?.keterangan ||
                        answer
                          .subKriteria
                          ?.nama ||
                        '-'}
                    </p>
                  </div>

                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    Nilai:{' '}
                    {Number(
                      answer.nilai
                    )}
                  </span>
                </div>
              )
            )
          )}
        </CardContent>
      </Card>

      {/* KEPUTUSAN */}
      <Card className="border-green-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />

            <CardTitle>
              Keputusan Verifikasi
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <FormField
            label="Catatan Verifikator / Admin"
            htmlFor="catatan"
          >
            <Textarea
              id="catatan"
              placeholder="Masukkan catatan verifikasi..."
              value={catatan}
              onChange={(e) =>
                setCatatan(
                  e.target.value
                )
              }
              rows={4}
            />
          </FormField>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              disabled={
                loadingAction !==
                null
              }
              onClick={() =>
                handleVerifikasi(
                  'LOLOS'
                )
              }
            >
              {loadingAction ===
              'LOLOS' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}

              Lolos Verifikasi
            </Button>

            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 flex-1"
              disabled={
                loadingAction !==
                null
              }
              onClick={() =>
                handleVerifikasi(
                  'PERLU_PERBAIKAN'
                )
              }
            >
              {loadingAction ===
              'PERLU_PERBAIKAN' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}

              Perlu Perbaikan
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              disabled={
                loadingAction !==
                null
              }
              onClick={() =>
                handleVerifikasi(
                  'DITOLAK'
                )
              }
            >
              {loadingAction ===
              'DITOLAK' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}

              Tolak Pengajuan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}