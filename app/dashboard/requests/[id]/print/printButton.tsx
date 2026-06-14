'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrintButtons() {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    alert('Tips: Di dialog print, buka "More settings" dan matikan "Headers and footers" agar hasil lebih rapi.');
    window.print();
  };

const handleDownloadPDF = async () => {
  setDownloading(true);
  try {
    const formNumberEl = document.querySelector('[data-form-number]');
    const formNumber = formNumberEl?.getAttribute('data-form-number') || 'IT-Request';

    // Buat iframe tersembunyi
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:-1;visibility:hidden;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('iframe error');

    // Copy seluruh HTML halaman ke iframe
    const printArea = document.getElementById('print-area');
    if (!printArea) throw new Error('print-area not found');

    // Copy semua styles
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML).join('\n');

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${styles}
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @page { size: A4 landscape; margin: 4mm; }
          body { background: white; font-family: Arial, sans-serif; }
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

            #print-area {
              transform: scale(0.90);
              transform-origin: top left;
              width: 115%;                
            }
          }
          html { -webkit-print-color-adjust: exact; }
          .print-btn {
            position: fixed; top: 12px; right: 12px; z-index: 100;
            display: flex; gap: 8px;
          }
        </style>
        </head>
        <body>
          ${printArea.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Tunggu render lalu print dari iframe
    await new Promise(resolve => setTimeout(resolve, 800));

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.body.removeChild(iframe);

  } catch (err) {
    console.error('PDF error:', err);
    alert('Gagal membuat PDF');
  } finally {
    setDownloading(false);
  }
};

  return (
    <div style={{
      position: 'fixed',
      top: 12,
      right: 12,
      zIndex: 100,
      display: 'flex',
      gap: 8,
    }}>
      {/* Download PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={downloading}
        style={{
          padding: '8px 16px',
          background: downloading ? '#2563eb99' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: downloading ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'background 0.2s',
        }}
      >
        {downloading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            Membuat PDF...
          </>
        ) : (
          <>📥 Download PDF</>
        )}
      </button>

      {/* Print */}
      {/* <button
        onClick={handlePrint}
        style={{
          padding: '8px 16px',
          background: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        🖨️ Print
      </button> */}

      {/* Kembali */}
      <button
        onClick={() => router.push('/dashboard/requests')}
        style={{
          padding: '8px 16px',
          background: '#64748b',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        ← Kembali
      </button>

      <div style={{
        position: 'fixed',
        top: 12,
        right: 270,
        zIndex: 100,
        background: '#fef9c3',
        border: '1px solid #fbbf24',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 12,
        color: '#92400e',
        maxWidth: 300,
      }} className="no-print">
        💡 Saat dialog print muncul, pilih <b>More settings</b> → matikan <b>Headers and footers</b>
    </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}