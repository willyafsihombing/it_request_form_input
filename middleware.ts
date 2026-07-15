// proxy.ts — taruh di root project (sejajar dengan app/)
import { NextRequest, NextResponse } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    
    // ← Debug
    console.log('Token exp:', new Date(decoded.exp * 1000));
    console.log('Now:', new Date());
    console.log('Expired:', decoded.exp * 1000 < Date.now());
    
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  const { pathname } = req.nextUrl;

  // Route yang tidak perlu login
  const publicRoutes = ['/login', '/form', '/dasboard/requests'];

  const isPrintRoute = pathname.includes('/print')

  const isPublic = publicRoutes.some(r => pathname.startsWith(r)) || isPrintRoute

  // Kalau belum login dan bukan public route → redirect ke login
  // tambahan remote auth token ketika browser tidak digunakan lagi
  if (!token && !isPublic) {
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Kalau sudah login dan akses /login → redirect ke dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } 

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};