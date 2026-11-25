'use client';

import { useEffect, useState } from 'react';
import { approvalApi } from '@/lib/approval-api';
import { useDialog } from '@/components/ui/DiaologProvider';
import SignaturePad from '@/features/approval/SignaturePad';
import { fileToSignaturePng } from '@/lib/signature';

export default function MySignaturePage() {
  const dialog = useDialog();
  const [current, setCurrent] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await approvalApi.mySignature();
    setCurrent(r.image || '');
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const save = async (image: string) => {
    setBusy(true);
    try {
      await approvalApi.saveMySignature(image);
      setPreview('');
      await load();
      dialog.success('Tanda tangan tersimpan.', 'Berhasil');
    } catch (e) {
      dialog.error(e instanceof Error ? e.message : 'Gagal menyimpan.', 'Gagal');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await dialog.confirm({
      title: 'Hapus tanda tangan?',
      message: 'Anda tidak bisa menyetujui request sebelum mengunggah tanda tangan lagi.',
      confirmText: 'Hapus', cancelText: 'Batal', danger: true,
    });
    if (!ok) return;
    try {
      await approvalApi.deleteMySignature();
      setCurrent('');
    } catch (e) {
      dialog.error(e instanceof Error ? e.message : 'Gagal menghapus.', 'Gagal');
    }
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    try {
      setPreview(await fileToSignaturePng(f));
    } catch (e) {
      dialog.error(e instanceof Error ? e.message : 'File tidak bisa dipakai.', 'Gagal');
    }
  };

  const box: React.CSSProperties = {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16,
  };

  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 className="text-xl font-bold text-slate-800">Tanda Tangan Saya</h1>
      <p className="text-xs text-slate-500 mt-1 mb-4">
        Dipakai otomatis saat Anda menekan Setujui. Gambar disimpan sebagai salinan per dokumen,
        jadi mengganti tanda tangan tidak mengubah dokumen yang sudah ditandatangani.
      </p>

      <div style={box}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanda tangan saat ini</p>
        {current ? (
          <>
            <img src={current} alt="Tanda tangan" style={{ height: 80, border: '1px dashed #cbd5e1', borderRadius: 8, padding: 6 }} />
            <div className="mt-2">
              <button onClick={remove} className="text-xs text-red-600 hover:underline">Hapus</button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Belum ada. Gambar atau unggah di bawah.</p>
        )}
      </div>

      <div style={box}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gambar langsung</p>
        <SignaturePad onSave={save} />
      </div>

      <div style={box}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Atau unggah file (PNG / JPG / JPEG)</p>
        <input type="file" accept="image/png,image/jpeg" onChange={e => onFile(e.target.files?.[0])} />
        {preview && (
          <div className="mt-3">
            <img src={preview} alt="Pratinjau" style={{ height: 80, border: '1px dashed #cbd5e1', borderRadius: 8, padding: 6 }} />
            <div className="mt-2">
              <button
                onClick={() => save(preview)}
                disabled={busy}
                className="px-4 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-40"
              >
                Simpan tanda tangan ini
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}