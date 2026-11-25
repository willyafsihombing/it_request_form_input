'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, Minus, Clock, CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { approvalApi } from '@/lib/approval-api';
import { useDialog } from '@/components/ui/DiaologProvider';
import type { ApprovalProgressData, ApprovalStep } from '@/types/approval';

const STYLE: Record<ApprovalStep['status'], string> = {
  approved: 'bg-green-100 text-green-700 border-green-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
  active:   'bg-sky-100 text-sky-700 border-sky-400 ring-2 ring-sky-200',
  waiting:  'bg-slate-50 text-slate-400 border-slate-200',
  skipped:  'bg-slate-50 text-slate-300 border-slate-200',
};

function Icon({ s }: { s: ApprovalStep['status'] }) {
  if (s === 'approved') return <Check size={14} />;
  if (s === 'rejected') return <X size={14} />;
  if (s === 'active')   return <Clock size={14} />;
  return <Minus size={14} />;
}

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '';

export default function ApprovalProgress({ requestId }: { requestId: string }) {
  const router = useRouter();
  const dialog = useDialog();
  const [data, setData] = useState<ApprovalProgressData | null>(null);
  const [legacy, setLegacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [sigMissing, setSigMissing] = useState(false);

  useEffect(() => {
    if (!data?.canAct || data.status !== 'in_review') return;
    approvalApi.mySignature()
      .then(r => setSigMissing(!r?.has))
      .catch(() => {});
  }, [data?.canAct, data?.status]);

  const load = useCallback(async () => {
    try {
      setData(await approvalApi.progress(requestId));
      setLegacy(false);
    } catch {
      setLegacy(true); 
    }
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  if (legacy || !data) return null;

  const act = async (kind: 'approve' | 'reject') => {
    if (kind === 'reject' && !note.trim()) {
      dialog.error('Isi catatan sebagai alasan penolakan.', 'Catatan Wajib Diisi');
      return;
    }
    const ok = await dialog.confirm({
      title: kind === 'approve' ? 'Setujui Request?' : 'Tolak Request?',
      message: kind === 'approve'
        ? 'Tanda tangan Anda akan dibubuhkan pada form ini.'
        : 'Request dikembalikan ke pemohon. Setelah diajukan ulang, proses lanjut dari langkah Anda.',
      confirmText: kind === 'approve' ? 'Ya, setujui' : 'Ya, tolak',
      cancelText: 'Batal',
      danger: kind === 'reject',
    });
    if (!ok) return;
    setBusy(true);
    try {
      if (kind === 'approve') await approvalApi.approve(requestId, note.trim());
      else await approvalApi.reject(requestId, note.trim());
      setNote('');
      dialog.success(kind === 'approve' ? 'Request disetujui.' : 'Request ditolak.', 'Berhasil');
      await load();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal memproses.';
      if (msg.includes('Tanda Tangan Saya')) setSigMissing(true);
      dialog.error(msg, 'Gagal');
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {data.steps.map(s => (
          <li key={s.id} className={cn('flex gap-3 rounded-lg border px-3 py-2', STYLE[s.status])}>
            <span className="mt-0.5 flex-shrink-0"><Icon s={s.status} /></span>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-semibold">
                {s.stepOrder}. {s.label}
                {s.status === 'skipped' && <span className="ml-1 font-normal">(dilewati)</span>}
              </p>
              {s.status === 'approved' || s.status === 'rejected' ? (
                <p>
                  {s.actedByNama} · {fmt(s.actedAt)}
                  {s.carriedOver && (
                    <span className="ml-1 inline-flex items-center gap-0.5 opacity-70">
                      <CornerDownRight size={10} /> dari putaran sebelumnya
                    </span>
                  )}
                </p>
              ) : s.status !== 'skipped' && s.approvers.length > 0 ? (
                <p className="opacity-80">{s.approvers.map(a => a.nama).join(' / ')}</p>
              ) : null}
              {s.note && <p className="mt-1 whitespace-pre-line italic">“{s.note}”</p>}
            </div>
          </li>
        ))}
      </ol>

      {data.status === 'rejected' && (
        <p className="text-xs text-red-600">Ditolak — menunggu pemohon mengajukan ulang.</p>
      )}
      {data.status === 'approved' && (
        <p className="text-xs text-green-700">Seluruh persetujuan selesai.</p>
      )}

      {data.canAct && data.status === 'in_review' && (
        <div className="space-y-2 border-t border-slate-100 pt-3">
          {sigMissing && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Anda belum mengunggah tanda tangan.{' '}
              <Link href="/dashboard/signature" className="font-semibold underline">
                Unggah di Tanda Tangan Saya
              </Link>{' '}
              sebelum menyetujui.
            </div>
          )}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Catatan (wajib bila menolak)…"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => act('reject')} disabled={busy}
              className="py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50">
              Tolak
            </button>
            <button onClick={() => act('approve')} disabled={busy}
              className="py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 flex items-center justify-center gap-1">
              {busy && <Loader2 size={14} className="animate-spin" />} Setujui
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
