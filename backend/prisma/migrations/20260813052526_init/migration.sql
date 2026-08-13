-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PengajuanStatus" AS ENUM ('DRAFT', 'MENUNGGU_VERIFIKASI', 'SEDANG_DIVERIFIKASI', 'PERLU_PERBAIKAN', 'LOLOS_VERIFIKASI', 'DITOLAK', 'DIPROSES_TOPSIS', 'LAYAK_DIDANAI', 'TIDAK_DIDANAI');

-- CreateEnum
CREATE TYPE "KriteriaTipe" AS ENUM ('BENEFIT', 'COST');

-- CreateEnum
CREATE TYPE "VerifikasiStatus" AS ENUM ('LOLOS', 'PERLU_PERBAIKAN', 'DITOLAK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mustahik" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" TEXT,
    "alamat" TEXT,
    "kelurahan" TEXT,
    "kecamatan" TEXT,
    "kota" TEXT,
    "provinsi" TEXT,
    "noHp" TEXT,
    "statusPernikahan" TEXT,
    "pekerjaan" TEXT,
    "penghasilan" DECIMAL(15,2),
    "jumlahTanggungan" INTEGER,
    "statusRumah" TEXT,
    "kondisiRumah" TEXT,
    "kepemilikanAset" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mustahik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengajuan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mustahikId" TEXT NOT NULL,
    "status" "PengajuanStatus" NOT NULL DEFAULT 'DRAFT',
    "catatan" TEXT,
    "tanggalPengajuan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalVerifikasi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" DECIMAL(8,4) NOT NULL,
    "tipe" "KriteriaTipe" NOT NULL,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubKriteria" (
    "id" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" DECIMAL(8,4) NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubKriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JawabanKuesioner" (
    "id" TEXT NOT NULL,
    "pengajuanId" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "subKriteriaId" TEXT NOT NULL,
    "nilai" DECIMAL(8,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JawabanKuesioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verifikasi" (
    "id" TEXT NOT NULL,
    "pengajuanId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "status" "VerifikasiStatus" NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopsisResult" (
    "id" TEXT NOT NULL,
    "pengajuanId" TEXT NOT NULL,
    "nilaiPreferensi" DECIMAL(10,6) NOT NULL,
    "ranking" INTEGER NOT NULL,
    "status" "PengajuanStatus" NOT NULL,
    "tanggalProses" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopsisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopsisDetail" (
    "id" TEXT NOT NULL,
    "topsisResultId" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "nilaiAwal" DECIMAL(10,6) NOT NULL,
    "nilaiNormalisasi" DECIMAL(12,8) NOT NULL,
    "nilaiTerbobot" DECIMAL(12,8) NOT NULL,

    CONSTRAINT "TopsisDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mustahik_userId_key" ON "Mustahik"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mustahik_nik_key" ON "Mustahik"("nik");

-- CreateIndex
CREATE INDEX "Mustahik_namaLengkap_idx" ON "Mustahik"("namaLengkap");

-- CreateIndex
CREATE INDEX "Pengajuan_userId_status_idx" ON "Pengajuan"("userId", "status");

-- CreateIndex
CREATE INDEX "Pengajuan_mustahikId_idx" ON "Pengajuan"("mustahikId");

-- CreateIndex
CREATE UNIQUE INDEX "Kriteria_kode_key" ON "Kriteria"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Kriteria_nama_key" ON "Kriteria"("nama");

-- CreateIndex
CREATE INDEX "SubKriteria_kriteriaId_idx" ON "SubKriteria"("kriteriaId");

-- CreateIndex
CREATE UNIQUE INDEX "SubKriteria_kriteriaId_nama_key" ON "SubKriteria"("kriteriaId", "nama");

-- CreateIndex
CREATE INDEX "JawabanKuesioner_pengajuanId_idx" ON "JawabanKuesioner"("pengajuanId");

-- CreateIndex
CREATE UNIQUE INDEX "JawabanKuesioner_pengajuanId_kriteriaId_key" ON "JawabanKuesioner"("pengajuanId", "kriteriaId");

-- CreateIndex
CREATE INDEX "Verifikasi_pengajuanId_idx" ON "Verifikasi"("pengajuanId");

-- CreateIndex
CREATE INDEX "TopsisResult_pengajuanId_idx" ON "TopsisResult"("pengajuanId");

-- CreateIndex
CREATE INDEX "TopsisResult_tanggalProses_ranking_idx" ON "TopsisResult"("tanggalProses", "ranking");

-- CreateIndex
CREATE UNIQUE INDEX "TopsisDetail_topsisResultId_kriteriaId_key" ON "TopsisDetail"("topsisResultId", "kriteriaId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- AddForeignKey
ALTER TABLE "Mustahik" ADD CONSTRAINT "Mustahik_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengajuan" ADD CONSTRAINT "Pengajuan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengajuan" ADD CONSTRAINT "Pengajuan_mustahikId_fkey" FOREIGN KEY ("mustahikId") REFERENCES "Mustahik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubKriteria" ADD CONSTRAINT "SubKriteria_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanKuesioner" ADD CONSTRAINT "JawabanKuesioner_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanKuesioner" ADD CONSTRAINT "JawabanKuesioner_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanKuesioner" ADD CONSTRAINT "JawabanKuesioner_subKriteriaId_fkey" FOREIGN KEY ("subKriteriaId") REFERENCES "SubKriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verifikasi" ADD CONSTRAINT "Verifikasi_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verifikasi" ADD CONSTRAINT "Verifikasi_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopsisResult" ADD CONSTRAINT "TopsisResult_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopsisDetail" ADD CONSTRAINT "TopsisDetail_topsisResultId_fkey" FOREIGN KEY ("topsisResultId") REFERENCES "TopsisResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopsisDetail" ADD CONSTRAINT "TopsisDetail_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
