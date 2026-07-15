const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function getToken(): Promise<string | null> {
    if(typeof window !== 'undefined') {
        return localStorage.getItem('auth-token')
    }

    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    return cookieStore.get('auth-token')?.value || null
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-user')
      document.cookie = 'auth-token=; path=/; max-age=0';
      window.location.href='/login';
    }
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