import api from '@/lib/api'

/* ============================================================
 * TYPES
 * ============================================================ */

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
}

export async function getAdminDashboard() {
  const response =
    await api.get(
      '/admin/dashboard'
    )

  return dataOf<AdminDashboardData>(
    response
  )
}

export interface AdminPengajuan {
  id: string
  userId: string
  mustahikId: string
  status: string
  catatan: string | null
  tanggalPengajuan: string
  tanggalVerifikasi: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AdminMustahik {
  id: string
  userId: string
  nik: string
  namaLengkap: string
  tempatLahir: string | null
  tanggalLahir: string | null
  jenisKelamin: string | null
  alamat: string | null
  kelurahan: string | null
  kecamatan: string | null
  kota: string | null
  provinsi: string | null
  noHp: string | null
  statusPernikahan: string | null
  pekerjaan: string | null
  penghasilan: number | string | null
  jumlahTanggungan: number | null
  statusRumah: string | null
  kondisiRumah: string | null
  kepemilikanAset: string | null

  user?: {
    id: string
    name: string
    email: string
    phone: string | null
  }

  pengajuan?: AdminPengajuan[]
}

export interface AdminAnswer {
  id: string
  pengajuanId: string
  kriteriaId: string
  subKriteriaId: string
  nilai: number | string

  kriteria?: {
    id: string
    kode: string
    nama: string
    bobot: number | string
    tipe: 'BENEFIT' | 'COST'
    deskripsi?: string | null
  }

  subKriteria?: {
    id: string
    nama: string
    nilai: number | string
    keterangan?: string | null
  }
}

export interface AdminVerification {
  id: string
  pengajuanId: string
  adminId: string
  status:
    | 'LOLOS'
    | 'PERLU_PERBAIKAN'
    | 'DITOLAK'
  catatan: string | null
  createdAt: string
  updatedAt?: string

  admin?: {
    id: string
    name: string
    email: string
  }
}

export interface AdminVerificationDetail
  extends AdminPengajuan {
  mustahik: AdminMustahik
  user: {
    id: string
    name: string
    email: string
  }
  jawaban: AdminAnswer[]
  verifications: AdminVerification[]
}

export interface AdminKriteria {
  id: string
  kode: string
  nama: string
  bobot: number | string
  tipe: 'BENEFIT' | 'COST'
  deskripsi: string | null
  aktif: boolean

  subKriteria?: AdminSubKriteria[]
}

export interface AdminSubKriteria {
  id: string
  kriteriaId: string
  nama: string
  nilai: number | string
  keterangan: string | null
}

export interface AdminTopsisDetail {
  id: string
  topsisResultId: string
  kriteriaId: string
  nilaiAwal: number | string
  nilaiNormalisasi:
    | number
    | string
  nilaiTerbobot:
    | number
    | string

  kriteria?: AdminKriteria
}

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

  pengajuan?: {
    id: string
    status: string

    mustahik: {
      id: string
      namaLengkap: string
      nik: string
    }
  }

  details?: AdminTopsisDetail[]
}

/* ============================================================
 * RESPONSE HELPERS
 * ============================================================ */

const dataOf = <T>(
  response: any
): T => {
  return response.data.data
}

/* ============================================================
 * MUSTAHIK
 * ============================================================ */

export async function getAdminMustahik(
  search = ''
) {
  const response =
    await api.get(
      '/admin/mustahik',
      {
        params: search
          ? { q: search }
          : undefined,
      }
    )

  return dataOf<{
    mustahik: AdminMustahik[]
  }>(response).mustahik
}

export async function getAdminMustahikDetail(
  id: string
) {
  const response =
    await api.get(
      `/admin/mustahik/${id}`
    )

  return dataOf<{
    mustahik: AdminMustahik
  }>(response).mustahik
}

export async function updateAdminMustahik(
  id: string,
  payload: Record<
    string,
    unknown
  >
) {
  const response =
    await api.put(
      `/admin/mustahik/${id}`,
      payload
    )

  return dataOf<{
    mustahik: AdminMustahik
  }>(response).mustahik
}

export async function deleteAdminMustahik(
  id: string
) {
  await api.delete(
    `/admin/mustahik/${id}`
  )
}

/* ============================================================
 * VERIFIKASI
 * ============================================================ */

export async function getAdminVerifikasi(
  status?: string
) {
  const response =
    await api.get(
      '/admin/verifikasi',
      {
        params: status
          ? { status }
          : undefined,
      }
    )

  return dataOf<{
    pengajuan: Array<
      AdminPengajuan & {
        mustahik: AdminMustahik
        user: {
          id: string
          name: string
          email: string
        }
        verifications: AdminVerification[]
      }
    >
  }>(response).pengajuan
}

export async function getAdminVerifikasiDetail(
  id: string
) {
  const response =
    await api.get(
      `/admin/verifikasi/${id}`
    )

  return dataOf<{
    pengajuan: AdminVerificationDetail
  }>(response).pengajuan
}

export async function submitAdminVerifikasi(
  id: string,
  status:
    | 'LOLOS'
    | 'PERLU_PERBAIKAN'
    | 'DITOLAK',
  catatan: string
) {
  const response =
    await api.post(
      `/admin/verifikasi/${id}`,
      {
        status,
        catatan,
      }
    )

  return dataOf<{
    verifikasi: AdminVerification
    pengajuanStatus: string
  }>(response)
}

/* ============================================================
 * KRITERIA
 * ============================================================ */

export async function getAdminKriteria() {
  const response =
    await api.get(
      '/admin/kriteria'
    )

  return dataOf<{
    kriteria: AdminKriteria[]
  }>(response).kriteria
}

export async function createAdminKriteria(
  payload: {
    kode: string
    nama: string
    bobot: number
    tipe:
      | 'BENEFIT'
      | 'COST'
    deskripsi?: string
  }
) {
  const response =
    await api.post(
      '/admin/kriteria',
      payload
    )

  return dataOf<{
    kriteria: AdminKriteria
  }>(response).kriteria
}

export async function updateAdminKriteria(
  id: string,
  payload: Record<
    string,
    unknown
  >
) {
  const response =
    await api.put(
      `/admin/kriteria/${id}`,
      payload
    )

  return dataOf<{
    kriteria: AdminKriteria
  }>(response).kriteria
}

export async function deleteAdminKriteria(
  id: string
) {
  await api.delete(
    `/admin/kriteria/${id}`
  )
}

/* ============================================================
 * SUBKRITERIA
 * ============================================================ */

export async function getAdminSubKriteria(
  kriteriaId?: string
) {
  const response =
    await api.get(
      '/admin/subkriteria',
      {
        params: kriteriaId
          ? { kriteriaId }
          : undefined,
      }
    )

  return dataOf<{
    subKriteria: AdminSubKriteria[]
  }>(response).subKriteria
}

export async function createAdminSubKriteria(
  payload: {
    kriteriaId: string
    nama: string
    nilai: number
    keterangan?: string
  }
) {
  const response =
    await api.post(
      '/admin/subkriteria',
      payload
    )

  return dataOf<{
    subKriteria: AdminSubKriteria
  }>(response).subKriteria
}

export async function updateAdminSubKriteria(
  id: string,
  payload: {
    nama: string
    nilai: number
    keterangan?: string
  }
) {
  const response =
    await api.put(
      `/admin/subkriteria/${id}`,
      payload
    )

  return dataOf<{
    subKriteria: AdminSubKriteria
  }>(response).subKriteria
}

export async function deleteAdminSubKriteria(
  id: string
) {
  await api.delete(
    `/admin/subkriteria/${id}`
  )
}

/* ============================================================
 * TOPSIS
 * ============================================================ */

export async function processAdminTopsis(
  layakThreshold: number
) {
  const response =
    await api.post(
      '/admin/topsis/process',
      {
        layakThreshold,
      }
    )

  return dataOf<{
    threshold: number
    results: AdminTopsisResult[]
  }>(response)
}

export async function getAdminTopsisResults() {
  const response =
    await api.get(
      '/admin/topsis/results'
    )

  return dataOf<{
    results: AdminTopsisResult[]
  }>(response).results
}