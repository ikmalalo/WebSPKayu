import {
  useEffect,
  useMemo,
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

  const load =
    async () => {
      try {
        setLoading(true)
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

        /*
         * Ambil hasil TOPSIS terbaru.
         */
        if (
          resultData.length
        ) {
          const latest =
            resultData.reduce(
              (
                max,
                item
              ) =>
                new Date(
                  item.tanggalProses
                ) >
                new Date(
                  max
                )
                  ? item.tanggalProses
                  : max,
              resultData[0]
                .tanggalProses
            )

          setResults(
            resultData
              .filter(
                (item) =>
                  new Date(
                    item.tanggalProses
                  ).getTime() ===
                  new Date(
                    latest
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
        console.error(err)

        setError(
          err.response
            ?.data?.message ||
          'Gagal mengambil data TOPSIS.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    load()
  }, [])

  /*
   * ==========================================================
   * MATRICES DARI HASIL DATABASE
   * ==========================================================
   */

  const matrixRows =
    results.map(
      (result) => ({
        result,
        details:
          result.details ||
          [],
      })
    )

  const getDetail =
    (
      result: AdminTopsisResult,
      kriteriaId: string
    ) =>
      result.details?.find(
        (detail) =>
          detail.kriteriaId ===
          kriteriaId
      )

  /*
   * Weighted matrix.
   */
  const weightedMatrix =
    matrixRows.map(
      ({
        result,
      }) =>
        kriteria.map(
          (criterion) =>
            Number(
              getDetail(
                result,
                criterion.id
              )
                ?.nilaiTerbobot ||
                0
            )
        )
    )

  /*
   * A+ / A-
   */
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
          !values.length
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
          !values.length
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

  /*
   * D+ dan D-
   */
  const distances =
    results.map(
      (result) => {
        const weighted =
          kriteria.map(
            (
              criterion
            ) =>
              Number(
                getDetail(
                  result,
                  criterion.id
                )
                  ?.nilaiTerbobot ||
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

  /*
   * ==========================================================
   * PROCESS
   * ==========================================================
   */

  const handleProcess =
    async () => {
      try {
        setProcessing(true)
        setError('')

        await processAdminTopsis(
          threshold
        )

        await load()

        navigate(
          '/admin/ranking'
        )
      } catch (err: any) {
        console.error(err)

        setError(
          err.response
            ?.data?.message ||
          'Gagal menjalankan TOPSIS.'
        )
      } finally {
        setProcessing(false)
      }
    }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

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
              e
            ) =>
              setThreshold(
                Number(
                  e.target.value
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

      <Card className="border-green-300 bg-green-50/40">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5" />

            <div>
              <p className="text-sm font-semibold">
                TOPSIS dihitung di Backend
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Sistem mengambil pengajuan
                dengan status DIPROSES_TOPSIS
                dan jawaban kuesioner lengkap.
                Threshold kelayakan saat ini:{' '}
                <strong>
                  {threshold}
                </strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            X
        ==================================================== */}

        <TabsContent value="matriks">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Keputusan (X)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Mustahik</th>

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
                                  ?.nilaiAwal ||
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================================================
            R
        ==================================================== */}

        <TabsContent value="normalisasi">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Normalisasi (R)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Mustahik</th>

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
                                  ?.nilaiNormalisasi ||
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================================================
            Y
        ==================================================== */}

        <TabsContent value="terbobot">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Normalisasi Terbobot (Y)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Mustahik</th>

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
                          }{' '}
                          (
                          {Number(
                            item.bobot
                          ) *
                            100}
                          %)
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
                                  ?.nilaiTerbobot ||
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================================================
            IDEAL
        ==================================================== */}

        <TabsContent value="solusi">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Solusi Ideal
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="font-bold text-green-700">
                    A+ Positif
                  </p>

                  <p className="font-mono text-xs mt-2">
                    [
                    {idealPositive
                      .map(
                        (
                          value
                        ) =>
                          value.toFixed(
                            4
                          )
                      )
                      .join(
                        ', '
                      )}
                    ]
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="font-bold text-amber-700">
                    A- Negatif
                  </p>

                  <p className="font-mono text-xs mt-2">
                    [
                    {idealNegative
                      .map(
                        (
                          value
                        ) =>
                          value.toFixed(
                            4
                          )
                      )
                      .join(
                        ', '
                      )}
                    ]
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Jarak & Nilai Ci
                </CardTitle>
              </CardHeader>

              <CardContent className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>D+</th>
                      <th>D-</th>
                      <th>Ci</th>
                    </tr>
                  </thead>

                  <tbody>
                    {distances
                      .sort(
                        (
                          a,
                          b
                        ) =>
                          b.preference -
                          a.preference
                      )
                      .map(
                        (
                          row
                        ) => (
                          <tr
                            key={
                              row
                                .result
                                .id
                            }
                          >
                            <td className="font-semibold">
                              {
                                row
                                  .result
                                  .pengajuan
                                  ?.mustahik
                                  ?.namaLengkap
                              }
                            </td>

                            <td className="font-mono">
                              {row.dPlus.toFixed(
                                4
                              )}
                            </td>

                            <td className="font-mono">
                              {row.dMinus.toFixed(
                                4
                              )}
                            </td>

                            <td className="font-mono font-bold text-green-600">
                              {row.preference.toFixed(
                                4
                              )}
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}