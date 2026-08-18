import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  Play,
  Info,
  RefreshCw,
  Loader2,
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'

import {
  Input,
} from '@/components/ui/input'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  getAdminKriteria,
  getAdminTopsisResults,
  processAdminTopsis,
  type AdminKriteria,
  type AdminTopsisResult,
} from '@/lib/adminApi'

export function ProcessTopsisPage() {
  const navigate =
    useNavigate()

  const [
    kriteria,
    setKriteria,
  ] = useState<
    AdminKriteria[]
  >([])

  const [
    results,
    setResults,
  ] = useState<
    AdminTopsisResult[]
  >([])

  const [
    threshold,
    setThreshold,
  ] = useState(0.6)

  const [
    processing,
    setProcessing,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  // ==========================================================
  // LOAD
  // ==========================================================

  const load =
    async () => {
      try {
        setLoading(
          true
        )

        setError('')

        const [
          criteriaData,
          resultData,
        ] =
          await Promise.all([
            getAdminKriteria(),
            getAdminTopsisResults(),
          ])

        setKriteria(
          criteriaData
        )

        // --------------------------------------------------
        // Ambil hasil terbaru untuk setiap pengajuan.
        //
        // JANGAN filter berdasarkan tanggalProses terbaru.
        // --------------------------------------------------

        const latestByPengajuan =
          new Map<
            string,
            AdminTopsisResult
          >()

        for (
          const item of resultData
        ) {
          const existing =
            latestByPengajuan.get(
              item.pengajuanId
            )

          if (
            !existing ||
            new Date(
              item.tanggalProses
            ).getTime() >
              new Date(
                existing.tanggalProses
              ).getTime()
          ) {
            latestByPengajuan.set(
              item.pengajuanId,
              item
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
        err: any
      ) {
        console.error(
          'GET TOPSIS PAGE ERROR:',
          err
        )

        setError(
          err.response
            ?.data?.message ||
            'Gagal mengambil data TOPSIS.'
        )
      } finally {
        setLoading(
          false
        )
      }
    }

  useEffect(() => {
    load()
  }, [])

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getDetail = (
    result: AdminTopsisResult,
    kriteriaId: string
  ) =>
    result.details?.find(
      (detail) =>
        detail.kriteriaId ===
        kriteriaId
    )

  // ==========================================================
  // MATRIX
  // ==========================================================

  const weightedMatrix =
    results.map(
      (result) =>
        kriteria.map(
          (criterion) =>
            Number(
              getDetail(
                result,
                criterion.id
              )
                ?.nilaiTerbobot ??
                0
            )
        )
    )

  // ==========================================================
  // IDEAL POSITIVE
  // ==========================================================

  const idealPositive =
    kriteria.map(
      (
        criterion,
        index
      ) => {
        const values =
          weightedMatrix.map(
            (row) =>
              row[index]
          )

        if (
          values.length === 0
        ) {
          return 0
        }

        return criterion.tipe ===
          'BENEFIT'
          ? Math.max(
              ...values
            )
          : Math.min(
              ...values
            )
      }
    )

  // ==========================================================
  // IDEAL NEGATIVE
  // ==========================================================

  const idealNegative =
    kriteria.map(
      (
        criterion,
        index
      ) => {
        const values =
          weightedMatrix.map(
            (row) =>
              row[index]
          )

        if (
          values.length === 0
        ) {
          return 0
        }

        return criterion.tipe ===
          'BENEFIT'
          ? Math.min(
              ...values
            )
          : Math.max(
              ...values
            )
      }
    )

  // ==========================================================
  // DISTANCES
  // ==========================================================

  const distances =
    results.map(
      (result) => {
        const weighted =
          kriteria.map(
            (criterion) =>
              Number(
                getDetail(
                  result,
                  criterion.id
                )
                  ?.nilaiTerbobot ??
                  0
              )
          )

        const dPlus =
          Math.sqrt(
            weighted.reduce(
              (
                total,
                value,
                index
              ) =>
                total +
                Math.pow(
                  value -
                    idealPositive[
                      index
                    ],
                  2
                ),
              0
            )
          )

        const dMinus =
          Math.sqrt(
            weighted.reduce(
              (
                total,
                value,
                index
              ) =>
                total +
                Math.pow(
                  value -
                    idealNegative[
                      index
                    ],
                  2
                ),
              0
            )
          )

        const preference =
          dPlus +
            dMinus ===
          0
            ? 0
            : dMinus /
              (dPlus +
                dMinus)

        return {
          result,
          dPlus,
          dMinus,
          preference,
        }
      }
    )

  // ==========================================================
  // PROCESS TOPSIS
  // ==========================================================

  const handleProcess =
    async () => {
      try {
        setProcessing(
          true
        )

        setError('')

        await processAdminTopsis(
          threshold
        )

        await load()

        navigate(
          '/admin/ranking'
        )
      } catch (
        err: any
      ) {
        console.error(
          'PROCESS TOPSIS PAGE ERROR:',
          err
        )

        setError(
          err.response
            ?.data?.message ||
            'Gagal menjalankan TOPSIS.'
        )
      } finally {
        setProcessing(
          false
        )
      }
    }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proses Perhitungan TOPSIS"
        description="Perhitungan dilakukan oleh backend menggunakan data kuesioner dari database"
      >
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="1"
            step="0.01"
            className="w-24"
            value={
              threshold
            }
            onChange={(
              event
            ) =>
              setThreshold(
                Number(
                  event.target
                    .value
                )
              )
            }
          />

          <Button
            onClick={
              handleProcess
            }
            disabled={
              processing
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {processing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}

            Hitung TOPSIS
          </Button>
        </div>
      </PageHeader>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          INFO
      ====================================================== */}

      <Card className="border-green-300 bg-green-50/40">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5" />

            <div>
              <p className="text-sm font-semibold">
                TOPSIS dihitung di Backend
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Sistem menghitung seluruh
                pengajuan yang sudah lolos
                verifikasi dan memiliki
                jawaban kuesioner lengkap.
                Semua alternatif dihitung
                dalam satu matriks TOPSIS.
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Threshold kelayakan:{' '}
                <strong>
                  {threshold}
                </strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          TABS
      ====================================================== */}

      <Tabs
        defaultValue="matriks"
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="matriks">
            1. Matriks X
          </TabsTrigger>

          <TabsTrigger value="normalisasi">
            2. Normalisasi R
          </TabsTrigger>

          <TabsTrigger value="terbobot">
            3. Terbobot Y
          </TabsTrigger>

          <TabsTrigger value="solusi">
            4. A+ / A- & Jarak
          </TabsTrigger>
        </TabsList>

        {/* ====================================================
            MATRKS X
        ==================================================== */}

        <TabsContent value="matriks">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Keputusan (X)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {results.length ===
              0 ? (
                <div className="py-10 text-center text-slate-500">
                  Belum ada hasil TOPSIS.
                </div>
              ) : (
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>
                        Mustahik
                      </th>

                      {kriteria.map(
                        (
                          item
                        ) => (
                          <th
                            key={
                              item.id
                            }
                          >
                            {
                              item.kode
                            }
                          </th>
                        )
                      )}
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
                          <td className="font-semibold">
                            {
                              result
                                .pengajuan
                                ?.mustahik
                                ?.namaLengkap
                            }
                          </td>

                          {kriteria.map(
                            (
                              criterion
                            ) => (
                              <td
                                key={
                                  criterion.id
                                }
                                className="text-center font-mono"
                              >
                                {Number(
                                  getDetail(
                                    result,
                                    criterion.id
                                  )
                                    ?.nilaiAwal ??
                                    0
                                )}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================================================
            NORMALISASI
        ==================================================== */}

        <TabsContent value="normalisasi">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Normalisasi (R)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {results.length ===
              0 ? (
                <div className="py-10 text-center text-slate-500">
                  Belum ada data.
                </div>
              ) : (
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>
                        Mustahik
                      </th>

                      {kriteria.map(
                        (
                          item
                        ) => (
                          <th
                            key={
                              item.id
                            }
                          >
                            {
                              item.kode
                            }
                          </th>
                        )
                      )}
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
                          <td className="font-semibold">
                            {
                              result
                                .pengajuan
                                ?.mustahik
                                ?.namaLengkap
                            }
                          </td>

                          {kriteria.map(
                            (
                              criterion
                            ) => (
                              <td
                                key={
                                  criterion.id
                                }
                                className="text-center font-mono"
                              >
                                {Number(
                                  getDetail(
                                    result,
                                    criterion.id
                                  )
                                    ?.nilaiNormalisasi ??
                                    0
                                ).toFixed(
                                  4
                                )}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================================================
            TERBOBOT
        ==================================================== */}

        <TabsContent value="terbobot">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Terbobot (Y)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {results.length ===
              0 ? (
                <div className="py-10 text-center text-slate-500">
                  Belum ada data.
                </div>
              ) : (
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>
                        Mustahik
                      </th>

                      {kriteria.map(
                        (
                          item
                        ) => (
                          <th
                            key={
                              item.id
                            }
                          >
                            {
                              item.kode
                            }
                          </th>
                        )
                      )}
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
                          <td className="font-semibold">
                            {
                              result
                                .pengajuan
                                ?.mustahik
                                ?.namaLengkap
                            }
                          </td>

                          {kriteria.map(
                            (
                              criterion
                            ) => (
                              <td
                                key={
                                  criterion.id
                                }
                                className="text-center font-mono"
                              >
                                {Number(
                                  getDetail(
                                    result,
                                    criterion.id
                                  )
                                    ?.nilaiTerbobot ??
                                    0
                                ).toFixed(
                                  4
                                )}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================================================
            A+ A- JARAK
        ==================================================== */}

        <TabsContent value="solusi">
          <Card>
            <CardHeader>
              <CardTitle>
                Solusi Ideal dan Jarak
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {results.length ===
              0 ? (
                <div className="py-10 text-center text-slate-500">
                  Belum ada data.
                </div>
              ) : (
                <>
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>
                          Mustahik
                        </th>

                        <th>
                          D+
                        </th>

                        <th>
                          D-
                        </th>

                        <th>
                          Ci
                        </th>

                        <th>
                          Ranking
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {distances
                        .sort(
                          (
                            a,
                            b
                          ) =>
                            a.result
                              .ranking -
                            b.result
                              .ranking
                        )
                        .map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item
                                  .result
                                  .id
                              }
                            >
                              <td className="font-semibold">
                                {
                                  item
                                    .result
                                    .pengajuan
                                    ?.mustahik
                                    ?.namaLengkap
                                }
                              </td>

                              <td className="font-mono">
                                {item.dPlus.toFixed(
                                  4
                                )}
                              </td>

                              <td className="font-mono">
                                {item.dMinus.toFixed(
                                  4
                                )}
                              </td>

                              <td className="font-mono font-bold text-green-700">
                                {item.preference.toFixed(
                                  4
                                )}
                              </td>

                              <td className="font-bold">
                                #
                                {
                                  item
                                    .result
                                    .ranking
                                }
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>

                  <div className="mt-5 p-4 rounded-lg bg-slate-50 border">
                    <p className="text-sm font-semibold">
                      Solusi Ideal Positif (A+)
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      {kriteria.map(
                        (
                          criterion,
                          index
                        ) => (
                          <div
                            key={
                              criterion.id
                            }
                            className="text-center"
                          >
                            <p className="text-xs text-slate-500">
                              {
                                criterion.kode
                              }
                            </p>

                            <p className="font-mono font-bold">
                              {Number(
                                idealPositive[
                                  index
                                ]
                              ).toFixed(
                                4
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    <p className="text-sm font-semibold mt-5">
                      Solusi Ideal Negatif (A-)
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      {kriteria.map(
                        (
                          criterion,
                          index
                        ) => (
                          <div
                            key={
                              criterion.id
                            }
                            className="text-center"
                          >
                            <p className="text-xs text-slate-500">
                              {
                                criterion.kode
                              }
                            </p>

                            <p className="font-mono font-bold">
                              {Number(
                                idealNegative[
                                  index
                                ]
                              ).toFixed(
                                4
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}