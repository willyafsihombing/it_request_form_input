// scripts/check-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test koneksi
    await prisma.$connect();
    console.log('✅ Koneksi PostgreSQL berhasil');

    // Cek jumlah record
    const count = await prisma.request.count();
    console.log(`📦 Total records: ${count}`);

    // Tampilkan 5 data terbaru
    const latest = await prisma.request.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, formNumber: true, reqName: true, createdAt: true },
    });

    console.log('📋 5 Data terbaru:');
    console.table(latest);

  } catch (err) {
    console.error('❌ Koneksi gagal:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();