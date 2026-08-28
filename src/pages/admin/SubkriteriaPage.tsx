import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Loader2, AlertCircle, CheckCircle2, Sliders } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  getAdminKriteria,
  getAdminSubKriteria,
  createAdminSubKriteria,
  updateAdminSubKriteria,
  deleteAdminSubKriteria,
  type AdminKriteria,
  type AdminSubKriteria,
} from '@/lib/adminApi'
import type { Column } from '@/types'

export function SubkriteriaPage() {
  const [kriteriaList, setKriteriaList] = useState<AdminKriteria[]>([])
  const [selectedKriteriaId, setSelectedKriteriaId] = useState<string>('')
  const [subList, setSubList] = useState<AdminSubKriteria[]>([])

  const [loadingKriteria, setLoadingKriteria] = useState(true)
  const [loadingSub, setLoadingSub] = useState(false)
  const [saving, setSaving] = useState(false)

  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const [form, setForm] = useState({
    nilai: 1,
    keterangan: '',
  })

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 1. Load Kriteria on Mount
  useEffect(() => {
    async function loadKriteria() {
      try {
        setLoadingKriteria(true)
        setError('')
        const data = await getAdminKriteria()
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
          const numA = Number(a.kode.replace(/\D/g, '')) || 0
          const numB = Number(b.kode.replace(/\D/g, '')) || 0
          return numA - numB
        })
        setKriteriaList(sorted)
        if (sorted.length > 0) {
          setSelectedKriteriaId(sorted[0].id)
        }
      } catch (err: unknown) {
        console.error('LOAD KRITERIA ERROR:', err)
        setError(err instanceof Error ? err.message : 'Gagal memuat data kriteria.')
      } finally {
        setLoadingKriteria(false)
      }
    }

    void loadKriteria()
  }, [])

  // 2. Load Subkriteria when selected kriteria changes
  const loadSubKriteria = useCallback(async (kriteriaId: string) => {
    if (!kriteriaId) return
    try {
      setLoadingSub(true)
      setError('')
      const data = await getAdminSubKriteria(kriteriaId)
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => Number(a.nilai) - Number(b.nilai)
      )
      setSubList(sorted)
    } catch (err: unknown) {
      console.error('LOAD SUBKRITERIA ERROR:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat subkriteria.')
    } finally {
      setLoadingSub(false)
    }
  }, [])

  useEffect(() => {
    if (selectedKriteriaId) {
      void loadSubKriteria(selectedKriteriaId)
    }
  }, [selectedKriteriaId, loadSubKriteria])

  const currentKriteria =
    kriteriaList.find((k) => k.id === selectedKriteriaId) || kriteriaList[0]

  // Handlers
  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ nilai: 1, keterangan: '' })
    setError('')
    setSuccessMessage('')
    setOpenModal(true)
  }

  const handleOpenEdit = (sk: AdminSubKriteria) => {
    setEditingId(sk.id)
    setForm({
      nilai: Number(sk.nilai) || 1,
      keterangan: sk.keterangan || sk.nama || '',
    })
    setError('')
    setSuccessMessage('')
    setOpenModal(true)
  }

  const handleSave = async () => {
    if (!form.keterangan.trim()) {
      setError('Keterangan / Opsi subkriteria wajib diisi.')
      return
    }

    if (!selectedKriteriaId) {
      setError('Pilih kriteria terlebih dahulu.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingId) {
        await updateAdminSubKriteria(editingId, {
          nama: form.keterangan.trim(),
          nilai: form.nilai,
          keterangan: form.keterangan.trim(),
        })
        setSuccessMessage('Subkriteria berhasil diperbarui!')
      } else {
        await createAdminSubKriteria({
          kriteriaId: selectedKriteriaId,
          nama: form.keterangan.trim(),
          nilai: form.nilai,
          keterangan: form.keterangan.trim(),
        })
        setSuccessMessage('Subkriteria baru berhasil ditambahkan!')
      }

      setOpenModal(false)
      await loadSubKriteria(selectedKriteriaId)
    } catch (err: unknown) {
      console.error('SAVE SUBKRITERIA ERROR:', err)
      setError(err instanceof Error ? err.message : 'Gagal menyimpan subkriteria.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return

    try {
      setLoadingSub(true)
      setError('')
      await deleteAdminSubKriteria(deleteTargetId)
      setSuccessMessage('Subkriteria berhasil dihapus!')
      setDeleteTargetId(null)
      await loadSubKriteria(selectedKriteriaId)
    } catch (err: unknown) {
      console.error('DELETE SUBKRITERIA ERROR:', err)
      setError(err instanceof Error ? err.message : 'Gagal menghapus subkriteria.')
    } finally {
      setLoadingSub(false)
    }
  }

  const columns: Column<AdminSubKriteria>[] = [
    {
      key: 'nilai',
      header: 'Nilai (Skor)',
      render: (row) => (
        <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-slate-900 text-green-700 dark:text-green-400 font-bold flex items-center justify-center text-sm border border-green-300 dark:border-green-500/50">
          {row.nilai}
        </span>
      ),
    },
    {
      key: 'keterangan',
      header: 'Keterangan / Range Opsi',
      render: (row) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {row.keterangan || row.nama}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEdit(row)}
            title="Edit Subkriteria"
          >
            <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteTargetId(row.id)}
            title="Hapus Subkriteria"
          >
            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengelolaan Subkriteria"
        description="Kelola rentang pilihan jawaban dan bobot nilainya untuk setiap kriteria di database"
      >
        <Button onClick={handleOpenAdd} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Subkriteria
        </Button>
      </PageHeader>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-4">
          <div className="flex gap-3 items-center">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/40 p-4">
          <div className="flex gap-3 items-center">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Select Kriteria */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="py-4">
          {loadingKriteria ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span>Memuat data kriteria...</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Pilih Kriteria:</p>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {currentKriteria ? (
                    <>
                      {currentKriteria.kode} - {currentKriteria.nama} ({currentKriteria.tipe})
                    </>
                  ) : (
                    'Tidak ada kriteria'
                  )}
                </h3>
              </div>
              <Select value={selectedKriteriaId} onValueChange={setSelectedKriteriaId}>
                <SelectTrigger className="w-full sm:w-72 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Pilih Kriteria" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                  {kriteriaList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.kode} - {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subkriteria Table */}
      {loadingSub ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
            <span>Memuat data subkriteria dari database...</span>
          </div>
        </div>
      ) : subList.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 text-center">
            <Sliders className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-3">
              Belum Ada Subkriteria untuk Kriteria Ini
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Klik tombol &ldquo;Tambah Subkriteria&rdquo; untuk menambahkan rentang skor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={subList} />
      )}

      {/* Modal Add / Edit */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Subkriteria' : 'Tambah Subkriteria'}
              {currentKriteria ? ` (${currentKriteria.kode})` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField label="Nilai / Skor (1-5)" required>
              <Input
                type="number"
                min="1"
                max="5"
                value={form.nilai}
                onChange={(e) =>
                  setForm({ ...form, nilai: parseInt(e.target.value) || 1 })
                }
              />
            </FormField>

            <FormField label="Keterangan / Range Opsi" required>
              <Input
                placeholder="Contoh: < Rp 500.000, Sangat Baik, dsb."
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenModal(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan ke Database'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Hapus Subkriteria"
        description="Apakah Anda yakin ingin menghapus subkriteria ini dari database? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  )
}

export default SubkriteriaPage
