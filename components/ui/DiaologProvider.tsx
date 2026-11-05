'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

type Kind = 'success' | 'error' | 'confirm';

interface DialogState {
  kind: Kind;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface DialogApi {
  success: (message: string, title?: string) => Promise<void>;
  error: (message: string, title?: string) => Promise<void>;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog harus dipakai di dalam <DialogProvider>');
  return ctx;
}

const STYLE = {
  success: { ring: 'bg-green-100 text-green-600', btn: 'bg-green-600 hover:bg-green-700', icon: CheckCircle2, anim: 'dlg-pop' },
  error:   { ring: 'bg-red-100 text-red-600',     btn: 'bg-red-600 hover:bg-red-700',     icon: XCircle,      anim: 'dlg-shake' },
  warn:    { ring: 'bg-amber-100 text-amber-600', btn: 'bg-sky-600 hover:bg-sky-700',     icon: AlertTriangle, anim: 'dlg-pop' },
  danger:  { ring: 'bg-red-100 text-red-600',     btn: 'bg-red-600 hover:bg-red-700',     icon: AlertTriangle, anim: 'dlg-pop' },
} as const;

export default function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dlg, setDlg] = useState<DialogState | null>(null);
  const current = useRef<DialogState | null>(null);

  const close = useCallback((ok: boolean) => {
    const d = current.current;
    current.current = null;
    setDlg(null);
    d?.resolve(ok);
  }, []);

  const open = useCallback((state: Omit<DialogState, 'resolve'>) => {
    current.current?.resolve(false);
    return new Promise<boolean>(resolve => {
      const next: DialogState = { ...state, resolve };
      current.current = next;
      setDlg(next);
    });
  }, []);

  const api = useMemo<DialogApi>(
    () => ({
        success: (message, title = 'Berhasil') =>
        open({ kind: 'success', title, message }).then(() => undefined),
        error: (message, title = 'Terjadi Kesalahan') =>
        open({ kind: 'error', title, message }).then(() => undefined),
        confirm: opts => open({ kind: 'confirm', ...opts }),
    }),
    [open]
  )

  // Esc menutup; sukses menutup otomatis setelah 2,5 detik
  useEffect(() => {
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false);
    window.addEventListener('keydown', onKey);
    const timer = dlg.kind === 'success' ? setTimeout(() => close(true), 2500) : undefined;
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timer) clearTimeout(timer);
    };
  }, [dlg, close]);

  const s = dlg
    ? dlg.kind === 'confirm'
      ? dlg.danger ? STYLE.danger : STYLE.warn
      : STYLE[dlg.kind]
    : null;
  const Icon = s?.icon;

  return (
    <DialogContext.Provider value={api}>
      {children}

      {dlg && s && Icon && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm dlg-fade"
          onMouseDown={e => e.target === e.currentTarget && close(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dlg-title"
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center dlg-pop"
          >
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${s.ring} ${s.anim}`}>
              <Icon size={34} />
            </div>

            <h3 id="dlg-title" className="mt-4 text-lg font-bold text-slate-800">{dlg.title}</h3>
            {dlg.message && <p className="mt-1.5 text-sm text-slate-500 whitespace-pre-line">{dlg.message}</p>}

            <div className="mt-6 flex gap-3">
              {dlg.kind === 'confirm' && (
                <button
                  type="button"
                  autoFocus={dlg.danger}
                  onClick={() => close(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {dlg.cancelText ?? 'Batal'}
                </button>
              )}
              <button
                type="button"
                autoFocus={!dlg.danger}
                onClick={() => close(true)}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors ${s.btn}`}
              >
                {dlg.kind === 'confirm' ? (dlg.confirmText ?? 'Ya, lanjutkan') : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dlg-fade  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dlg-pop   { 0% { opacity: 0; transform: scale(.85) } 60% { transform: scale(1.04) } 100% { opacity: 1; transform: scale(1) } }
        @keyframes dlg-shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-6px) } 40%,80% { transform: translateX(6px) } }
        .dlg-fade  { animation: dlg-fade .15s ease-out }
        .dlg-pop   { animation: dlg-pop .25s ease-out }
        .dlg-shake { animation: dlg-shake .4s ease-out }
      `}</style>
    </DialogContext.Provider>
  );
}