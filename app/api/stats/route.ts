import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth } from 'date-fns';

export async function GET() {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const [total, pending, inReview, approved, rejected, thisMonth] = await Promise.all([
      prisma.request.count(),
      prisma.request.count({ where: { status: 'pending' } }),
      prisma.request.count({ where: { status: 'in_review' } }),
      prisma.request.count({ where: { status: 'approved' } }),
      prisma.request.count({ where: { status: 'rejected' } }),
      prisma.request.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    return NextResponse.json({ total, pending, inReview, approved, rejected, thisMonth });
  } catch (err) {
    console.error('GET /api/stats:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
