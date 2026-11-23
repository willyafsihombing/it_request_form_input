'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { approvalApi } from '@/lib/approval-api';
import { employeeApi, type EmployeeOption } from '@/lib/employee-api';
import { useDialog } from '@/components/ui/DiaologProvider';
import EmployeePicker from '@/features/approval/EmployeePicker';
import type { ApprovalRoute, Readiness, StepCode } from '@/types/approval';
    
type StepDef = { code: StepCode; label: string; hint: string; perDept: boolean; optional?: boolean };

const STEPS: StepDef[] = [
  { code: 'it_check',     label: '1. Pemeriksa Staff IT', hint: 'Berlaku untuk semua departemen.',                          perDept: false },
  { code: 'it_manager',   label: '2. Manager IT',         hint: 'Berlaku untuk semua departemen.',                          perDept: false },
  { code: 'supt_dept',    label: '3. Supt. Dept',         hint: 'Per departemen.',                                          perDept: true  },
  { code: 'dept_manager', label: '4. Manager Dept',       hint: 'Per departemen.',                                          perDept: true  },
  { code: 'sr_manager',   label: '5. Senior Manager',     hint: 'Per departemen. Kosongkan bila departemen tidak punya; langkah dilewati.', perDept: true, optional: true },
  { code: 'hoo',          label: '6. Head of Operation',  hint: 'Berlaku untuk semua departemen. Persetujuan terakhir.',    perDept: false },
];

function StepCard({
  step, routes, dept, onChanged,
}: { step: StepDef; routes: ApprovalRoute[]; dept: string; onChanged: () => void }) {
  const dialog = useDialog();
  const [picked, setPicked] = useState<EmployeeOption | null>(null);
  const [busy, setBusy] = useState(false);

  const list = routes.filter(r =>
    r.code === step.code && (step.perDept ? r.departemen === dept : !r.departemen),
  );
  const blocked = step.perDept && !dept;

  const add = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      await approvalApi.createRoute({
        code: step.code,
        departemen: step.perDept ? dept : '',
        approverEmployeeId: picked.id,
      });
      setPicked(null);
      onChanged();
    } catch (e) {
      dialog.error(e instanceof Error ? e.message : 'Gagal menambah penunjukan.', 'Gagal');
    } finally {
      setBusy(false);
    }
  };

  const del = async (r: ApprovalRoute) => {
    const ok = await dialog.confirm({
      title: 'Hapus penunjukan?',
      message: `${r.approverNama ?? 'Approver'} dihapus dari langkah ${step.label}. Request yang sudah berjalan tidak terpengaruh.`,
      confirmText: 'Hapus', cancelText: 'Batal', danger: true,
    });
    if (!ok) return;
    try {
      await approvalApi.deleteRoute(r.id);
      onChanged();
    } catch (e) {
      dialog.error(e instanceof Error ? e.message : 'Gagal menghapus.', 'Gagal');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 rounded-t-xl">
        <p className="text-sm font-semibold text-slate-800">
          {step.label}
          {step.optional && <span className="ml-2 text-xs font-normal text-slate-400">opsional</span>}
        </p>
        <p className="text-xs text-slate-500">{step.hint}</p>
      </div>

      {blocked ? (
        <p className="px-4 py-3 text-xs text-amber-700 bg-amber-50">Pilih departemen di atas dulu.</p>
      ) : (
        <>
          {list.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-400">
              {step.optional ? 'Belum ada — langkah ini akan dilewati.' : 'Belum ada penunjukan.'}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.map(r => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0 text-sm">
                    <p className="font-medium text-slate-800 truncate">{r.approverNama}</p>
                    <p className="text-xs text-slate-500 truncate">{r.approverJabatan}</p>
                    {!r.approverActive && (
                      <p className="mt-0.5 text-xs text-red-600">Tidak bisa dipakai: karyawan nonaktif atau belum punya akun login.</p>
                    )}
                  </div>
                  <button onClick={() => del(r)} className="p-1.5 text-slate-400 hover:text-red-600" aria-label="Hapus">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <div className="flex-1"><EmployeePicker value={picked} onChange={setPicked} /></div>
            <button onClick={add} disabled={!picked || busy}
              className="px-4 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-40 flex items-center justify-center gap-1.5">
              {busy && <Loader2 size={14} className="animate-spin" />} Tambah
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ApprovalRoutesPage() {
  const dialog = useDialog();
  const [routes, setRoutes] = useState<ApprovalRoute[]>([]);
  const [depts, setDepts] = useState<string[]>([]);
  const [dept, setDept] = useState('');
  const [ready, setReady] = useState<Readiness | null>(null);
  const [checking, setChecking] = useState(false);

  const loadRoutes = useCallback(async () => {
    const r = await approvalApi.routes();
    setRoutes(r.routes ?? []);
  }, []);

  const check = useCallback(async (d: string) => {
    if (!d) { setReady(null); return; }
    setChecking(true);
    try { setReady(await approvalApi.readiness(d)); }
    catch { setReady(null); }
    finally { setChecking(false); }
  }, []);

  useEffect(() => {
    loadRoutes().catch(e => dialog.error(e instanceof Error ? e.message : 'Gagal memuat rute.', 'Gagal'));
    employeeApi.stats()
      .then(s => setDepts((s.departments ?? []).filter(Boolean).sort()))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { check(dept); }, [dept, check]);

  const changed = async () => {
    await loadRoutes().catch(() => {});
    await check(dept);
  };

  return (
    <div className="flex-1 w-full mx-auto p-6 max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Pengaturan Alur Persetujuan</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tunjuk siapa yang menyetujui tiap langkah. Perubahan hanya berlaku untuk pengajuan berikutnya;
          request yang sedang berjalan memakai rantai yang sudah terbentuk.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Departemen (untuk langkah Supt., Manager, Senior Manager)
        </label>
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30">
          <option value="">— Pilih departemen —</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {dept && (
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm border ${
            checking ? 'bg-slate-50 border-slate-200 text-slate-500'
              : ready?.ready ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'}`}>
            {checking ? <Loader2 size={16} className="animate-spin mt-0.5" />
              : ready?.ready ? <CheckCircle2 size={16} className="mt-0.5" />
              : <AlertTriangle size={16} className="mt-0.5" />}
            <div className="min-w-0">
              {checking && 'Memeriksa kelengkapan…'}
              {!checking && ready?.ready && <>Alur untuk <b>{dept}</b> sudah lengkap.</>}
              {!checking && ready && !ready.ready && (
                <>
                  <p className="font-semibold">Alur untuk {dept} belum lengkap:</p>
                  <ul className="list-disc pl-5 mt-1 text-xs">
                    {ready.problems.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {STEPS.map(s => (
        <StepCard key={s.code} step={s} routes={routes} dept={dept} onChanged={changed} />
      ))}

      <p className="text-xs text-slate-400">
        Catatan: pemohon tidak bisa menyetujui requestnya sendiri; bila ia ditunjuk di sebuah langkah, namanya
        dikeluarkan atau langkah itu dilewati. Approver harus berstatus aktif dan sudah punya akun login.
      </p>
    </div>
  );
}