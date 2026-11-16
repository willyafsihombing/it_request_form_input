// app/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, Lock } from 'lucide-react';
import { employeeApi } from '@/lib/employee-api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checks = [
    { ok: next.length >= 10, text: 'Minimal 10 karakter' },
    { ok: /[A-Za-z]/.test(next) && /[0-9]/.test(next), text: 'Mengandung huruf dan angka' },
    { ok: next !== '' && next === confirm, text: 'Konfirmasi password sama' },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) {
      setError('Semua kolom wajib diisi');
      return;
    }
    if (checks.some(c => !c.ok)) {
      setError('Password baru belum memenuhi syarat');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await employeeApi.changePassword(current, next);

      localStorage.setItem('auth-token', res.token);
      localStorage.setItem('auth-user', JSON.stringify(res.user));

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengganti password');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 bg-slate-50';

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-600 rounded-2xl mb-4 shadow-lg shadow-sky-500/30">
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Ganti Password</h1>
          <p className="text-slate-500 text-sm mt-1">
            Demi keamanan, buat password baru sebelum melanjutkan.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-2xl shadow-sky-100 p-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password saat ini
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password baru
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={next}
                  onChange={e => setNext(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Ulangi password baru
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={show}
                onChange={e => setShow(e.target.checked)}
                className="w-4 h-4 accent-sky-600"
              />
              Tampilkan password
            </label>

            <ul className="text-xs space-y-1">
              {checks.map(c => (
                <li key={c.text} className={c.ok ? 'text-green-600' : 'text-slate-400'}>
                  {c.ok ? '✓' : '○'} {c.text}
                </li>
              ))}
            </ul>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                'Simpan Password Baru'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}