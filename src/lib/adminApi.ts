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

// ============================================================
// MUSTAHIK
// ============================================================

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

// ============================================================
// KRITERIA
// ============================================================

export type KriteriaTipe =
  | 'BENEFIT'
  | 'COST'

export interface AdminSubKriteria {
  id: string
  kriteriaId: string
  nama: string
  nilai: string | number
  keterangan?: string | null

  kriteria?: {
    id: string
    kode: string
    nama: string
    bobot: string | number
    tipe: KriteriaTipe
  }

  createdAt?: string
  updatedAt?: string
}

export interface AdminKriteria {
  id: string
  kode: string
  nama: string
  bobot: string | number
  tipe: KriteriaTipe
  deskripsi?: string | null
  aktif?: boolean

  subKriteria?: AdminSubKriteria[]

  createdAt?: string
  updatedAt?: string
}

// ============================================================
// VERIFIKASI
// ============================================================

export interface AdminJawaban {
  id: string
  pengajuanId: string
  kriteriaId: string
  subKriteriaId: string

  nilai: string | number

  kriteria?: {
    id: string
    kode: string
    nama: string
    bobot: string | number
    tipe: KriteriaTipe
    deskripsi?: string | null
  }

  subKriteria?: {
    id: string
    kriteriaId: string
    nama: string
    nilai: string | number
    keterangan?: string | null
  }

  createdAt?: string
  updatedAt?: string
}

export interface AdminVerificationRecord {
  id: string
  pengajuanId: string
  adminId: string

  status:
    | 'LOLOS'
    | 'PERLU_PERBAIKAN'
    | 'DITOLAK'

  catatan?: string | null

  admin?: {
    id: string
    name: string
    email: string
  }

  createdAt: string
  updatedAt?: string
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

  verifications: AdminVerificationRecord[]

  jawaban?: AdminJawaban[]
}

export interface AdminVerificationDetail
  extends AdminVerifikasi {
  jawaban: AdminJawaban[]
}

// ============================================================
// TOPSIS
// ============================================================

export interface AdminTopsisDetail {
  id: string
  topsisResultId: string
  kriteriaId: string

  nilaiAwal: string | number
  nilaiNormalisasi: string | number
  nilaiTerbobot: string | number

  kriteria?: {
    id: string
    kode: string
    nama: string
    bobot: string | number
    tipe: KriteriaTipe
  }
}

export interface AdminTopsisResult {
  id: string
  pengajuanId: string

  nilaiPreferensi: string | number

  ranking: number

  status:
    | 'LAYAK_DIDANAI'
    | 'TIDAK_DIDANAI'

  tanggalProses: string

  pengajuan: {
    id: string

    status?: string

    mustahik: {
      id: string
      namaLengkap: string
      nik: string
    }
  }

  details: AdminTopsisDetail[]
}

// ============================================================
// HELPER RESPONSE
// ============================================================

interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

function getData<T>(
  response: {
    data?: ApiResponse<T>
  }
): T {
  return response.data?.data as T
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response =
    await api.get(
      '/admin/dashboard'
    )

  return getData<AdminDashboardData>(
    response
  )
}

// ============================================================
// DATA MUSTAHIK
// ============================================================

export async function getAdminMustahik(
  search = ''
): Promise<{
  mustahik: AdminMustahik[]
}> {
  const response =
    await api.get(
      '/admin/mustahik',
      {
        params:
          search.trim()
            ? {
                q: search.trim(),
              }
            : undefined,
      }
    )

  return getData<{
    mustahik: AdminMustahik[]
  }>(response)
}

// ============================================================
// DETAIL MUSTAHIK
// ============================================================

export async function getAdminMustahikDetail(
  id: string
): Promise<{
  mustahik: AdminMustahik
}> {
  const response =
    await api.get(
      `/admin/mustahik/${id}`
    )

  return getData<{
    mustahik: AdminMustahik
  }>(response)
}

// ============================================================
// UPDATE MUSTAHIK
// ============================================================

export async function updateAdminMustahik(
  id: string,
  data: Partial<AdminMustahik>
): Promise<{
  mustahik: AdminMustahik
}> {
  const response =
    await api.put(
      `/admin/mustahik/${id}`,
      data
    )

  return getData<{
    mustahik: AdminMustahik
  }>(response)
}

// ============================================================
// DELETE MUSTAHIK
// ============================================================

export async function deleteAdminMustahik(
  id: string
): Promise<void> {
  await api.delete(
    `/admin/mustahik/${id}`
  )
}

// ============================================================
// VERIFIKASI
// ============================================================

export async function getAdminVerifikasi(
  status?: string
): Promise<{
  pengajuan: AdminVerifikasi[]
}> {
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
    pengajuan: AdminVerifikasi[]
  }>(response)
}

// ============================================================
// DETAIL VERIFIKASI
// ============================================================

export async function getAdminVerifikasiDetail(
  id: string
): Promise<AdminVerificationDetail> {
  const response =
    await api.get(
      `/admin/verifikasi/${id}`
    )

  const data =
    getData<{
      pengajuan: AdminVerificationDetail
    }>(response)

  return data.pengajuan
}

// ============================================================
// SUBMIT VERIFIKASI
// ============================================================

export async function submitAdminVerifikasi(
  id: string,
  status:
    | 'LOLOS'
    | 'PERLU_PERBAIKAN'
    | 'DITOLAK',
  catatan?: string
): Promise<{
  pengajuanStatus: string
}> {
  const response =
    await api.post(
      `/admin/verifikasi/${id}`,
      {
        status,
        catatan,
      }
    )

  return getData<{
    pengajuanStatus: string
  }>(response)
}

// ============================================================
// KRITERIA
// ============================================================

export async function getAdminKriteria(): Promise<
  AdminKriteria[]
> {
  const response =
    await api.get(
      '/admin/kriteria'
    )

  const data =
    getData<{
      kriteria: AdminKriteria[]
    }>(response)

  return data.kriteria
}

// ============================================================
// CREATE KRITERIA
// ============================================================

export async function createAdminKriteria(
  data: {
    kode: string
    nama: string
    bobot: number
    tipe: KriteriaTipe
    deskripsi?: string
    aktif?: boolean
  }
): Promise<{
  kriteria: AdminKriteria
}> {
  const response =
    await api.post(
      '/admin/kriteria',
      data
    )

  return getData<{
    kriteria: AdminKriteria
  }>(response)
}

// ============================================================
// UPDATE KRITERIA
// ============================================================

export async function updateAdminKriteria(
  id: string,
  data: {
    kode?: string
    nama?: string
    bobot?: number
    tipe?: KriteriaTipe
    deskripsi?: string
    aktif?: boolean
  }
): Promise<{
  kriteria: AdminKriteria
}> {
  const response =
    await api.put(
      `/admin/kriteria/${id}`,
      data
    )

  return getData<{
    kriteria: AdminKriteria
  }>(response)
}

// ============================================================
// DELETE KRITERIA
// ============================================================

export async function deleteAdminKriteria(
  id: string
): Promise<void> {
  await api.delete(
    `/admin/kriteria/${id}`
  )
}

// ============================================================
// SUBKRITERIA
// ============================================================

export async function getAdminSubKriteria(
  kriteriaId?: string
): Promise<{
  subKriteria: AdminSubKriteria[]
}> {
  const response =
    await api.get(
      '/admin/subkriteria',
      {
        params:
          kriteriaId
            ? {
                kriteriaId,
              }
            : undefined,
      }
    )

  return getData<{
    subKriteria: AdminSubKriteria[]
  }>(response)
}

// ============================================================
// CREATE SUBKRITERIA
// ============================================================

export async function createAdminSubKriteria(
  data: {
    kriteriaId: string
    nama: string
    nilai: number
    keterangan?: string
  }
): Promise<{
  subKriteria: AdminSubKriteria
}> {
  const response =
    await api.post(
      '/admin/subkriteria',
      data
    )

  return getData<{
    subKriteria: AdminSubKriteria
  }>(response)
}

// ============================================================
// UPDATE SUBKRITERIA
// ============================================================

export async function updateAdminSubKriteria(
  id: string,
  data: {
    nama?: string
    nilai?: number
    keterangan?: string
  }
): Promise<{
  subKriteria: AdminSubKriteria
}> {
  const response =
    await api.put(
      `/admin/subkriteria/${id}`,
      data
    )

  return getData<{
    subKriteria: AdminSubKriteria
  }>(response)
}

// ============================================================
// DELETE SUBKRITERIA
// ============================================================

export async function deleteAdminSubKriteria(
  id: string
): Promise<void> {
  await api.delete(
    `/admin/subkriteria/${id}`
  )
}

// ============================================================
// TOPSIS - GET ALL RESULTS
// ============================================================

export async function getAdminTopsisResults(): Promise<
  AdminTopsisResult[]
> {
  const response =
    await api.get(
      '/admin/topsis/results'
    )

  const data =
    getData<{
      results: AdminTopsisResult[]
    }>(response)

  return data.results
}

// ============================================================
// TOPSIS - GET DETAIL RESULT
// ============================================================

export async function getAdminTopsisResult(
  id: string
): Promise<{
  result: AdminTopsisResult
}> {
  const response =
    await api.get(
      `/admin/topsis/results/${id}`
    )

  return getData<{
    result: AdminTopsisResult
  }>(response)
}

// ============================================================
// TOPSIS - PROCESS
// ============================================================

export async function processAdminTopsis(
  layakThreshold: number
): Promise<{
  threshold: number
  results: AdminTopsisResult[]
}> {
  const response =
    await api.post(
      '/admin/topsis/process',
      {
        layakThreshold,
      }
    )

  return getData<{
    threshold: number
    results: AdminTopsisResult[]
  }>(response)
}