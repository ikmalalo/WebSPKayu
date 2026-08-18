import {
  useEffect,
  useState,
} from 'react'

import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

import {
  Button,
} from '@/components/ui/button'

import {
  Input,
} from '@/components/ui/input'

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
  DialogFooter,
} from '@/components/ui/dialog'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  FormField,
} from '@/components/shared/FormField'

import {
  DataTable,
} from '@/components/shared/DataTable'

import {
  getAdminKriteria,
  getAdminSubKriteria,
  createAdminSubKriteria,
  updateAdminSubKriteria,
  deleteAdminSubKriteria,
  type AdminKriteria,
  type AdminSubKriteria,
} from '@/lib/adminApi'

export function SubkriteriaPage() {
  const [
    kriteriaList,
    setKriteriaList,
  ] = useState<
    AdminKriteria[]
  >([])

  const [
    subList,
    setSubList,
  ] = useState<
    AdminSubKriteria[]
  >([])

  const [
    selectedKriteriaId,
    setSelectedKriteriaId,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    openModal,
    setOpenModal,
  ] = useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState<
    string | null
  >(null)

  const [
    form,
    setForm,
  ] = useState({
    nilai: 1,
    nama: '',
    keterangan: '',
  })

  const currentKriteria =
    kriteriaList.find(
      (item) =>
        item.id ===
        selectedKriteriaId
    )

  const loadKriteria =
    async () => {
      const result =
        await getAdminKriteria()

      setKriteriaList(
        result
      )

      if (
        !selectedKriteriaId &&
        result.length
      ) {
        setSelectedKriteriaId(
          result[0].id
        )
      }
    }

  const loadSub =
    async () => {
      if (
        !selectedKriteriaId
      ) {
        setSubList([])
        return
      }

      const result =
        await getAdminSubKriteria(
          selectedKriteriaId
        )

      setSubList(
        result
      )
    }

  useEffect(() => {
    const load =
      async () => {
        try {
          setLoading(true)

          await loadKriteria()
        } catch (err: any) {
          setError(
            err.response
              ?.data?.message ||
            'Gagal mengambil kriteria.'
          )
        } finally {
          setLoading(false)
        }
      }

    load()
  }, [])

  useEffect(() => {
    if (
      !selectedKriteriaId
    ) return

    loadSub().catch(
      (err: any) => {
        setError(
          err.response
            ?.data?.message ||
          'Gagal mengambil subkriteria.'
        )
      }
    )
  }, [
    selectedKriteriaId,
  ])

  const handleAdd =
    () => {
      setEditingId(null)

      setForm({
        nilai: 1,
        nama: '',
        keterangan: '',
      })

      setOpenModal(true)
    }

  const handleEdit =
    (
      item: AdminSubKriteria
    ) => {
      setEditingId(
        item.id
      )

      setForm({
        nilai: Number(
          item.nilai
        ),
        nama: item.nama,
        keterangan:
          item.keterangan ||
          '',
      })

      setOpenModal(true)
    }

  const handleSave =
    async () => {
      if (
        !selectedKriteriaId ||
        !form.nama
      ) {
        setError(
          'Nama subkriteria wajib diisi.'
        )
        return
      }

      try {
        setSaving(true)
        setError('')

        if (
          editingId
        ) {
          await updateAdminSubKriteria(
            editingId,
            form
          )
        } else {
          await createAdminSubKriteria(
            {
              kriteriaId:
                selectedKriteriaId,
              ...form,
            }
          )
        }

        setOpenModal(false)

        await loadSub()
      } catch (err: any) {
        setError(
          err.response
            ?.data?.message ||
          'Gagal menyimpan subkriteria.'
        )
      } finally {
        setSaving(false)
      }
    }

  const handleDelete =
    async (
      id: string
    ) => {
      if (
        !window.confirm(
          'Hapus subkriteria ini?'
        )
      ) {
        return
      }

      try {
        await deleteAdminSubKriteria(
          id
        )

        await loadSub()
      } catch (err: any) {
        setError(
          err.response
            ?.data?.message ||
          'Gagal menghapus subkriteria.'
        )
      }
    }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengelolaan Subkriteria"
        description="Data subkriteria tersimpan di database"
      >
        <Button
          onClick={
            handleAdd
          }
          disabled={
            !currentKriteria
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Subkriteria
        </Button>
      </PageHeader>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">
                Pilih Kriteria
              </p>

              <h3 className="text-base font-bold mt-1">
                {currentKriteria
                  ? `${currentKriteria.kode} - ${currentKriteria.nama}`
                  : 'Belum ada kriteria'}
              </h3>
            </div>

            <Select
              value={
                selectedKriteriaId
              }
              onValueChange={
                setSelectedKriteriaId
              }
            >
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {kriteriaList.map(
                  (item) => (
                    <SelectItem
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.kode} -{' '}
                      {
                        item.nama
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: 'nilai',
              header: 'Nilai',
              render: (
                row
              ) => (
                <span className="font-bold text-green-700">
                  {Number(
                    row.nilai
                  )}
                </span>
              ),
            },

            {
              key: 'nama',
              header: 'Nama',
              render: (
                row
              ) => (
                <span className="font-medium">
                  {row.nama}
                </span>
              ),
            },

            {
              key: 'keterangan',
              header: 'Keterangan',
              render: (
                row
              ) =>
                row.keterangan ||
                '-',
            },

            {
              key: 'actions',
              header: 'Aksi',
              render: (
                row
              ) => (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleEdit(
                        row
                      )
                    }
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDelete(
                        row.id
                      )
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={
            subList
          }
        />
      )}

      <Dialog
        open={openModal}
        onOpenChange={
          setOpenModal
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? 'Edit Subkriteria'
                : 'Tambah Subkriteria'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <FormField
              label="Nama Subkriteria"
              required
            >
              <Input
                value={
                  form.nama
                }
                placeholder="Contoh: Rp 500.001 - Rp 1.000.000"
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    nama:
                      e.target.value,
                  })
                }
              />
            </FormField>

            <FormField
              label="Nilai / Skor"
              required
            >
              <Input
                type="number"
                min="1"
                max="5"
                value={
                  form.nilai
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    nilai:
                      Number(
                        e.target.value
                      ),
                  })
                }
              />
            </FormField>

            <FormField label="Keterangan">
              <Input
                value={
                  form.keterangan
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    keterangan:
                      e.target.value,
                  })
                }
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setOpenModal(
                  false
                )
              }
            >
              Batal
            </Button>

            <Button
              onClick={
                handleSave
              }
              disabled={
                saving
              }
            >
              {saving && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}