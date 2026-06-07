import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, ExternalLink } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import AdminPanel from '@/components/dashboard/AdminPanel';
import type { ITRequest, RequestStatus, RequestPriority } from '@/types';

export const dynamic = 'force-dynamic';

// ── Helper: checkbox row for form display ──
function CBRow({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 mr-4 mb-1 text-sm">
      <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border rounded text-xs font-bold
        ${on ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 text-transparent'}`}>
        {on ? '✓' : '·'}
      </span>
      <span className={on ? 'text-slate-800 font-medium' : 'text-slate-400'}>{label}</span>
    </span>
  );
}

function SectionCard({ title, children, accent = 'sky' }: { title: string; children: React.ReactNode; accent?: string }) {
  const colors: Record<string, string> = {
    sky:    'bg-sky-50 text-sky-800 border-sky-200',
    green:  'bg-green-50 text-green-800 border-green-200',
    amber:  'bg-amber-50 text-amber-800 border-amber-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    slate:  'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className={`px-4 py-2.5 text-sm font-semibold border-b ${colors[accent] ?? colors.slate}`}>
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium bg-yellow-50 border border-yellow-100 rounded px-2.5 py-1.5 min-h-[32px]">
        {value || <span className="text-slate-300 italic font-normal">—</span>}
      </p>
    </div>
  );
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = await prisma.request.findUnique({ where: { id } });
  if (!req) notFound();

  const r = req as unknown as ITRequest;

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/requests"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">Detail Request</h1>
              <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                {r.formNumber}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Dibuat {formatDateTime(r.createdAt)} · Diperbarui {formatDateTime(r.updatedAt)}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/requests/${r.id}/print`} target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          <Printer size={14} /> Cetak Form
          <ExternalLink size={12} className="opacity-70" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT COLUMN: Form Data ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Requester + Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionCard title="👤 Requester Information" accent="sky">
              <Field label="Company"        value={r.reqCompany} />
              <Field label="Personnel Name" value={r.reqName} />
              <Field label="Effective Date" value={r.effectiveDate} />
            </SectionCard>
            <SectionCard title="📦 Recipient Information" accent="sky">
              <Field label="Company"        value={r.recCompany} />
              <Field label="Department"     value={r.recDept} />
              <Field label="Location"       value={r.recLocation} />
              <Field label="Personnel Name" value={r.recPersonnel} />
              <Field label="Employee ID/NIK" value={r.recEmpId} />
              <Field label="Title"          value={r.recTitle} />
              <Field label="Status"         value={r.recStatus} />
            </SectionCard>
          </div>

          {/* System & Network */}
          <SectionCard title="🌐 System & Network" accent="green">
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Action</p>
              <CBRow on={r.snAdd}       label="Add" />
              <CBRow on={r.snChange}    label="Change" />
              <CBRow on={r.snTerminate} label="Terminate" />
            </div>
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Services</p>
              <CBRow on={r.snLAN}         label="LAN" />
              <CBRow on={r.snVPN}         label="VPN" />
              <CBRow on={r.snEmail}       label="Email" />
              <CBRow on={r.snFileSharing} label="File Sharing" />
              <CBRow on={r.snIntranet}    label="Intranet" />
            </div>
            {r.snOther && <Field label="Other" value={r.snOther} />}
          </SectionCard>

          {/* Hardware & Software */}
          <SectionCard title="💻 Hardware & Software" accent="amber">
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Action</p>
              <CBRow on={r.hwAdd}       label="Add" />
              <CBRow on={r.hwChange}    label="Change" />
              <CBRow on={r.hwTerminate} label="Terminate" />
            </div>
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Items</p>
              <CBRow on={r.hwPC}        label="PC/Desktop" />
              <CBRow on={r.hwPrinter}   label="Printer" />
              <CBRow on={r.hwNotebook}  label="Notebook" />
              <CBRow on={r.hwMSOffice}  label="MS Office Suite" />
              <CBRow on={r.hwAdobe}     label="Adobe" />
              <CBRow on={r.hwZoom}      label="Zoom" />
            </div>
            {r.hwOther && <Field label="Other" value={r.hwOther} />}
          </SectionCard>

          {/* ERP */}
          <SectionCard title="🏭 ERP" accent="purple">
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Action</p>
              <CBRow on={r.erpAdd}       label="Add" />
              <CBRow on={r.erpChange}    label="Change" />
              <CBRow on={r.erpTerminate} label="Terminate" />
            </div>
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">System</p>
              <CBRow on={r.erpPronto}      label="PRONTO" />
              <CBRow on={r.erpSmartMining} label="SMART MINING" />
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <Field label="Position ID"      value={r.erpPositionId} />
              <Field label="*Sign-on ID"      value={r.erpSignOnId} />
              <Field label="District"         value={r.erpDistrict} />
              <Field label="*Global Profile"  value={r.erpGlobalProfile} />
            </div>
            {r.erpRef && <Field label="Ref. existing Sign On ID/Name" value={r.erpRef} />}
          </SectionCard>

          {/* Desc + Justification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionCard title="📝 Additional Description" accent="slate">
              <div className="bg-yellow-50 border border-yellow-100 rounded px-3 py-2.5 text-sm text-slate-800 whitespace-pre-line min-h-[80px]">
                {r.additionalDesc || <span className="text-slate-300 italic">—</span>}
              </div>
              {r.costCode && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cost Code / COA</p>
                  <p className="text-sm text-slate-800 font-medium">{r.costCode}</p>
                </div>
              )}
            </SectionCard>
            <SectionCard title="✅ Justification" accent="green">
              <div className="bg-yellow-50 border border-yellow-100 rounded px-3 py-2.5 text-sm text-slate-800 whitespace-pre-line min-h-[80px]">
                {r.justification || <span className="text-slate-300 italic">—</span>}
              </div>
            </SectionCard>
          </div>

          {/* Signatures */}
          <SectionCard title="✍️ Signatures" accent="slate">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Requester / Date"   value={r.sigRequester} />
              <Field label="Sr. Mgr / Date"     value={r.sigSrMgr} />
              <Field label="IT Admin / Date"    value={r.sigITAdmin} />
              <Field label="Spt. Dept. / Date"  value={r.sigSptDept} />
              <Field label="HOO / Date"         value={r.sigHOO} />
              <Field label="MSDI Mgr / Date"    value={r.sigMSDIMgr} />
              <Field label="Dept. Mgr / Date"   value={r.sigDeptMgr} />
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT COLUMN: Admin Panel ── */}
        <div className="space-y-4">
          {/* Status + Meta */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informasi</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Form No.</span>
                <span className="font-mono font-bold text-sky-700 text-xs">{r.formNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Effective Date</span>
                <span className="text-slate-700 font-medium">{r.effectiveDate}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={r.status as RequestStatus} />
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Prioritas</span>
                <PriorityBadge priority={r.priority as RequestPriority} />
              </div>
            </div>
          </div>

          {/* Admin Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              ⚙️ Admin Panel
            </h3>
            <AdminPanel request={r} />
          </div>

          {/* IT Notes display (read-only) */}
          {r.itNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">💬 Catatan IT</p>
              <p className="text-sm text-amber-800 whitespace-pre-line">{r.itNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
