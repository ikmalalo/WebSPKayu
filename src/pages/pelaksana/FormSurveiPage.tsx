import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Loader2,
  User,
  MapPin,
  Phone,
  Briefcase,
  Home,
  FileText,
  HelpCircle,
  Check,
} from 'lucide-react'
import {
  getDetailTugasPelaksana,
  getKuesionerSurvei,
  submitHasilSurveiPelaksana,
  type DetailTugasResponse,
  type KriteriaSurvei,
} from '@/lib/pelaksanaApi'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Skala nilai kuesioner 1 - 5
const SKALA_NILAI = [
  { nilai: 1, label: 'Sangat Rendah / Sangat Kurang', desc: 'Kondisi paling membutuhkan bantuan' },
  { nilai: 2, label: 'Rendah / Kurang', desc: 'Kondisi di bawah rata-rata' },
  { nilai: 3, label: 'Cukup', desc: 'Kondisi standar / menengah' },
  { nilai: 4, label: 'Baik', desc: 'Kondisi relatif mampu' },
  { nilai: 5, label: 'Sangat Baik', desc: 'Kondisi sangat mandiri / mampu' },
]

export function FormSurveiPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [tugasData, setTugasData] = useState<DetailTugasResponse['penugasan'] | null>(null)
  const [kriteriaList, setKriteriaList] = useState<KriteriaSurvei[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // State survei
  const [jawabanMap, setJawabanMap] = useState<Record<string, number>>({})
  const [statusRumah, setStatusRumah] = useState<string>('milik_sendiri')
  const [catatanPelaksana, setCatatanPelaksana] = useState<string>('')

  // Ambil data penugasan & master kriteria
  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError('')

      const [resTugas, resKuesioner] = await Promise.all([
        getDetailTugasPelaksana(id),
        getKuesionerSurvei(),
      ])

      setTugasData(resTugas.penugasan)
      setKriteriaList(resKuesioner.kriteria || [])

      // Set default status rumah dari profil mustahik
      if (resTugas.penugasan?.mustahik?.statusRumah) {
        setStatusRumah(resTugas.penugasan.mustahik.statusRumah)
      }

      if (resTugas.penugasan?.catatan) {
        setCatatanPelaksana(resTugas.penugasan.catatan)
      }

      // Populate jawaban yang sudah tersimpan sebelumnya (jika ada)
      const existingJawaban = resTugas.penugasan?.mustahik?.pengajuan?.[0]?.jawaban || []
      const initialMap: Record<string, number> = {}
      for (const j of existingJawaban) {
        if (j.indikatorId) {
          initialMap[j.indikatorId] = Number(j.nilai)
        }
      }
      setJawabanMap(initialMap)
    } catch (err: any) {
      console.error('LOAD FORM SURVEI ERROR:', err)
      setError(err.message || 'Gagal memuat data formulir survei.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Total indikator yang harus dijawab
  const totalIndikator = useMemo(() => {
    return kriteriaList.reduce((acc, k) => acc + (k.indikator?.length || 0), 0)
  }, [kriteriaList])

  const answeredCount = useMemo(() => {
    return Object.keys(jawabanMap).filter((k) => jawabanMap[k] >= 1 && jawabanMap[k] <= 5).length
  }, [jawabanMap])

  const progressPercent = totalIndikator > 0 ? Math.round((answeredCount / totalIndikator) * 100) : 0

  const handleSelectNilai = (indikatorId: string, nilai: number) => {
    if (isReadonly) return
    setJawabanMap((prev) => ({
      ...prev,
      [indikatorId]: nilai,
    }))
  }

  // Simpan progres (SEDANG_SURVEI)
  const handleSaveDraft = async () => {
    if (!id) return
    try {
      setSaving(true)
      setError('')
      setSuccessMsg('')

      const answersArray = Object.entries(jawabanMap).map(([indikatorId, nilai]) => ({
        indikatorId,
        nilai,
      }))

      if (answersArray.length === 0) {
        setError('Harap isi minimal 1 indikator sebelum menyimpan progres.')
        return
      }

      await submitHasilSurveiPelaksana(id, {
        jawaban: answersArray,
        statusRumah,
        statusPenugasan: 'SEDANG_SURVEI',
        catatan: catatanPelaksana,
      })

      setSuccessMsg('Progres survei berhasil disimpan. Anda dapat melanjutkannya kapan saja.')
      await loadData()
    } catch (err: any) {
      console.error('SAVE DRAFT ERROR:', err)
      setError(err.message || 'Gagal menyimpan progres survei.')
    } finally {
      setSaving(false)
    }
  }

  // Selesaikan survei (SELESAI)
  const handleFinalize = async () => {
    if (!id) return
    try {
      setFinalizing(true)
      setError('')
      setSuccessMsg('')

      // Validasi kelengkapan
      if (answeredCount < totalIndikator) {
        setError(`Semua ${totalIndikator} indikator kriteria survei wajib diisi lengkap untuk menyelesaikan survei. Saat ini baru terisi ${answeredCount}.`)
        return
      }

      const answersArray = Object.entries(jawabanMap).map(([indikatorId, nilai]) => ({
        indikatorId,
        nilai,
      }))

      await submitHasilSurveiPelaksana(id, {
        jawaban: answersArray,
        statusRumah,
        statusPenugasan: 'SELESAI',
        catatan: catatanPelaksana,
      })

      setSuccessMsg('Survei lapangan berhasil diselesaikan dan diteruskan ke Admin untuk proses TOPSIS.')
      setTimeout(() => {
        navigate('/pelaksana/tugas')
      }, 1500)
    } catch (err: any) {
      console.error('FINALIZE ERROR:', err)
      setError(err.message || 'Gagal menyelesaikan survei lapangan.')
    } finally {
      setFinalizing(false)
    }
  }

  const isReadonly = tugasData?.status === 'SELESAI' || tugasData?.status === 'DIBATALKAN'

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Memuat formulir survei lapangan...</p>
        </div>
      </div>
    )
  }

  if (!tugasData) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
        <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-rose-800">Tugas Survei Tidak Ditemukan</h2>
        <p className="text-sm text-rose-600">
          Penugasan tidak ditemukan atau Anda tidak memiliki hak akses untuk membuka tugas ini.
        </p>
        <Link to="/pelaksana/tugas">
          <Button variant="outline" size="sm">Kembali ke Daftar Tugas</Button>
        </Link>
      </div>
    )
  }

  const mustahik = tugasData.mustahik

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/pelaksana/tugas"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Tugas
        </Link>

        <div className="flex items-center gap-2">
          {tugasData.status === 'SELESAI' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Survei Telah Selesai
            </span>
          )}
          {tugasData.status === 'SEDANG_SURVEI' && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              Sedang Disurvei
            </span>
          )}
          {tugasData.status === 'DITUGASKAN' && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              Baru Ditugaskan
            </span>
          )}
        </div>
      </div>

      {/* Profil Calon Mustahik */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Identitas Calon Mustahik yang Disurvei
            </CardTitle>
            <span className="text-xs text-slate-400 font-mono">
              NIK: {mustahik.nik}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="space-y-1">
            <p className="font-semibold text-slate-500">Nama Lengkap</p>
            <p className="text-sm font-bold text-slate-800">{mustahik.namaLengkap}</p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-500">Kontak / No. Telepon</p>
            <p className="text-slate-800 flex items-center gap-1 font-medium">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {mustahik.noHp || '-'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-500">Pekerjaan</p>
            <p className="text-slate-800 flex items-center gap-1 font-medium">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              {mustahik.pekerjaan || '-'}
            </p>
          </div>

          <div className="md:col-span-2 space-y-1">
            <p className="font-semibold text-slate-500">Alamat Lapangan</p>
            <p className="text-slate-800 flex items-start gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              {mustahik.alamat}, Kel. {mustahik.kelurahan}, Kec. {mustahik.kecamatan}, {mustahik.kota}, {mustahik.provinsi}
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-500">Status Pernikahan</p>
            <p className="text-slate-800 font-medium capitalize">
              {mustahik.statusPernikahan?.replace('_', ' ') || '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar Survei */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Progres Pengisian Survei</span>
          <span className="text-emerald-700 font-bold">
            {answeredCount} dari {totalIndikator} Indikator Terisi ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Observasi Status Kepemilikan Rumah */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-600" />
            Observasi Lapangan: Status Kepemilikan Tempat Tinggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="statusRumah" className="text-xs font-semibold text-slate-700">
              Kondisi Kepemilikan Rumah Saat Disurvei
            </Label>
            <Select
              disabled={isReadonly}
              value={statusRumah}
              onValueChange={setStatusRumah}
            >
              <SelectTrigger id="statusRumah" className="bg-white">
                <SelectValue placeholder="Pilih status kepemilikan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milik_sendiri">Milik Sendiri</SelectItem>
                <SelectItem value="sewa">Kontrak / Sewa</SelectItem>
                <SelectItem value="menumpang">Menumpang / Tinggal Bersama Keluarga</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Form Kuesioner Berdasarkan 5 Kriteria & 15 Indikator */}
      <div className="space-y-6">
        {kriteriaList.map((kriteria, kIdx) => (
          <Card key={kriteria.id} className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200/80 py-3.5 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Kriteria {kriteria.kode} &bull; Dimensi: {kriteria.dimensi}
                  </span>
                  <CardTitle className="text-base font-bold text-slate-800">
                    {kriteria.nama}
                  </CardTitle>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 self-start sm:self-auto">
                  Bobot: {Number(kriteria.bobot) * 100}%
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6 divide-y divide-slate-100">
              {kriteria.indikator?.map((indikator, iIdx) => {
                const currentVal = jawabanMap[indikator.id]

                return (
                  <div key={indikator.id} className={`pt-5 first:pt-0 space-y-3`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                            {indikator.kode}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800">
                            {indikator.nama}
                          </h4>
                        </div>
                        {indikator.deskripsi && (
                          <p className="text-xs text-slate-500 mt-1">
                            {indikator.deskripsi}
                          </p>
                        )}
                      </div>

                      {currentVal ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                          Nilai: {currentVal}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 shrink-0">
                          Belum diisi
                        </span>
                      )}
                    </div>

                    {/* Radio Button Pilihan Skala 1 - 5 */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                      {SKALA_NILAI.map((skala) => {
                        const isSelected = currentVal === skala.nilai

                        return (
                          <button
                            key={skala.nilai}
                            type="button"
                            disabled={isReadonly}
                            onClick={() => handleSelectNilai(indikator.id, skala.nilai)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            } ${isReadonly ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{skala.nilai}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                            </div>
                            <p className="text-[11px] leading-tight mt-1 line-clamp-2">
                              {skala.label}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Catatan Pelaksana */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Catatan Tambahan Pelaksana Lapangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            disabled={isReadonly}
            rows={3}
            placeholder="Tuliskan catatan penting hasil survei lapangan, temuan khusus, atau kondisi mustahik..."
            value={catatanPelaksana}
            onChange={(e) => setCatatanPelaksana(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Floating Action Bar untuk Simpan & Selesaikan */}
      {!isReadonly && (
        <div className="sticky bottom-4 z-30 rounded-xl border border-slate-300 bg-white/95 backdrop-blur-md p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Status Pengisian: </span>
            {answeredCount === totalIndikator ? (
              <span className="text-emerald-600 font-bold">Lengkap ({answeredCount}/{totalIndikator}) - Siap diselesaikan</span>
            ) : (
              <span className="text-amber-600 font-bold">{totalIndikator - answeredCount} indikator belum diisi</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={saving || finalizing}
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-none border-slate-300 text-slate-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan Draf...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Progres
                </>
              )}
            </Button>

            <Button
              type="button"
              disabled={saving || finalizing || answeredCount < totalIndikator}
              onClick={handleFinalize}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              {finalizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyelesaikan...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Selesaikan Survei
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

