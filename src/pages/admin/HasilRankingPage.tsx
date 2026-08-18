import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Trophy,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

import {
  Button,
} from '@/components/ui/button'

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

import {
  formatDateShort,
} from '@/lib/utils'

export function HasilRankingPage() {
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

  useEffect(() => {
    const load =
      async () => {
        try {
          const data =
            await getAdminTopsisResults()

          /*
           * Ambil proses TOPSIS terbaru.
           */
          if (
            data.length
          ) {
            const latestDate =
              data.reduce(
                (
                  latest,
                  item
                ) =>
                  new Date(
                    item.tanggalProses
                  ) >
                  new Date(
                    latest
                  )
                    ? item.tanggalProses
                    : latest,
                data[0]
                  .tanggalProses
              )

            setResults(
              data
                .filter(
                  (item) =>
                    new Date(
                      item.tanggalProses
                    ).getTime() ===
                    new Date(
                      latestDate
                    ).getTime()
                )
                .sort(
                  (
                    a,
                    b
                  ) =>
                    a.ranking -
                    b.ranking
                )
            )
          } else {
            setResults([])
          }
        } catch (err: any) {
          setError(
            err.response
              ?.data?.message ||
            'Gagal mengambil hasil TOPSIS.'
          )
        } finally {
          setLoading(false)
        }
      }

    load()
  }, [])

  const podium =
    results.slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hasil Ranking TOPSIS"
        description="Hasil perhitungan TOPSIS yang tersimpan di database"
      >
        <Button
          variant="outline"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Hasil
        </Button>
      </PageHeader>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : (
        <>
          {results.length ===
          0 ? (
            <Card>
              <CardContent className="py-16 text-center text-slate-500">
                Belum ada hasil TOPSIS.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {podium.map(
                  (
                    item,
                    index
                  ) => (
                    <Card
                      key={
                        item.id
                      }
                    >
                      <CardContent className="pt-5 text-center">
                        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-green-600 text-white font-bold mb-2">
                          #
                          {
                            item.ranking
                          }
                        </div>

                        <h3 className="font-bold">
                          {
                            item
                              .pengajuan
                              ?.mustahik
                              ?.namaLengkap
                          }
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          Nilai Ci:{' '}
                          <span className="font-mono font-bold text-green-700">
                            {Number(
                              item.nilaiPreferensi
                            ).toFixed(
                              4
                            )}
                          </span>
                        </p>

                        <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status ===
                          'LAYAK_DIDANAI'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.status ===
                          'LAYAK_DIDANAI'
                            ? 'LAYAK DIDANAI'
                            : 'TIDAK DIDANAI'}
                        </span>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>

              <DataTable
                columns={[
                  {
                    key: 'ranking',
                    header: 'Ranking',
                    render: (
                      row
                    ) => (
                      <div className="flex items-center gap-2 font-bold">
                        {row.ranking <=
                          3 && (
                          <Trophy className="w-4 h-4 text-amber-500" />
                        )}

                        #
                        {
                          row.ranking
                        }
                      </div>
                    ),
                  },

                  {
                    key: 'nama',
                    header: 'Nama Mustahik',
                    render: (
                      row
                    ) => (
                      <span className="font-semibold">
                        {
                          row
                            .pengajuan
                            ?.mustahik
                            ?.namaLengkap
                        }
                      </span>
                    ),
                  },

                  {
                    key: 'nilai',
                    header: 'Nilai Ci',
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
                    header: 'Keputusan',
                    render: (
                      row
                    ) =>
                      row.status ===
                      'LAYAK_DIDANAI' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Layak Didanai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <XCircle className="w-3.5 h-3.5" />
                          Tidak Didanai
                        </span>
                      ),
                  },

                  {
                    key: 'tanggal',
                    header: 'Tanggal Proses',
                    render: (
                      row
                    ) =>
                      formatDateShort(
                        row.tanggalProses
                      ),
                  },
                ]}
                data={
                  results
                }
              />
            </>
          )}
        </>
      )}
    </div>
  )
}