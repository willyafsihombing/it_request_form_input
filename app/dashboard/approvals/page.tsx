'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight } from 'lucide-react';
import { approvalApi } from '@/lib/approval-api';
import type { InboxItem } from '@/types/approval';

export default function ApprovalInboxPage() {
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    approvalApi.inbox()
      .then(r => setItems(r.items ?? []))
      .catch(e => setError(e instanceof Error ? e.message : 'Gagal memuat'));
  }, []);

  return (
    <div className="flex-1 p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Menunggu Persetujuan Saya</h1>
      <p className="text-xs text-slate-500 mb-5">Request yang sedang menunggu tindakan Anda.</p>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {!items && !error && <Loader2 className="animate-spin text-slate-400" />}
      {items && items.length === 0 && (
        <p className="text-sm text-slate-400">Tidak ada request yang menunggu.</p>
      )}

      <ul className="space-y-2">
        {items?.map(i => (
          <li key={`${i.requestId}-${i.round}`}>
            <Link href={`/dashboard/requests/${i.requestId}`}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-sky-300 hover:shadow-sm transition">
              <div>
                <p className="text-sm font-semibold text-slate-800">Request {i.requestId.slice(0, 8)}…</p>
                <p className="text-xs text-slate-500">
                  Langkah {i.stepOrder}: {i.label} · putaran {i.round} ·{' '}
                  {new Date(i.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
