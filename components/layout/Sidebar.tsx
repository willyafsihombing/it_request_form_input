'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, Settings,
  Monitor, Building2, ChevronRight,
  UserCircle, Users,
  type LucideIcon,
  ClipboardCheck,
  Inbox,
  ChevronDown,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoutButton from '@/features/auth/components/logoutButton';
import { useEffect, useState } from 'react';
import { approvalApi } from '@/lib/approval-api';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

type NavLeaf = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: boolean; // tampilkan jumlah persetujuan yang menunggu
};

type NavGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
};

type NavEntry = NavLeaf | NavGroup

const isGroup = (e: NavEntry): e is NavGroup => 'children' in e

const NAV_ITEMS: NavEntry[] = [
  { href: '/dashboard',           label: 'Dashboard',            icon: LayoutDashboard },
  { href: '/dashboard/employees', label: 'Master Data Karyawan', icon: Users, adminOnly: true },
  { href: '/dashboard/requests',  label: 'IT Requests',          icon: ClipboardList   },
  {
    key: 'itr-approval',
    label:'Persetujuan Approval',
    icon: ClipboardCheck,
    children: [
      // { href: '/dashboard/approvals',       label: 'Kotak Persetujuan', icon: Inbox, badge: true },
      { href: '/dashboard/approval-routes', label: 'Alur Persetujuan ITR',  icon: Settings, adminOnly: true },
      { href: '/dashboard/signature', label: 'Tanda Tangan Saya', icon: PenLine },

      // { href: '/dashboard/wo-routes',    label: 'Alur Persetujuan  WO',  icon: Settings, adminOnly: true },

    ],
  },
  // {
  //   key: 'wo-approval',
  //   label: 'Persetujuan Work Order',
  //   icon: ClipboardCheck,
  //   children: [
  //     { href: '/dashboard/wo-approvals', label: 'Kotak Persetujuan', icon: Inbox },
  //     { href: '/dashboard/wo-routes',    label: 'Alur Persetujuan',  icon: Settings, adminOnly: true },
  //   ],
  // },
  // { href: '/form',               label: 'Buat Request',    icon: FilePlus2       }, -> buat request sementara di hilangkan dahulu
  // { href: '/form',               label: 'Buat Request',    icon: FilePlus2       }, -> buat request sementara di hilangkan dahulu
];

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{
    fullName: string;
    role: string;
    department:string;
  } | null>(null)
  const [pending, setPending] = useState(0)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    let alive = true;
    approvalApi.inboxCount()
    .then((r: any) => {
      if (!alive) return;
      setPending(typeof r === 'number' ? r : Number(r?.count ?? 0));
    })
    .catch(()=> {if (alive) setPending(0);});
  return () => { alive = false;};
  }, [pathname])

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  const roleLabel: Record<string, string> = {
    admin:    'Administrator',
    itstaff:  'IT Staff',
    staff:    'Staff',
  };

   const canSee = (leaf: NavLeaf) => !leaf.adminOnly || currentUser?.role === 'admin';

   const linkClass = (active: boolean) => cn (
     'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
    active
      ? 'bg-sky-500/20 text-sky-400 shadow-sm'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
    )

    const Badge = ({ n } : { n: number}) =>
      n > 0 ? (
        <span
        style={{
          minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10,
          background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {n > 99 ? '99+' : n}
      </span>
    ) : null;

  return (
    <aside className=" no-print fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col">
      <div className="px-7 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-5">
          <div className="h-10 w-auto rounded-xl bg-white shadow-md ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0">
            <img
              src="/img/nex-one.png"
              alt='logo-unggul'
              className='w-full h-full object-contain'
            />
          </div>
        <div>
            <p className="text-white font-bold text-sm leading-tight"></p>
            <p className="text-slate-200 text-[12px] font-medium leading-tight">One Platform. Everything Connected.</p>
          </div>
        </div>
      </div>

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
                {currentUser.department ? ` ${currentUser.department}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2 mt-1">Menu</p>

        {NAV_ITEMS.map(entry => {
          if (!isGroup(entry)) {
            if (!canSee(entry)) return null;
            const { href, label, icon: Icon } = entry;
            const active = isActive(href);
            return (
              <Link key={href} href={href} className={linkClass(active)}>
                <Icon size={17} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-sky-400/60" />}
              </Link>
            );
          }
          const children = entry.children.filter(canSee);
          if (children.length === 0) return null;
          const GroupIcon = entry.icon;
          const groupActive = children.some(c => isActive(c.href));
          const open = openGroups[entry.key] ?? groupActive; // otomatis terbuka bila salah satu anak aktif
          const groupBadge = children.some(c => c.badge) ? pending : 0;

          return (
            <div key={entry.key}>
              <button
                type="button"
                onClick={() => setOpenGroups(o => ({ ...o, [entry.key]: !open }))}
                className={linkClass(false)}
                style={{ width: '100%', color: groupActive ? '#38bdf8' : undefined }}
              >
                <GroupIcon size={17} className="flex-shrink-0" />
                <span className="flex-1 text-left">{entry.label}</span>
                {!open && <Badge n={groupBadge} />}
                <ChevronDown
                  size={14}
                  style={{ transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none', opacity: 0.6 }}
                />
              </button>

              {open && (
                <div className="mt-1 space-y-1">
                  {children.map(({ href, label, icon: Icon, badge }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={linkClass(active)}
                        style={{ paddingLeft: 40 }}
                      >
                        <Icon size={15} className="flex-shrink-0" />
                        <span className="flex-1">{label}</span>
                        {badge && <Badge n={pending} />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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