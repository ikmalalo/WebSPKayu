import { Users, ClipboardCheck, Clock, CheckCircle2, Leaf, TrendingUp, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/shared/StatsCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockStats, mockPengajuan, mockChartData, mockStatusDistribution } from '@/data/mockData'
import { formatDateShort } from '@/lib/utils'
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
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan sistem dan aktivitas terkini"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Mustahik"
          value={mockStats.totalMustahik}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          className="col-span-2 md:col-span-1"
        />
        <StatsCard
          title="Pengajuan Baru"
          value={mockStats.pengajuanBaru}
          icon={Leaf}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatsCard
          title="Menunggu Verifikasi"
          value={mockStats.menungguVerifikasi}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatsCard
          title="Sudah Diverifikasi"
          value={mockStats.sudahDiverifikasi}
          icon={ClipboardCheck}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatsCard
          title="Layak Didanai"
          value={mockStats.layakDidanai}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatsCard
          title="Tidak Didanai"
          value={mockStats.tidakDidanai}
          icon={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <CardTitle>Grafik Pengajuan per Bulan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockChartData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="pengajuan" fill="#16a34a" name="Pengajuan" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lolos" fill="#4ade80" name="Lolos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ditolak" fill="#fca5a5" name="Ditolak" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={mockStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {mockStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: '11px', color: '#64748b' }}>{value}</span>}
                />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent pengajuan */}
      <Card>
        <CardHeader>
          <CardTitle>Pengajuan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table w-full border-collapse">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NIK</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPengajuan.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.namaLengkap}</td>
                    <td className="font-mono text-xs">{p.nik}</td>
                    <td>{formatDateShort(p.tanggalPengajuan)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
