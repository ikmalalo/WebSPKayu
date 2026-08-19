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
  getAdminTopsisCandidates,
  getAdminTopsisResults,
  processAdminTopsis,
  type AdminKriteria,
  type AdminTopsisCandidate,
  type AdminTopsisResult,
} from '@/lib/adminApi'

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
  //
  // Ini digunakan untuk Matriks X sebelum proses TOPSIS.
  // ==========================================================

  const [
    candidates,
    setCandidates,
  ] = useState<
    AdminTopsisCandidate[]
  >([])

  // ==========================================================
  // STATE HASIL TOPSIS
  //
  // Ini baru terisi setelah admin menghitung TOPSIS.
  // ==========================================================

  const [
    results,
    setResults,
  ] = useState<
    AdminTopsisResult[]
  >([])

  // ==========================================================
  // THRESHOLD
  // ==========================================================

  const [
    threshold,
    setThreshold,
  ] = useState(0.6)

  // ==========================================================
  // LOADING
  // ==========================================================

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
  // LOAD DATA
  // ==========================================================

  const load =
    async () => {
      try {
        setLoading(
          true
        )

        setError('')

        // ------------------------------------------------------
        // Kandidat TOPSIS dan hasil TOPSIS diambil terpisah.
        //
        // Kandidat:
        // Pengajuan + Jawaban Kuesioner
        //
        // Hasil:
        // TopsisResult
        // ------------------------------------------------------

        const [
          candidateData,
          resultData,
        ] =
          await Promise.all([
            getAdminTopsisCandidates(),
            getAdminTopsisResults(),
          ])

        // ------------------------------------------------------
        // KRITERIA
        // ------------------------------------------------------

        setKriteria(
          candidateData.criteria
        )

        // ------------------------------------------------------
        // KANDIDAT
        //
        // IKmal akan muncul di sini meskipun belum ada
        // TopsisResult.
        // ------------------------------------------------------

        setCandidates(
          candidateData.candidates
        )

        // ------------------------------------------------------
        // HASIL TOPSIS
        //
        // Ambil hasil terbaru untuk setiap pengajuan.
        // ------------------------------------------------------

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

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {
      load()
    },
    []
  )

  // ==========================================================
  // HELPER HASIL
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
  // MATRIX X DARI HASIL TOPSIS
  //
  // Dipakai setelah TOPSIS sudah dihitung.
  // ==========================================================

  const resultWeightedMatrix =
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
          resultWeightedMatrix.map(
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
          resultWeightedMatrix.map(
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

        // ------------------------------------------------------
        // Backend akan mengambil SEMUA alternatif lengkap
        // dan menghitungnya dalam satu matriks.
        // ------------------------------------------------------

        await processAdminTopsis(
          threshold
        )

        // ------------------------------------------------------
        // Reload agar kandidat + hasil terbaru masuk.
        // ------------------------------------------------------

        await load()

        // ------------------------------------------------------
        // Setelah berhasil langsung ke ranking.
        // ------------------------------------------------------

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
              processing ||
              candidates.length <
                2
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
            <Info className="w-5 h-5 text-green-600 mt-0.5" />

            <div>
              <p className="text-sm font-semibold">
                TOPSIS dihitung di Backend
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Sistem menggunakan seluruh
                pengajuan yang sudah lolos
                verifikasi dan memiliki
                jawaban kuesioner lengkap
                sebagai alternatif TOPSIS.
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Jumlah alternatif siap diproses:{' '}
                <strong>
                  {
                    candidates.length
                  }{' '}
                  mustahik
                </strong>
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
                  memenuhi syarat TOPSIS.
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
                    {candidates.map(
                      (
                        candidate
                      ) => (
                        <tr
                          key={
                            candidate.pengajuanId
                          }
                        >
                          <td className="font-semibold">
                            {
                              candidate
                                .mustahik
                                .namaLengkap
                            }
                          </td>

                          <td>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                              {
                                candidate.status
                              }
                            </span>
                          </td>

                          {kriteria.map(
                            (
                              criterion
                            ) => {
                              const answer =
                                candidate.jawaban.find(
                                  (
                                    item
                                  ) =>
                                    item.kriteriaId ===
                                    criterion.id
                                )

                              return (
                                <td
                                  key={
                                    criterion.id
                                  }
                                  className="text-center font-mono"
                                >
                                  {
                                    answer
                                      ?.nilai ??
                                      0
                                  }
                                </td>
                              )
                            }
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
            3. TERBOBOT
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
            4. SOLUSI IDEAL + JARAK
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

                  {/* ==================================================
                      A+
                  ================================================== */}

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

                    {/* ================================================
                        A-
                    ================================================= */}

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