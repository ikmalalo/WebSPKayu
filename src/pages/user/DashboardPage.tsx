import { Link } from 'react-router-dom'
import { FileText, ClipboardList, Eye, CheckCircle, Clock, AlertCircle, ChevronRight, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { mockPengajuan } from '@/data/mockData'
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

import { useAuth } from '@/context/AuthContext'

export function UserDashboardPage() {
  const { currentUser } = useAuth()
  const userPengajuan = mockPengajuan[0]
  const currentStep = userPengajuan ? getProgressSteps(userPengajuan.status) : 0
  const progressPercent = Math.round((currentStep / 6) * 100)

  const displayName = currentUser?.name || 'Ikmal Ali'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-green-600 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-100 text-sm">Selamat datang kembali,</p>
            <h1 className="text-xl font-bold mt-0.5">{displayName}</h1>
            <p className="text-green-200 text-sm mt-2">
              Pantau status pengajuan mustahik Anda di sini.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {displayName.charAt(0)}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status Pengajuan</p>
            {userPengajuan ? (
              <StatusBadge status={userPengajuan.status} className="mt-1" />
            ) : (
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">Belum Ada Pengajuan</p>
            )}
          </div>
        </div>
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/60">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Verifikasi</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {userPengajuan?.tanggalVerifikasi ? formatDate(userPengajuan.tanggalVerifikasi) : '-'}
            </p>
          </div>
        </div>
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60">
            <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Pengajuan</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {userPengajuan ? formatDate(userPengajuan.tanggalPengajuan) : '-'}
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
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
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
                    userPengajuan && step < currentStep
                      ? 'bg-green-600 text-white'
                      : userPengajuan && step === currentStep
                      ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 ring-2 ring-green-400 dark:ring-green-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {userPengajuan && step < currentStep ? '✓' : step}
                </div>
                <p className={`text-xs text-center leading-tight ${userPengajuan && step <= currentStep ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
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
            {userPengajuan ? (
              <StatusBadge status={userPengajuan.status} />
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">Kosong</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {userPengajuan ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">ID Pengajuan</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs mt-0.5">#{userPengajuan.id.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Tanggal Pengajuan</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">{formatDate(userPengajuan.tanggalPengajuan)}</p>
                </div>
              </div>

              {userPengajuan.catatan && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Catatan Admin:</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{userPengajuan.catatan}</p>
                </div>
              )}

              {userPengajuan.status === 'LAYAK_DIDANAI' && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">Selamat! Anda Dinyatakan Layak</p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">Pengajuan Anda telah melalui proses TOPSIS dan dinyatakan layak mendapatkan bantuan.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Anda belum membuat pengajuan bantuan apapun.</p>
              <Button asChild className="mt-4">
                <Link to="/pengajuan/form">
                  Mulai Pengajuan Baru <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
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
              { to: '/pengajuan', icon: FileText, label: 'Lihat Pengajuan', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60' },
              { to: '/kuesioner', icon: ClipboardList, label: 'Isi Kuesioner', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60' },
              { to: '/pantau-hasil', icon: Eye, label: 'Pantau Hasil', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/60' },
            ].map(({ to, icon: Icon, label, color, bg }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-green-300 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-slate-800/40 transition-all group"
              >
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-green-700 dark:group-hover:text-green-400">{label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto group-hover:text-green-500" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
