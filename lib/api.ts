import { Employee } from '@/types';
import { redirect } from 'next/navigation';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

let redirecting = false

async function getToken(): Promise<string | null> {
    if(typeof window !== 'undefined') {
        return localStorage.getItem('auth-token')
    }

    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    return cookieStore.get('auth-token')?.value || null
}

async function endSession() {
  if (redirecting) return;
  redirecting = true;

  const hadToken = !!localStorage.getItem('auth-token')
  
  try{
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    await fetch(`${API_URL}/api/auth/logout`, {method:'POST', credentials:'include'})
  }catch{}
  if (!window.location.pathname.startsWith('/login')){
    window.location.href = hadToken ? '/login?expired=1' : '/login'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') await endSession();
    throw new Error('Session Expired')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  login: async (login: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      credentials:'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login gagal' }));
      throw new Error(err.error || 'Login gagal');
    }
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials:'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  me: () => request('/api/auth/me'),
};

  export const requestApi = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    reqName?: string; 
  }) => {
    const query = new URLSearchParams();
    if (params?.status)   query.set('status',   params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search)   query.set('search',   params.search);
    if (params?.page)     query.set('page',     String(params.page));
    if (params?.limit)    query.set('limit',    String(params.limit));
    if (params?.reqName)  query.set('reqName',  params.reqName);
    return request(`/api/requests?${query.toString()}`);
  },

  reSubmit: (id: string, data: unknown) =>
    request(`/api/requests/${id}/resubmit`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }), 

  getById: (id: string) =>
    request(`/api/requests/${id}`),

  create: (data: Record<string, unknown>) =>
    request('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request(`/api/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/api/requests/${id}`, { method: 'DELETE' }),
};

export const statsApi = {
  getStats: (reqName?: string) => {
    const query = new URLSearchParams();
    if(reqName) query.set('reqName', reqName);
    return request(`/api/stats?${query.toString()}`);
  } 
};

export type EmployeeInput = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;

type EmployeeListResponse = Employee[] | { data: Employee[] };

export const getEmployees = {
  getAll: (params?: { search?: string; departemen?: string }) => {
    const query = new URLSearchParams();
    if (params?.search)     query.set('search',     params.search);
    if (params?.departemen) query.set('departemen', params.departemen);
    const qs = query.toString();
    return request<EmployeeListResponse>(`/api/employees${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    request<{ data: Employee }>(`/api/employees/${id}`),

  create: (data: EmployeeInput) =>
    request<{ data: Employee }>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<EmployeeInput>) =>
    request<{ data: Employee }>(`/api/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/api/employees/${id}`, { method: 'DELETE' }),
};