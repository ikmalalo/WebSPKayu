import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  Users,
  XCircle,
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
  getAdminDashboard,
  getAdminMustahik,
  type AdminDashboardData,
  type AdminMustahik,
} from '@/lib/adminApi'

// ============================================================
// TYPES
// ============================================================

type DashboardStatus =
  | 'DRAFT'
  | 'MENUNGGU_VERIFIKASI'
  | 'SEDANG_DIVERIFIKASI'
  | 'PERLU_PERBAIKAN'
  | 'LOLOS_VERIFIKASI'
  | 'DITOLAK'
  | 'DIPROSES_TOPSIS'
  | 'LAYAK_DIDANAI'
  | 'TIDAK_DIDANAI'

type RecentPengajuan = {
  id: string
  nama: string
  nik: string
  status: DashboardStatus
  tanggal: string
}

// ============================================================
// HELPER
// ============================================================

function toNumber(
  value: number | string | null | undefined
): number {
  const numberValue = Number(value ?? 0)

  return Number.isFinite(numberValue)
    ? numberValue
    : 0
}

function getDateTime(
  value: string | null | undefined
): number {
  if (!value) {
    return 0
  }

  const time = new Date(value).getTime()

  return Number.isNaN(time)
    ? 0
    : time
}

function formatDate(
  value:
    | string
    | Date
    | null
    | undefined
): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  ).format(date)
}

function getStatusLabel(
  status: string
): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft'

    case 'MENUNGGU_VERIFIKASI':
      return 'Menunggu Verifikasi'

    case 'SEDANG_DIVERIFIKASI':
      return 'Sedang Diverifikasi'

    case 'PERLU_PERBAIKAN':
      return 'Perlu Perbaikan'

    case 'LOLOS_VERIFIKASI':
      return 'Lolos Verifikasi'

    case 'DITOLAK':
      return 'Ditolak'

    case 'DIPROSES_TOPSIS':
      return 'Diproses TOPSIS'

    case 'LAYAK_DIDANAI':
      return 'Layak Didanai'

    case 'TIDAK_DIDANAI':
      return 'Tidak Didanai'

    default:
      return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(
          /\b\w/g,
          (letter: string) =>
            letter.toUpperCase()
        )
  }
}

function getStatusClass(
  status: string
): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200'

    case 'MENUNGGU_VERIFIKASI':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'

    case 'SEDANG_DIVERIFIKASI':
      return 'bg-blue-100 text-blue-700 border-blue-200'

    case 'PERLU_PERBAIKAN':
      return 'bg-orange-100 text-orange-700 border-orange-200'

    case 'LOLOS_VERIFIKASI':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200'

    case 'DITOLAK':
      return 'bg-red-100 text-red-700 border-red-200'

    case 'DIPROSES_TOPSIS':
      return 'bg-purple-100 text-purple-700 border-purple-200'

    case 'LAYAK_DIDANAI':
      return 'bg-green-100 text-green-700 border-green-200'

    case 'TIDAK_DIDANAI':
      return 'bg-red-100 text-red-700 border-red-200'

    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function getMustahikName(
  item: AdminMustahik
): string {
  return (
    item.namaLengkap ||
    item.user?.name ||
    '-'
  )
}

function getMustahikNIK(
  item: AdminMustahik
): string {
  return item.nik || '-'
}

function getLatestPengajuan(
  item: AdminMustahik
) {
  const pengajuanList =
    item.pengajuan || []

  if (pengajuanList.length === 0) {
    return null
  }

  const sortedPengajuan = [
    ...pengajuanList,
  ].sort(
    (a, b) =>
      getDateTime(b.tanggalPengajuan) -
      getDateTime(a.tanggalPengajuan)
  )

  return sortedPengajuan[0] ?? null
}

// ============================================================
// COMPONENT
// ============================================================

export function AdminDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] = useState<
    AdminDashboardData | null
  >(null)

  const [
    mustahikList,
    setMustahikList,
  ] = useState<
    AdminMustahik[]
  >([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true)

      setError('')

      const [
        dashboardData,
        mustahikData,
      ] = await Promise.all([
        getAdminDashboard(),
        getAdminMustahik({}),
      ])

      setDashboard(dashboardData)

      setMustahikList(
        Array.isArray(mustahikData)
          ? mustahikData
          : []
      )
    } catch (err: unknown) {
      console.error(
        'GET ADMIN DASHBOARD ERROR:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memuat data dashboard.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadDashboard()
  }, [])

  // ==========================================================
  // RECENT PENGAJUAN
  // ==========================================================

  const recentPengajuan = useMemo(
    () => {
      const data: RecentPengajuan[] = []

      for (const item of mustahikList) {
        const pengajuan =
          getLatestPengajuan(item)

        if (!pengajuan) {
          continue
        }

        const status =
          pengajuan.status as DashboardStatus

        data.push({
          id: pengajuan.id,
          nama: getMustahikName(item),
          nik: getMustahikNIK(item),
          status,
          tanggal:
            pengajuan.tanggalPengajuan ||
            '',
        })
      }

      return data
        .sort(
          (a, b) =>
            getDateTime(b.tanggal) -
            getDateTime(a.tanggal)
        )
        .slice(0, 5)
    },
    [mustahikList]
  )

  // ==========================================================
  // STATUS DISTRIBUTION
  // ==========================================================

  const statusDistribution = useMemo(
    () => {
      const distribution:
        Record<
          DashboardStatus,
          number
        > = {
        DRAFT: 0,
        MENUNGGU_VERIFIKASI: 0,
        SEDANG_DIVERIFIKASI: 0,
        PERLU_PERBAIKAN: 0,
        LOLOS_VERIFIKASI: 0,
        DITOLAK: 0,
        DIPROSES_TOPSIS: 0,
        LAYAK_DIDANAI: 0,
        TIDAK_DIDANAI: 0,
      }

      mustahikList.forEach(
        (item) => {
          const pengajuan =
            getLatestPengajuan(item)

          if (!pengajuan) {
            return
          }

          const status =
            pengajuan.status as DashboardStatus

          if (
            status in distribution
          ) {
            distribution[status] += 1
          }
        }
      )

      return distribution
    },
    [mustahikList]
  )

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalMustahik =
    dashboard
      ? toNumber(
          dashboard.totalMustahik
        )
      : mustahikList.length

  const totalPengajuan =
    mustahikList.reduce(
      (total, item) =>
        total +
        (item.pengajuan?.length || 0),
      0
    )

  const menungguVerifikasi =
    dashboard
      ? toNumber(
          dashboard.menungguVerifikasi
        )
      : statusDistribution[
          'MENUNGGU_VERIFIKASI'
        ]

  const sedangDiproses =
    statusDistribution[
      'SEDANG_DIVERIFIKASI'
    ] +
    statusDistribution[
      'DIPROSES_TOPSIS'
    ]

  const layakDidanai =
    dashboard
      ? toNumber(
          dashboard.layakDidanai
        )
      : statusDistribution[
          'LAYAK_DIDANAI'
        ]

  const tidakDidanai =
    dashboard
      ? toNumber(
          dashboard.tidakDidanai
        )
      : statusDistribution[
          'TIDAK_DIDANAI'
        ]

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan data pengajuan dan proses seleksi penerima bantuan."
      >
        <Button
          variant="outline"
          onClick={() => {
            void loadDashboard()
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />

          Muat Ulang
        </Button>
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTIK UTAMA */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Mustahik
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalMustahik}
                </p>
              </div>

              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Pengajuan
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalPengajuan}
                </p>
              </div>

              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Menunggu Verifikasi
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {menungguVerifikasi}
                </p>
              </div>

              <ClipboardCheck className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Sedang Diproses
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {sedangDiproses}
                </p>
              </div>

              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HASIL SELEKSI */}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Layak Didanai
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {layakDidanai}
                </p>
              </div>

              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Tidak Didanai
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {tidakDidanai}
                </p>
              </div>

              <XCircle className="h-9 w-9 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DISTRIBUSI STATUS */}

      <Card>
        <CardHeader>
          <CardTitle>
            Distribusi Status Pengajuan
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(
              Object.entries(
                statusDistribution
              ) as [
                DashboardStatus,
                number
              ][]
            )
              .filter(
                ([, total]) =>
                  total > 0
              )
              .map(
                ([status, total]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {getStatusLabel(
                          status
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Jumlah pengajuan
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                        status
                      )}`}
                    >
                      {total}
                    </span>
                  </div>
                )
              )}

            {Object.values(
              statusDistribution
            ).every(
              (total) =>
                total === 0
            ) && (
              <div className="col-span-full py-8 text-center text-sm text-slate-500">
                Belum ada data pengajuan.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PENGAJUAN TERBARU */}

      <Card>
        <CardHeader>
          <CardTitle>
            Pengajuan Terbaru
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {recentPengajuan.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Belum ada pengajuan.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-3 text-left">
                    Nama Mustahik
                  </th>

                  <th className="px-3 py-3 text-left">
                    NIK
                  </th>

                  <th className="px-3 py-3 text-left">
                    Status
                  </th>

                  <th className="px-3 py-3 text-left">
                    Tanggal Pengajuan
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentPengajuan.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-4 font-medium">
                        {item.nama}
                      </td>

                      <td className="px-3 py-4 font-mono text-xs">
                        {item.nik}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(
                            item.status
                          )}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {formatDate(
                          item.tanggal
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* RINGKASAN */}

      <Card>
        <CardHeader>
          <CardTitle>
            Ringkasan Sistem
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <FileCheck2 className="h-6 w-6 text-blue-600" />

              <p className="mt-3 font-semibold">
                Verifikasi
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Pengajuan menunggu verifikasi:
                {' '}
                {menungguVerifikasi}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <Activity className="h-6 w-6 text-purple-600" />

              <p className="mt-3 font-semibold">
                Proses Seleksi
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Sedang diproses:
                {' '}
                {sedangDiproses}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />

              <p className="mt-3 font-semibold">
                Hasil Seleksi
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Mustahik layak didanai:
                {' '}
                {layakDidanai}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}