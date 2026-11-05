// components/employees/EmployeeList.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Home,
  KeyRound,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { employeeApi, type Employee, type EmployeeStats } from '@/lib/employee-api';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeImportModal from './EmployeeImportModal';
import EmployeeAccountModal from './EmployeeAccountModal';
import { useDialog } from '../ui/DiaologProvider';

const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200];

const SELECT_CLASS =
  'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500';

const AVATAR_COLORS = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-600',
  'bg-indigo-500',
  'bg-teal-500',
];


function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-semibold ${avatarColor(name)}`}
    >
      {initials(name)}
    </div>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${
        active
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-red-50 text-red-700 border-red-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

function TypeBadge({ type }: { type: Employee['staffType'] }) {
  const staff = type === 'staff';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${
        staff
          ? 'bg-sky-50 text-sky-700 border-sky-200'
          : 'bg-slate-50 text-slate-600 border-slate-200'
      }`}
    >
      {staff ? 'Staff' : 'Non Staff'}
    </span>
  );
}

function AccountBadge({ username } : { username?: string }) {
  return username ? (
    <span 
      title={`username: ${username}`}
      className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold border bg-sky-50 text-sky-700 border-sky-200"
      >
        Ada
    </span>
    ) : (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold border bg-slate-50 text-slate-500 border-slate-200">
        Belum
    </span>
  )
  }

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${tone}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function pageWindow(current: number, last: number): (number | '…')[] {
  const wanted = new Set<number>([1, last, current - 1, current, current + 1]);
  const sorted = [...wanted].filter(p => p >= 1 && p <= last).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Halaman sebelumnya"
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={16} />
      </button>

      {pageWindow(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="w-6 text-center text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              p === page ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Halaman berikutnya"
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Komponen utama ───────────────────────────────────────────────────────────

export default function EmployeeList() {
  const dialog = useDialog()
  const [accountFilter, setAccountFilter] = useState<'' | 'has' | 'none'>('');

  const [view, setView] = useState<'list' | 'grid'>('list');

  const [items, setItems] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [statsError, setStatsError] = useState('');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [status, setStatus] = useState<'' | 'active' | 'inactive'>('');
  const [staffType, setStaffType] = useState<'' | 'staff' | 'non_staff'>('');

  const [role, setRole] = useState('');
  const [modal, setModal] = useState<{ employee: Employee | null } | null>(null);
  // const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [accountModal, setAccountModal] = useState <{ mode : 'create' | 'reset'; ids?: string[]} | null>(null);
  const requestId = useRef(0);
  const canManage = role === 'admin';

  

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('auth-user') || '{}');
      setRole(user.role || '');
    } catch {
      setRole('');
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadList = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const res = await employeeApi.list({ q, departemen, status, staffType, account: accountFilter, page, perPage });
      if (id !== requestId.current) return;

      const lastPage = Math.max(1, Math.ceil(res.total / perPage));
      if (page > lastPage) {
        setPage(lastPage);
        return;
      }
      setItems(res.data ?? []);
      setSelected([])
      setTotal(res.total);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Gagal memuat data karyawan');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [q, departemen, status, staffType, accountFilter, page, perPage]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await employeeApi.stats());
      setStatsError('');
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Gagal memuat statistik');
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

    useEffect(() => {
      if (!canManage || items.length === 0) {
        setAccounts({})
        return;
      }
    let cancelled = false;
    employeeApi
    .accountStatus(items.map(e => e.id))
    .then(r => {
      if (!cancelled) setAccounts(r.accounts ?? {})
    })
    .catch(err => {
      console.log('accountsStatus gagal:', err)
    });
  return () => {
    cancelled = true
  };
  },[items, canManage]);

  const refreshAll = () => {
    loadList();
    loadStats();
  };

  const handleDelete = async (emp: Employee) => {
    const ok = await dialog.confirm({
      title: 'Hapus Karyawan?',
      message: `${emp.nama} (NIK ${emp.nik}) akan dihapus, Konfirmasi jika dihapus`,
      confirmText: 'Ya, hapus',
      danger: true,
    })
    if (!ok) return;
    try {
    await employeeApi.remove(emp.id);
    refreshAll();
    dialog.success(`${emp.nama} berhasil dihapus.`);
  } catch (err) {
    dialog.error(err instanceof Error ? err.message : 'Gagal menghapus karyawan');
  }
  };

  // const exportCsv = () => {
  //   const header = ['NIK', 'Nama', 'Jabatan', 'Departemen', 'Level', 'Tipe', 'Status'];
  //   const rows = items.map(e => [
  //     e.nik,
  //     e.nama,
  //     e.jabatan,
  //     e.departemen,
  //     e.level,
  //     e.staffType === 'staff' ? 'Staff' : 'Non Staff',
  //     e.isActive ? 'Aktif' : 'Nonaktif',
  //   ]);
  //   const csv = [header, ...rows]
  //     .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  //     .join('\n');
  //   const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'karyawan.csv';
  //   a.click();
  //   URL.revokeObjectURL(url);
  //   setExportOpen(false);
  // };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const num = (n?: number) => (n === undefined ? '—' : n.toLocaleString('id-ID'));
  const colSpan = canManage ? 9 : 6;
  const eligable = items.filter(e => e.isActive && !accounts[e.id])

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Master Karyawan</h1>
          {/* <nav className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Home size={12} />
            <ChevronRight size={12} />
            <span>Karyawan</span>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-medium">Daftar Karyawan</span>
          </nav> */}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="Tampilan daftar"
              className={`p-1.5 rounded-lg ${view === 'list' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <ListIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Tampilan kartu"
              className={`p-1.5 rounded-lg ${view === 'grid' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <div className="relative">
            {/* <button
              type="button"
              onClick={() => setExportOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
            >
              <Download size={14} /> Export <ChevronDown size={14} />
            </button> */}
            {/* {exportOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={items.length === 0}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
                >
                  CSV (data di halaman ini)
                </button>
              </div>
            )} */}
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
            >
              <Upload size={14} /> Import Excel
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() =>
                setAccountModal({mode: 'create', ids: selected.length > 0 ? selected : undefined })
              }
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
            >
              <UserPlus size={14} />
              {selected.length > 0 ? `Buat Akun (${selected.length})` : 'Buat Akun Massal'}
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setModal({ employee: null })}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus size={14} /> Tambah Karyawan
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Karyawan"
          value={num(stats?.total)}
          tone="bg-slate-800"
          icon={<Users size={20} />}
        />
        <StatCard
          label="Aktif"
          value={num(stats?.active)}
          tone="bg-green-500"
          icon={<UserCheck size={20} />}
        />
        <StatCard
          label="Nonaktif"
          value={num(stats?.inactive)}
          tone="bg-red-500"
          icon={<UserX size={20} />}
        />
        <StatCard
          label="Staff / Non Staff"
          value={stats ? `${num(stats.staff)} / ${num(stats.nonStaff)}` : '—'}
          tone="bg-sky-600"
          icon={<Briefcase size={20} />}
        />
      </div>

      {statsError && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ Statistik gagal dimuat: {statsError}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Daftar Karyawan</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className={SELECT_CLASS}
              value={departemen}
              onChange={e => {
                setDepartemen(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Departemen</option>
              {(stats?.departments ?? []).map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className={SELECT_CLASS}
              value={accountFilter}
              onChange={e => {
                setAccountFilter(e.target.value as '' | 'has' | 'none');
                setPage(1);
              }}
            >
              <option value="">Semua Akun</option>
              <option value="has">Ada Akun</option>
              <option value="no">Belum Ada Akun</option>
            </select>
            <select
              className={SELECT_CLASS}
              value={status}
              onChange={e => {
                setStatus(e.target.value as '' | 'active' | 'inactive');
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <select
              className={SELECT_CLASS}
              value={staffType}
              onChange={e => {
                setStaffType(e.target.value as '' | 'staff' | 'non_staff');
                setPage(1);
              }}
            >
              <option value="">Semua Tipe</option>
              <option value="staff">Staff</option>
              <option value="non_staff">Non Staff</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Baris per halaman
            <select
              className={SELECT_CLASS}
              value={perPage}
              onChange={e => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {PER_PAGE_OPTIONS.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            data
          </label>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau NIK"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            />
          </div>
        </div>

        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {view === 'list' ? (
            <div className="max-h-[65vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    {canManage && (
                      <th className='px-4 py-3 w-10'>
                        <input type="checkbox"
                        aria-label='Pilih semua halaman ini yang belum punya akun'
                        checked={eligable.length > 0 && eligable.every(e => selected.includes(e.id))}
                        disabled={eligable.length === 0}
                        onChange={ev => setSelected(ev.target.checked ? eligable.map(e => e.id) : [])}
                        className='w-4 h-4 accent-sky-600 disabled:opacity-30'
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">NIK</th>
                    <th className="px-4 py-3 text-left font-semibold">Nama</th>
                    <th className="px-4 py-3 text-left font-semibold">Departemen</th>
                    <th className="px-4 py-3 text-left font-semibold">Level</th>
                    <th className="px-4 py-3 text-left font-semibold">Tipe</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    {canManage && <th className="px-4 py-3 text-left font-semibold">Akun</th>}
                    {canManage && <th className="px-4 py-3 text-right font-semibold">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-400">
                        {loading ? 'Memuat data…' : 'Tidak ada data karyawan'}
                      </td>
                    </tr>
                  ) : (
                    items.map(emp => (
                      <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                        {canManage && (
                        <td
                          className='px-4 py-3 w-10'
                        >
                          <input type="checkbox"
                          aria-label={`Pilih ${emp.nama}`}
                          checked={selected.includes(emp.id)}
                          disabled={!!accounts[emp.id] || !emp.isActive}
                          onChange={ev =>
                            setSelected(s =>
                              ev.target.checked ? [...s, emp.id] : s.filter(x => x !== emp.id)
                            )
                          }
                          className='w-4 h-4 accent-sky-600 disabled:opacity-30'
                          />
                        </td>  
                        )}
                        <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                          {emp.nik}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={emp.nama} />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">{emp.nama}</p>
                              <p className="text-xs text-slate-400 truncate">{emp.jabatan || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{emp.departemen || '—'}</td>
                        <td className="px-4 py-3 text-slate-700">{emp.level || '—'}</td>
                        <td className="px-4 py-3">
                          <TypeBadge type={emp.staffType} />
                        </td>
                        <td className="px-4 py-3">
                          <ActiveBadge active={emp.isActive} />
                        </td>
                        {canManage && (
                          <td className='px-4 py-3'>
                            <AccountBadge username={accounts[emp.id]}/>
                          </td>
                        )}
                        {canManage && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {accounts[emp.id] && (
                                <button
                                  type="button"
                                  onClick={() => setAccountModal({ mode: 'reset', ids: [emp.id] })}
                                  aria-label={`Reset password ${emp.nama}`}
                                  title="Reset Password"
                                  className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                >
                                  <KeyRound size={15}/>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setModal({ employee: emp })}
                                aria-label={`Ubah ${emp.nama}`}
                                className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(emp)}
                                aria-label={`Hapus ${emp.nama}`}
                                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-h-[65vh] overflow-auto p-5">
              {items.length === 0 ? (
                <p className="py-12 text-center text-slate-400">
                  {loading ? 'Memuat data…' : 'Tidak ada data karyawan'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {items.map(emp => (
                    <div
                      key={emp.id}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.nama} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{emp.nama}</p>
                          <p className="text-xs text-slate-400 truncate">{emp.jabatan || '—'}</p>
                        </div>
                      </div>
                      <dl className="mt-3 space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <dt>NIK</dt>
                          <dd className="font-mono text-slate-700">{emp.nik}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Departemen</dt>
                          <dd className="text-slate-700">{emp.departemen || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Level</dt>
                          <dd className="text-slate-700">{emp.level || '—'}</dd>
                        </div>
                        {canManage && (
                        <div className="flex justify-beetwen items-center">
                          <dt>Akun</dt>
                          <dd>
                            <AccountBadge username={accounts[emp.id]} />
                          </dd>
                        </div>
                        )}
                      </dl>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TypeBadge type={emp.staffType} />
                          <ActiveBadge active={emp.isActive} />
                        </div>
                        {canManage && (
                          <div className="flex items-center">
                            {accounts[emp.id] && (
                            <button 
                              type="button"
                              onClick={() => setAccountModal({ mode:'reset', ids:[emp.id] })}
                              aria-label={`Reset Password ${emp.nama}`}
                              title="Reset Password"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <KeyRound size={14} />
                            </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setModal({ employee: emp })}
                              aria-label={`Ubah ${emp.nama}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(emp)}
                              aria-label={`Hapus ${emp.nama}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

          {/* Paginasi */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Menampilkan {num(from)}–{num(to)} dari {num(total)} karyawan
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {accountModal && (
        <EmployeeAccountModal
          key={`${accountModal.mode}-${accountModal.ids?.join(',') ?? 'all'}`}
          mode={accountModal.mode}
          ids={accountModal.ids}
          departemen={departemen}
          onClose={() => setAccountModal(null)}
          onDone={() => refreshAll()}
        />
      )}    

      {importOpen && (
        <EmployeeImportModal
          onClose={() => setImportOpen(false)}
          onImported={() => {
            setImportOpen(false);
            setPage(1);
            refreshAll();
          }}
        />
      )}

      {modal && (
        <EmployeeFormModal
          key={modal.employee?.id ?? 'new'}
          employee={modal.employee}
          departments={stats?.departments ?? []}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            refreshAll();
          }}
        />
      )}
    </div>
  );
}