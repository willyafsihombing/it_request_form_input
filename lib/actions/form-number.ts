// lib/actions/form-number.ts
'use server';

import { prisma } from '@/lib/prisma';
import { buildFormNumber } from '@/lib/utils';

const START = 175;
// Sesuaikan dengan tanggal kamu mulai pakai sistem baru
const RESET_DATE = new Date('2026-06-05T00:00:00.000Z');

export async function getNextFormNumber(): Promise<string> {
  // Hitung berapa record yang sudah dibuat sejak reset
  const count = await prisma.request.count({
    where: {
      createdAt: { gte: RESET_DATE },
    },
  });

  // START + jumlah record baru = nomor berikutnya
  const nextSeq = START + count;
  return buildFormNumber(nextSeq);
}