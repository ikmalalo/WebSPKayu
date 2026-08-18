import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Search,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

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
  StatusBadge,
} from '@/components/shared/StatusBadge'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  DataTable,
} from '@/components/shared/DataTable'

import {
  getAdminMustahik,
  type AdminMustahik,
} from '@/lib/adminApi'

import type {
  Column,
} from '@/types'

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
    search,
    setSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const load =
    async () => {
      try {
        setLoading(true)
        setError('')

        const result =
          await getAdminMustahik(
            search
          )

        setData(
          result.mustahik
        )
      } catch (error: any) {
        console.error(
          'GET MUSTAHIK ERROR:',
          error
        )

        setError(
          error.response
            ?.data?.message ||
            'Terjadi kesalahan pada server'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    const timer =
      setTimeout(
        load,
        300
      )

    return () =>
      clearTimeout(timer)
  }, [search])

  const filtered =
    useMemo(() => {
      if (
        statusFilter ===
        'all'
      ) {
        return data
      }

      return data.filter(
        (item) =>
          item
            .pengajuan?.[0]
            ?.status ===
          statusFilter
      )
    }, [
      data,
      statusFilter,
    ])

  const columns:
    Column<AdminMustahik>[] =
    [
      {
        key: 'id',

        header: 'ID',

        render: (
          row
        ) => (
          <span className="font-mono text-xs text-slate-500">
            #
            {row.id.slice(
              0,
              8
            )}
          </span>
        ),
      },

      {
        key:
          'namaLengkap',

        header:
          'Nama Lengkap',

        render: (
          row
        ) => (
          <span className="font-medium">
            {
              row.namaLengkap
            }
          </span>
        ),
      },

      {
        key: 'nik',

        header: 'NIK',

        render: (
          row
        ) => (
          <span className="font-mono text-xs">
            {row.nik}
          </span>
        ),
      },

      {
        key:
          'tanggalPengajuan',

        header:
          'Tanggal',

        render: (
          row
        ) => {
          const date =
            row
              .pengajuan?.[0]
              ?.tanggalPengajuan

          if (!date) {
            return '-'
          }

          return new Date(
            date
          ).toLocaleDateString(
            'id-ID'
          )
        },
      },

      {
        key: 'status',

        header:
          'Status',

        render: (
          row
        ) => {
          const status =
            row
              .pengajuan?.[0]
              ?.status ||
            'DRAFT'

          return (
            <StatusBadge
              status={
                status as any
              }
            />
          )
        },
      },

      {
        key:
          'actions',

        header: 'Aksi',

        render: (
          row
        ) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(
              event
            ) => {
              event.stopPropagation()

              navigate(
                `/admin/mustahik/${row.id}`
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

  const statuses = [
    {
      value: 'all',
      label:
        'Semua Status',
    },

    {
      value:
        'DRAFT',
      label: 'Draft',
    },

    {
      value:
        'MENUNGGU_VERIFIKASI',
      label:
        'Menunggu Verifikasi',
    },

    {
      value:
        'SEDANG_DIVERIFIKASI',
      label:
        'Sedang Diverifikasi',
    },

    {
      value:
        'LOLOS_VERIFIKASI',
      label:
        'Lolos Verifikasi',
    },

    {
      value:
        'PERLU_PERBAIKAN',
      label:
        'Perlu Perbaikan',
    },

    {
      value:
        'DITOLAK',
      label: 'Ditolak',
    },

    {
      value:
        'LAYAK_DIDANAI',
      label:
        'Layak Didanai',
    },

    {
      value:
        'TIDAK_DIDANAI',
      label:
        'Tidak Didanai',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Mustahik"
        description={`${filtered.length} mustahik dari database`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={load}
        >
          <RefreshCw className="w-4 h-4 mr-2" />

          Refresh
        </Button>
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <Input
            placeholder="Cari nama atau NIK..."
            className="pl-9"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
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
            {statuses.map(
              (item) => (
                <SelectItem
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {
                    item.label
                  }
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : (
        <DataTable
          columns={
            columns
          }
          data={
            filtered
          }
          emptyMessage="Belum ada data mustahik di database"
          onRowClick={(
            row
          ) =>
            navigate(
              `/admin/mustahik/${row.id}`
            )
          }
        />
      )}
    </div>
  )
}