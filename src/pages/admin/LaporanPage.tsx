import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Download,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
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
  getAdminTopsisResults,
  type AdminTopsisResult,
} from '@/lib/adminApi'

// ============================================================
// HELPER
// ============================================================

function toNumber(
  value: number | string | null | undefined
): number {
  const numberValue =
    Number(value ?? 0)

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : 0
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

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  ).format(date)
}

function getMustahikName(
  result: AdminTopsisResult
): string {
  return (
    result.pengajuan
      ?.mustahik
      ?.namaLengkap ||
    result.mustahik
      ?.namaLengkap ||
    result.pengajuan
      ?.user
      ?.name ||
    '-'
  )
}

function getNIK(
  result: AdminTopsisResult
): string {
  return (
    result.pengajuan
      ?.mustahik
      ?.nik ||
    result.mustahik
      ?.nik ||
    '-'
  )
}

function getStatusLabel(
  status: string
): string {
  switch (status) {
    case 'LAYAK_DIDANAI':
      return 'Layak Didanai'

    case 'TIDAK_DIDANAI':
      return 'Tidak Didanai'

    case 'DIPROSES_TOPSIS':
      return 'Diproses TOPSIS'

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
    case 'LAYAK_DIDANAI':
      return 'bg-green-100 text-green-700 border-green-200'

    case 'TIDAK_DIDANAI':
      return 'bg-red-100 text-red-700 border-red-200'

    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

// ============================================================
// COMPONENT
// ============================================================

export function LaporanPage() {
  const [
    results,
    setResults,
  ] = useState<
    AdminTopsisResult[]
  >([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    selectedYear,
    setSelectedYear,
  ] = useState<string>('ALL')

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<string>('ALL')

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData =
    async () => {
      try {
        setLoading(true)

        setError('')

        const data =
          await getAdminTopsisResults()

        // ------------------------------------------------------
        // Ambil hanya hasil TOPSIS terbaru
        // untuk setiap pengajuan
        // ------------------------------------------------------

        const latestByPengajuan =
          new Map<
            string,
            AdminTopsisResult
          >()

        for (
          const result of data
        ) {
          const existing =
            latestByPengajuan.get(
              result.pengajuanId
            )

          if (!existing) {
            latestByPengajuan.set(
              result.pengajuanId,
              result
            )

            continue
          }

          const currentTime =
            new Date(
              result.tanggalProses
            ).getTime()

          const existingTime =
            new Date(
              existing.tanggalProses
            ).getTime()

          if (
            currentTime >
            existingTime
          ) {
            latestByPengajuan.set(
              result.pengajuanId,
              result
            )
          }
        }

        const latestResults =
          Array.from(
            latestByPengajuan.values()
          ).sort(
            (
              a,
              b
            ) =>
              a.ranking -
              b.ranking
          )

        setResults(
          latestResults
        )
      } catch (
        err: unknown
      ) {
        console.error(
          'GET LAPORAN ERROR:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil data laporan.'
        )
      } finally {
        setLoading(false)
      }
    }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {
      void loadData()
    },
    []
  )

  // ==========================================================
  // AVAILABLE YEARS
  // ==========================================================

  const availableYears =
    useMemo(() => {
      const years =
        new Set<string>()

      results.forEach(
        (
          result
        ) => {
          if (
            result.tanggalProses
          ) {
            const year =
              new Date(
                result.tanggalProses
              )
                .getFullYear()
                .toString()

            if (
              year !== 'NaN'
            ) {
              years.add(year)
            }
          }
        }
      )

      return Array.from(
        years
      ).sort(
        (
          a,
          b
        ) =>
          Number(b) -
          Number(a)
      )
    }, [
      results,
    ])

  // ==========================================================
  // FILTERED RESULTS
  // ==========================================================

  const filteredResults =
    useMemo(() => {
      return results.filter(
        (
          result
        ) => {
          const resultYear =
            result.tanggalProses
              ? new Date(
                  result.tanggalProses
                )
                  .getFullYear()
                  .toString()
              : ''

          const yearMatch =
            selectedYear ===
              'ALL' ||
            resultYear ===
              selectedYear

          const statusMatch =
            selectedStatus ===
              'ALL' ||
            result.status ===
              selectedStatus

          return (
            yearMatch &&
            statusMatch
          )
        }
      )
    }, [
      results,
      selectedYear,
      selectedStatus,
    ])

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics =
    useMemo(() => {
      const total =
        filteredResults.length

      const layak =
        filteredResults.filter(
          (
            result
          ) =>
            result.status ===
            'LAYAK_DIDANAI'
        ).length

      const tidakLayak =
        filteredResults.filter(
          (
            result
          ) =>
            result.status ===
            'TIDAK_DIDANAI'
        ).length

      const averagePreference =
        total === 0
          ? 0
          : filteredResults.reduce(
              (
                totalValue,
                result
              ) =>
                totalValue +
                toNumber(
                  result.nilaiPreferensi
                ),
              0
            ) / total

      return {
        total,
        layak,
        tidakLayak,
        averagePreference,
      }
    }, [
      filteredResults,
    ])

  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  const handleExportCSV =
    () => {
      if (
        filteredResults.length ===
        0
      ) {
        return
      }

      const headers = [
        'Ranking',
        'Nama Mustahik',
        'NIK',
        'Nilai Preferensi',
        'Status',
        'Tanggal Proses',
      ]

      const rows =
        filteredResults.map(
          (
            result
          ) => [
            result.ranking,
            getMustahikName(
              result
            ),
            getNIK(
              result
            ),
            toNumber(
              result.nilaiPreferensi
            ).toFixed(6),
            getStatusLabel(
              result.status
            ),
            formatDate(
              result.tanggalProses
            ),
          ]
        )

      const csvContent =
        [
          headers,
          ...rows,
        ]
          .map(
            (
              row
            ) =>
              row
                .map(
                  (
                    value
                  ) =>
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
          [
            '\uFEFF' +
              csvContent,
          ],
          {
            type: 'text/csv;charset=utf-8;',
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
          selectedYear ===
          'ALL'
            ? 'semua-tahun'
            : selectedYear
        }.csv`

      document.body.appendChild(
        link
      )

      link.click()

      document.body.removeChild(
        link
      )

      URL.revokeObjectURL(
        url
      )
    }

  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint =
    () => {
      window.print()
    }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-green-600" />
      </div>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Laporan Hasil Seleksi"
          description="Laporan hasil perangkingan mustahik menggunakan metode TOPSIS."
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                void loadData()
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />

              Muat Ulang
            </Button>

            <Button
              variant="outline"
              onClick={
                handlePrint
              }
              disabled={
                filteredResults.length ===
                0
              }
            >
              <Printer className="w-4 h-4 mr-2" />

              Cetak
            </Button>

            <Button
              onClick={
                handleExportCSV
              }
              disabled={
                filteredResults.length ===
                0
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />

              Export CSV
            </Button>
          </div>
        </PageHeader>
      </div>

      {/* ======================================================
          PRINT HEADER
      ====================================================== */}

      <div className="hidden print:block">
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-xl font-bold">
            LAPORAN HASIL SELEKSI
          </h1>

          <p className="text-sm mt-1">
            Sistem Pendukung Keputusan
            Penerima Bantuan
          </p>

          <p className="text-sm">
            Metode TOPSIS
          </p>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="print:hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          FILTER
      ====================================================== */}

      <Card className="print:hidden">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Tahun
              </label>

              <select
                value={
                  selectedYear
                }
                onChange={(
                  event
                ) =>
                  setSelectedYear(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="ALL">
                  Semua Tahun
                </option>

                {availableYears.map(
                  (
                    year
                  ) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Status
              </label>

              <select
                value={
                  selectedStatus
                }
                onChange={(
                  event
                ) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="ALL">
                  Semua Status
                </option>

                <option value="LAYAK_DIDANAI">
                  Layak Didanai
                </option>

                <option value="TIDAK_DIDANAI">
                  Tidak Didanai
                </option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">
              Total Data
            </p>

            <p className="text-3xl font-bold mt-2">
              {
                statistics.total
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">
              Layak Didanai
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {
                statistics.layak
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">
              Tidak Didanai
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {
                statistics.tidakLayak
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">
              Rata-rata Preferensi
            </p>

            <p className="text-3xl font-bold mt-2">
              {statistics.averagePreference.toFixed(
                4
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <Card className="print:border-none print:shadow-none">
        <CardHeader className="print:px-0">
          <CardTitle>
            Hasil Perangkingan Mustahik
          </CardTitle>

          <p className="text-sm text-slate-500">
            Data berdasarkan hasil
            perhitungan metode TOPSIS.
          </p>
        </CardHeader>

        <CardContent className="overflow-x-auto print:px-0">
          {filteredResults.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center print:hidden">
              <FileText className="w-10 h-10 text-slate-400" />

              <h3 className="mt-4 font-semibold">
                Tidak Ada Data
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Belum ada hasil yang sesuai
                dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 print:bg-transparent">
                  <th className="border px-3 py-3 text-center">
                    Ranking
                  </th>

                  <th className="border px-3 py-3 text-left">
                    Nama Mustahik
                  </th>

                  <th className="border px-3 py-3 text-left">
                    NIK
                  </th>

                  <th className="border px-3 py-3 text-center">
                    Nilai Preferensi
                  </th>

                  <th className="border px-3 py-3 text-center">
                    Status
                  </th>

                  <th className="border px-3 py-3 text-left">
                    Tanggal Proses
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map(
                  (
                    result
                  ) => (
                    <tr
                      key={
                        result.id
                      }
                      className="border-b"
                    >
                      <td className="border px-3 py-3 text-center font-bold">
                        #
                        {
                          result.ranking
                        }
                      </td>

                      <td className="border px-3 py-3 font-medium">
                        {getMustahikName(
                          result
                        )}
                      </td>

                      <td className="border px-3 py-3 font-mono text-xs">
                        {getNIK(
                          result
                        )}
                      </td>

                      <td className="border px-3 py-3 text-center font-mono font-bold">
                        {toNumber(
                          result.nilaiPreferensi
                        ).toFixed(
                          6
                        )}
                      </td>

                      <td className="border px-3 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium print:border-none print:bg-transparent ${getStatusClass(
                            result.status
                          )}`}
                        >
                          {getStatusLabel(
                            result.status
                          )}
                        </span>
                      </td>

                      <td className="border px-3 py-3">
                        {formatDate(
                          result.tanggalProses
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

      {/* ======================================================
          PRINT FOOTER
      ====================================================== */}

      <div className="hidden print:block mt-10">
        <div className="flex justify-between text-sm">
          <div>
            <p>
              Total Mustahik:
              {' '}
              {
                statistics.total
              }
            </p>

            <p>
              Layak Didanai:
              {' '}
              {
                statistics.layak
              }
            </p>

            <p>
              Tidak Didanai:
              {' '}
              {
                statistics.tidakLayak
              }
            </p>
          </div>

          <div className="text-center">
            <p>
              Samarinda,
              {' '}
              {formatDate(
                new Date()
              )}
            </p>

            <div className="h-20" />

            <p>
              Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}