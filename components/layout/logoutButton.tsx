'use client';

import { useRouter } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      // Hapus token dari localStorage dan cookie
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      document.cookie = 'auth-token=; path=/; max-age=0';

      router.push('/login');
      router.refresh();
    }
  };

  return (
    <>
    <button
      onClick={() => setShowModal(true)}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <LogOut size={15} />
      Keluar
    </button>

    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
        />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 z-10">
          {/* Close */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Text */}
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Keluar dari sistem?
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Anda akan keluar dari IT Request System. Pastikan semua pekerjaan sudah tersimpan.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Keluar...
                </>
              ) : (
                <>
                  <LogOut size={14} />
                  Ya, Keluar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}