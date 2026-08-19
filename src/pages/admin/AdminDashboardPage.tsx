import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Users,
  FileText,
  Clock3,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import {
  getAdminDashboard,
  getAdminMustahik,
  type AdminDashboardData,
  type AdminMustahik,
  type AdminPengajuan,
} from '@/lib/adminApi'

// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

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
      month: 'short',
      year: 'numeric',
    }
  )
}

function getStatusLabel(
  status?: string | null
): string {
  switch (
    status
  ) {
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
      return status || '-'
  }
}

function getStatusClass(
  status?: string | null
): string {
  switch (
    status
  ) {
    case 'LAYAK_DIDANAI':
    case 'LOLOS_VERIFIKASI':
      return 'bg-green-50 text-green-700 border-green-200'

    case 'TIDAK_DIDANAI':
    case 'DITOLAK':
      return 'bg-red-50 text-red-700 border-red-200'

    case 'DIPROSES_TOPSIS':
      return 'bg-purple-50 text-purple-700 border-purple-200'

    case 'PERLU_PERBAIKAN':
      return 'bg-orange-50 text-orange-700 border-orange-200'

    case 'MENUNGGU_VERIFIKASI':
    case 'SEDANG_DIVERIFIKASI':
    case 'DRAFT':
      return 'bg-amber-50 text-amber-700 border-amber-200'

    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

function getInitials(
  name?: string | null
): string {
  if (!name) {
    return '?'
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0).toUpperCase()
    )
    .join('')
}

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  iconClass: string
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================

export default function AdminDashboardPage() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [
    dashboard,
    setDashboard,
  ] =
    useState<AdminDashboardData | null>(
      null
    )

  const [
    mustahik,
    setMustahik,
  ] =
    useState<AdminMustahik[]>([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState('')

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const [
            dashboardData,
            mustahikData,
          ] =
            await Promise.all([
              getAdminDashboard(),
              getAdminMustahik(),
            ])

          setDashboard(
            dashboardData
          )

          setMustahik(
            Array.isArray(
              mustahikData
            )
              ? mustahikData
              : []
          )
        } catch (
          error
        ) {
          console.error(
            'GET ADMIN DASHBOARD ERROR:',
            error
          )

          setError(
            error instanceof Error
              ? error.message
              : 'Gagal mengambil data dashboard admin.'
          )
        } finally {
          setLoading(false)
        }
      },
      []
    )

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadData()
  }, [loadData])

  // ==========================================================
  // PENGAJUAN TERBARU
  // ==========================================================
  //
  // Tidak lagi menggunakan:
  //
  // dashboard.pengajuanTerbaru
  //
  // karena property tersebut memang tidak ada di
  // AdminDashboardData.
  //
  // Data diambil dari database melalui getAdminMustahik()
  // lalu pengajuan dari masing-masing mustahik dikumpulkan.
  //
  // ==========================================================

  const pengajuanTerbaru =
    useMemo(() => {
      const items: Array<{
        pengajuan: AdminPengajuan
        mustahik: AdminMustahik
      }> = []

      for (
        const item of mustahik
      ) {
        if (
          !Array.isArray(
            item.pengajuan
          )
        ) {
          continue
        }

        for (
          const pengajuan of
            item.pengajuan
        ) {
          items.push({
            pengajuan,
            mustahik:
              item,
          })
        }
      }

      return items
        .sort(
          (
            a,
            b
          ) => {
            const dateA =
              new Date(
                a.pengajuan.tanggalPengajuan ||
                  a.pengajuan.createdAt ||
                  0
              ).getTime()

            const dateB =
              new Date(
                b.pengajuan.tanggalPengajuan ||
                  b.pengajuan.createdAt ||
                  0
              ).getTime()

            return (
              dateB -
              dateA
            )
          }
        )
        .slice(0, 6)
    }, [mustahik])

  // ==========================================================
  // CHART DATA
  // ==========================================================

  const chartData =
    dashboard?.chart ?? []

  // ==========================================================
  // PIE DATA
  // ==========================================================

  const statusDistribution =
    dashboard?.statusDistribution ??
    []

  const pieColors = [
    '#16a34a',
    '#ef4444',
    '#f59e0b',
  ]

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin text-green-600" />

              <span>
                Memuat dashboard admin...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div className="flex-1">
                <h2 className="font-semibold text-red-800">
                  Gagal memuat dashboard
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    void loadData()
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
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

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard Admin
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ringkasan sistem dan aktivitas terkini
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadData()
            }}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">

          <StatCard
            title="Total Mustahik"
            value={
              dashboard
                ?.totalMustahik ??
              0
            }
            icon={
              <Users className="h-6 w-6 text-blue-600" />
            }
            iconClass="bg-blue-50"
          />

          <StatCard
            title="Pengajuan Baru"
            value={
              dashboard
                ?.pengajuanBaru ??
              0
            }
            icon={
              <FileText className="h-6 w-6 text-green-600" />
            }
            iconClass="bg-green-50"
          />

          <StatCard
            title="Menunggu Verifikasi"
            value={
              dashboard
                ?.menungguVerifikasi ??
              0
            }
            icon={
              <Clock3 className="h-6 w-6 text-amber-600" />
            }
            iconClass="bg-amber-50"
          />

          <StatCard
            title="Sudah Diverifikasi"
            value={
              dashboard
                ?.sudahDiverifikasi ??
              0
            }
            icon={
              <ClipboardCheck className="h-6 w-6 text-purple-600" />
            }
            iconClass="bg-purple-50"
          />

          <StatCard
            title="Layak Didanai"
            value={
              dashboard
                ?.layakDidanai ??
              0
            }
            icon={
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            }
            iconClass="bg-green-50"
          />

          <StatCard
            title="Tidak Didanai"
            value={
              dashboard
                ?.tidakDidanai ??
              0
            }
            icon={
              <XCircle className="h-6 w-6 text-red-600" />
            }
            iconClass="bg-red-50"
          />

        </div>

        {/* ====================================================
            CHART SECTION
        ==================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">

          {/* BAR CHART */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />

              <div>
                <h2 className="font-semibold text-slate-900">
                  Grafik Pengajuan per Bulan
                </h2>

                <p className="text-xs text-slate-500">
                  Aktivitas pengajuan berdasarkan bulan
                </p>
              </div>
            </div>

            <div className="h-[320px] w-full">
              {chartData.length ===
              0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Belum ada data grafik.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      chartData
                    }
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="bulan"
                      tick={{
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                      tick={{
                        fontSize: 12,
                      }}
                    />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="pengajuan"
                      name="Pengajuan"
                      fill="#16a34a"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="lolos"
                      name="Lolos"
                      fill="#4ade80"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="ditolak"
                      name="Ditolak"
                      fill="#fca5a5"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* PIE CHART */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-2">
              <h2 className="font-semibold text-slate-900">
                Distribusi Status
              </h2>

              <p className="text-xs text-slate-500">
                Distribusi hasil pengajuan
              </p>
            </div>

            <div className="h-[320px] w-full">
              {statusDistribution.length ===
              0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Belum ada data status.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        statusDistribution
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={2}
                    >
                      {statusDistribution.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={
                              pieColors[
                                index %
                                  pieColors.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            PENGAJUAN TERBARU
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Pengajuan Terbaru
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Pengajuan terbaru dari database
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                {pengajuanTerbaru.length}{' '}
                data
              </span>
            </div>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nama
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    NIK
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tanggal
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {pengajuanTerbaru.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-slate-400"
                    >
                      Belum ada pengajuan.
                    </td>
                  </tr>
                ) : (
                  pengajuanTerbaru.map(
                    ({
                      pengajuan,
                      mustahik,
                    }) => (
                      <tr
                        key={
                          pengajuan.id
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                              {getInitials(
                                mustahik.namaLengkap
                              )}
                            </div>

                            <div>
                              <p className="font-medium text-slate-900">
                                {
                                  mustahik.namaLengkap
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                Pengajuan #
                                {String(
                                  pengajuan.id
                                ).slice(
                                  0,
                                  8
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            mustahik.nik
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            pengajuan.tanggalPengajuan ||
                              pengajuan.createdAt
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                              pengajuan.status
                            )}`}
                          >
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

                            {getStatusLabel(
                              pengajuan.status
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}

          <div className="divide-y divide-slate-100 md:hidden">
            {pengajuanTerbaru.length ===
            0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                Belum ada pengajuan.
              </div>
            ) : (
              pengajuanTerbaru.map(
                ({
                  pengajuan,
                  mustahik,
                }) => (
                  <div
                    key={
                      pengajuan.id
                    }
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                        {getInitials(
                          mustahik.namaLengkap
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {
                                mustahik.namaLengkap
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              NIK:{' '}
                              {
                                mustahik.nik
                              }
                            </p>
                          </div>

                          <span
                            className={`w-fit inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                              pengajuan.status
                            )}`}
                          >
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

                            {getStatusLabel(
                              pengajuan.status
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(
                            pengajuan.tanggalPengajuan ||
                              pengajuan.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

      </div>
    </div>
  )
}