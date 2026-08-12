import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Phone, MapPin, Briefcase, Home, ShieldCheck, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockDataMustahik, mockPengajuan, mockVerifikasi } from '@/data/mockData'
import { formatCurrency, formatDate, formatNIK, getJenisKelaminLabel, getStatusPernikahanLabel, getKondisiRumahLabel, getStatusRumahLabel } from '@/lib/utils'

export function DetailMustahikPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const mustahik = mockDataMustahik.find((m) => m.id === id || m.userId === id) || mockDataMustahik[0]
  const pengajuan = mockPengajuan.find((p) => p.mustahikId === mustahik.id) || mockPengajuan[0]
  const verifikasi = mockVerifikasi.find((v) => v.pengajuanId === pengajuan.id)

  return (
    <div className="space-y-6">
      <PageHeader title="Detail Data Mustahik">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/mustahik')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </PageHeader>

      {/* Header Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
                {mustahik.namaLengkap.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{mustahik.namaLengkap}</h2>
                  <StatusBadge status={pengajuan.status} />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">NIK: {formatNIK(mustahik.nik)}</p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to={`/admin/verifikasi/${pengajuan.id}`}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verifikasi Pengajuan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identitas Diri */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <CardTitle>Identitas Diri</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400">Tempat, Tanggal Lahir</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.tempatLahir}, {formatDate(mustahik.tanggalLahir)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Jenis Kelamin</p>
                <p className="font-medium text-slate-800 mt-0.5">{getJenisKelaminLabel(mustahik.jenisKelamin)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status Pernikahan</p>
                <p className="font-medium text-slate-800 mt-0.5">{getStatusPernikahanLabel(mustahik.statusPernikahan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Nomor HP</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.noHp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alamat */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <CardTitle>Alamat Tempat Tinggal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Alamat Lengkap</p>
              <p className="font-medium text-slate-800 mt-0.5">{mustahik.alamat}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400">Kelurahan</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.kelurahan}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Kecamatan</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.kecamatan}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Kota / Kabupaten</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.kota}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Provinsi</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.provinsi}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ekonomi */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-green-600" />
              <CardTitle>Kondisi Ekonomi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400">Pekerjaan Utama</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.pekerjaan}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Penghasilan per Bulan</p>
                <p className="font-medium text-slate-800 mt-0.5">{formatCurrency(mustahik.penghasilan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Jumlah Tanggungan</p>
                <p className="font-medium text-slate-800 mt-0.5">{mustahik.jumlahTanggungan} Orang</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Kepemilikan Aset</p>
                <p className="font-medium text-slate-800 mt-0.5 capitalize">{mustahik.kepemilikanAset.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tempat Tinggal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-green-600" />
              <CardTitle>Tempat Tinggal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400">Status Kepemilikan</p>
                <p className="font-medium text-slate-800 mt-0.5">{getStatusRumahLabel(mustahik.statusRumah)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Kondisi Fisik</p>
                <p className="font-medium text-slate-800 mt-0.5">{getKondisiRumahLabel(mustahik.kondisiRumah)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verifikasi History */}
      {verifikasi && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <CardTitle>Riwayat Verifikasi Admin</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-800">Diverifikasi oleh: {verifikasi.adminName}</span>
                <span className="text-xs text-slate-400">{formatDate(verifikasi.tanggalVerifikasi)}</span>
              </div>
              <p className="text-xs text-slate-600">{verifikasi.catatan}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
