import axios from 'axios'

// ============================================================
// API CONFIG
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================================
// RESPONSE HELPER
// ============================================================

function getData<T>(
  response: {
    data: any
  }
): T {
  const body = response.data

  if (
    body &&
    typeof body === 'object' &&
    'data' in body
  ) {
    return body.data as T
  }

  return body as T
}

// ============================================================
// ERROR HELPER
// ============================================================

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      fallback
    )
  }

  if (error instanceof Error) {
    return (
      error.message ||
      fallback
    )
  }

  return fallback
}

// ============================================================
// USER
// ============================================================

export interface AdminUser {
  id: string

  name: string

  email: string

  phone?: string | null

  role?: string
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

  penghasilan?:
    | number
    | string
    | null

  jumlahTanggungan?:
    | number
    | null

  statusRumah?: string | null

  kondisiRumah?: string | null

  kepemilikanAset?: string | null

  createdAt?: string

  updatedAt?: string

  user?: AdminUser

  pengajuan?: AdminPengajuan[]
}

// ============================================================
// PENGAJUAN
// ============================================================

export interface AdminPengajuan {
  id: string

  userId: string

  mustahikId: string

  status: string

  catatan?: string | null

  tanggalPengajuan?: string | null

  tanggalVerifikasi?: string | null

  createdAt?: string

  updatedAt?: string

  user?: AdminUser

  mustahik?: AdminMustahik

  jawaban?: AdminJawaban[]

  verifications?: AdminVerifikasi[]

  topsisResults?: AdminTopsisResult[]
}

// ============================================================
// JAWABAN
// ============================================================

export interface AdminJawaban {
  id: string

  pengajuanId: string

  kriteriaId: string

  subKriteriaId: string

  nilai:
    | number
    | string

  kriteria?: {
    id: string

    kode: string

    nama: string

    bobot:
      | number
      | string

    tipe:
      | 'BENEFIT'
      | 'COST'
  }

  subKriteria?: {
    id: string

    nama: string

    nilai:
      | number
      | string

    keterangan?: string | null
  }
}

// ============================================================
// VERIFIKASI
// ============================================================

export type VerificationStatus =
  | 'LOLOS'
  | 'PERLU_PERBAIKAN'
  | 'DITOLAK'

export interface AdminVerifikasi {
  id: string

  pengajuanId: string

  adminId: string

  status: VerificationStatus

  catatan?: string | null

  createdAt?: string

  updatedAt?: string

  admin?: AdminUser
}

// ============================================================
// DETAIL VERIFIKASI
// ============================================================

export interface AdminVerificationDetail {
  id: string

  pengajuanId: string

  adminId?: string | null

  status?: VerificationStatus

  catatan?: string | null

  createdAt?: string

  updatedAt?: string

  pengajuan: AdminPengajuan

  mustahik: AdminMustahik

  verifications?: AdminVerifikasi[]

  jawaban?: AdminJawaban[]
}

// ============================================================
// KRITERIA
// ============================================================

export interface AdminKriteria {
  id: string

  kode: string

  nama: string

  bobot:
    | number
    | string

  tipe:
    | 'BENEFIT'
    | 'COST'

  deskripsi?: string | null

  aktif: boolean

  subKriteria?: AdminSubKriteria[]

  createdAt?: string

  updatedAt?: string
}

// ============================================================
// SUBKRITERIA
// ============================================================

export interface AdminSubKriteria {
  id: string

  kriteriaId: string

  nama: string

  nilai:
    | number
    | string

  keterangan?: string | null

  createdAt?: string

  updatedAt?: string

  kriteria?: {
    id: string

    kode: string

    nama: string
  }
}

// ============================================================
// TOPSIS DETAIL
// ============================================================

export interface AdminTopsisDetail {
  id: string

  topsisResultId: string

  kriteriaId: string

  nilaiAwal:
    | number
    | string

  nilaiNormalisasi:
    | number
    | string

  nilaiTerbobot:
    | number
    | string

  kriteria?: AdminKriteria
}

// ============================================================
// TOPSIS RESULT
// ============================================================

export interface AdminTopsisResult {
  id: string

  pengajuanId: string

  nilaiPreferensi:
    | number
    | string

  ranking: number

  status:
    | 'LAYAK_DIDANAI'
    | 'TIDAK_DIDANAI'

  tanggalProses: string

  createdAt?: string

  updatedAt?: string

  pengajuan?: AdminPengajuan

  details?: AdminTopsisDetail[]
}

// ============================================================
// TOPSIS CANDIDATE
// ============================================================

export interface AdminTopsisCandidate {
  pengajuanId: string

  status:
    | 'LOLOS_VERIFIKASI'
    | 'DIPROSES_TOPSIS'
    | 'LAYAK_DIDANAI'
    | 'TIDAK_DIDANAI'

  mustahik: {
    id: string

    namaLengkap: string

    nik: string
  }

  jawaban: {
    kriteriaId: string

    kode: string

    nama: string

    nilai:
      | number
      | string
  }[]
}

// ============================================================
// DASHBOARD
// ============================================================

export interface AdminDashboardData {
  totalMustahik: number

  pengajuanBaru: number

  menungguVerifikasi: number

  sudahDiverifikasi: number

  layakDidanai: number

  tidakDidanai: number

  chart: {
    bulan: string

    pengajuan: number

    lolos: number

    ditolak: number
  }[]

  statusDistribution: {
    name: string

    value: number
  }[]
}

// ============================================================
// DASHBOARD API
// ============================================================

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  try {
    const response =
      await api.get(
        '/admin/dashboard'
      )

    return getData<AdminDashboardData>(
      response
    )
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil dashboard admin.'
      )
    )
  }
}

// ============================================================
// GET ALL MUSTAHIK
// ============================================================

export async function getAdminMustahik(
  params?: {
    search?: string

    status?: string
  }
): Promise<AdminMustahik[]> {
  try {
    const response =
      await api.get(
        '/admin/mustahik',
        {
          params,
        }
      )

    const data =
      getData<any>(
        response
      )

    if (Array.isArray(data)) {
      return data
    }

    if (
      Array.isArray(
        data?.mustahik
      )
    ) {
      return data.mustahik
    }

    if (
      Array.isArray(
        data?.items
      )
    ) {
      return data.items
    }

    return []
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil data mustahik.'
      )
    )
  }
}

// ============================================================
// FETCH RAW DETAIL MUSTAHIK
// ============================================================

async function fetchAdminMustahikDetail(
  id: string
): Promise<AdminMustahik> {
  const response =
    await api.get(
      `/admin/mustahik/${id}`
    )

  const body =
    response.data

  const data =
    body?.data ??
    body

  if (
    data?.mustahik
  ) {
    return data.mustahik
  }

  if (
    data?.id &&
    data?.namaLengkap
  ) {
    return data as AdminMustahik
  }

  throw new Error(
    'Data detail mustahik tidak ditemukan.'
  )
}

// ============================================================
// GET DETAIL MUSTAHIK
// ============================================================

export async function getAdminMustahikDetail(
  id: string
): Promise<{
  mustahik: AdminMustahik
}> {
  try {
    const mustahik =
      await fetchAdminMustahikDetail(
        id
      )

    return {
      mustahik,
    }
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil detail mustahik.'
      )
    )
  }
}

// ============================================================
// GET DETAIL MUSTAHIK BY ID
// ============================================================

export async function getAdminMustahikById(
  id: string
): Promise<{
  mustahik: AdminMustahik
}> {
  return getAdminMustahikDetail(
    id
  )
}

// ============================================================
// UPDATE MUSTAHIK
// ============================================================

export async function updateAdminMustahik(
  id: string,
  payload: Partial<AdminMustahik>
): Promise<AdminMustahik> {
  try {
    const response =
      await api.put(
        `/admin/mustahik/${id}`,
        payload
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.mustahik ||
      data
    )
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal memperbarui data mustahik.'
      )
    )
  }
}

// ============================================================
// DELETE MUSTAHIK
// ============================================================

export async function deleteAdminMustahik(
  id: string
): Promise<void> {
  try {
    await api.delete(
      `/admin/mustahik/${id}`
    )
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal menghapus data mustahik.'
      )
    )
  }
}

// ============================================================
// GET VERIFIKASI
// ============================================================

export async function getAdminVerifikasi(
  params?: {
    status?: string
  }
): Promise<AdminPengajuan[]> {
  try {
    const response =
      await api.get(
        '/admin/verifikasi',
        {
          params,
        }
      )

    const data =
      getData<any>(
        response
      )

    if (Array.isArray(data)) {
      return data
    }

    if (
      Array.isArray(
        data?.pengajuan
      )
    ) {
      return data.pengajuan
    }

    if (
      Array.isArray(
        data?.items
      )
    ) {
      return data.items
    }

    return []
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil data verifikasi.'
      )
    )
  }
}

// ============================================================
// GET DETAIL VERIFIKASI
// ============================================================

export async function getAdminVerifikasiDetail(
  id: string
): Promise<AdminVerificationDetail> {
  try {
    const response =
      await api.get(
        `/admin/verifikasi/${id}`
      )

    const body =
      response.data

    const data =
      body?.data ??
      body

    const detail =
      data?.detail ??
      data?.verifikasi ??
      data

    if (!detail) {
      throw new Error(
        'Detail verifikasi tidak ditemukan.'
      )
    }

    /*
     * Normalisasi supaya DetailVerifikasiPage
     * selalu menerima struktur yang sama.
     */

    const pengajuan =
      detail.pengajuan ??
      data?.pengajuan

    const mustahik =
      detail.mustahik ??
      pengajuan?.mustahik

    const verifications =
      detail.verifications ??
      pengajuan?.verifications ??
      []

    const jawaban =
      detail.jawaban ??
      pengajuan?.jawaban ??
      []

    if (
      !pengajuan ||
      !mustahik
    ) {
      throw new Error(
        'Data pengajuan atau mustahik pada detail verifikasi tidak ditemukan.'
      )
    }

    return {
      ...detail,

      pengajuan,

      mustahik,

      verifications,

      jawaban,
    } as AdminVerificationDetail
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil detail verifikasi.'
      )
    )
  }
}

// ============================================================
// ALIAS DETAIL VERIFIKASI
// ============================================================

export async function getAdminVerifikasiById(
  id: string
): Promise<AdminVerificationDetail> {
  return getAdminVerifikasiDetail(
    id
  )
}

// ============================================================
// SUBMIT VERIFIKASI
// ============================================================

export async function submitAdminVerifikasi(
  id: string,
  payload: {
    status: VerificationStatus

    catatan?: string
  }
): Promise<AdminVerifikasi> {
  try {
    const response =
      await api.post(
        `/admin/verifikasi/${id}`,
        payload
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.verifikasi ||
      data
    ) as AdminVerifikasi
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal menyimpan verifikasi.'
      )
    )
  }
}

// ============================================================
// CREATE VERIFIKASI
// ============================================================

export async function createAdminVerifikasi(
  id: string,
  payload: {
    status: VerificationStatus

    catatan?: string
  }
): Promise<AdminVerifikasi> {
  return submitAdminVerifikasi(
    id,
    payload
  )
}

// ============================================================
// UPDATE VERIFIKASI
// ============================================================

export async function updateAdminVerifikasi(
  id: string,
  payload: {
    status: VerificationStatus

    catatan?: string
  }
): Promise<AdminVerifikasi> {
  try {
    const response =
      await api.put(
        `/admin/verifikasi/${id}`,
        payload
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.verifikasi ||
      data
    ) as AdminVerifikasi
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal memperbarui verifikasi.'
      )
    )
  }
}

// ============================================================
// KRITERIA
// ============================================================

export async function getAdminKriteria(): Promise<AdminKriteria[]> {
  try {
    const response =
      await api.get(
        '/admin/kriteria'
      )

    const data =
      getData<any>(
        response
      )

    if (Array.isArray(data)) {
      return data
    }

    if (
      Array.isArray(
        data?.kriteria
      )
    ) {
      return data.kriteria
    }

    if (
      Array.isArray(
        data?.items
      )
    ) {
      return data.items
    }

    return []
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil data kriteria.'
      )
    )
  }
}

// ============================================================
// CREATE KRITERIA
// ============================================================

export async function createAdminKriteria(
  payload: {
    kode: string

    nama: string

    bobot: number

    tipe:
      | 'BENEFIT'
      | 'COST'

    deskripsi?: string

    aktif?: boolean
  }
): Promise<AdminKriteria> {
  try {
    const response =
      await api.post(
        '/admin/kriteria',
        payload
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.kriteria ||
      data
    ) as AdminKriteria
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal membuat kriteria.'
      )
    )
  }
}

// ============================================================
// UPDATE KRITERIA
// ============================================================

export async function updateAdminKriteria(
  id: string,
  payload: Partial<{
    kode: string

    nama: string

    bobot: number

    tipe:
      | 'BENEFIT'
      | 'COST'

    deskripsi: string

    aktif: boolean
  }>
): Promise<AdminKriteria> {
  try {
    const response =
      await api.put(
        `/admin/kriteria/${id}`,
        payload
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.kriteria ||
      data
    ) as AdminKriteria
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal memperbarui kriteria.'
      )
    )
  }
}

// ============================================================
// DELETE KRITERIA
// ============================================================

export async function deleteAdminKriteria(
  id: string
): Promise<void> {
  try {
    await api.delete(
      `/admin/kriteria/${id}`
    )
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal menghapus kriteria.'
      )
    )
  }
}

// ============================================================
// SUBKRITERIA
// ============================================================

export async function getAdminSubKriteria(
  kriteriaId?: string
): Promise<AdminSubKriteria[]> {
  try {
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

    const data =
      getData<any>(
        response
      )

    if (Array.isArray(data)) {
      return data
    }

    if (
      Array.isArray(
        data?.subKriteria
      )
    ) {
      return data.subKriteria
    }

    if (
      Array.isArray(
        data?.subkriteria
      )
    ) {
      return data.subkriteria
    }

    if (
      Array.isArray(
        data?.items
      )
    ) {
      return data.items
    }

    return []
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil data subkriteria.'
      )
    )
  }
}

// ============================================================
// CREATE SUBKRITERIA
// ============================================================

export async function createAdminSubKriteria(
  payload: {
    kriteriaId: string

    nama: string

    nilai: number

    keterangan?: string
  }
): Promise<AdminSubKriteria> {
  try {
    const response =
      await api.post(
        '/admin/subkriteria',
        payload
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.subKriteria ||
      data?.subkriteria ||
      data
    ) as AdminSubKriteria
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal membuat subkriteria.'
      )
    )
  }
}

// ============================================================
// UPDATE SUBKRITERIA
// ============================================================

export async function updateAdminSubKriteria(
  id: string,
  payload: Partial<{
    kriteriaId: string

    nama: string

    nilai: number

    keterangan: string
  }>
): Promise<AdminSubKriteria> {
  try {
    const response =
      await api.put(
        `/admin/subkriteria/${id}`,
        payload
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.subKriteria ||
      data?.subkriteria ||
      data
    ) as AdminSubKriteria
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal memperbarui subkriteria.'
      )
    )
  }
}

// ============================================================
// DELETE SUBKRITERIA
// ============================================================

export async function deleteAdminSubKriteria(
  id: string
): Promise<void> {
  try {
    await api.delete(
      `/admin/subkriteria/${id}`
    )
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal menghapus subkriteria.'
      )
    )
  }
}

// ============================================================
// TOPSIS CANDIDATES
// ============================================================

export async function getAdminTopsisCandidates(): Promise<{
  criteria: AdminKriteria[]

  candidates: AdminTopsisCandidate[]
}> {
  try {
    const response =
      await api.get(
        '/admin/topsis/candidates'
      )

    const data =
      getData<any>(
        response
      )

    return {
      criteria:
        data?.criteria ??
        [],

      candidates:
        data?.candidates ??
        [],
    }
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil kandidat TOPSIS.'
      )
    )
  }
}

// ============================================================
// PROCESS TOPSIS
// ============================================================

export async function processAdminTopsis(
  layakThreshold: number
): Promise<{
  threshold: number

  jumlahAlternatif: number

  results: AdminTopsisResult[]
}> {
  try {
    const response =
      await api.post(
        '/admin/topsis/process',
        {
          layakThreshold,
        }
      )

    const data =
      getData<any>(
        response
      )

    return {
      threshold:
        Number(
          data?.threshold ??
          layakThreshold
        ),

      jumlahAlternatif:
        Number(
          data?.jumlahAlternatif ??
          0
        ),

      results:
        data?.results ??
        [],
    }
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal menjalankan perhitungan TOPSIS.'
      )
    )
  }
}

// ============================================================
// GET TOPSIS RESULTS
// ============================================================

export async function getAdminTopsisResults(): Promise<
  AdminTopsisResult[]
> {
  try {
    const response =
      await api.get(
        '/admin/topsis/results'
      )

    const data =
      getData<any>(
        response
      )

    if (
      Array.isArray(
        data?.results
      )
    ) {
      return data.results
    }

    if (
      Array.isArray(data)
    ) {
      return data
    }

    return []
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil hasil TOPSIS.'
      )
    )
  }
}

// ============================================================
// GET DETAIL TOPSIS
// ============================================================

export async function getAdminTopsisResultById(
  id: string
): Promise<AdminTopsisResult> {
  try {
    const response =
      await api.get(
        `/admin/topsis/results/${id}`
      )

    const data =
      getData<any>(
        response
      )

    return (
      data?.result ||
      data
    ) as AdminTopsisResult
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Gagal mengambil detail hasil TOPSIS.'
      )
    )
  }
}

// ============================================================
// EXPORT AXIOS INSTANCE
// ============================================================

export {
  api as adminApi,
}