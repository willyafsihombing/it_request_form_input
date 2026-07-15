import { notFound } from 'next/navigation';
import type { ITRequest } from '@/types';
import PrintButtons from '@/app/dashboard/requests/[id]/print/printButton';

const API = process.env.API_URL || 'http://localhost:8080';

export const dynamic = 'force-dynamic';

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
        width: FS.checkbox + 4,  
        height: FS.checkbox + 4,
        border: '1px solid #333', background: 'white',
        fontSize: FS.checkbox, fontWeight: 'bold', flexShrink: 0,
      }}>{on ? 'X' : ''}</span>
      {label && <span style={{ fontSize: FS.label, lineHeight: 1.2 }}>{label}</span>}
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

  const shortFormNumber = getShortNumber(r.formNumber)

  const cell = (bg = 'white', xtra: React.CSSProperties = {}): React.CSSProperties => ({
    border: '0.5px solid #555',
    padding: '0 5px',       
    verticalAlign: 'middle',
    textAlign: 'left',
    fontFamily: 'Arial, sans-serif',
    fontSize: 11.5,          
    background: bg,
    height: 21.5,            
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
            font-size: 14pt !important
          }
        }
        html { -webkit-print-color-adjust: exact; }
        .print-btn {
          position: fixed; top: 12px; right: 12px; z-index: 100;
          display: flex; gap: 8px;
        }
      `}</style>

        <div className="print-btn no-print">
          <PrintButtons />
        </div>

        <div id='print-area' style={{ padding: '8mm 45mm', maxWidth: '100%', margin: '0 auto', width: ' ' }}>

          <div style={{ position: 'relative', textAlign: 'center', fontFamily: 'Arial', marginBottom: 2 }}>
            <div
              data-form-number={r.formNumber}
              style={{ position: 'absolute', left: 0, top: 2, fontSize: 9, fontWeight: 'bold' }}
            >
              {shortFormNumber}
            </div>
            <div className='print-title' style={{ fontWeight: 'bold', fontSize: 20, lineHeight: 1.2 }}>Resource Group</div>
            <div className='print-subtitle' style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 1.4 }}>Information Technology Request Form</div>
          </div>

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
              
              <tr>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold', fontSize:'12px' })}>Requester Information</td>
                <td colSpan={3} style={cell(CYAN, { fontWeight: 'bold', fontSize:'12px' })}>System &amp; Network</td>
                <td colSpan={4} style={cell(CYAN)}>
                  <div style={{ display: 'flex', gap: 1 }}>
                    <CBox on={r.snAdd}       label="Add" />
                    <CBox on={r.snChange}    label="Change" />
                    <CBox on={r.snTerminate} label="Terminate" />
                  </div>
                </td>
                <td colSpan={4} style={cell(CYAN, { fontWeight: 'bold', fontSize:'12px' })}>Hardware &amp; Software</td>
                <td colSpan={4} style={cell(CYAN)}>
                  <div style={{ display: 'flex', justifyContent:'center', gap: 0   }}>
                    <CBox on={r.hwAdd}       label="Add" />
                    <CBox on={r.hwChange}    label="Change" />
                    <CBox on={r.hwTerminate} label="Terminate" />
                  </div>
                </td>
              </tr>

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
                      <span style={{display: 'flex', marginLeft:'-17px', alignItems:'center'}}>
                      <CBox on={r.hwNotebook} label="Notebook" />
                      </span>
                    </div>
                  </td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.reqName}</td>
                  <td colSpan={7} style={cell('white', {borderTop:'none'})}>
                    <CBox on={r.snIntranet} label="Intranet" />
                  </td>
                  <td colSpan={8} style={cell('white', {borderTop:'none'})}>
                    <div style={{ display: 'flex', gap: 33, alignItems:'center' }}>
                      <CBox on={r.hwMSOffice} label="MS Office Suite" />
                      <CBox on={r.hwAdobe}    label="Adobe" />
                      <CBox on={r.hwZoom}     label="Zoom" />
                    </div>
                  </td>
              </tr>

              <tr>
                <td colSpan={5} style={cell(CYAN, { fontWeight: 'bold', fontSize:'12px' })}>Recipient Information</td>
                <td colSpan={2} style={cell('white', { border: 'none' })}>Other</td>
                <td colSpan={5} style={cell()}>{r.snOther}</td>
                <td colSpan={3} style={cell('white', { border: 'none' })}>Other</td>
                <td colSpan={5} style={cell()}>{r.hwOther}</td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Company</td>
                <td colSpan={4} style={cell(YELLOW, { border: 'none', borderBottom: '0.7px solid' })}>{r.recCompany}</td>
                <td colSpan={2} style={cell(CYAN, { fontWeight: 'bold',  fontSize:'12px' })}>ERP</td>
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

              <tr>
                <td style={cell(YELLOW)}>Department</td>
                <td colSpan={4} style={cell(YELLOW, { border: 'none', borderBottom: '0.5px solid' })}>{r.recDept}</td>
                <td colSpan={2} style={cell()}>Position ID</td>
                <td colSpan={5} style={cell(WHITE)}>{r.erpPositionId}</td>
                <td colSpan={3} style={cell()}>*Sign-on ID</td>
                <td colSpan={5} style={cell(WHITE)}>{r.erpSignOnId}</td>
              </tr>
              <tr>
                <td style={cell(YELLOW)}>Location</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recLocation}</td>
                <td colSpan={2} style={cell()}>District</td>
                <td colSpan={5} style={cell()}>{r.erpDistrict}</td>
                <td colSpan={3} style={cell()}>*Global Profile</td>
                <td colSpan={5} style={cell()}>{r.erpGlobalProfile}</td>
              </tr>

              <tr>
                <td style={cell(YELLOW)}>Personnel Name</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recPersonnel}</td>
                <td colSpan={4} style={cell('white',{border:'none', fontSize: 9 })}>Ref. existing Sign On ID/Name :</td>
                <td colSpan={11} style={cell('white', { border: 'none', borderRight:'0.5px solid'})}>{r.erpRef}</td>
              </tr>

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

              <tr>
                <td style={cell(YELLOW)}>Status</td>
                <td colSpan={4} style={cell(YELLOW)}>{r.recStatus}</td>
                <td colSpan={15} style={cell('white', { border: 'none', borderRight:'0.5px solid' })}></td>
              </tr>
            </tbody>
          </table>

          <table className='desc-section' style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px' }}>
            <tbody>
              <tr>
                <td style={{ 
                  border: '1px solid #555' , padding: '3px 5px', 
                  width: '50%', verticalAlign: 'top', 
                  fontFamily: 'Arial', fontSize: '11px',
                  boxSizing:'border-box'
                }}>
                  <div style={{fontSize: 10.5, color: '#444', marginBottom: 2 }}>
                    Additional Description (Describe the Software / Hardware / Service / Privilege requested)
                  </div>
                  <div className='desc-section-just' style={{ 
                    height: 150,           
                    overflow: 'hidden',
                    whiteSpace: 'pre-line', 
                    fontSize: 11.5, 
                    lineHeight: 1.4
                  }}>
                    {r.additionalDesc}
                  </div>
                </td>
                <td style={{ 
                  border: '0.5px solid #555', padding: '3px 5px', 
                  width: '50%', verticalAlign: 'top', 
                  fontFamily: 'Arial', fontSize: 12 
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 2, fontSize: 9.5 }}>COST CODE / COA :</div>
                  <div className='desc-section-just' style={{ fontSize: 9 }}>{r.costCode}</div>
                </td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-0.7px' }}>
            <tbody>
              <tr>
                <td className='desc-section' style={{ 
                  border: '0.5px solid #555', padding: '2px 5px', 
                  width: '50%', fontSize: 9.5, fontFamily: 'Arial' 
                }}>
                  Justification (Describe the business reason for your request)
                </td>
                <td style={{ 
                  border: '0.5px solid #555', padding: '2px 5px', 
                  width: '50%', fontFamily: 'Arial' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
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
                <td className='desc-section-just' style={{ 
                  border: '0.5px solid #555', padding: '4px 5px', 
                  width: '50%', 
                  verticalAlign: 'top', 
                  height: 88,
                  maxHeight: 88,  
                  overflow: 'hidden',
                  fontFamily: 'Arial', fontSize: 11.5, 
                  whiteSpace: 'pre-line', 
                  lineHeight: 1.3 
                }}>
                  {limitLines(r.justification, 7)}
                </td>
                <td className='desc-section-just' style={{ 
                  border: '0.5px solid #555', padding: '4px 5px', 
                  width: '50%', verticalAlign: 'top', 
                  height: 88,
                  maxHeight: 88,
                  overflow: 'hidden',
                  fontFamily: 'Arial', fontSize: 11, 
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
                <td colSpan={6} style={{ border: '0.5px solid #555', padding: '2px 8px', background: CYAN, fontWeight: 'bold', fontFamily: 'Arial', fontSize: 11 }}>
                  Signature :
                </td>
              </tr>

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
  </>
  );
  
}
