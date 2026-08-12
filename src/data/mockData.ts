import type {
  User,
  Pengajuan,
  DataMustahik,
  Kriteria,
  SubKriteria,
  TopsisResult,
  SummaryStats,
  Verifikasi,
} from '@/types';

// ===== MOCK USERS =====
export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Ahmad Fauzi',
    email: 'ahmad@example.com',
    phone: '08123456789',
    role: 'user',
    createdAt: '2024-01-15',
  },
  {
    id: 'u2',
    name: 'Siti Rahayu',
    email: 'siti@example.com',
    phone: '08234567890',
    role: 'user',
    createdAt: '2024-02-20',
  },
  {
    id: 'u3',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08345678901',
    role: 'user',
    createdAt: '2024-03-10',
  },
  {
    id: 'u4',
    name: 'Dewi Lestari',
    email: 'dewi@example.com',
    phone: '08456789012',
    role: 'user',
    createdAt: '2024-03-15',
  },
  {
    id: 'u5',
    name: 'Eko Prasetyo',
    email: 'eko@example.com',
    phone: '08567890123',
    role: 'user',
    createdAt: '2024-04-01',
  },
  {
    id: 'a1',
    name: 'Admin Sistem',
    email: 'admin@spkmustahik.id',
    phone: '08111111111',
    role: 'admin',
    createdAt: '2024-01-01',
  },
];

// ===== CURRENT LOGGED IN USER (mock) =====
export const currentUser: User = mockUsers[0];
export const currentAdmin: User = mockUsers[5];

// ===== MOCK DATA MUSTAHIK =====
export const mockDataMustahik: DataMustahik[] = [
  {
    id: 'dm1',
    userId: 'u1',
    nik: '3201010101900001',
    namaLengkap: 'Ahmad Fauzi',
    tempatLahir: 'Bogor',
    tanggalLahir: '1990-01-01',
    jenisKelamin: 'L',
    alamat: 'Jl. Merdeka No. 10',
    kelurahan: 'Menteng',
    kecamatan: 'Bogor Tengah',
    kota: 'Bogor',
    provinsi: 'Jawa Barat',
    noHp: '08123456789',
    statusPernikahan: 'menikah',
    pekerjaan: 'Buruh Harian',
    penghasilan: 1500000,
    jumlahTanggungan: 4,
    statusRumah: 'sewa',
    kondisiRumah: 'sedang',
    kepemilikanAset: 'tidak_ada',
  },
  {
    id: 'dm2',
    userId: 'u2',
    nik: '3201010202850002',
    namaLengkap: 'Siti Rahayu',
    tempatLahir: 'Sukabumi',
    tanggalLahir: '1985-02-02',
    jenisKelamin: 'P',
    alamat: 'Jl. Anggrek No. 5',
    kelurahan: 'Babakan',
    kecamatan: 'Cimahi Selatan',
    kota: 'Cimahi',
    provinsi: 'Jawa Barat',
    noHp: '08234567890',
    statusPernikahan: 'cerai_mati',
    pekerjaan: 'Pedagang Kecil',
    penghasilan: 900000,
    jumlahTanggungan: 3,
    statusRumah: 'menumpang',
    kondisiRumah: 'buruk',
    kepemilikanAset: 'tidak_ada',
  },
  {
    id: 'dm3',
    userId: 'u3',
    nik: '3201010303920003',
    namaLengkap: 'Budi Santoso',
    tempatLahir: 'Bandung',
    tanggalLahir: '1992-03-03',
    jenisKelamin: 'L',
    alamat: 'Jl. Kenari No. 12',
    kelurahan: 'Cicendo',
    kecamatan: 'Bandung Wetan',
    kota: 'Bandung',
    provinsi: 'Jawa Barat',
    noHp: '08345678901',
    statusPernikahan: 'menikah',
    pekerjaan: 'Tukang Bangunan',
    penghasilan: 2000000,
    jumlahTanggungan: 2,
    statusRumah: 'sewa',
    kondisiRumah: 'sedang',
    kepemilikanAset: 'tidak_ada',
  },
  {
    id: 'dm4',
    userId: 'u4',
    nik: '3201010404880004',
    namaLengkap: 'Dewi Lestari',
    tempatLahir: 'Garut',
    tanggalLahir: '1988-04-04',
    jenisKelamin: 'P',
    alamat: 'Jl. Mawar No. 3',
    kelurahan: 'Tarogong',
    kecamatan: 'Garut Kota',
    kota: 'Garut',
    provinsi: 'Jawa Barat',
    noHp: '08456789012',
    statusPernikahan: 'menikah',
    pekerjaan: 'Ibu Rumah Tangga',
    penghasilan: 800000,
    jumlahTanggungan: 5,
    statusRumah: 'menumpang',
    kondisiRumah: 'buruk',
    kepemilikanAset: 'tidak_ada',
  },
  {
    id: 'dm5',
    userId: 'u5',
    nik: '3201010505950005',
    namaLengkap: 'Eko Prasetyo',
    tempatLahir: 'Tasikmalaya',
    tanggalLahir: '1995-05-05',
    jenisKelamin: 'L',
    alamat: 'Jl. Pahlawan No. 8',
    kelurahan: 'Cihideung',
    kecamatan: 'Tasikmalaya Kota',
    kota: 'Tasikmalaya',
    provinsi: 'Jawa Barat',
    noHp: '08567890123',
    statusPernikahan: 'belum_menikah',
    pekerjaan: 'Tidak Bekerja',
    penghasilan: 500000,
    jumlahTanggungan: 1,
    statusRumah: 'menumpang',
    kondisiRumah: 'sedang',
    kepemilikanAset: 'tidak_ada',
  },
];

// ===== MOCK PENGAJUAN (Session-based storage) =====
const getInitialPengajuan = (): Pengajuan[] => {
  try {
    const saved = sessionStorage.getItem('mock_pengajuan_data');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const mockPengajuan: Pengajuan[] = getInitialPengajuan();

export const saveMockPengajuan = (data: Pengajuan[]) => {
  try {
    sessionStorage.setItem('mock_pengajuan_data', JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

// ===== MOCK KRITERIA =====
export const mockKriteria: Kriteria[] = [
  {
    id: 'k1',
    nama: 'Penghasilan',
    kode: 'C1',
    tipe: 'cost',
    bobot: 0.30,
    deskripsi: 'Penghasilan bulanan calon mustahik',
  },
  {
    id: 'k2',
    nama: 'Jumlah Tanggungan',
    kode: 'C2',
    tipe: 'benefit',
    bobot: 0.25,
    deskripsi: 'Jumlah anggota keluarga yang ditanggung',
  },
  {
    id: 'k3',
    nama: 'Kondisi Rumah',
    kode: 'C3',
    tipe: 'benefit',
    bobot: 0.20,
    deskripsi: 'Kondisi fisik tempat tinggal',
  },
  {
    id: 'k4',
    nama: 'Status Pekerjaan',
    kode: 'C4',
    tipe: 'benefit',
    bobot: 0.15,
    deskripsi: 'Status dan jenis pekerjaan utama',
  },
  {
    id: 'k5',
    nama: 'Kepemilikan Aset',
    kode: 'C5',
    tipe: 'cost',
    bobot: 0.10,
    deskripsi: 'Kepemilikan aset berharga (kendaraan, tanah, dll)',
  },
];

// ===== MOCK SUBKRITERIA =====
export const mockSubKriteria: SubKriteria[] = [
  // Penghasilan (C1) - Cost
  { id: 'sk1', kriteriaId: 'k1', namaKriteria: 'Penghasilan', nilai: 1, keterangan: '< Rp 500.000' },
  { id: 'sk2', kriteriaId: 'k1', namaKriteria: 'Penghasilan', nilai: 2, keterangan: 'Rp 500.001 - Rp 1.000.000' },
  { id: 'sk3', kriteriaId: 'k1', namaKriteria: 'Penghasilan', nilai: 3, keterangan: 'Rp 1.000.001 - Rp 1.500.000' },
  { id: 'sk4', kriteriaId: 'k1', namaKriteria: 'Penghasilan', nilai: 4, keterangan: 'Rp 1.500.001 - Rp 2.000.000' },
  { id: 'sk5', kriteriaId: 'k1', namaKriteria: 'Penghasilan', nilai: 5, keterangan: '> Rp 2.000.000' },
  // Jumlah Tanggungan (C2) - Benefit
  { id: 'sk6', kriteriaId: 'k2', namaKriteria: 'Jumlah Tanggungan', nilai: 1, keterangan: '1 orang' },
  { id: 'sk7', kriteriaId: 'k2', namaKriteria: 'Jumlah Tanggungan', nilai: 2, keterangan: '2 orang' },
  { id: 'sk8', kriteriaId: 'k2', namaKriteria: 'Jumlah Tanggungan', nilai: 3, keterangan: '3 orang' },
  { id: 'sk9', kriteriaId: 'k2', namaKriteria: 'Jumlah Tanggungan', nilai: 4, keterangan: '4 orang' },
  { id: 'sk10', kriteriaId: 'k2', namaKriteria: 'Jumlah Tanggungan', nilai: 5, keterangan: '≥ 5 orang' },
  // Kondisi Rumah (C3) - Benefit
  { id: 'sk11', kriteriaId: 'k3', namaKriteria: 'Kondisi Rumah', nilai: 1, keterangan: 'Sangat Baik' },
  { id: 'sk12', kriteriaId: 'k3', namaKriteria: 'Kondisi Rumah', nilai: 2, keterangan: 'Baik' },
  { id: 'sk13', kriteriaId: 'k3', namaKriteria: 'Kondisi Rumah', nilai: 3, keterangan: 'Cukup' },
  { id: 'sk14', kriteriaId: 'k3', namaKriteria: 'Kondisi Rumah', nilai: 4, keterangan: 'Buruk' },
  { id: 'sk15', kriteriaId: 'k3', namaKriteria: 'Kondisi Rumah', nilai: 5, keterangan: 'Sangat Buruk' },
  // Status Pekerjaan (C4) - Benefit
  { id: 'sk16', kriteriaId: 'k4', namaKriteria: 'Status Pekerjaan', nilai: 1, keterangan: 'PNS / BUMN' },
  { id: 'sk17', kriteriaId: 'k4', namaKriteria: 'Status Pekerjaan', nilai: 2, keterangan: 'Karyawan Swasta' },
  { id: 'sk18', kriteriaId: 'k4', namaKriteria: 'Status Pekerjaan', nilai: 3, keterangan: 'Wiraswasta' },
  { id: 'sk19', kriteriaId: 'k4', namaKriteria: 'Status Pekerjaan', nilai: 4, keterangan: 'Buruh / Harian' },
  { id: 'sk20', kriteriaId: 'k4', namaKriteria: 'Status Pekerjaan', nilai: 5, keterangan: 'Tidak Bekerja' },
  // Kepemilikan Aset (C5) - Cost
  { id: 'sk21', kriteriaId: 'k5', namaKriteria: 'Kepemilikan Aset', nilai: 1, keterangan: 'Memiliki banyak aset' },
  { id: 'sk22', kriteriaId: 'k5', namaKriteria: 'Kepemilikan Aset', nilai: 2, keterangan: 'Memiliki beberapa aset' },
  { id: 'sk23', kriteriaId: 'k5', namaKriteria: 'Kepemilikan Aset', nilai: 3, keterangan: 'Memiliki sedikit aset' },
  { id: 'sk24', kriteriaId: 'k5', namaKriteria: 'Kepemilikan Aset', nilai: 4, keterangan: 'Hampir tidak memiliki aset' },
  { id: 'sk25', kriteriaId: 'k5', namaKriteria: 'Kepemilikan Aset', nilai: 5, keterangan: 'Tidak memiliki aset' },
];

// ===== MOCK TOPSIS RESULTS =====
export const mockTopsisResults: TopsisResult[] = [
  {
    id: 'tr1',
    pengajuanId: 'p1',
    mustahikId: 'dm1',
    namaLengkap: 'Ahmad Fauzi',
    nilaiPreferensi: 0.821,
    ranking: 1,
    status: 'LAYAK_DIDANAI',
    tanggalProses: '2024-05-01',
  },
  {
    id: 'tr2',
    pengajuanId: 'p2',
    mustahikId: 'dm2',
    namaLengkap: 'Siti Rahayu',
    nilaiPreferensi: 0.743,
    ranking: 2,
    status: 'LAYAK_DIDANAI',
    tanggalProses: '2024-05-01',
  },
  {
    id: 'tr3',
    pengajuanId: 'p4',
    mustahikId: 'dm4',
    namaLengkap: 'Dewi Lestari',
    nilaiPreferensi: 0.612,
    ranking: 3,
    status: 'LAYAK_DIDANAI',
    tanggalProses: '2024-05-01',
  },
  {
    id: 'tr4',
    pengajuanId: 'p5',
    mustahikId: 'dm5',
    namaLengkap: 'Eko Prasetyo',
    nilaiPreferensi: 0.521,
    ranking: 4,
    status: 'TIDAK_DIDANAI',
    tanggalProses: '2024-05-01',
  },
  {
    id: 'tr5',
    pengajuanId: 'p3',
    mustahikId: 'dm3',
    namaLengkap: 'Budi Santoso',
    nilaiPreferensi: 0.398,
    ranking: 5,
    status: 'TIDAK_DIDANAI',
    tanggalProses: '2024-05-01',
  },
];

// ===== MOCK VERIFIKASI =====
export const mockVerifikasi: Verifikasi[] = [
  {
    id: 'v1',
    pengajuanId: 'p1',
    adminId: 'a1',
    adminName: 'Admin Sistem',
    status: 'lolos',
    catatan: 'Data lengkap dan valid. Semua dokumen sesuai.',
    tanggalVerifikasi: '2024-04-15',
  },
  {
    id: 'v2',
    pengajuanId: 'p2',
    adminId: 'a1',
    adminName: 'Admin Sistem',
    status: 'lolos',
    catatan: 'Data valid, lolos verifikasi lapangan.',
    tanggalVerifikasi: '2024-04-18',
  },
  {
    id: 'v3',
    pengajuanId: 'p5',
    adminId: 'a1',
    adminName: 'Admin Sistem',
    status: 'perlu_perbaikan',
    catatan: 'Foto KTP kurang jelas, mohon upload ulang.',
    tanggalVerifikasi: '2024-04-23',
  },
];

// ===== MOCK SUMMARY STATS =====
export const mockStats: SummaryStats = {
  totalMustahik: 5,
  pengajuanBaru: 2,
  menungguVerifikasi: 2,
  sudahDiverifikasi: 2,
  layakDidanai: 3,
  tidakDidanai: 2,
};

// ===== MOCK CHART DATA =====
export const mockChartData = [
  { bulan: 'Jan', pengajuan: 4, lolos: 3, ditolak: 1 },
  { bulan: 'Feb', pengajuan: 7, lolos: 5, ditolak: 2 },
  { bulan: 'Mar', pengajuan: 5, lolos: 4, ditolak: 1 },
  { bulan: 'Apr', pengajuan: 8, lolos: 6, ditolak: 2 },
  { bulan: 'Mei', pengajuan: 5, lolos: 3, ditolak: 2 },
  { bulan: 'Jun', pengajuan: 3, lolos: 2, ditolak: 1 },
];

export const mockStatusDistribution = [
  { name: 'Layak Didanai', value: 3, color: '#16a34a' },
  { name: 'Tidak Didanai', value: 2, color: '#ef4444' },
  { name: 'Menunggu Proses', value: 2, color: '#f59e0b' },
];
