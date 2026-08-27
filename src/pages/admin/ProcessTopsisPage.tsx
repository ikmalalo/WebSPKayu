import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import axios from 'axios'

import {
  RefreshCw,
  Play,
  Info,
  Loader2,
  AlertCircle,
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
  useAuth,
} from '@/context/AuthContext'


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'


// ============================================================
// TYPES
// ============================================================

interface ApiKriteria {
  id: string
  kode?: string | null
  nama?: string | null
  bobot?: number | string | null
  tipe?: string | null
  deskripsi?: string | null
}


interface ApiIndikator {
  id?: string
  kriteriaId?: string
  kriteria?: {
    id?: string
    kode?: string
    nama?: string
  } | null
}


interface ApiTopsisDetail {
  id?: string

  kriteriaId?: string | null
  indikatorId?: string | null

  nilai?: number | string | null
  nilaiAwal?: number | string | null
  nilaiNormalisasi?: number | string | null
  nilaiTerbobot?: number | string | null

  indikator?: ApiIndikator | null

  kriteria?: {
    id?: string
    kode?: string
    nama?: string
  } | null
}


interface ApiMustahik {
  id?: string
  namaLengkap?: string | null
  nik?: string | null
}


interface ApiTopsisResult {
  id: string

  pengajuanId?: string | null
  mustahikId?: string | null

  nilaiPreferensi?: number | string | null
  ranking?: number | null
  status?: string | null

  createdAt?: string | null
  updatedAt?: string | null
  tanggalProses?: string | null

  mustahik?: ApiMustahik | null

  namaLengkap?: string | null
  nik?: string | null

  detail?: ApiTopsisDetail[]
  details?: ApiTopsisDetail[]
  topsisDetails?: ApiTopsisDetail[]
}


interface MatrixRow {
  resultId: string
  mustahikId: string
  nama: string
  nik: string
  status: string
  ranking: number
  preferensi: number

  values: Record<string, number>
}


interface CriterionInfo {
  id: string
  kode: string
  nama: string
  bobot: number
  tipe: 'BENEFIT' | 'COST'
}


interface ProcessData {
  criteria: CriterionInfo[]

  matrixX: MatrixRow[]

  matrixR: MatrixRow[]

  matrixY: MatrixRow[]

  idealPositive: Record<string, number>

  idealNegative: Record<string, number>

  distancePositive: Record<string, number>

  distanceNegative: Record<string, number>

  preference: Record<string, number>
}


// ============================================================
// HELPER
// ============================================================

function toNumber(
  value: unknown,
  fallback = 0
): number {

  const numberValue =
    Number(value)

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : fallback
}


function formatNumber(
  value: unknown,
  digits = 6
): string {

  return toNumber(
    value
  ).toFixed(
    digits
  )
}


function getArrayFromResponse(
  responseData: any
): any[] {

  const candidates = [
    responseData?.data?.results,
    responseData?.data?.topsis,
    responseData?.data?.data,
    responseData?.data,
    responseData?.results,
    responseData,
  ]

  for (
    const candidate of candidates
  ) {

    if (
      Array.isArray(
        candidate
      )
    ) {
      return candidate
    }
  }

  return []
}


function getDetails(
  result: ApiTopsisResult
): ApiTopsisDetail[] {

  const candidates = [
    result.details,
    result.detail,
    result.topsisDetails,
  ]

  for (
    const candidate of candidates
  ) {

    if (
      Array.isArray(
        candidate
      )
    ) {
      return candidate
    }
  }

  return []
}


function getDetailKriteriaId(
  detail: ApiTopsisDetail
): string | null {

  if (
    detail.kriteriaId
  ) {
    return String(
      detail.kriteriaId
    )
  }

  if (
    detail.kriteria?.id
  ) {
    return String(
      detail.kriteria.id
    )
  }

  if (
    detail.indikator?.kriteriaId
  ) {
    return String(
      detail.indikator.kriteriaId
    )
  }

  if (
    detail.indikator?.kriteria?.id
  ) {
    return String(
      detail.indikator.kriteria.id
    )
  }

  return null
}


function getDetailOriginalValue(
  detail: ApiTopsisDetail
): number {

  if (
    detail.nilaiAwal !== undefined &&
    detail.nilaiAwal !== null
  ) {
    return toNumber(
      detail.nilaiAwal
    )
  }

  if (
    detail.nilai !== undefined &&
    detail.nilai !== null
  ) {
    return toNumber(
      detail.nilai
    )
  }

  return 0
}


function getDetailNormalizedValue(
  detail: ApiTopsisDetail
): number {

  if (
    detail.nilaiNormalisasi !== undefined &&
    detail.nilaiNormalisasi !== null
  ) {
    return toNumber(
      detail.nilaiNormalisasi
    )
  }

  return 0
}


function getDetailWeightedValue(
  detail: ApiTopsisDetail
): number {

  if (
    detail.nilaiTerbobot !== undefined &&
    detail.nilaiTerbobot !== null
  ) {
    return toNumber(
      detail.nilaiTerbobot
    )
  }

  return 0
}


function normalizeStatus(
  status?: string | null
): string {

  if (
    !status
  ) {
    return '-'
  }

  return status
    .replaceAll(
      '_',
      ' '
    )
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character.toUpperCase()
    )
}


function getStatusClass(
  status?: string | null
): string {

  const normalized =
    String(
      status ||
      ''
    ).toUpperCase()

  if (
    normalized.includes(
      'LAYAK'
    ) ||
    normalized.includes(
      'LOLOS'
    )
  ) {
    return (
      'bg-green-50 text-green-700 border-green-200'
    )
  }

  if (
    normalized.includes(
      'TIDAK'
    ) ||
    normalized.includes(
      'DITOLAK'
    )
  ) {
    return (
      'bg-red-50 text-red-700 border-red-200'
    )
  }

  return (
    'bg-slate-50 text-slate-700 border-slate-200'
  )
}


// ============================================================
// AGGREGATE MATRIX X
// ============================================================

function buildMatrixX(
  results: ApiTopsisResult[],
  criteria: CriterionInfo[]
): MatrixRow[] {

  return results.map(
    (
      result,
      index
    ) => {

      const details =
        getDetails(
          result
        )

      const values:
        Record<
          string,
          number
        > =
        {}

      criteria.forEach(
        (
          criterion
        ) => {

          const relatedDetails =
            details.filter(
              (
                detail
              ) =>
                getDetailKriteriaId(
                  detail
                ) ===
                criterion.id
            )

          if (
            relatedDetails.length >
            0
          ) {

            const total =
              relatedDetails.reduce(
                (
                  sum,
                  detail
                ) =>
                  sum +
                  getDetailOriginalValue(
                    detail
                  ),
                0
              )

            values[
              criterion.id
            ] =
              total /
              relatedDetails.length

            return
          }


          // ================================================
          // FALLBACK
          //
          // Jika backend mengirim nilai per kriteria
          // langsung pada detail, nilai tetap digunakan.
          // ================================================

          const directDetail =
            details.find(
              (
                detail
              ) =>
                String(
                  detail.kriteriaId ||
                  ''
                ) ===
                criterion.id
            )

          values[
            criterion.id
          ] =
            directDetail
              ? getDetailOriginalValue(
                  directDetail
                )
              : 0
        }
      )


      return {
        resultId:
          String(
            result.id
          ),

        mustahikId:
          String(
            result.mustahikId ||
            result.mustahik?.id ||
            ''
          ),

        nama:
          String(
            result.namaLengkap ||
            result.mustahik
              ?.namaLengkap ||
            `Alternatif ${index + 1}`
          ),

        nik:
          String(
            result.nik ||
            result.mustahik
              ?.nik ||
            '-'
          ),

        status:
          String(
            result.status ||
            '-'
          ),

        ranking:
          toNumber(
            result.ranking,
            index + 1
          ),

        preferensi:
          toNumber(
            result.nilaiPreferensi
          ),

        values,
      }
    }
  )
}


// ============================================================
// NORMALISASI MATRIX R
// ============================================================
//
// r_ij = x_ij / sqrt(sum(x_ij²))
// ============================================================

function buildMatrixR(
  matrixX: MatrixRow[],
  criteria: CriterionInfo[]
): MatrixRow[] {

  const denominators:
    Record<
      string,
      number
    > =
    {}


  criteria.forEach(
    (
      criterion
    ) => {

      const totalSquare =
        matrixX.reduce(
          (
            sum,
            row
          ) => {

            const value =
              toNumber(
                row.values[
                  criterion.id
                ]
              )

            return (
              sum +
              value *
                value
            )
          },
          0
        )

      denominators[
        criterion.id
      ] =
        Math.sqrt(
          totalSquare
        )
    }
  )


  return matrixX.map(
    (
      row
    ) => {

      const values:
        Record<
          string,
          number
        > =
        {}

      criteria.forEach(
        (
          criterion
        ) => {

          const denominator =
            denominators[
              criterion.id
            ]

          const value =
            toNumber(
              row.values[
                criterion.id
              ]
            )

          values[
            criterion.id
          ] =
            denominator > 0
              ? value /
                denominator
              : 0
        }
      )

      return {
        ...row,
        values,
      }
    }
  )
}


// ============================================================
// MATRIX TERBOBOT Y
// ============================================================
//
// y_ij = w_j × r_ij
// ============================================================

function buildMatrixY(
  matrixR: MatrixRow[],
  criteria: CriterionInfo[]
): MatrixRow[] {

  return matrixR.map(
    (
      row
    ) => {

      const values:
        Record<
          string,
          number
        > =
        {}

      criteria.forEach(
        (
          criterion
        ) => {

          values[
            criterion.id
          ] =
            toNumber(
              row.values[
                criterion.id
              ]
            ) *
            criterion.bobot
        }
      )

      return {
        ...row,
        values,
      }
    }
  )
}


// ============================================================
// SOLUSI IDEAL
// ============================================================

function buildIdealSolutions(
  matrixY: MatrixRow[],
  criteria: CriterionInfo[]
) {

  const idealPositive:
    Record<
      string,
      number
    > =
    {}

  const idealNegative:
    Record<
      string,
      number
    > =
    {}


  criteria.forEach(
    (
      criterion
    ) => {

      const values =
        matrixY.map(
          (
            row
          ) =>
            toNumber(
              row.values[
                criterion.id
              ]
            )
        )

      if (
        values.length === 0
      ) {

        idealPositive[
          criterion.id
        ] =
          0

        idealNegative[
          criterion.id
        ] =
          0

        return
      }


      if (
        criterion.tipe ===
        'COST'
      ) {

        idealPositive[
          criterion.id
        ] =
          Math.min(
            ...values
          )

        idealNegative[
          criterion.id
        ] =
          Math.max(
            ...values
          )

      } else {

        idealPositive[
          criterion.id
        ] =
          Math.max(
            ...values
          )

        idealNegative[
          criterion.id
        ] =
          Math.min(
            ...values
          )
      }
    }
  )


  return {
    idealPositive,
    idealNegative,
  }
}


// ============================================================
// JARAK DAN PREFERENSI
// ============================================================
//
// D+ = sqrt(sum((Y - A+)²))
// D- = sqrt(sum((Y - A-)²))
//
// V = D- / (D+ + D-)
// ============================================================

function buildDistancesAndPreference(
  matrixY: MatrixRow[],
  criteria: CriterionInfo[],
  idealPositive: Record<string, number>,
  idealNegative: Record<string, number>
) {

  const distancePositive:
    Record<
      string,
      number
    > =
    {}

  const distanceNegative:
    Record<
      string,
      number
    > =
    {}

  const preference:
    Record<
      string,
      number
    > =
    {}


  matrixY.forEach(
    (
      row
    ) => {

      let totalPositive =
        0

      let totalNegative =
        0


      criteria.forEach(
        (
          criterion
        ) => {

          const value =
            toNumber(
              row.values[
                criterion.id
              ]
            )

          const positive =
            toNumber(
              idealPositive[
                criterion.id
              ]
            )

          const negative =
            toNumber(
              idealNegative[
                criterion.id
              ]
            )

          totalPositive +=
            Math.pow(
              value -
                positive,
              2
            )

          totalNegative +=
            Math.pow(
              value -
                negative,
              2
            )
        }
      )


      const dPositive =
        Math.sqrt(
          totalPositive
        )

      const dNegative =
        Math.sqrt(
          totalNegative
        )


      distancePositive[
        row.resultId
      ] =
        dPositive

      distanceNegative[
        row.resultId
      ] =
        dNegative


      const denominator =
        dPositive +
        dNegative

      preference[
        row.resultId
      ] =
        denominator > 0
          ? dNegative /
            denominator
          : 0
    }
  )


  return {
    distancePositive,
    distanceNegative,
    preference,
  }
}


// ============================================================
// PAGE
// ============================================================

export function ProcessTopsisPage() {

  // ==========================================================
  // AUTH
  // ==========================================================

  const {
    token,
  } =
    useAuth()


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    results,
    setResults,
  ] =
    useState<
      ApiTopsisResult[]
    >([])


  const [
    criteria,
    setCriteria,
  ] =
    useState<
      CriterionInfo[]
    >([])


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    )


  const [
    processing,
    setProcessing,
  ] =
    useState(
      false
    )


  const [
    error,
    setError,
  ] =
    useState(
      ''
    )


  const [
    activeStep,
    setActiveStep,
  ] =
    useState(
      1
    )


  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  const authHeaders =
    useMemo(
      () => ({
        Authorization:
          `Bearer ${token}`,
      }),
      [
        token,
      ]
    )


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData =
    useCallback(
      async () => {

        if (
          !token
        ) {

          setLoading(
            false
          )

          setError(
            'Sesi login tidak ditemukan.'
          )

          return
        }


        try {

          setLoading(
            true
          )

          setError(
            ''
          )


          const [
            resultResponse,
            criteriaResponse,
          ] =
            await Promise.all([
              axios.get(
                `${API_URL}/admin/topsis/results`,
                {
                  headers:
                    authHeaders,
                }
              ),

              axios.get(
                `${API_URL}/admin/kriteria`,
                {
                  headers:
                    authHeaders,
                }
              ),
            ])


          const rawResults =
            getArrayFromResponse(
              resultResponse.data
            )


          const rawCriteria =
            getArrayFromResponse(
              criteriaResponse.data
            )


          const normalizedCriteria =
            rawCriteria.map(
              (
                item: ApiKriteria,
                index: number
              ) => {

                const rawBobot =
                  toNumber(
                    item.bobot
                  )

                return {
                  id:
                    String(
                      item.id
                    ),

                  kode:
                    String(
                      item.kode ||
                      `C${index + 1}`
                    ),

                  nama:
                    String(
                      item.nama ||
                      `Kriteria ${index + 1}`
                    ),

                  bobot:
                    rawBobot,

                  tipe:
                    String(
                      item.tipe ||
                      'BENEFIT'
                    ).toUpperCase() ===
                    'COST'
                      ? 'COST'
                      : 'BENEFIT',
                }
              }
            )


          // ==================================================
          // NORMALISASI BOBOT
          //
          // Agar tetap aman jika bobot database disimpan
          // dalam bentuk 20,20,20,20,20 atau 0.2,0.2...
          // ==================================================

          const totalBobot =
            normalizedCriteria.reduce(
              (
                total,
                item
              ) =>
                total +
                item.bobot,
              0
            )


          const criteriaWithWeight =
            normalizedCriteria.map(
              (
                item
              ) => ({
                ...item,

                bobot:
                  totalBobot > 0
                    ? item.bobot /
                      totalBobot
                    : normalizedCriteria.length >
                      0
                      ? 1 /
                        normalizedCriteria.length
                      : 0,
              })
            )


          setResults(
            rawResults as
              ApiTopsisResult[]
          )

          setCriteria(
            criteriaWithWeight
          )

        } catch (
          error: any
        ) {

          console.error(
            'LOAD TOPSIS ERROR:',
            error
          )

          setError(
            error
              ?.response
              ?.data
              ?.message ||
            error
              ?.message ||
            'Gagal memuat data TOPSIS.'
          )

        } finally {

          setLoading(
            false
          )
        }
      },
      [
        token,
        authHeaders,
      ]
    )


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {

      void loadData()

    },
    [
      loadData,
    ]
  )


  // ==========================================================
  // PROCESS TOPSIS
  // ==========================================================

  const handleProcess =
    async () => {

      if (
        !token
      ) {
        return
      }

      try {

        setProcessing(
          true
        )

        setError(
          ''
        )


        await axios.post(
          `${API_URL}/admin/topsis/process`,
          {},
          {
            headers:
              authHeaders,
          }
        )


        await loadData()

        setActiveStep(
          1
        )

      } catch (
        error: any
      ) {

        console.error(
          'PROCESS TOPSIS ERROR:',
          error
        )

        setError(
          error
            ?.response
            ?.data
            ?.message ||
          error
            ?.message ||
          'Gagal melakukan perhitungan TOPSIS.'
        )

      } finally {

        setProcessing(
          false
        )
      }
    }


  // ==========================================================
  // BUILD PROCESS DATA
  // ==========================================================

  const processData =
    useMemo<
      ProcessData
    >(
      () => {

        const matrixX =
          buildMatrixX(
            results,
            criteria
          )


        const matrixR =
          buildMatrixR(
            matrixX,
            criteria
          )


        const matrixY =
          buildMatrixY(
            matrixR,
            criteria
          )


        const {
          idealPositive,
          idealNegative,
        } =
          buildIdealSolutions(
            matrixY,
            criteria
          )


        const {
          distancePositive,
          distanceNegative,
          preference,
        } =
          buildDistancesAndPreference(
            matrixY,
            criteria,
            idealPositive,
            idealNegative
          )


        return {
          criteria,

          matrixX,

          matrixR,

          matrixY,

          idealPositive,

          idealNegative,

          distancePositive,

          distanceNegative,

          preference,
        }

      },
      [
        results,
        criteria,
      ]
    )


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalIndicators =
    useMemo(
      () => {

        const indicatorIds =
          new Set<
            string
          >()

        results.forEach(
          (
            result
          ) => {

            getDetails(
              result
            ).forEach(
              (
                detail
              ) => {

                if (
                  detail.indikatorId
                ) {

                  indicatorIds.add(
                    String(
                      detail.indikatorId
                    )
                  )
                }
              }
            )
          }
        )

        return indicatorIds.size

      },
      [
        results,
      ]
    )


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading
  ) {

    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="flex items-center gap-3 text-slate-500">

          <Loader2 className="h-5 w-5 animate-spin text-green-600" />

          <span>
            Memuat data TOPSIS...
          </span>

        </div>

      </div>
    )
  }


  // ==========================================================
  // EMPTY
  // ==========================================================

  const hasData =
    processData.matrixX.length >
    0


  // ==========================================================
  // RENDER MATRIX TABLE
  // ==========================================================

  const renderMatrixTable =
    (
      title: string,
      rows: MatrixRow[]
    ) => (

      <Card>

        <CardHeader>

          <CardTitle className="text-base">

            {title}

          </CardTitle>

        </CardHeader>


        <CardContent>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-sm">

              <thead>

                <tr className="border-b bg-slate-50/80">

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                    Mustahik

                  </th>


                  {processData.criteria.map(
                    (
                      criterion
                    ) => (

                      <th
                        key={
                          criterion.id
                        }
                        className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >

                        {criterion.kode}

                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {rows.map(
                  (
                    row
                  ) => (

                    <tr
                      key={
                        row.resultId
                      }
                      className="border-b last:border-b-0"
                    >

                      <td className="px-4 py-4 font-medium text-slate-800">

                        {row.nama}

                      </td>


                      {processData.criteria.map(
                        (
                          criterion
                        ) => (

                          <td
                            key={
                              criterion.id
                            }
                            className="px-4 py-4 text-center font-mono text-sm text-slate-700"
                          >

                            {formatNumber(
                              row.values[
                                criterion.id
                              ]
                            )}

                          </td>

                        )
                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </CardContent>

      </Card>
    )


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">

            Proses Perhitungan TOPSIS

          </h1>


          <p className="mt-1 text-sm text-slate-500">

            Perhitungan dilakukan menggunakan indikator yang dibentuk menjadi kriteria TOPSIS.

          </p>

        </div>


        <div className="flex flex-wrap gap-3">

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void loadData()
            }}
            disabled={
              loading ||
              processing
            }
          >

            <RefreshCw className="mr-2 h-4 w-4" />

            Muat Ulang

          </Button>


          <Button
            type="button"
            onClick={() => {
              void handleProcess()
            }}
            disabled={
              processing
            }
            className="bg-green-600 hover:bg-green-700"
          >

            {processing ? (

              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            ) : (

              <Play className="mr-2 h-4 w-4" />

            )}

            Hitung TOPSIS

          </Button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex gap-3">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <p className="text-sm text-red-700">

              {error}

            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          INFO
      ====================================================== */}

      <Card className="border-green-200 bg-green-50/40">

        <CardContent className="p-5">

          <div className="flex gap-3">

            <Info className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />


            <div>

              <p className="font-semibold text-slate-800">

                Perhitungan TOPSIS

              </p>


              <p className="mt-1 text-sm text-slate-600">

                Sistem menampilkan Matriks Keputusan (X), Normalisasi (R),
                Matriks Normalisasi Terbobot (Y), solusi ideal positif dan
                negatif, jarak alternatif, serta nilai preferensi.

              </p>


              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">

                <span>

                  Kriteria:
                  {' '}
                  <strong className="text-slate-800">

                    {processData.criteria.length}

                  </strong>

                </span>


                <span>

                  Indikator:
                  {' '}
                  <strong className="text-slate-800">

                    {totalIndicators}

                  </strong>

                </span>


                <span>

                  Alternatif siap diproses:
                  {' '}
                  <strong className="text-slate-800">

                    {processData.matrixX.length}

                  </strong>

                </span>


                <span>

                  Hasil tersimpan:
                  {' '}
                  <strong className="text-slate-800">

                    {results.length}

                  </strong>

                </span>

              </div>

            </div>

          </div>

        </CardContent>

      </Card>


      {/* ======================================================
          TABS
      ====================================================== */}

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 md:grid-cols-4">

        {[
          {
            id: 1,
            label: '1. Matriks X',
          },
          {
            id: 2,
            label: '2. Normalisasi R',
          },
          {
            id: 3,
            label: '3. Terbobot Y',
          },
          {
            id: 4,
            label: '4. A+ / A- & Jarak',
          },
        ].map(
          (
            item
          ) => (

            <button
              key={
                item.id
              }
              type="button"
              onClick={() =>
                setActiveStep(
                  item.id
                )
              }
              className={
                activeStep ===
                item.id
                  ? 'rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-green-700 shadow-sm'
                  : 'rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-800'
              }
            >

              {item.label}

            </button>

          )
        )}

      </div>


      {/* ======================================================
          EMPTY DATA
      ====================================================== */}

      {!hasData && (

        <Card>

          <CardContent className="py-16 text-center">

            <Info className="mx-auto h-8 w-8 text-slate-400" />

            <h3 className="mt-4 font-semibold text-slate-800">

              Belum ada data TOPSIS

            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">

              Belum ada alternatif yang dapat ditampilkan.
              Pastikan pengajuan sudah lolos verifikasi dan memiliki
              jawaban kuesioner sebelum menjalankan perhitungan TOPSIS.

            </p>

          </CardContent>

        </Card>

      )}


      {/* ======================================================
          STEP 1 - MATRIX X
      ====================================================== */}

      {hasData &&
        activeStep ===
          1 &&

        renderMatrixTable(
          'Matriks Keputusan (X)',
          processData.matrixX
        )}


      {/* ======================================================
          STEP 2 - NORMALISASI R
      ====================================================== */}

      {hasData &&
        activeStep ===
          2 &&

        renderMatrixTable(
          'Matriks Normalisasi (R)',
          processData.matrixR
        )}


      {/* ======================================================
          STEP 3 - MATRIX Y
      ====================================================== */}

      {hasData &&
        activeStep ===
          3 &&

        renderMatrixTable(
          'Matriks Normalisasi Terbobot (Y)',
          processData.matrixY
        )}


      {/* ======================================================
          STEP 4 - IDEAL & DISTANCE
      ====================================================== */}

      {hasData &&
        activeStep ===
          4 && (

          <div className="space-y-6">

            {/* JARAK */}

            <Card>

              <CardHeader>

                <CardTitle className="text-base">

                  Solusi Ideal dan Jarak

                </CardTitle>

              </CardHeader>


              <CardContent>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[750px] text-sm">

                    <thead>

                      <tr className="border-b bg-slate-50/80">

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                          Mustahik

                        </th>


                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">

                          D+

                        </th>


                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">

                          D-

                        </th>


                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">

                          Vi

                        </th>


                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">

                          Ranking

                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {processData.matrixY.map(
                        (
                          row
                        ) => (

                          <tr
                            key={
                              row.resultId
                            }
                            className="border-b last:border-b-0"
                          >

                            <td className="px-4 py-4 font-medium text-slate-800">

                              {row.nama}

                            </td>


                            <td className="px-4 py-4 text-center font-mono">

                              {formatNumber(
                                processData.distancePositive[
                                  row.resultId
                                ]
                              )}

                            </td>


                            <td className="px-4 py-4 text-center font-mono">

                              {formatNumber(
                                processData.distanceNegative[
                                  row.resultId
                                ]
                              )}

                            </td>


                            <td className="px-4 py-4 text-center font-mono font-semibold text-slate-800">

                              {formatNumber(
                                processData.preference[
                                  row.resultId
                                ]
                              )}

                            </td>


                            <td className="px-4 py-4 text-center font-semibold text-slate-800">

                              #
                              {
                                row.ranking
                              }

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </CardContent>

            </Card>


            {/* SOLUSI IDEAL */}

            <Card>

              <CardContent className="p-5">

                <div className="space-y-8">

                  <div>

                    <h3 className="font-semibold text-slate-800">

                      Solusi Ideal Positif (A+)

                    </h3>


                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">

                      {processData.criteria.map(
                        (
                          criterion
                        ) => (

                          <div
                            key={
                              criterion.id
                            }
                            className="text-center"
                          >

                            <p className="text-xs text-slate-500">

                              {criterion.kode}

                            </p>


                            <p className="mt-1 font-mono font-semibold text-slate-800">

                              {formatNumber(
                                processData.idealPositive[
                                  criterion.id
                                ]
                              )}

                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>


                  <div>

                    <h3 className="font-semibold text-slate-800">

                      Solusi Ideal Negatif (A-)

                    </h3>


                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">

                      {processData.criteria.map(
                        (
                          criterion
                        ) => (

                          <div
                            key={
                              criterion.id
                            }
                            className="text-center"
                          >

                            <p className="text-xs text-slate-500">

                              {criterion.kode}

                            </p>


                            <p className="mt-1 font-mono font-semibold text-slate-800">

                              {formatNumber(
                                processData.idealNegative[
                                  criterion.id
                                ]
                              )}

                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>

          </div>

        )}

    </div>

  )
}