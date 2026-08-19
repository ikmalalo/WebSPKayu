import { Link } from 'react-router-dom'
import {
  FileText,
  ClipboardList,
  Eye,
  CheckCircle,
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/StatusBadge'

import { mockPengajuan } from '@/data/mockData'
import {
  getProgressSteps,
  formatDate,
} from '@/lib/utils'

import { useAuth } from '@/context/AuthContext'
import { usePengajuan } from '@/context/PengajuanContext'

const progressSteps = [
  {
    step: 1,
    label: 'Pengajuan',
    icon: FileText,
  },
  {
    step: 2,
    label: 'Menunggu Verifikasi',
    icon: Clock,
  },
  {
    step: 3,
    label: 'Verifikasi',
    icon: ClipboardList,
  },
  {
    step: 4,
    label: 'Lolos Verifikasi',
    icon: CheckCircle,
  },
  {
    step: 5,
    label: 'Proses TOPSIS',
    icon: ClipboardList,
  },
  {
    step: 6,
    label: 'Hasil Akhir',
    icon: CheckCircle,
  },
]

export function UserDashboardPage() {
  const { currentUser } = useAuth()

  const {
    pengajuan: contextPengajuan,
  } = usePengajuan()

  /*
   * ==================================================
   * CARI PENGAJUAN USER YANG SEDANG LOGIN
   * ==================================================
   *
   * Context bisa saja berisi data lama dari localStorage.
   * Karena itu WAJIB cek userId.
   */

  const contextUserPengajuan =
    contextPengajuan &&
    currentUser &&
    contextPengajuan.userId ===
      currentUser.id
      ? contextPengajuan
      : null

  /*
   * Kalau tidak ada dari context,
   * cari dari mock data berdasarkan userId.
   */

  const mockUserPengajuan =
    currentUser
      ? mockPengajuan.find(
          (pengajuan) =>
            pengajuan.userId ===
            currentUser.id
        )
      : null

  const userPengajuan =
    contextUserPengajuan ||
    mockUserPengajuan

  /*
   * ==================================================
   * PROGRESS
   * ==================================================
   */

  const currentStep =
    userPengajuan
      ? getProgressSteps(
          userPengajuan.status
        )
      : 0

  const progressPercent =
    userPengajuan
      ? Math.round(
          (currentStep / 6) * 100
        )
      : 0

  const displayName =
    currentUser?.name ||
    'Pengguna'

  return (
    <div className="space-y-6">
      {/* GREETING */}
      <div className="bg-green-600 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-100 text-sm">
              Selamat datang kembali,
            </p>

            <h1 className="text-xl font-bold mt-0.5">
              {displayName}
            </h1>

            <p className="text-green-200 text-sm mt-2">
              Pantau status pengajuan
              mustahik Anda di sini.
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {displayName
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>
      </div>

      {/* MAQZIS Info */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 via-teal-50/20 to-green-50/30 dark:from-slate-900 dark:to-slate-900/50 p-5 shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 pointer-events-none">
          <svg className="w-24 h-24 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3z" />
          </svg>
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4a4.5 4.5 0 00-4.5 4.5V12h9V8.5A4.5 4.5 0 0012 4z" />
              <path d="M12 2v2" />
              <path d="M4 10v11M3 10h2M20 10v11M19 10h2" />
              <path d="M6 12v9h12v-9" />
              <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
              MAQZIS <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(Maqashid-Based Zakat Information System)</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
              Sistem pendukung keputusan dan monitoring berbasis <strong>Maqashid Syariah</strong> yang dirancang untuk membantu lembaga zakat dalam melakukan seleksi, penyaluran, pendampingan, monitoring, dan evaluasi dampak zakat produktif secara terintegrasi.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* STATUS */}
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Status Pengajuan
            </p>

            {userPengajuan ? (
              <StatusBadge
                status={
                  userPengajuan.status
                }
                className="mt-1"
              />
            ) : (
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                Belum Ada Pengajuan
              </p>
            )}
          </div>
        </div>

        {/* VERIFIKASI */}
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/60">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifikasi
            </p>

            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {userPengajuan?.tanggalVerifikasi
                ? formatDate(
                    userPengajuan.tanggalVerifikasi
                  )
                : '-'}
            </p>
          </div>
        </div>

        {/* TANGGAL PENGAJUAN */}
        <div className="stats-card flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60">
            <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tanggal Pengajuan
            </p>

            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {userPengajuan?.tanggalPengajuan
                ? formatDate(
                    userPengajuan.tanggalPengajuan
                  )
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <Card>
        <CardHeader>
          <CardTitle>
            Progress Pengajuan
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>
                Langkah {currentStep} dari 6
              </span>

              <span>
                {progressPercent}% selesai
              </span>
            </div>

            <Progress
              value={progressPercent}
            />
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
            {progressSteps.map(
              ({
                step,
                label,
                icon: Icon,
              }) => (
                <div
                  key={step}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      userPengajuan &&
                      step < currentStep
                        ? 'bg-green-600 text-white'
                        : userPengajuan &&
                            step === currentStep
                          ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 ring-2 ring-green-400 dark:ring-green-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {userPengajuan &&
                    step < currentStep ? (
                      '✓'
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <p
                    className={`text-xs text-center leading-tight ${
                      userPengajuan &&
                      step <= currentStep
                        ? 'text-slate-700 dark:text-slate-200 font-medium'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {label}
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* DETAIL */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Detail Pengajuan Terkini
            </CardTitle>

            {userPengajuan ? (
              <StatusBadge
                status={
                  userPengajuan.status
                }
              />
            ) : (
              <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                Kosong
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {userPengajuan ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    ID Pengajuan
                  </p>

                  <p className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs mt-0.5">
                    #
                    {userPengajuan.id.toUpperCase()}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Tanggal Pengajuan
                  </p>

                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">
                    {formatDate(
                      userPengajuan.tanggalPengajuan
                    )}
                  </p>
                </div>
              </div>

              {userPengajuan.catatan && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Catatan Admin:
                  </p>

                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {userPengajuan.catatan}
                  </p>
                </div>
              )}

              {userPengajuan.status ===
                'LAYAK_DIDANAI' && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Selamat! Anda Dinyatakan Layak
                    </p>

                    <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                      Pengajuan Anda telah
                      melalui proses TOPSIS
                      dan dinyatakan layak
                      mendapatkan bantuan.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Anda belum membuat pengajuan
                bantuan apapun.
              </p>

              <Button
                asChild
                className="mt-4"
              >
                <Link to="/pengajuan/form">
                  Mulai Pengajuan Baru
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>
            Aksi Cepat
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                to: '/pengajuan',
                icon: FileText,
                label: 'Lihat Pengajuan',
                color:
                  'text-blue-600 dark:text-blue-400',
                bg:
                  'bg-blue-50 dark:bg-blue-950/60',
              },
              {
                to: '/kuesioner',
                icon: ClipboardList,
                label: 'Isi Kuesioner',
                color:
                  'text-purple-600 dark:text-purple-400',
                bg:
                  'bg-purple-50 dark:bg-purple-950/60',
              },
              {
                to: '/pantau-hasil',
                icon: Eye,
                label: 'Pantau Hasil',
                color:
                  'text-green-600 dark:text-green-400',
                bg:
                  'bg-green-50 dark:bg-green-950/60',
              },
            ].map(
              ({
                to,
                icon: Icon,
                label,
                color,
                bg,
              }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-green-300 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-slate-800/40 transition-all group"
                >
                  <div
                    className={`p-2 rounded-lg ${bg}`}
                  >
                    <Icon
                      className={`w-4 h-4 ${color}`}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-green-700 dark:group-hover:text-green-400">
                    {label}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto group-hover:text-green-500" />
                </Link>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
