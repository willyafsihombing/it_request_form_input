import { cookies } from 'next/headers';

type SessionUser = { id?: string; role?: string };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get('token')?.value; // ← sesuaikan nama cookie
  if (!token) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString('utf8')
    );
    return { id: payload.sub ?? payload.user_id, role: payload.role };
  } catch {
    return null;
  }
}   