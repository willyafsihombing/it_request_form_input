// app/api/requests/next-number/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const START = 175;

    // Ambil semua formNumber yang ada
    const all = await prisma.request.findMany({
      select: { formNumber: true },
    });

    // Cari seq tertinggi dari seluruh data
    let maxSeq = START - 1;

    for (const row of all) {
      if (!row.formNumber) continue;
      const match = row.formNumber.match(/^(\d+)-ITR-/);
      if (match && match[1]) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n > maxSeq) maxSeq = n;
      }
    }

    const nextSeq = maxSeq + 1; // kalau DB kosong → 174+1 = 175

    console.log('all formNumbers:', all.map(r => r.formNumber));
    console.log('maxSeq found:', maxSeq, '→ nextSeq:', nextSeq);

    return NextResponse.json({ nextSeq });
  } catch (err) {
    console.error('next-number error:', err);
    return NextResponse.json({ nextSeq: 175 });
  }
}