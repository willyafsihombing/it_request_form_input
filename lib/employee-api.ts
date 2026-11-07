import { API_URL } from '@/lib/api';

export type StaffType = 'staff' | 'non_staff';


export interface Employee {
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  departemen: string;
  level: string;
  staffType: StaffType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  nik: string;
  nama: string;
  jabatan: string;
  departemen: string;
  level: string;
  staffType: StaffType;
  isActive: boolean;
}

export interface EmployeeOption{
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  departemen: string;
  level: string;
  staffType: StaffType;
}

export interface EmployeeListParams {
  q?: string;
  departemen?: string;
  status?: '' | 'active' | 'inactive';
  staffType?: '' | StaffType;
  account ?: '' | 'has' | 'none';
  page: number;
  perPage: number;
}

export interface EmployeeListResult {
  data: Employee[];
  total: number;
  page: number;
  perPage: number;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  staff: number;
  nonStaff: number;
  departments: string[];
}

export interface AccountResult {
  employeeID: string;
  nik: string;
  nama: string;
  departemen: string;
  username: string;
  password?: string;
  status: 'created' | 'reset' | 'skipped' | 'failed';
  message?: string;
}

export interface CreateAccountsResponse{
  results: AccountResult[];
  created: number;
  skipped: number;
  failed: number;
}

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportReport {
  dryRun: boolean;
  total: number;
  valid: number;
  toCreate: number;
  toUpdate: number;
  created: number;
  updated: number;
  errorCount: number;
  errors: ImportRowError[];
  error?: string;
}

function bearerHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API = API_URL

function url(path: string) {
  return `${API}${path.startsWith('/') ? '' : '/'}${path}`;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    ...init,
    cache: 'no-store',
    credentials: 'include',
    headers: { ...authHeaders(), ...(init?.headers as Record<string, string> | undefined) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Permintaan gagal (${res.status})`);
  return json as T;
}

export const employeeApi = {
  list(p: EmployeeListParams) {
    const qs = new URLSearchParams();
    if (p.q) qs.set('q', p.q);
    if (p.departemen) qs.set('departemen', p.departemen);
    if (p.status) qs.set('status', p.status);
    if (p.staffType) qs.set('staffType', p.staffType);
    if (p.account) qs.set('account', p.account);
    qs.set('page', String(p.page));
    qs.set('perPage', String(p.perPage));
    return request<EmployeeListResult>(`/api/employees?${qs.toString()}`);
  },

  stats() {
    return request<EmployeeStats>('/api/employees/stats');
  },

  search(q: string, limit = 10){
    const qs = new URLSearchParams({q, limit: String(limit)});
    return request<{data: EmployeeOption[]}>(`/api/employees/search?${qs.toString()}`);    
  },

  me() {
    return request<{user: {employee: Employee | null}}>('/api/auth/me')
  },

  create(body: EmployeeInput) {
    return request<{ employee: Employee }>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: EmployeeInput) {
    return request<{ employee: Employee }>(`/api/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  remove(id: string) {
    return request<{ success: boolean }>(`/api/employees/${id}`, { method: 'DELETE' });
  },

  async importExcel(file: File, dryRun: boolean): Promise<ImportReport> {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API}/api/employees/import/excel?dryRun=${dryRun}`, {
      method: 'POST',
      body: form,
      cache: 'no-store',
      credentials: 'include',
      headers: bearerHeader(),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok && !Array.isArray(json.errors)) {
      throw new Error(json.error || `Permintaan gagal (${res.status})`);
    }
    return json as ImportReport;
  },

  accountStatus(ids: string[]) {
    return request<{accounts: Record<string, string> }>('/api/employees/accounts/status', {
      method: 'POST',
      body: JSON.stringify({ids}),
    });
  },

  pendingAccounts(departemen: string){
    const qs = new URLSearchParams();
    if (departemen) qs.set('departemen', departemen);
    return request<{ ids: string[]; total: number }>(
      `/api/employees/accounts/pending?${qs.toString()}`,
    );
  },

  createAccounts(employeeIds: string[]) {
    return request<CreateAccountsResponse>('/api/employees/accounts', {
      method: 'POST',
      body: JSON.stringify({ employeeIds }),
    });
  },
 
  resetPassword(employeeId: string) {
    return request<{ result: AccountResult }>(`/api/employees/${employeeId}/reset-password`, {
      method: 'POST',
    });
  },

  changePassword(currentPassword: string, newPassword: string) {
    return request<{ success: boolean; token: string; user: unknown }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async downloadTemplate() {
    const res = await fetch(`${API}/api/employees/import/template`, {
      cache: 'no-store',
      credentials: 'include',
      headers: bearerHeader(),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `Gagal mengunduh template (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-karyawan.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  },
};