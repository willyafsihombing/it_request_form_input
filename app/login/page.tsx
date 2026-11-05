// app/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Eye, EyeOff, Loader2, Lock, ShieldCheck, User, Users } from 'lucide-react';
import { authApi } from '@/lib/api';

// const FEATURES = [
//   { icon: ClipboardList, title: 'IT Request', desc: 'Ajukan dan pantau permintaan IT dalam satu tempat.' },
//   { icon: ClipboardList, title: '', desc: 'Ajukan dan pantau permintaan IT dalam satu tempat.' },
//   { icon: Users, title: 'Data Karyawan', desc: 'Data penerima terisi otomatis dari master karyawan.' },
//   { icon: ShieldCheck, title: 'Akses Aman', desc: 'Login berbasis NIK dengan hak akses sesuai peran.' },
// ];

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('expired') === '1') {
      setNotice('Sesi Anda telah berakhir. Silakan login kembali.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setError('NIK dan password wajib diisi');
      return;
    }
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const res = (await authApi.login(login, password)) as any;

      localStorage.setItem('auth-token', res.token);
      localStorage.setItem('auth-user', JSON.stringify(res.user));

      router.push(res.user?.mustChangePassword ? '/change-password' : '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-12 pr-4 py-3.5 text-base border border-slate-200 rounded-xl bg-white ' +
    'placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/15 focus:border-sky-500 transition-all';

  return (
    <div className="min-h-dvh flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr] bg-white overflow-x-hidden">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-500 p-12 text-white">
        <div className="pointer-events-none absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-cyan-300/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative flex items-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center p-2">
            <img src="/img/nexora-rev1.png" alt="Nexora" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            One Platform,
            <br />
            Everything Connected.
          </h1>
          <p className="mt-4 text-sky-50/90 text-lg">
            IT System PT. Unggul Dinamika Utama untuk layanan support karyawan site.
          </p>

          {/* <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="mt-0.5 w-10 h-10 shrink-0 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-sky-50/80">{desc}</p>
                </div>
              </li>
            ))}
          </ul> */}
        </div>

        <p className="relative text-sm text-sky-50/70">PT. Unggul Dinamika Utama</p>
      </aside>

      <main className="relative flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="pointer-events-none absolute -top-32 -right-24 w-[380px] h-[380px] rounded-full bg-sky-200/40 blur-3xl lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex w-20 h-20 rounded-2xl shadow-lg items-center justify-center p-3">
              <img src="/img/nexora-rev1.png" alt="Nexora" className="w-full h-full object-contain" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-800">Nexora IT System</h1>
            <p className="text-sm text-slate-500">PT. Unggul Dinamika Utama</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-sky-100/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-800">Selamat datang</h2>
            <p className="text-slate-500 mt-1 mb-8">Masuk dengan NIK dan password Anda.</p>

            {notice && !error && (
              <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                {notice}
              </div>
            )}
            {error && (
              <div role="alert" className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  NIK
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login"
                    type="text"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="Masukkan NIK"
                    autoComplete="username"
                    autoFocus
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className={inputClass + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold text-base rounded-xl shadow-lg shadow-sky-600/25 hover:shadow-xl hover:shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Lupa password? Hubungi IT untuk reset password.
            </p>
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            IT System © {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}