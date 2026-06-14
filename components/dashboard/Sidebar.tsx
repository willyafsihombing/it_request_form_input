'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, FilePlus2, Settings,
  Monitor, Building2, ChevronRight,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/layout/logoutButton';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/dashboard/requests', label: 'Semua Request',   icon: ClipboardList   },
  { href: '/form',               label: 'Buat Request',    icon: FilePlus2       },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{
    fullName: string;
    role: string;
    department:string;
  } | null>(null)

  useEffect(() => {
    const useStr = localStorage.getItem('auth-user');
    if(useStr) {
      try{
        setCurrentUser(JSON.parse(useStr))
      }catch{
        setCurrentUser(null)
      }
    }
  }, [])

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  const roleLabel: Record<string, string> = {
    admin:    'Administrator',
    itstaff:  'IT Staff',
    staff:    'Staff',
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
            <Monitor size={18} className="text-white" />            
          </div>
        <div>
            <p className="text-white font-bold text-sm leading-tight">IT Request</p>
            <p className="text-slate-400 text-xs">Resource Group</p>
          </div>
        </div>
      </div>

      {/* Company Badge */}
      <div className="mx-4 my-3 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
            <img
              src="/img/logo.png"
              alt='logo-unggul'
              width={2}
              height={2}
              className='w-full h-full object-contain'
            />
          </div>          
            <span className="text-slate-300 text-xs font-medium leading-tight">PT. Unggul Dinamika Utama</span>
        </div>
      </div>

      {currentUser && (
        <div className="mx-4 mb-3 px-3 py-2.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
              <UserCircle size={18} className="text-sky-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {currentUser.fullName}
              </p>
              <p className="text-sky-400 text-xs truncate">
                Department
                {currentUser.department ? ` ${currentUser.department}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2 mt-1">Menu</p>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-sky-500/20 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-sky-400/60" />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 border-t border-slate-100">
            <span></span>
            <LogoutButton />
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          <Settings size={13} />
          <span>v1.0.0 — Admin Panel</span>
        </Link>
      </div>
    </aside>
  );
}
