// proxy.ts — taruh di root project (sejajar dengan app/)
import { NextRequest, NextResponse } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return !decoded.exp || decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const rawToken = req.cookies.get('auth-token')?.value;
  const { pathname, searchParams } = req.nextUrl;

  const token = rawToken && !isTokenExpired(rawToken) ? rawToken : undefined;

  const publicRoutes = ['/login', '/form'];
  const isPrintRoute = pathname.includes('/print');
  const isPublic = publicRoutes.some(r => pathname.startsWith(r)) || isPrintRoute;

  if (!token && !isPublic) {
    const res = NextResponse.redirect(new URL('/login?expired=1', req.url));
    res.cookies.delete('auth-token');
    return res;
  }

  if (!token && rawToken && pathname === '/login') {
    const res = NextResponse.next();
    res.cookies.delete('auth-token');
    return res;
  }

  if (token && pathname === '/login' && !searchParams.has('expired')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img|.*\\..*).*)',],
};