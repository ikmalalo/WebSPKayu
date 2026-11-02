// JS script to generate 60 complete mustahik and invoke TOPSIS
const { prisma } = require('../backend/src/config/prisma');
const { processTopsis } = require('../backend/src/controllers/topsis.controller');

async function main() {
  // ensure admin
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

  const activeIndicators = await prisma.indikator.findMany({
    where: { aktif: true },
    orderBy: { urutan: 'asc' },
  });
  if (activeIndicators.length === 0) {
    console.error('No active indikator');
    process.exit(1);
  }

  // clean previous test mustahik (nik >= 1000000000000000)
  await prisma.mustahik.deleteMany({ where: { nik: { gte: '1000000000000000' } } });

  async function createComplete(idx) {
    const mustahik = await prisma.mustahik.create({
      data: { nik: `${1000000000000000 + idx}`, namaLengkap: `Test Mustahik ${idx}` },
    });
    const pengajuan = await prisma.pengajuan.create({
      data: { mustahikId: mustahik.id, status: 'LOLOS_VERIFIKASI', catatan: 'auto' },
    });
    const jawaban = activeIndicators.map(ind => ({ pengajuanId: pengajuan.id, indikatorId: ind.id, nilai: Math.floor(Math.random()*5)+1 }));
    await prisma.jawaban.createMany({ data: jawaban });
  }

  const creates = [];
  for (let i = 0; i < 60; i++) creates.push(createComplete(i));
  await Promise.all(creates);

  // mock req/res
  const mockReq = { auth: { userId: admin.id } };
  let status = 0;
  let json = null;
  const mockRes = {
    status: code => { status = code; return mockRes; },
    json: obj => { json = obj; return mockRes; },
  };

  await processTopsis(mockReq, mockRes);
  console.log('Status:', status);
  console.log('Response:', JSON.stringify(json, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

