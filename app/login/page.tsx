'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, User } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setError('Login dan password wajib diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(login, password) as any;

      // Simpan token di localStorage dan cookie
      localStorage.setItem('auth-token', res.token);
      localStorage.setItem('auth-user', JSON.stringify(res.user));

      // Set cookie untuk server component
      document.cookie = `auth-token=${res.token}; path=/; max-age=${60 * 60 * 24 * 7}`;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-600 rounded-2xl mb-4 shadow-lg">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">IT Request System</h1>
          <p className="text-slate-400 text-sm mt-1">Resource Group — PT. Unggul Dinamika Utama</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Masuk ke Dashboard</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Login */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="admin@unggul.com"
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Masuk...</>
                : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          IT Request System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}