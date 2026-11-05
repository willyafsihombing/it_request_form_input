// app/dashboard/requests/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requestApi } from '@/lib/api';
import ITRequestForm from '@/components/form/ITRequestForm';
import type { ITRequest } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = (await requestApi.getById(id)) as ITRequest | null;
  if (!r) notFound();
  if (r.status !== 'rejected') redirect(`/dashboard/requests/${id}`);

  return (
    <div className="flex-1 min-w-0 p-6">
      <Link
        href={`/dashboard/requests/${id}`}
        className="inline-flex items-center gap-2 mb-4 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Kembali ke detail
      </Link>

      {r.itNotes && (
        <div className="max-w-4xl mx-auto mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            💬 Alasan penolakan dari IT
          </p>
          <p className="text-sm text-amber-800 whitespace-pre-line">{r.itNotes}</p>
        </div>
      )}

      <ITRequestForm mode="edit" requestId={id} initial={r as unknown as Record<string, unknown>} />
    </div>
  );
}