import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title:   string;
  value:   number;
  icon:    LucideIcon;
  color:   string;
  bgColor: string;
  border?: string;
  trend?:  string;
}

export default function StatsCard({ title, value, icon: Icon, color, bgColor, border, trend }: StatsCardProps) {
  return (
    <div className={cn('min-w-0 bg-white rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm border', border ?? 'border-slate-200')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">{title}</p>
          <p className={cn('text-xl sm:text-2xl font-bold mt-1 leading-tight', color)}>{value}</p>
          {trend && <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">{trend}</p>}
        </div>
        <div className={cn('w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0', bgColor)}>
          <Icon className={cn('w-[18px] h-[18px] md:w-[21px] md:h-[21px]', color)} />
        </div>
      </div>
    </div>
  );
}