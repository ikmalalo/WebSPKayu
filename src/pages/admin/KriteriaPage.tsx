import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { DataTable } from '@/components/shared/DataTable'
import { mockKriteria } from '@/data/mockData'
import type { Column, Kriteria } from '@/types'

export function KriteriaPage() {
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>(mockKriteria)
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nama: '',
    kode: '',
    tipe: 'benefit' as 'benefit' | 'cost',
    bobot: 0.2,
    deskripsi: '',
  })

  const totalBobot = kriteriaList.reduce((acc, k) => acc + k.bobot, 0)
  const isBobotValid = Math.abs(totalBobot - 1) < 0.001

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({
      nama: '',
      kode: `C${kriteriaList.length + 1}`,
      tipe: 'benefit',
      bobot: 0.1,
      deskripsi: '',
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (k: Kriteria) => {
    setEditingId(k.id)
    setForm({
      nama: k.nama,
      kode: k.kode,
      tipe: k.tipe,
      bobot: k.bobot,
      deskripsi: k.deskripsi,
    })
    setOpenModal(true)
  }

  const handleSave = () => {
    if (editingId) {
      setKriteriaList(kriteriaList.map((k) => (k.id === editingId ? { ...k, ...form } : k)))
    } else {
      setKriteriaList([...kriteriaList, { id: `k${Date.now()}`, ...form }])
    }
    setOpenModal(false)
  }

  const handleDelete = (id: string) => {
    setKriteriaList(kriteriaList.filter((k) => k.id !== id))
  }

  const columns: Column<Kriteria>[] = [
    {
      key: 'kode',
      header: 'Kode',
      render: (row) => <span className="font-mono font-bold text-green-700">{row.kode}</span>,
    },
    {
      key: 'nama',
      header: 'Nama Kriteria',
      render: (row) => <span className="font-semibold text-slate-800">{row.nama}</span>,
    },
    {
      key: 'tipe',
      header: 'Tipe',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
            row.tipe === 'benefit' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.tipe}
        </span>
      ),
    },
    {
      key: 'bobot',
      header: 'Bobot (%)',
      render: (row) => <span className="font-bold text-slate-900">{(row.bobot * 100).toFixed(0)}%</span>,
    },
    {
      key: 'deskripsi',
      header: 'Deskripsi',
      render: (row) => <span className="text-slate-500 text-xs">{row.deskripsi}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(row)}>
            <Edit2 className="w-4 h-4 text-slate-600" />
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
        title="Pengelolaan Kriteria TOPSIS"
        description="Atur kriteria, tipe (benefit/cost), dan bobot penilaian"
      >
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kriteria
        </Button>
      </PageHeader>

      {/* Summary Bobot Alert */}
      <Card className={isBobotValid ? 'border-green-300 bg-green-50/50' : 'border-amber-300 bg-amber-50/50'}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 ${isBobotValid ? 'text-green-600' : 'text-amber-600'}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Total Bobot Kriteria: {(totalBobot * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-slate-500">
                  {isBobotValid
                    ? 'Total bobot sudah 100%, siap untuk perhitungan TOPSIS.'
                    : 'Peringatan: Total bobot harus berjumlah tepat 100% (1.0).'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={kriteriaList} />

      {/* Modal Edit/Add */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Kriteria' : 'Tambah Kriteria'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField label="Kode Kriteria" required>
              <Input
                placeholder="C1, C2, dst."
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
              />
            </FormField>

            <FormField label="Nama Kriteria" required>
              <Input
                placeholder="Nama kriteria"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </FormField>

            <FormField label="Tipe Kriteria" required>
              <Select value={form.tipe} onValueChange={(val: any) => setForm({ ...form, tipe: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="benefit">Benefit (Makin tinggi makin baik)</SelectItem>
                  <SelectItem value="cost">Cost (Makin rendah makin baik)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Bobot (Desimal, misal 0.25 untuk 25%)" required>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.bobot}
                onChange={(e) => setForm({ ...form, bobot: parseFloat(e.target.value) || 0 })}
              />
            </FormField>

            <FormField label="Deskripsi">
              <Input
                placeholder="Penjelasan kriteria..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
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
