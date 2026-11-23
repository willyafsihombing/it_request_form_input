'use client ';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { employeeApi, type EmployeeOption } from '@/lib/employee-api';

interface Props {
  value: EmployeeOption | null;
  onChange: (emp: EmployeeOption | null) => void;
  placeholder?: string;
}

export default function EmployeePicker({ value, onChange, placeholder = 'Cari nama atau NIK…' }: Props) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<EmployeeOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      employeeApi.search(q.trim(), 8)
        .then(r => setItems(r.data ?? []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-sky-50 border border-sky-200 rounded-lg">
        <div className="min-w-0">
          <p className="font-semibold text-sky-900 truncate">{value.nama}</p>
          <p className="text-xs text-sky-700 truncate">{value.nik} · {value.jabatan || '—'}</p>
        </div>
        <button type="button" onClick={() => { onChange(null); setQ(''); }}
          className="p-1 text-sky-600 hover:text-red-600" aria-label="Hapus pilihan">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div ref={box} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
        />
      </div>
      {open && q.trim().length >= 2 && (
        <ul
          className="bg-white border border-slate-200 rounded-lg shadow-lg"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            zIndex: 50,
            maxHeight: 256,
            overflowY: 'auto',
          }}
        >          {loading && <li className="px-3 py-2 text-xs text-slate-400">Mencari…</li>}
          {!loading && items.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">Tidak ditemukan</li>}
          {items.map(emp => (
            <li key={emp.id}>
              <button type="button"
                onClick={() => { onChange(emp); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-sky-50">
                <p className="text-sm font-medium text-slate-800">{emp.nama}</p>
                <p className="text-xs text-slate-500">{emp.nik} · {emp.departemen} · {emp.jabatan}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}