import api from '@/lib/api'
import type { StatusPenugasan } from '@/types'

export interface TugasPelaksanaItem {
  id: string
  mustahikId: string
  pelaksanaId: string
  status: StatusPenugasan
  catatan?: string | null
  tanggalMulai?: string | null
  tanggalSelesai?: string | null
  createdAt: string
  updatedAt: string
  mustahik: {
    id: string
    nik: string
    namaLengkap: string
    tempatLahir?: string | null
    tanggalLahir?: string | null
    jenisKelamin?: string | null
    noHp?: string | null
    alamat: string
    kelurahan: string
    kecamatan: string
    kota: string
    provinsi: string
    statusPernikahan?: string | null
    pekerjaan?: string | null
    penghasilan?: number | string | null
    jumlahTanggungan?: number | null
    statusRumah?: string | null
    kondisiRumah?: string | null
    kepemilikanAset?: string | null
    pengajuan?: Array<{
      id: string
      status: string
      _count?: {
        jawaban: number
      }
    }>
  }
}

export interface StatsTugasPelaksana {
  total: number
  ditugaskan: number
  sedangSurvei: number
  selesai: number
  dibatalkan: number
}

export interface IndikatorSurvei {
  id: string
  kode: string
  nama: string
  deskripsi?: string | null
  tipe: 'POSITIF' | 'NEGATIF'
  bobot?: number | null
  urutan: number
  kriteriaId: string
}

export interface KriteriaSurvei {
  id: string
  kode: string
  nama: string
  bobot: number | string
  tipe: string
  deskripsi?: string | null
  dimensi: string
  urutan: number
  indikator: IndikatorSurvei[]
}

export interface DetailTugasResponse {
  penugasan: TugasPelaksanaItem & {
    mustahik: TugasPelaksanaItem['mustahik'] & {
      pengajuan?: Array<{
        id: string
        status: string
        jawaban: Array<{
          id: string
          indikatorId: string
          nilai: number | string
          indikator?: IndikatorSurvei
        }>
      }>
    }
  }
}

export async function getTugasPelaksana(params?: {
  status?: string
  search?: string
}): Promise<{ tugas: TugasPelaksanaItem[]; stats: StatsTugasPelaksana; total: number }> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'SEMUA') query.append('status', params.status)
  if (params?.search) query.append('search', params.search)

  const res = await api.get(`/pelaksana/tugas?${query.toString()}`)
  return res.data.data
}

export async function getDetailTugasPelaksana(id: string): Promise<DetailTugasResponse> {
  const res = await api.get(`/pelaksana/tugas/${id}`)
  return res.data.data
}

export async function updateStatusTugasPelaksana(
  id: string,
  data: { status: 'SEDANG_SURVEI' | 'SELESAI'; catatan?: string }
) {
  const res = await api.patch(`/pelaksana/tugas/${id}/status`, data)
  return res.data
}

export async function getKuesionerSurvei(): Promise<{ kriteria: KriteriaSurvei[] }> {
  const res = await api.get('/kuesioner')
  return res.data.data
}

export async function submitHasilSurveiPelaksana(
  penugasanId: string,
  payload: {
    jawaban: Array<{ indikatorId: string; nilai: number }>
    statusRumah?: string
    statusPenugasan: 'SEDANG_SURVEI' | 'SELESAI'
    catatan?: string
  }
) {
  const res = await api.post(`/pelaksana/tugas/${penugasanId}/survei`, payload)
  return res.data
}

