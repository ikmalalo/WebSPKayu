import api from './api'

// ============================================================
// TYPES
// ============================================================

export interface AdminDashboardData {
  totalMustahik: number
  pengajuanBaru: number
  menungguVerifikasi: number
  sudahDiverifikasi: number
  layakDidanai: number
  tidakDidanai: number

  chart: Array<{
    bulan: string
    pengajuan: number
    lolos: number
    ditolak: number
  }>

  statusDistribution: Array<{
    name: string
    value: number
  }>

  pengajuanTerbaru: Array<{
    id: string
    status: string
    tanggalPengajuan: string
    mustahik: {
      id: string
      namaLengkap: string
      nik: string
    }
  }>
}

export interface AdminMustahik {
  id: string
  userId: string
  nik: string
  namaLengkap: string
  tempatLahir?: string | null
  tanggalLahir?: string | null
  jenisKelamin?: string | null
  alamat?: string | null
  kelurahan?: string | null
  kecamatan?: string | null
  kota?: string | null
  provinsi?: string | null
  noHp?: string | null
  statusPernikahan?: string | null
  pekerjaan?: string | null
  penghasilan?: string | number | null
  jumlahTanggungan?: number | null
  statusRumah?: string | null
  kondisiRumah?: string | null
  kepemilikanAset?: string | null

  user?: {
    id: string
    name: string
    email: string
    phone: string | null
  }

  pengajuan?: Array<{
    id: string
    status: string
    tanggalPengajuan: string
    tanggalVerifikasi?: string | null
    catatan?: string | null
  }>
}

export interface AdminVerifikasi {
  id: string
  userId: string
  mustahikId: string
  status: string
  catatan?: string | null
  tanggalPengajuan: string
  tanggalVerifikasi?: string | null

  mustahik: AdminMustahik

  user: {
    id: string
    name: string
    email: string
  }

  verifications: Array<{
    id: string
    status: string
    catatan?: string | null
    createdAt: string
  }>
}

export interface AdminTopsisResult {
  id: string
  pengajuanId: string
  nilaiPreferensi:
    string | number
  ranking: number
  status:
    | 'LAYAK_DIDANAI'
    | 'TIDAK_DIDANAI'
  tanggalProses: string

  pengajuan: {
    id: string

    mustahik: {
      id: string
      namaLengkap: string
      nik: string
    }
  }
}

// ============================================================
// HELPER
// ============================================================

function getData<T>(
  response: {
    data?: {
      success?: boolean
      data?: T
    }
  }
): T {
  return response.data
    ?.data as T
}

// ============================================================
// DASHBOARD
// ============================================================

export async function
  getAdminDashboard() {
  const response =
    await api.get(
      '/admin/dashboard'
    )

  return getData<AdminDashboardData>(
    response
  )
}

// ============================================================
// MUSTAHIK
// ============================================================

export async function
  getAdminMustahik(
    search = ''
  ) {
  const response =
    await api.get(
      '/admin/mustahik',
      {
        params:
          search.trim()
            ? {
                q:
                  search.trim(),
              }
            : undefined,
      }
    )

  return getData<{
    mustahik:
      AdminMustahik[]
  }>(response)
}

// ============================================================
// DETAIL MUSTAHIK
// ============================================================

export async function
  getAdminMustahikDetail(
    id: string
  ) {
  const response =
    await api.get(
      `/admin/mustahik/${id}`
    )

  return getData<{
    mustahik:
      AdminMustahik
  }>(response)
}

// ============================================================
// VERIFIKASI
// ============================================================

export async function
  getAdminVerifikasi(
    status?: string
  ) {
  const response =
    await api.get(
      '/admin/verifikasi',
      {
        params:
          status &&
          status !== 'all'
            ? {
                status,
              }
            : undefined,
      }
    )

  return getData<{
    pengajuan:
      AdminVerifikasi[]
  }>(response)
}

// ============================================================
// DETAIL VERIFIKASI
// ============================================================

export async function
  getAdminVerifikasiDetail(
    id: string
  ) {
  const response =
    await api.get(
      `/admin/verifikasi/${id}`
    )

  return getData<{
    pengajuan:
      AdminVerifikasi
  }>(response)
}

// ============================================================
// SUBMIT VERIFIKASI
// ============================================================

export async function
  submitAdminVerifikasi(
    id: string,
    status:
      | 'LOLOS'
      | 'PERLU_PERBAIKAN'
      | 'DITOLAK',
    catatan?: string
  ) {
  const response =
    await api.post(
      `/admin/verifikasi/${id}`,
      {
        status,
        catatan,
      }
    )

  return getData<{
    pengajuanStatus:
      string
  }>(response)
}

// ============================================================
// TOPSIS
// ============================================================

export async function
  getAdminTopsisResults() {
  const response =
    await api.get(
      '/admin/topsis/results'
    )

  return getData<{
    results:
      AdminTopsisResult[]
  }>(response)
}

// ============================================================
// PROSES TOPSIS
// ============================================================

export async function
  processAdminTopsis(
    layakThreshold: number
  ) {
  const response =
    await api.post(
      '/admin/topsis/process',
      {
        layakThreshold,
      }
    )

  return getData<{
    threshold: number
    results:
      AdminTopsisResult[]
  }>(response)
}