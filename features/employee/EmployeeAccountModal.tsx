// components/employees/EmployeeAccountModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useDialog } from '@/components/ui/DiaologProvider';
import { AlertTriangle, CheckCircle2, Copy, Download, KeyRound, Loader2, X } from 'lucide-react';
import { employeeApi, type AccountResult } from '@/lib/employee-api';

type Phase = 'loading' | 'confirm' | 'running' | 'done' | 'error';

const BATCH = 100;

interface Props {
  mode: 'create' | 'reset';
  ids?: string[];
  departemen?: string;   
  onClose: () => void;
  onDone: () => void; 
}

const STATUS_STYLE: Record<AccountResult['status'], string> = {
  created: 'bg-green-50 text-green-700 border-green-200',
  reset: 'bg-sky-50 text-sky-700 border-sky-200',
  skipped: 'bg-slate-50 text-slate-600 border-slate-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABEL: Record<AccountResult['status'], string> = {
  created: 'Dibuat',
  reset: 'Direset',
  skipped: 'Dilewati',
  failed: 'Gagal',
};

function Tile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 text-center">
      <p className={`text-2xl font-bold ${tone}`}>{value.toLocaleString('id-ID')}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function EmployeeAccountModal({ mode, ids, departemen, onClose, onDone }: Props) {
  const dialog = useDialog();
  const [phase, setPhase] = useState<Phase>('loading');
  const [targetIds, setTargetIds] = useState<string[]>(ids ?? []);
  const [results, setResults] = useState<AccountResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [changed, setChanged] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (mode === 'create' && !ids) {
        try {
          const r = await employeeApi.pendingAccounts(departemen ?? '');
          if (cancelled) return;
          setTargetIds(r.ids ?? []);
          setPhase('confirm');
        } catch (err) {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : 'Gagal memuat daftar karyawan');
          setPhase('error');
        }
      } else {
        setPhase('confirm');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    if (phase === 'running') return;
    if (changed) onDone();
    onClose();
  };

  const run = async () => {
    setPhase('running');
    setError('');
    setProgress(0);
    const acc: AccountResult[] = [];
    setResults([]);
    try {
      if (mode === 'reset') {
        const r = await employeeApi.resetPassword(targetIds[0]);
        acc.push(r.result);
        setChanged(true);
      } else {
        for (let i = 0; i < targetIds.length; i += BATCH) {
          const r = await employeeApi.createAccounts(targetIds.slice(i, i + BATCH));
          acc.push(...r.results);
          setResults([...acc]);
          if (r.created > 0) setChanged(true);
          setProgress(Math.min(i + BATCH, targetIds.length));
        }
      }
      setResults([...acc]);
      setPhase('done');

      const ok = acc.filter(r => r.status === 'created' || r.status === 'reset').length;
      const bad = acc.filter(r => r.status === 'failed').length;
      if (ok > 0 && bad === 0) {
        dialog.success(
          mode === 'reset'
            ? `Password ${acc[0].nama} berhasil direset. Salin password baru sekarang, karena tidak akan ditampilkan lagi.`
            : `${ok.toLocaleString('id-ID')} akun berhasil dibuat. Unduh daftar password sebelum menutup jendela.`,
          mode === 'reset' ? 'Password Direset' : 'Akun Dibuat',
        );
      } else if (bad > 0) {
        dialog.error(
          `${bad.toLocaleString('id-ID')} akun gagal diproses${ok > 0 ? `, ${ok.toLocaleString('id-ID')} berhasil` : ''}. Lihat kolom Status di tabel.`,
          'Sebagian Gagal',
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses akun karyawan';
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setResults([...acc]);
      setPhase(acc.length > 0 ? 'done' : 'error');
      dialog.error(msg, mode === 'reset' ? 'Reset Password Gagal' : 'Pembuatan Akun Gagal');
    }
  };

  const withPassword = results.filter(r => r.password);
  const created = results.filter(r => r.status === 'created' || r.status === 'reset').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const failed = results.filter(r => r.status === 'failed').length;

  const downloadCsv = () => {
    const header = ['NIK', 'Nama', 'Departemen', 'Username', 'Password', 'Status', 'Keterangan'];
    const rows = results.map(r => [
      r.nik,
      r.nama,
      r.departemen,
      r.username,
      r.password ?? '',
      STATUS_LABEL[r.status],
      r.message ?? '',
    ]);
    const csv = [header, ...rows]
      .map(line => line.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'reset' ? 'reset-password.csv' : 'akun-karyawan-baru.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPassword = async (pw: string) => {
    try {
      await navigator.clipboard.writeText(pw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const title = mode === 'reset' ? 'Reset Password' : 'Buat Akun dari Data Karyawan';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <KeyRound size={18} className="text-sky-600" /> {title}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={phase === 'running'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {phase === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-10 text-slate-600">
              <Loader2 size={22} className="animate-spin text-sky-600" />
              <span className="text-sm">Menyiapkan daftar karyawan…</span>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          )}

          {phase === 'confirm' && (
            <>
              {mode === 'create' ? (
                targetIds.length === 0 ? (
                  <p className="text-sm text-slate-600 py-4">
                    Semua karyawan aktif{departemen ? ` di departemen ${departemen}` : ''} sudah punya
                    akun.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{targetIds.length.toLocaleString('id-ID')}</span>{' '}
                      karyawan akan dibuatkan akun login
                      {!ids && departemen ? ` (departemen ${departemen})` : ''}.
                    </p>
                    <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                      <li>Username = NIK karyawan, role = user.</li>
                      <li>Password dibuat acak untuk setiap akun.</li>
                      <li>Karyawan wajib mengganti password saat login pertama.</li>
                      <li>Karyawan yang sudah punya akun dilewati.</li>
                    </ul>
                    <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      <span>
                        Password hanya ditampilkan <strong>sekali</strong> setelah proses selesai.
                        Unduh daftarnya dan jangan menutup jendela sebelum itu.
                      </span>
                    </div>
                  </>
                )
              ) : (
                <>
                  <p className="text-sm text-slate-700">
                    Password akun akan diganti dengan password acak baru, karyawan wajib
                    mengganti saat login berikutnya.
                  </p>
                  <p className="text-xs text-slate-400">
                    Mohon untuk mengingat password baru tersebut.
                  </p>
                </>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                {(mode === 'reset' || targetIds.length > 0) && (
                  <button
                    type="button"
                    onClick={run}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                  >
                    {mode === 'reset'
                      ? 'Reset password'
                      : `Buat ${targetIds.length.toLocaleString('id-ID')} akun`}
                  </button>
                )}
              </div>
            </>
          )}

          {phase === 'running' && (
            <div className="space-y-3 py-6">
              <div className="flex items-center justify-center gap-3 text-slate-600">
                <Loader2 size={22} className="animate-spin text-sky-600" />
                <span className="text-sm">
                  {mode === 'reset'
                    ? 'Mereset password…'
                    : `Membuat akun… ${progress.toLocaleString('id-ID')} dari ${targetIds.length.toLocaleString('id-ID')}`}
                </span>
              </div>
              {mode === 'create' && (
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-sky-600 transition-all"
                    style={{
                      width: `${targetIds.length ? (progress / targetIds.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              )}
              <p className="text-center text-xs text-slate-400">
                Jangan menutup jendela ini sampai selesai.
              </p>
            </div>
          )}

          {/* Selesai */}
          {phase === 'done' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Tile
                  label={mode === 'reset' ? 'Direset' : 'Akun dibuat'}
                  value={created}
                  tone="text-green-600"
                />
                <Tile label="Dilewati" value={skipped} tone="text-slate-600" />
                <Tile label="Gagal" value={failed} tone="text-red-600" />
              </div>

              {withPassword.length > 0 && (
                <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Password di bawah ini <strong>tidak akan ditampilkan lagi</strong>. Unduh
                    sekarang, bagikan ke karyawan masing-masing, lalu hapus file-nya.
                  </span>
                </div>
              )}

              <div className="max-h-72 overflow-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">NIK</th>
                      <th className="px-3 py-2 text-left">Nama</th>
                      <th className="px-3 py-2 text-left">Username</th>
                      <th className="px-3 py-2 text-left">Password</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={`${r.employeeID}-${i}`} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-1.5 font-mono text-slate-700">{r.nik}</td>
                        <td className="px-3 py-1.5 text-slate-800">{r.nama}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-700">{r.username}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-900">
                          {r.password ? (
                            <span className="inline-flex items-center gap-2">
                              {r.password}
                              {mode === 'reset' && (
                                <button
                                  type="button"
                                  onClick={() => copyPassword(r.password!)}
                                  className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                                  aria-label="Salin password"
                                >
                                  {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                                </button>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${STATUS_STYLE[r.status]}`}
                          >
                            {STATUS_LABEL[r.status]}
                          </span>
                          {r.message && (
                            <p className="text-xs text-slate-400 mt-0.5">{r.message}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={downloadCsv}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 border border-sky-200 bg-sky-50 hover:bg-sky-100 rounded-xl"
                  >
                    <Download size={14} /> Unduh CSV
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Selesai
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}