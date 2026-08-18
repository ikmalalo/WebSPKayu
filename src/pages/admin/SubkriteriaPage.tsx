import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { DataTable } from '@/components/shared/DataTable'
import { mockKriteria, mockSubKriteria } from '@/data/mockData'
import type { Column, SubKriteria } from '@/types'

export function SubkriteriaPage() {
  const [selectedKriteriaId, setSelectedKriteriaId] = useState<string>('k1')
  const [subList, setSubList] = useState<SubKriteria[]>(mockSubKriteria)
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nilai: 1,
    keterangan: '',
  })

  const currentKriteria = mockKriteria.find((k) => k.id === selectedKriteriaId) || mockKriteria[0]
  const filteredSub = subList.filter((sk) => sk.kriteriaId === selectedKriteriaId)

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ nilai: 1, keterangan: '' })
    setOpenModal(true)
  }

  const handleOpenEdit = (sk: SubKriteria) => {
    setEditingId(sk.id)
    setForm({ nilai: sk.nilai, keterangan: sk.keterangan })
    setOpenModal(true)
  }

  const handleSave = () => {
    if (editingId) {
      setSubList(subList.map((sk) => (sk.id === editingId ? { ...sk, ...form } : sk)))
    } else {
      setSubList([
        ...subList,
        {
          id: `sk${Date.now()}`,
          kriteriaId: selectedKriteriaId,
          namaKriteria: currentKriteria.nama,
          ...form,
        },
      ])
    }
    setOpenModal(false)
  }

  const handleDelete = (id: string) => {
    setSubList(subList.filter((sk) => sk.id !== id))
  }

  const columns: Column<SubKriteria>[] = [
    {
      key: 'nilai',
      header: 'Nilai (Skor)',
      render: (row) => (
        <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-slate-900 text-green-700 dark:text-green-400 font-bold flex items-center justify-center text-sm border border-green-300 dark:border-green-500/50 dark:shadow-[0_0_8px_rgba(34,197,94,0.2)]">
          {row.nilai}
        </span>
      ),
    },
    {
      key: 'keterangan',
      header: 'Keterangan / Range Opsi',
      render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.keterangan}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(row)}>
            <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengelolaan Subkriteria"
        description="Kelola rentang pilihan jawaban dan bobot nilainya untuk setiap kriteria"
      >
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Subkriteria
        </Button>
      </PageHeader>

      {/* Select Kriteria */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">Pilih Kriteria:</p>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {currentKriteria.kode} - {currentKriteria.nama} ({currentKriteria.tipe.toUpperCase()})
              </h3>
            </div>
            <Select value={selectedKriteriaId} onValueChange={setSelectedKriteriaId}>
              <SelectTrigger className="w-full sm:w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
                {mockKriteria.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.kode} - {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={filteredSub} />

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Subkriteria' : 'Tambah Subkriteria'} ({currentKriteria.kode})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField label="Nilai / Skor (1-5)" required>
              <Input
                type="number"
                min="1"
                max="5"
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: parseInt(e.target.value) || 1 })}
              />
            </FormField>

            <FormField label="Keterangan Opsi" required>
              <Input
                placeholder="Contoh: < Rp 500.000, 3 orang, dsb."
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
