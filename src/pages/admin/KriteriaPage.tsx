import {
  useEffect,
  useState,
} from 'react'

import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  createAdminKriteria,
  updateAdminKriteria,
  deleteAdminKriteria,
  type AdminKriteria,
} from '@/lib/adminApi'

interface FormState {
  nama: string
  kode: string
  tipe:
    | 'BENEFIT'
    | 'COST'
  bobot: number
  deskripsi: string
}

const emptyForm:
  FormState = {
    nama: '',
    kode: '',
    tipe: 'BENEFIT',
    bobot: 0.2,
    deskripsi: '',
  }

export function KriteriaPage() {
  const [
    kriteriaList,
    setKriteriaList,
  ] = useState<
    AdminKriteria[]
  >([])

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
  ] =
    useState<FormState>(
      emptyForm
    )

  const load =
    async () => {
      try {
        setLoading(true)

        const data =
          await getAdminKriteria()

        setKriteriaList(
          data
        )
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

  useEffect(() => {
    load()
  }, [])

  const totalBobot =
    kriteriaList.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.bobot
        ),
      0
    )

  const isBobotValid =
    Math.abs(
      totalBobot - 1
    ) < 0.001

  const handleOpenAdd =
    () => {
      setEditingId(null)

      setForm({
        nama: '',
        kode: `C${
          kriteriaList.length +
          1
        }`,
        tipe: 'BENEFIT',
        bobot: 0.1,
        deskripsi: '',
      })

      setOpenModal(true)
    }

  const handleOpenEdit =
    (
      item: AdminKriteria
    ) => {
      setEditingId(
        item.id
      )

      setForm({
        nama: item.nama,
        kode: item.kode,
        tipe: item.tipe,
        bobot: Number(
          item.bobot
        ),
        deskripsi:
          item.deskripsi ||
          '',
      })

      setOpenModal(true)
    }

  const handleSave =
    async () => {
      if (
        !form.nama ||
        !form.kode ||
        form.bobot <= 0
      ) {
        setError(
          'Kode, nama, dan bobot wajib diisi.'
        )

        return
      }

      try {
        setSaving(true)
        setError('')

        if (
          editingId
        ) {
          await updateAdminKriteria(
            editingId,
            {
              ...form,
            }
          )
        } else {
          await createAdminKriteria(
            {
              ...form,
            }
          )
        }

        setOpenModal(false)

        await load()
      } catch (err: any) {
        setError(
          err.response
            ?.data?.message ||
          'Gagal menyimpan kriteria.'
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
          'Hapus kriteria ini? Semua subkriteria terkait juga dapat ikut terhapus.'
        )
      ) {
        return
      }

      try {
        await deleteAdminKriteria(
          id
        )

        await load()
      } catch (err: any) {
        setError(
          err.response
            ?.data?.message ||
          'Gagal menghapus kriteria.'
        )
      }
    }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengelolaan Kriteria TOPSIS"
        description="Data kriteria berasal langsung dari database"
      >
        <Button
          onClick={
            handleOpenAdd
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kriteria
        </Button>
      </PageHeader>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card
        className={
          isBobotValid
            ? 'border-green-300 bg-green-50/50'
            : 'border-amber-300 bg-amber-50/50'
        }
      >
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={
                isBobotValid
                  ? 'w-5 h-5 text-green-600'
                  : 'w-5 h-5 text-amber-600'
              }
            />

            <div>
              <p className="text-sm font-semibold">
                Total Bobot Kriteria:{' '}
                {(
                  totalBobot *
                  100
                ).toFixed(
                  0
                )}
                %
              </p>

              <p className="text-xs text-slate-500">
                {isBobotValid
                  ? 'Total bobot sudah 100%.'
                  : 'Total bobot harus berjumlah 100%.'}
              </p>
            </div>
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
              key: 'kode',
              header: 'Kode',
              render: (
                row
              ) => (
                <span className="font-mono font-bold text-green-700">
                  {row.kode}
                </span>
              ),
            },

            {
              key: 'nama',
              header: 'Nama Kriteria',
              render: (
                row
              ) => (
                <span className="font-semibold">
                  {row.nama}
                </span>
              ),
            },

            {
              key: 'tipe',
              header: 'Tipe',
              render: (
                row
              ) => (
                <span className="px-3 py-1 rounded-full text-xs font-bold">
                  {row.tipe}
                </span>
              ),
            },

            {
              key: 'bobot',
              header: 'Bobot',
              render: (
                row
              ) =>
                `${(
                  Number(
                    row.bobot
                  ) * 100
                ).toFixed(
                  0
                )}%`,
            },

            {
              key: 'deskripsi',
              header: 'Deskripsi',
              render: (
                row
              ) =>
                row.deskripsi ||
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
                      handleOpenEdit(
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
            kriteriaList
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
                ? 'Edit Kriteria'
                : 'Tambah Kriteria'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField
              label="Kode"
              required
            >
              <Input
                value={
                  form.kode
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    kode:
                      e.target.value.toUpperCase(),
                  })
                }
              />
            </FormField>

            <FormField
              label="Nama"
              required
            >
              <Input
                value={
                  form.nama
                }
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
              label="Tipe"
              required
            >
              <Select
                value={
                  form.tipe
                }
                onValueChange={(
                  value
                ) =>
                  setForm({
                    ...form,
                    tipe:
                      value as
                        | 'BENEFIT'
                        | 'COST',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="BENEFIT">
                    Benefit
                  </SelectItem>

                  <SelectItem value="COST">
                    Cost
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Bobot"
              required
            >
              <Input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={
                  form.bobot
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    bobot:
                      Number(
                        e.target.value
                      ),
                  })
                }
              />
            </FormField>

            <FormField label="Deskripsi">
              <Input
                value={
                  form.deskripsi
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    deskripsi:
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