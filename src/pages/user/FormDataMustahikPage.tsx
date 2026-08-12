import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormSection } from '@/components/shared/FormField'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockDataMustahik, mockPengajuan, saveMockPengajuan } from '@/data/mockData'

const prefilled = mockDataMustahik[0]

export function FormDataMustahikPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const totalSteps = 3

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Save temporary pengajuan data to sessionStorage mock state
      const newSubmission = {
        id: 'p_temp',
        userId: 'u1',
        namaLengkap: prefilled.namaLengkap,
        nik: prefilled.nik,
        status: 'BELUM_ADA_PENGAJUAN', // Will progress after kuesioner
        tanggalPengajuan: new Date().toISOString().split('T')[0],
      };
      // Import saveMockPengajuan dynamically or update array directly
      mockPengajuan.length = 0;
      mockPengajuan.push(newSubmission);
      saveMockPengajuan(mockPengajuan);

      navigate('/kuesioner')
    }, 1000)
  }

  const stepLabels = ['Data Pribadi', 'Data Ekonomi', 'Kondisi Tempat Tinggal']

  return (
    <div className="space-y-6">
      <PageHeader
        title="Form Data Mustahik"
        description="Lengkapi data diri Anda untuk pengajuan"
      />

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
                    <Input id="nik" placeholder="3201xxxxxxxx" defaultValue={prefilled.nik} maxLength={16} />
                  </FormField>
                  <FormField label="Nama Lengkap" htmlFor="nama" required>
                    <Input id="nama" placeholder="Sesuai KTP" defaultValue={prefilled.namaLengkap} />
                  </FormField>
                  <FormField label="Tempat Lahir" htmlFor="tempat-lahir" required>
                    <Input id="tempat-lahir" placeholder="Kota lahir" defaultValue={prefilled.tempatLahir} />
                  </FormField>
                  <FormField label="Tanggal Lahir" htmlFor="tgl-lahir" required>
                    <Input id="tgl-lahir" type="date" defaultValue={prefilled.tanggalLahir} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                  </FormField>
                  <FormField label="Jenis Kelamin" htmlFor="jk" required>
                    <Select defaultValue={prefilled.jenisKelamin}>
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
                    <Select defaultValue={prefilled.statusPernikahan}>
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
                    <Input id="no-hp" type="tel" placeholder="08xxxxxxxxxx" defaultValue={prefilled.noHp} />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Alamat">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Alamat Lengkap" htmlFor="alamat" required className="sm:col-span-2">
                    <Input id="alamat" placeholder="Jalan, nomor, RT/RW" defaultValue={prefilled.alamat} />
                  </FormField>
                  <FormField label="Kelurahan" htmlFor="kelurahan" required>
                    <Input id="kelurahan" placeholder="Kelurahan" defaultValue={prefilled.kelurahan} />
                  </FormField>
                  <FormField label="Kecamatan" htmlFor="kecamatan" required>
                    <Input id="kecamatan" placeholder="Kecamatan" defaultValue={prefilled.kecamatan} />
                  </FormField>
                  <FormField label="Kota/Kabupaten" htmlFor="kota" required>
                    <Input id="kota" placeholder="Kota / Kabupaten" defaultValue={prefilled.kota} />
                  </FormField>
                  <FormField label="Provinsi" htmlFor="provinsi" required>
                    <Input id="provinsi" placeholder="Provinsi" defaultValue={prefilled.provinsi} />
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
                    <Input id="pekerjaan" placeholder="Jenis pekerjaan" defaultValue={prefilled.pekerjaan} />
                  </FormField>
                  <FormField label="Penghasilan per Bulan" htmlFor="penghasilan" required hint="Dalam rupiah">
                    <Input id="penghasilan" type="number" placeholder="1500000" defaultValue={prefilled.penghasilan} />
                  </FormField>
                  <FormField label="Jumlah Tanggungan" htmlFor="tanggungan" required hint="Jumlah anggota keluarga yang ditanggung">
                    <Input id="tanggungan" type="number" min={0} max={20} defaultValue={prefilled.jumlahTanggungan} />
                  </FormField>
                  <FormField label="Kepemilikan Aset" htmlFor="aset" required>
                    <Select defaultValue={prefilled.kepemilikanAset}>
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
                    <Select defaultValue={prefilled.statusRumah}>
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
                    <Select defaultValue={prefilled.kondisiRumah}>
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
                Simpan & Lanjutkan
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
