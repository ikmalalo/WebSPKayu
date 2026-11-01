import { useEffect, useState, useMemo } from 'react'
import {
  ClipboardList,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  MapPin,
  Phone,
  FileText,
  Calendar,
  XCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  getAdminPenugasan,
  getAdminPelaksana,
  getAdminMustahik,
  createAdminPenugasan,
  updateAdminPenugasan,
  batalAdminPenugasan,
} from '@/lib/adminApi'
import type { PenugasanSurvei, StatusPenugasan, PelaksanaUser } from '@/types'

export function PenugasanSurveiPage() {
  const [penugasanList, setPenugasanList] = useState<PenugasanSurvei[]>([])
  const [pelaksanaList, setPelaksanaList] = useState<PelaksanaUser[]>([])
  const [mustahikList, setMustahikList] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filter State
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA')
  const [filterPelaksana, setFilterPelaksana] = useState<string>('SEMUA')
  const [search, setSearch] = useState('')

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    ditugaskan: 0,
    sedangSurvei: 0,
    selesai: 0,
    dibatalkan: 0,
  })

  // Modal Penugasan Baru
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createMustahikId, setCreateMustahikId] = useState('')
  const [createPelaksanaId, setCreatePelaksanaId] = useState('')
  const [createCatatan, setCreateCatatan] = useState('')
  const [submittingCreate, setSubmittingCreate] = useState(false)

  // Modal Edit / Pindah Pelaksana
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPenugasan, setSelectedPenugasan] = useState<PenugasanSurvei | null>(null)
  const [editPelaksanaId, setEditPelaksanaId] = useState('')
  const [editCatatan, setEditCatatan] = useState('')
  const [submittingEdit, setSubmittingEdit] = useState(false)

  // Modal Batalkan Penugasan
  const [batalDialogOpen, setBatalDialogOpen] = useState(false)
  const [penugasanToBatal, setPenugasanToBatal] = useState<PenugasanSurvei | null>(null)
  const [alasanBatal, setAlasanBatal] = useState('')
  const [submittingBatal, setSubmittingBatal] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [penugasanRes, pelaksanaRes, mustahikRes] = await Promise.all([
        getAdminPenugasan({
          status: filterStatus === 'SEMUA' ? undefined : filterStatus,
          pelaksanaId: filterPelaksana === 'SEMUA' ? undefined : filterPelaksana,
          search: search.trim() || undefined,
        }),
        getAdminPelaksana(),
        getAdminMustahik(),
      ])

      setPenugasanList(penugasanRes.penugasan || [])
      setStats(penugasanRes.stats)
      setPelaksanaList(pelaksanaRes.pelaksana || [])
      setMustahikList(Array.isArray(mustahikRes) ? mustahikRes : [])
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data penugasan survei.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [filterStatus, filterPelaksana])

  // Cari calon mustahik yang belum memiliki penugasan aktif (DITUGASKAN atau SEDANG_SURVEI)
  const availableMustahik = useMemo(() => {
    const activeMustahikIds = new Set(
      penugasanList
        .filter((p) => p.status === 'DITUGASKAN' || p.status === 'SEDANG_SURVEI')
        .map((p) => p.mustahikId)
    )
    return mustahikList.filter((m) => !activeMustahikIds.has(m.id))
  }, [mustahikList, penugasanList])

  const handleOpenCreate = () => {
    setCreateMustahikId('')
    setCreatePelaksanaId('')
    setCreateCatatan('')
    setCreateDialogOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createMustahikId || !createPelaksanaId) {
      setError('Pilih calon mustahik dan pelaksana.')
      return
    }

    setSubmittingCreate(true)
    setError('')
    setSuccess('')

    try {
      await createAdminPenugasan({
        mustahikId: createMustahikId,
        pelaksanaId: createPelaksanaId,
        catatan: createCatatan || null,
      })
      setSuccess('Penugasan survei berhasil dibuat.')
      setCreateDialogOpen(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Gagal membuat penugasan survei.')
    } finally {
      setSubmittingCreate(false)
    }
  }

  const handleOpenEdit = (item: PenugasanSurvei) => {
    setSelectedPenugasan(item)
    setEditPelaksanaId(item.pelaksanaId)
    setEditCatatan(item.catatan || '')
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPenugasan) return

    setSubmittingEdit(true)
    setError('')
    setSuccess('')

    try {
      await updateAdminPenugasan(selectedPenugasan.id, {
        pelaksanaId: editPelaksanaId,
        catatan: editCatatan,
      })
      setSuccess('Penugasan survei berhasil diperbarui.')
      setEditDialogOpen(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui penugasan survei.')
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleOpenBatal = (item: PenugasanSurvei) => {
    setPenugasanToBatal(item)
    setAlasanBatal('')
    setBatalDialogOpen(true)
  }

  const handleBatalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!penugasanToBatal) return

    setSubmittingBatal(true)
    setError('')
    setSuccess('')

    try {
      await batalAdminPenugasan(penugasanToBatal.id, alasanBatal)
      setSuccess(`Penugasan survei untuk ${penugasanToBatal.mustahik.namaLengkap} berhasil dibatalkan.`)
      setBatalDialogOpen(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Gagal membatalkan penugasan.')
    } finally {
      setSubmittingBatal(false)
    }
  }

  const getStatusBadge = (status: StatusPenugasan) => {
    switch (status) {
      case 'DITUGASKAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Ditugaskan
          </span>
        )
      case 'SEDANG_SURVEI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Sedang Survei
          </span>
        )
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
            Selesai
          </span>
        )
      case 'DIBATALKAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Dibatalkan
          </span>
        )
      default:
        return <span>{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penugasan Survei Lapangan"
        description="Tugaskan calon mustahik kepada Pelaksana untuk dilakukan verifikasi lapangan secara langsung."
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Tugaskan Survei
          </Button>
        </div>
      </PageHeader>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Statistik Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-slate-500">Total Penugasan</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-amber-700">Ditugaskan (Menunggu)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.ditugaskan}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-blue-700">Sedang Survei</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.sedangSurvei}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/30 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-green-700">Survei Selesai</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.selesai}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/30 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-red-700">Dibatalkan</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.dibatalkan}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Cari Mustahik / Pelaksana</Label>
              <div className="relative mt-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Nama, NIK, alamat..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void loadData()
                  }}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-500">Filter Status Survei</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEMUA">Semua Status</SelectItem>
                  <SelectItem value="DITUGASKAN">Ditugaskan</SelectItem>
                  <SelectItem value="SEDANG_SURVEI">Sedang Survei</SelectItem>
                  <SelectItem value="SELESAI">Selesai</SelectItem>
                  <SelectItem value="DIBATALKAN">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-slate-500">Filter Pelaksana</Label>
              <Select value={filterPelaksana} onValueChange={setFilterPelaksana}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Semua Pelaksana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEMUA">Semua Pelaksana</SelectItem>
                  {pelaksanaList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Daftar Penugasan Survei</CardTitle>
              <CardDescription>
                Daftar pelacakan tugas survei lapangan calon mustahik dan pelaksana penanggung jawab
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
              <p className="text-sm">Memuat daftar penugasan...</p>
            </div>
          ) : penugasanList.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-xl bg-slate-50/50">
              <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">Belum ada penugasan survei</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Pilih calon mustahik dan tugaskan ke salah satu dari 3 Pelaksana lapangan.
              </p>
              <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Buat Penugasan Baru
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Calon Mustahik</th>
                    <th className="py-3 px-4">Alamat Domisili</th>
                    <th className="py-3 px-4">Pelaksana Lapangan</th>
                    <th className="py-3 px-4">Status Survei</th>
                    <th className="py-3 px-4">Tanggal Ditugaskan</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penugasanList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{item.mustahik?.namaLengkap}</p>
                          <p className="text-xs text-slate-500">NIK: {item.mustahik?.nik}</p>
                          {item.mustahik?.noHp && (
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {item.mustahik.noHp}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <div className="flex items-start gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            {item.mustahik?.alamat || '-'}
                            {item.mustahik?.kelurahan ? `, ${item.mustahik.kelurahan}` : ''}
                            {item.mustahik?.kecamatan ? `, ${item.mustahik.kecamatan}` : ''}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {item.pelaksana?.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-xs">{item.pelaksana?.name}</p>
                            <p className="text-[11px] text-slate-400">{item.pelaksana?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <div className="space-y-0.5">
                          <p>
                            Ditugaskan:{' '}
                            {new Date(item.tanggalDitugaskan).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          {item.tanggalSelesai && (
                            <p className="text-green-600 font-medium">
                              Selesai:{' '}
                              {new Date(item.tanggalSelesai).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status !== 'SELESAI' && item.status !== 'DIBATALKAN' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEdit(item)}
                                className="h-7 px-2 text-xs text-blue-700 hover:bg-blue-50"
                                title="Alihkan ke pelaksana lain"
                              >
                                Ubah
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenBatal(item)}
                                className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 border-red-200"
                                title="Batalkan penugasan"
                              >
                                Batalkan
                              </Button>
                            </>
                          )}
                          {item.status === 'SELESAI' && (
                            <span className="text-xs text-green-700 font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lengkap
                            </span>
                          )}
                          {item.status === 'DIBATALKAN' && (
                            <span className="text-xs text-slate-400">Dibatalkan</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Buat Penugasan Baru */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tugaskan Calon Mustahik</DialogTitle>
            <DialogDescription>
              Pilih salah satu calon mustahik dan tentukan Pelaksana yang bertanggung jawab atas survei lapangan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="mustahik">Pilih Calon Mustahik</Label>
              {availableMustahik.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800">
                  Semua calon mustahik saat ini sudah memiliki penugasan aktif, atau belum ada calon mustahik yang terdaftar.
                </div>
              ) : (
                <Select value={createMustahikId} onValueChange={setCreateMustahikId}>
                  <SelectTrigger id="mustahik">
                    <SelectValue placeholder="-- Pilih calon mustahik --" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableMustahik.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.namaLengkap} - NIK {m.nik} ({m.kelurahan || m.kecamatan || 'Lokasi belum diisi'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pelaksana">Pilih Pelaksana Lapangan</Label>
              <Select value={createPelaksanaId} onValueChange={setCreatePelaksanaId}>
                <SelectTrigger id="pelaksana">
                  <SelectValue placeholder="-- Pilih pelaksana --" />
                </SelectTrigger>
                <SelectContent>
                  {pelaksanaList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.penugasanSurvei?.length || 0} tugas aktif)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catatan">Catatan / Instruksi Lapangan (Opsional)</Label>
              <Textarea
                id="catatan"
                rows={3}
                placeholder="Contoh: Pastikan mengecek kondisi fisik rumah dan aset usaha di lokasi."
                value={createCatatan}
                onChange={(e) => setCreateCatatan(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={submittingCreate}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={submittingCreate || availableMustahik.length === 0}
              >
                {submittingCreate && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tugaskan Sekarang
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ubah / Alihkan Pelaksana */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Penugasan Survei</DialogTitle>
            <DialogDescription>
              Alihkan tugas survei calon mustahik{' '}
              <strong className="text-slate-900">{selectedPenugasan?.mustahik?.namaLengkap}</strong> ke pelaksana lain atau perbarui catatan penugasan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editPelaksana">Pelaksana Penanggung Jawab</Label>
              <Select value={editPelaksanaId} onValueChange={setEditPelaksanaId}>
                <SelectTrigger id="editPelaksana">
                  <SelectValue placeholder="Pilih pelaksana" />
                </SelectTrigger>
                <SelectContent>
                  {pelaksanaList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.id === selectedPenugasan?.pelaksanaId ? '(Saat Ini)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editCatatan">Catatan / Instruksi</Label>
              <Textarea
                id="editCatatan"
                rows={3}
                placeholder="Catatan penugasan..."
                value={editCatatan}
                onChange={(e) => setEditCatatan(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submittingEdit}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={submittingEdit}
              >
                {submittingEdit && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Penugasan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Batalkan Penugasan */}
      <Dialog open={batalDialogOpen} onOpenChange={setBatalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Batalkan Penugasan Survei
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan penugasan calon mustahik{' '}
              <strong className="text-slate-900">{penugasanToBatal?.mustahik?.namaLengkap}</strong>?
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBatalSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="alasanBatal">Alasan Pembatalan</Label>
              <Textarea
                id="alasanBatal"
                rows={3}
                required
                placeholder="Contoh: Alamat tidak ditemukan, mustahik pindah domisili, atau dialihkan ke program lain."
                value={alasanBatal}
                onChange={(e) => setAlasanBatal(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBatalDialogOpen(false)}
                disabled={submittingBatal}
              >
                Tutup
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={submittingBatal || !alasanBatal.trim()}
              >
                {submittingBatal && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Konfirmasi Batal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default PenugasanSurveiPage
