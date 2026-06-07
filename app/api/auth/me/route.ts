import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    // Ambil data terbaru dari DB
    const user = await prisma.user.findFirst({
      where: { id: payload.id, deletedAt: null },
      select: {
        id: true, email: true, username: true,
        namaLengkap: true, role: true,
        department: true, title: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (err) {
    console.error('GET /api/auth/me:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}