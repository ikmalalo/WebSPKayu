import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Download,
  Printer,
  Filter,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

import {
  Button,
} from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  DataTable,
} from '@/components/shared/DataTable'

import {
  getAdminTopsisResults,
  type AdminTopsisResult,
} from '@/lib/adminApi'

import type {
  Column,
} from '@/types'

export function LaporanPage() {
  const [
    results,
    setResults,
  ] = useState<
    AdminTopsisResult[]
  >([])

  const [
    year,
    setYear,
  ] = useState('all')

  const [
    status,
    setStatus,
  ] = useState('all')

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
          await getAdminTopsisResults()

        setResults(
          result.results
        )
      } catch (error: any) {
        console.error(
          'GET LAPORAN ERROR:',
          error
        )

        setError(
          error.response
            ?.data?.message ||
            'Gagal mengambil laporan TOPSIS'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    load()
  }, [])

  const years =
    useMemo(() => {
      const set =
        new Set<string>()

      results.forEach(
        (item) => {
          const date =
            new Date(
              item.tanggalProses
            )

          if (
            !Number.isNaN(
              date.getTime()
            )
          ) {
            set.add(
              String(
                date.getFullYear()
              )
            )
          }
        }
      )

      return Array.from(
        set
      ).sort(
        (
          a,
          b
        ) =>
          Number(b) -
          Number(a)
      )
    }, [results])

  const filtered =
    useMemo(() => {
      return results
        .filter(
          (item) => {
            if (
              year ===
              'all'
            ) {
              return true
            }

            return (
              new Date(
                item.tanggalProses
              ).getFullYear() ===
              Number(year)
            )
          }
        )
        .filter(
          (item) => {
            if (
              status ===
              'all'
            ) {
              return true
            }

            return (
              item.status ===
              status
            )
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            a.ranking -
            b.ranking
        )
    }, [
      results,
      year,
      status,
    ])

  const layak =
    filtered.filter(
      (item) =>
        item.status ===
        'LAYAK_DIDANAI'
    ).length

  const tidak =
    filtered.filter(
      (item) =>
        item.status ===
        'TIDAK_DIDANAI'
    ).length

  const formatDate =
    (
      value: string
    ) => {
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
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    }

  const exportCSV =
    () => {
      const header = [
        'Ranking',
        'Nama Mustahik',
        'NIK',
        'Nilai TOPSIS',
        'Keputusan',
        'Tanggal Proses',
      ]

      const rows =
        filtered.map(
          (item) => [
            item.ranking,
            item
              .pengajuan
              .mustahik
              .namaLengkap,
            item
              .pengajuan
              .mustahik
              .nik,
            Number(
              item.nilaiPreferensi
            ).toFixed(
              4
            ),
            item.status,
            formatDate(
              item.tanggalProses
            ),
          ]
        )

      const csv = [
        header,
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(',')
        )
        .join('\n')

      const blob =
        new Blob(
          [csv],
          {
            type:
              'text/csv;charset=utf-8;',
          }
        )

      const url =
        URL.createObjectURL(
          blob
        )

      const link =
        document.createElement(
          'a'
        )

      link.href =
        url

      link.download =
        `laporan-topsis-${year}.csv`

      document.body.appendChild(
        link
      )

      link.click()

      link.remove()

      URL.revokeObjectURL(
        url
      )
    }

  const columns:
    Column<AdminTopsisResult>[] =
    [
      {
        key:
          'ranking',

        header:
          'Rank',

        render: (
          row
        ) => (
          <span className="font-bold">
            #
            {
              row.ranking
            }
          </span>
        ),
      },

      {
        key:
          'namaLengkap',

        header:
          'Nama Mustahik',

        render: (
          row
        ) => (
          <span className="font-semibold">
            {
              row
                .pengajuan
                .mustahik
                .namaLengkap
            }
          </span>
        ),
      },

      {
        key:
          'nilaiPreferensi',

        header:
          'Nilai TOPSIS',

        render: (
          row
        ) => (
          <span className="font-mono font-bold text-green-700">
            {Number(
              row.nilaiPreferensi
            ).toFixed(
              4
            )}
          </span>
        ),
      },

      {
        key: 'status',

        header:
          'Keputusan',

        render: (
          row
        ) => (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              row.status ===
              'LAYAK_DIDANAI'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {row.status ===
            'LAYAK_DIDANAI'
              ? 'LAYAK DIDANAI'
              : 'TIDAK DIDANAI'}
          </span>
        ),
      },

      {
        key:
          'tanggalProses',

        header:
          'Tgl Keputusan',

        render: (
          row
        ) =>
          formatDate(
            row.tanggalProses
          ),
      },
    ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan & Rekapitulasi"
        description="Cetak dan ekspor laporan kelayakan mustahik berdasarkan hasil TOPSIS"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.print()
            }
          >
            <Printer className="w-4 h-4 mr-2" />

            Cetak PDF
          </Button>

          <Button
            size="sm"
            onClick={
              exportCSV
            }
            disabled={
              filtered.length ===
              0
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />

            Export Excel
          </Button>
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
          <span>
            {error}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={
              load
            }
          >
            <RefreshCw className="w-4 h-4 mr-1" />

            Coba Lagi
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="py-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-slate-400" />

            <span className="text-sm font-semibold">
              Filter Laporan:
            </span>
          </div>

          <Select
            value={year}
            onValueChange={
              setYear
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                Semua Tahun
              </SelectItem>

              {years.map(
                (item) => (
                  <SelectItem
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    Tahun{' '}
                    {
                      item
                    }
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={
              setStatus
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                Semua Status
              </SelectItem>

              <SelectItem value="LAYAK_DIDANAI">
                Layak Didanai
              </SelectItem>

              <SelectItem value="TIDAK_DIDANAI">
                Tidak Didanai
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-slate-500">
              Total Dievaluasi
            </p>

            <p className="text-2xl font-bold mt-1">
              {
                filtered.length
              }{' '}
              Mustahik
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="py-4 text-center">
            <p className="text-xs text-green-700 font-medium">
              Lolos & Layak Didanai
            </p>

            <p className="text-2xl font-bold text-green-700 mt-1">
              {layak}{' '}
              Mustahik
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="py-4 text-center">
            <p className="text-xs text-red-700 font-medium">
              Tidak Didanai
            </p>

            <p className="text-2xl font-bold text-red-700 mt-1">
              {tidak}{' '}
              Mustahik
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
          ) : (
            <DataTable
              columns={
                columns
              }
              data={
                filtered
              }
              emptyMessage="Belum ada hasil TOPSIS di database"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}