'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, UserCheck, MessageSquare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import type { RequestStatus, RequestPriority, ITRequest } from '@/types';

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

  const handleSave = async () => {
  setSaving(true);
  try {
    const res = await fetch(`/api/requests/${request.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, priority, assignedTo, itNotes }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Gagal menyimpan');
      return;
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload(); // ← paksa fetch ulang dari DB
    }, 1000);

  } catch {
    alert('Gagal menghubungi server');
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

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <Zap size={11} className="inline mr-1" />Status
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
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
              onClick={() => setPriority(opt.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
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
      {/* <div>
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
      </div> */}

      {/* Save */}
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
    </div>
  );
}
