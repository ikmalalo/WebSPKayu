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
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  getAdminKriteria,
  getAdminTopsisCandidates,
  getAdminTopsisResults,
  processAdminTopsis,
  type AdminKriteria,
  type AdminTopsisCandidate,
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

  return Number.isFinite(numberValue)
    ? numberValue
    : 0
}

// ============================================================
// COMPONENT
// ============================================================

export function ProcessTopsisPage() {
  const navigate =
    useNavigate()

  // ==========================================================
  // STATE KRITERIA
  // ==========================================================

  const [
    kriteria,
    setKriteria,
  ] = useState<
    AdminKriteria[]
  >([])

  // ==========================================================
  // STATE KANDIDAT
  // ==========================================================

  const [
    candidates,
    setCandidates,
  ] = useState<
    AdminTopsisCandidate[]
  >([])

  // ==========================================================
  // STATE HASIL
  // ==========================================================

  const [
    results,
    setResults,
  ] = useState<
    AdminTopsisResult[]
  >([])

  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    processing,
    setProcessing,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  // ==========================================================
  // KRITERIA SORTED
  // ==========================================================

  const sortedKriteria =
    useMemo(
      () =>
        [...kriteria].sort(
          (
            a,
            b
          ) => {
            const getOrder =
              (
                kode: string
              ) => {
                const number =
                  Number(
                    kode.replace(
                      /\D/g,
                      ''
                    )
                  )

                return Number.isFinite(
                  number
                )
                  ? number
                  : 0
              }

            return (
              getOrder(
                a.kode
              ) -
              getOrder(
                b.kode
              )
            )
          }
        ),
      [
        kriteria,
      ]
    )

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const load =
    async () => {
      try {
        setLoading(
          true
        )

        setError('')

        const [
          kriteriaData,
          candidateData,
          resultData,
        ] =
          await Promise.all([
            getAdminKriteria(),
            getAdminTopsisCandidates(),
            getAdminTopsisResults(),
          ])

        setKriteria(
          kriteriaData
        )

        setCandidates(
          candidateData.candidates
        )

        // ------------------------------------------------------
        // Ambil hanya hasil terbaru setiap pengajuan
        // ------------------------------------------------------

        const latestByPengajuan =
          new Map<
            string,
            AdminTopsisResult
          >()

        for (
          const result of resultData
        ) {
          const existing =
            latestByPengajuan.get(
              result.pengajuanId
            )

          if (
            !existing ||
            new Date(
              result.tanggalProses
            ).getTime() >
              new Date(
                existing.tanggalProses
              ).getTime()
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
          'GET TOPSIS PAGE ERROR:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil data TOPSIS.'
        )
      } finally {
        setLoading(
          false
        )
      }
    }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {
      void load()
    },
    []
  )

  // ==========================================================
  // GET DETAIL TOPSIS
  // ==========================================================

  const getDetail =
    (
      result: AdminTopsisResult,
      kriteriaId: string
    ) =>
      result.details?.find(
        (
          detail
        ) =>
          detail.kriteriaId ===
          kriteriaId
      )

  // ==========================================================
  // GET CANDIDATE NAME
  // ==========================================================

  const getCandidateName =
    (
      candidate: AdminTopsisCandidate
    ) =>
      candidate.mustahik
        ?.namaLengkap ||
      candidate.user
        ?.name ||
      '-'

  // ==========================================================
  // GET RESULT NAME
  // ==========================================================

  const getResultName =
    (
      result: AdminTopsisResult
    ) =>
      result.pengajuan
        ?.mustahik
        ?.namaLengkap ||
      result.mustahik
        ?.namaLengkap ||
      result.pengajuan
        ?.user
        ?.name ||
      '-'

  // ==========================================================
  // MATRIKS X
  //
  // Sistem baru memiliki:
  //
  // 15 indikator:
  // ID1 - ID15
  //
  // yang dibentuk menjadi:
  //
  // C1 - C5
  //
  // Untuk tampilan sebelum proses, nilai C1-C5
  // diambil dari rata-rata indikator yang termasuk
  // ke masing-masing kriteria.
  // ==========================================================

  const getCandidateCriterionValue =
    (
      candidate: AdminTopsisCandidate,
      criterion: AdminKriteria
    ): number => {
      const indikatorIds =
        criterion.indikator?.map(
          (
            indikator
          ) =>
            indikator.id
        ) ?? []

      const indikatorCodes =
        criterion.indikator?.map(
          (
            indikator
          ) =>
            indikator.kode
        ) ?? []

      const answers =
        candidate.jawaban.filter(
          (
            answer
          ) => {
            if (
              answer.indikatorId &&
              indikatorIds.includes(
                answer.indikatorId
              )
            ) {
              return true
            }

            if (
              answer.kode &&
              indikatorCodes.includes(
                answer.kode
              )
            ) {
              return true
            }

            return false
          }
        )

      if (
        answers.length === 0
      ) {
        return 0
      }

      const total =
        answers.reduce(
          (
            sum,
            answer
          ) => {
            const nilai =
              toNumber(
                answer.nilai
              )

            return (
              sum +
              nilai
            )
          },
          0
        )

      return (
        total /
        answers.length
      )
    }

  // ==========================================================
  // MATRIKS X KANDIDAT
  // ==========================================================

  const candidateMatrix =
    useMemo(
      () =>
        candidates.map(
          (
            candidate
          ) =>
            sortedKriteria.map(
              (
                criterion
              ) =>
                getCandidateCriterionValue(
                  candidate,
                  criterion
                )
            )
        ),
      [
        candidates,
        sortedKriteria,
      ]
    )

  // ==========================================================
  // MATRIKS NORMALISASI
  // ==========================================================

  const normalizedMatrix =
    results.map(
      (
        result
      ) =>
        sortedKriteria.map(
          (
            criterion
          ) =>
            toNumber(
              getDetail(
                result,
                criterion.id
              )
                ?.nilaiNormalisasi
            )
        )
    )

  // ==========================================================
  // MATRIKS TERBOBOT
  // ==========================================================

  const weightedMatrix =
    results.map(
      (
        result
      ) =>
        sortedKriteria.map(
          (
            criterion
          ) =>
            toNumber(
              getDetail(
                result,
                criterion.id
              )
                ?.nilaiTerbobot
            )
        )
    )

  // ==========================================================
  // IDEAL POSITIVE A+
  // ==========================================================

  const idealPositive =
    sortedKriteria.map(
      (
        criterion,
        index
      ) => {
        const values =
          weightedMatrix.map(
            (
              row
            ) =>
              row[index]
          )

        if (
          values.length === 0
        ) {
          return 0
        }

        if (
          criterion.tipe ===
          'BENEFIT'
        ) {
          return Math.max(
            ...values
          )
        }

        return Math.min(
          ...values
        )
      }
    )

  // ==========================================================
  // IDEAL NEGATIVE A-
  // ==========================================================

  const idealNegative =
    sortedKriteria.map(
      (
        criterion,
        index
      ) => {
        const values =
          weightedMatrix.map(
            (
              row
            ) =>
              row[index]
          )

        if (
          values.length === 0
        ) {
          return 0
        }

        if (
          criterion.tipe ===
          'BENEFIT'
        ) {
          return Math.min(
            ...values
          )
        }

        return Math.max(
          ...values
        )
      }
    )

  // ==========================================================
  // DISTANCE D+ D-
  // ==========================================================

  const distances =
    results.map(
      (
        result
      ) => {
        const weighted =
          sortedKriteria.map(
            (
              criterion
            ) =>
              toNumber(
                getDetail(
                  result,
                  criterion.id
                )
                  ?.nilaiTerbobot
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
              (
                dPlus +
                dMinus
              )

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

        await processAdminTopsis()

        await load()

        navigate(
          '/admin/ranking'
        )
      } catch (
        err: unknown
      ) {
        console.error(
          'PROCESS TOPSIS ERROR:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Gagal menjalankan perhitungan TOPSIS.'
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
        description="Perhitungan dilakukan menggunakan 15 indikator yang dibentuk menjadi 5 kriteria TOPSIS."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              void load()
            }}
            disabled={
              loading ||
              processing
            }
          >
            <RefreshCw className="w-4 h-4 mr-2" />

            Muat Ulang
          </Button>

          <Button
            onClick={() => {
              void handleProcess()
            }}
            disabled={
              processing ||
              candidates.length === 0 ||
              sortedKriteria.length === 0
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

      {/* ======================================================
          ERROR
      ====================================================== */}

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
            <Info className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Perhitungan TOPSIS
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Sistem menggunakan 15 indikator
                kuesioner yang dikelompokkan
                menjadi 5 kriteria, kemudian
                proses normalisasi, pembobotan,
                solusi ideal, jarak, dan nilai
                preferensi dihitung oleh backend.
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-slate-600">
                <p>
                  Kriteria:{' '}
                  <strong>
                    {
                      sortedKriteria.length
                    }
                  </strong>
                </p>

                <p>
                  Indikator:{' '}
                  <strong>
                    {sortedKriteria.reduce(
                      (
                        total,
                        criterion
                      ) =>
                        total +
                        (
                          criterion
                            .indikator
                            ?.length ??
                          0
                        ),
                      0
                    )}
                  </strong>
                </p>

                <p>
                  Alternatif siap diproses:{' '}
                  <strong>
                    {
                      candidates.length
                    }
                  </strong>
                </p>

                <p>
                  Hasil tersimpan:{' '}
                  <strong>
                    {
                      results.length
                    }
                  </strong>
                </p>
              </div>
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
            1. MATRIKS X
        ==================================================== */}

        <TabsContent value="matriks">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Keputusan (X)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {candidates.length ===
              0 ? (
                <div className="py-10 text-center text-slate-500">
                  Belum ada pengajuan yang
                  memenuhi syarat untuk
                  diproses dengan TOPSIS.
                </div>
              ) : (
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>
                        Mustahik
                      </th>

                      <th>
                        Status
                      </th>

                      {sortedKriteria.map(
                        (
                          criterion
                        ) => (
                          <th
                            key={
                              criterion.id
                            }
                          >
                            {
                              criterion.kode
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {candidates.map(
                      (
                        candidate,
                        candidateIndex
                      ) => (
                        <tr
                          key={
                            candidate.id
                          }
                        >
                          <td className="font-semibold">
                            {getCandidateName(
                              candidate
                            )}
                          </td>

                          <td>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                              {
                                candidate.status
                              }
                            </span>
                          </td>

                          {candidateMatrix[
                            candidateIndex
                          ]?.map(
                            (
                              value,
                              index
                            ) => (
                              <td
                                key={
                                  sortedKriteria[
                                    index
                                  ]?.id
                                }
                                className="text-center font-mono"
                              >
                                {value.toFixed(
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
            2. NORMALISASI
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
                  Belum ada hasil TOPSIS.
                  Silakan klik "Hitung TOPSIS".
                </div>
              ) : (
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>
                        Mustahik
                      </th>

                      {sortedKriteria.map(
                        (
                          criterion
                        ) => (
                          <th
                            key={
                              criterion.id
                            }
                          >
                            {
                              criterion.kode
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {results.map(
                      (
                        result,
                        resultIndex
                      ) => (
                        <tr
                          key={
                            result.id
                          }
                        >
                          <td className="font-semibold">
                            {getResultName(
                              result
                            )}
                          </td>

                          {normalizedMatrix[
                            resultIndex
                          ]?.map(
                            (
                              value,
                              index
                            ) => (
                              <td
                                key={
                                  sortedKriteria[
                                    index
                                  ]?.id
                                }
                                className="text-center font-mono"
                              >
                                {value.toFixed(
                                  6
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
            3. TERBOBOT
        ==================================================== */}

        <TabsContent value="terbobot">
          <Card>
            <CardHeader>
              <CardTitle>
                Matriks Normalisasi Terbobot (Y)
              </CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {results.length ===
              0 ? (
                <div className="py-10 text-center text-slate-500">
                  Belum ada hasil TOPSIS.
                  Silakan klik "Hitung TOPSIS".
                </div>
              ) : (
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>
                        Mustahik
                      </th>

                      {sortedKriteria.map(
                        (
                          criterion
                        ) => (
                          <th
                            key={
                              criterion.id
                            }
                          >
                            {
                              criterion.kode
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {results.map(
                      (
                        result,
                        resultIndex
                      ) => (
                        <tr
                          key={
                            result.id
                          }
                        >
                          <td className="font-semibold">
                            {getResultName(
                              result
                            )}
                          </td>

                          {weightedMatrix[
                            resultIndex
                          ]?.map(
                            (
                              value,
                              index
                            ) => (
                              <td
                                key={
                                  sortedKriteria[
                                    index
                                  ]?.id
                                }
                                className="text-center font-mono"
                              >
                                {value.toFixed(
                                  6
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
            4. SOLUSI IDEAL
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
                  Belum ada hasil TOPSIS.
                  Silakan klik "Hitung TOPSIS".
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
                        .slice()
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
                                {getResultName(
                                  item.result
                                )}
                              </td>

                              <td className="font-mono">
                                {item.dPlus.toFixed(
                                  6
                                )}
                              </td>

                              <td className="font-mono">
                                {item.dMinus.toFixed(
                                  6
                                )}
                              </td>

                              <td className="font-mono font-bold text-green-700">
                                {toNumber(
                                  item
                                    .result
                                    .nilaiPreferensi
                                ).toFixed(
                                  6
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

                  {/* ==========================================
                      A+
                  =========================================== */}

                  <div className="mt-5 p-4 rounded-lg bg-slate-50 border">
                    <p className="text-sm font-semibold">
                      Solusi Ideal Positif (A+)
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      {sortedKriteria.map(
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
                              {idealPositive[
                                index
                              ]?.toFixed(
                                6
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    {/* ========================================
                        A-
                    ========================================= */}

                    <p className="text-sm font-semibold mt-5">
                      Solusi Ideal Negatif (A-)
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      {sortedKriteria.map(
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
                              {idealNegative[
                                index
                              ]?.toFixed(
                                6
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