import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { RequestStatus, RequestPriority } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: idLocale });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: idLocale });
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale });
}

// ← HAPUS generateFormNumber, buildFormNumber, commitFormNumber

export const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: 'Pending',    color: 'text-amber-700',  bg: 'bg-amber-100',  dot: 'bg-amber-500'  },
  in_review: { label: 'In Review',  color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500'   },
  approved:  { label: 'Approved',   color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500'  },
  rejected:  { label: 'Rejected',   color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500'    },
};

export const PRIORITY_CONFIG: Record<RequestPriority, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: 'text-slate-600', bg: 'bg-slate-100' },
  normal: { label: 'Normal', color: 'text-blue-700',  bg: 'bg-blue-100'  },
  high:   { label: 'High',   color: 'text-amber-700', bg: 'bg-amber-100' },
  urgent: { label: 'Urgent', color: 'text-red-700',   bg: 'bg-red-100'   },
};