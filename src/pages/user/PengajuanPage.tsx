import { Link } from 'react-router-dom'
import { FileText, Plus, Clock, ChevronRight, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockPengajuan, mockDataMustahik } from '@/data/mockData'
import { formatDate, formatNIK } from '@/lib/utils'

const userPengajuan = mockPengajuan[0]
const userMustahik = mockDataMustahik[0]

export function PengajuanPage() {
  const hasExisting = !!userPengajuan

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengajuan Mustahik"
        description="Kelola pengajuan Anda sebagai calon penerima bantuan"
      >
        {!hasExisting && (
          <Button asChild>
            <Link to="/pengajuan/form">
              <Plus className="w-4 h-4 mr-2" />
              Buat Pengajuan
            </Link>
          </Button>
        )}
      </PageHeader>

      {hasExisting ? (
        <div className="space-y-4">
          {/* Pengajuan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{userPengajuan.namaLengkap}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    NIK: {formatNIK(userPengajuan.nik)}
                  </p>
                </div>
                <StatusBadge status={userPengajuan.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">ID Pengajuan</p>
                  <p className="font-semibold text-slate-900 font-mono text-xs mt-0.5">
                    #{userPengajuan.id.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Tanggal Pengajuan</p>
                  <p className="font-semibold text-slate-900 text-xs mt-0.5">
                    {formatDate(userPengajuan.tanggalPengajuan)}
                  </p>
                </div>
                {userPengajuan.tanggalVerifikasi && (
                  <div>
                    <p className="text-slate-500 text-xs">Tanggal Verifikasi</p>
                    <p className="font-semibold text-slate-900 text-xs mt-0.5">
                      {formatDate(userPengajuan.tanggalVerifikasi)}
                    </p>
                  </div>
                )}
              </div>

              {userPengajuan.catatan && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Catatan Admin:</p>
                      <p className="text-sm text-amber-700 mt-0.5">{userPengajuan.catatan}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/pantau-hasil">
                    <Clock className="w-4 h-4 mr-2" />
                    Pantau Hasil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Diri Mustahik</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/pengajuan/form" className="text-xs text-green-600 flex items-center gap-1">
                    Edit Data <ChevronRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Nama Lengkap', value: userMustahik.namaLengkap },
                  { label: 'NIK', value: formatNIK(userMustahik.nik) },
                  { label: 'Tempat Lahir', value: userMustahik.tempatLahir },
                  { label: 'Pekerjaan', value: userMustahik.pekerjaan },
                  { label: 'Alamat', value: `${userMustahik.alamat}, ${userMustahik.kota}` },
                  { label: 'Status Rumah', value: userMustahik.statusRumah.replace('_', ' ') },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-medium text-slate-800 mt-0.5 text-xs capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Empty state */
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Belum Ada Pengajuan</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Anda belum memiliki pengajuan. Klik tombol di bawah untuk memulai proses pengajuan mustahik.
            </p>
            <Button asChild className="mt-6">
              <Link to="/pengajuan/form">
                <Plus className="w-4 h-4 mr-2" />
                Mulai Pengajuan
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
