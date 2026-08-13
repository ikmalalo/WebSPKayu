import { PrismaClient, KriteriaTipe } from '@prisma/client';
const prisma = new PrismaClient();
const criteria = [
  { kode: 'C1', nama: 'Penghasilan', bobot: 0.30, tipe: KriteriaTipe.COST, values: [['< Rp 500.000', 1], ['Rp 500.001 - Rp 1.000.000', 2], ['Rp 1.000.001 - Rp 1.500.000', 3], ['Rp 1.500.001 - Rp 2.000.000', 4], ['> Rp 2.000.000', 5]] },
  { kode: 'C2', nama: 'Jumlah Tanggungan', bobot: 0.25, tipe: KriteriaTipe.BENEFIT, values: [['1 orang', 1], ['2 orang', 2], ['3 orang', 3], ['4 orang', 4], ['≥ 5 orang', 5]] },
  { kode: 'C3', nama: 'Kondisi Rumah', bobot: 0.20, tipe: KriteriaTipe.BENEFIT, values: [['Sangat Baik', 1], ['Baik', 2], ['Cukup', 3], ['Buruk', 4], ['Sangat Buruk', 5]] },
  { kode: 'C4', nama: 'Status Pekerjaan', bobot: 0.15, tipe: KriteriaTipe.BENEFIT, values: [['PNS / BUMN', 1], ['Karyawan Swasta', 2], ['Wiraswasta', 3], ['Buruh / Harian', 4], ['Tidak Bekerja', 5]] },
  { kode: 'C5', nama: 'Kepemilikan Aset', bobot: 0.10, tipe: KriteriaTipe.COST, values: [['Memiliki banyak aset', 1], ['Memiliki beberapa aset', 2], ['Memiliki sedikit aset', 3], ['Hampir tidak memiliki aset', 4], ['Tidak memiliki aset', 5]] },
];
async function main() { for (const item of criteria) { const kriteria = await prisma.kriteria.upsert({ where: { kode: item.kode }, update: { nama: item.nama, bobot: item.bobot, tipe: item.tipe }, create: { kode: item.kode, nama: item.nama, bobot: item.bobot, tipe: item.tipe } }); for (const [nama, nilai] of item.values) await prisma.subKriteria.upsert({ where: { kriteriaId_nama: { kriteriaId: kriteria.id, nama } }, update: { nilai }, create: { kriteriaId: kriteria.id, nama, nilai } }); } }
main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
