import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Clock, ChevronRight, Info, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate, formatNIK } from '@/lib/utils'
import { usePengajuan } from '@/context/PengajuanContext'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import type { Pengajuan, DataMustahik } from '@/types'

const API_URL = 'http://localhost:5000/api'

function adaptPengajuan(p: any): Pengajuan {
  return {
    id: p.id,
    userId: p.userId,
    mustahikId: p.mustahikId,
    namaLengkap: p.mustahik?.namaLengkap || '',
    nik: p.mustahik?.nik || '',
    status: p.status,
    tanggalPengajuan: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
    tanggalVerifikasi: p.verifications?.[0]?.createdAt
      ? new Date(p.verifications[0].createdAt).toISOString().split('T')[0]
      : undefined,
    catatan: p.verifications?.[0]?.catatan || undefined,
  }
}

export function PengajuanPage() {
  const { token } = useAuth()
  const { pengajuan: contextPengajuan, setPengajuan } = usePengajuan()
  const [pengajuan, setPengajuanLocal] = useState<Pengajuan | null>(contextPengajuan)
  const [mustahik, setMustahik] = useState<DataMustahik | null>(null)
  const [loading, setLoading] = useState(true)

  const authHeaders = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        // Ambil daftar pengajuan user
        const [pengajuanRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/pengajuan/me`, { headers: authHeaders }),
          axios.get(`${API_URL}/user/profile`, { headers: authHeaders }),
        ])

        const list: any[] = pengajuanRes.data?.data?.pengajuan || []
        if (list.length > 0) {
          const adapted = adaptPengajuan(list[0])
          setPengajuanLocal(adapted)
          setPengajuan(adapted)
        } else {
          setPengajuanLocal(null)
          setPengajuan(null)
        }

        const mustahikData = profileRes.data?.data?.user?.mustahik
        if (mustahikData) {
          setMustahik({
            id: mustahikData.id,
            userId: mustahikData.userId,
            nik: mustahikData.nik || '',
            namaLengkap: mustahikData.namaLengkap || '',
            tempatLahir: mustahikData.tempatLahir || '',
            tanggalLahir: mustahikData.tanggalLahir
              ? new Date(mustahikData.tanggalLahir).toISOString().split('T')[0]
              : '',
            jenisKelamin: mustahikData.jenisKelamin || 'L',
            alamat: mustahikData.alamat || '',
            kelurahan: mustahikData.kelurahan || '',
            kecamatan: mustahikData.kecamatan || '',
            kota: mustahikData.kota || '',
            provinsi: mustahikData.provinsi || '',
            noHp: mustahikData.noHp || '',
            statusPernikahan: mustahikData.statusPernikahan || 'belum_menikah',
            pekerjaan: mustahikData.pekerjaan || '',
            penghasilan: Number(mustahikData.penghasilan) || 0,
            jumlahTanggungan: Number(mustahikData.jumlahTanggungan) || 0,
            statusRumah: mustahikData.statusRumah || 'milik_sendiri',
            kondisiRumah: mustahikData.kondisiRumah || 'baik',
            kepemilikanAset: mustahikData.kepemilikanAset || 'tidak_ada',
          })
        }
      } catch (e) {
        console.error('Gagal memuat pengajuan:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const hasExisting = !!pengajuan && !!mustahik

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2 text-sm text-slate-500">Memuat data pengajuan...</span>
      </div>
    )
  }

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
                  <CardTitle>{pengajuan.namaLengkap}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    NIK: {formatNIK(pengajuan.nik)}
                  </p>
                </div>
                <StatusBadge status={pengajuan.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">ID Pengajuan</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs mt-0.5">
                    #{pengajuan.id.toUpperCase().substring(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Tanggal Pengajuan</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">
                    {formatDate(pengajuan.tanggalPengajuan)}
                  </p>
                </div>
                {pengajuan.tanggalVerifikasi && (
                  <div>
                    <p className="text-slate-500 text-xs">Tanggal Verifikasi</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">
                      {formatDate(pengajuan.tanggalVerifikasi)}
                    </p>
                  </div>
                )}
              </div>

              {pengajuan.catatan && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">Catatan Admin:</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">{pengajuan.catatan}</p>
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
                  { label: 'Nama Lengkap', value: mustahik?.namaLengkap || '' },
                  { label: 'NIK', value: mustahik?.nik ? formatNIK(mustahik.nik) : '' },
                  { label: 'Tempat Lahir', value: mustahik?.tempatLahir || '' },
                  { label: 'Pekerjaan', value: mustahik?.pekerjaan || '' },
                  { label: 'Alamat', value: mustahik ? `${mustahik.alamat}, ${mustahik.kota}` : '' },
                  { label: 'Status Rumah', value: mustahik?.statusRumah ? mustahik.statusRumah.replace(/_/g, ' ') : '' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 text-xs capitalize">{value || '-'}</p>
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
            <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Belum Ada Pengajuan</h3>
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
