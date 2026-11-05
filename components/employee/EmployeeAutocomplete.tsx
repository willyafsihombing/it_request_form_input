// components/employees/EmployeeAutocomplete.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { employeeApi, type EmployeeOption } from '@/lib/employee-api';

interface Props {
  value: string;                                
  onChange: (text: string) => void;             
  onSelect: (employee: EmployeeOption) => void; 
  onClear?:() =>void;
  strict?: boolean;                             
  placeholder?: string;
  disabled?: boolean;
  className?: string;                           
}

const DEFAULT_INPUT =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500';

export default function EmployeeAutocomplete({
  value,
  onClear,
  onChange,
  onSelect,
  strict = false,
  placeholder,
  disabled,
  className,
}: Props) {
  const [text, setText] = useState(value); 
  const [options, setOptions] = useState<EmployeeOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [touched, setTouched] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (!touched) return;

    const q = text.trim();
    if (q.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const id = ++requestId.current;
      setLoading(true);
      try {
        const res = await employeeApi.search(q, 8);
        if (id !== requestId.current) return;
        setOptions(res.data ?? []);
        setActive(-1);
        setOpen(true);
      } catch {
        if (id === requestId.current) {
          setOptions([]);
          setOpen(false);
        }
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [text, touched]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const choose = (emp: EmployeeOption) => {
    requestId.current++;  
    setTouched(false);   
    setOpen(false);
    setLoading(false);
    setText(emp.nama);
    onSelect(emp);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || options.length === 0) {
      if (e.key === 'Escape') setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => (a + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => (a <= 0 ? options.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const pendingPick = strict && text.trim() !== '' && text !== value;

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={text}
        disabled={disabled}
        placeholder={
          placeholder ?? (strict ? 'Ketik untuk mencari, lalu pilih dari daftar' : 'Ketik nama atau NIK karyawan')
        }
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onChange={e => {
          const t = e.target.value;
          setText(t);
          setTouched(true);

          if (t === '') {
            onChange('');
            onClear?.();
          } else if(!strict){
            onChange(t)
          }
          if (!strict || t === '') onChange(t);
        }}
        onFocus={() => {
          if (touched && text.trim().length >= 2 && options.length > 0) setOpen(true);
        }}
        onBlur={() => {
          if (strict && text !== value) setText(value);
        }}
        onKeyDown={onKeyDown}
        className={className ?? DEFAULT_INPUT}
      />

      {loading && (
        <Loader2
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
        />
      )}

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-64 overflow-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">
              {strict
                ? 'Tidak ditemukan di departemen Anda'
                : 'Tidak ditemukan, silakan isi manual'}
            </li>
          ) : (
            options.map((o, i) => (
              <li
                key={o.id}
                role="option"
                aria-selected={i === active}
                onMouseDown={e => {
                  e.preventDefault(); // pilih sebelum input kehilangan fokus
                  choose(o);
                }}
                onMouseEnter={() => setActive(i)}
                className={`px-3 py-2 cursor-pointer ${i === active ? 'bg-sky-50' : ''}`}
              >
                <p className="text-sm font-medium text-slate-800">{o.nama}</p>
                <p className="text-xs text-slate-400">
                  {o.nik}
                  {o.jabatan ? ` · ${o.jabatan}` : ''}
                  {o.departemen ? ` · ${o.departemen}` : ''}
                </p>
              </li>
            ))
          )}
        </ul>
      )}

      {pendingPick && !open && (
        <p className="mt-1 text-xs text-amber-600">Pilih salah satu nama dari daftar yang muncul.</p>
      )}
    </div>
  );
}