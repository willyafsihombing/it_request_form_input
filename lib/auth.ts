// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface JWTPayload {
  id:         string;
  emailAddrs: string;
  userName:   string;
  role:       string;
  department: string;
  titleUser:  string;
  fullName:   string;
}

// Generate token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Verify token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get token dari request header
export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Cek cookie juga
  const cookie = req.headers.get('cookie');
  if (cookie) {
    const tokenCookie = cookie.split(';').find(c => c.trim().startsWith('auth-token='));
    if (tokenCookie) return tokenCookie.split('=')[1].trim();
  }
  return null;
}

// Middleware auth
export function withAuth(handler: (req: Request, user: JWTPayload, params: unknown) => Promise<Response>) {
  return async (req: Request, context: unknown) => {
    const token = getTokenFromRequest(req);
    if (!token) {
      return Response.json({ error: 'Unauthorized — token tidak ditemukan' }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return Response.json({ error: 'Unauthorized — token tidak valid atau expired' }, { status: 401 });
    }
    return handler(req, user, context);
  };
}