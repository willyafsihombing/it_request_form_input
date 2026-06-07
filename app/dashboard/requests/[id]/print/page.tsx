import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { ITRequest } from '@/types';
import PrintButtons from '@/app/dashboard/requests/[id]/print/printButton'; // ← tambahkan import ini


export const dynamic = 'force-dynamic';

// ── Tiny checkbox for print view ──────────────────────────────
function CBox({ on, label }: { on: boolean; label?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginRight: 8, whiteSpace: 'nowrap' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 12, height: 12, border: '1px solid #333', background: 'white',
        fontSize: 8, fontWeight: 'bold', flexShrink: 0,
      }}>{on ? 'X' : ''}</span>
      {label && <span style={{ fontSize: 10, lineHeight: 1.2 }}>{label}</span>}
    </span>
  );
}

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = await prisma.request.findUnique({ where: { id } });  if (!req) notFound();
  const r = req as unknown as ITRequest;

  const CYAN   = '#00BCD4';
  const YELLOW = '#FFFF00';
  const WHITE = '#ffffff'

    const cell = (bg = 'white', xtra: React.CSSProperties = {}): React.CSSProperties => ({
    border: '0.7px solid #555',
    padding: '0 4px',
    verticalAlign: 'middle',
    textAlign: 'left',
    fontFamily: 'Arial, sans-serif',
    fontSize: 10.5,
    background: bg,
    height: 22,
    lineHeight: '22px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    ...xtra,
  });

  return (
  <>
        {/* {r.formNumber} — IT Request Form */}
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @page { size: A4 landscape; margin: 8mm;margin-top: 8mm;margin-bottom: 8mm; }
          body { background: white; font-family: Arial, sans-serif; }
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }

          /* Hilangkan header & footer browser */
          @page {
            margin: 8mm;
          }
          html {
            -webkit-print-color-adjust: exact;
          }

          .print-btn {
            position: fixed; top: 12px; right: 12px; z-index: 100;
            display: flex; gap: 8px;
          }
          .print-btn button, .print-btn a {
            padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;
            font-size: 13px; font-weight: 600; text-decoration: none;
            display: inline-flex; align-items: center; gap: 6px;
          }
          .btn-print  { background: #16a34a; color: white; }
          .btn-close  { background: #64748b; color: white; }
        `}</style>

        {/* Print / Close buttons */}
        <div className="print-btn no-print">
          <PrintButtons />
        </div>

        {/* ── FORM ── */}
        <div id='print-area' style={{ padding: '8mm 10mm', maxWidth: '35cm', margin: '0 auto' }}>

          {/* Title — di luar tabel */}
          <div style={{ position: 'relative', textAlign: 'center', fontFamily: 'Arial', marginBottom: 2 }}>
            <div
              data-form-number={r.formNumber}
              style={{ position: 'absolute', left: 0, top: 2, fontSize: 9, fontWeight: 'bold' }}
            >
              {r.formNumber}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: 20, lineHeight: 1.2 }}>Resource Group</div>
            <div style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 1.4 }}>Information Technology Request Form</div>
          </div>

          {/* Sub-header — di luar tabel */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1.5px solid #333',
            borderBottom: '1.5px solid #333',
            padding: '2px 6px',
            fontFamily: 'Arial',
            fontSize: 10.5,
            marginBottom: '-0.7px',
          }}>
            {/* Center absolute — pas di tengah container */}
            <span style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              Send Completed &amp; signed form to IT Department
            </span>

            {/* Spacer kiri — agar effective date tetap di kanan */}
            <span style={{ flex: 1 }} />

            {/* Effective Date — tetap di kanan */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span>Effective Date</span>
              <span style={{
                background: WHITE,
                fontWeight: 'bold',
                fontSize: 12,
                padding: '1px 12px',
                border: '0.7px solid #555',
                minWidth: 70,
                textAlign: 'center',
              }}>
                {r.effectiveDate}
              </span>
            </span>
          </div>

          {/* 20-column main table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '11%' }} />
              <col style={{ width: '5%' }} /><col style={{ width: '5%' }} />
              <col style={{ width: '5%' }} /><col style={{ width: '5%' }} />
              <col style={{ width: '4.5%' }} /><col style={{ width: '4.5%' }} />
              <col style={{ width: '4.5%' }} /><col style={{ width: '4.5%' }} />
              <col style={{ width: '5%' }} /><col style={{ width: '5%' }} /><col style={{ width: '5%' }} />
              <col style={{ width: '4%' }} /><col style={{ width: '4%' }} />
              <col style={{ width: '4%' }} /><col style={{ width: '4%' }} /><col style={{ width: '4%' }} />
              <col style={{ width: '5%' }} /><col style={{ width: '5%' }} /><col style={{ width: '5%' }} />
            </colgroup>
            <tbody>
              {/* Sub-header */}
              {/* <tr>
                <td colSpan={14} style={cell('white', { textAlign: 'center' })}>
                  Send Completed &amp; signed form to IT Department
                </td>
                <td colSpan={4} style={cell('white', { textAlign: 'right' })}>Effective Date</td>
                <td colSpan={2} style={cell(WHITE, { textAlign: 'center', fontWeight: 'bold', fontSize: 12 })}>{r.effectiveDate}</td>
              </tr> */}

              {/* Section Headers */}
              <tr>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold' })}>Requester Information</td>
                <td colSpan={3} style={cell(CYAN, { fontWeight: 'bold' })}>System &amp; Network</td>
                <td colSpan={3} style={cell()}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <CBox on={r.snAdd}       label="Add" />
                    <CBox on={r.snChange}    label="Change" />
                    <CBox on={r.snTerminate} label="Terminate" />
                  </div>
                </td>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold' })}>Hardware &amp; Software</td>
                <td colSpan={4} style={cell(CYAN)}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <CBox on={r.hwAdd}       label="Add" />
                    <CBox on={r.hwChange}    label="Change" />
                    <CBox on={r.hwTerminate} label="Terminate" />
                  </div>
                </td>
              </tr>

              {/* Company | LAN VPN Email FS | PC Printer NB */}
              <tr>
                <td style={cell(YELLOW)}>Company</td>
                <td colSpan={4} style={cell(YELLOW)}>{ r.reqCompany}</td>
                  <td colSpan={7} style={cell()}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <CBox on={r.snLAN}         label="LAN" />
                      <CBox on={r.snVPN}         label="VPN" />
                      <CBox on={r.snEmail}       label="Email" />
                      <CBox on={r.snFileSharing} label="File Sharing" />
                    </div>
                  </td>
                  <td colSpan={8} style={cell()}>
                    <div style={{ display: 'flex', gap: 50, justifyContent:'center', alignItems:'center' }}>
                      <CBox on={r.hwPC}       label="PC/Desktop" />
                      <CBox on={r.hwPrinter}  label="Printer" />
                      <CBox on={r.hwNotebook} label="Notebook" />
                    </div>
                  </td>
              </tr>

              {/* Personnel | Intranet | MS Adobe Zoom */}
              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.reqName}</td>
                  <td colSpan={7} style={cell()}>
                    <CBox on={r.snIntranet} label="Intranet" />
                  </td>
                  <td colSpan={8} style={cell()}>
                    <div style={{ display: 'flex', gap: 50, justifyContent:'center', alignItems:'center' }}>
                      <CBox on={r.hwMSOffice} label="MS Office Suite" />
                      <CBox on={r.hwAdobe}    label="Adobe" />
                      <CBox on={r.hwZoom}     label="Zoom" />
                    </div>
                  </td>
              </tr>

              {/* Recipient header | S&N Other | H&S Other */}
              <tr>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold' })}>Recipient Information</td>
                <td colSpan={2} style={cell('white', { border: 'none' })}>Other</td>
                <td colSpan={5} style={cell()}>{r.snOther}</td>
                <td colSpan={2} style={cell('white', { border: 'none' })}>Other</td>
                <td colSpan={6} style={cell()}>{r.hwOther}</td>
              </tr>

              {/* Company(rec) | ERP + PRONTO + SM + actions */}
              <tr>
                <td style={cell(YELLOW)}>Company</td>
                <td colSpan={4} style={cell(YELLOW, { border: 'none', borderBottom: '0.7px solid' })}>{r.recCompany}</td>
                <td colSpan={2} style={cell(CYAN, { fontWeight: 'bold' })}>ERP</td>
                <td colSpan={3} style={cell(CYAN,{border:'none',borderLeft:'0.1px #eee'})}><CBox on={r.erpPronto}      label="PRONTO" /></td>
                <td colSpan={4} style={cell(CYAN)}><CBox on={r.erpSmartMining} label="SMART MINING" /></td>
                <td colSpan={6} style={cell()}>
                    <div style={{ display: 'flex', gap: 50 }}>
                      <CBox on={r.erpAdd}       label="Add" />
                      <CBox on={r.erpChange}    label="Change" />
                      <CBox on={r.erpTerminate} label="Terminate" />
                    </div>
                </td>
              </tr>

              {/* Dept | Position ID | Sign-on ID */}
              <tr>
                <td style={cell(YELLOW)}>Department</td>
                <td colSpan={4} style={cell(YELLOW, { border: 'none', borderBottom: '0.7px solid' })}>{r.recDept}</td>
                <td colSpan={2} style={cell({ fontSize: 10 })}>Position ID</td>
                <td colSpan={6} style={cell(WHITE)}>{r.erpPositionId}</td>
                <td colSpan={2} style={cell({ fontSize: 10 })}>*Sign-on ID</td>
                <td colSpan={5} style={cell(WHITE)}>{r.erpSignOnId}</td>
              </tr>

              {/* Location | District | Global Profile */}
              <tr>
                <td style={cell(YELLOW)}>Location</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recLocation}</td>
                <td colSpan={2} style={cell({ fontSize: 10 })}>District</td>
                <td colSpan={6} style={cell()}>{r.erpDistrict}</td>
                <td colSpan={2} style={cell({ fontSize: 10 })}>*Global Profile</td>
                <td colSpan={5} style={cell()}>{r.erpGlobalProfile}</td>
              </tr>

              {/* Personnel(rec) | Ref Sign On */}
              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recPersonnel}</td>
                <td colSpan={3} style={cell('white',{border:'none', fontSize: 9 })}>Ref. existing Sign On ID/Name</td>
                <td colSpan={12} style={cell('white', { border: 'none', borderRight:'1px solid'})}>{r.erpRef}</td>
              </tr>

              {/* EmpID (rowspan) + Title */}
              <tr>
                <td style={cell(YELLOW)}>Employee ID/NIK</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recEmpId}</td>
                <td colSpan={15} style={cell('white', { border: 'none', borderRight:'1px solid' })}></td>
              </tr>
              <tr>
                <td style={cell(YELLOW)}>Title</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recTitle}</td>
                <td colSpan={15} style={cell('white', { border: 'none', borderRight:'1px solid' })}></td>
              </tr>

              {/* Status */}
              <tr>
                <td style={cell(YELLOW)}>Status</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recStatus}</td>
                <td colSpan={15} style={cell('white', { border: 'none', borderRight:'1px solid' })}></td>
              </tr>
            </tbody>
          </table>

          {/* Additional Desc + Cost Code */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px' }}>
            <tbody>
              <tr>
                <td style={{ border: '0.7px solid #555', padding: '4px 6px', width: '30%', verticalAlign: 'top', fontFamily: 'Arial', fontSize: 10.5 }}>
                  <div style={{ fontSize: 9, color: '#444', marginBottom: 4 }}>
                    Additional Description (Describe the Software / Hardware / Service / Privilege requested)
                  </div>
                  <div style={{ minHeight: 70, whiteSpace: 'pre-line', fontSize: 11, lineHeight: 1.55 }}>{r.additionalDesc}</div>
                </td>
                <td style={{ border: '0.7px solid #555', padding: '4px 6px', width: '30%', verticalAlign: 'top', fontFamily: 'Arial', fontSize: 10.5 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>COST CODE / COA :</div>
                  <div>{r.costCode}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Justification + Technical Comment */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px' }}>
            <tbody>
              <tr>
                <td style={{ border: '0.7px solid #555', padding: '3px 6px', width: '50%', fontSize: 9.5, fontFamily: 'Arial' }}>
                  Justification (Describe the business reason for your request)
                </td>
                <td style={{ border: '0.7px solid #555', padding: '3px 6px', width: '50%', fontFamily: 'Arial' }}>
                  <div style={{  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: 9.5 }}>Technical Comment (To be completed by IT)</span>
                    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(['AD','AW','CR','EM','IP','EP'] as const).map(t => (
                        <CBox key={t} on={r[`tech${t}` as keyof ITRequest] as boolean} label={t} />
                      ))}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ border: '0.7px solid #555', padding: '6px 8px', width: '50%', verticalAlign: 'top', height: 80, fontFamily: 'Arial', fontSize: 11, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                  {r.justification}
                </td>
                <td style={{ border: '0.7px solid #555', padding: '6px 8px', width: '50%', verticalAlign: 'top', height: 80, fontFamily: 'Arial', fontSize: 11, whiteSpace: 'pre-line' }}>
                  {r.techComment}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px' }}>
            <tbody>
              <tr>
                <td colSpan={3} style={{ border: '0.7px solid #555', padding: '3px 8px', background: CYAN, fontWeight: 'bold', fontFamily: 'Arial', fontSize: 11 }}>
                  Signature :
                </td>
              </tr>
              {[
                [['Requester / Date', r.sigRequester], ['Sr. Mgr / Date', r.sigSrMgr],  ['IT Admin / Date',  r.sigITAdmin]],
                [['Spt. Dept. / Date', r.sigSptDept], ['HOO/ Date',      r.sigHOO],     ['MSDI Mgr / Date',  r.sigMSDIMgr]],
              ].map((row, ri) => (
                <tr key={ri}>
                  {row.map(([lbl, val]) => (
                    <td key={lbl as string} style={{ border: '0.7px solid #555', padding: '3px 6px', width: '33.33%', fontFamily: 'Arial', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: 9.5, marginBottom: 2, color: '#444' }}>{lbl as string}</div>
                      <div style={{ background: WHITE, minHeight: 22, padding: '3px 4px', fontSize: 11, border: '0.5px solid #bbb', display: 'flex', alignItems: 'center' }}>{val as string}</div>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td style={{ border: '0.7px solid #555', padding: '3px 6px', width: '33.33%', fontFamily: 'Arial', verticalAlign: 'middle' }}>
                  <div style={{ fontSize: 9.5, marginBottom: 2, color: '#444' }}>Dept. Mgr / Date</div>
                  <div style={{ background: WHITE, minHeight: 22, padding: '3px 4px', fontSize: 11, border: '0.5px solid #bbb', display: 'flex', alignItems: 'center' }}>{r.sigDeptMgr}</div>
                </td>
                <td colSpan={2} style={{ border: '0.7px solid #555' }}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Auto-print script */}
      {/* <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('load', function() {
          document.querySelectorAll('.btn-print').forEach(function(btn) {
            btn.addEventListener('click', function() { window.print(); });
          });
        });
      `}} /> */}
  </>
  );
}
