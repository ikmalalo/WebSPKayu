import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { mockPengajuan, mockDataMustahik, mockKriteria, mockSubKriteria } from '@/data/mockData'
import { formatDate, formatCurrency, formatNIK } from '@/lib/utils'

export function DetailVerifikasiPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const pengajuan = mockPengajuan.find((p) => p.id === id) || mockPengajuan[0]
  const mustahik = mockDataMustahik.find((m) => m.id === pengajuan.mustahikId) || mockDataMustahik[0]

  const [catatan, setCatatan] = useState(pengajuan.catatan || '')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleVerifikasi = (action: 'lolos' | 'perlu_perbaikan' | 'ditolak') => {
    setLoadingAction(action)
    setTimeout(() => {
      setLoadingAction(null)
      navigate('/admin/verifikasi')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Verifikasi: ${mustahik.namaLengkap}`}>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/verifikasi')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </PageHeader>

      {/* Mustahik overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{mustahik.namaLengkap}</CardTitle>
              <p className="text-xs text-slate-400 font-mono mt-0.5">NIK: {formatNIK(mustahik.nik)}</p>
            </div>
            <StatusBadge status={pengajuan.status} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Pekerjaan</p>
            <p className="font-semibold text-slate-800">{mustahik.pekerjaan}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Penghasilan</p>
            <p className="font-semibold text-slate-800">{formatCurrency(mustahik.penghasilan)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Jumlah Tanggungan</p>
            <p className="font-semibold text-slate-800">{mustahik.jumlahTanggungan} Orang</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status Rumah</p>
            <p className="font-semibold text-slate-800 capitalize">{mustahik.statusRumah.replace('_', ' ')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Jawaban Kuesioner verification */}
      <Card>
        <CardHeader>
          <CardTitle>Validasi Jawaban Kuesioner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockKriteria.map((k, i) => {
            const subList = mockSubKriteria.filter((s) => s.kriteriaId === k.id)
            const sampleAnswers = ['sk3', 'sk9', 'sk14', 'sk19', 'sk25']
            const selectedSk = subList.find((s) => s.id === sampleAnswers[i]) || subList[0]

            return (
              <div key={k.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{k.kode} - {k.nama}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedSk.keterangan}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    Nilai: {selectedSk.nilai}
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Verifikasi Form Action */}
      <Card className="border-green-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <CardTitle>Keputusan Verifikasi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Catatan Verifikator / Admin" htmlFor="catatan" hint="Berikan penjelasan jika memerlukan perbaikan atau penolakan">
            <Textarea
              id="catatan"
              placeholder="Masukkan catatan verifikasi di sini..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
            />
          </FormField>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              disabled={loadingAction !== null}
              onClick={() => handleVerifikasi('lolos')}
            >
              {loadingAction === 'lolos' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Lolos Verifikasi
            </Button>

            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 flex-1"
              disabled={loadingAction !== null}
              onClick={() => handleVerifikasi('perlu_perbaikan')}
            >
              {loadingAction === 'perlu_perbaikan' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              )}
              Perlu Perbaikan
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              disabled={loadingAction !== null}
              onClick={() => handleVerifikasi('ditolak')}
            >
              {loadingAction === 'ditolak' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Tolak Pengajuan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
