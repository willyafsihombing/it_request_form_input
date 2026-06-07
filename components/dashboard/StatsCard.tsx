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
    <div className={cn('bg-white rounded-2xl p-5 shadow-sm border', border ?? 'border-slate-200')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', color)}>{value}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', bgColor)}>
          <Icon size={21} className={color} />
        </div>
      </div>
    </div>
  );
}
