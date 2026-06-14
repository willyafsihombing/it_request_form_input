import { notFound } from 'next/navigation';
import type { ITRequest } from '@/types';
import PrintButtons from '@/app/dashboard/requests/[id]/print/printButton'; // ← tambahkan import ini

const API = process.env.API_URL || 'http://localhost:8080';

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

export default async function PrintPage({ params } : { params: Promise<{ id: string }> }){
  const { id } = await params

  let r: ITRequest
  try{
  const res = await fetch(`${API}/api/requests/${id}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
 });

  if (!res.ok) notFound();
    r = await res.json();
  }catch (err) {
    console.error('Fetch print error:', err);
    notFound();
  }

  const CYAN  = '#00b0f0';
  const YELLOW = '#FFFF00';
  const WHITE  = '#ffffff';

  //  const cell = (bg = 'white', xtra: React.CSSProperties = {}): React.CSSProperties => ({
  //   border: '0.5px solid #555',
  //   padding: '0 4px',
  //   verticalAlign: 'middle',
  //   textAlign: 'left',
  //   fontFamily: 'Arial, sans-serif',
  //   fontSize: 10.5,
  //   background: bg,
  //   height: 22,
  //   lineHeight: '22px',
  //   whiteSpace: 'nowrap',
  //   overflow: 'hidden',
  //   ...xtra,
  // });

  const cell = (bg = 'white', xtra: React.CSSProperties = {}): React.CSSProperties => ({
    border: '0.5px solid #555',
    padding: '0 3px',       
    verticalAlign: 'middle',
    textAlign: 'left',
    fontFamily: 'Arial, sans-serif',
    fontSize: 10.5,          
    background: bg,
    height: 20.6,            
    lineHeight: '14px',     
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    ...xtra,
  });

  return (
  <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page { size: A4 landscape; margin: 4mm; }
        body { background: white; font-family: Arial, sans-serif; }
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #print-area {
            transform: scale(0.82);
            transform-origin: top left;
            width: 122%;
          }
        }
        html { -webkit-print-color-adjust: exact; }
        .print-btn {
          position: fixed; top: 12px; right: 12px; z-index: 100;
          display: flex; gap: 8px;
        }
      `}</style>

        {/* Print / Close buttons */}
        <div className="print-btn no-print">
          <PrintButtons />
        </div>

        {/* ── FORM ── */}
        <div id='print-area' style={{ padding: '8mm 45mm', maxWidth: '45cm', margin: '0 auto' }}>

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
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold', fontSize:'11px' })}>Requester Information</td>
                <td colSpan={3} style={cell(CYAN, { fontWeight: 'bold', fontSize:'11px' })}>System &amp; Network</td>
                <td colSpan={4} style={cell(CYAN)}>
                  <div style={{ display: 'flex', gap: 1 }}>
                    <CBox on={r.snAdd}       label="Add" />
                    <CBox on={r.snChange}    label="Change" />
                    <CBox on={r.snTerminate} label="Terminate" />
                  </div>
                </td>
                <td colSpan={4} style={cell(CYAN, { fontWeight: 'bold', fontSize:'11px' })}>Hardware &amp; Software</td>
                <td colSpan={4} style={cell(CYAN)}>
                  <div style={{ display: 'flex', justifyContent:'center', gap: 4 }}>
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
                  <td colSpan={7} style={cell('white', {borderBottom:'none'})}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <CBox on={r.snLAN}         label="LAN" />
                      <CBox on={r.snVPN}         label="VPN" />
                      <CBox on={r.snEmail}       label="Email" />
                      <CBox on={r.snFileSharing} label="File Sharing" />
                    </div>
                  </td>
                  <td colSpan={8} style={cell('white', {borderBottom:'none'})}>
                    <div style={{ display: 'flex',gap: 50, alignItems:'center' }}>
                      <CBox on={r.hwPC}       label="PC/Desktop" />
                      <CBox on={r.hwPrinter}  label="Printer" />
                      <span style={{display: 'flex', marginLeft:'-15px', alignItems:'center'}}>
                      <CBox on={r.hwNotebook} label="Notebook" />
                      </span>
                    </div>
                  </td>
              </tr>

              {/* Personnel | Intranet | MS Adobe Zoom */}
              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.reqName}</td>
                  <td colSpan={7} style={cell('white', {borderTop:'none'})}>
                    <CBox on={r.snIntranet} label="Intranet" />
                  </td>
                  <td colSpan={8} style={cell('white', {borderTop:'none'})}>
                    <div style={{ display: 'flex', gap: 35, alignItems:'center' }}>
                      <CBox on={r.hwMSOffice} label="MS Office Suite" />
                      <CBox on={r.hwAdobe}    label="Adobe" />
                      <CBox on={r.hwZoom}     label="Zoom" />
                    </div>
                  </td>
              </tr>

              {/* Recipient header | S&N Other | H&S Other */}
              <tr>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold', fontSize:'11px' })}>Recipient Information</td>
                <td colSpan={2} style={cell('white', { border: 'none' })}>Other</td>
                <td colSpan={5} style={cell()}>{r.snOther}</td>
                <td colSpan={3} style={cell('white', { border: 'none' })}>Other</td>
                <td colSpan={5} style={cell()}>{r.hwOther}</td>
              </tr>

              {/* Company(rec) | ERP + PRONTO + SM + actions */}
              <tr>
                <td style={cell(YELLOW)}>Company</td>
                <td colSpan={4} style={cell(YELLOW, { border: 'none', borderBottom: '0.7px solid' })}>{r.recCompany}</td>
                <td colSpan={2} style={cell(CYAN, { fontWeight: 'bold',  fontSize:'11px' })}>ERP</td>
                <td colSpan={5} style={cell(CYAN)}><CBox on={r.erpPronto}      label="PRONTO" /></td>
                <td colSpan={3} style={cell(CYAN)}><CBox on={r.erpSmartMining} label="SMART MINING" /></td>
                <td colSpan={5} style={cell(CYAN)}>
                    <div style={{ display: 'flex', gap: 5, justifyContent:'end' }}>
                      <CBox on={r.erpAdd}       label="Add" />
                      <CBox on={r.erpChange}    label="Change" />
                      <CBox on={r.erpTerminate} label="Terminate" />
                    </div>
                </td>
              </tr>

              {/* Dept | Position ID | Sign-on ID */}
              <tr>
                <td style={cell(YELLOW)}>Department</td>
                <td colSpan={4} style={cell(YELLOW, { border: 'none', borderBottom: '0.5px solid' })}>{r.recDept}</td>
                <td colSpan={2} style={cell()}>Position ID</td>
                <td colSpan={5} style={cell(WHITE)}>{r.erpPositionId}</td>
                <td colSpan={3} style={cell()}>*Sign-on ID</td>
                <td colSpan={5} style={cell(WHITE)}>{r.erpSignOnId}</td>
              </tr>
              {/* Location | District | Global Profile */}
              <tr>
                <td style={cell(YELLOW)}>Location</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recLocation}</td>
                <td colSpan={2} style={cell()}>District</td>
                <td colSpan={5} style={cell()}>{r.erpDistrict}</td>
                <td colSpan={3} style={cell()}>*Global Profile</td>
                <td colSpan={5} style={cell()}>{r.erpGlobalProfile}</td>
              </tr>

              {/* Personnel(rec) | Ref Sign On */}
              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recPersonnel}</td>
                <td colSpan={3} style={cell('white',{border:'none', fontSize: 9 })}>Ref. existing Sign On ID/Name :</td>
                <td colSpan={12} style={cell('white', { border: 'none', borderRight:'0.5px solid'})}>{r.erpRef}</td>
              </tr>

              {/* EmpID (rowspan) + Title */}
              <tr>
                <td style={cell(YELLOW)}>Employee ID/NIK</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recEmpId}</td>
                <td colSpan={15} style={cell('white', { border: 'none', borderRight:'0.5px solid' })}></td>
              </tr>
              <tr>
                <td style={cell(YELLOW)}>Title</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recTitle}</td>
                <td colSpan={15} style={cell('white', { border: 'none', borderRight:'0.5px solid' })}></td>
              </tr>

              {/* Status */}
              <tr>
                <td style={cell(YELLOW)}>Status</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recStatus}</td>
                <td colSpan={15} style={cell('white', { border: 'none', borderRight:'0.5px solid' })}></td>
              </tr>
            </tbody>
          </table>

          {/* Additional Desc + Cost Code */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px' }}>
            <tbody>
              <tr>
                <td style={{ 
                  border: '0.5px solid #555', padding: '3px 5px', 
                  width: '50%', verticalAlign: 'top', 
                  fontFamily: 'Arial', fontSize: 9.5 
                }}>
                  <div style={{ fontSize: 8, color: '#444', marginBottom: 2 }}>
                    Additional Description (Describe the Software / Hardware / Service / Privilege requested)
                  </div>
                  <div style={{ 
                    height: 120,           
                    overflow: 'hidden',
                    whiteSpace: 'pre-line', 
                    fontSize: 9.5, 
                    lineHeight: 1.4 
                  }}>
                    {r.additionalDesc}
                  </div>
                </td>
                <td style={{ 
                  border: '0.5px solid #555', padding: '3px 5px', 
                  width: '50%', verticalAlign: 'top', 
                  fontFamily: 'Arial', fontSize: 9.5 
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 2, fontSize: 9.5 }}>COST CODE / COA :</div>
                  <div style={{ fontSize: 9.5 }}>{r.costCode}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Justification + Technical Comment */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px' }}>
            <tbody>
              <tr>
                <td style={{ 
                  border: '0.5px solid #555', padding: '2px 5px', 
                  width: '50%', fontSize: 8.5, fontFamily: 'Arial' 
                }}>
                  Justification (Describe the business reason for your request)
                </td>
                <td style={{ 
                  border: '0.5px solid #555', padding: '2px 5px', 
                  width: '50%', fontFamily: 'Arial' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: 8.5 }}>Technical Comment (To be completed by IT)</span>
                    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(['AD','AW','CR','EM','IP','EP'] as const).map(t => (
                        <CBox key={t} on={r[`tech${t}` as keyof ITRequest] as boolean} label={t} />
                      ))}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ 
                  border: '0.5px solid #555', padding: '4px 5px', 
                  width: '50%', 
                  verticalAlign: 'top', 
                  height: 55,  
                  overflow: 'hidden',
                  fontFamily: 'Arial', fontSize: 9.5, 
                  whiteSpace: 'pre-line', 
                  lineHeight: 1.4 
                }}>
                  {r.justification}
                </td>
                <td style={{ 
                  border: '0.5px solid #555', padding: '4px 5px', 
                  width: '50%', verticalAlign: 'top', 
                  height: 55,
                  overflow: 'hidden',
                  fontFamily: 'Arial', fontSize: 9.5, 
                  whiteSpace: 'pre-line' 
                }}>
                  {r.techComment}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px', backgroundColor:'#e4f2ff' }}>
            <tbody>
              {/* Header */}
              <tr>
                <td colSpan={6} style={{ border: '0.5px solid #555', padding: '2px 8px', background: CYAN, fontWeight: 'bold', fontFamily: 'Arial', fontSize: 11 }}>
                  Signature :
                </td>
              </tr>

              {/* Row 1 — Requester | Sr. Mgr | IT Admin */}
              <tr>
                <td style={{borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 6px', width: '10%', fontFamily: 'Arial', fontSize: 9, whiteSpace: 'nowrap', height: 30 }}>
                  Requester / Date
                </td>
                <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: 10, height: 30 }}>
                  {r.sigRequester}
                </td>
                <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: 9, whiteSpace: 'nowrap', height: 30 }}>
                  Sr. Mgr / Date
                </td>
                <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: 10, height: 30 }}>
                  {r.sigSrMgr}
                </td>
                <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: 9, whiteSpace: 'nowrap', height: 30 }}>
                  IT Admin / Date
                </td>
                <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: 10, height: 30 }}>
                  {r.sigITAdmin}
                </td>
              </tr>

              {/* Row 2 — Spt. Dept | HOO | MSDI Mgr */}
              <tr>
                <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 6px', width: '10%', fontFamily: 'Arial', fontSize: 9, whiteSpace: 'nowrap', height: 30 }}>
                  Spt. Dept. / Date
                </td>
                <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: 10, height: 30 }}>
                  {r.sigSptDept}
                </td>
                <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: 9, whiteSpace: 'nowrap', height: 30 }}>
                  HOO/ Date
                </td>
                <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: 10, height: 30 }}>
                  {r.sigHOO}
                </td>
                <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: 9, whiteSpace: 'nowrap', height: 30 }}>
                  MSDI Mgr / Date
                </td>
                <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: 10, height: 30 }}>
                  {r.sigMSDIMgr}
                </td>
              </tr>

              {/* Row 3 — Dept. Mgr */}
              <tr>
                <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', borderBottom:'0.5px solid #555', padding: '3px 6px', width: '8%', fontFamily: 'Arial', fontSize: 9, whiteSpace: 'nowrap', height: 30 }}>
                  Dept. Mgr / Date
                </td>
                <td style={{ border: '0.5px solid #555', padding: '3px 6px', width: '25%', fontFamily: 'Arial', fontSize: 10, height: 30 }}>
                  {r.sigDeptMgr}
                </td>
                <td colSpan={4} style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555',borderBottom:'0.5px solid #555' }}></td>
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
