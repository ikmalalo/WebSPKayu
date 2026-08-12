import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, Play, CheckCircle, Info, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockDataMustahik, mockKriteria } from '@/data/mockData'

export function ProcessTopsisPage() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processed, setProcessed] = useState(true)

  const handleProcess = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setProcessed(true)
      navigate('/admin/ranking')
    }, 1500)
  }

  // Sample matrices for display
  const mustahiks = mockDataMustahik
  const kriteria = mockKriteria

  const decisionMatrix = [
    [3, 4, 3, 4, 5],
    [2, 3, 4, 3, 5],
    [4, 2, 3, 3, 4],
    [2, 5, 4, 4, 5],
    [1, 1, 3, 5, 5],
  ]

  const normalizedMatrix = [
    [0.514, 0.542, 0.408, 0.478, 0.447],
    [0.343, 0.406, 0.544, 0.359, 0.447],
    [0.686, 0.271, 0.408, 0.359, 0.358],
    [0.343, 0.677, 0.544, 0.478, 0.447],
    [0.171, 0.135, 0.408, 0.598, 0.447],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proses Perhitungan TOPSIS"
        description="Simulasi dan eksekusi perhitungan TOPSIS 12 tahapan secara dinamis"
      >
        <Button
          onClick={handleProcess}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Hitung & Generate Ranking
        </Button>
      </PageHeader>

      {/* Info Card */}
      <Card className="border-green-300 bg-green-50/40">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Perhitungan TOPSIS Transparan</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Semua tahap mulai dari pembentukan Matriks Keputusan (X), Normalisasi (R), Normalisasi Terbobot (Y), Solusi Ideal (A+ / A-), Jarak (D+ / D-), hingga Nilai Preferensi (Ci) ditampilkan secara detail di bawah ini.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="matriks" className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="matriks">1. Matriks Keputusan (X)</TabsTrigger>
          <TabsTrigger value="normalisasi">2. Normalisasi (R)</TabsTrigger>
          <TabsTrigger value="terbobot">3. Terbobot (Y)</TabsTrigger>
          <TabsTrigger value="solusi">4. Solusi & Jarak</TabsTrigger>
        </TabsList>

        {/* Tab 1: Matriks Keputusan */}
        <TabsContent value="matriks">
          <Card>
            <CardHeader>
              <CardTitle>Matriks Keputusan (X)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Mustahik</th>
                    {kriteria.map((k) => (
                      <th key={k.id}>{k.kode} ({k.nama})</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mustahiks.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="font-semibold text-slate-800">{m.namaLengkap}</td>
                      {decisionMatrix[idx].map((val, cIdx) => (
                        <td key={cIdx} className="font-mono text-center">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Normalisasi */}
        <TabsContent value="normalisasi">
          <Card>
            <CardHeader>
              <CardTitle>Matriks Ternormalisasi (R)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Mustahik</th>
                    {kriteria.map((k) => (
                      <th key={k.id}>{k.kode}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mustahiks.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="font-semibold text-slate-800">{m.namaLengkap}</td>
                      {normalizedMatrix[idx].map((val, cIdx) => (
                        <td key={cIdx} className="font-mono text-center">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Terbobot */}
        <TabsContent value="terbobot">
          <Card>
            <CardHeader>
              <CardTitle>Matriks Normalisasi Terbobot (Y)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Mustahik</th>
                    {kriteria.map((k) => (
                      <th key={k.id}>{k.kode} (w={(k.bobot * 100)}%)</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mustahiks.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="font-semibold text-slate-800">{m.namaLengkap}</td>
                      {normalizedMatrix[idx].map((val, cIdx) => (
                        <td key={cIdx} className="font-mono text-center">
                          {(val * kriteria[cIdx].bobot).toFixed(4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Solusi Ideal & Jarak */}
        <TabsContent value="solusi">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Solusi Ideal (A+ & A-)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-bold text-green-800">Solusi Ideal Positif (A+)</p>
                  <p className="font-mono text-xs text-green-700 mt-1">[0.0514, 0.1693, 0.1088, 0.0897, 0.0358]</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-bold text-amber-800">Solusi Ideal Negatif (A-)</p>
                  <p className="font-mono text-xs text-amber-700 mt-1">[0.2058, 0.0338, 0.0816, 0.0539, 0.0447]</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jarak Ideal & Nilai Preferensi (Ci)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="data-table w-full text-xs">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>D+</th>
                      <th>D-</th>
                      <th>Ci (Preferensi)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold">Ahmad Fauzi</td>
                      <td className="font-mono">0.0312</td>
                      <td className="font-mono">0.1432</td>
                      <td className="font-mono font-bold text-green-600">0.8210</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Siti Rahayu</td>
                      <td className="font-mono">0.0451</td>
                      <td className="font-mono">0.1298</td>
                      <td className="font-mono font-bold text-green-600">0.7430</td>
                    </tr>
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
