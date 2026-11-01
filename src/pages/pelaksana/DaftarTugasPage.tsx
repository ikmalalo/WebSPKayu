import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  RefreshCw,
  ClipboardList,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  AlertCircle,
} from 'lucide-react'
import { getTugasPelaksana, type TugasPelaksanaItem, type StatsTugasPelaksana } from '@/lib/pelaksanaApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export function DaftarTugasPage() {
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
  const [statusFilter, setStatusFilter] = useState('SEMUA')
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getTugasPelaksana({
        status: statusFilter,
        search: search.trim() || undefined,
      })
      setTugas(res.tugas || [])
      if (res.stats) {
        setStats(res.stats)
      }
    } catch (err: any) {
      console.error('LOAD TUGAS PELAKSANA ERROR:', err)
      setError(err.message || 'Gagal mengambil daftar tugas survei.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadData])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DITUGASKAN':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">DITUGASKAN</span>
      case 'SEDANG_SURVEI':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800">SEDANG SURVEI</span>
      case 'SELESAI':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">SELESAI</span>
      case 'DIBATALKAN':
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-100 text-rose-800">DIBATALKAN</span>
      default:
        return <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Daftar Tugas Survei Lapangan
          </h1>
          <p className="text-sm text-slate-500">
            Kelola dan lakukan penginputan hasil survei langsung dari lapangan untuk mustahik tugas Anda.
          </p>
        </div>
        <Button
          onClick={() => loadData()}
          variant="outline"
          size="sm"
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari berdasarkan nama, NIK, alamat, atau kelurahan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Status Tugas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEMUA">Semua Status</SelectItem>
                <SelectItem value="DITUGASKAN">Ditugaskan ({stats.ditugaskan})</SelectItem>
                <SelectItem value="SEDANG_SURVEI">Sedang Survei ({stats.sedangSurvei})</SelectItem>
                <SelectItem value="SELESAI">Selesai ({stats.selesai})</SelectItem>
                <SelectItem value="DIBATALKAN">Dibatalkan ({stats.dibatalkan})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* List Tugas */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-3 text-emerald-600" />
            <p className="text-sm font-medium">Memuat daftar tugas survei...</p>
          </div>
        ) : tugas.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-700">Tidak ada tugas survei ditemukan</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== 'SEMUA'
                ? 'Tidak ada data yang sesuai dengan kata kunci pencarian atau filter yang dipilih.'
                : 'Saat ini belum ada data calon mustahik yang ditugaskan kepada Anda oleh Admin.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tugas.map((t) => (
              <div
                key={t.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Mustahik */}
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 text-base">
                      {t.mustahik?.namaLengkap}
                    </span>
                    {getStatusBadge(t.status)}
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      NIK: {t.mustahik?.nik}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {t.mustahik?.alamat}, Kel. {t.mustahik?.kelurahan}, Kec. {t.mustahik?.kecamatan}, {t.mustahik?.kota}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{t.mustahik?.noHp || 'Tidak ada nomor telepon'}</span>
                    </div>
                  </div>

                  {t.catatan && (
                    <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs text-amber-800">
                      <span className="font-semibold">Catatan Admin:</span> {t.catatan}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Ditugaskan: {new Date(t.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    {t.tanggalSelesai && (
                      <span className="text-emerald-600 font-medium">
                        Diselesaikan: {new Date(t.tanggalSelesai).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="shrink-0 flex items-center gap-2">
                  {t.status === 'SELESAI' ? (
                    <Link to={`/pelaksana/survei/${t.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-semibold text-slate-700">
                        <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                        Lihat Hasil Survei
                      </Button>
                    </Link>
                  ) : t.status === 'DIBATALKAN' ? (
                    <span className="text-xs font-semibold text-rose-500 px-3 py-1.5 rounded bg-rose-50 border border-rose-100">
                      Tugas Dibatalkan
                    </span>
                  ) : (
                    <Link to={`/pelaksana/survei/${t.id}`}>
                      <Button
                        size="sm"
                        className={`text-xs font-semibold text-white ${
                          t.status === 'SEDANG_SURVEI'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {t.status === 'SEDANG_SURVEI' ? 'Lanjutkan Survei' : 'Mulai Survei'}
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

