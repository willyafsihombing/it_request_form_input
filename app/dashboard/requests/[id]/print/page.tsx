import { notFound } from 'next/navigation';
import type { ITRequest } from '@/types';
import PrintButtons from '@/app/dashboard/requests/[id]/print/printButton';
import { API_URL } from '@/lib/api';


export const dynamic = 'force-dynamic';

const FONT_SCALE = 0.93;
const fs = (px: number) => Math.round(px * FONT_SCALE * 100) / 100;

const PAPER_W = '297mm';
const PAPER_H = '210mm';
const PAPER_PAD = '5mm 6mm'; 


const LINE = '1px solid #555';
const LINE_BOLD = '2px solid #333'; 
const OVERLAP = '-1px';             

const FS = {
  base:      12,
  label:     11,
  checkbox:  10,
  header:    13,
  title:     22,
  subtitle:  15,
  subheader: 12,
  desc:      12,
  descLabel: 12,
  sig:       11,
  sigLabel:  10,
}

function getShortNumber(formNumber: string): string {
  const match = formNumber.match(/^\d+-ITR-Unggul\d{6}/)
  return match ? match[0] : formNumber
}

function CBox({ on, label }: { on: boolean; label?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginRight: 8, whiteSpace: 'nowrap' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: fs(FS.checkbox) + 4,
        height: fs(FS.checkbox) + 4,
        border: '1px solid #333', background: 'white',
        fontSize: fs(FS.checkbox), fontWeight: 'bold', flexShrink: 0,
      }}>{on ? 'X' : ''}</span>
      {label && <span style={{ fontSize: fs(FS.label), lineHeight: 1.2 }}>{label}</span>}
    </span>
  );
}


export default async function PrintPage({ params } : { params: Promise<{ id: string }> }){
  const { id } = await params

  let r: ITRequest
  try{
  const res = await fetch(`${API_URL}/api/requests/${id}`, {
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

  const shortFormNumber = getShortNumber(r.formNumber)

  const cell = (bg = 'white', xtra: React.CSSProperties = {}): React.CSSProperties => ({
    border: LINE,
    padding: '0 5px',
    verticalAlign: 'middle',
    textAlign: 'left',
    fontFamily: 'Arial, sans-serif',
    fontSize: fs(11.5),
    background: bg,
    height: 22,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    ...xtra,
  });

  const limitLines = (text: string, maxLines: number): string => {
  if (!text) return ''
  const lines = text.split('\n')
  return lines.slice(0, maxLines).join('\n')
}

  return (
  <>
  <style>{`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 landscape; margin: 0; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, sans-serif; }
    table { border-collapse: collapse; border-spacing: 0; }

    .print-btn {
      position: fixed; top: 12px; right: 12px; z-index: 100;
      display: flex; gap: 8px;
    }

    .paper-wrap {
      min-height: 100vh;
      background: #e5e7eb;
      padding: 56px 16px 24px;
      overflow-x: auto;             
    }
    .paper {
      width: ${PAPER_W};
      min-width: ${PAPER_W};        
      height: ${PAPER_H};
      padding: ${PAPER_PAD};
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      overflow: hidden;
    }

    @media print {
      html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

      /* Sembunyikan semua elemen halaman (sidebar, navbar, padding layout), kecuali lembar */
      body * { visibility: hidden !important; }
      .paper, .paper * { visibility: visible !important; }

      .paper {
        position: fixed !important;   
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;   
        min-width: 0 !important;
        height: auto !important;
        margin: 0 !important;
        box-shadow: none !important;
        overflow: visible !important;
      }
      #print-area {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
      }
    }
  `}</style>

    <div className="print-btn no-print">
      <PrintButtons />
    </div>

    <div className="paper-wrap">
      <div className="paper">
        <div id='print-area' style={{ width: '100%' }}>

          <div style={{ position: 'relative', textAlign: 'center', fontFamily: 'Arial', marginBottom: 2 }}>
            <div
              data-form-number={r.formNumber}
              style={{ position: 'absolute', left: 0, top: 2, fontSize: fs(9), fontWeight: 'bold' }}
            >
              {shortFormNumber}
            </div>
            <div className='print-title' style={{ fontWeight: 'bold', fontSize: fs(20), lineHeight: 1.2 }}>Resource Group</div>
            <div className='print-subtitle' style={{ fontWeight: 'bold', fontSize: fs(14), lineHeight: 1.4 }}>Information Technology Request Form</div>
          </div>

          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: LINE_BOLD,
            borderBottom: LINE_BOLD,
            padding: '2px 6px',
            fontFamily: 'Arial',
            fontSize: fs(10.5),
            marginBottom: 4,
          }}>
            <span style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              Send Completed &amp; signed form to IT Department
            </span>

            <span style={{ flex: 1 }} />

            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span>Effective Date</span>
              <span style={{
                background: WHITE,
                fontWeight: 'bold',
                fontSize: fs(12),
                padding: '1px 12px',
                border: LINE,
                minWidth: 70,
                textAlign: 'center',
              }}>
                {r.effectiveDate}
              </span>
            </span>
          </div>

          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '5%' }} /><col style={{ width: '5%' }} />
              <col style={{ width: '6%' }} /><col style={{ width: '6%' }} />

              <col style={{ width: '4.2%' }} /><col style={{ width: '4.2%' }} />
              <col style={{ width: '4.2%' }} /><col style={{ width: '4.2%' }} />
              <col style={{ width: '4.6%' }} /><col style={{ width: '4.6%' }} /><col style={{ width: '4.6%' }} />

              <col style={{ width: '3.8%' }} /><col style={{ width: '3.8%' }} />
              <col style={{ width: '3.8%' }} /><col style={{ width: '3.8%' }} /><col style={{ width: '3.8%' }} />
              <col style={{ width: '4.8%' }} /><col style={{ width: '4.8%' }} /><col style={{ width: '4.8%' }} />
            </colgroup>
            <tbody>

                            <tr>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold', fontSize: fs(12) })}>Requester Information</td>
                <td colSpan={3} style={cell(CYAN, { fontWeight: 'bold', fontSize: fs(12) })}>System &amp; Network</td>
                <td colSpan={4} style={cell(CYAN)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CBox on={r.snAdd}       label="Add" />
                    <CBox on={r.snChange}    label="Change" />
                    <CBox on={r.snTerminate} label="Terminate" />
                  </div>
                </td>
                <td colSpan={3} style={cell(CYAN, { fontWeight: 'bold', fontSize: fs(12) })}>Hardware &amp; Software</td>
                <td colSpan={5} style={cell(CYAN)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CBox on={r.hwAdd}       label="Add" />
                    <CBox on={r.hwChange}    label="Change" />
                    <CBox on={r.hwTerminate} label="Terminate" />
                  </div>
                </td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Company</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.reqCompany}</td>
                <td colSpan={7} style={cell('white', { borderBottom: 'none' })}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', alignItems: 'center' }}>
                    <CBox on={r.snLAN}         label="LAN" />
                    <CBox on={r.snVPN}         label="VPN" />
                    <CBox on={r.snEmail}       label="Email" />
                    <CBox on={r.snFileSharing} label="File Sharing" />
                  </div>
                </td>
                <td colSpan={8} style={cell('white', { borderBottom: 'none' })}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', alignItems: 'center' }}>
                    <CBox on={r.hwPC}       label="PC/Desktop" />
                    <CBox on={r.hwPrinter}  label="Printer" />
                    <CBox on={r.hwNotebook} label="Notebook" />
                  </div>
                </td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.reqName}</td>
                <td colSpan={7} style={cell('white', { borderTop: 'none' })}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', alignItems: 'center' }}>
                    <CBox on={r.snIntranet} label="Intranet" />
                  </div>
                </td>
                <td colSpan={8} style={cell('white', { borderTop: 'none' })}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', alignItems: 'center' }}>
                    <CBox on={r.hwMSOffice} label="MS Office Suite" />
                    <CBox on={r.hwAdobe}    label="Adobe" />
                    <CBox on={r.hwZoom}     label="Zoom" />
                  </div>
                </td>
              </tr>

              <tr>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold', fontSize: fs(12) })}>Recipient Information</td>
                <td colSpan={3} style={cell()}>Other</td>
                <td colSpan={4} style={cell()}>{r.snOther}</td>
                <td colSpan={3} style={cell()}>Other</td>
                <td colSpan={5} style={cell()}>{r.hwOther}</td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Company</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recCompany}</td>
                <td colSpan={3} style={cell(CYAN, { fontWeight: 'bold', fontSize: fs(12) })}>ERP</td>
                <td colSpan={4} style={cell(CYAN)}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CBox on={r.erpPronto} label="PRONTO" />
                  </div>
                </td>
                <td colSpan={3} style={cell(CYAN)}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CBox on={r.erpSmartMining} label="SMART MINING" />
                  </div>
                </td>
                <td colSpan={5} style={cell(CYAN)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CBox on={r.erpAdd}       label="Add" />
                    <CBox on={r.erpChange}    label="Change" />
                    <CBox on={r.erpTerminate} label="Terminate" />
                  </div>
                </td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Department</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recDept}</td>
                <td colSpan={3} style={cell()}>Position ID</td>
                <td colSpan={4} style={cell(WHITE)}>{r.erpPositionId}</td>
                <td colSpan={3} style={cell()}>*Sign-on ID</td>
                <td colSpan={5} style={cell(WHITE)}>{r.erpSignOnId}</td>
              </tr>
              <tr>
                <td style={cell(YELLOW)}>Location</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recLocation}</td>
                <td colSpan={3} style={cell()}>District</td>
                <td colSpan={4} style={cell()}>{r.erpDistrict}</td>
                <td colSpan={3} style={cell()}>*Global Profile</td>
                <td colSpan={5} style={cell()}>{r.erpGlobalProfile}</td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recPersonnel}</td>
                <td colSpan={4} style={cell('white', { borderRight: 'none', borderBottom: 'none', fontSize: fs(12) })}>Ref. existing Sign On ID/Name :</td>
                <td colSpan={11} style={cell('white', { borderLeft: 'none', borderBottom: 'none' })}>{r.erpRef}</td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Employee ID/NIK</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recEmpId}</td>
                <td colSpan={15} style={cell('white', { borderTop: 'none', borderBottom: 'none' })}></td>
              </tr>
              <tr>
                <td style={cell(YELLOW)}>Title</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recTitle}</td>
                <td colSpan={15} style={cell('white', { borderTop: 'none', borderBottom: 'none' })}></td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Status</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recStatus}</td>
                <td colSpan={15} style={cell('white', { borderTop: 'none' })}></td>
              </tr>
            </tbody>
          </table>

          <table className='desc-section' style={{ width: '100%', tableLayout: 'fixed', marginTop: OVERLAP }}>
            <tbody>
              <tr>
                <td style={{
                  border: LINE, padding: '3px 5px',
                  width: '50%', verticalAlign: 'top',
                  fontFamily: 'Arial', fontSize: fs(11),
                }}>
                  <div style={{ fontSize: fs(11), color: '#444', marginBottom: 2 }}>
                    Additional Description (Describe the Software / Hardware / Service / Privilege requested)
                  </div>
                  <div className='desc-section-just' style={{
                    height: 150,
                    overflow: 'hidden',
                    whiteSpace: 'pre-line',
                    fontSize: fs(11.5),
                    lineHeight: 1.4
                  }}>
                    {r.additionalDesc}
                  </div>
                </td>
                <td style={{
                  border: LINE, padding: '3px 5px',
                  width: '50%', verticalAlign: 'top',
                  fontFamily: 'Arial', fontSize: fs(12)
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 2, fontSize: fs(9.5) }}>COST CODE / COA :</div>
                  <div className='desc-section-just' style={{ fontSize: fs(9) }}>{r.costCode}</div>
                </td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: '100%', tableLayout: 'fixed', marginTop: OVERLAP }}>
            <tbody>
              <tr>
                <td className='desc-section' style={{
                  border: LINE, padding: '2px 5px',
                  width: '50%', fontSize: fs(10), fontFamily: 'Arial'
                }}>
                  Justification (Describe the business reason for your request)
                </td>
                <td style={{
                  border: LINE, padding: '2px 5px',
                  width: '50%', fontFamily: 'Arial'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: fs(10) }}>Technical Comment (To be completed by IT)</span>
                    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(['AD','AW','CR','EM','IP','EP'] as const).map(t => (
                        <CBox key={t} on={r[`tech${t}` as keyof ITRequest] as boolean} label={t} />
                      ))}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className='desc-section-just' style={{
                  border: LINE, padding: '4px 5px',
                  width: '50%',
                  verticalAlign: 'top',
                  height: 88,
                  maxHeight: 88,
                  overflow: 'hidden',
                  fontFamily: 'Arial', fontSize: fs(11.5),
                  whiteSpace: 'pre-line',
                  lineHeight: 1.3
                }}>
                  {limitLines(r.justification, 7)}
                </td>
                <td className='desc-section-just' style={{
                  border: LINE, padding: '4px 5px',
                  width: '50%', verticalAlign: 'top',
                  height: 88,
                  maxHeight: 88,
                  overflow: 'hidden',
                  fontFamily: 'Arial', fontSize: fs(11),
                  whiteSpace: 'pre-line'
                }}>
                  {limitLines(r.techComment, 7)}
                </td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px', backgroundColor:'#e4f2ff' }}>
          <tbody>
            <tr>
              <td colSpan={6} style={{ border: '0.5px solid #555', padding: '2px 8px', background: CYAN, fontWeight: 'bold', fontFamily: 'Arial', fontSize: fs(11) }}>
                Signature :
              </td>
            </tr>

            <tr>
              <td style={{borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 6px', width: '10%', fontFamily: 'Arial', fontSize: fs(10), whiteSpace: 'nowrap', height: 30 }}>
                Requester / Date
              </td>
              <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: fs(11.5), height: 30 }}>
                {r.sigRequester}
              </td>
              <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: fs(10), whiteSpace: 'nowrap', height: 30 }}>
                Sr. Mgr / Date
              </td>
              <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: fs(11.5), height: 30 }}>
                {r.sigSrMgr}
              </td>
              <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: fs(10), whiteSpace: 'nowrap', height: 30 }}>
                IT Admin / Date
              </td>
              <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: fs(11.5), height: 30 }}>
                {r.sigITAdmin}
              </td>
            </tr>

            <tr>
              <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 6px', width: '10%', fontFamily: 'Arial', fontSize: fs(10), whiteSpace: 'nowrap', height: 30 }}>
                Spt. Dept. / Date
              </td>
              <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: fs(11.5), height: 30 }}>
                {r.sigSptDept}
              </td>
              <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: fs(10), whiteSpace: 'nowrap', height: 30 }}>
                HOO/ Date
              </td>
              <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: fs(11.5), height: 30 }}>
                {r.sigHOO}
              </td>
              <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', padding: '6px 10px', width: '8%', fontFamily: 'Arial', fontSize: fs(10), whiteSpace: 'nowrap', height: 30 }}>
                MSDI Mgr / Date
              </td>
              <td style={{ border: '0.5px solid #555', padding: '6px 6px', width: '25%', fontFamily: 'Arial', fontSize: fs(11.5), height: 30 }}>
                {r.sigMSDIMgr}
              </td>
            </tr>

            <tr>
              <td style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555', borderBottom:'0.5px solid #555', padding: '3px 6px', width: '8%', fontFamily: 'Arial', fontSize: fs(10), whiteSpace: 'nowrap', height: 30 }}>
                Dept. Mgr / Date
              </td>
              <td style={{ border: '0.5px solid #555', padding: '3px 6px', width: '25%', fontFamily: 'Arial', fontSize: fs(11.5), height: 30 }}>
                {r.sigDeptMgr}
              </td>
              <td colSpan={4} style={{ borderRight: '0.5px solid #555', borderLeft:'0.5px solid #555',borderBottom:'0.5px solid #555' }}></td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </>
  );

}