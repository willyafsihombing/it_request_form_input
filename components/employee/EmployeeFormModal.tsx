// components/employees/EmployeeFormModal.tsx
'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useDialog } from '@/components/ui/DiaologProvider'
import {
  employeeApi,
  type Employee,
  type EmployeeInput,
  type StaffType,
} from '@/lib/employee-api';

interface Props {
  employee: Employee | null; // null = tambah baru
  departments: string[];
  onClose: () => void;
  onSaved: () => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500';
const LABEL_CLASS = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export default function EmployeeFormModal({ employee, departments, onClose, onSaved }: Props) {
  const dialog = useDialog();
  const isEdit = employee !== null;

  const [form, setForm] = useState<EmployeeInput>({
    nik: employee?.nik ?? '',
    nama: employee?.nama ?? '',
    jabatan: employee?.jabatan ?? '',
    departemen: employee?.departemen ?? '',
    level: employee?.level ?? '',
    staffType: employee?.staffType ?? 'non_staff',
    isActive: employee?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof EmployeeInput>(key: K, value: EmployeeInput[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nik.trim() || !form.nama.trim()) {
      setError('NIK dan nama wajib diisi');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const body: EmployeeInput = { ...form, nik: form.nik.trim(), nama: form.nama.trim() };
      if (employee) await employeeApi.update(employee.id, body);
      else await employeeApi.create(body);
      onSaved();
      dialog.success(
        isEdit ? `Data Berhasil ${body.nama} berhasil diperbaharui.` : `Data ${body.nama} berhasil ditambahkan.`,
        isEdit ? 'Perubahan Diperbaharui' : 'Berhasil Disimpan',
      )
    } catch (err) {
      dialog.error(
        err instanceof Error ? err.message : 'Gagal menyimpan data karyawan.','Gagal Menyimpan Data',
      )
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Ubah Karyawan' : 'Tambah Karyawan'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>NIK</label>
              <input
                className={INPUT_CLASS}
                value={form.nik}
                onChange={e => set('nik', e.target.value)}
                placeholder="100001"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Nama</label>
              <input
                className={INPUT_CLASS}
                value={form.nama}
                onChange={e => set('nama', e.target.value)}
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Jabatan</label>
              <input
                className={INPUT_CLASS}
                value={form.jabatan}
                onChange={e => set('jabatan', e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Departemen</label>
              <input
                className={INPUT_CLASS}
                list="departemen-options"
                value={form.departemen}
                onChange={e => set('departemen', e.target.value)}
              />
              <datalist id="departemen-options">
                {departments.map(d => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={LABEL_CLASS}>Level</label>
              <input
                className={INPUT_CLASS}
                value={form.level}
                onChange={e => set('level', e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Tipe</label>
              <select
                className={INPUT_CLASS}
                value={form.staffType}
                onChange={e => set('staffType', e.target.value as StaffType)}
              >
                <option value="staff">Staff</option>
                <option value="non_staff">Non Staff</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="w-4 h-4 accent-sky-600"
            />
            Karyawan aktif
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 rounded-xl shadow-sm"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}