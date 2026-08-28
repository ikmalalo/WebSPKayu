import { useState, useEffect, useMemo } from 'react'
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Save,
  RefreshCw,
  Sparkles,
  Scale,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  getAdminTopsisConfig,
  updateAdminTopsisConfig,
  type AdminTopsisConfigKriteria,
  type AdminTopsisConfigIndikator,
} from '@/lib/adminApi'

interface FormIndicatorState {
  id: string
  kriteriaId: string
  kode: string
  nama: string
  tipe: 'POSITIF' | 'NEGATIF'
  bobotPercent: number // 0 - 100
  bobotOtomatisPercent: number // 0 - 100
}

export function KonfigurasiTopsisPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [metode, setMetode] = useState<'OTOMATIS' | 'MANUAL'>('OTOMATIS')
  const [kriteriaList, setKriteriaList] = useState<AdminTopsisConfigKriteria[]>([])
  const [indicatorState, setIndicatorState] = useState<Record<string, FormIndicatorState>>({})

  // Load Configuration from API
  const loadConfig = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAdminTopsisConfig()

      setMetode(data.metodePembobotan)
      setKriteriaList(data.kriteria)

      const stateMap: Record<string, FormIndicatorState> = {}
      for (const k of data.kriteria) {
        for (const ind of k.indikator) {
          const autoPercent = Number((ind.bobotOtomatis * 100).toFixed(2))
          const currentPercent =
            ind.bobotManual !== null
              ? Number((ind.bobotManual * 100).toFixed(2))
              : autoPercent

          stateMap[ind.id] = {
            id: ind.id,
            kriteriaId: k.id,
            kode: ind.kode,
            nama: ind.nama,
            tipe: ind.tipe,
            bobotPercent: currentPercent,
            bobotOtomatisPercent: autoPercent,
          }
        }
      }
      setIndicatorState(stateMap)
    } catch (err: unknown) {
      console.error('LOAD TOPSIS CONFIG ERROR:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat konfigurasi TOPSIS.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadConfig()
  }, [])

  // Handle Indicator Weight Change
  const handleWeightChange = (indicatorId: string, valStr: string) => {
    const parsed = parseFloat(valStr)
    const val = Number.isFinite(parsed) ? Math.max(0, parsed) : 0

    setIndicatorState((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        bobotPercent: val,
      },
    }))
  }

  // Handle Indicator Tipe Change
  const handleTipeChange = (indicatorId: string, tipe: 'POSITIF' | 'NEGATIF') => {
    setIndicatorState((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        tipe,
      },
    }))
  }

  // Calculation & Validation per Criteria
  const validationSummary = useMemo(() => {
    let allValid = true
    let totalWeightAll = 0

    const kriteriaValidation = kriteriaList.map((k) => {
      const targetPercent = Number((k.bobot * 100).toFixed(2))
      let allocatedPercent = 0

      for (const ind of k.indikator) {
        const item = indicatorState[ind.id]
        if (metode === 'OTOMATIS') {
          allocatedPercent += item ? item.bobotOtomatisPercent : 0
        } else {
          allocatedPercent += item ? item.bobotPercent : 0
        }
      }

      // Round to 2 decimals
      allocatedPercent = Number(allocatedPercent.toFixed(2))
      const diff = Number((targetPercent - allocatedPercent).toFixed(2))
      const isValid = metode === 'OTOMATIS' || Math.abs(diff) <= 0.05

      if (!isValid) {
        allValid = false
      }

      totalWeightAll += allocatedPercent

      return {
        kriteriaId: k.id,
        kode: k.kode,
        nama: k.nama,
        targetPercent,
        allocatedPercent,
        diff,
        isValid,
      }
    })

    totalWeightAll = Number(totalWeightAll.toFixed(2))

    return {
      allValid,
      totalWeightAll,
      kriteriaValidation,
    }
  }, [kriteriaList, indicatorState, metode])

  // Save Configuration
  const handleSave = async () => {
    if (!validationSummary.allValid && metode === 'MANUAL') {
      setError('Harap pastikan total alokasi bobot pada setiap kriteria sudah sesuai 100%.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccessMessage('')

      const payloadIndicators = Object.values(indicatorState).map((item) => ({
        id: item.id,
        bobot: metode === 'MANUAL' ? item.bobotPercent / 100 : undefined,
        tipe: item.tipe,
      }))

      await updateAdminTopsisConfig({
        metodePembobotan: metode,
        indikator: payloadIndicators,
      })

      setSuccessMessage('Konfigurasi TOPSIS berhasil disimpan dan akan digunakan pada perhitungan selanjutnya.')
      await loadConfig()
    } catch (err: unknown) {
      console.error('SAVE TOPSIS CONFIG ERROR:', err)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi TOPSIS.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span>Memuat konfigurasi TOPSIS...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Konfigurasi TOPSIS"
        description="Atur metode pembobotan dan tipe indikator penilaian untuk proses SPK TOPSIS."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void loadConfig()}
            disabled={loading || saving}
            className="border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat Ulang
          </Button>

          <Button
            onClick={() => void handleSave()}
            disabled={saving || (!validationSummary.allValid && metode === 'MANUAL')}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Konfigurasi
              </>
            )}
          </Button>
        </div>
      </PageHeader>

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

      {/* INFO BANNER */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Pemberitahuan Data Historis
            </p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Perubahan pembobotan dan tipe indikator di bawah ini <strong>hanya akan diterapkan pada proses perhitungan TOPSIS berikutnya</strong>. Hasil perhitungan TOPSIS yang telah tersimpan sebelumnya tidak akan berubah secara otomatis.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* METODE PEMBOBOTAN SELECTION */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Scale className="w-5 h-5 text-green-600" />
            Metode Pembobotan Indikator
          </CardTitle>
          <p className="text-xs text-slate-500">
            Pilih cara sistem membagi bobot kriteria ke masing-masing indikator kuesioner.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OPTION 1: OTOMATIS */}
            <div
              onClick={() => setMetode('OTOMATIS')}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                metode === 'OTOMATIS'
                  ? 'border-green-600 bg-green-50/70 dark:bg-green-950/30 ring-2 ring-green-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      metode === 'OTOMATIS'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Otomatis / Bagi Rata
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bobot indikator dihitung otomatis: <code className="text-green-700 dark:text-green-400 font-mono">W_kriteria / N_indikator</code>
                    </p>
                  </div>
                </div>
                <div className="h-5 w-5 rounded-full border flex items-center justify-center border-slate-300 dark:border-slate-600">
                  {metode === 'OTOMATIS' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* OPTION 2: MANUAL */}
            <div
              onClick={() => setMetode('MANUAL')}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                metode === 'MANUAL'
                  ? 'border-green-600 bg-green-50/70 dark:bg-green-950/30 ring-2 ring-green-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      metode === 'MANUAL'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Manual / Kustom Bobot
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Admin menentukan bobot masing-masing indikator dengan validasi realtime.
                    </p>
                  </div>
                </div>
                <div className="h-5 w-5 rounded-full border flex items-center justify-center border-slate-300 dark:border-slate-600">
                  {metode === 'MANUAL' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CRITERIA & INDICATORS LIST */}
      <div className="space-y-5">
        {kriteriaList.map((kriteria, kIdx) => {
          const val = validationSummary.kriteriaValidation[kIdx]
          const targetPercent = val ? val.targetPercent : Number((kriteria.bobot * 100).toFixed(2))
          const allocatedPercent = val ? val.allocatedPercent : 0
          const diff = val ? val.diff : 0
          const isValid = val ? val.isValid : true

          return (
            <Card
              key={kriteria.id}
              className={`border transition-all ${
                !isValid && metode === 'MANUAL'
                  ? 'border-red-300 dark:border-red-900 bg-red-50/10'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {/* HEADER KRITERIA */}
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                        {kriteria.kode}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {kriteria.nama}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Bobot Kriteria: <strong>{targetPercent}%</strong> ({kriteria.indikator.length} Indikator)
                    </p>
                  </div>

                  {/* STATUS BADGE PER KRITERIA */}
                  <div className="flex items-center gap-3">
                    {metode === 'OTOMATIS' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Otomatis ({targetPercent}% / {kriteria.indikator.length} = {(targetPercent / kriteria.indikator.length).toFixed(2)}%)
                      </span>
                    ) : isValid ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-400 border border-green-200 dark:border-green-900">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid (Terpakai: {allocatedPercent}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {diff > 0
                          ? `Kurang ${diff}% (Terpakai: ${allocatedPercent}% / ${targetPercent}%)`
                          : `Lebih ${Math.abs(diff)}% (Terpakai: ${allocatedPercent}% / ${targetPercent}%)`}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* TABLE INDIKATOR */}
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="pb-2 text-left w-16">Kode</th>
                        <th className="pb-2 text-left">Nama Indikator Asesmen</th>
                        <th className="pb-2 text-center w-48">Tipe Indikator</th>
                        <th className="pb-2 text-right w-44">
                          {metode === 'MANUAL' ? 'Bobot (%)' : 'Bobot Otomatis'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {kriteria.indikator.map((ind) => {
                        const state = indicatorState[ind.id]
                        const currentTipe = state ? state.tipe : ind.tipe
                        const currentVal = state
                          ? metode === 'MANUAL'
                            ? state.bobotPercent
                            : state.bobotOtomatisPercent
                          : 0

                        return (
                          <tr key={ind.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 font-mono font-bold text-green-700 dark:text-green-400 text-xs">
                              {ind.kode}
                            </td>
                            <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                              {ind.nama}
                            </td>
                            <td className="py-3 text-center">
                              {/* TIPE TOGGLE (BENEFIT VS COST) */}
                              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                                <button
                                  type="button"
                                  onClick={() => handleTipeChange(ind.id, 'POSITIF')}
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                    currentTipe === 'POSITIF'
                                      ? 'bg-green-600 text-white shadow-xs'
                                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                  }`}
                                >
                                  BENEFIT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTipeChange(ind.id, 'NEGATIF')}
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                    currentTipe === 'NEGATIF'
                                      ? 'bg-red-600 text-white shadow-xs'
                                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                  }`}
                                >
                                  COST
                                </button>
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              {metode === 'MANUAL' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max={targetPercent}
                                    value={state ? state.bobotPercent : 0}
                                    onChange={(e) => handleWeightChange(ind.id, e.target.value)}
                                    className="w-24 text-right font-mono font-bold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                  />
                                  <span className="text-xs font-bold text-slate-500">%</span>
                                </div>
                              ) : (
                                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs">
                                  {currentVal.toFixed(2)}%
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* STICKY BOTTOM BAR SUMMARY */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Metode Aktif</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {metode === 'OTOMATIS' ? 'Otomatis (Bagi Rata)' : 'Manual (Kustom Bobot)'}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Akumulasi Bobot</p>
              <p
                className={`text-sm font-mono font-bold ${
                  validationSummary.allValid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {validationSummary.totalWeightAll}% / 100%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => void handleSave()}
              disabled={saving || (!validationSummary.allValid && metode === 'MANUAL')}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan Konfigurasi...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Konfigurasi TOPSIS
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KonfigurasiTopsisPage
