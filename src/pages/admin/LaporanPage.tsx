import { useState } from 'react'
import { FileSpreadsheet, Download, Printer, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { mockTopsisResults } from '@/data/mockData'
import { formatDateShort } from '@/lib/utils'
import type { Column, TopsisResult } from '@/types'

export function LaporanPage() {
  const [periode, setPeriode] = useState('2024')
  const [status, setStatus] = useState('all')

  const filtered = mockTopsisResults.filter((r) => {
    if (status === 'layak') return r.status === 'LAYAK_DIDANAI'
    if (status === 'tidak_layak') return r.status === 'TIDAK_DIDANAI'
    return true
  })

  const columns: Column<TopsisResult>[] = [
    { key: 'ranking', header: 'Rank', render: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">#{row.ranking}</span> },
    { key: 'namaLengkap', header: 'Nama Mustahik', render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-100">{row.namaLengkap}</span> },
    { key: 'nilaiPreferensi', header: 'Nilai TOPSIS', render: (row) => <span className="font-mono font-bold text-green-700 dark:text-green-400">{row.nilaiPreferensi.toFixed(4)}</span> },
    {
      key: 'status',
      header: 'Keputusan',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.status === 'LAYAK_DIDANAI' ? 'bg-green-100 dark:bg-slate-900 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-500/50' : 'bg-red-50 dark:bg-slate-900 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/50'}`}>
          {row.status.replace('_', ' ')}
        </span>
      ),
    },
    { key: 'tanggalProses', header: 'Tgl Keputusan', render: (row) => <span className="text-slate-700 dark:text-slate-300">{formatDateShort(row.tanggalProses)}</span> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan & Rekapitulasi" description="Cetak dan ekspor laporan kelayakan mustahik">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800">
            <Printer className="w-4 h-4 mr-2" />
            Cetak PDF
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </PageHeader>

      {/* Filter Section */}
      <Card>
        <CardContent className="py-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter Laporan:</span>
          </div>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
              <SelectItem value="2024">Tahun 2024</SelectItem>
              <SelectItem value="2023">Tahun 2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="layak">Layak Didanai</SelectItem>
              <SelectItem value="tidak_layak">Tidak Didanai</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Dievaluasi</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{mockTopsisResults.length} Mustahik</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20">
          <CardContent className="py-4 text-center">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">Lolos & Layak Didanai</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
              {mockTopsisResults.filter((r) => r.status === 'LAYAK_DIDANAI').length} Mustahik
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20">
          <CardContent className="py-4 text-center">
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">Tidak Didanai</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">
              {mockTopsisResults.filter((r) => r.status === 'TIDAK_DIDANAI').length} Mustahik
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  )
}
