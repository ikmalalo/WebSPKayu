import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ShieldCheck,
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
  StatusBadge,
} from '@/components/shared/StatusBadge'

import {
  PageHeader,
} from '@/components/shared/PageHeader'

import {
  DataTable,
} from '@/components/shared/DataTable'

import {
  getAdminVerifikasi,
  type AdminVerifikasi,
} from '@/lib/adminApi'

import type {
  Column,
} from '@/types'

export function VerifikasiPage() {
  const navigate =
    useNavigate()

  const [
    data,
    setData,
  ] = useState<
    AdminVerifikasi[]
  >([])

  const [
    filter,
    setFilter,
  ] = useState<
    'all' |
    'menunggu' |
    'selesai'
  >('all')

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
          await getAdminVerifikasi()

        setData(
          result.pengajuan
        )
      } catch (error: any) {
        console.error(
          'GET VERIFIKASI ERROR:',
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
    load()
  }, [])

  const filtered =
    useMemo(() => {
      if (
        filter ===
        'menunggu'
      ) {
        return data.filter(
          (item) =>
            [
              'MENUNGGU_VERIFIKASI',
              'SEDANG_DIVERIFIKASI',
            ].includes(
              item.status
            )
        )
      }

      if (
        filter ===
        'selesai'
      ) {
        return data.filter(
          (item) =>
            [
              'LOLOS_VERIFIKASI',
              'PERLU_PERBAIKAN',
              'DITOLAK',
            ].includes(
              item.status
            )
        )
      }

      return data
    }, [
      data,
      filter,
    ])

  const columns:
    Column<AdminVerifikasi>[] =
    [
      {
        key: 'id',

        header:
          'ID Pengajuan',

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
          'Nama Mustahik',

        render: (
          row
        ) => (
          <span className="font-medium">
            {
              row
                .mustahik
                .namaLengkap
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
            {
              row
                .mustahik
                .nik
            }
          </span>
        ),
      },

      {
        key:
          'tanggalPengajuan',

        header:
          'Tgl Pengajuan',

        render: (
          row
        ) =>
          new Date(
            row.tanggalPengajuan
          ).toLocaleDateString(
            'id-ID'
          ),
      },

      {
        key: 'status',

        header:
          'Status',

        render: (
          row
        ) => (
          <StatusBadge
            status={
              row.status as any
            }
          />
        ),
      },

      {
        key:
          'actions',

        header:
          'Proses',

        render: (
          row
        ) => (
          <Button
            size="sm"
            onClick={(
              event
            ) => {
              event.stopPropagation()

              navigate(
                `/admin/verifikasi/${row.id}`
              )
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ShieldCheck className="w-4 h-4 mr-1" />

            Verifikasi
          </Button>
        ),
      },
    ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Pengajuan"
        description="Kelola dan validasi pengajuan calon mustahik dari database"
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

      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          {
            id: 'all',
            label:
              'Semua Status',
          },

          {
            id:
              'menunggu',
            label:
              'Perlu Verifikasi',
          },

          {
            id:
              'selesai',
            label:
              'Sudah Diverifikasi',
          },
        ].map(
          (item) => (
            <button
              key={
                item.id
              }
              onClick={() =>
                setFilter(
                  item.id as
                    | 'all'
                    | 'menunggu'
                    | 'selesai'
                )
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filter ===
                item.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {
                item.label
              }
            </button>
          )
        )}
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
          emptyMessage="Tidak ada pengajuan untuk verifikasi"
          onRowClick={(
            row
          ) =>
            navigate(
              `/admin/verifikasi/${row.id}`
            )
          }
        />
      )}
    </div>
  )
}