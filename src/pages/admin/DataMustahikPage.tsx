import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  Search,
  Eye,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'

import {
  getAdminMustahik,
  type AdminMustahik,
} from '@/lib/adminApi'

import {
  formatDateShort,
} from '@/lib/utils'

import type {
  Column,
} from '@/types'

interface Row {
  id: string
  mustahikId: string
  namaLengkap: string
  nik: string
  tanggalPengajuan: string
  status: string
}

export function DataMustahikPage() {
  const navigate =
    useNavigate()

  const [
    data,
    setData,
  ] = useState<
    AdminMustahik[]
  >([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const loadData =
    async () => {
      try {
        setLoading(true)
        setError('')

        const result =
          await getAdminMustahik()

        setData(result)
      } catch (err: any) {
        console.error(err)

        setError(
          err.response
            ?.data?.message ||
          'Gagal mengambil data mustahik.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadData()
  }, [])

  const rows =
    useMemo<Row[]>(
      () =>
        data.map(
          (mustahik) => {
            const latest =
              mustahik.pengajuan?.[0]

            return {
              id:
                latest?.id ||
                mustahik.id,

              mustahikId:
                mustahik.id,

              namaLengkap:
                mustahik.namaLengkap,

              nik:
                mustahik.nik,

              tanggalPengajuan:
                latest?.tanggalPengajuan ||
                mustahik
                  .pengajuan?.[0]
                  ?.createdAt ||
                mustahik
                  .pengajuan?.[0]
                  ?.tanggalPengajuan ||
                mustahik.id,

              status:
                latest?.status ||
                'DRAFT',
            }
          }
        ),
      [data]
    )

  const filtered =
    rows.filter(
      (row) => {
        const q =
          search
            .toLowerCase()
            .trim()

        const matchSearch =
          !q ||
          row.namaLengkap
            .toLowerCase()
            .includes(q) ||
          row.nik.includes(q)

        const matchStatus =
          statusFilter ===
            'all' ||
          row.status ===
            statusFilter

        return (
          matchSearch &&
          matchStatus
        )
      }
    )

  const columns:
    Column<Row>[] = [
      {
        key: 'id',
        header: 'ID',
        render: (row) => (
          <span className="font-mono text-xs text-slate-500">
            #{row.id.toUpperCase()}
          </span>
        ),
      },

      {
        key: 'namaLengkap',
        header: 'Nama Lengkap',
        render: (row) => (
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {row.namaLengkap}
          </span>
        ),
      },

      {
        key: 'nik',
        header: 'NIK',
        render: (row) => (
          <span className="font-mono text-xs">
            {row.nik}
          </span>
        ),
      },

      {
        key: 'tanggalPengajuan',
        header: 'Tanggal',
        render: (row) => (
          <span>
            {row.tanggalPengajuan &&
            !row.tanggalPengajuan.match(
              /^[a-z0-9]{20,}$/i
            )
              ? formatDateShort(
                  row.tanggalPengajuan
                )
              : '-'}
          </span>
        ),
      },

      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <StatusBadge
            status={
              row.status as any
            }
          />
        ),
      },

      {
        key: 'actions',
        header: 'Aksi',
        render: (row) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()

              navigate(
                `/admin/mustahik/${row.mustahikId}`
              )
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Eye className="w-4 h-4 mr-1" />
            Detail
          </Button>
        ),
      },
    ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Mustahik"
        description={`${filtered.length} dari ${rows.length} mustahik`}
      />

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <Input
            placeholder="Cari nama atau NIK..."
            className="pl-9"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        <Select
          value={
            statusFilter
          }
          onValueChange={
            setStatusFilter
          }
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Semua Status
            </SelectItem>

            <SelectItem value="DRAFT">
              Draft
            </SelectItem>

            <SelectItem value="MENUNGGU_VERIFIKASI">
              Menunggu Verifikasi
            </SelectItem>

            <SelectItem value="SEDANG_DIVERIFIKASI">
              Sedang Diverifikasi
            </SelectItem>

            <SelectItem value="PERLU_PERBAIKAN">
              Perlu Perbaikan
            </SelectItem>

            <SelectItem value="DITOLAK">
              Ditolak
            </SelectItem>

            <SelectItem value="DIPROSES_TOPSIS">
              Diproses TOPSIS
            </SelectItem>

            <SelectItem value="LAYAK_DIDANAI">
              Layak Didanai
            </SelectItem>

            <SelectItem value="TIDAK_DIDANAI">
              Tidak Didanai
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="Tidak ada data yang sesuai"
          onRowClick={(row) =>
            navigate(
              `/admin/mustahik/${row.mustahikId}`
            )
          }
        />
      )}
    </div>
  )
}