import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type routeParams = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: routeParams ) {
  try {
    const { id } = await params
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(request);
  } catch (err) {
    console.error('GET /api/requests/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: routeParams) {
  try {
    const { id } = await params
    const body = await req.json();

    // Allow updating admin fields + form fields
    const allowedFields = [
      'status', 'priority', 'itNotes', 'assignedTo',
      'techComment', 'techAD', 'techAW', 'techCR', 'techEM', 'techIP', 'techEP',
      'sigITAdmin', 'sigMSDIMgr', 'sigSrMgr', 'sigHOO',
      'costCode',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field];
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/requests');
    revalidatePath(`/dashboard/requests/${id}`);

    const updated = await prisma.request.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/requests/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  try {
    const { id } = await params;  // ← await params

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const existing = await prisma.request.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Request tidak ditemukan' }, { status: 404 });
    }

    await prisma.request.update({
      where: { id },
      data: {deletedAt: new Date() },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/requests')

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Gagal menghapus request' }, { status: 500 });
  }
}
