// ===== AUTH TYPES =====
export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'USER' | 'ADMIN' | 'PELAKSANA'
  createdAt: string
  updatedAt?: string
}

// ===== STATUS PENUGASAN =====
export type StatusPenugasan =
  | 'DITUGASKAN'
  | 'SEDANG_SURVEI'
  | 'SELESAI'
  | 'DIBATALKAN'

export interface PelaksanaUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'PELAKSANA'
  createdAt: string
  updatedAt?: string
  penugasanSurvei?: Array<{
    id: string
    status: StatusPenugasan
    mustahik: {
      id: string
      namaLengkap: string
      nik: string
    }
  }>
}

export interface PenugasanSurvei {
  id: string
  mustahikId: string
  pelaksanaId: string
  status: StatusPenugasan
  catatan: string | null
  tanggalDitugaskan: string
  tanggalMulai: string | null
  tanggalSelesai: string | null
  createdAt: string
  updatedAt: string
  mustahik: {
    id: string
    nik: string
    namaLengkap: string
    noHp?: string | null
    alamat?: string | null
    kelurahan?: string | null
    kecamatan?: string | null
    kota?: string | null
    provinsi?: string | null
    pekerjaan?: string | null
    statusRumah?: string | null
    kondisiRumah?: string | null
    penghasilan?: number | null
    jumlahTanggungan?: number | null
    kepemilikanAset?: string | null
    pengajuan?: Array<{
      id: string
      status: StatusPengajuan
      jawaban?: Array<{
        id: string
        indikatorId: string
        nilai: number
        indikator?: {
          id: string
          kode: string
          nama: string
          tipe: string
          kriteria?: {
            id: string
            kode: string
            nama: string
          }
        }
      }>
      _count?: {
        jawaban: number
      }
    }>
  }
  pelaksana: {
    id: string
    name: string
    email: string
    phone?: string | null
  }
}

// ===== STATUS TYPES =====
export type StatusPengajuan =
  | 'DRAFT'
  | 'MENUNGGU_VERIFIKASI'
  | 'SEDANG_DIVERIFIKASI'
  | 'PERLU_PERBAIKAN'
  | 'LOLOS_VERIFIKASI'
  | 'DITOLAK'
  | 'DIPROSES_TOPSIS'
  | 'LAYAK_DIDANAI'
  | 'TIDAK_DIDANAI';

// ===== MUSTAHIK TYPES =====
export interface DataMustahik {
  id: string;
  userId: string;
  nik: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  noHp: string;
  statusPernikahan: 'belum_menikah' | 'menikah' | 'cerai_hidup' | 'cerai_mati';
  pekerjaan: string;
  penghasilan: number;
  jumlahTanggungan: number;
  statusRumah: 'milik_sendiri' | 'sewa' | 'menumpang' | 'dinas';
  kondisiRumah: 'baik' | 'sedang' | 'buruk';
  kepemilikanAset: 'ada' | 'tidak_ada';
}

// ===== PENGAJUAN TYPES =====
export interface Pengajuan {
  id: string;
  userId: string;
  mustahikId: string;
  namaLengkap: string;
  nik: string;
  status: StatusPengajuan;
  tanggalPengajuan: string;
  tanggalVerifikasi?: string;
  catatan?: string;
}

// ===== KUESIONER TYPES =====
export interface Kriteria {
  id: string;
  nama: string;
  kode: string;
  tipe: 'benefit' | 'cost';
  bobot: number;
  deskripsi: string;
}

export interface SubKriteria {
  id: string;
  kriteriaId: string;
  namaKriteria: string;
  nilai: number;
  keterangan: string;
}

export interface JawabanKuesioner {
  id: string;
  pengajuanId: string;
  kriteriaId: string;
  subKriteriaId: string;
  nilai: number;
}

// ===== VERIFIKASI TYPES =====
export interface Verifikasi {
  id: string;
  pengajuanId: string;
  adminId: string;
  adminName: string;
  status: 'lolos' | 'perlu_perbaikan' | 'ditolak';
  catatan: string;
  tanggalVerifikasi: string;
}

// ===== TOPSIS TYPES =====
export interface TopsisResult {
  id: string;
  pengajuanId: string;
  mustahikId: string;
  namaLengkap: string;
  nilaiPreferensi: number;
  ranking: number;
  status: 'LAYAK_DIDANAI' | 'TIDAK_DIDANAI';
  tanggalProses: string;
}

// ===== LAPORAN TYPES =====
export interface SummaryStats {
  totalMustahik: number;
  pengajuanBaru: number;
  menungguVerifikasi: number;
  sudahDiverifikasi: number;
  layakDidanai: number;
  tidakDidanai: number;
}

// ===== TABLE TYPES =====
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}
