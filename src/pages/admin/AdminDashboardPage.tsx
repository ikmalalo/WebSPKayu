import {
  useEffect,
  useState,
} from 'react'

import {
  Users,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Leaf,
  TrendingUp,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  StatsCard,
} from '@/components/shared/StatsCard'

import {
  StatusBadge,
} from '@/components/shared/StatusBadge'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  Button,
} from '@/components/ui/button'

import {
  getAdminDashboard,
  type AdminDashboardData,
} from '@/lib/adminApi'

import {
  formatDateShort,
} from '@/lib/utils'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export function AdminDashboardPage() {
  const [
    data,
    setData,
  ] =
    useState<AdminDashboardData | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const load =
    async () => {
      try {
        setLoading(true)
        setError('')

        const result =
          await getAdminDashboard()

        setData(result)
      } catch (error: any) {
        console.error(
          'ADMIN DASHBOARD ERROR:',
          error
        )

        setError(
          error.response
            ?.data?.message ||
            'Gagal mengambil data dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-7 h-7 animate-spin text-green-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Admin"
          description="Ringkasan sistem dan aktivitas terkini"
        />

        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">
              {error ||
                'Data dashboard tidak tersedia.'}
            </p>

            <Button
              variant="outline"
              onClick={load}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Mustahik',
      value:
        data.totalMustahik,
      icon: Users,
      iconColor:
        'text-blue-600',
      iconBg:
        'bg-blue-50',
    },

    {
      title: 'Pengajuan Baru',
      value:
        data.pengajuanBaru,
      icon: Leaf,
      iconColor:
        'text-green-600',
      iconBg:
        'bg-green-50',
    },

    {
      title:
        'Menunggu Verifikasi',
      value:
        data.menungguVerifikasi,
      icon: Clock,
      iconColor:
        'text-amber-600',
      iconBg:
        'bg-amber-50',
    },

    {
      title:
        'Sudah Diverifikasi',
      value:
        data.sudahDiverifikasi,
      icon: ClipboardCheck,
      iconColor:
        'text-purple-600',
      iconBg:
        'bg-purple-50',
    },

    {
      title: 'Layak Didanai',
      value:
        data.layakDidanai,
      icon: CheckCircle2,
      iconColor:
        'text-green-600',
      iconBg:
        'bg-green-50',
    },

    {
      title: 'Tidak Didanai',
      value:
        data.tidakDidanai,
      icon: XCircle,
      iconColor:
        'text-red-500',
      iconBg:
        'bg-red-50',
    },
  ]

  const pieData =
    data.statusDistribution

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan sistem dan aktivitas terkini"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={load}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(
          (item) => (
            <StatsCard
              key={
                item.title
              }
              title={
                item.title
              }
              value={
                item.value
              }
              icon={
                item.icon
              }
              iconColor={
                item.iconColor
              }
              iconBg={
                item.iconBg
              }
              className="col-span-1"
            />
          )
        )}
      </div>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />

              <CardTitle>
                Grafik Pengajuan per Bulan
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={220}
            >
              <BarChart
                data={
                  data.chart
                }
                barSize={18}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="bulan"
                  tick={{
                    fontSize: 12,
                    fill: '#94a3b8',
                  }}
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                />

                <YAxis
                  allowDecimals={
                    false
                  }
                  tick={{
                    fontSize: 12,
                    fill: '#94a3b8',
                  }}
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                />

                <Tooltip />

                <Bar
                  dataKey="pengajuan"
                  fill="#16a34a"
                  name="Pengajuan"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />

                <Bar
                  dataKey="lolos"
                  fill="#4ade80"
                  name="Lolos"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />

                <Bar
                  dataKey="ditolak"
                  fill="#fca5a5"
                  name="Ditolak"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PIE */}

        <Card>
          <CardHeader>
            <CardTitle>
              Distribusi Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={220}
            >
              <PieChart>
                <Pie
                  data={
                    pieData
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={
                    55
                  }
                  outerRadius={
                    80
                  }
                  paddingAngle={
                    3
                  }
                  dataKey="value"
                >
                  {pieData.map(
                    (
                      _entry,
                      index
                    ) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            '#16a34a',
                            '#ef4444',
                            '#f59e0b',
                          ][
                            index %
                              3
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Legend />

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          PENGAJUAN TERBARU
      ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Pengajuan Terbaru
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table w-full border-collapse">
              <thead>
                <tr>
                  <th>
                    Nama
                  </th>

                  <th>
                    NIK
                  </th>

                  <th>
                    Tanggal
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {data
                  .pengajuanTerbaru
                  .map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td className="font-medium">
                          {
                            item
                              .mustahik
                              .namaLengkap
                          }
                        </td>

                        <td className="font-mono text-xs">
                          {
                            item
                              .mustahik
                              .nik
                          }
                        </td>

                        <td>
                          {formatDateShort(
                            item
                              .tanggalPengajuan
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              item.status as any
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}

                {data
                  .pengajuanTerbaru
                  .length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={
                        4
                      }
                      className="text-center py-8 text-slate-500"
                    >
                      Belum ada
                      pengajuan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}