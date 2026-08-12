import { Trophy, Download, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { mockTopsisResults } from '@/data/mockData'
import { formatDateShort } from '@/lib/utils'
import type { Column, TopsisResult } from '@/types'

export function HasilRankingPage() {
  const columns: Column<TopsisResult>[] = [
    {
      key: 'ranking',
      header: 'Ranking',
      render: (row) => (
        <div className="flex items-center gap-1.5 font-bold">
          {row.ranking === 1 && <Trophy className="w-4 h-4 text-amber-500" />}
          {row.ranking === 2 && <Trophy className="w-4 h-4 text-slate-400" />}
          {row.ranking === 3 && <Trophy className="w-4 h-4 text-amber-700" />}
          <span className={row.ranking <= 3 ? 'text-green-700 font-extrabold text-base' : 'text-slate-700'}>
            #{row.ranking}
          </span>
        </div>
      ),
    },
    {
      key: 'namaLengkap',
      header: 'Nama Mustahik',
      render: (row) => <span className="font-semibold text-slate-900">{row.namaLengkap}</span>,
    },
    {
      key: 'nilaiPreferensi',
      header: 'Nilai Preferensi (Ci)',
      render: (row) => (
        <span className="font-mono font-bold text-green-700 text-sm">
          {row.nilaiPreferensi.toFixed(4)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Keputusan',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            row.status === 'LAYAK_DIDANAI'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {row.status === 'LAYAK_DIDANAI' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Layak Didanai
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-red-500" /> Tidak Didanai
            </>
          )}
        </span>
      ),
    },
    {
      key: 'tanggalProses',
      header: 'Tanggal Proses',
      render: (row) => formatDateShort(row.tanggalProses),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hasil Ranking TOPSIS"
        description="Hasil perhitungan akhir dan penentuan kelayakan penerima zakat"
      >
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Hasil (Excel/PDF)
        </Button>
      </PageHeader>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mockTopsisResults.slice(0, 3).map((item, idx) => (
          <Card
            key={item.id}
            className={`border-2 ${
              idx === 0 ? 'border-amber-400 bg-amber-50/30' : idx === 1 ? 'border-slate-300' : 'border-amber-700/30'
            }`}
          >
            <CardContent className="pt-5 text-center">
              <div
                className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-white mb-2 ${
                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                }`}
              >
                #{item.ranking}
              </div>
              <h3 className="font-bold text-slate-900">{item.namaLengkap}</h3>
              <p className="text-xs text-slate-500 mt-1">Nilai Ci: <span className="font-mono font-bold text-green-700">{item.nilaiPreferensi}</span></p>
              <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                LAYAK DIDANAI
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable columns={columns} data={mockTopsisResults} />
    </div>
  )
}
