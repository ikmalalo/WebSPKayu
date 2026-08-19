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
} from '@/lib/adminApi'

import type {
  AdminPengajuan,
} from '@/lib/adminApi'

import type {
  Column,
  StatusPengajuan,
} from '@/types'


// ============================================================
// PAGE
// ============================================================

export function VerifikasiPage() {
  const navigate =
    useNavigate()

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    data,
    setData,
  ] = useState<
    AdminPengajuan[]
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


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const load =
    async () => {
      try {
        setLoading(true)
        setError('')

        const result =
          await getAdminVerifikasi()

        /*
         * getAdminVerifikasi()
         * mengembalikan AdminPengajuan[]
         *
         * BUKAN:
         *
         * {
         *   pengajuan: [...]
         * }
         *
         * Jadi langsung masukkan result ke state.
         */

        setData(
          Array.isArray(
            result
          )
            ? result
            : []
        )
      } catch (
        error: unknown
      ) {
        console.error(
          'GET VERIFIKASI ERROR:',
          error
        )

        let message =
          'Terjadi kesalahan pada server'

        if (
          error instanceof Error &&
          error.message
        ) {
          message =
            error.message
        }

        setError(
          message
        )
      } finally {
        setLoading(false)
      }
    }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void load()
  }, [])


  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filtered =
    useMemo(
      () => {
        if (
          filter ===
          'menunggu'
        ) {
          return data.filter(
            (
              item
            ) =>
              item.status ===
                'MENUNGGU_VERIFIKASI' ||
              item.status ===
                'SEDANG_DIVERIFIKASI'
          )
        }

        if (
          filter ===
          'selesai'
        ) {
          return data.filter(
            (
              item
            ) =>
              item.status ===
                'LOLOS_VERIFIKASI' ||
              item.status ===
                'PERLU_PERBAIKAN' ||
              item.status ===
                'DITOLAK' ||
              item.status ===
                'DIPROSES_TOPSIS' ||
              item.status ===
                'LAYAK_DIDANAI' ||
              item.status ===
                'TIDAK_DIDANAI'
          )
        }

        return data
      },
      [
        data,
        filter,
      ]
    )


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate =
    (
      value?:
        | string
        | null
    ) => {
      if (!value) {
        return '-'
      }

      const date =
        new Date(
          value
        )

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return '-'
      }

      return date.toLocaleDateString(
        'id-ID',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }
      )
    }


  // ==========================================================
  // STATUS VALIDATOR
  // ==========================================================

  const isStatusPengajuan =
    (
      value: string
    ): value is StatusPengajuan => {
      return [
        'DRAFT',
        'MENUNGGU_VERIFIKASI',
        'SEDANG_DIVERIFIKASI',
        'PERLU_PERBAIKAN',
        'LOLOS_VERIFIKASI',
        'DITOLAK',
        'DIPROSES_TOPSIS',
        'LAYAK_DIDANAI',
        'TIDAK_DIDANAI',
      ].includes(
        value
      )
    }


  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const columns:
    Column<AdminPengajuan>[] =
    [
      // ------------------------------------------------------
      // ID
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // NAMA MUSTAHIK
      // ------------------------------------------------------

      {
        key:
          'namaLengkap',

        header:
          'Nama Mustahik',

        render: (
          row
        ) => (
          <span className="font-medium text-slate-800">
            {
              row
                .mustahik
                ?.namaLengkap ||
              row
                .user
                ?.name ||
              '-'
            }
          </span>
        ),
      },


      // ------------------------------------------------------
      // NIK
      // ------------------------------------------------------

      {
        key: 'nik',

        header:
          'NIK',

        render: (
          row
        ) => (
          <span className="font-mono text-xs text-slate-700">
            {
              row
                .mustahik
                ?.nik ||
              '-'
            }
          </span>
        ),
      },


      // ------------------------------------------------------
      // TANGGAL PENGAJUAN
      // ------------------------------------------------------

      {
        key:
          'tanggalPengajuan',

        header:
          'Tgl Pengajuan',

        render: (
          row
        ) =>
          formatDate(
            row.tanggalPengajuan
          ),
      },


      // ------------------------------------------------------
      // STATUS
      // ------------------------------------------------------

      {
        key: 'status',

        header:
          'Status',

        render: (
          row
        ) => {
          const status =
            String(
              row.status
            )

          if (
            isStatusPengajuan(
              status
            )
          ) {
            return (
              <StatusBadge
                status={
                  status
                }
              />
            )
          }

          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-100 text-slate-600 border-slate-200">
              {status}
            </span>
          )
        },
      },


      // ------------------------------------------------------
      // ACTION
      // ------------------------------------------------------

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


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        title="Verifikasi Pengajuan"
        description="Kelola dan validasi pengajuan calon mustahik dari database"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void load()
          }
          disabled={
            loading
          }
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${
              loading
                ? 'animate-spin'
                : ''
            }`}
          />

          Refresh
        </Button>
      </PageHeader>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4">
          <span>
            {error}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void load()
            }
          >
            Coba Lagi
          </Button>
        </div>
      )}


      {/* ======================================================
          FILTER
      ====================================================== */}

      <div className="flex gap-2 border-b border-slate-200 pb-3">

        {/* SEMUA */}

        <button
          type="button"
          onClick={() =>
            setFilter(
              'all'
            )
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter ===
            'all'
              ? 'bg-green-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Status
        </button>


        {/* MENUNGGU */}

        <button
          type="button"
          onClick={() =>
            setFilter(
              'menunggu'
            )
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter ===
            'menunggu'
              ? 'bg-green-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Perlu Verifikasi
        </button>


        {/* SELESAI */}

        <button
          type="button"
          onClick={() =>
            setFilter(
              'selesai'
            )
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter ===
            'selesai'
              ? 'bg-green-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Sudah Diverifikasi
        </button>
      </div>


      {/* ======================================================
          TABLE
      ====================================================== */}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />

            <span>
              Memuat data verifikasi...
            </span>
          </div>
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