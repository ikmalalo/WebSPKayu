import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  ShieldCheck,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'

import {
  getAdminVerifikasi,
} from '@/lib/adminApi'

import {
  formatDateShort,
} from '@/lib/utils'

import type {
  Column,
  Pengajuan,
} from '@/types'

type Filter =
  | 'all'
  | 'menunggu'
  | 'selesai'

interface Row
  extends Pengajuan {
  namaLengkap: string
  nik: string
}

export function VerifikasiPage() {
  const navigate =
    useNavigate()

  const [
    data,
    setData,
  ] = useState<any[]>([])

  const [
    filter,
    setFilter,
  ] =
    useState<Filter>('all')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  useEffect(() => {
    const load =
      async () => {
        try {
          setLoading(true)

          const result =
            await getAdminVerifikasi()

          setData(result)
        } catch (err: any) {
          console.error(err)

          setError(
            err.response
              ?.data?.message ||
            'Gagal mengambil data verifikasi.'
          )
        } finally {
          setLoading(false)
        }
      }

    load()
  }, [])

  const rows: Row[] =
    useMemo(
      () =>
        data.map(
          (item) => ({
            id: item.id,
            userId:
              item.userId,
            mustahikId:
              item.mustahikId,
            namaLengkap:
              item.mustahik
                ?.namaLengkap ||
              '-',
            nik:
              item.mustahik
                ?.nik ||
              '-',
            status:
              item.status,
            tanggalPengajuan:
              item.tanggalPengajuan,
            tanggalVerifikasi:
              item.tanggalVerifikasi ||
              undefined,
            catatan:
              item.catatan ||
              undefined,
          })),
      [data]
    )

  const filtered =
    rows.filter(
      (row) => {
        if (
          filter ===
          'menunggu'
        ) {
          return [
            'MENUNGGU_VERIFIKASI',
            'SEDANG_DIVERIFIKASI',
          ].includes(
            row.status
          )
        }

        if (
          filter ===
          'selesai'
        ) {
          return [
            'LOLOS_VERIFIKASI',
            'PERLU_PERBAIKAN',
            'DITOLAK',
            'DIPROSES_TOPSIS',
            'LAYAK_DIDANAI',
            'TIDAK_DIDANAI',
          ].includes(
            row.status
          )
        }

        return true
      }
    )

  const columns:
    Column<Row>[] = [
      {
        key: 'id',
        header: 'ID Pengajuan',
        render: (row) => (
          <span className="font-mono text-xs text-slate-500">
            #{row.id.toUpperCase()}
          </span>
        ),
      },

      {
        key: 'namaLengkap',
        header: 'Nama Mustahik',
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
        header: 'Tgl Pengajuan',
        render: (row) =>
          formatDateShort(
            row.tanggalPengajuan
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
        header: 'Proses',
        render: (row) => (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()

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
      />

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          {
            id: 'all',
            label: 'Semua Status',
          },
          {
            id: 'menunggu',
            label: 'Perlu Verifikasi',
          },
          {
            id: 'selesai',
            label: 'Sudah Diverifikasi',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() =>
              setFilter(
                item.id as Filter
              )
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter ===
              item.id
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="Tidak ada pengajuan untuk verifikasi"
          onRowClick={(row) =>
            navigate(
              `/admin/verifikasi/${row.id}`
            )
          }
        />
      )}
    </div>
  )
}