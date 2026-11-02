// Temporary script to generate 60 complete mustahik & run TOPSIS
import { prisma } from '../backend/src/config/prisma';
import { processTopsis } from '../backend/src/controllers/topsis.controller';
import type { Request, Response } from 'express';

async function main() {
  // Ensure admin user exists
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Admin Test',
        email: `admin_test_${Date.now()}@example.com`,
        passwordHash: 'dummy',
        role: 'ADMIN',
      },
    });
  }

  // Get active indicators (should be 15 total)
  const activeIndicators = await prisma.indikator.findMany({
    where: { aktif: true },
    orderBy: { urutan: 'asc' },
  });
  if (activeIndicators.length === 0) {
    console.error('No active indikator found');
    process.exit(1);
  }

  // Helper to create a mustahik with full answers
  async function createCompleteMustahik(idx: number) {
    const mustahik = await prisma.mustahik.create({
      data: {
        nik: `${String(1000000000000000 + idx)}`,
        namaLengkap: `Test Mustahik ${idx}`,
      },
    });
    const pengajuan = await prisma.pengajuan.create({
      data: {
        mustahikId: mustahik.id,
        status: 'LOLOS_VERIFIKASI',
        catatan: 'auto generated',
      },
    });
    // create answers for all active indicators
    const jawabanData = activeIndicators.map((ind) => ({
      pengajuanId: pengajuan.id,
      indikatorId: ind.id,
      nilai: Math.floor(Math.random() * 5) + 1, // 1-5
    }));
    await prisma.jawaban.createMany({ data: jawabanData });
  }

  // Clean previous test data (optional) – delete any test mustahik with nik >= 1000000000000000
  await prisma.mustahik.deleteMany({
    where: { nik: { gte: '1000000000000000' } },
  });

  // Generate 60 candidates
  const promises = [];
  for (let i = 0; i < 60; i++) {
    promises.push(createCompleteMustahik(i));
  }
  await Promise.all(promises);

  // Mock request & response
  const mockReq = {
    auth: { userId: admin.id },
  } as unknown as Request;
  let jsonResult: any = null;
  let statusCode = 200;
  const mockRes = {
    status: (code: number) => {
      statusCode = code;
      return mockRes;
    },
    json: (obj: any) => {
      jsonResult = obj;
      return mockRes;
    },
  } as unknown as Response;

  await processTopsis(mockReq, mockRes);
  console.log('Status code:', statusCode);
  console.log('Response:', JSON.stringify(jsonResult, null, 2));
}

main()
  .catch((e) => {
    console.error('Error executing script', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

