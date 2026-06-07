import Link from 'next/link';
import { CheckCircle2, LayoutDashboard, Printer, FilePlus2 } from 'lucide-react';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; form?: string }>;
}) {
  const { id, form } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>

        {/* Message */}
        <h1 className="text-xl font-bold text-slate-800 mb-2">Request Berhasil Dikirim!</h1>
        <p className="text-slate-500 text-sm mb-5">
          IT Request Anda telah berhasil dibuat dan sedang menunggu review dari tim IT.
        </p>

        {/* Form Number */}
        {form && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-6 inline-block">
            <p className="text-xs text-sky-600 font-medium mb-1">Nomor Form</p>
            <p className="font-mono font-bold text-sky-800 text-lg">{form}</p>
          </div>
        )}

        <p className="text-slate-400 text-xs mb-6">
          Simpan nomor form di atas untuk referensi. Tim IT akan memproses request Anda.
        </p>

        {/* Actions */}
        <div className="space-y-2.5">
          {id && (
            <Link href={`/dashboard/requests/${id}/print`} target="_blank"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors">
              <Printer size={15} /> Cetak Form
            </Link>
          )}
          <Link href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-colors">
            <LayoutDashboard size={15} /> Kembali ke Dashboard
          </Link>
          <Link href="/form"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-xl transition-colors">
            <FilePlus2 size={15} /> Buat Request Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
