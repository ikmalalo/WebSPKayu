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
      localStorage.getItem('spk_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },

  (error) => Promise.reject(error)
)

// ============================================================
// RESPONSE HELPER
// ============================================================

function getData<T>(
  response: {
    data: unknown
  }
): T {
  const body = response.data

  if (
    body &&
    typeof body === 'object' &&
    'data' in body
  ) {
    return (
      body as {
        data: T
      }
    ).data
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
    const data =
      error.response?.data as {
        message?: string
      } | undefined

    return (
      data?.message ||
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
// COMMON TYPES
// ============================================================

export type PengajuanStatus =
  | 'DRAFT'
  | 'MENUNGGU_VERIFIKASI'
  | 'SEDANG_DIVERIFIKASI'
  | 'PERLU_PERBAIKAN'
  | 'LOLOS_VERIFIKASI'
  | 'DITOLAK'
  | 'DIPROSES_TOPSIS'
  | 'LAYAK_DIDANAI'
  | 'TIDAK_DIDANAI'

export type KriteriaTipe =
  | 'BENEFIT'
  | 'COST'

export type IndikatorTipe =
  | 'POSITIF'
  | 'NEGATIF'

export type VerificationStatus =
  | 'LOLOS'
  | 'PERLU_PERBAIKAN'
  | 'DITOLAK'

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
// INDIKATOR
// ============================================================

export interface AdminIndikator {
  id: string
  kode: string
  nama: string

  deskripsi?: string | null

  tipe: IndikatorTipe

  urutan: number

  aktif?: boolean

  kriteriaId?: string

  createdAt?: string
  updatedAt?: string
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

  penghasilan?: number | string | null

  jumlahTanggungan?: number | null

  statusRumah?: string | null
  kondisiRumah?: string | null
  kepemilikanAset?: string | null

  createdAt?: string
  updatedAt?: string

  user?: AdminUser

  pengajuan?: AdminPengajuan[]
}

// ============================================================
// JAWABAN KUESIONER
// ============================================================

export interface AdminJawaban {
  id: string

  pengajuanId: string

  // Sistem lama
  kriteriaId?: string | null
  subKriteriaId?: string | null

  // Sistem baru
  indikatorId?: string | null

  nilai: number | string

  kriteria?: {
    id: string
    kode: string
    nama: string
    bobot: number | string
    tipe: KriteriaTipe
  } | null

  subKriteria?: {
    id: string
    nama: string
    nilai: number | string
    keterangan?: string | null
  } | null

  indikator?: AdminIndikator | null
}

// ============================================================
// PENGAJUAN
// ============================================================

export interface AdminPengajuan {
  id: string

  userId: string
  mustahikId: string

  status: PengajuanStatus

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
// VERIFIKASI
// ============================================================

export interface AdminVerifikasi {
  id: string

  pengajuanId: string
  adminId: string

  status: VerificationStatus

  catatan?: string | null

  createdAt?: string
  updatedAt?: string

  admin?: AdminUser

  pengajuan?: AdminPengajuan

  mustahik?: AdminMustahik
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

  bobot: number | string

  tipe: KriteriaTipe

  deskripsi?: string | null

  aktif: boolean

  indikator?: AdminIndikator[]

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

  nilai: number | string

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

  nilaiAwal: number | string

  nilaiNormalisasi: number | string

  nilaiTerbobot: number | string

  kode?: string

  nama?: string

  bobot?: number | string

  tipe?: KriteriaTipe

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

  status: PengajuanStatus

  tanggalProses: string

  createdAt?: string
  updatedAt?: string

  pengajuan?: AdminPengajuan

  mustahik?: AdminMustahik

  details?: AdminTopsisDetail[]
}

// ============================================================
// TOPSIS CANDIDATE JAWABAN
// ============================================================

export interface AdminTopsisCandidateJawaban {
  id?: string

  indikatorId?: string | null

  kode: string | null

  nama: string | null

  tipe: IndikatorTipe | null

  nilai: number | string
}

// ============================================================
// TOPSIS CANDIDATE
// ============================================================

export interface AdminTopsisCandidate {
  id: string

  userId: string

  mustahikId: string

  status:
    | 'LOLOS_VERIFIKASI'
    | 'DIPROSES_TOPSIS'

  tanggalPengajuan?: string | null

  user?: AdminUser

  mustahik: AdminMustahik

  jumlahJawaban?: number

  jawaban: AdminTopsisCandidateJawaban[]

  hasilTopsis?: {
    id: string

    nilaiPreferensi:
      | number
      | string

    ranking: number

    status: PengajuanStatus

    tanggalProses: string
  } | null
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
      getData<unknown>(
        response
      )

    if (Array.isArray(data)) {
      return data as AdminMustahik[]
    }

    if (
      data &&
      typeof data === 'object'
    ) {
      const objectData =
        data as {
          mustahik?: AdminMustahik[]
          items?: AdminMustahik[]
        }

      if (
        Array.isArray(
          objectData.mustahik
        )
      ) {
        return objectData.mustahik
      }

      if (
        Array.isArray(
          objectData.items
        )
      ) {
        return objectData.items
      }
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
// FETCH DETAIL MUSTAHIK
// ============================================================

async function fetchAdminMustahikDetail(
  id: string
): Promise<AdminMustahik> {
  const response =
    await api.get(
      `/admin/mustahik/${id}`
    )

  const data =
    getData<unknown>(
      response
    )

  if (
    data &&
    typeof data === 'object'
  ) {
    const objectData =
      data as {
        mustahik?: AdminMustahik
      }

    if (
      objectData.mustahik
    ) {
      return objectData.mustahik
    }

    if (
      'id' in objectData &&
      'namaLengkap' in objectData
    ) {
      return data as AdminMustahik
    }
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
      getData<unknown>(
        response
      )

    if (
      data &&
      typeof data === 'object' &&
      'mustahik' in data
    ) {
      return (
        data as {
          mustahik: AdminMustahik
        }
      ).mustahik
    }

    return data as AdminMustahik
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
      getData<unknown>(
        response
      )

    if (Array.isArray(data)) {
      return data as AdminPengajuan[]
    }

    if (
      data &&
      typeof data === 'object'
    ) {
      const objectData =
        data as {
          verifikasi?: AdminPengajuan[]
          pengajuan?: AdminPengajuan[]
          items?: AdminPengajuan[]
          data?: AdminPengajuan[]
        }

      if (
        Array.isArray(
          objectData.verifikasi
        )
      ) {
        return objectData.verifikasi
      }

      if (
        Array.isArray(
          objectData.pengajuan
        )
      ) {
        return objectData.pengajuan
      }

      if (
        Array.isArray(
          objectData.items
        )
      ) {
        return objectData.items
      }

      if (
        Array.isArray(
          objectData.data
        )
      ) {
        return objectData.data
      }
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

    const data =
      getData<any>(
        response
      )

    const detail =
      data?.detail ??
      data?.verifikasi ??
      data

    const pengajuan =
      detail?.pengajuan ??
      data?.pengajuan

    const mustahik =
      detail?.mustahik ??
      pengajuan?.mustahik

    if (
      !detail ||
      !pengajuan ||
      !mustahik
    ) {
      throw new Error(
        'Data detail verifikasi tidak ditemukan.'
      )
    }

    return {
      ...detail,
      pengajuan,
      mustahik,

      verifications:
        detail?.verifications ??
        pengajuan?.verifications ??
        [],

      jawaban:
        detail?.jawaban ??
        pengajuan?.jawaban ??
        [],
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
      data?.verifikasi ??
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
      data?.verifikasi ??
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
// GET KRITERIA
// ============================================================

export async function getAdminKriteria(): Promise<
  AdminKriteria[]
> {
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

    return (
      data?.kriteria ??
      data?.criteria ??
      data?.items ??
      []
    )
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
    tipe: KriteriaTipe
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
      data?.kriteria ??
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
    tipe: KriteriaTipe
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
      data?.kriteria ??
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
// GET SUBKRITERIA
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

    return (
      data?.subKriteria ??
      data?.subkriteria ??
      data?.items ??
      []
    )
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
      data?.subKriteria ??
      data?.subkriteria ??
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
      data?.subKriteria ??
      data?.subkriteria ??
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
        'Gagal menghapus data subkriteria.'
      )
    )
  }
}

// ============================================================
// TOPSIS CANDIDATES
//
// GET /admin/topsis/candidates
// ============================================================

export async function getAdminTopsisCandidates(): Promise<{
  criteria: AdminKriteria[]
  candidates: AdminTopsisCandidate[]
  total: number
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
      // Backend TOPSIS terbaru tidak lagi
      // mengirim criteria pada endpoint candidates.
      criteria:
        Array.isArray(
          data?.criteria
        )
          ? data.criteria
          : [],

      candidates:
        Array.isArray(
          data?.candidates
        )
          ? data.candidates
          : [],

      total:
        Number(
          data?.total ??
          data?.candidates?.length ??
          0
        ),
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
//
// POST /admin/topsis/process
//
// Parameter layakThreshold dibuat optional sementara
// agar halaman frontend lama tidak langsung TypeScript error.
//
// Nilai tersebut TIDAK dikirim ke backend karena
// controller TOPSIS terbaru tidak menggunakan threshold.
// ============================================================

export async function processAdminTopsis(
  _layakThreshold?: number
): Promise<{
  totalKandidat: number
  hasil: Array<{
    pengajuanId: string
    nilaiPreferensi: number
    ranking: number
    status: PengajuanStatus
  }>

  // Kompatibilitas frontend lama
  threshold?: number
  jumlahAlternatif?: number
  results?: AdminTopsisResult[]
}> {
  try {
    const response =
      await api.post(
        '/admin/topsis/process'
      )

    const data =
      getData<any>(
        response
      )

    const hasil =
      Array.isArray(
        data?.hasil
      )
        ? data.hasil
        : []

    return {
      totalKandidat:
        Number(
          data?.totalKandidat ??
          hasil.length
        ),

      hasil,

      // Alias sementara untuk
      // ProcessTopsisPage versi lama.
      jumlahAlternatif:
        Number(
          data?.totalKandidat ??
          hasil.length
        ),

      results: [],
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
//
// GET /admin/topsis/results
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

    if (Array.isArray(data)) {
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
//
// GET /admin/topsis/results/:id
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

    const result =
      data?.result ??
      data

    if (!result) {
      throw new Error(
        'Detail hasil TOPSIS tidak ditemukan.'
      )
    }

    return result as AdminTopsisResult
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