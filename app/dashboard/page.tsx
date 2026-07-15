  'use client';

  import { useEffect, useState } from 'react';
  import Link from 'next/link';
  import {
    ClipboardList, Clock, Search, CheckCircle, XCircle,
    CalendarDays, FilePlus2, ArrowRight, Printer,
  } from 'lucide-react';
  import { formatDate, timeAgo, STATUS_CONFIG } from '@/lib/utils';
  import { StatusBadge, PriorityBadge } from '@/components/ui/badges';
  import StatsCard from '@/components/dashboard/StatsCard';
  import { requestApi, statsApi } from '@/lib/api';
  import type { RequestStatus, RequestPriority } from '@/types';

  export default function DashboardPage() {
    const [stats,    setStats]    = useState({ total: 0, pending: 0, inReview: 0, approved: 0, rejected: 0, thisMonth: 0 });
    const [recent,   setRecent]   = useState<any[]>([]);
    const [loading,  setLoading]  = useState(true);

    const [currentUser, setCurrentUser] = useState <{ role: string, fullName:string} | null>(null);
    const [userLoaded, setUserLoaded] = useState(false)
    
    useEffect(() => {
      const useStr = localStorage.getItem('auth-user')
      if(useStr){
        try{
          const user = JSON.parse(useStr);
          setCurrentUser(user)
        }catch {
          setCurrentUser(null)
        }
      }
      setUserLoaded(true)
    },[]);

    const isAdminOrIT = currentUser?.role === 'admin' || currentUser?.role === 'itstaff' || currentUser?.role === 'staff'

    useEffect(() => {
      if (!userLoaded) return;
      const fetchData = async () => {
        setLoading(true);
        try {
          const [statsRes, recentRes] = await Promise.all([
            statsApi.getStats(!isAdminOrIT && currentUser?.fullName ? currentUser?.fullName : undefined) as any,
            requestApi.getAll({ 
              limit: 8,
              page: 1,
              reqName: !isAdminOrIT && currentUser?.fullName ? currentUser.fullName : undefined,
            }) as any,
          ]);
          setStats(statsRes);
          setRecent(recentRes.requests || []);
        } catch (err) {
          console.error('Dashboard fetch error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [userLoaded, isAdminOrIT]);
    
    const STATS = [
      { title: 'Total Request', value: stats.total,     icon: ClipboardList, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: `${stats.thisMonth} bulan ini` },
      { title: 'Pending',       value: stats.pending,   icon: Clock,         color: 'text-amber-600', bgColor: 'bg-amber-50',  border: 'border-amber-200' },
      { title: 'In Review',     value: stats.inReview,  icon: Search,        color: 'text-blue-600',  bgColor: 'bg-blue-50',   border: 'border-blue-200' },
      { title: 'Approved',      value: stats.approved,  icon: CheckCircle,   color: 'text-green-600', bgColor: 'bg-green-50',  border: 'border-green-200' },
      { title: 'Rejected',      value: stats.rejected,  icon: XCircle,       color: 'text-red-600',   bgColor: 'bg-red-50',    border: 'border-red-200' },
      { title: 'Bulan Ini',     value: stats.thisMonth, icon: CalendarDays,  color: 'text-sky-600',   bgColor: 'bg-sky-50',    border: 'border-sky-200' },
    ];

    return (
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Ringkasan IT Request — Resource Group</p>
          </div>
          {/* <Link href="/form"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
            <FilePlus2 size={15} />
            Buat Request Baru
          </Link> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATS.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Request Terbaru</h2>
              <p className="text-xs text-slate-400 mt-0.5">8 request terkini</p>
            </div>
            <Link href="/dashboard/requests"
              className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>

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
                      Memuat data...
                    </td>
                  </tr>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada request.{' '}
                      <Link href="/form" className="text-sky-600 underline">Buat request pertama</Link>
                    </td>
                  </tr>
                ) : (
                  recent.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {req.formNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">{req.reqName || '—'}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-800 font-medium whitespace-nowrap">{req.recPersonnel || '—'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{req.recDept} · {req.recLocation}</p>
                      </td>
                      <td className="px-5 py-3.5 max-w-[180px]">
                        <p className="text-slate-600 text-xs line-clamp-2">{req.additionalDesc || req.hwOther || '—'}</p>
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
                          {(req.status === 'approved' || isAdminOrIT) ? (
                          <Link href={`/dashboard/requests/${req.id}/print`} target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Cetak">
                            <Printer size={14} />
                          </Link>
                          ) : (
                          <span className="p-1.5 rounded-lg text-slate-200 cursor-not-allowed" 
                            title="Print hanya tersedia setelah request di approve oleh IT"
                            >
                            <Printer size={15} />
                          </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Distribusi Status</h3>
            <div className="space-y-3">
              {(['pending', 'in_review', 'approved', 'rejected'] as RequestStatus[]).map(s => {
                const cfg = STATUS_CONFIG[s];
                const val = stats[s === 'in_review' ? 'inReview' : s as keyof typeof stats] as number;
                const pct = stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span>{val} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.dot}`}
                        style={{ width: `${pct}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/form',                                 icon: '📝', label: 'Buat Request Baru',    desc: 'Submit IT Request baru' },
                { href: '/dashboard/requests?status=pending',    icon: '⏳', label: 'Lihat Request Pending', desc: `${stats.pending} request menunggu` },
                { href: '/dashboard/requests?status=in_review',  icon: '🔍', label: 'Request In Review',    desc: `${stats.inReview} sedang diproses` },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-sky-700 transition-colors">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }