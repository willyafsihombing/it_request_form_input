'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestApi } from '@/lib/api'; 



const INIT = {
  formNumber: '',
  effectiveDate: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
  reqCompany: 'PT. UNGGUL DINAMIKA UTAMA',
  reqName: '',
  recCompany: 'PT. UNGGUL DINAMIKA UTAMA',
  recDept: '', recLocation: 'SITE INDEXIM - KALIORANG', recPersonnel: '', recEmpId: '', recTitle: '', recStatus: 'KARYAWAN',
  snAdd: false, snChange: false, snTerminate: false,
  snLAN: false, snVPN: false, snEmail: false, snFileSharing: false, snIntranet: false, snOther: '',
  hwAdd: false, hwChange: false, hwTerminate: false,
  hwPC: false, hwPrinter: false, hwNotebook: false, hwMSOffice: false, hwAdobe: false, hwZoom: false, hwOther: '',
  erpAdd: false, erpChange: false, erpTerminate: false,
  erpPronto: false, erpSmartMining: false,
  erpPositionId: '', erpDistrict: '', erpRef: '', erpSignOnId: '', erpGlobalProfile: '',
  additionalDesc: '', costCode: '', justification: '', techComment: '',
  techAD: false, techAW: false, techCR: false, techEM: false, techIP: false, techEP: false,
  sigRequester: '', sigSptDept: '', sigDeptMgr: '', sigSrMgr: '', sigHOO: '', sigITAdmin: 'HENDRIK ADELMEI', sigMSDIMgr: 'ADE WAHYUDIN',
  priority: 'normal',
};


function Sec({ icon, title, color = 'text-slate-700', bg = 'bg-slate-100' }: { icon: string; title: string; color?: string; bg?: string }) {
  return (
    <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm mb-4 mt-6', bg, color)}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );
}

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-3">
      <label className="sm:w-52 text-sm text-slate-600 font-medium flex-shrink-0">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function CB({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700 mr-4 mb-1">
      <input type="checkbox" checked={checked} onChange={onChange}
        className="w-4 h-4 accent-sky-600 cursor-pointer" />
      {label}
    </label>
  );
}

type FormData = typeof INIT;

export default function ITRequestForm() {
  const router = useRouter();
  const [data, setData] = useState<FormData>(INIT);
  const [loadingNumber, setLoadingNumber] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoadingNumber(false);

    const useStr = localStorage.getItem('auth-user');

    if(useStr) {
      try{
        const user = JSON.parse(useStr);
        setData(p => ({
          ...p,
          recDept : user.department || p.recDept,
          recEmpId: user.employeeID || p.recEmpId,
          recPersonnel: user.personnelName || p.recPersonnel,
          reqName: user.fullName || p.reqName,
          sigRequester: user.fullName || p.reqName
        }))
      }catch {
        // 
      }
      console.log(useStr)
    }

  }, []);

  const u = (k: keyof FormData, v: unknown) => setData(p => ({ ...p, [k]: v }));
  const tog = (k: keyof FormData) => setData(p => ({ ...p, [k]: !p[k as keyof typeof p] }));

 const handleSubmit = async () => {
  if (!data.reqName.trim()) { setError('Nama requester wajib diisi'); return; }
  setError('');
  setSubmitting(true);
  try {
    // Destructure formNumber agar tidak terkirim
    const { formNumber, ...submitData } = data;
    const created = await requestApi.create(submitData) as any;
    router.push(`/form/success?id=${created.id}&form=${created.formNumber}`);
  } catch (err: any) {
    setError(err.message || 'Gagal menghubungi server');
  } finally {
    setSubmitting(false);
  }
};

  if (loadingNumber) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm font-medium">Menyiapkan form...</span>
      </div>
    );
  }

  const inp = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg ' +
    'focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 ' +
    'bg-yellow-50 font-medium transition-all';
  const ta = `${inp} resize-vertical w-full min-h-[120px]`;
  const grid2 = 'grid grid-cols-1 sm:grid-cols-2 gap-x-6';

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          ⚠️ {error}
        </div>
      )}
      <div className="text-center items-center justify-center text-black bg-slate-50 text-xl font-medium text-slate">Information Technology Request Form</div>
      <Sec icon="📋" title="Informasi Form" bg="bg-slate-100" />
      <div className={grid2}>
        <Row label="Effective Date">
          <input value={data.effectiveDate} disabled className={inp + ' cursor-not-allowed opacity-60'} />
        </Row>
        <Row label="Prioritas">
          <select value={data.priority} onChange={e => u('priority', e.target.value)}
            className={inp.replace('bg-yellow-50', 'bg-white')}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </Row>
      </div>

      {/* Requester */}
      <Sec icon="👤" title="Requester Information" bg="bg-sky-50" color="text-sky-800" />
      <Row label="Company" required>
        <input value={data.reqCompany} disabled className={inp + ' cursor-not-allowed opacity-60'} />
      </Row>
      <Row label="Personnel Name" required>
        <input value={data.reqName} onChange={e => u('reqName', e.target.value)} disabled className={inp} />
      </Row>

      {/* Recipient */}
      <Sec icon="📦" title="Recipient Information" bg="bg-sky-50" color="text-sky-800" />
      <div className={grid2}>
        <Row label="Company"><input value={data.recCompany} disabled className={inp + ' cursor-not-allowed opacity-60'} /></Row>
        <Row label="Department"><input value={data.recDept} disabled onChange={e => u('recDept', e.target.value)} className={inp} /></Row>
        <Row label="Location"><input value={data.recLocation} disabled className={inp + ' cursor-not-allowed opacity-60'} /></Row>
        <Row label="Personnel Name"><input value={data.recPersonnel} onChange={e => u('recPersonnel', e.target.value.toUpperCase())} className={inp} /></Row>
        <Row label="Employee ID/NIK"><input value={data.recEmpId} onChange={e => u('recEmpId', e.target.value)} className={inp} /></Row>
        <Row label="Title"><input value={data.recTitle} onChange={e => u('recTitle', e.target.value.toUpperCase())} className={inp} /></Row>
        <Row label="Status"><input value={data.recStatus} disabled className={inp + ' cursor-not-allowed opacity-60'} /></Row>
      </div>

      {/* System & Network */}
      <Sec icon="🌐" title="System & Network" bg="bg-green-50" color="text-green-800" />
      <Row label="Action">
        <CB label="Add" checked={data.snAdd} onChange={() => tog('snAdd')} />
        <CB label="Change" checked={data.snChange} onChange={() => tog('snChange')} />
        <CB label="Terminate" checked={data.snTerminate} onChange={() => tog('snTerminate')} />
      </Row>
      <Row label="Services">
        <CB label="LAN" checked={data.snLAN} onChange={() => tog('snLAN')} />
        <CB label="VPN" checked={data.snVPN} onChange={() => tog('snVPN')} />
        <CB label="Email" checked={data.snEmail} onChange={() => tog('snEmail')} />
        <CB label="File Sharing" checked={data.snFileSharing} onChange={() => tog('snFileSharing')} />
        <CB label="Intranet" checked={data.snIntranet} onChange={() => tog('snIntranet')} />
      </Row>
      <Row label="Other"><input value={data.snOther} onChange={e => u('snOther', e.target.value)} className={inp} /></Row>

      {/* Hardware & Software */}
      <Sec icon="💻" title="Hardware & Software" bg="bg-amber-50" color="text-amber-800" />
      <Row label="Action">
        <CB label="Add" checked={data.hwAdd} onChange={() => tog('hwAdd')} />
        <CB label="Change" checked={data.hwChange} onChange={() => tog('hwChange')} />
        <CB label="Terminate" checked={data.hwTerminate} onChange={() => tog('hwTerminate')} />
      </Row>
      <Row label="Hardware / Software">
        <CB label="PC/Desktop" checked={data.hwPC} onChange={() => tog('hwPC')} />
        <CB label="Printer" checked={data.hwPrinter} onChange={() => tog('hwPrinter')} />
        <CB label="Notebook" checked={data.hwNotebook} onChange={() => tog('hwNotebook')} />
        <CB label="MS Office Suite" checked={data.hwMSOffice} onChange={() => tog('hwMSOffice')} />
        <CB label="Adobe" checked={data.hwAdobe} onChange={() => tog('hwAdobe')} />
        <CB label="Zoom" checked={data.hwZoom} onChange={() => tog('hwZoom')} />
      </Row>
      <Row label="Other"><input value={data.hwOther} onChange={e => u('hwOther', e.target.value)} className={inp} /></Row>

      {/* ERP */}
      <Sec icon="🏭" title="ERP" bg="bg-purple-50" color="text-purple-800" />
      <Row label="Action">
        <CB label="Add" checked={data.erpAdd} onChange={() => tog('erpAdd')} />
        <CB label="Change" checked={data.erpChange} onChange={() => tog('erpChange')} />
        <CB label="Terminate" checked={data.erpTerminate} onChange={() => tog('erpTerminate')} />
      </Row>
      <Row label="System">
        <CB label="PRONTO" checked={data.erpPronto} onChange={() => tog('erpPronto')} />
        <CB label="SMART MINING" checked={data.erpSmartMining} onChange={() => tog('erpSmartMining')} />
      </Row>
      <div className={grid2}>
        <Row label="Position ID"><input value={data.erpPositionId} onChange={e => u('erpPositionId', e.target.value)} className={inp} /></Row>
        <Row label="*Sign-on ID"><input value={data.erpSignOnId} onChange={e => u('erpSignOnId', e.target.value)} className={inp} /></Row>
        <Row label="District"><input value={data.erpDistrict} onChange={e => u('erpDistrict', e.target.value)} className={inp} /></Row>
        <Row label="*Global Profile"><input value={data.erpGlobalProfile} onChange={e => u('erpGlobalProfile', e.target.value)} className={inp} /></Row>
      </div>
      <Row label="Ref. existing Sign On ID/Name">
        <input value={data.erpRef} onChange={e => u('erpRef', e.target.value)} className={inp} />
      </Row>

      {/* Additional Description */}
      <Sec icon="📝" title="Additional Description" bg="bg-slate-100" />
      <textarea value={data.additionalDesc} onChange={e => u('additionalDesc', e.target.value)}
        rows={6} className={ta}
        placeholder="Describe the Software / Hardware / Service / Privilege requested..." />
      <div className="mt-3">
        <Row label="Cost Code / COA">
          <input value={data.costCode} onChange={e => u('costCode', e.target.value)} className={inp} />
        </Row>
      </div>

      {/* Justification */}
      <Sec icon="✅" title="Justification" bg="bg-green-50" color="text-green-800" />
      <textarea value={data.justification} onChange={e => u('justification', e.target.value)}
        rows={3} className={ta}
        placeholder="Describe the business reason for your request..." />

      {/* Signatures */}
      <Sec icon="✍️" title="Signatures" bg="bg-slate-100" />
      <div className={grid2}>
        <Row label="Requester / Date"><input value={data.sigRequester} onChange={e => u('sigRequester', e.target.value)} disabled className={inp + ' cursor-not-allowed opacity-60' } /></Row>
        <Row label="Sr. Mgr / Date"><input value={data.sigSrMgr} onChange={e => u('sigSrMgr', e.target.value.toUpperCase())} className={inp} /></Row>
        <Row label="Spt. Dept. / Date"><input value={data.sigSptDept} onChange={e => u('sigSptDept', e.target.value.toUpperCase())} className={inp} /></Row>
        <Row label="HOO / Date"><input value={data.sigHOO} onChange={e => u('sigHOO', e.target.value.toUpperCase())} className={inp} /></Row>
        <Row label="Dept. Mgr / Date"><input value={data.sigDeptMgr} onChange={e => u('sigDeptMgr', e.target.value.toUpperCase())} className={inp} /></Row>
        <Row label="IT Admin / Date"><input value={data.sigITAdmin} disabled className={inp + ' cursor-not-allowed opacity-60'} /></Row>
        <Row label="MSDI Mgr / Date"><input value={data.sigMSDIMgr} disabled className={inp + ' cursor-not-allowed opacity-60'} /></Row>
      </div>

      {/* Submit */}
      <div className="mt-8 pb-8">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full sm:w-auto px-10 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          {submitting
            ? <><Loader2 size={16} className="animate-spin" /> Mengirim Request...</>
            : '📤 Kirim IT Request'}
        </button>
      </div>
    </div>
  );
}

