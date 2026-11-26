import Link from 'next/link';
import { FilePlus2 } from 'lucide-react';
import RequestsTable from '@/features/itrequest/components/RequestsTable';

export default function RequestsPage() {
  return (
    <div className="flex-1 min-w-0 p-4 md:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Semua IT Request</h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola dan pantau semua request yang masuk</p>
        </div>
        <Link
          href="/form"
          className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <FilePlus2 size={15} />
          Buat Request Baru
        </Link>
      </div>

      <RequestsTable />
    </div>
  );
}