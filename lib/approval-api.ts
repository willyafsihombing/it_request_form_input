import { API_URL } from '@/lib/api';
import type {
  ActionResult, ApprovalProgressData, InboxItem, ApprovalRoute, Readiness, StepCode,
} from '@/types/approval';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    credentials: 'include',
    headers: { ...authHeaders(), ...(init?.headers as Record<string, string> | undefined) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Permintaan gagal (${res.status})`);
  return json as T;
}

export const approvalApi = {
  progress: (requestId: string) =>
    request<ApprovalProgressData>(`/api/requests/${requestId}/approvals`),

  approve: (requestId: string, note?: string) =>
    request<ActionResult>(`/api/requests/${requestId}/approve`, {
      method: 'POST', body: JSON.stringify({ note: note ?? '' }),
    }),

  reject: (requestId: string, note: string) =>
    request<ActionResult>(`/api/requests/${requestId}/reject`, {
      method: 'POST', body: JSON.stringify({ note }),
    }),

  inbox: () => request<{ items: InboxItem[]; total: number }>('/api/approvals/inbox'),
  inboxCount: () => request<{ count: number }>('/api/approvals/inbox/count'),

  // admin
  routes: (code?: StepCode, departemen?: string) => {
    const q = new URLSearchParams();
    if (code) q.set('code', code);
    if (departemen) q.set('departemen', departemen);
    return request<{ routes: ApprovalRoute[] }>(`/api/approval-routes?${q.toString()}`);
  },
  createRoute: (data: { code: StepCode; departemen: string; approverEmployeeId: string }) =>
    request<ApprovalRoute>('/api/approval-routes', { method: 'POST', body: JSON.stringify(data) }),
  deleteRoute: (id: string) =>
    request<{ message: string }>(`/api/approval-routes/${id}`, { method: 'DELETE' }),
  readiness: (departemen: string) =>
    request<Readiness>(`/api/approval-routes/readiness?departemen=${encodeURIComponent(departemen)}`),

    mySignature: () => request<{ image: string; has: boolean }>('/api/me/signature'),
  saveMySignature: (image: string) =>
    request<{ saved: boolean }>('/api/me/signature', { method: 'PUT', body: JSON.stringify({ image }) }),
  deleteMySignature: () =>
    request<{ deleted: boolean }>('/api/me/signature', { method: 'DELETE' }),
  signatures: (id: string) =>
    request<{ signatures: Record<string, string> }>(`/api/requests/${id}/signatures`),
};
