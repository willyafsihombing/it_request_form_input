// components/employees/EmployeeImportModal.tsx
'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import { employeeApi, type ImportReport } from '@/lib/employee-api';

type Phase = 'pick' | 'checking' | 'review' | 'importing' | 'done';

interface Props {
  onClose: () => void;
  onImported: () => void; // dipanggil setelah impor berhasil (untuk memuat ulang daftar)
}

function Tile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 text-center">
      <p className={`text-2xl font-bold ${tone}`}>{value.toLocaleString('id-ID')}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function EmployeeImportModal({ onClose, onImported }: Props) {
  const [phase, setPhase] = useState<Phase>('pick');
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = phase === 'checking' || phase === 'importing';

  const close = () => {
    if (busy) return;
    if (phase === 'done') onImported();
    else onClose();
  };

  const reset = () => {
    setFile(null);
    setReport(null);
    setError('');
    setPhase('pick');
    if (inputRef.current) inputRef.current.value = '';
  };

  // Langkah 1: periksa file (belum menyimpan apa pun)
  const check = async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.xlsx')) {
      setError('Format file harus .xlsx (Excel)');
      return;
    }
    setFile(f);
    setError('');
    setReport(null);
    setPhase('checking');
    try {
      setReport(await employeeApi.importExcel(f, true));
      setPhase('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memeriksa file');
      setPhase('pick');
    }
  };

  // Langkah 2: simpan ke database
  const runImport = async () => {
    if (!file) return;
    setError('');
    setPhase('importing');
    try {
      const r = await employeeApi.importExcel(file, false);
      setReport(r);
      setPhase(r.errorCount > 0 ? 'review' : 'done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengimpor data');
      setPhase('review');
    }
  };

  const downloadTemplate = async () => {
    try {
      await employeeApi.downloadTemplate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh template');
    }
  };

  const hiddenErrors = report ? report.errorCount - report.errors.length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Import Karyawan dari Excel</h2>
          <button
            type="button"
            onClick={close}
            disabled={busy}
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

          {/* Pilih file */}
          {phase === 'pick' && (
            <>
              <label
                onDragOver={e => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) check(f);
                }}
                className={`flex flex-col items-center justify-center gap-2 px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  dragging
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50'
                }`}
              >
                <Upload size={26} className="text-sky-600" />
                <p className="text-sm font-semibold text-slate-700">
                  Pilih file Excel atau tarik ke sini
                </p>
                <p className="text-xs text-slate-400">Format .xlsx, maksimal 5.000 baris data</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) check(f);
                  }}
                />
              </label>

              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-500">
                  Kolom: NIK, Nama, Jabatan, Departemen, Level, Staff / Non Staff.
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 font-semibold text-sky-600 hover:text-sky-700"
                >
                  <Download size={14} /> Unduh template
                </button>
              </div>
            </>
          )}

          {/* Sedang memeriksa / menyimpan */}
          {busy && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-600">
              <Loader2 size={28} className="animate-spin text-sky-600" />
              <p className="text-sm">
                {phase === 'checking'
                  ? 'Memeriksa file…'
                  : 'Menyimpan data karyawan… ini bisa memakan waktu beberapa detik'}
              </p>
            </div>
          )}

          {/* Hasil pemeriksaan */}
          {phase === 'review' && report && (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileSpreadsheet size={16} className="text-sky-600" />
                <span className="font-medium text-slate-800">{file?.name}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Tile label="Total baris" value={report.total} tone="text-slate-800" />
                <Tile label="Karyawan baru" value={report.toCreate} tone="text-green-600" />
                <Tile label="Akan diperbarui" value={report.toUpdate} tone="text-sky-600" />
                <Tile label="Bermasalah" value={report.errorCount} tone="text-red-600" />
              </div>

              {report.errorCount > 0 ? (
                <div>
                  <p className="text-sm text-red-700 mb-2">
                    Perbaiki baris berikut di file Excel, lalu pilih file lagi. Tidak ada data yang
                    disimpan selama masih ada baris bermasalah.
                  </p>
                  <div className="max-h-56 overflow-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left w-20">Baris</th>
                          <th className="px-3 py-2 text-left">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.errors.map((e, i) => (
                          <tr key={`${e.row}-${i}`} className="border-t border-slate-100">
                            <td className="px-3 py-1.5 font-mono text-slate-700">{e.row}</td>
                            <td className="px-3 py-1.5 text-slate-700">{e.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hiddenErrors > 0 && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      …dan {hiddenErrors.toLocaleString('id-ID')} masalah lainnya.
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                  File valid. {report.toCreate.toLocaleString('id-ID')} karyawan akan ditambahkan
                  {report.toUpdate > 0 &&
                    ` dan ${report.toUpdate.toLocaleString('id-ID')} karyawan yang NIK-nya sudah ada akan diperbarui`}
                  .
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Pilih file lain
                </button>
                <button
                  type="button"
                  onClick={runImport}
                  disabled={report.errorCount > 0 || report.valid === 0}
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-sm"
                >
                  Import {report.valid.toLocaleString('id-ID')} karyawan
                </button>
              </div>
            </>
          )}

          {/* Selesai */}
          {phase === 'done' && report && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 size={40} className="text-green-500" />
              <p className="text-base font-semibold text-slate-800">Import selesai</p>
              <p className="text-sm text-slate-600">
                {report.created.toLocaleString('id-ID')} karyawan ditambahkan,{' '}
                {report.updated.toLocaleString('id-ID')} karyawan diperbarui.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-2 px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}