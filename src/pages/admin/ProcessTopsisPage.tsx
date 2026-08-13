import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, Play, CheckCircle, Info, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockDataMustahik, mockKriteria, mockPengajuan, mockTopsisResults, mockStats } from '@/data/mockData'
import type { TopsisResult, SummaryStats } from '@/types'

export function ProcessTopsisPage() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Get score vector for each mustahik based on criteria logic
  const getScoreVector = (m: any) => {
    // C1: Penghasilan (Cost)
    let c1 = 5;
    if (m.penghasilan < 500000) c1 = 1;
    else if (m.penghasilan <= 1000000) c1 = 2;
    else if (m.penghasilan <= 1500000) c1 = 3;
    else if (m.penghasilan <= 2000000) c1 = 4;
    else c1 = 5;

    // C2: Jumlah Tanggungan (Benefit)
    let c2 = 1;
    if (m.jumlahTanggungan === 1) c2 = 1;
    else if (m.jumlahTanggungan === 2) c2 = 2;
    else if (m.jumlahTanggungan === 3) c2 = 3;
    else if (m.jumlahTanggungan === 4) c2 = 4;
    else if (m.jumlahTanggungan >= 5) c2 = 5;

    // C3: Kondisi Rumah (Benefit - Poorer condition gets higher score)
    let c3 = 3;
    if (m.kondisiRumah === 'sangat_baik') c3 = 1;
    else if (m.kondisiRumah === 'baik') c3 = 2;
    else if (m.kondisiRumah === 'sedang' || m.kondisiRumah === 'cukup') c3 = 3;
    else if (m.kondisiRumah === 'buruk') c3 = 4;
    else if (m.kondisiRumah === 'sangat_buruk') c3 = 5;

    // C4: Status Pekerjaan (Benefit)
    let c4 = 5;
    const pek = String(m.pekerjaan).toLowerCase();
    if (pek.includes('pns') || pek.includes('bumn') || pek.includes('pemerintah')) c4 = 1;
    else if (pek.includes('swasta') || pek.includes('karyawan')) c4 = 2;
    else if (pek.includes('wiraswasta') || pek.includes('dagang') || pek.includes('toko')) c4 = 3;
    else if (pek.includes('buruh') || pek.includes('harian') || pek.includes('tani') || pek.includes('bangunan')) c4 = 4;
    else c4 = 5;

    // C5: Kepemilikan Aset (Cost)
    let c5 = 5;
    if (m.kepemilikanAset === 'ada') c5 = 2;
    else c5 = 5;

    return [c1, c2, c3, c4, c5];
  };

  // Filter mustahik alternatives for calculation
  const lolosNikSet = new Set(
    mockPengajuan
      .filter(p => p.status === 'LOLOS_VERIFIKASI')
      .map(p => p.nik)
  );

  let targetMustahiks = mockDataMustahik.filter(m => lolosNikSet.has(m.nik));
  if (targetMustahiks.length < 2) {
    // Fallback if not enough mustahiks have been approved
    targetMustahiks = mockDataMustahik;
  }

  const kriteria = mockKriteria;

  // -- DYNAMIC TOPSIS CALCULATION --
  // Step 1: Decision Matrix (X)
  const decisionMatrix = targetMustahiks.map(m => getScoreVector(m));

  // Step 2: Normalization Denominators
  const mCount = targetMustahiks.length;
  const cCount = kriteria.length;
  const denominators = Array(cCount).fill(0);
  for (let j = 0; j < cCount; j++) {
    let sumSq = 0;
    for (let i = 0; i < mCount; i++) {
      sumSq += Math.pow(decisionMatrix[i][j], 2);
    }
    denominators[j] = Math.sqrt(sumSq) || 1;
  }

  // Step 3: Normalized Matrix (R)
  const normalizedMatrix = decisionMatrix.map(row => 
    row.map((val, j) => Number((val / denominators[j]).toFixed(4)))
  );

  // Step 4: Weighted Normalized Matrix (Y)
  const weightedMatrix = normalizedMatrix.map(row =>
    row.map((val, j) => Number((val * kriteria[j].bobot).toFixed(4)))
  );

  // Step 5: Positive & Negative Ideal Solutions (A+ / A-)
  const APlus = Array(cCount).fill(0);
  const AMinus = Array(cCount).fill(0);
  for (let j = 0; j < cCount; j++) {
    const columnValues = weightedMatrix.map(row => row[j]);
    const tipe = kriteria[j].tipe;
    if (tipe === 'benefit') {
      APlus[j] = Math.max(...columnValues);
      AMinus[j] = Math.min(...columnValues);
    } else {
      APlus[j] = Math.min(...columnValues);
      AMinus[j] = Math.max(...columnValues);
    }
  }

  // Step 6: Separation & Preference (Ci)
  const calculationResults = targetMustahiks.map((m, i) => {
    let dPlusSum = 0;
    let dMinusSum = 0;
    for (let j = 0; j < cCount; j++) {
      dPlusSum += Math.pow(weightedMatrix[i][j] - APlus[j], 2);
      dMinusSum += Math.pow(weightedMatrix[i][j] - AMinus[j], 2);
    }
    const dPlus = Number(Math.sqrt(dPlusSum).toFixed(4));
    const dMinus = Number(Math.sqrt(dMinusSum).toFixed(4));
    const preference = (dMinus + dPlus) === 0 ? 0 : Number((dMinus / (dPlus + dMinus)).toFixed(4));

    return {
      mustahikId: m.id,
      namaLengkap: m.namaLengkap,
      dPlus,
      dMinus,
      preference
    };
  });

  const sortedResults = [...calculationResults].sort((a, b) => b.preference - a.preference);

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      // Write results to mockTopsisResults
      const resultsToSave: TopsisResult[] = sortedResults.map((res, index) => {
        const matchingPengajuan = mockPengajuan.find(p => p.mustahikId === res.mustahikId);
        return {
          id: `tr_${index + 1}_${Math.random().toString(36).substring(2, 6)}`,
          pengajuanId: matchingPengajuan?.id || 'p_default',
          mustahikId: res.mustahikId,
          namaLengkap: res.namaLengkap,
          nilaiPreferensi: res.preference,
          ranking: index + 1,
          status: res.preference >= 0.60 ? 'LAYAK_DIDANAI' : 'TIDAK_DIDANAI',
          tanggalProses: new Date().toISOString().split('T')[0]
        };
      });

      mockTopsisResults.length = 0;
      mockTopsisResults.push(...resultsToSave);

      // Recalculate summary stats
      const layakCount = resultsToSave.filter(r => r.status === 'LAYAK_DIDANAI').length;
      const tidakLayakCount = resultsToSave.filter(r => r.status === 'TIDAK_DIDANAI').length;
      const totalMustahik = mockDataMustahik.length;
      const waitingCount = mockPengajuan.filter(p => ['MENUNGGU_VERIFIKASI', 'SEDANG_DIVERIFIKASI'].includes(p.status)).length;
      const verifiedCount = mockPengajuan.filter(p => ['LOLOS_VERIFIKASI', 'PERLU_PERBAIKAN', 'DITOLAK'].includes(p.status)).length;

      mockStats.totalMustahik = totalMustahik;
      mockStats.pengajuanBaru = mockPengajuan.filter(p => p.status === 'MENUNGGU_VERIFIKASI').length;
      mockStats.menungguVerifikasi = waitingCount;
      mockStats.sudahDiverifikasi = verifiedCount;
      mockStats.layakDidanai = layakCount;
      mockStats.tidakDidanai = tidakLayakCount;

      navigate('/admin/ranking');
    }, 1500);
  };

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
      <Card className="border-green-300 dark:border-green-900 bg-green-50/40 dark:bg-green-950/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Perhitungan TOPSIS Transparan</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Semua tahap mulai dari pembentukan Matriks Keputusan (X), Normalisasi (R), Normalisasi Terbobot (Y), Solusi Ideal (A+ / A-), Jarak (D+ / D-), hingga Nilai Preferensi (Ci) ditampilkan secara detail di bawah ini.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="matriks" className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="matriks" className="dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100">1. Matriks Keputusan (X)</TabsTrigger>
          <TabsTrigger value="normalisasi" className="dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100">2. Normalisasi (R)</TabsTrigger>
          <TabsTrigger value="terbobot" className="dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100">3. Terbobot (Y)</TabsTrigger>
          <TabsTrigger value="solusi" className="dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100">4. Solusi & Jarak</TabsTrigger>
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
                  {targetMustahiks.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="font-semibold text-slate-800 dark:text-slate-100">{m.namaLengkap}</td>
                      {decisionMatrix[idx].map((val, cIdx) => (
                        <td key={cIdx} className="font-mono text-center text-slate-800 dark:text-slate-200">{val}</td>
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
                  {targetMustahiks.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="font-semibold text-slate-800 dark:text-slate-100">{m.namaLengkap}</td>
                      {normalizedMatrix[idx].map((val, cIdx) => (
                        <td key={cIdx} className="font-mono text-center text-slate-800 dark:text-slate-200">{val}</td>
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
                  {targetMustahiks.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="font-semibold text-slate-800 dark:text-slate-100">{m.namaLengkap}</td>
                      {normalizedMatrix[idx].map((val, cIdx) => (
                        <td key={cIdx} className="font-mono text-center text-slate-800 dark:text-slate-200">
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
                <div className="p-3 bg-green-50 dark:bg-slate-900 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-bold text-green-800 dark:text-green-400">Solusi Ideal Positif (A+)</p>
                  <p className="font-mono text-xs text-green-700 dark:text-green-300 mt-1">
                    [{APlus.map(v => v.toFixed(4)).join(', ')}]
                  </p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="font-bold text-amber-800 dark:text-amber-400">Solusi Ideal Negatif (A-)</p>
                  <p className="font-mono text-xs text-amber-700 dark:text-amber-300 mt-1">
                    [{AMinus.map(v => v.toFixed(4)).join(', ')}]
                  </p>
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
                    {sortedResults.map((row) => (
                      <tr key={row.mustahikId}>
                        <td className="font-semibold text-slate-800 dark:text-slate-100">{row.namaLengkap}</td>
                        <td className="font-mono text-slate-800 dark:text-slate-200">{row.dPlus.toFixed(4)}</td>
                        <td className="font-mono text-slate-800 dark:text-slate-200">{row.dMinus.toFixed(4)}</td>
                        <td className="font-mono font-bold text-green-600 dark:text-green-400">{row.preference.toFixed(4)}</td>
                      </tr>
                    ))}
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
