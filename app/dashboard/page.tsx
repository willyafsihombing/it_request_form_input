// app/dashboard/requests/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ClipboardList, Printer, Trash2, Search,
  ChevronLeft, ChevronRight, Filter, RefreshCw, X
} from 'lucide-react';
import { formatDate, timeAgo, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import { requestApi } from '@/lib/api';
import type { RequestStatus, RequestPriority } from '@/types';

interface Request {
  id: string;
  formNumber: string;
  effectiveDate: string;
  reqName: string;
  recPersonnel: string;
  recDept: string;
  recLocation: string;
  additionalDesc: string;
  hwOther: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export default function RequestsPage() {
  const [requests, setRequests]   = useState<Request[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('all');
  const [priority, setPriority]   = useState('all');
  const [searchInput, setSearchInput] = useState('');

  const [showModal, setShowModal]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; formNumber: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await requestApi.getAll({
        status:   status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
        search:   search || undefined,
        page,
        limit: 20,
      }) as any;

      setRequests(data.requests || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Fetch requests error:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [status, priority, search, page]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Search dengan debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDeleteClick = (id: string, formNumber: string) => {
  setDeleteTarget({ id, formNumber });
  setShowModal(true);
};

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await requestApi.delete(deleteTarget.id);
      setShowModal(false);
      setDeleteTarget(null);
      fetchRequests();

      setSuccessMessage(`Request ${deleteTarget.formNumber} Deleted Successfully`)
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFilterChange = (type: 'status' | 'priority', value: string) => {
    if (type === 'status')   setStatus(value);
    if (type === 'priority') setPriority(value);
    setPage(1);
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Semua Request</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {total} request ditemukan
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRequests}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/form"
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            + Buat Request
          </Link>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Cari nama, form, dept..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 bg-white"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Filter Priority */}
          <select
            value={priority}
            onChange={e => handleFilterChange('priority', e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white"
          >
            <option value="all">Semua Prioritas</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">No. Form</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Requester</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Penerima</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Request</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Prioritas</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Waktu</th>
                <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                    <RefreshCw size={16} className="animate-spin inline mr-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                    Tidak ada request ditemukan.{' '}
                    <Link href="/form" className="text-sky-600 underline">Buat request baru</Link>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {req.formNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                      {req.reqName || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-800 font-medium whitespace-nowrap">{req.recPersonnel || '—'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{req.recDept} · {req.recLocation}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[180px]">
                      <p className="text-slate-600 text-xs line-clamp-2 whitespace-pre-line">
                        {req.additionalDesc || req.hwOther || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={req.status as RequestStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={req.priority as RequestPriority} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-slate-600 text-xs">{timeAgo(req.createdAt)}</p>
                      <p className="text-slate-400 text-xs">{formatDate(req.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/requests/${req.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors" title="Detail">
                          <ClipboardList size={14} />
                        </Link>
                        <Link href={`/dashboard/requests/${req.id}/print`} target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Cetak">
                          <Printer size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(req.id, req.formNumber)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Information Deleted Success */}
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-2">
            <span className="text-lg">✅</span>
            <span className="text-sm font-medium">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-2 text-white/70 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {showModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)} />

          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 z-10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>

            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Hapus Request?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Request <span className="font-semibold text-slate-700">{deleteTarget.formNumber}</span> akan dihapus permanen.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm} // ← callback, bukan langsung dipanggil
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>    
      )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Halaman {page} dari {pages} · {total} total
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p < 1 || p > pages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      p === page
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}