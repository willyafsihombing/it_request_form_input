import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ITRequestForm from '@/components/form/ITRequestForm';

export default function FormPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-bold text-base leading-tight">Buat IT Request Baru</h1>
            <p className="text-slate-400 text-xs mt-0.5">Resource Group — Information Technology Request Form</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <ITRequestForm />
        </div>
      </div>
    </div>
  );
}
