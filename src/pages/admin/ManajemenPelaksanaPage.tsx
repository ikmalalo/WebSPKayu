import { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  ShieldAlert,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  getAdminPelaksana,
  createAdminPelaksana,
  updateAdminPelaksana,
  deleteAdminPelaksana,
  type PelaksanaInput,
} from '@/lib/adminApi'
import type { PelaksanaUser } from '@/types'

export function ManajemenPelaksanaPage() {
  const [pelaksanaList, setPelaksanaList] = useState<PelaksanaUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedPelaksana, setSelectedPelaksana] = useState<PelaksanaUser | null>(null)

  // Form State
  const [formData, setFormData] = useState<PelaksanaInput>({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pelaksanaToDelete, setPelaksanaToDelete] = useState<PelaksanaUser | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getAdminPelaksana()
      setPelaksanaList(res.pelaksana || [])
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data pelaksana')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleOpenCreate = () => {
    setDialogMode('create')
    setSelectedPelaksana(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: PelaksanaUser) => {
    setDialogMode('edit')
    setSelectedPelaksana(item)
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      password: '', // Kosongkan jika tidak ingin ubah password
    })
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (dialogMode === 'create') {
        if (!formData.password || formData.password.length < 8) {
          throw new Error('Password wajib diisi minimal 8 karakter')
        }
        await createAdminPelaksana(formData)
        setSuccess('Akun pelaksana berhasil ditambahkan.')
      } else if (selectedPelaksana) {
        const payload: Partial<PelaksanaInput> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
        }
        if (formData.password && formData.password.trim() !== '') {
          if (formData.password.length < 8) {
            throw new Error('Password baru minimal 8 karakter')
          }
          payload.password = formData.password
        }
        await updateAdminPelaksana(selectedPelaksana.id, payload)
        setSuccess('Data akun pelaksana berhasil diperbarui.')
      }

      setDialogOpen(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data pelaksana.')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleOpenDelete = (item: PelaksanaUser) => {
    setPelaksanaToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pelaksanaToDelete) return
    setDeleteSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await deleteAdminPelaksana(pelaksanaToDelete.id)
      setSuccess(`Akun pelaksana ${pelaksanaToDelete.name} berhasil dihapus.`)
      setDeleteDialogOpen(false)
      setPelaksanaToDelete(null)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus akun pelaksana.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Akun Pelaksana"
        description="Kelola akun Pelaksana lapangan yang bertugas melakukan survei mustahik."
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
            Tambah Pelaksana
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

      {/* Info Card */}
      <Card className="border-blue-100 bg-blue-50/50 dark:bg-slate-900/40">
        <CardContent className="pt-5 pb-5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-blue-900 dark:text-blue-400">Aturan Akun Pelaksana:</span>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Sistem dirancang untuk 3 akun Pelaksana aktif. Setiap pelaksana hanya dapat mengakses data dan survei yang secara spesifik ditugaskan kepadanya. Akun yang memiliki riwayat penugasan survei tidak dapat dihapus sembarangan sebelum penugasannya dialihkan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Daftar Akun Pelaksana</CardTitle>
              <CardDescription>
                Total {pelaksanaList.length} akun pelaksana terdaftar dalam sistem
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
              <p className="text-sm">Memuat data akun pelaksana...</p>
            </div>
          ) : pelaksanaList.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-xl bg-slate-50/50">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">Belum ada akun Pelaksana</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Tambahkan akun pelaksana untuk mulai menugaskan survei lapangan.
              </p>
              <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Akun Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Pelaksana</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">No. Telepon / WhatsApp</th>
                    <th className="py-3 px-4">Beban Tugas</th>
                    <th className="py-3 px-4">Terdaftar</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pelaksanaList.map((item) => {
                    const jumlahTugas = item.penugasanSurvei?.length || 0
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 mt-0.5">
                                Pelaksana
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              jumlahTugas > 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {jumlahTugas} Penugasan
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(item)}
                              className="h-8 px-2.5 text-slate-700 hover:text-green-700 hover:bg-green-50"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDelete(item)}
                              className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form Tambah / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Tambah Akun Pelaksana' : 'Ubah Data Akun Pelaksana'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'Buat kredensial akun pelaksana baru untuk bertugas di lapangan.'
                : `Perbarui informasi akun pelaksana ${selectedPelaksana?.name}.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                required
                placeholder="Contoh: Ahmad Fauzi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Login</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="pelaksana1@spkmustahik.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
              <Input
                id="phone"
                placeholder="08123456789"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  {dialogMode === 'create' ? 'Password' : 'Password Baru (Opsional)'}
                </Label>
                {dialogMode === 'edit' && (
                  <span className="text-[11px] text-slate-400">Kosongkan jika tidak diubah</span>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={dialogMode === 'create' ? 'Minimal 8 karakter' : 'Biarkan kosong jika tidak diubah'}
                required={dialogMode === 'create'}
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={formSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={formSubmitting}
              >
                {formSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {dialogMode === 'create' ? 'Buat Akun' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Konfirmasi Hapus Akun
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun pelaksana{' '}
              <strong className="text-slate-900">{pelaksanaToDelete?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          {pelaksanaToDelete && (pelaksanaToDelete.penugasanSurvei?.length || 0) > 0 ? (
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Peringatan: Akun Masih Memiliki Penugasan
              </p>
              <p>
                Pelaksana ini memiliki {pelaksanaToDelete.penugasanSurvei?.length} tugas survei. Sistem akan menolak penghapusan akun jika tugas tersebut belum dialihkan ke pelaksana lain.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Tindakan ini tidak dapat dibatalkan. Kredensial login akun ini akan dicabut secara permanen.
            </p>
          )}

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSubmitting}
            >
              {deleteSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default ManajemenPelaksanaPage
