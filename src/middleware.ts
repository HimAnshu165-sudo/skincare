import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'velyra-luxury-skincare-secret-jwt-token-2026-production-key-signed'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If already authenticated ADMIN visits /login, redirect directly to /admin
  if (pathname === '/login') {
    const token = request.cookies.get('velyra_session')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload && payload.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      } catch {
        // Token invalid, allow /login page to load
      }
    }
    return NextResponse.next();
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('velyra_session')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (!payload || payload.role !== 'ADMIN') {
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('error', 'unauthorized_admin');
        return NextResponse.redirect(homeUrl);
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};

