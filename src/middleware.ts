import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const isAuthenticated = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const pathname = request.nextUrl.pathname;

  // We let /admin routes pass through to be handled by the AdminLayout
  // Protect mutating API routes
  if (
    (pathname.startsWith('/api/menu') && request.method !== 'GET') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/admin')
  ) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/menu', '/api/upload', '/api/admin/:path*'],
};
