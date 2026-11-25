'use client';

import { useRef, useState } from 'react';

const W = 300;
const H = 100;
const MAX_DATA_URL = 60000;

type Props = {
  onSave: (dataUrl: string) => void | Promise<void>;
  disabled?: boolean;
};

const btn = (primary = false, off = false): React.CSSProperties => ({
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 8,
  border: primary ? 'none' : '1px solid #cbd5e1',
  background: primary ? '#0284c7' : '#fff',
  color: primary ? '#fff' : '#334155',
  cursor: off ? 'not-allowed' : 'pointer',
  opacity: off ? 0.4 : 1,
});

export default function SignaturePad({ onSave, disabled }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);
  const [error, setError] = useState('');

  const ctx = () => ref.current!.getContext('2d')!;

  // Koordinat pointer -> koordinat kanvas (tetap benar walau kanvas diskalakan CSS)
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    drawing.current = true;
    const c = ctx();
    c.lineWidth = 2.2;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.strokeStyle = '#000';
    const { x, y } = point(e);
    c.beginPath();
    c.moveTo(x, y);
    // titik tunggal juga terlihat
    c.lineTo(x + 0.01, y + 0.01);
    c.stroke();
    ref.current!.setPointerCapture(e.pointerId);
    setEmpty(false);
    setError('');
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = ctx();
    const { x, y } = point(e);
    c.lineTo(x, y);
    c.stroke();
  };

  const up = () => {
    drawing.current = false;
  };

  const clear = () => {
    ctx().clearRect(0, 0, W, H);
    setEmpty(true);
    setError('');
  };

  const save = async () => {
    const url = ref.current!.toDataURL('image/png');
    if (url.length > MAX_DATA_URL) {
      setError('Gambar terlalu rumit. Hapus lalu buat tanda tangan yang lebih sederhana.');
      return;
    }
    await onSave(url);
  };

  return (
    <div>
      <canvas
        ref={ref}
        width={W}
        height={H}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        style={{
          width: '100%',
          maxWidth: 360,
          height: 'auto',
          aspectRatio: `${W} / ${H}`,
          border: '1px dashed #94a3b8',
          borderRadius: 8,
          background: '#fff',
          touchAction: 'none',
          cursor: disabled ? 'not-allowed' : 'crosshair',
          display: 'block',
        }}
      />

      {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={clear} disabled={disabled || empty} style={btn(false, disabled || empty)}>
          Hapus
        </button>
        <button type="button" onClick={save} disabled={disabled || empty} style={btn(true, disabled || empty)}>
          Simpan tanda tangan
        </button>
      </div>
    </div>
  );
}