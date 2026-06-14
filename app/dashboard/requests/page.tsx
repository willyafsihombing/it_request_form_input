// app/dashboard/requests/page.tsx
import Link from 'next/link';
import { FilePlus2 } from 'lucide-react';
import RequestsTable from '@/components/dashboard/RequestsTable';

export const dynamic = 'force-dynamic';

export default function RequestsPage() {
  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Semua IT Request</h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola dan pantau semua request yang masuk</p>
        </div>
        <Link
          href="/form"
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <FilePlus2 size={15} />
          Buat Request Baru
        </Link>
      </div>

      {/* Table with built-in search/filter */}
      <RequestsTable />
    </div>
  );
}
