import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { mockPengajuan } from '@/data/mockData'
import { formatDateShort } from '@/lib/utils'
import type { Column, Pengajuan } from '@/types'

export function VerifikasiPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'menunggu' | 'selesai'>('all')

  const filtered = mockPengajuan.filter((p) => {
    if (filter === 'menunggu') return ['MENUNGGU_VERIFIKASI', 'SEDANG_DIVERIFIKASI'].includes(p.status)
    if (filter === 'selesai') return ['LOLOS_VERIFIKASI', 'PERLU_PERBAIKAN', 'DITOLAK'].includes(p.status)
    return true
  })

  const columns: Column<Pengajuan>[] = [
    {
      key: 'id',
      header: 'ID Pengajuan',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.id.toUpperCase()}</span>,
    },
    {
      key: 'namaLengkap',
      header: 'Nama Mustahik',
      render: (row) => <span className="font-medium text-slate-800">{row.namaLengkap}</span>,
    },
    {
      key: 'nik',
      header: 'NIK',
      render: (row) => <span className="font-mono text-xs">{row.nik}</span>,
    },
    {
      key: 'tanggalPengajuan',
      header: 'Tgl Pengajuan',
      render: (row) => formatDateShort(row.tanggalPengajuan),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Proses',
      render: (row) => (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/admin/verifikasi/${row.id}`)
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <ShieldCheck className="w-4 h-4 mr-1" />
          Verifikasi
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Pengajuan"
        description="Kelola & validasi berkas/data pengajuan calon mustahik"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'Semua Status' },
          { id: 'menunggu', label: 'Perlu Verifikasi' },
          { id: 'selesai', label: 'Sudah Diverifikasi' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === t.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="Tidak ada pengajuan untuk verifikasi"
        onRowClick={(row) => navigate(`/admin/verifikasi/${row.id}`)}
      />
    </div>
  )
}
