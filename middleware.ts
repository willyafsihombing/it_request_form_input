// middleware.ts — taruh di root project (sejajar dengan app/)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  const { pathname } = req.nextUrl;

  // Route yang tidak perlu login
  const publicRoutes = ['/login', '/form', '/dasboard/requests'];

  const isPrintRoute = pathname.includes('/print')

  const isPublic = publicRoutes.some(r => pathname.startsWith(r)) || isPrintRoute

  // Kalau belum login dan bukan public route → redirect ke login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
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