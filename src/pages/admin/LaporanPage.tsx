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
  // ============================================================
  // STATE
  // ============================================================

  const [
    results,
    setResults,
  ] = useState<AdminTopsisResult[]>([])

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

  // ============================================================
  // LOAD DATA
  // ============================================================

  const load = async () => {
    try {
      setLoading(true)
      setError('')

      const result =
        await getAdminTopsisResults()

      /*
       * getAdminTopsisResults() sekarang mengembalikan
       * AdminTopsisResult[] secara langsung.
       *
       * Jadi TIDAK menggunakan:
       *
       * result.results
       *
       * melainkan langsung:
       *
       * result
       */

      setResults(
        Array.isArray(result)
          ? result
          : []
      )
    } catch (error: unknown) {
      console.error(
        'GET LAPORAN ERROR:',
        error
      )

      let message =
        'Gagal mengambil laporan TOPSIS'

      if (
        error instanceof Error &&
        error.message
      ) {
        message =
          error.message
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void load()
  }, [])

  // ============================================================
  // YEARS
  // ============================================================

  const years = useMemo(() => {
    const yearSet =
      new Set<string>()

    results.forEach(
      (item) => {
        if (
          !item.tanggalProses
        ) {
          return
        }

        const date =
          new Date(
            item.tanggalProses
          )

        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {
          yearSet.add(
            String(
              date.getFullYear()
            )
          )
        }
      }
    )

    return Array.from(
      yearSet
    ).sort(
      (
        a,
        b
      ) =>
        Number(b) -
        Number(a)
    )
  }, [results])

  // ============================================================
  // FILTER
  // ============================================================

  const filtered = useMemo(() => {
    return results
      .filter(
        (item) => {
          if (
            year === 'all'
          ) {
            return true
          }

          if (
            !item.tanggalProses
          ) {
            return false
          }

          const date =
            new Date(
              item.tanggalProses
            )

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return false
          }

          return (
            date.getFullYear() ===
            Number(year)
          )
        }
      )
      .filter(
        (item) => {
          if (
            status === 'all'
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
          Number(a.ranking) -
          Number(b.ranking)
      )
  }, [
    results,
    year,
    status,
  ])

  // ============================================================
  // STATISTICS
  // ============================================================

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

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    value?: string | null
  ) => {
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
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  // ============================================================
  // GET MUSTAHIK NAME
  // ============================================================

  const getNamaMustahik = (
    item: AdminTopsisResult
  ) => {
    return (
      item.pengajuan
        ?.mustahik
        ?.namaLengkap ||
      '-'
    )
  }

  // ============================================================
  // GET NIK
  // ============================================================

  const getNik = (
    item: AdminTopsisResult
  ) => {
    return (
      item.pengajuan
        ?.mustahik
        ?.nik ||
      '-'
    )
  }

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCSV = () => {
    if (
      filtered.length === 0
    ) {
      return
    }

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

          getNamaMustahik(
            item
          ),

          getNik(
            item
          ),

          Number(
            item.nilaiPreferensi
          ).toFixed(4),

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
      `laporan-topsis-${
        year === 'all'
          ? 'semua-tahun'
          : year
      }.csv`

    document.body.appendChild(
      link
    )

    link.click()

    link.remove()

    URL.revokeObjectURL(
      url
    )
  }

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

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
              getNamaMustahik(
                row
              )
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
            ).toFixed(4)}
          </span>
        ),
      },

      {
        key:
          'status',

        header:
          'Keputusan',

        render: (
          row
        ) => (
          <span
            className={
              `px-2.5 py-1 rounded-full text-xs font-semibold ${
                row.status ===
                'LAYAK_DIDANAI'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`
            }
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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

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
              loading ||
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

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center gap-4">
          <span>
            {error}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void load()
            }
          >
            <RefreshCw className="w-4 h-4 mr-1" />

            Coba Lagi
          </Button>
        </div>
      )}

      {/* ======================================================
          FILTER
      ====================================================== */}

      <Card>
        <CardContent className="py-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-slate-400" />

            <span className="text-sm font-semibold">
              Filter Laporan:
            </span>
          </div>

          {/* YEAR */}

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

          {/* STATUS */}

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

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TOTAL */}

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

        {/* LAYAK */}

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

        {/* TIDAK */}

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

      {/* ======================================================
          TABLE
      ====================================================== */}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center items-center">
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