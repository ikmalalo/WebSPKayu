import { Link } from 'react-router-dom'
import { FileText, ClipboardList, Eye, CheckCircle, Clock, AlertCircle, ChevronRight, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { currentUser, mockPengajuan } from '@/data/mockData'
import { getProgressSteps, formatDate } from '@/lib/utils'

const userPengajuan = mockPengajuan[0] // Ahmad Fauzi's submission

const progressSteps = [
  { step: 1, label: 'Pengajuan', icon: FileText },
  { step: 2, label: 'Menunggu Verifikasi', icon: Clock },
  { step: 3, label: 'Verifikasi', icon: ClipboardList },
  { step: 4, label: 'Lolos Verifikasi', icon: CheckCircle },
  { step: 5, label: 'Proses TOPSIS', icon: ClipboardList },
  { step: 6, label: 'Hasil Akhir', icon: CheckCircle },
]

export function UserDashboardPage() {
  const currentStep = getProgressSteps(userPengajuan.status)
  const progressPercent = Math.round((currentStep / 6) * 100)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-green-600 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-100 text-sm">Selamat datang kembali,</p>
            <h1 className="text-xl font-bold mt-0.5">{currentUser.name}</h1>
            <p className="text-green-200 text-sm mt-2">
              Pantau status pengajuan mustahik Anda di sini.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-50">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Status Pengajuan</p>
            <StatusBadge status={userPengajuan.status} className="mt-1" />
          </div>
        </div>
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-green-50">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Verifikasi</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              {userPengajuan.tanggalVerifikasi ? formatDate(userPengajuan.tanggalVerifikasi) : '-'}
            </p>
          </div>
        </div>
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-50">
            <Eye className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Tanggal Pengajuan</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              {formatDate(userPengajuan.tanggalPengajuan)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Pengajuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Langkah {currentStep} dari 6</span>
              <span>{progressPercent}% selesai</span>
            </div>
            <Progress value={progressPercent} />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
            {progressSteps.map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step < currentStep
                      ? 'bg-green-600 text-white'
                      : step === currentStep
                      ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <p className={`text-xs text-center leading-tight ${step <= currentStep ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current status detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detail Pengajuan Terkini</CardTitle>
            <StatusBadge status={userPengajuan.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">ID Pengajuan</p>
              <p className="font-semibold text-slate-900 font-mono text-xs mt-0.5">#{userPengajuan.id.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-slate-500">Tanggal Pengajuan</p>
              <p className="font-semibold text-slate-900 text-xs mt-0.5">{formatDate(userPengajuan.tanggalPengajuan)}</p>
            </div>
          </div>

          {userPengajuan.catatan && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-1">Catatan Admin:</p>
              <p className="text-sm text-slate-700">{userPengajuan.catatan}</p>
            </div>
          )}

          {userPengajuan.status === 'LAYAK_DIDANAI' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Selamat! Anda Dinyatakan Layak</p>
                <p className="text-xs text-green-700 mt-0.5">Pengajuan Anda telah melalui proses TOPSIS dan dinyatakan layak mendapatkan bantuan.</p>
              </div>
            </div>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link to="/pantau-hasil">
              Lihat Detail Hasil <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { to: '/pengajuan', icon: FileText, label: 'Lihat Pengajuan', color: 'text-blue-600', bg: 'bg-blue-50' },
              { to: '/kuesioner', icon: ClipboardList, label: 'Isi Kuesioner', color: 'text-purple-600', bg: 'bg-purple-50' },
              { to: '/pantau-hasil', icon: Eye, label: 'Pantau Hasil', color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ to, icon: Icon, label, color, bg }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all group"
              >
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">{label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-green-500" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
