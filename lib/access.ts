export type AuthUser = { id: string; role: string };

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth-user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function canModifyRequest(user: AuthUser | null, createdByUserId?: string): boolean {
  if (!user) return false;
  if (user.role !== 'user') return true;
  return !!createdByUserId && createdByUserId === user.id;
}