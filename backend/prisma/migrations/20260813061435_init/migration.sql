-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mustahik` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NOT NULL,
    `namaLengkap` VARCHAR(191) NOT NULL,
    `tempatLahir` VARCHAR(191) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `kelurahan` VARCHAR(191) NULL,
    `kecamatan` VARCHAR(191) NULL,
    `kota` VARCHAR(191) NULL,
    `provinsi` VARCHAR(191) NULL,
    `noHp` VARCHAR(191) NULL,
    `statusPernikahan` VARCHAR(191) NULL,
    `pekerjaan` VARCHAR(191) NULL,
    `penghasilan` DECIMAL(15, 2) NULL,
    `jumlahTanggungan` INTEGER NULL,
    `statusRumah` VARCHAR(191) NULL,
    `kondisiRumah` VARCHAR(191) NULL,
    `kepemilikanAset` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Mustahik_userId_key`(`userId`),
    UNIQUE INDEX `Mustahik_nik_key`(`nik`),
    INDEX `Mustahik_namaLengkap_idx`(`namaLengkap`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengajuan` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `mustahikId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'MENUNGGU_VERIFIKASI', 'SEDANG_DIVERIFIKASI', 'PERLU_PERBAIKAN', 'LOLOS_VERIFIKASI', 'DITOLAK', 'DIPROSES_TOPSIS', 'LAYAK_DIDANAI', 'TIDAK_DIDANAI') NOT NULL DEFAULT 'DRAFT',
    `catatan` VARCHAR(191) NULL,
    `tanggalPengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggalVerifikasi` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pengajuan_userId_status_idx`(`userId`, `status`),
    INDEX `Pengajuan_mustahikId_idx`(`mustahikId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kriteria` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `bobot` DECIMAL(8, 4) NOT NULL,
    `tipe` ENUM('BENEFIT', 'COST') NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Kriteria_kode_key`(`kode`),
    UNIQUE INDEX `Kriteria_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubKriteria` (
    `id` VARCHAR(191) NOT NULL,
    `kriteriaId` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `nilai` DECIMAL(8, 4) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubKriteria_kriteriaId_idx`(`kriteriaId`),
    UNIQUE INDEX `SubKriteria_kriteriaId_nama_key`(`kriteriaId`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JawabanKuesioner` (
    `id` VARCHAR(191) NOT NULL,
    `pengajuanId` VARCHAR(191) NOT NULL,
    `kriteriaId` VARCHAR(191) NOT NULL,
    `subKriteriaId` VARCHAR(191) NOT NULL,
    `nilai` DECIMAL(8, 4) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JawabanKuesioner_pengajuanId_idx`(`pengajuanId`),
    UNIQUE INDEX `JawabanKuesioner_pengajuanId_kriteriaId_key`(`pengajuanId`, `kriteriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Verifikasi` (
    `id` VARCHAR(191) NOT NULL,
    `pengajuanId` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `status` ENUM('LOLOS', 'PERLU_PERBAIKAN', 'DITOLAK') NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Verifikasi_pengajuanId_idx`(`pengajuanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopsisResult` (
    `id` VARCHAR(191) NOT NULL,
    `pengajuanId` VARCHAR(191) NOT NULL,
    `nilaiPreferensi` DECIMAL(10, 6) NOT NULL,
    `ranking` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'MENUNGGU_VERIFIKASI', 'SEDANG_DIVERIFIKASI', 'PERLU_PERBAIKAN', 'LOLOS_VERIFIKASI', 'DITOLAK', 'DIPROSES_TOPSIS', 'LAYAK_DIDANAI', 'TIDAK_DIDANAI') NOT NULL,
    `tanggalProses` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TopsisResult_pengajuanId_idx`(`pengajuanId`),
    INDEX `TopsisResult_tanggalProses_ranking_idx`(`tanggalProses`, `ranking`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopsisDetail` (
    `id` VARCHAR(191) NOT NULL,
    `topsisResultId` VARCHAR(191) NOT NULL,
    `kriteriaId` VARCHAR(191) NOT NULL,
    `nilaiAwal` DECIMAL(10, 6) NOT NULL,
    `nilaiNormalisasi` DECIMAL(12, 8) NOT NULL,
    `nilaiTerbobot` DECIMAL(12, 8) NOT NULL,

    UNIQUE INDEX `TopsisDetail_topsisResultId_kriteriaId_key`(`topsisResultId`, `kriteriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `AuditLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mustahik` ADD CONSTRAINT `Mustahik_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengajuan` ADD CONSTRAINT `Pengajuan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengajuan` ADD CONSTRAINT `Pengajuan_mustahikId_fkey` FOREIGN KEY (`mustahikId`) REFERENCES `Mustahik`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubKriteria` ADD CONSTRAINT `SubKriteria_kriteriaId_fkey` FOREIGN KEY (`kriteriaId`) REFERENCES `Kriteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JawabanKuesioner` ADD CONSTRAINT `JawabanKuesioner_pengajuanId_fkey` FOREIGN KEY (`pengajuanId`) REFERENCES `Pengajuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JawabanKuesioner` ADD CONSTRAINT `JawabanKuesioner_kriteriaId_fkey` FOREIGN KEY (`kriteriaId`) REFERENCES `Kriteria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JawabanKuesioner` ADD CONSTRAINT `JawabanKuesioner_subKriteriaId_fkey` FOREIGN KEY (`subKriteriaId`) REFERENCES `SubKriteria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Verifikasi` ADD CONSTRAINT `Verifikasi_pengajuanId_fkey` FOREIGN KEY (`pengajuanId`) REFERENCES `Pengajuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Verifikasi` ADD CONSTRAINT `Verifikasi_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopsisResult` ADD CONSTRAINT `TopsisResult_pengajuanId_fkey` FOREIGN KEY (`pengajuanId`) REFERENCES `Pengajuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopsisDetail` ADD CONSTRAINT `TopsisDetail_topsisResultId_fkey` FOREIGN KEY (`topsisResultId`) REFERENCES `TopsisResult`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopsisDetail` ADD CONSTRAINT `TopsisDetail_kriteriaId_fkey` FOREIGN KEY (`kriteriaId`) REFERENCES `Kriteria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
