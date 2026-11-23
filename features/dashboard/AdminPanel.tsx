'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, MessageSquare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import type { RequestStatus, RequestPriority, ITRequest } from '@/types';
import { requestApi } from '@/lib/api';
import { useDialog } from '@/components/ui/DiaologProvider';
import ApprovalProgress from '@/features/approval/ApprovalProgress';  

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'pending',   label: 'Pending'   },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved',  label: 'Approved'  },
  { value: 'rejected',  label: 'Rejected'  },
];

const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: 'low',    label: 'Low'    },
  { value: 'normal', label: 'Normal' },
  { value: 'high',   label: 'High'   },
  { value: 'urgent', label: 'Urgent' },
];


export default function AdminPanel({ request }: { request: ITRequest }) {
  const router = useRouter();
  const dialog = useDialog();
  const [status,     setStatus]     = useState<RequestStatus>(request.status);
  const [priority,   setPriority]   = useState<RequestPriority>(request.priority);
  const [itNotes,    setItNotes]    = useState(request.itNotes    || '');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [userRole,   setUserRole]   = useState<string>('')


  useEffect(() => {
  const useStr = localStorage.getItem('auth-user');
  if (useStr) {
    try{
      const user = JSON.parse(useStr);
      setUserRole(user.role || '');
    }catch{
      setUserRole('')
    }
  }
}, []);

  const isITStaff = userRole === 'staff' || userRole === 'itstaff';
  const isAdmin = userRole === 'admin';
  const isApproved = request.status === 'approved'
  const usesApproval = !!request.approvalStatus
  const isLockedForStaff = isITStaff && isApproved
  const canEdit = isITStaff || isAdmin;

  const handleSave = async () => {
  if (!canEdit) return;

  if (!usesApproval && status === 'rejected' && !itNotes.trim()) {
    dialog.error('Isi Catatan IT sebagai alasan penolakan.', 'Catatan Wajib Diisi');
    return;
  }

  const isReject = !usesApproval && status === 'rejected';
  const ok = await dialog.confirm({
    title: isReject ? 'Tolak Request?' : 'Simpan Perubahan?',
    message: isReject
      ? `Request ${request.formNumber} akan ditolak. Pemohon dapat mengedit dan mengajukan ulang.`
      : `Perubahan pada request ${request.formNumber} akan disimpan.`,
    confirmText: isReject ? 'Ya, tolak' : 'Ya, simpan',
    cancelText: 'Batal',
    danger: isReject,
  });
  if (!ok) return;

  setSaving(true);
  try {
    await requestApi.update(
      request.id,
      usesApproval ? { priority, itNotes } : { status, priority, itNotes }, //assignedTo
    );

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);

    dialog.success('Perubahan request berhasil disimpan.', 'Berhasil Disimpan');
    router.refresh();
  } catch (err) {
    dialog.error(
      err instanceof Error ? err.message : 'Gagal menyimpan perubahan.',
      'Gagal Menyimpan',
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="space-y-4">
      {isLockedForStaff && (
        <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            Request ini sudah <b>Approved</b> dan tidak bisa diubah lagi. Hubungi admin jika perlu perubahan.
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        {usesApproval && request.approvalStatus === 'in_review' ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Waiting
          </span>
        ) : (
          <StatusBadge status={status} />
        )}
        <PriorityBadge priority={priority} />
      </div>

       {usesApproval ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alur Persetujuan</p>
          <ApprovalProgress requestId={request.id} />
        </div>
      ) : (
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <Zap size={11} className="inline mr-1" />Status
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => canEdit && setStatus(opt.value)}
              disabled={!canEdit}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
                !canEdit && 'cursor-not-allowed opacity-60',
                status === opt.value
                  ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Prioritas
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRIORITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => canEdit && setPriority(opt.value)}
              disabled={!canEdit}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
                !canEdit && 'cursor-not-allowed opacity-60',
                priority === opt.value
                  ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div> */}

      {/* Assigned To */}
        {/* <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <UserCheck size={11} className="inline mr-1" />Ditugaskan kepada
          </label>
          <input
            type="text"
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
            placeholder="Nama teknisi IT..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
          />
        </div> */}

      
      {/* <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <MessageSquare size={11} className="inline mr-1" />Catatan IT
        </label>
        {canEdit ? (
        <textarea
          value={itNotes}
          onChange={e => setItNotes(e.target.value)}
          placeholder="Catatan internal untuk tim IT..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white resize-none"
        />
        ) : (
          <p className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-line text-slate-700 min-h-[2.5rem]">
              {itNotes || <span className="text-slate-400">Tidak ada catatan.</span>}
            </p>
          )}
      </div> */}
      {/* {canEdit && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
            saved
              ? 'bg-green-500 text-white'
              : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow-md'
          )}
        >
          {saving ? (
            <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
          ) : saved ? (
            <>✓ Tersimpan</>
          ) : (
            <><Save size={15} /> Simpan Perubahan</>
          )}
        </button>
        )} */}
    </div>
  );
}
