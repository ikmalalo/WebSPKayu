import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  RefreshCw,
  Loader2,
  Trophy,
  Medal,
  Award,
  FileText,
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
  const result =
    Number(value ?? 0)

  return Number.isFinite(result)
    ? result
    : 0
}

function formatDate(
  value: string | Date | null | undefined
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

// ============================================================
// COMPONENT
// ============================================================

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

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadResults =
    async () => {
      try {
        setLoading(true)

        setError('')

        const data =
          await getAdminTopsisResults()

        // ------------------------------------------------------
        // Ambil hasil terbaru untuk setiap pengajuan
        // ------------------------------------------------------

        const latestResults =
          new Map<
            string,
            AdminTopsisResult
          >()

        for (
          const result of data
        ) {
          const existing =
            latestResults.get(
              result.pengajuanId
            )

          if (!existing) {
            latestResults.set(
              result.pengajuanId,
              result
            )

            continue
          }

          const currentDate =
            new Date(
              result.tanggalProses
            ).getTime()

          const existingDate =
            new Date(
              existing.tanggalProses
            ).getTime()

          if (
            currentDate >
            existingDate
          ) {
            latestResults.set(
              result.pengajuanId,
              result
            )
          }
        }

        const sortedResults =
          Array.from(
            latestResults.values()
          ).sort(
            (
              a,
              b
            ) =>
              a.ranking -
              b.ranking
          )

        setResults(
          sortedResults
        )
      } catch (
        err: unknown
      ) {
        console.error(
          'GET RANKING ERROR:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil hasil ranking.'
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
      void loadResults()
    },
    []
  )

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics =
    useMemo(() => {
      const layak =
        results.filter(
          (
            result
          ) =>
            result.status ===
            'LAYAK_DIDANAI'
        ).length

      const tidakLayak =
        results.filter(
          (
            result
          ) =>
            result.status ===
            'TIDAK_DIDANAI'
        ).length

      const rataRata =
        results.length === 0
          ? 0
          : results.reduce(
              (
                total,
                result
              ) =>
                total +
                toNumber(
                  result.nilaiPreferensi
                ),
              0
            ) /
            results.length

      return {
        total:
          results.length,

        layak,

        tidakLayak,

        rataRata,
      }
    }, [
      results,
    ])

  // ==========================================================
  // GET RANK ICON
  // ==========================================================

  const getRankIcon =
    (
      ranking: number
    ) => {
      if (ranking === 1) {
        return (
          <Trophy className="w-5 h-5 text-yellow-500" />
        )
      }

      if (ranking === 2) {
        return (
          <Medal className="w-5 h-5 text-slate-400" />
        )
      }

      if (ranking === 3) {
        return (
          <Award className="w-5 h-5 text-amber-600" />
        )
      }

      return (
        <span className="font-semibold">
          #{ranking}
        </span>
      )
    }

  // ==========================================================
  // STATUS STYLE
  // ==========================================================

  const getStatusClass =
    (
      status: string
    ) => {
      switch (status) {
        case 'LAYAK_DIDANAI':
          return 'bg-green-100 text-green-700 border-green-200'

        case 'TIDAK_DIDANAI':
          return 'bg-red-100 text-red-700 border-red-200'

        default:
          return 'bg-slate-100 text-slate-700 border-slate-200'
      }
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
      <PageHeader
        title="Hasil Ranking TOPSIS"
        description="Hasil perangkingan mustahik berdasarkan nilai preferensi metode TOPSIS."
      >
        <Button
          variant="outline"
          onClick={() => {
            void loadResults()
          }}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />

          Muat Ulang
        </Button>
      </PageHeader>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">
              Total Mustahik
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
              {statistics.rataRata.toFixed(
                4
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          TOP 3
      ====================================================== */}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Peringkat Teratas
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {results
                .slice(0, 3)
                .map(
                  (
                    result
                  ) => (
                    <div
                      key={
                        result.id
                      }
                      className="rounded-xl border p-4 bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">
                            Peringkat
                          </p>

                          <div className="mt-1">
                            {getRankIcon(
                              result.ranking
                            )}
                          </div>
                        </div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                            result.status
                          )}`}
                        >
                          {getStatusLabel(
                            result.status
                          )}
                        </div>
                      </div>

                      <p className="mt-4 font-semibold">
                        {getMustahikName(
                          result
                        )}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        NIK:{' '}
                        {getNIK(
                          result
                        )}
                      </p>

                      <div className="mt-4">
                        <p className="text-xs text-slate-500">
                          Nilai Preferensi
                        </p>

                        <p className="text-2xl font-bold text-green-700">
                          {toNumber(
                            result.nilaiPreferensi
                          ).toFixed(
                            6
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Hasil Ranking
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {results.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <FileText className="w-10 h-10 text-slate-400" />

              <h3 className="mt-4 font-semibold">
                Belum Ada Hasil Ranking
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Jalankan proses TOPSIS terlebih
                dahulu untuk menghasilkan ranking.
              </p>
            </div>
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="w-24 text-center">
                    Ranking
                  </th>

                  <th>
                    Nama Mustahik
                  </th>

                  <th>
                    NIK
                  </th>

                  <th className="text-center">
                    Nilai Preferensi
                  </th>

                  <th className="text-center">
                    Status
                  </th>

                  <th>
                    Tanggal Proses
                  </th>
                </tr>
              </thead>

              <tbody>
                {results.map(
                  (
                    result
                  ) => (
                    <tr
                      key={
                        result.id
                      }
                    >
                      <td className="text-center">
                        <div className="flex justify-center">
                          {getRankIcon(
                            result.ranking
                          )}
                        </div>
                      </td>

                      <td>
                        <div>
                          <p className="font-semibold">
                            {getMustahikName(
                              result
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            Pengajuan:{' '}
                            {
                              result.pengajuanId
                            }
                          </p>
                        </div>
                      </td>

                      <td className="font-mono text-sm">
                        {getNIK(
                          result
                        )}
                      </td>

                      <td className="text-center">
                        <span className="font-mono font-bold text-green-700">
                          {toNumber(
                            result.nilaiPreferensi
                          ).toFixed(
                            6
                          )}
                        </span>
                      </td>

                      <td className="text-center">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                            result.status
                          )}`}
                        >
                          {getStatusLabel(
                            result.status
                          )}
                        </span>
                      </td>

                      <td className="text-sm text-slate-600">
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
    </div>
  )
}