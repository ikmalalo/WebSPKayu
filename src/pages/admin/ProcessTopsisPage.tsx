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
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

// ============================================================
// CONFIG & TYPES
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

export interface ApiIndikatorItem {
  id: string
  kriteriaId: string
  kode: string
  nama: string
  deskripsi?: string | null
  tipe: 'POSITIF' | 'NEGATIF'
  urutan: number
  aktif: boolean
  kriteria?: {
    id: string
    kode: string
    nama: string
    bobot: number | string
    tipe: 'BENEFIT' | 'COST'
  } | null
}

export interface ApiKriteriaItem {
  id: string
  kode: string
  nama: string
  bobot: number | string
  tipe: 'BENEFIT' | 'COST'
  deskripsi?: string | null
  dimensi?: string | null
  urutan: number
  aktif: boolean
  indikator: ApiIndikatorItem[]
}

export interface IndicatorMeta {
  id: string
  kriteriaId: string
  kriteriaKode: string
  kriteriaNama: string
  kode: string
  nama: string
  tipe: 'POSITIF' | 'NEGATIF'
  bobot: number
  urutan: number
}

export interface ApiTopsisDetailItem {
  id?: string
  topsisResultId?: string
  indikatorId?: string
  kriteriaId?: string | null
  nilaiAwal: number | string
  nilaiNormalisasi: number | string
  nilaiTerbobot: number | string
  indikator?: ApiIndikatorItem | null
}

export interface ApiTopsisResultItem {
  id: string
  pengajuanId: string
  nilaiPreferensi: number | string
  ranking: number
  status: string
  tanggalProses: string
  pengajuan?: {
    id: string
    mustahikId: string
    mustahik?: {
      id: string
      namaLengkap: string
      nik: string
      alamat?: string | null
    } | null
    user?: {
      name: string
      email: string
    } | null
  } | null
  details?: ApiTopsisDetailItem[]
}

export interface ApiCandidateItem {
  id: string
  userId: string
  mustahikId: string
  status: string
  tanggalPengajuan?: string | null
  mustahik?: {
    id: string
    namaLengkap: string
    nik: string
    alamat?: string | null
  } | null
  jawaban?: Array<{
    id?: string
    indikatorId: string
    kode?: string | null
    nama?: string | null
    tipe?: string | null
    nilai: number | string
  }>
}

interface MatrixRow {
  key: string
  pengajuanId: string
  nama: string
  nik: string
  status: string
  ranking?: number
  preferensi?: number
  dPlus?: number
  dMinus?: number
  values: Record<string, number>
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatDecimal(value: unknown, digits = 4): string {
  return toNumber(value).toFixed(digits)
}

function formatPercent(value: unknown): string {
  return `${(toNumber(value) * 100).toFixed(1)}%`
}

// ============================================================
// COMPONENT
// ============================================================

export function ProcessTopsisPage() {
  const { token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeStep, setActiveStep] = useState(1)

  const [kriteriaList, setKriteriaList] = useState<ApiKriteriaItem[]>([])
  const [resultsList, setResultsList] = useState<ApiTopsisResultItem[]>([])
  const [candidatesList, setCandidatesList] = useState<ApiCandidateItem[]>([])

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  )

  // 1. Flatten 5 Kriteria into 15 Indikators with exact weights
  const indicators = useMemo<IndicatorMeta[]>(() => {
    const list: IndicatorMeta[] = []
    const sortedKriteria = [...kriteriaList].sort((a, b) => a.urutan - b.urutan)

    for (const k of sortedKriteria) {
      const activeIndikators = (k.indikator || [])
        .filter((ind) => ind.aktif !== false)
        .sort((a, b) => a.urutan - b.urutan)

      const kriteriaWeight = toNumber(k.bobot)
      const count = activeIndikators.length
      const indicatorWeight = count > 0 ? kriteriaWeight / count : 0

      for (const ind of activeIndikators) {
        list.push({
          id: ind.id,
          kriteriaId: k.id,
          kriteriaKode: k.kode,
          kriteriaNama: k.nama,
          kode: ind.kode,
          nama: ind.nama,
          tipe: ind.tipe === 'NEGATIF' ? 'NEGATIF' : 'POSITIF',
          bobot: indicatorWeight,
          urutan: ind.urutan,
        })
      }
    }

    return list.sort((a, b) => a.urutan - b.urutan)
  }, [kriteriaList])

  // 2. Load all required data
  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setError('Sesi login tidak ditemukan.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const [criteriaRes, candidatesRes, resultsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/kriteria`, { headers: authHeaders }),
        axios.get(`${API_URL}/admin/topsis/candidates`, { headers: authHeaders }),
        axios.get(`${API_URL}/admin/topsis/results`, { headers: authHeaders }),
      ])

      const rawCriteria = criteriaRes.data?.data?.kriteria || criteriaRes.data?.data || criteriaRes.data || []
      const rawCandidates = candidatesRes.data?.data?.candidates || candidatesRes.data?.candidates || []
      const rawResults = resultsRes.data?.data?.results || resultsRes.data?.results || []

      setKriteriaList(Array.isArray(rawCriteria) ? rawCriteria : [])
      setCandidatesList(Array.isArray(rawCandidates) ? rawCandidates : [])
      setResultsList(Array.isArray(rawResults) ? rawResults : [])
    } catch (err: unknown) {
      console.error('LOAD TOPSIS ERROR:', err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'Gagal memuat data TOPSIS.')
      } else {
        setError('Gagal memuat data TOPSIS.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, authHeaders])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // 3. Process TOPSIS in backend
  const handleProcess = async () => {
    if (!token) return

    try {
      setProcessing(true)
      setError('')
      setSuccessMessage('')

      const response = await axios.post(
        `${API_URL}/admin/topsis/process`,
        {},
        { headers: authHeaders }
      )

      setSuccessMessage(response.data?.message || 'Perhitungan TOPSIS berhasil dijalankan!')
      await loadData()
    } catch (err: unknown) {
      console.error('PROCESS TOPSIS ERROR:', err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'Gagal menjalankan perhitungan TOPSIS.')
      } else {
        setError('Gagal menjalankan perhitungan TOPSIS.')
      }
    } finally {
      setProcessing(false)
    }
  }

  // 4. Build Complete TOPSIS Calculation Data
  const topsisCalculation = useMemo(() => {
    if (indicators.length === 0) {
      return {
        matrixX: [],
        divisors: {},
        matrixR: [],
        matrixY: [],
        idealPositive: {},
        idealNegative: {},
        finalRows: [],
      }
    }

    // Determine alternatives source: use saved results if available, otherwise candidate answers
    let rowsX: MatrixRow[] = []

    if (resultsList.length > 0) {
      rowsX = resultsList.map((res, idx) => {
        const detailMap = new Map<string, number>()
        for (const d of res.details || []) {
          if (d.indikatorId) {
            detailMap.set(d.indikatorId, toNumber(d.nilaiAwal))
          }
        }

        const values: Record<string, number> = {}
        for (const ind of indicators) {
          values[ind.id] = detailMap.get(ind.id) ?? 0
        }

        const nama =
          res.pengajuan?.mustahik?.namaLengkap ||
          res.pengajuan?.user?.name ||
          `Alternatif ${idx + 1}`
        const nik = res.pengajuan?.mustahik?.nik || '-'

        return {
          key: res.id,
          pengajuanId: res.pengajuanId,
          nama,
          nik,
          status: res.status,
          ranking: res.ranking,
          preferensi: toNumber(res.nilaiPreferensi),
          values,
        }
      })
    } else if (candidatesList.length > 0) {
      rowsX = candidatesList.map((cand, idx) => {
        const ansMap = new Map<string, number>()
        for (const j of cand.jawaban || []) {
          if (j.indikatorId) {
            ansMap.set(j.indikatorId, toNumber(j.nilai))
          }
        }

        const values: Record<string, number> = {}
        for (const ind of indicators) {
          values[ind.id] = ansMap.get(ind.id) ?? 0
        }

        const nama = cand.mustahik?.namaLengkap || `Kandidat ${idx + 1}`
        const nik = cand.mustahik?.nik || '-'

        return {
          key: cand.id,
          pengajuanId: cand.id,
          nama,
          nik,
          status: cand.status,
          values,
        }
      })
    }

    if (rowsX.length === 0) {
      return {
        matrixX: [],
        divisors: {},
        matrixR: [],
        matrixY: [],
        idealPositive: {},
        idealNegative: {},
        finalRows: [],
      }
    }

    // Divisors for Normalization: sqrt(sum(x_ij^2))
    const divisors: Record<string, number> = {}
    for (const ind of indicators) {
      const sumSquares = rowsX.reduce((sum, row) => {
        const val = row.values[ind.id] || 0
        return sum + val * val
      }, 0)
      divisors[ind.id] = Math.sqrt(sumSquares)
    }

    // Matrix R: r_ij = x_ij / divisor
    const matrixR: MatrixRow[] = rowsX.map((row) => {
      const values: Record<string, number> = {}
      for (const ind of indicators) {
        const div = divisors[ind.id] || 0
        values[ind.id] = div > 0 ? (row.values[ind.id] || 0) / div : 0
      }
      return { ...row, values }
    })

    // Matrix Y: y_ij = w_j * r_ij
    const matrixY: MatrixRow[] = matrixR.map((row) => {
      const values: Record<string, number> = {}
      for (const ind of indicators) {
        values[ind.id] = (row.values[ind.id] || 0) * ind.bobot
      }
      return { ...row, values }
    })

    // Positive and Negative Ideal Solutions (A+ & A-)
    const idealPositive: Record<string, number> = {}
    const idealNegative: Record<string, number> = {}

    for (const ind of indicators) {
      const colValues = matrixY.map((row) => row.values[ind.id] || 0)
      if (colValues.length === 0) {
        idealPositive[ind.id] = 0
        idealNegative[ind.id] = 0
        continue
      }

      if (ind.tipe === 'NEGATIF') {
        // COST: A+ = min, A- = max
        idealPositive[ind.id] = Math.min(...colValues)
        idealNegative[ind.id] = Math.max(...colValues)
      } else {
        // BENEFIT / POSITIF: A+ = max, A- = min
        idealPositive[ind.id] = Math.max(...colValues)
        idealNegative[ind.id] = Math.min(...colValues)
      }
    }

    // Distance D+, Distance D-, Preference V_i
    const calculatedRows: MatrixRow[] = matrixY.map((row) => {
      let sumPos = 0
      let sumNeg = 0

      for (const ind of indicators) {
        const yVal = row.values[ind.id] || 0
        const aPos = idealPositive[ind.id] || 0
        const aNeg = idealNegative[ind.id] || 0

        sumPos += Math.pow(yVal - aPos, 2)
        sumNeg += Math.pow(yVal - aNeg, 2)
      }

      const dPlus = Math.sqrt(sumPos)
      const dMinus = Math.sqrt(sumNeg)
      const denom = dPlus + dMinus
      const preferensi = denom > 0 ? dMinus / denom : 0.5

      return {
        ...row,
        dPlus,
        dMinus,
        preferensi,
      }
    })

    // Sort by preference descending to rank
    const sorted = [...calculatedRows].sort((a, b) => (b.preferensi ?? 0) - (a.preferensi ?? 0))
    const finalRows = sorted.map((item, idx) => ({
      ...item,
      ranking: item.ranking || idx + 1,
      status:
        item.status === 'LAYAK_DIDANAI' || item.status === 'TIDAK_DIDANAI'
          ? item.status
          : (item.preferensi ?? 0) >= 0.5
          ? 'LAYAK_DIDANAI'
          : 'TIDAK_DIDANAI',
    }))

    return {
      matrixX: rowsX,
      divisors,
      matrixR,
      matrixY,
      idealPositive,
      idealNegative,
      finalRows,
    }
  }, [indicators, resultsList, candidatesList])

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span>Memuat data TOPSIS...</span>
        </div>
      </div>
    )
  }

  const hasData = topsisCalculation.matrixX.length > 0

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Proses Perhitungan TOPSIS
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Perhitungan Decision Support System (SPK) menggunakan 5 Kriteria yang terbagi menjadi 15 Indikator terukur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadData()}
            disabled={loading || processing}
            className="border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat Ulang
          </Button>

          <Button
            type="button"
            onClick={() => void handleProcess()}
            disabled={processing || (candidatesList.length === 0 && resultsList.length === 0)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4 fill-white" />
            )}
            Hitung TOPSIS
          </Button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-4">
          <div className="flex gap-3 items-center">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/40 p-4">
          <div className="flex gap-3 items-center">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      {/* INFO CARD & CRITERIA METRICS */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Struktur Pembobotan TOPSIS Maqashid Syariah
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Bobot masing-masing dari 5 Kriteria didistribusikan secara proporsional ke 15 Indikator kuesioner.
                Indikator <strong>ID6 (Risiko Tekanan Kebutuhan/Utang)</strong> bertipe <strong>COST (Negatif)</strong>, sedangkan 14 indikator lainnya bertipe <strong>BENEFIT (Positif)</strong>.
              </p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Total Kriteria</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{kriteriaList.length} Dimensi</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Total Indikator</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{indicators.length} Item</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Kandidat Mustahik</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{topsisCalculation.matrixX.length} Orang</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Status TOPSIS</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {resultsList.length > 0 ? 'Tersimpan' : 'Siap Dihitung'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP NAVIGATION TABS */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 md:grid-cols-4">
        {[
          { id: 1, label: '1. Matriks Keputusan (X)' },
          { id: 2, label: '2. Normalisasi (R)' },
          { id: 3, label: '3. Normalisasi Terbobot (Y)' },
          { id: 4, label: '4. Solusi Ideal & Ranking' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveStep(tab.id)}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
              activeStep === tab.id
                ? 'bg-white dark:bg-slate-900 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {!hasData && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="py-16 text-center">
            <Info className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
              Belum Ada Data Alternatif TOPSIS
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Pastikan pengajuan mustahik telah diverifikasi (status <em>Lolos Verifikasi</em>) dan kuesioner asesmen telah diisi secara lengkap.
            </p>
          </CardContent>
        </Card>
      )}

      {/* STEP 1: MATRIKS KEPUTUSAN (X) & CRITERIA WEIGHTS */}
      {hasData && activeStep === 1 && (
        <div className="space-y-6">
          {/* Bobot Indikator Reference Table */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-600" />
                Daftar 15 Indikator & Bobot Penilaian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                      <th className="py-2.5 px-3 text-left">Kode</th>
                      <th className="py-2.5 px-3 text-left">Kriteria (Dimensi)</th>
                      <th className="py-2.5 px-3 text-left">Nama Indikator</th>
                      <th className="py-2.5 px-3 text-center">Tipe Indikator</th>
                      <th className="py-2.5 px-3 text-right">Bobot Indikator (wj)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((ind) => (
                      <tr key={ind.id} className="border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                        <td className="py-2.5 px-3 font-bold text-green-700 dark:text-green-400">{ind.kode}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                          {ind.kriteriaKode} - {ind.kriteriaNama}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{ind.nama}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              ind.tipe === 'NEGATIF'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900'
                                : 'bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-400 border border-green-200 dark:border-green-900'
                            }`}
                          >
                            {ind.tipe === 'NEGATIF' ? 'COST (Negatif)' : 'BENEFIT (Positif)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {formatDecimal(ind.bobot, 4)} ({formatPercent(ind.bobot)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Matriks X Table */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Matriks Keputusan (X)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-3 text-left font-semibold text-slate-600 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800">
                        Mustahik
                      </th>
                      {indicators.map((ind) => (
                        <th key={ind.id} className="py-3 px-2 text-center font-bold text-slate-700 dark:text-slate-200">
                          <div>{ind.kode}</div>
                          <div className="text-[10px] font-normal text-slate-400">{ind.kriteriaKode}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topsisCalculation.matrixX.map((row) => (
                      <tr key={row.key} className="border-b last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900">
                          <p className="truncate max-w-[200px]">{row.nama}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{row.nik}</p>
                        </td>
                        {indicators.map((ind) => (
                          <td key={ind.id} className="py-3 px-2 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                            {row.values[ind.id] ?? 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2: MATRIKS NORMALISASI (R) */}
      {hasData && activeStep === 2 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Matriks Normalisasi (R)</span>
              <span className="text-xs font-normal text-slate-500">Rumus: r_ij = x_ij / √(Σ x_kj²)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-3 text-left font-semibold text-slate-600 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800">
                      Mustahik
                    </th>
                    {indicators.map((ind) => (
                      <th key={ind.id} className="py-3 px-2 text-center font-bold text-slate-700 dark:text-slate-200">
                        {ind.kode}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topsisCalculation.matrixR.map((row) => (
                    <tr key={row.key} className="border-b last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900">
                        <p className="truncate max-w-[200px]">{row.nama}</p>
                      </td>
                      {indicators.map((ind) => (
                        <td key={ind.id} className="py-3 px-2 text-center font-mono text-slate-700 dark:text-slate-300">
                          {formatDecimal(row.values[ind.id], 4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Divisor row */}
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-200 sticky left-0 bg-slate-50 dark:bg-slate-800">
                      Pembagi √(Σx²)
                    </td>
                    {indicators.map((ind) => (
                      <td key={ind.id} className="py-3 px-2 text-center font-mono text-green-700 dark:text-green-400">
                        {formatDecimal(topsisCalculation.divisors[ind.id], 4)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: MATRIKS NORMALISASI TERBOBOT (Y) */}
      {hasData && activeStep === 3 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Matriks Normalisasi Terbobot (Y)</span>
              <span className="text-xs font-normal text-slate-500">Rumus: y_ij = w_j × r_ij</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-3 text-left font-semibold text-slate-600 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800">
                      Mustahik
                    </th>
                    {indicators.map((ind) => (
                      <th key={ind.id} className="py-3 px-2 text-center font-bold text-slate-700 dark:text-slate-200">
                        <div>{ind.kode}</div>
                        <div className="text-[10px] font-normal text-slate-400">w={formatDecimal(ind.bobot, 3)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topsisCalculation.matrixY.map((row) => (
                    <tr key={row.key} className="border-b last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900">
                        <p className="truncate max-w-[200px]">{row.nama}</p>
                      </td>
                      {indicators.map((ind) => (
                        <td key={ind.id} className="py-3 px-2 text-center font-mono text-slate-700 dark:text-slate-300">
                          {formatDecimal(row.values[ind.id], 4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Ideal Positive (A+) */}
                  <tr className="bg-green-50/60 dark:bg-green-950/30 font-bold border-t-2 border-green-200 dark:border-green-900">
                    <td className="py-3 px-3 text-green-800 dark:text-green-300 sticky left-0 bg-green-50 dark:bg-green-950">
                      Solusi Ideal A+
                    </td>
                    {indicators.map((ind) => (
                      <td key={ind.id} className="py-3 px-2 text-center font-mono text-green-700 dark:text-green-300">
                        {formatDecimal(topsisCalculation.idealPositive[ind.id], 4)}
                      </td>
                    ))}
                  </tr>
                  {/* Ideal Negative (A-) */}
                  <tr className="bg-red-50/60 dark:bg-red-950/30 font-bold border-t border-red-200 dark:border-red-900">
                    <td className="py-3 px-3 text-red-800 dark:text-red-300 sticky left-0 bg-red-50 dark:bg-red-950">
                      Solusi Ideal A-
                    </td>
                    {indicators.map((ind) => (
                      <td key={ind.id} className="py-3 px-2 text-center font-mono text-red-700 dark:text-red-300">
                        {formatDecimal(topsisCalculation.idealNegative[ind.id], 4)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: SOLUSI IDEAL, JARAK, PREFERENSI & RANKING */}
      {hasData && activeStep === 4 && (
        <div className="space-y-6">
          {/* Solusi Ideal Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Solusi Ideal Positif (A+)
                </CardTitle>
                <p className="text-xs text-slate-500">Maksimum untuk BENEFIT, Minimum untuk COST (ID6)</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                  {indicators.map((ind) => (
                    <div key={ind.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p className="text-[11px] font-semibold text-slate-500">{ind.kode}</p>
                      <p className="text-xs font-mono font-bold text-green-700 dark:text-green-400 mt-0.5">
                        {formatDecimal(topsisCalculation.idealPositive[ind.id], 4)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                  Solusi Ideal Negatif (A-)
                </CardTitle>
                <p className="text-xs text-slate-500">Minimum untuk BENEFIT, Maksimum untuk COST (ID6)</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                  {indicators.map((ind) => (
                    <div key={ind.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p className="text-[11px] font-semibold text-slate-500">{ind.kode}</p>
                      <p className="text-xs font-mono font-bold text-red-700 dark:text-red-400 mt-0.5">
                        {formatDecimal(topsisCalculation.idealNegative[ind.id], 4)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Ranking & Separation Measures Table */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Hasil Akhir Perhitungan Nilai Preferensi (Vi) & Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs">
                      <th className="py-3 px-4 text-center font-bold">Ranking</th>
                      <th className="py-3 px-4 text-left font-bold">Mustahik</th>
                      <th className="py-3 px-4 text-center font-bold">NIK</th>
                      <th className="py-3 px-4 text-center font-bold">Jarak D+</th>
                      <th className="py-3 px-4 text-center font-bold">Jarak D-</th>
                      <th className="py-3 px-4 text-center font-bold">Nilai Preferensi (Vi)</th>
                      <th className="py-3 px-4 text-center font-bold">Status Kelayakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topsisCalculation.finalRows.map((row) => (
                      <tr key={row.key} className="border-b last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              row.ranking === 1
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400'
                                : row.ranking === 2
                                ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 ring-2 ring-slate-300'
                                : row.ranking === 3
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            #{row.ranking}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {row.nama}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                          {row.nik}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                          {formatDecimal(row.dPlus, 4)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                          {formatDecimal(row.dMinus, 4)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-base text-green-700 dark:text-green-400">
                          {formatDecimal(row.preferensi, 4)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              row.status === 'LAYAK_DIDANAI' || (row.preferensi ?? 0) >= 0.5
                                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {row.status === 'LAYAK_DIDANAI' || (row.preferensi ?? 0) >= 0.5
                              ? 'LAYAK DIDANAI'
                              : 'TIDAK DIDANAI'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ProcessTopsisPage