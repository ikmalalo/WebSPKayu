import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ChevronRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormSection } from '@/components/shared/FormField'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePengajuan } from '@/context/PengajuanContext'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import type { Pengajuan } from '@/types'

const API_URL = 'http://localhost:5000/api'

interface FormData {
  nik: string
  namaLengkap: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  statusPernikahan: string
  noHp: string
  alamat: string
  kelurahan: string
  kecamatan: string
  kota: string
  provinsi: string
  pekerjaan: string
  penghasilan: string
  jumlahTanggungan: string
  statusRumah: string
  kondisiRumah: string
  kepemilikanAset: string
}

const emptyForm: FormData = {
  nik: '', namaLengkap: '', tempatLahir: '', tanggalLahir: '',
  jenisKelamin: '', statusPernikahan: '', noHp: '',
  alamat: '', kelurahan: '', kecamatan: '', kota: '', provinsi: '',
  pekerjaan: '', penghasilan: '', jumlahTanggungan: '',
  statusRumah: '', kondisiRumah: '', kepemilikanAset: '',
}

function adaptPengajuan(p: any): Pengajuan {
  return {
    id: p.id,
    userId: p.userId,
    mustahikId: p.mustahikId,
    namaLengkap: p.mustahik?.namaLengkap || '',
    nik: p.mustahik?.nik || '',
    status: p.status,
    tanggalPengajuan: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  }
}

export function FormDataMustahikPage() {
  const navigate = useNavigate()
  const { pengajuan, setPengajuan } = usePengajuan()
  const { token } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const totalSteps = 3

  const authHeaders = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setInitialLoading(false)
        return
      }
      try {
        // Load profile to get existing mustahik data
        const profileRes = await axios.get(`${API_URL}/user/profile`, { headers: authHeaders })
        const mustahik = profileRes.data?.data?.user?.mustahik
        if (mustahik) {
          setForm({
            nik: mustahik.nik || '',
            namaLengkap: mustahik.namaLengkap || '',
            tempatLahir: mustahik.tempatLahir || '',
            tanggalLahir: mustahik.tanggalLahir
              ? new Date(mustahik.tanggalLahir).toISOString().split('T')[0]
              : '',
            jenisKelamin: mustahik.jenisKelamin || '',
            statusPernikahan: mustahik.statusPernikahan || '',
            noHp: mustahik.noHp || '',
            alamat: mustahik.alamat || '',
            kelurahan: mustahik.kelurahan || '',
            kecamatan: mustahik.kecamatan || '',
            kota: mustahik.kota || '',
            provinsi: mustahik.provinsi || '',
            pekerjaan: mustahik.pekerjaan || '',
            penghasilan: mustahik.penghasilan != null ? String(mustahik.penghasilan) : '',
            jumlahTanggungan: mustahik.jumlahTanggungan != null ? String(mustahik.jumlahTanggungan) : '',
            statusRumah: mustahik.statusRumah || '',
            kondisiRumah: mustahik.kondisiRumah || '',
            kepemilikanAset: mustahik.kepemilikanAset || '',
          })
        }

        // Check if user already has a pengajuan
        const pengajuanRes = await axios.get(`${API_URL}/pengajuan/me`, { headers: authHeaders })
        const list: any[] = pengajuanRes.data?.data?.pengajuan || []
        if (list.length > 0) {
          setIsEditMode(true)
          const adapted = adaptPengajuan(list[0])
          if (!pengajuan || pengajuan.id !== adapted.id) {
            setPengajuan(adapted)
          }
        }
      } catch (e) {
        console.error('Gagal memuat data:', e)
      } finally {
        setInitialLoading(false)
      }
    }
    loadData()
  }, [token])

  const set = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.nik || !form.namaLengkap) {
      setError('NIK dan nama lengkap wajib diisi')
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (isEditMode) {
        // Update mustahik data only (pengajuan sudah ada)
        await axios.patch(`${API_URL}/pengajuan/mustahik`, form, { headers: authHeaders })
        navigate('/kuesioner')
      } else {
        // Buat pengajuan baru (sekaligus buat/update mustahik)
        const res = await axios.post(`${API_URL}/pengajuan`, form, { headers: authHeaders })
        const p = res.data?.data?.pengajuan
        if (p) {
          setPengajuan(adaptPengajuan(p))
        }
        navigate('/kuesioner')
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Data Pribadi', 'Data Ekonomi', 'Kondisi Tempat Tinggal']

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2 text-sm text-slate-500">Memuat data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Data Mustahik' : 'Form Data Mustahik'}
        description={isEditMode ? 'Perbarui data diri Anda' : 'Lengkapi data diri Anda untuk pengajuan'}
      />

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const s = i + 1
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    s < step
                      ? 'bg-green-600 text-white'
                      : s === step
                      ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 ring-2 ring-green-400 dark:ring-green-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${s <= step ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`h-px flex-1 ${s < step ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-800'}`} />
              )}
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Langkah {step}: {stepLabels[step - 1]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <FormSection title="Identitas Diri">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="NIK" htmlFor="nik" required hint="16 digit nomor KTP">
                    <Input
                      id="nik"
                      placeholder="3201xxxxxxxx"
                      maxLength={16}
                      value={form.nik}
                      onChange={e => set('nik', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Nama Lengkap" htmlFor="nama" required>
                    <Input
                      id="nama"
                      placeholder="Sesuai KTP"
                      value={form.namaLengkap}
                      onChange={e => set('namaLengkap', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Tempat Lahir" htmlFor="tempat-lahir" required>
                    <Input
                      id="tempat-lahir"
                      placeholder="Kota lahir"
                      value={form.tempatLahir}
                      onChange={e => set('tempatLahir', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Tanggal Lahir" htmlFor="tgl-lahir" required>
                    <Input
                      id="tgl-lahir"
                      type="date"
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      value={form.tanggalLahir}
                      onChange={e => set('tanggalLahir', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Jenis Kelamin" htmlFor="jk" required>
                    <Select value={form.jenisKelamin} onValueChange={v => set('jenisKelamin', v)}>
                      <SelectTrigger id="jk" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status Pernikahan" htmlFor="status-nikah" required>
                    <Select value={form.statusPernikahan} onValueChange={v => set('statusPernikahan', v)}>
                      <SelectTrigger id="status-nikah" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectItem value="belum_menikah">Belum Menikah</SelectItem>
                        <SelectItem value="menikah">Menikah</SelectItem>
                        <SelectItem value="cerai_hidup">Cerai Hidup</SelectItem>
                        <SelectItem value="cerai_mati">Cerai Mati</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Nomor HP" htmlFor="no-hp" required>
                    <Input
                      id="no-hp"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={form.noHp}
                      onChange={e => set('noHp', e.target.value)}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Alamat">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Alamat Lengkap" htmlFor="alamat" required className="sm:col-span-2">
                    <Input
                      id="alamat"
                      placeholder="Jalan, nomor, RT/RW"
                      value={form.alamat}
                      onChange={e => set('alamat', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Kelurahan" htmlFor="kelurahan" required>
                    <Input
                      id="kelurahan"
                      placeholder="Kelurahan"
                      value={form.kelurahan}
                      onChange={e => set('kelurahan', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Kecamatan" htmlFor="kecamatan" required>
                    <Input
                      id="kecamatan"
                      placeholder="Kecamatan"
                      value={form.kecamatan}
                      onChange={e => set('kecamatan', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Kota/Kabupaten" htmlFor="kota" required>
                    <Input
                      id="kota"
                      placeholder="Kota / Kabupaten"
                      value={form.kota}
                      onChange={e => set('kota', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Provinsi" htmlFor="provinsi" required>
                    <Input
                      id="provinsi"
                      placeholder="Provinsi"
                      value={form.provinsi}
                      onChange={e => set('provinsi', e.target.value)}
                    />
                  </FormField>
                </div>
              </FormSection>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <FormSection title="Data Ekonomi">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Pekerjaan" htmlFor="pekerjaan" required>
                    <Input
                      id="pekerjaan"
                      placeholder="Jenis pekerjaan"
                      value={form.pekerjaan}
                      onChange={e => set('pekerjaan', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Penghasilan per Bulan" htmlFor="penghasilan" required hint="Dalam rupiah">
                    <Input
                      id="penghasilan"
                      type="number"
                      placeholder="1500000"
                      value={form.penghasilan}
                      onChange={e => set('penghasilan', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Jumlah Tanggungan" htmlFor="tanggungan" required hint="Jumlah anggota keluarga yang ditanggung">
                    <Input
                      id="tanggungan"
                      type="number"
                      min={0}
                      max={20}
                      value={form.jumlahTanggungan}
                      onChange={e => set('jumlahTanggungan', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Kepemilikan Aset" htmlFor="aset" required>
                    <Select value={form.kepemilikanAset} onValueChange={v => set('kepemilikanAset', v)}>
                      <SelectTrigger id="aset" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectItem value="ada">Memiliki Aset</SelectItem>
                        <SelectItem value="tidak_ada">Tidak Memiliki Aset</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </FormSection>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <FormSection title="Kondisi Tempat Tinggal">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Status Kepemilikan Rumah" htmlFor="status-rumah" required>
                    <Select value={form.statusRumah} onValueChange={v => set('statusRumah', v)}>
                      <SelectTrigger id="status-rumah" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Pilih status rumah" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectItem value="milik_sendiri">Milik Sendiri</SelectItem>
                        <SelectItem value="sewa">Sewa / Kontrak</SelectItem>
                        <SelectItem value="menumpang">Menumpang</SelectItem>
                        <SelectItem value="dinas">Rumah Dinas</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Kondisi Fisik Rumah" htmlFor="kondisi-rumah" required>
                    <Select value={form.kondisiRumah} onValueChange={v => set('kondisiRumah', v)}>
                      <SelectTrigger id="kondisi-rumah" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Pilih kondisi" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                        <SelectItem value="baik">Baik</SelectItem>
                        <SelectItem value="sedang">Sedang / Cukup</SelectItem>
                        <SelectItem value="buruk">Buruk / Tidak Layak</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </FormSection>

              {/* Konfirmasi */}
              <div className="p-4 bg-green-50 dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-800 dark:text-green-400 mb-1">Konfirmasi Data</p>
                <p className="text-xs text-green-700 dark:text-green-500">
                  Pastikan semua data yang Anda isi sudah benar. Data akan digunakan untuk proses verifikasi dan perhitungan TOPSIS.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/pengajuan')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {step > 1 ? 'Kembali' : 'Batalkan'}
        </Button>

        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)}>
            Lanjutkan
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Simpan Perubahan' : 'Simpan & Lanjutkan'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
