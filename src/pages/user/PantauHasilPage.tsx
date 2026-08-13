import { Link } from 'react-router-dom'
import { Trophy, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockTopsisResults } from '@/data/mockData'
import { formatDate } from '@/lib/utils'
import { usePengajuan } from '@/context/PengajuanContext'
const statusTimeline = [
  { label: 'Pengajuan Dibuat', date: '10 Apr 2024', done: true },
  { label: 'Menunggu Verifikasi', date: '10 Apr 2024', done: true },
  { label: 'Verifikasi Selesai', date: '15 Apr 2024', done: true },
  { label: 'Proses TOPSIS', date: '01 Mei 2024', done: true },
  { label: 'Hasil Akhir', date: '01 Mei 2024', done: true, final: true },
]

export function PantauHasilPage() {
  const { pengajuan: userPengajuan } = usePengajuan();
  const userTopsis = mockTopsisResults[0];
  const isLayak = userPengajuan?.status === 'LAYAK_DIDANAI';
  const isProcessed = userPengajuan && ['LAYAK_DIDANAI', 'TIDAK_DIDANAI', 'DIPROSES_TOPSIS'].includes(userPengajuan.status);
  if (!userPengajuan) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pantau Hasil Pengajuan"
          description="Lihat status dan hasil akhir pengajuan Anda"
        />

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Belum Ada Pengajuan untuk Dipantau</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Anda belum melakukan pengajuan bantuan. Silakan buat pengajuan terlebih dahulu untuk memantau prosesnya.
            </p>
            <Button asChild className="mt-6">
              <Link to="/pengajuan/form">
                Mulai Pengajuan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pantau Hasil Pengajuan"
        description="Lihat status dan hasil akhir pengajuan Anda"
      />

      {/* Status card */}
      <Card className={isLayak ? 'border-green-300' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isLayak ? 'bg-green-100' : 'bg-slate-100'}`}>
              {isLayak
                ? <CheckCircle className="w-8 h-8 text-green-600" />
                : <XCircle className="w-8 h-8 text-slate-400" />
              }
            </div>
            <div className="flex-1">
              <StatusBadge status={userPengajuan.status} className="mb-2" />
              <h2 className="text-lg font-bold text-slate-900">
                {isLayak ? 'Selamat! Anda Dinyatakan Layak' : 'Pengajuan Anda Sedang Diproses'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isLayak
                  ? 'Pengajuan Anda telah melalui proses verifikasi dan perhitungan TOPSIS. Anda dinyatakan layak untuk mendapatkan bantuan.'
                  : 'Pengajuan Anda sedang dalam tahap proses. Silakan pantau secara berkala.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOPSIS Result */}
      {isProcessed && userTopsis && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <CardTitle>Hasil Penilaian TOPSIS</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-3xl font-bold text-amber-600">#{userTopsis.ranking}</div>
                <p className="text-xs text-amber-700 mt-1 font-medium">Ranking</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600">{userTopsis.nilaiPreferensi.toFixed(3)}</div>
                <p className="text-xs text-green-700 mt-1 font-medium">Nilai Preferensi</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className={`text-lg font-bold ${isLayak ? 'text-green-600' : 'text-red-500'}`}>
                  {isLayak ? 'LAYAK' : 'TIDAK LAYAK'}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Status</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Proses TOPSIS dilakukan pada {formatDate(userTopsis.tanggalProses)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {statusTimeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                    item.done
                      ? item.final && isLayak
                        ? 'border-green-500 bg-green-500'
                        : item.final
                        ? 'border-red-400 bg-red-400'
                        : 'border-green-500 bg-green-500'
                      : 'border-slate-300 bg-white'
                  }`} />
                  {i < statusTimeline.length - 1 && (
                    <div className={`w-0.5 h-8 ${item.done ? 'bg-green-400' : 'bg-slate-200'}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${item.done ? 'text-slate-800' : 'text-slate-400'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail link */}
      <Button asChild variant="outline" className="w-full">
        <Link to="/pantau-hasil/detail">
          Lihat Detail Lengkap <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  )
}
