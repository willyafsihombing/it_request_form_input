'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function PrintButtons() {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const getFileName = () => {
    const formNumberE1 =  document.querySelector('[data-form-number]');
    const formNumber = formNumberE1?.getAttribute('data-form-number') || 'IT-Request';

    const now = new Date()
    const month = now.toLocaleString('en-US', {month: 'short'})
    const year = now.getFullYear()

    return `${formNumber}_${month}${year}`
  }

const handleDownloadPDF = async () => {
  setDownloading(true)
  try {
    const formNumberEl = document.querySelector('[data-form-number]')
    const id = window.location.pathname.split('/')[3] // ambil ID dari URL

    const res = await fetch(`${API_URL}/api/requests/${id}/pdf`)

    // console.log('All headers:', [...res.headers.entries()])
    // console.log('Content-Disposition:', res.headers.get('Content-Disposition'))
    if (!res.ok) throw new Error('Gagal generate PDF')

    const disposition = res.headers.get('Content-Disposition') ?? ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    const fileName = match?.[1] ?? 'IT-Request.pdf'

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

  } catch (err) {
    alert('Gagal download PDF')
  } finally {
    setDownloading(false)
  }
}

  return (
    <div style={{
      position: 'fixed',
      top: 12,
      right: 12,
      zIndex: 100,
      display: 'flex',
      gap: 8,
    }}>
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
    </div>
  );
}