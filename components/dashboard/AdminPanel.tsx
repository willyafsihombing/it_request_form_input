'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, UserCheck, MessageSquare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import type { RequestStatus, RequestPriority, ITRequest } from '@/types';
import { requestApi } from '@/lib/api';

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
  const [status,     setStatus]     = useState<RequestStatus>(request.status);
  const [priority,   setPriority]   = useState<RequestPriority>(request.priority);
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || '');
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
  // console.log(useStr)
}, []);

  const isITStaff = userRole === 'staff' || userRole === 'itstaff';
  const isAdmin = userRole === 'admin';
  const canEdit = isITStaff;

  const handleSave = async () => {
  if (!canEdit) return;
  setSaving(true);
  try {
      await requestApi.update(request.id,{status, priority,assignedTo,itNotes});

      setSaved(true)
      setTimeout(() => {
        setSaved(false);
        window.location.reload()
      }, 1000);
  } catch {
    alert('Gagal menyimpan data');
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="space-y-4">
      {/* Current */}
      <div className="flex gap-3 flex-wrap">
        <StatusBadge status={status} />
        <PriorityBadge priority={priority} />
      </div>

      {/* {userRole && (
        <div className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-semibold',
          canEdit
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        )}>
          {canEdit ? '✅ IT Staff — dapat mengedit' : '👁️ Admin — hanya dapat melihat'}
        </div>
      )} */}

      {/* Status */}
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

      {/* Priority */}
      <div>
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
      </div>

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

      {/* IT Notes */}
      {canEdit && (
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <MessageSquare size={11} className="inline mr-1" />Catatan IT
        </label>
        <textarea
          value={itNotes}
          onChange={e => setItNotes(e.target.value)}
          placeholder="Catatan internal untuk tim IT..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white resize-none"
        />
      </div>
      )}

      {/* Save */}
      {canEdit && (
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
        )}
    </div>
  );
}
