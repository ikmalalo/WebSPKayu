import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Search,
  Eye,
  RefreshCw,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Loader2,
  CheckCircle2,
  MapPin,
  Phone,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getAdminMustahik,
  createAdminMustahik,
  getAdminPelaksana,
  type AdminMustahik,
} from '@/lib/adminApi'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// ============================================================
// TYPES
// ============================================================

type StatusFilter =
  | 'SEMUA'
  | 'MENUNGGU_VERIFIKASI'
  | 'SEDANG_DIVERIFIKASI'
  | 'PERLU_PERBAIKAN'
  | 'LOLOS_VERIFIKASI'
  | 'DITOLAK'
  | 'DIPROSES_TOPSIS'
  | 'LAYAK_DIDANAI'
  | 'TIDAK_DIDANAI'

interface MustahikRow {
  id: string
  namaLengkap: string
  nik: string
  tanggal?: string | null
  status?: string | null
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  )
}

function getStatusLabel(
  status?: string | null
): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft'

    case 'MENUNGGU_VERIFIKASI':
      return 'Menunggu Verifikasi'

    case 'SEDANG_DIVERIFIKASI':
      return 'Sedang Diverifikasi'

    case 'PERLU_PERBAIKAN':
      return 'Perlu Perbaikan'

    case 'LOLOS_VERIFIKASI':
      return 'Lolos Verifikasi'

    case 'DITOLAK':
      return 'Ditolak'

    case 'DIPROSES_TOPSIS':
      return 'Diproses TOPSIS'

    case 'LAYAK_DIDANAI':
      return 'Direkomendasikan untuk Didanai'

    case 'TIDAK_DIDANAI':
      return 'Belum Direkomendasikan untuk Didanai'

    default:
      return status || 'Belum Ada Pengajuan'
  }
}

function getStatusClass(
  status?: string | null
): string {
  switch (status) {
    case 'LAYAK_DIDANAI':
    case 'LOLOS_VERIFIKASI':
      return 'border-green-200 bg-green-50 text-green-700'

    case 'TIDAK_DIDANAI':
    case 'DITOLAK':
      return 'border-red-200 bg-red-50 text-red-600'

    case 'DIPROSES_TOPSIS':
      return 'border-purple-200 bg-purple-50 text-purple-700'

    case 'PERLU_PERBAIKAN':
      return 'border-orange-200 bg-orange-50 text-orange-600'

    case 'MENUNGGU_VERIFIKASI':
    case 'SEDANG_DIVERIFIKASI':
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

// ============================================================
// NORMALIZER
// ============================================================
//
// Backend sekarang bisa mengembalikan:
//
// AdminMustahik[]
//
// Kita normalisasi di frontend supaya tampilan tetap aman.
// ============================================================

function normalizeMustahik(
  item: AdminMustahik
): MustahikRow {
  const raw =
    item as unknown as Record<
      string,
      unknown
    >

  // ----------------------------------------------------------
  // DATA PENGAJUAN TERBARU
  // ----------------------------------------------------------

  let latestPengajuan:
    Record<string, unknown> | null =
    null

  if (
    Array.isArray(
      raw.pengajuan
    )
  ) {
    const list =
      raw.pengajuan as Array<
        Record<string, unknown>
      >

    latestPengajuan =
      [...list].sort(
        (
          a,
          b
        ) => {
          const dateA =
            new Date(
              String(
                a.createdAt ??
                a.tanggalPengajuan ??
                0
              )
            ).getTime()

          const dateB =
            new Date(
              String(
                b.createdAt ??
                b.tanggalPengajuan ??
                0
              )
            ).getTime()

          return (
            dateB -
            dateA
          )
        }
      )[0] ?? null
  }

  // ----------------------------------------------------------
  // NAMA
  // ----------------------------------------------------------

  const nama =
    String(
      raw.namaLengkap ??
      raw.name ??
      ''
    )

  // ----------------------------------------------------------
  // NIK
  // ----------------------------------------------------------

  const nik =
    String(
      raw.nik ??
      ''
    )

  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  const status =
    String(
      raw.status ??
      latestPengajuan?.status ??
      ''
    ) || null

  // ----------------------------------------------------------
  // TANGGAL
  // ----------------------------------------------------------

  const tanggal =
    String(
      raw.tanggal ??
      raw.createdAt ??
      latestPengajuan?.tanggalPengajuan ??
      latestPengajuan?.createdAt ??
      ''
    ) || null

  return {
    id:
      String(
        raw.id ??
        ''
      ),

    namaLengkap:
      nama,

    nik,

    tanggal,

    status,
  }
}

// ============================================================
// PAGE
// ============================================================

export default function DataMustahikPage() {
  const navigate =
    useNavigate()

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    mustahik,
    setMustahik,
  ] =
    useState<AdminMustahik[]>([])

  const [
    search,
    setSearch,
  ] =
    useState('')

  const [
    searchInput,
    setSearchInput,
  ] =
    useState('')

  const [
    status,
    setStatus,
  ] =
    useState<StatusFilter>(
      'SEMUA'
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState('')

  const [page, setPage] = useState(1)
  const pageSize = 10

  // Tambah Mustahik State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createSuccess, setCreateSuccess] = useState('')
  const [pelaksanaOptions, setPelaksanaOptions] = useState<any[]>([])

  const [formMustahik, setFormMustahik] = useState({
    nik: '',
    namaLengkap: '',
    noHp: '',
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kota: 'Depok',
    provinsi: 'Jawa Barat',
    pekerjaan: '',
    statusPernikahan: 'menikah',
    pelaksanaId: '',
    catatanPenugasan: '',
  })

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          // ==================================================
          // PENTING
          // ==================================================
          //
          // getAdminMustahik sekarang menerima OBJECT:
          //
          // getAdminMustahik({
          //   search,
          //   status,
          // })
          //
          // BUKAN:
          //
          // getAdminMustahik(search)
          //
          // ==================================================

          const result =
            await getAdminMustahik({
              search:
                search.trim() ||
                undefined,

              status:
                status === 'SEMUA'
                  ? undefined
                  : status,
            })

          // ==================================================
          // PENTING
          // ==================================================
          //
          // Result SUDAH berupa:
          //
          // AdminMustahik[]
          //
          // Jadi jangan:
          //
          // result.mustahik
          //
          // ==================================================

          setMustahik(
            Array.isArray(
              result
            )
              ? result
              : []
          )

          setPage(1)
        } catch (
          err
        ) {
          console.error(
            'GET ADMIN MUSTAHIK ERROR:',
            err
          )

          setError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil data mustahik dari server.'
          )

          setMustahik([])
        } finally {
          setLoading(false)
        }
      },
      [
        search,
        status,
      ]
    )

  // ==========================================================
  // INITIAL LOAD + FILTER
  // ==========================================================

  useEffect(() => {
    void loadData()
  }, [loadData])

  // ==========================================================
  // SEARCH DEBOUNCE
  // ==========================================================

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setSearch(
            searchInput
          )
        },
        400
      )

    return () => {
      window.clearTimeout(
        timer
      )
    }
  }, [searchInput])

  // ==========================================================
  // NORMALIZE DATA
  // ==========================================================

  const rows =
    useMemo(
      () =>
        mustahik.map(
          normalizeMustahik
        ),
      [mustahik]
    )

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalData =
    rows.length

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalData /
          pageSize
      )
    )

  const currentPage =
    Math.min(
      page,
      totalPages
    )

  const paginatedRows =
    rows.slice(
      (
        currentPage -
        1
      ) *
        pageSize,
      currentPage *
        pageSize
    )

  // ==========================================================
  // STATUS COUNTER
  // ==========================================================

  const totalMustahik =
    rows.length

  const handleOpenCreate = async () => {
    setFormMustahik({
      nik: '',
      namaLengkap: '',
      noHp: '',
      alamat: '',
      kelurahan: '',
      kecamatan: '',
      kota: 'Depok',
      provinsi: 'Jawa Barat',
      pekerjaan: '',
      statusPernikahan: 'menikah',
      pelaksanaId: '',
      catatanPenugasan: '',
    })
    setCreateSuccess('')
    try {
      const pRes = await getAdminPelaksana()
      setPelaksanaOptions(pRes.pelaksana || [])
    } catch {
      // Ignore if failed
    }
    setCreateDialogOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateSubmitting(true)
    setError('')
    setCreateSuccess('')

    try {
      await createAdminMustahik({
        ...formMustahik,
        pelaksanaId: formMustahik.pelaksanaId || undefined,
      })
      setCreateSuccess('Data calon mustahik berhasil didaftarkan.')
      setCreateDialogOpen(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan calon mustahik.')
    } finally {
      setCreateSubmitting(false)
    }
  }

  // ==========================================================
  // DETAIL
  // ==========================================================

  const handleDetail =
    (
      id: string
    ) => {
      if (!id) {
        return
      }

      navigate(
        `/admin/mustahik/${id}`
      )
    }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin text-green-600" />

              <span>
                Memuat data mustahik...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Data Mustahik
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {totalMustahik}{' '}
              mustahik dari database
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                void loadData()
              }}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Refresh
            </button>

            <Button
              onClick={handleOpenCreate}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Mustahik
            </Button>
          </div>
        </div>

        {createSuccess && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3 text-sm text-green-700">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>{createSuccess}</span>
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div className="flex-1">
                <p className="font-medium text-red-800">
                  Terjadi kesalahan pada server
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    void loadData()
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            SEARCH + FILTER
        ==================================================== */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px]">

          {/* SEARCH */}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={
                searchInput
              }
              onChange={(
                event
              ) => {
                setSearchInput(
                  event.target.value
                )
              }}
              placeholder="Cari nama atau NIK..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* STATUS */}

          <select
            value={status}
            onChange={(
              event
            ) => {
              setStatus(
                event.target.value as StatusFilter
              )

              setPage(1)
            }}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="SEMUA">
              Semua Status
            </option>

            <option value="MENUNGGU_VERIFIKASI">
              Menunggu Verifikasi
            </option>

            <option value="SEDANG_DIVERIFIKASI">
              Sedang Diverifikasi
            </option>

            <option value="PERLU_PERBAIKAN">
              Perlu Perbaikan
            </option>

            <option value="LOLOS_VERIFIKASI">
              Lolos Verifikasi
            </option>

            <option value="DITOLAK">
              Ditolak
            </option>

            <option value="DIPROSES_TOPSIS">
              Diproses TOPSIS
            </option>

            <option value="LAYAK_DIDANAI">
              Direkomendasikan untuk Didanai
            </option>

            <option value="TIDAK_DIDANAI">
              Belum Direkomendasikan untuk Didanai
            </option>
          </select>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* DESKTOP */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nama Lengkap
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    NIK
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tanggal
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-14 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <Users className="h-10 w-10 text-slate-300" />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          Tidak ada data yang sesuai
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Coba ubah pencarian atau filter status.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-slate-500">
                            #
                            {item.id
                              .slice(
                                0,
                                8
                              )
                              .toLowerCase()}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {
                              item.namaLengkap
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-sm text-slate-600">
                            {
                              item.nik
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            item.tanggal
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                              item.status
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />

                            {getStatusLabel(
                              item.status
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              handleDetail(
                                item.id
                              )
                            }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 transition hover:text-green-700"
                          >
                            <Eye className="h-4 w-4" />

                            Detail
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* ==================================================
              MOBILE
          ================================================== */}

          <div className="divide-y divide-slate-100 md:hidden">
            {paginatedRows.length ===
            0 ? (
              <div className="px-5 py-14 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Tidak ada data yang sesuai
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Coba ubah pencarian atau filter.
                </p>
              </div>
            ) : (
              paginatedRows.map(
                (
                  item
                ) => (
                  <div
                    key={
                      item.id
                    }
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {
                            item.namaLengkap
                          }
                        </p>

                        <p className="mt-1 font-mono text-xs text-slate-500">
                          NIK:{' '}
                          {
                            item.nik
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            item.tanggal
                          )}
                        </p>

                        <span
                          className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                            item.status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          {getStatusLabel(
                            item.status
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleDetail(
                            item.id
                          )
                        }}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700"
                      >
                        <Eye className="h-4 w-4" />

                        Detail
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {totalData >
            pageSize && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">

              <p className="text-xs text-slate-500">
                Menampilkan{' '}
                <span className="font-medium text-slate-700">
                  {(
                    (
                      currentPage -
                      1
                    ) *
                      pageSize +
                    1
                  )}
                </span>{' '}
                -{' '}
                <span className="font-medium text-slate-700">
                  {Math.min(
                    currentPage *
                      pageSize,
                    totalData
                  )}
                </span>{' '}
                dari{' '}
                <span className="font-medium text-slate-700">
                  {totalData}
                </span>{' '}
                data
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={
                    currentPage <=
                    1
                  }
                  onClick={() => {
                    setPage(
                      (
                        previous
                      ) =>
                        Math.max(
                          1,
                          previous -
                            1
                        )
                    )
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm text-slate-600">
                  {currentPage}{' '}
                  /{' '}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage >=
                    totalPages
                  }
                  onClick={() => {
                    setPage(
                      (
                        previous
                      ) =>
                        Math.min(
                          totalPages,
                          previous +
                            1
                        )
                    )
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* DIALOG TAMBAH CALON MUSTAHIK */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Input Calon Mustahik Baru
            </DialogTitle>
            <DialogDescription>
              Daftarkan data calon mustahik ke dalam sistem untuk kemudian dilakukan survei lapangan oleh Pelaksana.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nik" className="text-xs font-semibold text-slate-700">
                  Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="nik"
                  required
                  maxLength={16}
                  placeholder="16 digit NIK"
                  value={formMustahik.nik}
                  onChange={(e) => setFormMustahik({ ...formMustahik, nik: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="namaLengkap" className="text-xs font-semibold text-slate-700">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="namaLengkap"
                  required
                  placeholder="Nama lengkap calon mustahik"
                  value={formMustahik.namaLengkap}
                  onChange={(e) => setFormMustahik({ ...formMustahik, namaLengkap: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="noHp" className="text-xs font-semibold text-slate-700">
                  Nomor HP / WhatsApp
                </Label>
                <Input
                  id="noHp"
                  placeholder="08xxxxxxxxxx"
                  value={formMustahik.noHp}
                  onChange={(e) => setFormMustahik({ ...formMustahik, noHp: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pekerjaan" className="text-xs font-semibold text-slate-700">
                  Pekerjaan
                </Label>
                <Input
                  id="pekerjaan"
                  placeholder="Contoh: Buruh Harian / Pedagang"
                  value={formMustahik.pekerjaan}
                  onChange={(e) => setFormMustahik({ ...formMustahik, pekerjaan: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alamat" className="text-xs font-semibold text-slate-700">
                Alamat Lengkap <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="alamat"
                required
                rows={2}
                placeholder="Jalan, No. Rumah, RT/RW..."
                value={formMustahik.alamat}
                onChange={(e) => setFormMustahik({ ...formMustahik, alamat: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="kelurahan" className="text-xs font-semibold text-slate-700">
                  Kelurahan / Desa <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="kelurahan"
                  required
                  placeholder="Kelurahan"
                  value={formMustahik.kelurahan}
                  onChange={(e) => setFormMustahik({ ...formMustahik, kelurahan: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kecamatan" className="text-xs font-semibold text-slate-700">
                  Kecamatan <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="kecamatan"
                  required
                  placeholder="Kecamatan"
                  value={formMustahik.kecamatan}
                  onChange={(e) => setFormMustahik({ ...formMustahik, kecamatan: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="kota" className="text-xs font-semibold text-slate-700">
                  Kota / Kabupaten
                </Label>
                <Input
                  id="kota"
                  value={formMustahik.kota}
                  onChange={(e) => setFormMustahik({ ...formMustahik, kota: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusPernikahan" className="text-xs font-semibold text-slate-700">
                  Status Pernikahan
                </Label>
                <Select
                  value={formMustahik.statusPernikahan}
                  onValueChange={(val) => setFormMustahik({ ...formMustahik, statusPernikahan: val })}
                >
                  <SelectTrigger id="statusPernikahan">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum_menikah">Belum Menikah</SelectItem>
                    <SelectItem value="menikah">Menikah</SelectItem>
                    <SelectItem value="cerai_hidup">Cerai Hidup</SelectItem>
                    <SelectItem value="cerai_mati">Cerai Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 space-y-3">
              <p className="text-xs font-semibold text-emerald-800">
                Opsi Penugasan Langsung ke Pelaksana (Opsional)
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="pelaksanaId" className="text-xs text-slate-700">
                  Pilih Pelaksana Survei
                </Label>
                <Select
                  value={formMustahik.pelaksanaId}
                  onValueChange={(val) => setFormMustahik({ ...formMustahik, pelaksanaId: val === 'NONE' ? '' : val })}
                >
                  <SelectTrigger id="pelaksanaId" className="bg-white">
                    <SelectValue placeholder="Tugaskan nanti (kosongkan)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- Tugaskan Nanti --</SelectItem>
                    {pelaksanaOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formMustahik.pelaksanaId && (
                <div className="space-y-1.5">
                  <Label htmlFor="catatanPenugasan" className="text-xs text-slate-700">
                    Catatan untuk Pelaksana
                  </Label>
                  <Input
                    id="catatanPenugasan"
                    placeholder="Contoh: Survei diutamakan sore hari..."
                    value={formMustahik.catatanPenugasan}
                    onChange={(e) => setFormMustahik({ ...formMustahik, catatanPenugasan: e.target.value })}
                    className="bg-white"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={createSubmitting}
              >
                {createSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Data'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}