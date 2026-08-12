import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { mockPengajuan } from '@/data/mockData'
import { formatDateShort } from '@/lib/utils'
import type { Column, Pengajuan, StatusPengajuan } from '@/types'

export function DataMustahikPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = mockPengajuan.filter((p) => {
    const matchSearch = p.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      p.nik.includes(search)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const columns: Column<Pengajuan>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.id.toUpperCase()}</span>,
    },
    {
      key: 'namaLengkap',
      header: 'Nama Lengkap',
      render: (row) => <span className="font-medium text-slate-800">{row.namaLengkap}</span>,
    },
    {
      key: 'nik',
      header: 'NIK',
      render: (row) => <span className="font-mono text-xs">{row.nik}</span>,
    },
    {
      key: 'tanggalPengajuan',
      header: 'Tanggal',
      render: (row) => formatDateShort(row.tanggalPengajuan),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/admin/mustahik/${row.mustahikId}`)
          }}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Eye className="w-4 h-4 mr-1" />
          Detail
        </Button>
      ),
    },
  ]

  const statuses: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'Semua Status' },
    { value: 'MENUNGGU_VERIFIKASI', label: 'Menunggu Verifikasi' },
    { value: 'SEDANG_DIVERIFIKASI', label: 'Sedang Diverifikasi' },
    { value: 'LOLOS_VERIFIKASI', label: 'Lolos Verifikasi' },
    { value: 'PERLU_PERBAIKAN', label: 'Perlu Perbaikan' },
    { value: 'DITOLAK', label: 'Ditolak' },
    { value: 'LAYAK_DIDANAI', label: 'Layak Didanai' },
    { value: 'TIDAK_DIDANAI', label: 'Tidak Didanai' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Mustahik"
        description={`${filtered.length} dari ${mockPengajuan.length} pengajuan`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari nama atau NIK..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="Tidak ada data yang sesuai pencarian"
        onRowClick={(row) => navigate(`/admin/mustahik/${row.mustahikId}`)}
      />
    </div>
  )
}
