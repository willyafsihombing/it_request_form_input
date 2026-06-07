'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Printer, Trash2, RefreshCw } from 'lucide-react';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
import type { RequestStatus, RequestPriority } from '@/types';

interface RequestRow {
  id: string;
  formNumber: string;
  reqName: string;
  recDept: string;
  recLocation: string;
  recPersonnel: string;
  additionalDesc: string;
  hwOther: string;
  status: RequestStatus;
  priority: RequestPriority;
  assignedTo: string;
  createdAt: string;
}

export default function RequestsTable() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('all');
  const [priority, setPriority] = useState('all');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page:     String(page),
      limit:    '15',
      status,
      priority,
      ...(search ? { search } : {}),
    });
    try {
      const res  = await fetch(`/api/requests?${params}`);
      const data = await res.json();
      setRequests(data.requests ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, priority, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { setPage(1); }, [search, status, priority]);

  const handleDelete = async (id: string, formNumber: string) => {
  if (!confirm(`Hapus request ${formNumber}?`)) return;
  
  try {
    const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      console.error('Delete error:', err);
      alert(`Gagal menghapus: ${err.error || 'Terjadi kesalahan'}`);
      return;
    }
    
    fetchRequests();
  } catch (err) {
    console.error('Delete failed:', err);
    alert('Gagal menghubungi server');
  }
};

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, departemen, form number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-slate-50"
          />
        </div>
        {/* Filters */}
        <div className="flex gap-2 flex-shrink-0">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
          >
            <option value="all">Semua Prioritas</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={fetchRequests}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">No. Form</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Requester</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Penerima / Dept</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Deskripsi</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Prioritas</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Tanggal</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-slate-400">
                  <Filter size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="font-medium">Tidak ada request ditemukan</p>
                  <p className="text-xs mt-1">Coba ubah filter atau tambah request baru</p>
                </td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {req.formNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 whitespace-nowrap">{req.reqName || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 whitespace-nowrap">{req.recPersonnel || '—'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{req.recDept} · {req.recLocation}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-slate-600 text-xs line-clamp-2 whitespace-pre-line">
                      {req.additionalDesc || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status as RequestStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={req.priority as RequestPriority} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-slate-700 text-xs">{formatDate(req.createdAt)}</p>
                    <p className="text-slate-400 text-xs">{timeAgo(req.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/requests/${req.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/dashboard/requests/${req.id}/print`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Cetak"
                      >
                        <Printer size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(req.id, req.formNumber)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {loading ? 'Memuat...' : `${total} request`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              page === 1 || loading
                ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-slate-600 px-2">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages || loading}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              page === pages || loading
                ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
