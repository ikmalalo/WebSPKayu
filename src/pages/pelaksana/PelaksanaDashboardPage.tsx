import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  MapPin,
  RefreshCw,
  Phone,
  FileCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getTugasPelaksana, type TugasPelaksanaItem, type StatsTugasPelaksana } from '@/lib/pelaksanaApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PelaksanaDashboardPage() {
  const { currentUser } = useAuth()
  const [tugas, setTugas] = useState<TugasPelaksanaItem[]>([])
  const [stats, setStats] = useState<StatsTugasPelaksana>({
    total: 0,
    ditugaskan: 0,
    sedangSurvei: 0,
    selesai: 0,
    dibatalkan: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getTugasPelaksana()
      setTugas(res.tugas || [])
      if (res.stats) {
        setStats(res.stats)
      }
    } catch (err: any) {
      console.error('LOAD DASHBOARD PELAKSANA ERROR:', err)
      setError(err.message || 'Gagal memuat data penugasan survei.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const pendingTasks = tugas.filter((t) => t.status === 'DITUGASKAN' || t.status === 'SEDANG_SURVEI')

  return (
    <div className="space-y-6">
      {/* Banner Sambutan */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-2">
              Panel Survei Lapangan
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Selamat Datang, {currentUser?.name || 'Petugas Pelaksana'}
            </h1>
            <p className="mt-1 text-sm text-emerald-100 max-w-xl">
              Halaman ini menampilkan tugas survei calon mustahik yang ditugaskan khusus untuk Anda.
              Lakukan verifikasi kondisi langsung di lapangan dan inputkan hasil penilaian kriteria.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => loadData()}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Segarkan
            </Button>
            <Link to="/pelaksana/tugas">
              <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold shadow-sm">
                Lihat Semua Tugas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Statistik Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Ditugaskan</p>
              <p className="text-2xl font-bold text-slate-800">{stats.ditugaskan}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Sedang Disurvei</p>
              <p className="text-2xl font-bold text-slate-800">{stats.sedangSurvei}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Survei Selesai</p>
              <p className="text-2xl font-bold text-slate-800">{stats.selesai}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Tanggung Jawab</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Tugas Yang Perlu Segera Disurvei */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Tugas Aktif yang Perlu Disurvei
            </h2>
            <p className="text-xs text-slate-500">
              Daftar mustahik berstatus Ditugaskan atau Sedang Survei
            </p>
          </div>
          <Link to="/pelaksana/tugas" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Buka Semua &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-sm">Memuat daftar tugas survei...</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada survei tertunda</p>
            <p className="text-xs text-slate-400 mt-1">
              Semua tugas survei lapangan telah selesai dikerjakan atau belum ada penugasan baru dari Admin.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingTasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm sm:text-base">
                      {t.mustahik?.namaLengkap}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                        t.status === 'SEDANG_SURVEI'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status === 'SEDANG_SURVEI' ? 'SEDANG DISURVEI' : 'DITUGASKAN'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="font-mono text-slate-600">NIK: {t.mustahik?.nik}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {t.mustahik?.alamat}, {t.mustahik?.kelurahan}, {t.mustahik?.kecamatan}
                    </span>
                    {t.mustahik?.noHp && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {t.mustahik?.noHp}
                      </span>
                    )}
                  </div>

                  {t.catatan && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 px-2.5 py-1 rounded border border-slate-100 inline-block">
                      Catatan Admin: {t.catatan}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link to={`/pelaksana/survei/${t.id}`}>
                    <Button
                      size="sm"
                      className={`text-xs font-semibold ${
                        t.status === 'SEDANG_SURVEI'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {t.status === 'SEDANG_SURVEI' ? 'Lanjutkan Survei' : 'Mulai Survei'}
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

